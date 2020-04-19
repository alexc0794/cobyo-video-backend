import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import moment from 'moment-timezone';
import { featureOverrides } from '../middleware';
import { Storefront, Status } from '../../enums';
import StorefrontRepository from '../../repositories/storefront_repository';
import ChannelConnectionRepository from '../../repositories/channel_connection_repository';

function get_nyc_moment() {
  return moment().tz("America/New_York");
}

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  type GetStorefrontResponse = {
    storefront: Storefront,
    status: Status,
    tableIdGrid: Array<Array<string | null>>,
  };

  app.get('/storefront', featureOverrides, function(req: Request, res: Response) {
    const storefrontRepository = new StorefrontRepository();
    const { storefront, status } = storefrontRepository.getStorefrontByMoment(get_nyc_moment());
    const tableIdGrid = storefrontRepository.getStorefrontTableIdGrid(storefront);

    const response: GetStorefrontResponse = { storefront, status, tableIdGrid };
    res.send(response);
  });

  type GetStorefrontCapacityResponse = {
    tableIds: Array<string>,
    actualCapacity: number,
  };

  app.get('/storefront/capacity', async function(req: Request, res: Response) {
    const storefrontRepository = new StorefrontRepository();
    const { storefront, status } = storefrontRepository.getStorefrontByMoment(get_nyc_moment());
    const tableIdGrid: Array<Array<string>> = storefrontRepository.getStorefrontTableIdGrid(storefront);
    const tableIds: Array<string> = tableIdGrid.reduce((acc: Array<string>, tableIds: Array<string>) => {
      return [...acc, ...tableIds];
    }, []);

    let actualCapacity = 0;
    for (let i = 0; i < tableIds.length; i++) {
      const tableId = tableIds[i];
      actualCapacity += (await (new ChannelConnectionRepository()).getChannelConnections(tableId)).length;
    }

    const response: GetStorefrontCapacityResponse = {
      tableIds,
      actualCapacity,
    };
    return res.send(response);
  });
}
