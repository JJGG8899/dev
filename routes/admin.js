var express = require('express');
var router = express.Router();
// var multer = require('multer');
// var s3 = require('multer-storage-s3');

var fs = require('fs');
// Create S3 Instance
var S3FS = require('s3fs');
var s3fsImpl = new S3FS('interactiveimages',{
  accessKeyId: 'AKIAI3LUX4JKY42FQ42A',
  secretAccessKey: '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'
});
// 只有通过类似multiparty的middleware才能access到req.files这样的东东
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var passport = require('passport');
var Project = require('../models/project');

// GET => add new project
router.get('/projects/new',function(req, res, next) {
  res.render('admin/projectsNew',{title:'admin'});
});

// Post => add new project
router.post('/projects/new', multipartyMiddleware, function(req, res, next) {
  var prjTitle = req.body.prjTitle;
  var prjCity = req.body.prjCity;
  var prjDistrict = req.body.prjDistrict;
  var prjAddress = req.body.prjAddress;
  var prjType = req.body.prjType;
  var prjApplication = req.body.prjApplication;
  var prjAccess = req.body.prjAccess;
  var prjDescription = req.body.prjDescription;
  var prjLink = req.body.prjLink;
  var prjProvider = req.body.prjProvider;
  var prjProviderLink = req.body.prjProviderLink;

  var file = req.files.prjPicture;
  // console.log(file.path);

  if(file){
    var prjPicture = 'https://s3-us-west-2.amazonaws.com/interactiveimages/' + file.originalFilename;
    // console.log(file);
  } else {
    // console.log('no image got');
    var prjPicture = 'defaultPrjPicture.jpg';
  }

  var stream = fs.createReadStream(file.path);
  return s3fsImpl.writeFile(file.originalFilename, stream).then(function(){
    fs.unlink(file.path, function(err){
        if(err) console.error(err);
    });
    var project = new Project({
      prjTitle: prjTitle,
      prjCity: prjCity,
      prjDistrict: prjDistrict,
      prjAddress: prjAddress,
      prjType: prjType,
      prjApplication: prjApplication,
      prjAccess: prjAccess,
      prjDescription: prjDescription,
      prjPicture: prjPicture,
      prjLink: prjLink,
      prjProvider: prjProvider,
      prjProviderLink: prjProviderLink
    });

    project.save(function(err){
      if (err) return next(err);
      req.flash('success_msg','New Project Created');
      return res.redirect('/')
    });
  });
});

// GET => render All projects for admin
router.get('/projects', passport.authenticate('bearer',{session:false}), function(req,res,next){
  Project.find({}, function(err,projects){
    if(err) return next(err);
    res.render('admin/projectsTable',{
      title:'manage-projects',
      projects: projects
    });
  });
});

// GET => render Edit Single Project
router.get('/projects/edit/:id', function(req,res,next){
  Project.findOne({_id: req.params.id}, function(err,project){
    if(err) return next(err);
    res.render('admin/projectsEdit', {
      title: 'edit-project',
      project: project
    });
  });
});

// POST => Update Edited Single Project
router.post('/projects/edit/:id', multipartyMiddleware, function(req, res, next) {
  Project.findOne({ _id: req.params.id}, function(err, project){
    if(err) return next(err);
    if(req.body.prjTitle) project.prjTitle = req.body.prjTitle;
    if(req.body.prjCity) project.prjCity = req.body.prjCity;
    if(req.body.prjDistrict) project.prjDistrict = req.body.prjDistrict;
    if(req.body.prjAddress) project.prjAddress = req.body.prjAddress;
    if(req.body.prjType) project.prjType = req.body.prjType;
    if(req.body.prjApplication) project.prjApplication = req.body.prjApplication;
    if(req.body.prjAccess) project.prjAccess = req.body.prjAccess;
    if(req.body.prjDescription) project.prjDescription = req.body.prjDescription;
    if(req.body.prjLink) project.prjLink = req.body.prjLink;
    if(req.body.prjProvider) project.prjProvider = req.body.prjProvider;
    if(req.body.prjProviderLink) project.prjProviderLink = req.body.prjProviderLink;

    var file = req.files.prjPictureNew;
    // console.log(file.path);
    if(file){
      var prjPicture = 'https://s3-us-west-2.amazonaws.com/interactiveimages/' + file.originalFilename;
      // console.log(file);
      console.log('you have a new picture file');
      var stream = fs.createReadStream(file.path);
      return s3fsImpl.writeFile(file.originalFilename, stream).then(function(){
        fs.unlink(file.path, function(err){
            if(err) console.error(err);
        });
        project.prjPicture = prjPicture;
        project.save(function(err){
          if (err) return next(err);
          req.flash('success_msg','Project Saved');
          return res.redirect('/admin/projects/edit/' + req.params.id )
        });
      });
    } else {
      // console.log('no image got');
      // var prjPicture = project.prjPicture;
      project.save(function(err){
        if (err) return next(err);
        req.flash('success_msg','Project Saved');
        return res.redirect('/admin/projects/edit/' + req.params.id)
      });
    }
  });
});

// DELETE => Delete Single Project
router.delete('/projects/delete/:id',function(req,res,next){
  Project.remove({_id: req.params.id}, function(err){
    if(err) return next(err);
    req.flash('success_msg','Project was successfully deleted');
    res.send(200);
  });
});

module.exports = router;
