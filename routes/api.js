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

  return appRouter;
})())

module.exports = router;

