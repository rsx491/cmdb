var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var LocationSchema = new Schema({
	id: Schema.ObjectId,
	label: String,
	count: Number
});

LocationSchema.statics = {
	getAll : function(cb) {
		this.find({}, cb);
	}
};

var Location = mongoose.model('Location', LocationSchema);
module.exports = Location;