const Album = require('../models/Album');

function search (req, res) {
  // search can be an artist, an album, a track title
  // a year or a genre
  const {term} = req.params;

  if (!term) {
    res.status(422).send('Search term is missing.');
    return;
  }

  const conditions = {
    owner: {$in: ['all', req.user.id]},
    $text: {
      $search: term
    }
  };

  const projection = {score: {"$meta": "textScore"}};

  Album.find(conditions, projection)
  .sort({score: {"$meta": "textScore"}})
  .then(results => {
    const data = {
      albums: [],
      tracks: []
    }

    // not possible to only retrieve subdocuments
    // even if they match
    // ugly code is coming :)
    const lowecasedTerm = term.toLowerCase();
    results.forEach(result => {
      // check if we looked for an album
      if (
        result.artist.toLowerCase().includes(lowecasedTerm) ||
        result.title.toLowerCase().includes(lowecasedTerm) ||
        result.genre.toLowerCase().includes(lowecasedTerm)
      ) {
        data.albums.push(result);
      }

      // otherwise it was a track title
      result.tracks.forEach(track => {
        if (track.title.toLowerCase().includes(lowecasedTerm)) {
          data.tracks.push({...track.toObject(), artist: result.artist, album: result.title});
        }
      });
    });

    res.status(200).json({results: data});
  }).catch(err => {
    console.error(err);
  });
}

module.exports = {
  search
}
