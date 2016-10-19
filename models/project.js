var mongoose = require('mongoose');

// Project Schema
var ProjectSchema = mongoose.Schema({
  prjTitle: String,
  prjCity: String,
  prjAddress: String,
  prjType: String,
  prjApplication: String,
  prjAccess: String,
  prjDescription: String,
  prjPicture: String,
  createdAt: { type: Date, default: Date.now }
});

var Project = module.exports = mongoose.model('Project',ProjectSchema);
