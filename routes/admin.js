var express = require('express');
var router = express.Router();
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function(req,file,cb){
    cb(null, 'public/images')
  },
  filename: function(req,file, cb){
    cb(null, Date.now() + file.originalname);
  }
});
var upload = multer({ storage:storage });
// var upload = multer({dest:'./uploads'});

var passport = require('passport');
var Project = require('../models/project');

// GET => add new project
router.get('/projects/new',function(req, res, next) {
  res.render('admin/projectsNew',{title:'admin'});
});

// Post => add new project
router.post('/projects/new', upload.single('prjPicture'), function(req, res, next) {
  var prjTitle = req.body.prjTitle;
  var prjCity = req.body.prjCity;
  var prjAddress = req.body.prjAddress;
  var prjType = req.body.prjType;
  var prjApplication = req.body.prjApplication;
  var prjAccess = req.body.prjAccess;
  var prjDescription = req.body.prjDescription;

  console.log(req.file);

  if(req.file){
    var prjPicture = req.file.filename;
    console.log(req.file);
  } else {
    console.log('no image got');
    var prjPicture = 'defaultPrjPicture.jpg';
  }

  var project = new Project({
    prjTitle: prjTitle,
    prjCity: prjCity,
    prjAddress: prjAddress,
    prjType: prjType,
    prjApplication: prjApplication,
    prjAccess: prjAccess,
    prjDescription: prjDescription,
    prjPicture: prjPicture,
  });

  project.save(function(err){
    if (err) return next(err);
    req.flash('success_msg','New Project Created');
    return res.redirect('/')
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
router.post('/projects/edit/:id', upload.single('prjPictureNew'), function(req, res, next) {
  Project.findOne({ _id: req.params.id}, function(err, project){
    if(err) return next(err);
    if(req.body.prjTitle) project.prjTitle = req.body.prjTitle;
    if(req.body.prjCity) project.prjCity = req.body.prjCity;
    if(req.body.prjAddress) project.prjAddress = req.body.prjAddress;
    if(req.body.prjType) project.prjType = req.body.prjType;
    if(req.body.prjApplication) project.prjApplication = req.body.prjApplication;
    if(req.body.prjAccess) project.prjAccess = req.body.prjAccess;
    if(req.body.prjDescription) project.prjDescription = req.body.prjDescription;

    if(req.file){
      project.prjPicture = req.file.filename;
    } else {
      project.prjPicture = req.body.prjPicture
    }

    project.save(function(err){
      if(err) return next(err);
      req.flash('success_msg','Project Edit Successfully');
      return res.redirect('/admin/projects')
    });
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
