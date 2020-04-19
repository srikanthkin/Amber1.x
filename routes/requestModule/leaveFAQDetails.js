var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');

console.log('leaveFAQDetails');
var req_id="";

var empname="";
var empid="";
var project_id="";
var remb_id="";
var lodge_date="";
var maxCount=""; 

router.get('/leaveFAQDetails',leaveFAQDetails);


   function leaveFAQDetails(req,res){
var emp_id =req.user.rows[0].user_id;
var emp_name =req.user.rows[0].user_name;
var emp_access =req.user.rows[0].user_type;
 

  console.log("emp_id ", emp_id);
  console.log("emp_name ", emp_name);
  console.log("emp_access ", emp_access);
 

    
	
  res.render('requestModule/leaveFAQDetails',{
	emp_id:emp_id,
	emp_name:emp_name,
   emp_access:emp_access

});




   }


module.exports = router;
