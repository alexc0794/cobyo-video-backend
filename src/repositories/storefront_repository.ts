import BaseRepository from './base_repository';
import { Storefront, Status, DEFAULT_STOREFRONT} from '../enums/storefront';

const CAFETERIA_OPEN_HOUR = 11;
const CAFETERIA_CLOSED_HOUR = 14;
const CAFE_OPEN_HOUR = 14;
const CAFE_CLOSED_HOUR = 17;
const CLUB_OPEN_HOUR = 22;
const CLUB_CLOSED_HOUR = 3;

type StorefrontStatus = {
  storefront: Storefront,
  status: Status
};

export default class StorefrontRepository extends BaseRepository {

  get_storefront_by_moment(moment): StorefrontStatus {
    return { storefront: Storefront.Club, status: Status.Open };

    const hour = parseInt(moment.format('H'), 10);
    const minute = parseInt(moment.format('m'), 10);

    if (hour >= CLUB_CLOSED_HOUR && hour < CAFETERIA_OPEN_HOUR) {
      return { storefront: Storefront.Cafeteria, status: Status.Closed };
    }
    if (hour >= CAFETERIA_OPEN_HOUR && hour < CAFETERIA_CLOSED_HOUR) {
      return { storefront: Storefront.Cafeteria, status: Status.Open };
    }
    if (hour >= CAFETERIA_CLOSED_HOUR && hour < CAFE_OPEN_HOUR) {
      return { storefront: Storefront.Cafe, status: Status.Closed };
    }
    if (hour >= CAFE_OPEN_HOUR && hour < CAFE_CLOSED_HOUR) {
      return { storefront: Storefront.Cafe, status: Status.Open };
    }
    if (hour >= CAFE_CLOSED_HOUR && hour < CLUB_OPEN_HOUR) {
      return { storefront: Storefront.Club, status: Status.Closed };
    }
    if (hour >= CLUB_OPEN_HOUR || hour < CLUB_CLOSED_HOUR) {
      return { storefront: Storefront.Club, status: Status.Open };
    }

    console.error('Something wrong with storefront hours logic');
    return { storefront: DEFAULT_STOREFRONT, status: Status.Open };
  }

  get_storefront_table_id_grid(storefront: Storefront): Array<Array<string|null>> {
    switch (storefront) {
      case Storefront.Club:
        return [
          ['club1a', 'club1b'],
          ['club2a', 'club2b', 'club2c'],
          ['club3a', 'club3b']
        ];
      default:
        return [
          ['1a', '1b'],
          ['2a', '2b', '2c'],
        ];
    }
  }

}
