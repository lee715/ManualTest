var mongoose = require('mongoose');
var config = require('../config.js').config;

mongoose.connect(config.db_url, function(err){
	if(err){
		console.log("connect to db error: "+err.message);
		process.exit(1);
	}
});

require('./testResult');
// require('./plan');
// require('./user');

module.exports = {
	TestResult: mongoose.model('TestResult')
	// Plan: mongoose.model('Plan')
	// User: mongoose.model('User')
}
