
//load csv data dump

var fs = require('fs');
var db = require('./db');
var Record = require('./models/record');
var Counter = require('./models/counter');
var RecordField = require('./models/recordField');

var requiredFields = ['owner','location','physicalhost','os','system']; //can be null but must be defined
var foundFields = {};
var recordFields = [];

var fileName = '../../.tmp/cmdb_master_list_05_20150713.csv';
if(process.argv.length > 2) {
	fileName = process.argv[2];
}


fs.readFile( fileName, 'utf8', function(err, data) {
	if(err){
		return console.log(err);
	}
	console.log("Read file \n");
	var fData = JSON.parse(data);
	if(fData && fData.length > 0) {
		Counter.find({label:'records'},function(err,docs){
			if(err){
				console.log("can't search counters",err);
				process.exit(1);
			}
			var record_counter = (docs && docs.length > 0 ? docs[0].count : 1);
			console.log("Inserting "+fData.length+" records.. \n");
			var records = [];
			for(var i=0;i<fData.length; i++) {
				for (var f in requiredFields) {
					if( typeof(fData[i][requiredFields[f]]) == "undefined" ) {
						console.log("Fatal Error: Record "+i+" is missing field '"+requiredFields[f]+"'\n");
						process.exit(1);
					}
				}
				fData[i].status_date = new Date(fData[i].status_date);
				if(fData[i].create_date) {
					fData[i].create_date = new Date(fData[i].create_date);
				}
				if(fData[i].destroy_date) {
					fData[i].destroy_date = new Date(fData[i].destroy_date);
				}
				if(!fData[i]['id']) {
					fData[i]['id'] = record_counter;
					record_counter++;
				}

				for (var k in fData[i] ) {
					if(typeof(foundFields[k])=="undefined") {
						foundFields[k] = true;
						recordFields.push( RecordField({ label: k, fieldType: "string" }) );
					}
				}

				var record = Record(fData[i]);
				
				records.push(record);
			}

			Counter.findOneAndUpdate({label:'records'},{label:'records',count:record_counter},{upsert:true},function(err,counter){
				if(err) throw err;
				console.log("Updated counter to "+record_counter);
			});
			
			

			console.log("Insert fields: ",foundFields);
			RecordField.create(recordFields, function(err, docs){
				if(err) {
					console.log("Unable to insert record fields",err);
					process.exit(1);
				}
				console.log("Finished inserting %d record fields", docs.length);
				Record.create(records, function(err, docs){
					if(err) {
						console.log("Unable to insert docs",err);
						process.exit(1);
					}
					console.log("Finished inserting %d records", docs.length);
					process.exit();
				});
			});
		});

	}
});
