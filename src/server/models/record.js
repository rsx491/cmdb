
var mongoose = require('mongoose');
var Counter = require('./counter');
var RecordField = require('./recordField');

var Schema = mongoose.Schema;

var RecordSchema = new Schema({
	id: { type: Number }, //int
	status_date: { type: Date, default: Date.now },
	location: {type: String  },
	system: { type: String },
	physicalhost: { type: String },
	physvirtual: { type: String }, //V or P flag
	domainname: { type: String},
	os: { type: String  },
	owner: { type: String },
	ipaddress: String,
//	purpose: String,
//	description: String,
	ato: Boolean,
/*	atoapp: String,
	cmsource: String,
	hwmodel: String,
	hardwarecpu: String,
	network: String,
	cpus: String,
	memory: String,
	disk: String,
	status: String,
	notes: String, */
	create_date: { type:Date, default: Date.now},
	destroy_date: Date,
	splunk: Boolean,
	auto_discovery: Boolean
}, { strict: true, versionKey: false });


RecordSchema.post('save', function(next){
	if(!this.id){
		var self = this;
		Counter.find({label:'records'}, function(err, docs){
			if(err) {
				console.log(err);
				throw err;				
			}
			if(docs && docs.length > 0){
				self.id = docs[0].count;
				self.save();
				docs[0].count = docs[0].count + 1;
				docs[0].save();
			} else {
				self.id = 1;
				self.save();
				var newCounter = Counter({ label: 'records', count: 1});
				newCounter.save();
			}
		});
	}
});


RecordSchema.statics = {

	load: function (id, cb) {
    this.findOne({ _id : id })
      .exec(cb);
  	},

	list: function (options, cb) {
	    var criteria = options.criteria || {};
	    var sortBy = options.sortBy || {'status_date': -1};

	    this.find(criteria)
	      .sort(sortBy) // sort by date
	      .limit(options.perPage)
	      .skip(options.perPage * options.page)
	      .exec(cb);
	  }

};

/* update Record schema with any extra fields that were parsed into RecordFields */
RecordField.find({}, function(err,fields){
	if(err) {
		console.log(err);
		throw err;
	}
	console.log("Iterating through "+fields.length+" record fields to insert into schema..\n");
	for(var i in fields){
		var schemaField = RecordSchema.path(fields[i].label);
		if(!schemaField) {
			var addObj = {};
			addObj[ fields[i].label ] = fields[i].fieldType;
			RecordSchema.add(addObj);
		}
	}
});

var Record = mongoose.model('Record', RecordSchema);

module.exports = Record;