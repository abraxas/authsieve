var config = require('./config');
var bcrypt = require('bcrypt');
var atob = require('base64').decode;
var Promise = require('bluebird');

var Sequelize = require('sequelize');
var sequelize = new Sequelize('auth', 'username', 'password', {
  dialect: 'sqlite',
  storage: config.get('database:storage'),
  logging: console.log
});

/*
var User = sequelize.define('User', {
  username: Sequelize.STRING,
  birthday: Sequelize.DATE
});
*/

var App = sequelize.define('App', {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  name: Sequelize.STRING,
});

var AppUser = sequelize.define('AppUser', {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  username: Sequelize.STRING,
  password_hash: Sequelize.STRING,
},{
  setterMethods: {
    password: function(password) {
      this.password_hash = bcrypt.hashSync(password,bcrypt.genSaltSync(10));
    },
  },  
  instanceMethods: {
    authenticate: function(password) {
      return bcrypt.compareSync(password,this.password_hash);
    },
  },
  classMethods: {
    basicAuthenticate: function(encoded) {
      var decoded = atob(encoded);
      var decodedData = decoded.split(":");
      if(decodedData.length > 1) {
        var user = decodedData[0];
        var pass = decodedData[1];

        return this.find({where: { username: user }})
        .then(function(user) {
          if(user) {
            return user.authenticate(pass) ? user : null;
          }
          else {
            return null;
          }
        });
      }
      else {
        return Promise.resolve(null);
      }
    },
  }
});

App.hasMany(AppUser);
AppUser.belongsTo(App);

module.exports.sync = function() {
  return sequelize.sync();
}
module.exports.truncate = function() {
  return sequelize.dropAllSchemas();
}

module.exports.App = App
module.exports.AppUser = AppUser
