import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../../config';

export function authenticate(req, res, next) {
  const auth_header = req.headers.authorization;
  if (auth_header) {
    const token = auth_header.split(' ')[1];
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export async function soft_authenticate(req, res, next) {
  const auth_header = req.headers.authorization;
  if (auth_header) {
    const token = auth_header.split(' ')[1];
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
      return next();
    });
  } else {
    return next();
  }
}
