console.log("Mongo-helper module (by Clint Simiyu) has the following dependencies : 'mongoose', 'bcrypt'.");

//MongoDB connection
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const url = "mongodb://localhost:27017";
const url_net = "mongodb+srv://Clint:clint@mongodb@clintsimiyu.orhmn.mongodb.net/uptravellers?retryWrites=true&w=majority";
db = mongoose.createConnection(url + "/uptravellers", {useNewUrlParser: true, useUnifiedTopology: true});

//Creating a schema for company
const companySchema = new mongoose.Schema({
	name : {
		type: String,
		required: true,
		unique: true,
	},
	offices : {
		type : Array,
	},
	description : {
		type : String,
	},
});


//Creating a Schema for client...
const clientSchema = new mongoose.Schema({
	firstname:{
		type: String,
		required: true, 
	},
	surname:{
		type: String,
	},
	email:{
		type: String,
		unique: true,
		required: true,
	},
	contact:{
		type: String,
		unique: true,
		required: true,		
	},
	password:{
		type: String,
		required: true,
	},
	contactby_email: String,
	contactby_sms: String,
});

//hashing a password before saving it to the database
clientSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});

//Creating a Schema for client-company...
const employeeSchema = new mongoose.Schema({
	firstname:{
		type: String,
		required: true, 
	},
	surname:{
		type: String,
	},
	email:{
		type: String,
		unique: true,
		required: true,
	},
	contact:{
		type: String,
		unique: true,
		required: true,		
	},
	password:{
		type: String,
		required: true,
	},
	contactby_email:{
		type: String,
	},
	contactby_sms:{
		type: String,
	},
	company:{
		type: String,
		required: true,
	}
});

//Creating a Schema for vehicle...
const vehicleSchema = new mongoose.Schema({
	regno:{
		type: String,
		required: true, 
	},
	driver:{
		type: String,
	},
	destination:{
		type: String,
		required: true,
	},
	deptdate:{
		type: Date,
		required: true,		
	},
	capacity:{
		type: Number,
		required: true,
	},
	company:{
		type: String,
		required: true,
	},
	currentCapacity:{
		type: Number,
		required: true,
	},
});

//hashing a password before saving it to the database
employeeSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});

//export constructors
var Client = db.model( 'Client' , clientSchema );

var Employee = db.model( 'Employee' , employeeSchema );

var Vehicle = db.model( 'Vehicle' , vehicleSchema );

exports.Client = Client;

exports.Employee = Employee;

exports.Vehicle = Vehicle;

//Define functions
exports.add = function(colname , data){

	colname.create(data , function(err , client){
		if (err){

			return undefined;

		}
		else{
		
			return client;
				
		}

	});

}

exports.read = function(colname , query , one){
	if( one == true){
		colname.findOne(query , (err , data)=>{
			if(err){
				console.log(err);
				return undefined;
			}
			else if(!data || data =="" || data == undefined ){
				var error = new Error(`Record: ${query} could not be located in the database`);
				console.log(error);
				return undefined;
			}
			else{
				return data;
			}
		});
	}
	else{
		colname.find(query , (err , data)=>{
			if(err){
				console.log(err);
				return undefined;
			}
			else if(!data || data =="" || data == undefined ){
				var error = new Error(`Record: ${query} could not be located in the database`);
				console.log(error);
				return undefined;
			}
			else{
				return data;
			}
		});

	};
}

exports.update= function(colname , query , update , one){
	if(one == true){
		colname.updateOne(query, update, function(err , result) {
		    if (err) {
		      return err;
		    } 
		    else {
		      return result;
		    }
		  });
	}
	else{
		colname.updateMany(query, update, function(err , result) {
		    if (err) {
		      return err;
		    } 
		    else {
		      return result;
		    }
		  });

	}
}

exports.del = function(colname , query){

}