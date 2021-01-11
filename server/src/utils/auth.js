const asyncHandler = require('express-async-handler');
const { User } = require('./../models/');
const { default: createRemoteJWKSet } = require('jose/jwks/remote');
const { default: jwtVerify } = require('jose/jwt/verify');

const verifyUser = async (idToken, permission) => {
  const JWKS = createRemoteJWKSet(
    new URL('https://login.microsoftonline.com/common/discovery/v2.0/keys')
  );

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer:
      'https://login.microsoftonline.com/8f72dde7-cc23-4052-83eb-7ae633d83d6b/v2.0',
    audience: '943dc092-6604-4298-8a0c-8ea5ea02291f',
  });

  const { oid, email, family_name, given_name, name } = payload;

  const user = await User.findOne({
    where: {
      oid,
    },
    defaults: {
      email,
      familyName: family_name,
      givenName: given_name,
      displayName: name,
    },
  });

  if (user.permissions) {
    if (permission) {
      return user.permissions.includes(permission);
    } else {
      return user.permissions;
    }
  } else {
    return false;
  }
};

const isLibraryManager = asyncHandler(async (req, res, next) => {
  if (await verifyUser(req.headers.authorization, 'SPRAVCE_KNIHOVNY')) {
    return next();
  } else {
    let err = new Error('Unauthorized');
    err.status = 401;
    return next(err);
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  if (await verifyUser(req.headers.authorization, 'ADMIN')) {
    return next();
  } else {
    let err = new Error('Unauthorized');
    err.status = 401;
    return next(err);
  }
});

module.exports = {
  verifyUser: verifyUser,
  isLibraryManager: isLibraryManager,
  isAdmin: isAdmin,
};
