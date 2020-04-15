import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../../../config';
import { User } from '../../interfaces';
import UserRepository from '../../repositories/users/user_repository';
import ActiveUserRepository from '../../repositories/users/active_user_repository';

const FACEBOOK_USER_INITIAL_WALLET_IN_DOLLARS = 1000;
const GUEST_USER_INITIAL_WALLET_IN_DOLLARS = 500;

function generateRandomUint32() {
  return (Math.random() * 4294967296) >>> 0;
}

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  type CreateUserResponse = {
    user: User|null,
    token: string,
  };

  app.post('/user', async function(req: Request, res: Response) {
    const facebookUserId = req.body.facebookUserId;
    const userRepository = new UserRepository();
    let userId: string|null = facebookUserId ? await userRepository.getUserIdByFacebookUserId(facebookUserId) : null;
    let user: User|null;
    if (userId) {
      // Detected an existing user
      user = await userRepository.getUserById(userId);
    } else {
      // New user
      userId = generateRandomUint32().toString();
      const { firstName, lastName, email, profilePictureUrl } = req.body;
      const walletInCents = (
        facebookUserId ? FACEBOOK_USER_INITIAL_WALLET_IN_DOLLARS : GUEST_USER_INITIAL_WALLET_IN_DOLLARS
      ) * 100;
      try {
        user = await userRepository.createUser(
          userId,
          facebookUserId,
          email,
          firstName,
          lastName,
          profilePictureUrl,
          walletInCents,
        );
      } catch {
        return res.status(500).send({ error: `Failed to create user ${userId}`});
      }
    }

    const didUpdate: boolean = await (new ActiveUserRepository()).updateActiveUser(userId);
    didUpdate && console.error(`Failed to make user active but was successful in creating user ${userId}`);

    const token: string = jwt.sign(
      { userId, facebookUserId },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '3h'}
    );

    const response: CreateUserResponse = { user, token };
    return res.send(response);
  });

  type GetUserResponse = CreateUserResponse;

  app.get('/user/:userId', async function(req: Request, res: Response) {
    const userId = req.params.userId;
    const user: User|null = await (new UserRepository()).getUserById(userId);
    if (!user) {
      return res.status(500).send({ error: `Failed to find guest user ${userId}` });
    }

    const didUpdate: boolean = await (new ActiveUserRepository()).updateActiveUser(userId);
    didUpdate && console.error(`Failed to make user active but was successful in creating user ${userId}`);

    const token = jwt.sign(
      { userId },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '3h'}
    );

    const response: GetUserResponse = { user, token };
    return res.send(response);
  });

}
