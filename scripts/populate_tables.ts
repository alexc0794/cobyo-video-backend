import TableRepository from '../src/repositories/table_repository';
import { DEFAULT_CONNECTION, DEFAULT_SHAPE, Connection, Shape } from '../src/enums/table';

async function populate() {
  const tableRepository = new TableRepository();
  await tableRepository.update_table(
    'club1a',
    new Array(10).fill(null),
    'Table 1',
    DEFAULT_CONNECTION,
    Shape.UDown,
  );

  await tableRepository.update_table(
    'club1b',
    new Array(10).fill(null),
    'Table 2',
    DEFAULT_CONNECTION,
    Shape.UDown,
  );

  await tableRepository.update_table(
    'club2a',
    new Array(24).fill(null),
    'Dance Floor',
    Connection.AudioOnly,
    Shape.DanceFloor,
  );
}

populate();
