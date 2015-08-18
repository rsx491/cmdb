var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var OwnerSchema = new Schema({
	id: Schema.ObjectId,
	label: String,
	count: Number
});

OwnerSchema.statics = {
	getAll : function(cb) {
		this.find({}).exec(cb);
	}
};

var Owner = mongoose.model('Owner', OwnerSchema);
module.exports = Owner;