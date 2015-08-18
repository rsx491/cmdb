/**

* CM Crud controller

**/



var mongoose = require('mongoose'),

	Record = mongoose.model('Record'),

	RecordField = mongoose.model('RecordField'),

	Counter = mongoose.model('Counter');



var async = require('async');

//var Record = require('../models/record.js');





var CMController = {

	

	getRecords : function(req, res){

		var page = (req.params.page > 0 ? req.params.page : 1) - 1;

		var perPage = 30;

		  var options = {

		    //perPage: perPage,

		    //page: page

		  };

		Record.list(options, function(err, records) {

			if(err) {

				return res.status(500).json(err);

			}

			Record.count().exec(function (err, count) {

				res.json({

					records: records,

					page: page+1,

					pages: Math.ceil(count/perPage)

				});

			});

		});

	},



	getRecord : function(req, res){

		Record.find({ _id: req.params.id})

			//.populate('owner')

			//.populate('location')

			//.populate('osversion')

			.exec( function(err, record){

				if(err) {

					return res.status(404).json({msg:'Record not found'});

				}

				res.json(record);

			});

	},



	postRecord : function(req, res){



		if(req.body._id) {

			delete req.body._id;

		}

		var record = Record(req.body);

		if(1 || !record.id) {

			//have to fetch record counter first in order to set autoincrement id

			Counter.find({label:'records'},function(err,docs){

				if(err){

					console.log("Couldn't fetch counter",err);

					throw err;

				}

				var record_count = docs[0].count;

				record.id = docs[0].count;

				record.create_date = new Date();

				record.status_date = new Date();

				record.save(function(err) {

					if(err) {

						res.status(500).json({msg:err});

						return;

					}

					Counter.findOneAndUpdate({label:'records'},{label:'records',count:(record_count+1)},{upsert:true},function(err,count){

						res.status(200).json(record);

					});

					

				});

			})

		} else {

			delete req.body._id;

			Record.findByIdAndUpdate(record._id,req.body,function(err,doc) {

				if(err) {

					res.status(500).json({msg:err});

					return;

				}

				res.status(200).json(doc);

			});

		}

	},



	getOwners: function(callback) {

		Owner.find({}, callback);

	},

	getVersions: function(callback) {

		OSVersion.find({}, callback);



	},

	getLocations: function(callback) {

		Location.find({}, callback);

	},



	getCatalogs: function(req, res){

		//get all owners, versions and locations to return

		async.parallel({

			owners: function(cb){ Record.distinct('owner',{owner:{'$nin':[null,-1]}}, cb); },

			versions: function(cb){ Record.distinct('os',{os:{'$ne':null}},cb); },

			locations: function(cb){ Record.distinct('location',{}, cb); }

			//recordFields: function(cb){ RecordField.find({}, cb); }

		}, function(error, results){

			if(error) {

				res.status(500).send(error);

				return;

			}

			results.recordSchema = [];

			for(var i in Record.schema.paths) {

				if(Record.schema.paths[i].path=='_id'||Record.schema.paths[i].path=='_v') continue;

				results.recordSchema.push({ path : Record.schema.paths[i].path, fieldType: Record.schema.paths[i].instance });

			}

			res.json(results);

		});



	},



	



	//create tree with count of OS Version, Location and Owner records for sidebar

	getTree : function(req, res){

		var query_id = (req.query.id? (req.query.id==="null"?null:req.query.id) : 1);

		console.log("getTree",query_id);

		if( query_id==="1"&&!req.query.apiType ) {

			return res.json([

				{id:"locations", text:"Location", children:true},

				{id:"owners", text:"Owner", children:true},

				{id:"versions", text:"OS Version", children:true},

			]);

		} else if(query_id == "locations") {

			var agg = [

				{$match: { location:{'$nin':[null,-1,"-1",""]} } },

				{$group:{_id:{ location:'$location', physicalhost:'$physicalhost'}}},

				{$group:{_id:{location:'$_id.location'}, total: {$sum:1} }}

			];

			Record.aggregate(agg, function(err, result){

				if(err){

					console.log("Aggregate failed",err);

					return res.sendStatus(500);

				}

				return res.json(result.map(function(o){

					return {

						id: (o._id.location?o._id.location:"null"),

						li_attr: { apiType:"location"},

						text: o._id.location+" ("+o.total+")",

						children: (o.total>0?true:false)

					};

				}));

			});

			

		} else if(query_id == "owners") {

			//what is second pivot for owner?

			var agg = [

				{$match: { owner:{'$nin':[null,-1,"-1",""]} } },

				{$group:{_id:{owner:'$owner'}, total: {$sum:1} }}

			];

			Record.aggregate(agg, function(err, result){

				if(err){

					console.log("Aggregate failed",err);

					return res.sendStatus(500);

				}

				return res.json(result.map(function(o){

					return {

						id: (o._id.owner?o._id.owner:"null"),

						li_attr: { apiType:"owner"},

						text: o._id.owner+" ("+o.total+")",

						children: false

					};

				}));

			});

		} else if(query_id == "versions") {

			var agg = [

				{$match: { os:{'$nin':[null,-1,"-1",'']} } },

				{$group:{_id:{ os:'$os', system:'$system'}}},

				{$group:{_id:{ os:'$_id.os'}, total: {$sum:1} }}

			];

			Record.aggregate(agg, function(err, result){

				if(err){

					console.log("Aggregate failed",err);

					return res.sendStatus(500);

				}

				return res.json(result.map(function(o){

					return {

						id: (o._id.os?o._id.os:"null"),

						li_attr: { apiType:"os"},

						text: o._id.os+" ("+o.total+")",

						children: (o.total>0?true:false)

					};

				}));

			});

		} else if(req.query.apiType == 'location') {

			var agg = [

				{$match: {location:query_id, physicalhost:{'$nin':[null,-1,'-1','']} } },

				{$group:{_id:{ physicalhost:'$physicalhost'}, total:{$sum:1} }},

			];

			Record.aggregate(agg, function(err, result){

				if(err){

					console.log("Aggregate failed",err);

					return res.sendStatus(500);

				}

				return res.json(result.map(function(o){

					return {

						id: o._id.physicalhost,

						li_attr: { apiType:"location_physicalhost",clickAction:'filter', filter_location:query_id, filter_physicalhost:o._id.physicalhost },

						text: o._id.physicalhost,

						children: false

					};

				}));

			});

		} else if(req.query.apiType == 'os') {

			var agg = [

				{$match: {os:query_id, system:{'$nin':[null,-1,'-1','']}} },

				{$group:{_id:{ system:'$system'}, total:{$sum:1} }},

			];

			Record.aggregate(agg, function(err, result){

				if(err){

					console.log("Aggregate failed",err);

					return res.sendStatus(500);

				}

				return res.json(result.map(function(o){

					return {

						id: (!o._id.system?null:o._id.system),

						li_attr: { apiType:"os_system", clickAction:'filter', filter_os:query_id, filter_system:o._id.system },

						text: o._id.system,

						children: false

					};

				}).filter(function(o){

					return o.id!=null&&o.id.match(/^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})/);

				}) );

			});

		} else {

			return res.sendStatus(404);

		}

	}	





};



module.exports = CMController;
