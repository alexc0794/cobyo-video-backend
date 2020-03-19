import { Router } from 'express';
import bodyParser from 'body-parser';
import TableRepository from '../repositories/table_repository';

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/table/:table_id', async function(req, res) {
    const table_id = req.params.table_id;
    const table = await (new TableRepository()).get_table_by_id(table_id);
    res.send(table);
  });

  // Post a full update to the state of table
  app.post('/table/:table_id', async function(req, res) {
    const table_id = req.params.table_id;
    const seats = req.body.seats;
    const name = req.body.name;
    await (new TableRepository()).update_table(
      table_id,
      seats,
      name
    );
    res.send(true);
  });

  // Single person sits down at table
  app.post('/table/:table_id/:seat_number', async function(req, res) {
    const table_id = req.params.table_id;
    const seat_number = parseInt(req.params.seat_number, 10);
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
    if (!seats || seat_number > seats.length - 1) {
      console.error('Invalid seat number', seat_number);
      return res.send(false);
    }
    const seat = seats[seat_number];
    if (!!seat && seat.user_id !== user_id) {
      console.error(`${seat.user_id} is already sitting there`, seat_number);
      return res.send(false);
    }
    // Remove user from previous seat if already at the table so user doesnt show up twice.
    seats = seats.map(seat => {
      if (!seat || seat.user_id == user_id) {
        return null;
      }
      return seat;
    });
    seats[seat_number] = {
      user_id,
      sat_down_at: (new Date()).toISOString(),
    };
    await (new TableRepository()).update_table(
      table_id,
      seats,
      table.name
    );
    res.send(true);
  });

}
