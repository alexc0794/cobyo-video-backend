import { Router } from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { authenticate } from './middleware';
import { ACCESS_TOKEN_SECRET } from '../../config';
import UserRepository from '../repositories/user_repository';
import ActiveUserRepository from '../repositories/active_user_repository';

function generate_random_uint_32() {
  return (Math.random() * 4294967296) >>> 0;
}

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Post a full update to the state of table
  app.post('/user/create', async function(req, res) {
    const facebook_user_id = req.body.facebook_user_id;
    const user_repository = new UserRepository();
    let user_id = await user_repository.get_user_id_by_facebook_user_id(facebook_user_id);
    let user;
    if (user_id) {
      user = await user_repository.get_user_by_id(user_id);
    } else {
      user_id = generate_random_uint_32().toString();
      const { first_name, last_name, email, profile_picture_url } = req.body;
      try {
        user = await user_repository.create_user(
          user_id,
          facebook_user_id,
          email,
          first_name,
          last_name,
          profile_picture_url,
        );
      } catch {
        return res.status(500).send({ error: `Failed to create user ${user.user_id}`});
      }
    }

    try {
      await (new ActiveUserRepository()).update_active_user(user.user_id);
    } catch {
      console.error(`Failed to make user active but was successful in creating user ${user.user_id}`);
    }

    const token = jwt.sign(
      { user_id: user.user_id, facebook_user_id },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '3h'}
    );
    return res.send({ user, token });
  });

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
