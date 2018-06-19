const mongoose = require('../mongoose');
const {TrackSchema} = require('./Track')
const ObjectID = mongoose.Schema.Types.ObjectId;

const PlaylistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true
  },
  // embedded document
  tracks: {
    type: [TrackSchema]
  }
});

PlaylistSchema.index({userId: 1});

const Playlist = mongoose.model('Playlist', PlaylistSchema);
module.exports = Playlist;
