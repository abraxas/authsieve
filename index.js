var db = require('./lib/models');
var Promise = require('bluebird');


module.exports = function(name) {
  name = name || 'default';

  var appPromise = db.App.findOrCreate({
    where: { name: name },
  })
  .spread(function(appRecord,created) {
    return appRecord;
  });

  var users = function(q) {
    return appPromise.then(function(appRecord) {
      return appRecord.getAppUsers({})
      .map(function(appUser) {
         var jUser = appUser.toJSON();
         delete jUser.password_hash;
         return jUser;
      });      
    })
  };
  var addUser = function(u) {
    return appPromise.then(function(appRecord) {
      u.AppId = appRecord.id;
      return db.AppUser.create(u);
    });
  }
  var authenticate = function(user,pass) {
    return db.AppUser.authenticate(user,pass);
  }

  var setApp = function(appName) {
    name = appName;
    appPromise = db.App.find({where: { name: appName } });
    return appPromise;
  };

  var getApp = function() {
    return appPromise;
  };

  return {
    App: appPromise,
    getApp: getApp,
    setApp: setApp,
    list: users,
    create: addUser,
    authenticate: authenticate,
  };
};
