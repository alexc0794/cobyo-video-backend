import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../../config';

export function authenticate(req, res, next) {
  const authHeader: string = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
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

export function softAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
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

export function featureOverrides(req, res, next) {
  const FEATURE_OVERRIDE_QUERY_PARAMETER_PREFIX = 'override_';
  const queryParameters = req.query;
  const featureOverrides = Object.keys(queryParameters)
    .filter(queryParameter => queryParameter.startsWith(FEATURE_OVERRIDE_QUERY_PARAMETER_PREFIX))
  req.featureOverrides = {};
  featureOverrides.forEach(featureOverride => {
    let featureValue = queryParameters[featureOverride];
    featureValue = featureValue !== 'false' && featureValue !== '0' && featureValue !== 'null' && featureValue !== '';
    req.featureOverrides[featureOverride.replace(FEATURE_OVERRIDE_QUERY_PARAMETER_PREFIX, '')] = featureValue;
  });
  return next();
}
