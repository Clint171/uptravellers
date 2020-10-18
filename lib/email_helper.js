//Add nodemailer module
const nodemailer = require('nodemailer');

//
exports.mail = function(reciever , subject , html){ 
	let transport = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.variables.googleEmail,
		pass: process.env.variables.googlePassword
	}
});
	const message = {
		from: process.env.variables.googleEmail,
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