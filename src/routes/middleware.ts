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

export function soft_authenticate(req, res, next) {
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

export function feature_overrides(req, res, next) {
  const FEATURE_OVERRIDE_QUERY_PARAMETER_PREFIX = 'override_';
  const query_parameters = req.query;
  const feature_overrides = Object.keys(query_parameters)
    .filter(query_parameter => query_parameter.startsWith(FEATURE_OVERRIDE_QUERY_PARAMETER_PREFIX))
  req.feature_overrides = {};
  feature_overrides.forEach(feature_override => {
    let feature_value = query_parameters[feature_override];
    feature_value = feature_value !== 'false' && feature_value !== '0' && feature_value !== 'null' && feature_value !== '';
    req.feature_overrides[
      feature_override.replace(FEATURE_OVERRIDE_QUERY_PARAMETER_PREFIX, '')
    ] = feature_value;
  });
  return next();
}
