var express = require('express');
var router = express.Router();
var _ = require('lodash');

var Project = require('../models/project.js');
var Collection = require('../models/collection.js');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Members' });
// });
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Members' });
});

/* Pagination Function  */
function paginate(req,res,next){
  var perPage = 3;
  var page = req.params.page || 1;
  Project
    .find()
    .skip( perPage * (page - 1))
    .limit(perPage)
    .exec(function(err, projects){
      if(err) return next(err);
      Project.count().exec(function(err, count){
        if(err) return next(err);
        res.render('projects/projectsList',{
          title: 'projectsList',
          projects: projects,
          pages: count / perPage,
          currentPage: page
        });
      });
    });
}

/* GET projectsList page. */
/* Add Pagination Function */
router.get('/projects',function(req,res,next){
  paginate(req,res,next);
});

router.get('/projects/page/:page', function(req,res,next){
  paginate(req,res,next);
});

/* GET projectsSingle page. */
router.get('/projects/:id', function(req,res,next){
  Project.findOne({_id: req.params.id}, function(err,project){
    if(err) return next(err);
    Collection.findOne({ owner: req.user._id}, function(err,collection){
      if(err) return next(err);
      projectIdList = collection.collectedProjects
                                .map(function(item){
                                  return item.projectId.toString()
                                });
      // console.log(projectIdList);
      // console.log(project._id);
      // console.log( projectIdList.indexOf(project._id.toString()) );
      if( projectIdList.indexOf(project._id.toString()) === -1){
        var inList = false
      } else {
        var inList = true
      }
      console.log(inList);
      res.render('projects/projectsSingle',{
        title: 'projectsSingle',
        project: project,
        inList: inList
      });
    });
  });
});

// POST => Add this project to User's Collection
router.post('/collections/:project_id', function(req,res,next){
  Collection.findOne({owner: req.user._id}, function(err,collection){
    collection.collectedProjects.push({
      projectId: req.params.project_id
    });
    collection.save(function(err){
      if(err) return next(err);
      return res.redirect('/projects');
    });
  });
});

// DELETE(fake) => Remove this project from User's Collection
router.post('/collections/remove/:project_id', function(req,res,next){
  Collection.findOne({owner: req.user._id}, function(err, foundCollection){
    if(err) return next(err);
    console.log(String(req.body.projectId));
    console.log(foundCollection.collectedProjects);

    var removeIndex = foundCollection.collectedProjects.map(function(item){
      return item.projectId
    }).indexOf(String(req.body.projectId));
    foundCollection.collectedProjects.splice(removeIndex,1);

    foundCollection.save(function(err, found){
      if(err) return next(err);
      req.flash('success_msg','removed from your collections');
      res.redirect('/users/profile');
    });
  });
});

// 如果这个page只能给登录用户看，直接给加个middleWare 就行了
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('error_msg','You are not logged in');
    res.redirect('/users/login');
  }
}

module.exports = router;
