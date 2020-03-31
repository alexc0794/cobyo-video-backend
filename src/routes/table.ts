import { Router } from 'express';
import bodyParser from 'body-parser';
import { soft_authenticate } from './middleware';
import TableRepository, { SeatType, TableType } from '../repositories/table_repository';
import TranscriptRepository from '../repositories/transcript_repository';
import UserRepository from '../repositories/user_repository';
import ActiveUserRepository from '../repositories/active_user_repository';

const SEAT_INACTIVITY_EXPIRATION_IN_SECONDS = 10;

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  type FilterExpiredSeatsType = {
    has_expired_user: boolean,
    seats: Array<SeatType>
  }

  function filter_expired_seats(unfiltered_seats: Array<SeatType>): FilterExpiredSeatsType {
    let has_expired_user = false;
    const seats = unfiltered_seats.map(seat => {
      if (!seat) { return null; }
      const seconds_ago_last_updated_at = ((new Date()).getTime() - (new Date(seat.last_updated_at)).getTime()) / 1000;
      if (seconds_ago_last_updated_at > SEAT_INACTIVITY_EXPIRATION_IN_SECONDS) { // Expire after 2 minutes
        has_expired_user = true;
        return null;
      }
      return seat;
    });

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
      table = await (new TableRepository()).update_table(table_id, seats, table.name);
    }

    res.send({ table, users });
  });

  app.get('/tables', soft_authenticate, async function(req: any, res) {
    const user_id = req.user ? req.user.user_id : null;
    const table_ids: Array<string> = req.query.table_ids ? req.query.table_ids.split(',') : [];
    const unfiltered_tables = await (new TableRepository()).get_tables_by_ids(table_ids);
    const tables: Array<TableType> = [];
    const user_ids: Array<string> = [];
    for (let i = 0; i < unfiltered_tables.length; i++) {
      let table = unfiltered_tables[i];
      const { has_expired_user, seats } = filter_expired_seats(table.seats);
      seats.forEach(seat => seat && user_ids.push(seat.user_id));
      if (has_expired_user) {
        try {
          table = await (new TableRepository()).update_table(table.table_id, seats, table.name);
        } catch {
          console.warn('Could not update table with expired seats');
        }
      }
      tables.push(table);
    }
    const users = await (new UserRepository()).get_users_by_ids(user_ids);

    res.send({ tables, users });
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

  app.post('/table/:table_id/exit', async function (req, res) {
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
      table.name
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
      table.name
    );
    res.send(updated_table);
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
      seats,
      table.name
    );
    res.send(updated_table);
  });

  app.post('/transcript', async function(req, res) {
    const table_id: string = req.body.table_id;
    const body: string = req.body.body;
    const saved = await (new TranscriptRepository()).save_transcript(
      table_id,
      body
    );
    res.send(saved);
  });

  app.get('/table/:table_id/keywords', async function(req, res) {
    const table_id: string = req.params.table_id;
    const min_frequency: number = req.query.min_frequency || 3;
    const min_word_length: number = req.query.min_word_length || 5;
    const transcripts = await (new TranscriptRepository()).get_transcripts_by_table_id(table_id);
    const dictionary = {};
    // TODO: Optimize by using min-heap or trie
    transcripts.forEach(transcript => {
      const words = transcript.body.split(" ");
      for (let i = 0; i < words.length; i++) {
        const word = words[i]
        if (word.length < min_word_length) { // Word must be min_word_length letters or more
          continue;
        }
        const letters = /^[A-Za-z-]+$/;
        if (!word.match(letters)) { // Word must be alphabetic (no punctuation or numbers). Hyphen allowed
          continue;
        }
        if (word in dictionary) {
          dictionary[word]++;
        } else {
          dictionary[word] = 1;
        }
      }
    });

    const all_words = Object.keys(dictionary).map(word => [word, dictionary[word]]);
    const filtered_words = all_words.filter(entry => entry[1] >= min_frequency);
    filtered_words.sort(function(a, b) {
      return b[1] - a[1];
    });

    const keywords = {};
    filtered_words.slice(0, 10).forEach(entry => {
      keywords[entry[0]] = entry[1];
    });
    res.send(keywords);
  });
}
