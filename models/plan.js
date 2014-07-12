var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlanSchema = new Schema({
	content: String,
	time: {type: Date, default: Date.now},
	founder: String,
	asign: []
});

mongoose.model('Plan', PlanSchema);
