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
		.create({ defaultLayout : 'main_company'});
var MongoStore = require('connect-mongo')(session);//start express app
var app = express();
app.engine('handlebars' , hbs.engine);

//localised modules
const email_helper = require("./lib/email_helper.js");
const mongohelper = require("./lib/mongo_helper.js");

//other variables
//use third party software to serve static files
app.use(express.static(__dirname + '/public'));

app.use(require('body-parser').urlencoded({ extended : true }));

app.use(session({
	secret : 'yes banner',

	resave : true,

	saveUninitialized: false,

	rolling: true,

	cookie: {
		maxAge: 86400 * 1000,
	},

	store : new MongoStore({
		mongooseConnection : db,
	}),

}));

//set app port
app.set("port", process.env.PORT || 4000);


//set app view engine
app.set('view engine' , "handlebars");


//set 'post' routes and actions
app.post("/verification_sent",(req, res)=>{

	//creating new customer object
	let new_customer= {
		firstname       : req.body.firstname,

		surname         : req.body.surname,

		email           : req.body.email,

		contact         : req.body.phoneno,

		password        : req.body.password,

		contactby_email : req.body.contactby_email,

		contactby_sms   : req.body.contactby_sms,

		company         : req.body.company.toUpperCase()
	};

	//use schema.create to insert data into the db
	mongohelper.Client_company.create(new_customer , function(err , client){
		if (err){

			console.log(err);

		}
		else{
			req.session.email = req.body.email;
			req.session.password = req.body.password;
			req.session.company = req.body.company.toUpperCase();
			email_helper.mail(new_customer.email,`Finish setting up your account, ${req.body.firstname}`,`<div style=''><h2>Click <a href='http://192.168.8.1:3000/has_Been_Verified'>here</a> to finish setting up your account.</h2><p>This is not you? Please contact us <a href='tel:+254750109798'>here</a></p>`);	
			res.render('verification_sent');
				
		}
	
	});

});
app.post("/home",(req, res)=>{

	verify(req , res);
	if(req.session.company){
		findVehicles(req.session.company , res);
	}
});
app.post("/vehicle_added",(req , res)=>{
	if(req.session.company){
		let new_vehicle = {

			regno : req.body.regno.toUpperCase(),

			driver : req.body.driver,

			destination : req.body.destination.toUpperCase(),

			deptdate : req.body.deptdate,

			capacity : req.body.no_of_passengers,

			company : req.session.company.toUpperCase(),

			currentCapacity : 0,

		}
		mongohelper.Vehicle.create(new_vehicle , function(err , client){
			if (err){

				console.log(err);

			}
			else{
				findVehicles(req.session.company ,res );
			}
	
		});
	}
	else{
		res.render("signin" , {error : "<p style='color:red'>You must be signed in.</p>"});
	}

});
//set 'get' routes and actions
app.get("/" , (req , res )=>{
	if(req.session.company){
		findVehicles(req.session.company);
	}
	else{
		res.render('welcome_company');
	}
});

app.get("/signin" , (req , res )=>{
	if(req.session.company){
		findVehicles(req.session.company , res);
	}
	else{
		res.render('signin_company');
	}
});

app.get("/signup" , (req , res )=>{
	res.render('signup_company' , {companies : list});
});

app.get("/home" , (req , res )=>{
	if(req.session.company){
		findVehicles(req.session.company , res);
	}
	else{
		res.render('signin_company');
	}
});

app.get("/vehicles" , (req, res)=>{
	if (req.session.company) {
		findVehicles(req.session.company , res);
	}
	else{
		res.render("signin_company");
	}
});

app.get("/add_vehicle",(req , res)=>{
	res.render("add_vehicle");
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

//include all functions

function verify(req, res){
	var data = mongohelper.read("Employee", {"email" : req.body.email} , true );

	if(data == undefined){
		res.render("signin", {error : "<p style='color:red'>Sorry, but it seems you have entered a wrong e-mail address or password</p>"});
	}
	else{
		req.session.company = data.company;
			bcrypt.compare(req.body.password , data.password , (err , result)=>{
				if(err){
					console.log('error comparing passwords');
				}
				else if(result == false){
					console.log('Passwords do not match');
					res.render("signin", {error : "<p style='color:red'>Sorry, but it seems you have entered a wrong e-mail address or password</p>"});
				}
				else{
					req.session.email = req.body.email;
					req.session.password = req.body.password;
					findVehicles(req.session.company , res);
				}
			});
	}
};

function findVehicles(company , res){
	if(!company){
		console.log("Company is not defined.");
		res.render("home_company", {vehicles : "<p style='color:red'>There are no vehicles currently. Click on the button below to add a vehicle.</p>"});
	}
	else{
		var list="";
		var data = mongohelper.read("Vehicle",{company : company} );
			if (data!= undefined){
				for (let i of data) {
					let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; 
					let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
					let hours = i.deptdate.getHours().toString();
					let minutes = i.deptdate.getMinutes().toString();
					if (hours.length == 1) hours = "0" + hours;
					if (minutes.length == 1) minutes = "0" + minutes;
					list += `<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="background-color: rgba(10,10,90,0.8);margin: 8px;color : grey;"><h3>${i.regno}</h3><p>Destination : ${i.destination}</p><p>Driver : ${i.driver}</p><p>Departure : ${days[i.deptdate.getDay()]}, ${months[i.deptdate.getMonth()]+" "+ i.deptdate.getDate()+" ,"+i.deptdate.getFullYear()} at ${hours+":"+minutes}</p><p>Current capacity : ${i.currentCapacity}</p><input class="btn btn-danger" type="submit" value="Remove vehicle" ></div>`;
				}
				res.render('home_company' , { vehicles : list });
			}
			else{
				res.render("home_company", {vehicles : "<p style='color:red'>There are no vehicles currently. Click on the button below to add a vehicle.</p>"});
			}
		};
		
}
