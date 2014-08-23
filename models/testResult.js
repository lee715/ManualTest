var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TestResultSchema = new Schema({
	tester: String,
	device: String,
	system: String,
	time: {type: Date, default: Date.now},
	notes: {type: String, default: '{}'},
	results: {type: String, default: '{}'},
	plan: String,
	submited: {type: Boolean, default: false},
	submitable: {type: Boolean, default: false},
	current: {type:Number, default: 0}
});

mongoose.model('TestResult', TestResultSchema);
