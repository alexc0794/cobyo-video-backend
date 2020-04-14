import { Router } from 'express';
import bodyParser from 'body-parser';
import { authenticate } from '../middleware';
import UserRepository from '../../repositories/users/user_repository';
import ActiveUserRepository from '../../repositories/users/active_user_repository';

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/active-users', authenticate, async function(req: any, res) {
    const active_users = (await (new ActiveUserRepository()).get_active_users());
    const user_ids = active_users.map(user => user.user_id);
    const users = await (new UserRepository()).get_users_by_ids(user_ids);

    return res.send(active_users.map((active_user, i) => ({
      ...active_user,
      ...users[i],
    })));
  });

}
