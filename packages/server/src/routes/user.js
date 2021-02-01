const express = require('express');
const router = express.Router();
const { verifyUser, isAdmin } = require('../utils/auth');
const { User, Book, BookLoan } = require('../models/');
const asyncHandler = require('express-async-handler');

router.get(
  '/permissions',
  asyncHandler(async (req, res) => {
    const permissions = await verifyUser(req.headers.authorization);
    return res.json(permissions);
  })
);

router.get(
  '/:oid/loans',
  asyncHandler(async (req, res) => {
    const loans = await BookLoan.findAll({
      where: {
        '$User.oid$': req.params.oid,
      },
      include: [
        {
          model: User,
          as: User.id,
        },
        {
          model: Book,
          as: Book.id,
        },
      ],
    });
    return res.json(loans);
  })
);

module.exports = router;
