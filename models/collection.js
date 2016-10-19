var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Collection Schema
var CollectionSchema = mongoose.Schema({
  owner: { type: Schema.Types.ObjectId, ref:'User'},
  collectedProjects:[{
    projectId: { type: Schema.Types.ObjectId, ref:'Project'}
  }]
});

var Collection = module.exports = mongoose.model('Collection',CollectionSchema);
