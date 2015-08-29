var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RecordFieldSchema = new Schema({
	label: String,
	fieldType: String
});




var RecordField = mongoose.model('RecordField', RecordFieldSchema);
module.exports = RecordField;