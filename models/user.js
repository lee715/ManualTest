var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: String,
	pass: String,
	level: {type: Number, default: 0}
});

mongoose.model('User', UserSchema);
