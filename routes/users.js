var express = require('express');
var router = express.Router();
var async = require('async');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var User = require('../models/user');
var Collection = require('../models/collection');

// POST => User Update Profile page
router.post('/profile/edit', function(req,res,next){
  console.log(req.body.userName);
  User.findOne({ _id: req.user._id }, function(err, user){
    if(err) return next(err);
    if(req.body.userName) user.profile.userName = req.body.userName;
    user.save(function(err){
      if(err) return next(err);
      req.flash('success_msg','User profile updated successfully');
      return res.redirect('/users/profile/edit');
    });
  });
});

// GET => User Profile Edit page
router.get('/profile/edit', function(req,res,next){
  User.findOne({_id: req.user._id}, function(err, user){
    if(err) return next(err);
    res.render('users/profileEdit', {
      title:'profileEdit',
      user: user
    });
  });
});

// GET => User Profile
router.get('/profile',passport.authenticate('bearer',{session:false}), function(req,res,next){
  Collection
    .findOne({ owner: req.user._id})
    .populate('collectedProjects.projectId')
    .exec(function(err, foundCollection){
      if(err) return next(err);
      User
        .findOne({_id: req.user._id})
        .exec(function(err, user){
          if(err) return next(err);
          // console.log(foundCollection.collectedProjects);
          res.render('users/profile',{
            title: 'profile',
            collections: foundCollection.collectedProjects,
            user: user
          });
        });
    });
});

// GET => Logout User
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success_msg','You are logged out');
  res.redirect('/users/login');
});

// GET => Login New User
router.get('/login', function(req, res, next) {
  res.render('login',{
    title: 'Login'
  });
});

// Post => Login New User
router.post('/login',
  // authentication is used as MiddleWare in login POST route
  passport.authenticate(
    'local',
    { successRedirect:'/',
      failureRedirect: '/users/login',
      failureFlash: true
    }
  ),
  function(req, res) {
    console.log(req.body.email);
    console.log(req.body.password);
    req.flash('success','You are now logged in.');
    // res.redirect('/users/' + req.user.username);
    res.redirect('/');
  }
);

// Test login form input value
// router.post('/login', function(req,res,next){
//   var userName = req.body.userName;
//   console.log('input Username is: ');
//   console.log(userName);
//   var password = req.body.password;
//   console.log(password);
// })

router.get('/register', function(req, res, next) {
  console.log(req.flash('errors'));
  res.render('register',{
    title: 'Register',
    flashMessages: req.flash('flashErrors'),
    errors:''
  });
});

// POST => Register New User
router.post('/register', function(req,res,next){
  async.waterfall([
    function(callback){
      // console.log(req.body.userName);
      // Grab Data from form by req.body.xx
      var userName = req.body.userName;
      var email = req.body.email;
      var password = req.body.password;

      // Form Validator
      req.checkBody('userName','User name is required').notEmpty();
      req.checkBody('email','Email field is required').notEmpty();
      req.checkBody('email','Email is not valid').isEmail();
      req.checkBody('password','Password is required').notEmpty();

      // Check Errors
      var errors = req.validationErrors();
      if(errors){
        console.log(errors);
        res.render('register',{
          title: 'Register',
          flashMessages: req.flash('flashErrors'),
          errors: errors || ""
        });
      } else {
        User.findOne({email: req.body.email}, function(err, existingUser){
          if(existingUser){
            req.flash('flashErrors','This email is taken');
            return res.redirect('/users/register');
          } else {
            var newUser = new User();
            newUser.profile.userName = userName;
            newUser.email = email;
            newUser.password = password;
            User.createUser(newUser, function(err,user){
              if(err) throw err;
              // console.log(user);
              callback(null, user);
            });
          }
        });
      }
    },
    function(user){
      var collection = new Collection();
      collection.owner = user._id;
      collection.save( function(err){
        if(err) return next(err);
        // Flash Message
        req.flash('success_msg','Registed Successfully!');
        // redirect
        return res.redirect('/users/login');
      });
    }
  ]);
});

// passport middlewares
passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Set up passport Strategy -> Middle Ware
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done){
    User.getUserByEmail(email, function(err, user){
      if(err)
        return done(err);
      if(!user){
        return done(null, false, req.flash('error_msg','Unknown User Email'));
      }
      User.comparePassword(password, user.password, function(err,isMatch){
        if(err) return done(err);
        if(isMatch){
          return done(null, user);
        } else {
          return done(null, false, req.flash('error_msg','Invalid Password'));
        }
      });
    });
}));

// Set up passport-http-bearer Stragety -> Middle Ware
passport.use(new BearerStrategy(
  function(token, done) {
    User.findOne({ _id: token }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user, { scope: 'all' });
    });
  }
));

module.exports = router;
