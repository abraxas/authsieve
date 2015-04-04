var config = require('../lib/config');
config.setTest();

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

var fixtures = require('./fixtures');
var fixer = require('fixer');

var db = require('../lib/models');
var Promise = require('bluebird');

var _ = require("lodash");


describe("local", function() {
  var appId;
  var auth = null;

  before(function() {
    return db.truncate().then(function() { return db.sync(); })
    .then(function() {
      var fix = fixer(fixtures,db);
      return Promise.promisify(fix.load,fix)()
      .then(function() {
        auth = require("..")(fixtures.App.test.name);
        return auth.getApp();
      })
      .then(function(app) {
        appId = app.id;
        console.log("APPY " + app.name);
        console.log(app.id);
      })
    });
  });


  describe("list", function() {
    it("should work", function() { 
      return auth.list()
      .then(function(users) {
        console.dir(users);
        console.dir(fixtures.App.test);
        users.length.should.equal(_.filter(fixtures.AppUser,
          function(u) {
            return u.App == 'test';
          }).length);
      });
    });
  });
  describe("authenticate", function() {
    it("should work", function() {
      return auth.authenticate("foobar","test_hash")
      .then(function(u) {
        expect(u).to.exist;
        u.username.should.equal("foobar");
      });
    });
    it("bad should fail", function() {
      return auth.authenticate("foobar","BADPASS")
      .then(function(u) {
        expect(u).to.not.exist;
      });
    });
  });
  describe("create", function() {
    it("should work", function() {
      return auth.create({
        username: 'bob',
        password: 'smith'
      })
      .then(function(u) {
        expect(u).to.exist;
        expect(u.AppId).to.equal(appId);
      });
    });
    it("should also authenticate", function() {
      return auth.authenticate("bob","smith")
      .then(function(u) {
        expect(u).to.exist;
        expect(u.username).to.equal("bob");
        expect(u.AppId).to.equal(appId);

      });
    });
  });
});
