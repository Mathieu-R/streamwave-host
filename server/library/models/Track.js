const mongoose = require('../mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const TrackSchema = new mongoose.Schema({
  number: {
    type: Number
  },
  title: {
    type: String,
    required: true
  },
  coverURL: {
    type: String,
    required: true
  },
  // references to playlist id
  playlists: [ObjectID],
  // duration in second
  duration: {
    type: Number,
    required: true
  },
  manifestURL: {
    type: String,
    required: true
  },
  playlistHLSURL: {
    type: String,
    required: true
  },
  audio128URL: {
    type: String,
    required: true
  },
  audio192URL: {
    type: String,
    required: true
  },
  audio256URL: {
    type: String,
    required: true
  }
});

const Track = mongoose.model('Track', TrackSchema);

module.exports = {
  Track,
  TrackSchema
};
