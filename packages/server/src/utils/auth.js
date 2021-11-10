const asyncHandler = require('express-async-handler');
const { User } = require('./../models/');
const { default: createRemoteJWKSet } = require('jose/jwks/remote');
const { default: jwtVerify } = require('jose/jwt/verify');
const { Op } = require('sequelize');

const verifyToken = async (token) => {
  const JWKS = createRemoteJWKSet(
    new URL('https://login.microsoftonline.com/common/discovery/v2.0/keys')
  );

  const { payload } = await jwtVerify(token, JWKS, {
    iss:
      'https://login.microsoftonline.com/8f72dde7-cc23-4052-83eb-7ae633d83d6b/v2.0',
    aud: '943dc092-6604-4298-8a0c-8ea5ea02291f',
  });

  return payload;
};

const loginUser = async (idToken) => {
  const { oid, email, family_name, given_name, name } = await verifyToken(
    idToken
  );

  [user, created] = await User.findOrCreate({
    where: {
      email: {
        [Op.iLike]: `%${email}%`,
      },
    },
    defaults: {
      oid,
      email,
      familyName: family_name,
      givenName: given_name,
      displayName: name,
    },
  });

  if (!user.oid) {
    user.oid = oid;
    user.familyName = family_name;
    user.givenName = given_name;
    user.displayName = name;
    await user.save();
  }

  if (user.permissions) {
    return user.permissions;
  } else {
    return [];
  }
};

const checkPermissions = async (idToken, permission) => {
  const { oid, email, family_name, given_name, name } = await verifyToken(
    idToken
  );

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
  if (await checkPermissions(req.headers.authorization, 'SPRAVCE_KNIHOVNY')) {
    return next();
  } else {
    let err = new Error('Unauthorized');
    err.status = 401;
    return next(err);
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  if (await checkPermissions(req.headers.authorization, 'ADMIN')) {
    return next();
  } else {
    let err = new Error('Unauthorized');
    err.status = 401;
    return next(err);
  }
});

module.exports = {
  loginUser: loginUser,
  checkPermissions: checkPermissions,
  isLibraryManager: isLibraryManager,
  isAdmin: isAdmin,
};
