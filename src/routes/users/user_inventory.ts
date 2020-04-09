import { Router } from 'express';
import bodyParser from 'body-parser';
import { authenticate } from '../middleware';
import UserRepository from '../../repositories/user_repository';
import ActiveUserRepository from '../../repositories/active_user_repository';

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/user-inventory/:user_id', authenticate, async function(req: any, res) {
    return res.sendStatus(501);
  });
  
}
