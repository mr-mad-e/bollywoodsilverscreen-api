var axios = require('axios');
var express = require('express');
var router = express.Router();

const API_KEY = 'ab1391e8e1261f84f32827552b3e3935'
const LIST_ID = '8242451'

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/collection/:movieId', async function (req, res, next) {
  const movie = await axios.get(`https://api.themoviedb.org/3/movie/${req.params.movieId}`, {
    params: {
      api_key: API_KEY
    }
  }).catch(()=>next())

  if (movie && movie.data && movie.data.belongs_to_collection) {
    const collection = await axios.get(`https://api.themoviedb.org/3/collection/${movie.data.belongs_to_collection.id}`, {
      params: {
        api_key: API_KEY
      }
    }).catch(()=>next())

    collection.data.parts.forEach(part => {
      part.youtubeId = getComment(collection.data.comments, part)
    });

    res.json(collection.data)
  } else {
    next()
  }
});

router.get('/genre/list', async function (req, res, next) {
  const genre = await axios.get(`https://api.themoviedb.org/3/genre/movie/list`, {
    params: {
      api_key: API_KEY
    }
  }).catch(()=>next())

  res.json(genre.data)
});

function getComment(comments = {}, movie =  {}) {
  return (comments[`movie:${movie.id}`] || '')
    .replace('https://www.youtube.com/watch?v=', '')
    .replace('https://youtu.be/', '');
}

router.get('/movie/list', async function (req, res, next) {
  let movies = []
  const genre = await axios.get(`https://api.themoviedb.org/4/list/${LIST_ID}`, {
    params: {
      api_key: API_KEY
    }
  }).catch(()=>next())

  genre.data.results.forEach(movie => {
    movie.youtubeId = getComment(genre.data.comments, movie)
    movies.push(movie);
  });

  for (let index = 2; index < genre.data.total_pages + 1; index++) {
    const genre = await axios.get(`https://api.themoviedb.org/4/list/${LIST_ID}?page=${index}`, {
      params: {
        api_key: API_KEY
      }
    }).catch(()=>next())

    genre.data.results.forEach(movie => {
      movie.youtubeId = getComment(genre.data.comments, movie)
      movies.push(movie);
    });
  }

  movies = movies.sort((a, b) => b.popularity - a.popularity);
  res.json(movies)
});


module.exports = router;
