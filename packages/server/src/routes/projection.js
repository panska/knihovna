const express = require('express');
const router = express.Router();
const { isCinemaManager } = require('../utils/auth');
const { Projection } = require('../models/');
const asyncHandler = require('express-async-handler');

router.get(
  '/all',
  asyncHandler(async (req, res) => {
    projections = await Projection.findAll();
    return res.json(projections);
  })
);

router.post(
  '/create',
  isCinemaManager,
  asyncHandler(async (req, res) => {
    const { type, movieName, movieData, moviePoster, start } = req.body.data;

    if ((type, movieName, movieData && moviePoster && start)) {
      let projection = await Projection.create({
        type,
        movieName,
        movieData,
        moviePoster,
        start,
      });

      return res.json(projection);
    }
  })
);

module.exports = router;
