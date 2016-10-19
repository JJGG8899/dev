var express = require('express');
var router = express.Router();
var async = require('async');
var Project = require('../models/project');
var faker = require('faker');

router.get('/generateData', function(req,res,next){
  for(var i =0; i<30;i++){
    var project = new Project();
    project.prjTitle = faker.company.companyName();
    project.prjCity = faker.address.city();
    project.prjAddress = faker.address.streetAddress();
    project.prjType = faker.company.companySuffix();
    project.prjAccess = faker.lorem.words();
    project.prjDescription = faker.lorem.paragraph();
    project.prjPicture = faker.image.business();

    project.save();
  }
  res.json({'message':'generated successfully'});
});

module.exports = router;
