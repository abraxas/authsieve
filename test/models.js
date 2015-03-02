var config = require('../lib/config');
config.setTest();

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
var uuid = require('uuid');


var db = require('../lib/models');
var Promise = require('bluebird');

var fixtures = require('./fixtures');
var fixer = require('fixer');
var _ = require("lodash");

describe("models", function() {
  before(function() {
    this.timeout(5000);
    return db.truncate().then(function() { return db.sync(); })
    .then(function() {
      var fix = fixer(fixtures,db);
      return Promise.promisify(fix.load,fix)();
    });
  });

  describe("Config", function() {
    var db = config.get('database');
    expect(db).to.exist
    db.storage.should.equal("test.sqlite");
  });

  describe("App", function() {
    it("should respond to something", function() {
      return db.App.findAll()
      .then(function(results) {
        expect(results).to.exist;
        results.length.should.equal(2);
      });
    });
    it("should create something", function() {
      return db.App.create({
        name: 'test',
      })
      .then(function(app) {
        app.id.length.should.be.gt(10);
        return [app,db.App.find(app.id)]
      })
      .spread(function(createdApp,app) {
        app.id.should.equal(createdApp.id)

      })
    });
  });
  describe("AppUser", function() {
    describe("authenticate", function() {
      it("should work", function() {
        return db.AppUser.find({ username: "foobar" })
        .then(function(user) {
          user.authenticate("test_hash").should.be.true;
          user.authenticate("bad_pass").should.be.false;
        });
      });
    });
  });
});
