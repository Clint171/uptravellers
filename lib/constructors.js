

//Constructor function for new company customer
exports.Customer_company = function(firstname,othernames,email,contact,password,contactby_email,contactby_sms,company){
this.firstname=firstname;
this.othernames=othernames;
this.email=email;
this.contact=contact;
this.password=password;
this.contactby_email=contactby_email;
this.contactby_sms=contactby_sms;
this.company=company;
}

//Constructor function for new vehicle
exports.Vehicle = function(regno,driver,destination,depttime,no_of_passengers,company){
this.regno=regno;
this.driver=driver;
this.destination=destination;
this.depttime=depttime;
this.no_of_passengers=no_of_passengers;
this.company=company;
}
