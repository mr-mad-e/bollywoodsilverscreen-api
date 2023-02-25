var express = require('express');
var axios = require('axios');
var router = express.Router();

const API_KEY = 'ab1391e8e1261f84f32827552b3e3935'

/* GET users listing. */
router.get('/collection/:movieId', async function (req, res, next) {
  console.log('collection', req.params)

  const movie = await axios.get(`https://api.themoviedb.org/3/movie/${req.params.movieId}`, {
    params: {
      api_key: API_KEY
    }
  }).catch(next)

  console.log(movie)

  if (movie && movie.data && movie.data.belongs_to_collection) {
    const collection = await axios.get(`https://api.themoviedb.org/3/collection/${movie.data.belongs_to_collection.id}`, {
      params: {
        api_key: API_KEY
      }
    }).catch(next)

    res.json(collection.data)
  } else {
    next()
  }
});

module.exports = router;
