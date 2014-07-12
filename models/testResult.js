var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TestResultSchema = new Schema({
	tester: String,
	device: String,
	system: String,
	time: {type: Date, default: Date.now},
	notes: [],
	results: [],
	plan: String
});

mongoose.model('TestResult', TestResultSchema);
