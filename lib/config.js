var nconf = require('nconf');
var fs = require('fs');
var path = require('path');



nconf
.argv()
.env()
.file({ file: '../config/authsieve.json'})
.file('database',{ file: '../config/database.json'})

nconf.defaults({
	database: {
		name: 'auth',
		username: 'username',
		password: 'password',
		dialect: 'sqlite',
		storage: 'db.sqlite',
	}
});

nconf.setTest = function() {
	console.log("UNLINK: " + path.join(__dirname,"../test.sqlite"))
	try {
		fs.unlinkSync(path.join(__dirname,"../test.sqlite"));
	}
	catch(e) {
		console.log("ERROR Unlinking test.sqlite: " + e);
		console.log("Disregard if this was your first time running tests.  I'm lazy");
	}
	finally {
		nconf.set("database:dialect","sqlite");
		nconf.set("database:storage","test.sqlite");
	}
}

module.exports =  nconf;
