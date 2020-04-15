import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { authenticate } from '../middleware';
import { ActiveUser, User } from '../../interfaces';
import UserRepository from '../../repositories/users/user_repository';
import ActiveUserRepository from '../../repositories/users/active_user_repository';

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  type GetActiveUsersResponse = {
    activeUsers: Array<ActiveUser>,
    users: Array<User>,
  };

  app.get('/active-users', authenticate, async function(req: any, res) {
    const activeUsers: Array<ActiveUser> = (await (new ActiveUserRepository()).getActiveUsers());
    const userIds = activeUsers.map(user => user.userId);
    const users: Array<User> = await (new UserRepository()).getUsersByIds(userIds);

    const response: GetActiveUsersResponse = { activeUsers, users };
    return res.send(response);
  });

}
