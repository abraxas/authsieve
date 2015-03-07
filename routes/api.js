var express = require('express');
var router = express.Router();
var db = require('../lib/models');
var _ = require('lodash');
var uuid = require('uuid');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/apps', function(req,res,next) {
  db.App.findAll().then(function(apps) {
    res.json(_.map(apps, function(app) { return app.toJSON() }));
  });
});

router.get('/app_users', function(req,res,next) {
  db.AppUser.findAll().then(function(appUsers) {
    res.json(_.map(appUsers, function(appUser) { return appUser.toJSON() }));
  });
});

router.use('/apps/:app_id', function(req,res,next) {
  db.App.find(req.params.app_id)
  .then(function(appRecord) {
    req.appRecord = appRecord;
    next();
  });
});

router.use('/apps/:app_id', (function() {
  var appRouter = express.Router();

  appRouter.get('/users', function(req,res,next) {
    var ar = req.appRecord;
    var q = {};
    if(req.query) {
      //TODO: SOMETHING SAFER?
      q.where = req.query;
    }
    req.appRecord.getAppUsers(q).then(function(appUsers) {
      res.json(_.map(appUsers, function(appUser) { 
        var u = appUser.toJSON();
        delete u.password_hash;
        return u;
      }));
    });
  });

  appRouter.post('/users', function(req,res,next) {
    var body = req.body;
    body.AppId = req.appRecord.id;
    db.AppUser.create(body)
    .then(function(appUser) {
      res.json(appUser.toJSON());
    });
  });

  appRouter.post('/authenticate', function(req,res,next) {
    var methodName = req.body.method || 'login';

    var method = function(cb) { return cb(false); }
    if(methodName == 'basic') {
      method = db.AppUser.basicAuthenticate.bind(db.AppUser,req.body.credentials);
    }
    if(methodName == 'login') {
      var username = req.body.username || req.body.user || req.body.email;
      var password = req.body.password || req.body.pass || req.body.pw;
      method = db.AppUser.authenticate.bind(db.AppUser,username,password);
    }

    return method().then(function(appUser) {
      if(appUser) {
        var u = appUser.toJSON();
        u.status = "Success";
        res.json(u);
      }
      else {
        res.json({
          error: "User Authentication Failed",
          status: "Failed",
        });
      }
    });
  });

  return appRouter;
})())

module.exports = router;

