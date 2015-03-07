var config = require('../lib/config');
config.setTest();

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

var http = require('http');
var app = require('../app');
var request = require('superagent-bluebird-promise');
var server;

var db = require('../lib/models');
var Promise = require('bluebird');

var fixtures = require('./fixtures');
var fixer = require('fixer');
var _ = require("lodash");

describe("api", function() {
  before(function() {
    this.timeout(5000);

    server = http.createServer(app);
    server.listen(8181);

    return db.truncate().then(function() { return db.sync(); })
    .then(function() {
      var fix = fixer(fixtures,db);
      return Promise.promisify(fix.load,fix)();
    });
  });

  describe("apps", function() {
    describe("list route", function() {
      it("should work", function() {
        return request.get("localhost:8181/api/apps").promise()
        .then(function(rawResult) {
          var result = JSON.parse(rawResult.text)
          result.length.should.equal(Object.keys(fixtures.App).length);
        });
      });

    });

    describe("sub-routes", function() {
      var app;
      before(function() {
        return db.App.find({name: fixtures.App.test.name})
        .then(function(testApp) {
          app=testApp;
          return app;
        });
      });

      describe("users", function() {
        it("should return only app-matching users", function() {
          return request.get("localhost:8181/api/apps/" +
            app.id + "/users").promise()
            .then(function(rawResult) {
              var result = JSON.parse(rawResult.text) ;
              result.length.should.equal(_.filter(fixtures.AppUser,
                  function(u) {
                    return u.App=="test"
                  }).length);
            });
        });
      
        it("should filter by username", function() {
            return request.get("localhost:8181/api/apps/" +
            app.id + "/users" +
            "?username=foobar").promise()
            .then(function(rawResult) {
              var result = JSON.parse(rawResult.text) ;
              result.length.should.equal(1);
              result[0].username.should.equal("foobar");
            });
        });
      });
      
      describe("create", function() {
        it("should add one that shows up", function() {
          return request.post("localhost:8181/api/apps/" +
            app.id + "/users").send({
              username: "bob",
            }).promise()
          .then(function(rawResult) {
            var result = JSON.parse(rawResult.text);

            return request.get("localhost:8181/api/apps/" +
              app.id + "/users").promise();
          })
          .then(function(rawResult) {
            var result = JSON.parse(rawResult.text) ;
            result.length.should.equal(_.filter(fixtures.AppUser,
                function(u) {
                  return u.App=="test"
                }).length + 1);
            var bob = _.find(result,{username: "bob"});
            expect(bob).to.exist;
            bob.username.should.equal("bob");
          })
        });
      });

      describe("authenticate", function() {
        it("should work", function() {
          return request.post("localhost:8181/api/apps/" +
            app.id + "/authenticate").send({
              username: "foobar",
              password: "test_hash",
            }).promise()
          .then(function(rawResult) {
            var result = JSON.parse(rawResult.text);
            result.status.should.equal("Success");
            result.username.should.equal("foobar");
            return null;
          })
        });
      });

      describe("basic authenticate", function() {
        it("should work", function() {
          return request.post("localhost:8181/api/apps/" +
            app.id + "/authenticate").send({
              method: "basic",
              credentials: "Zm9vYmFyOnRlc3RfaGFzaA==",
            }).promise()
          .then(function(rawResult) {
            var result = JSON.parse(rawResult.text);
            result.status.should.equal("Success");
            result.username.should.equal("foobar");
            return null;
          })
        });
      });

    });

  });
});
