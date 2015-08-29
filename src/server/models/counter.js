var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CounterSchema = new Schema({
	label: String,
	count: Number
});




var Counter = mongoose.model('Counter', CounterSchema);
module.exports = Counter;