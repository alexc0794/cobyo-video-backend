import { Router } from 'express';
import bodyParser from 'body-parser';
import { soft_authenticate } from './middleware';
import { IS_DEV } from '../../config';
import { Connection, Shape, DEFAULT_CONNECTION, DEFAULT_SHAPE} from '../enums/table';
import Table, { Seat } from '../interfaces/table';
import TableRepository from '../repositories/table_repository';
import UserRepository from '../repositories/user_repository';
import ActiveUserRepository from '../repositories/active_user_repository';

const SEAT_INACTIVITY_EXPIRATION_IN_SECONDS = IS_DEV ? 10 : 60; // expire seat

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  type FilterExpiredSeatsType = {
    has_expired_user: boolean,
    seats: Array<Seat|null>
  }

  function filter_expired_seats(unfiltered_seats: Array<Seat|null>): FilterExpiredSeatsType {
    let has_expired_user = false;
    const seats = unfiltered_seats ? unfiltered_seats.map(seat => {
      if (!seat) { return null; }
      const seconds_ago_last_updated_at = ((new Date()).getTime() - (new Date(seat.last_updated_at)).getTime()) / 1000;
      if (seconds_ago_last_updated_at > SEAT_INACTIVITY_EXPIRATION_IN_SECONDS) { // Expire after 2 minutes
        has_expired_user = true;
        return null;
      }
      return seat;
    }) : [];

    return { has_expired_user, seats };
  }

  app.get('/table/:table_id', soft_authenticate, async function(req, res) {
    const table_id = req.params.table_id;
    let table = await (new TableRepository()).get_table_by_id(table_id);
    if (!table) {
      return res.status(500).send({ error: `Failed to find table ${table_id}` });
    }

    const { has_expired_user, seats } = filter_expired_seats(table.seats);
    const user_ids: Array<string> = [];
    seats.forEach(seat => seat && user_ids.push(seat.user_id));
    const users = await (new UserRepository()).get_users_by_ids(user_ids);

    if (has_expired_user) {
      table = await (new TableRepository()).update_table(table_id, seats, table.table_name, table.connection, table.shape);
    }

    res.send({ table, users });
  });

  app.get('/tables', soft_authenticate, async function(req: any, res) {
    const user_id = req.user ? req.user.user_id : null;
    const table_ids: Array<string> = req.query.table_ids ? req.query.table_ids.split(',') : [];
    const unfiltered_tables = await (new TableRepository()).get_tables_by_ids(table_ids);
    const tables: Array<Table> = [];
    const user_ids: Array<string> = [];
    for (let i = 0; i < unfiltered_tables.length; i++) {
      let table = unfiltered_tables[i];
      const { has_expired_user, seats } = filter_expired_seats(table.seats);
      seats.forEach(seat => seat && user_ids.push(seat.user_id));
      if (has_expired_user) {
        try {
          table = await (new TableRepository()).update_table(table.table_id, seats, table.table_name, table.connection, table.shape);
        } catch {
          console.warn('Could not update table with expired seats');
        }
      }
      tables.push(table);
    }
    const users = await (new UserRepository()).get_users_by_ids(user_ids);

    if (user_id) {
      // If user_id is passed in, update user's activity
      try {
        await (new ActiveUserRepository()).update_active_user(user_id);
      } catch {
        console.error(`Failed to update user ${user_id}'s activity`);
      }
    }

    res.send({ tables, users });
  });

  // Post a full update to the state of table
  app.post('/table/:table_id', async function(req, res) {
    const table_id = req.params.table_id;
    const seats = req.body.seats;
    const name = req.body.name;
    const connection = req.body.connection;
    const shape = req.body.shape;
    try {
      await (new TableRepository()).update_table(
        table_id,
        seats,
        name,
        connection || DEFAULT_CONNECTION,
        shape || DEFAULT_SHAPE,
      );
      return res.send(true);
    } catch {
      return res.send(false);
    }
  });

  app.put('/table', async function (req, res) {
    const table_id = req.body.table_id
    const name = req.body.name
    
    try {
      const updated_table = await (new TableRepository()).update_table_name(table_id, name);
      return res.send(updated_table)
    } catch(e) {
      return res.send(e)
    }
  });

  app.post('/table/:table_id/leave', async function (req, res) {
    const table_id = req.params.table_id;
    const user_id = req.body.user_id;
    const table = await (new TableRepository()).get_table_by_id(table_id);
    if (!table) {
      return res.send(false);
    }
    const seats = table.seats.map(seat => seat && seat.user_id !== user_id ? seat : null);
    const updated_table = await (new TableRepository()).update_table(
      table_id,
      seats,
      table.table_name,
      table.connection,
      table.shape,
    );
    res.send(updated_table);
  });

  app.post('/table/:table_id/user_ids', async function (req, res) {
    const table_id = req.params.table_id;
    const user_ids = req.body.user_ids;
    const table = await (new TableRepository()).get_table_by_id(table_id);
    if (!table) {
      return res.send(false);
    }
    const seats = table.seats.map(seat => seat && user_ids.includes(seat.user_id) ? seat : null);
    const updated_table = await (new TableRepository()).update_table(
      table_id,
      seats,
      table.table_name, table.connection, table.shape
    );
    res.send(updated_table);
  });

  // Single person sits down at table
  app.post('/table/:table_id/join', async function(req, res) {
    const table_id = req.params.table_id;
    const user_id = req.body.user_id;
    const table = await (new TableRepository()).get_table_by_id(table_id);
    if (!table) {
      return res.send(false);
    }

    let seats = table.seats;
    if (!seats) {
      console.error('No seats?');
      return res.send(false);
    }

    let seat_number = parseInt(req.body.seat_number, 10);
    if (isNaN(seat_number)) {
      const open_seat_numbers = seats.map((seat, i) => seat ? -1 : i).filter(i => i != -1);
      seat_number = open_seat_numbers[
        Math.floor(Math.random() * Math.floor(open_seat_numbers.length))
      ];
    }

    if (seat_number > seats.length - 1) {
      console.error('Invalid seat number', seat_number);
      return res.send(false);
    }

    const seat = seats[seat_number];
    if (!!seat && seat.user_id !== user_id) {
      console.error(`Different user ${seat.user_id} is already sitting there`, seat_number);
      return res.send(false);
    }

    const now = (new Date()).toISOString();
    if (!!seat && seat.user_id === user_id) { // User is just sending heartbeat
      seats[seat_number] = {
        user_id: seat.user_id,
        last_updated_at: now,
        sat_down_at: seat.sat_down_at,
      };
    } else {
      // Remove user from previous seat if already at the table so user doesnt show up twice.
      seats = seats.map(seat => (seat && seat.user_id !== user_id) ? seat : null);
      seats[seat_number] = {
        user_id,
        last_updated_at: now,
        sat_down_at: now,
      };
    }
    const updated_table = await (new TableRepository()).update_table(
      table_id,
      filter_expired_seats(seats).seats,
      table.table_name, table.connection, table.shape
    );
    res.send(updated_table);
  });

}
