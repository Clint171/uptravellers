//02/08/2022 
//Create mongodb connection.
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const url = "mongodb://localhost:27017";
const url_net = "mongodb+srv://Clint:clint@mongodb@clintsimiyu.orhmn.mongodb.net/uptravellers?retryWrites=true&w=majority";
db = mongoose.createConnection(url + "/uptravellers");
//include all required modules
var express = require("express");
var session = require("express-session"); 
var hbs = require("express3-handlebars")
		.create({ defaultLayout : 'main'});
var MongoStore = require('connect-mongo')(session);
//localised modules
const email_helper = require("./lib/email_helper.js");
const mongohelper = require("./lib/mongo_helper.js");

//start express app
var app = express();
app.engine('handlebars' , hbs.engine);
//other variables
//use third party software 

app.use(express.static(__dirname + '/public'));

app.use(require('body-parser').urlencoded({ extended : true }));

app.use(session({
	secret : 'clients only',

	resave : true,

	saveUninitialized: false,

	rolling: true,

	cookie: {
		maxAge: 86400 * 1000,
	},

	store : new MongoStore({
		mongooseConnection : db
	}),

}));

//set app port

app.set("port", process.env.PORT || 3000);

//set app view engine

app.set('view engine' , "handlebars");

//set 'post' routes and actions

app.post("/verification_sent",(req, res)=>{

	//creating new customer object
	let new_customer = {
		firstname: req.body.firstname,

		surname: req.body.surname,

		email: req.body.email,

		contact: req.body.phoneno,

		password: req.body.password,

		contactby_email: req.body.contactby_email,

		contactby_sms: req.body.contactby_sms
	}
	//use schema.create to insert data into the db
	mongohelper.Client.create(new_customer , function(err , client){
		if (err){

			console.log(err);

		}
		else{
			req.session.email = req.body.email;
			req.session.password = req.body.password;
			req.session.firstname = req.body.firstname;
			email_helper.mail(new_customer.email,`Finish setting up your account, ${req.body.firstname}`,`<div style=''><h2>Click <a href='http://192.168.8.1:3000/has_Been_Verified'>here</a> to finish setting up your account.</h2><p>This is not you? Please contact us <a href='tel:+254750109798'>here</a></p>`);	
			res.render('verification_sent');
				
		}
	
	});
	
});

app.post("/home",(req, res)=>{
	verify(req , res);
});

app.post("/vehicles" , (req, res)=>{
	if(req.session.email){
		console.log(req.body.destination);
		getVehicles(req.body.destination , res);
	}
	else{
		res.render('signin' , {error : "<p style='color:red'>You have to be signed in first</p>"});
	}
});

app.post("/book",(req , res)=>{
	req.session.vehicle = req.body.query
	mongohelper.Vehicle.findOne({_id : req.body.query} , (err , data)=>{
		if(err){
			console.log(err);
		}
		else if(!data || data =="" || data == undefined ){
			console.log('No such record exists in the database'); 
			res.render('vehicles' , { error : "<p style='color : red;'>Sorry, but it seems there is an error in booking this vehicle. Please opt for another one or try again later.</p>" });
		}
		else{
			res.render('book', { max_seats : data.capacity-data.currentCapacity});
		}
	});	
});

app.post("/payment" , (req , res)=>{
	console.log(req.body);
	if(req.body.pay == "true"){
		res.render("payment");
	}
	else{
		res.render("booked");
	}
});

//set 'get' routes and actions
app.get("/" , (req , res )=>{
	if(req.session.email){
		res.render('home' , {firstname : req.session.firstname});
	}
	else{
		res.render('welcome');
	}
});
app.get("/signin" , (req , res )=>{
	if(req.session.email){
		res.render('home' , { firstname : req.session.firstname });
	}
	else{
		res.render('signin');
	}
});
app.get("/signup" , (req , res )=>{
	res.render('signup');
});
app.get("/home" , (req , res )=>{
	if(req.session.email){
		res.render('home' , { firstname : req.session.firstname });
	}
	else{
		res.render('signin');
	}
});
app.get('/signout' , (req , res)=>{
	req.session.destroy((err) =>{
		if(err){

			console.log(err);

		}
		else{

			res.render('signin');

		}
	});
});

app.use(function(req, res, next){
    res.status(404);        
    res.render('404');
});
// 500 error handler (middleware)
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);      
    res.render('504'); 
});
//set port to listen on, start the server
app.listen(app.get('port'),()=>{console.log(`Server started on port ${app.get('port')}. Press ctrl+C to terminate`);});
////

function verify(req, res){
	mongohelper.Client.findOne({"email" : req.body.email} , (err , data)=>{
		if(err){
			console.log(err);
		}
		else if(!data){
			console.log('No such record exists in the database');
			res.render("signin", {error : "<p style='color:red'>Sorry, but it seems you have entered a wrong e-mail address or password</p>"});
		}
		else{
			req.session.firstname = data.firstname;
			bcrypt.compare(req.body.password , data.password , (err , result)=>{
				if(err){
					console.log('error comparing passwords');
				}
				else if(result == false){
					console.log('Passwords do not match');
					res.render("signin", {error : "<p style='color:red'>Sorry, but it seems you have entered a wrong e-mail address or password</p>"});
				}
				else{
					res.render("home" , {firstname : req.session.firstname});
					req.session.email = req.body.email;
					req.session.password = req.body.password;
				}
			});
		}
	});
}
function getVehicles(destination , res){
	if(!destination || destination== undefined || destination == ''){
		res.render("home" , {error : "<p style='color : red;'>Sorry, but it seems there are no vehicles going in that direction right now</p>"});
	}
	else{
		var list="";
		mongohelper.Vehicle.find({destination : destination.toUpperCase()} , (err , data)=>{
			if(err){
				console.log(err);
			}
			else if(!data || data =="" || data == undefined ){
				console.log('No such record exists in the database');
				list = "<p style='color : red;'>Sorry, but it seems there are no vehicles going in that direction right now</p>"
				res.render('home' , { error : list });
			}
			else{
				for (let i of data) {
					let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
					let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
					let hours = i.deptdate.getHours().toString();
					let minutes = i.deptdate.getMinutes().toString();
					if (hours.length == 1) hours = "0" + hours;
					if (minutes.length == 1) minutes = "0" + minutes;

					list += `<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="background-color: rgba(0,0,140,0.8);margin : 8px;color : grey;"><h3>${i.company}</h3><p>This vehicle registration number ${i.regno} will be leaving the ${i.company.toLowerCase()} station on ${days[i.deptdate.getDay()]}, ${months[i.deptdate.getMonth()] + " " + i.deptdate.getDate() + " ," + i.deptdate.getFullYear()} at ${hours +':'+minutes}</p><p>It currently has ${i.capacity - i.currentCapacity} seats left</p><form method="post" action="/book"><input type="text" name="query" value="${i._id}" required hidden><input type="submit" class="btn btn-primary" value="Book"></form></div>`;
				}
				res.render('vehicles' , { vehicles : list });
			}
		});		
	}
}