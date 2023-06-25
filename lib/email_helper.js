//const usr = "clintsimiyu004@gmail.com"
//const password = ""
//Add nodemailer module
const nodemailer = require('nodemailer');

//
exports.mail = function(reciever , subject , html){ 
	let transport = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: usr,
		pass: password
	}
});
	const message = {
		from: usr,
		to: reciever,
		subject: subject,
		html: html,
};
transport.sendMail(message, (err, info)=>{
	if(err){
		console.log("E-mail not sent..."+err);
	}
	else{
	console.log('Email successfully sent.');
	}
});
}
