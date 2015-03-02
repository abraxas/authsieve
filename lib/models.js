var Sequelize = require('sequelize');
var sequelize = new Sequelize('auth', 'username', 'password', {
  dialect: 'sqlite',
  storage: 'db.sqlite',
});

/*
var User = sequelize.define('User', {
  username: Sequelize.STRING,
  birthday: Sequelize.DATE
});
*/


var App = sequelize.define('App', {
  id: Sequelize.UUID,
  name: Sequelize.STRING,
});

var AppUser = sequelize.define('AppUser', {
  id: Sequelize.UUID,
  appId: Sequelize.UUID,
  username: Sequelize.STRING,
  password_hash: Sequelize.STRING,
});

/*
return sequelize.sync().then(function() {
  return User.create({
    username: 'janedoe',
    birthday: new Date(1980, 06, 20)
  });
}).then(function(jane) {
  console.log(jane.values)
});
*/

module.exports.sync = function() {
  return sequelize.sync();
}

module.exports.App = App
module.exports.AppUser = AppUser

