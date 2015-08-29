var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var OSVersionSchema = new Schema({
	id: Schema.ObjectId,
	label: String,
	count: Number
});

OSVersionSchema.statics = {
	getAll : function(cb) {
		this.find({}, cb);
	}
};

var OSVersion = mongoose.model('OSVersion', OSVersionSchema);
module.exports = OSVersion;