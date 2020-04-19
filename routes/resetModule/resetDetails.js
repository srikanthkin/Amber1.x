var express = require('express');
var dateFormat = require('dateformat');
var multer = require('multer');
var app = express();
var util = require('util');
var path = require('path');
var router = express.Router();
var bodyParser = require('body-parser');
var Promise = require('mpromise');
var pdbconnect=require('../../routes/database/psqldbconnect');
var User = require('../../models/user');
var ensureAuthenticated=require('../../routes/utils/utils');
var moment = require('moment');
var rp = require('request-promise');
var mislog=require('winston');
var generator = require('generate-password');
var nodemailer = require('nodemailer');
var bcrypt = require('bcryptjs');
var arrayDifference = require("array-difference");
var nodemailer = require('nodemailer');
const roundTo = require('round-to');


//////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/resetDetails',function(req,res)
{
        var empId = req.user.rows['0'].user_id;

        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        var emp_access=result.rows['0'].user_type;

	if(emp_access == "N1")
	{
		pdbconnect.query("SELECT user_id,user_name from users where login_allowed='N' and login_attempts='4'",function(err,result)
		{
			if(err) throw err;
		
			var userid=result.rows;
			console.log("userid",userid);
			var userid_count=result.rowCount;
			console.log("userid_count",userid_count);

			res.render('resetModule/resetDetails',{
			ename:req.user.rows['0'].user_name,
			eid:req.user.rows['0'].user_id,
			emp_access:emp_access,
			userid:userid,
			userid_count:userid_count
		});
		});
	}
	else
	{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
	});
});


router.post('/unlockAccount',unlockAccount);
function unlockAccount(req , res)
{

	var array = req.body.button;
	console.log("array",array);

	pdbconnect.query("SELECT user_id,user_name from users where login_allowed='N' and login_attempts='4'",function(err,result){
	var uid = result.rows[array].user_id;
	console.log("uid",uid);
	var uname = result.rows[array].user_name;

	pdbconnect.query("SELECT * from emp_master_tbl where emp_id = $1",[uid],function(err,result){
	var mcount = result.rowCount;
	console.log("mcount",mcount);

	if(mcount == "1")
	{	
		pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id=$1",[uid],function(err,result){
		var uemail = result.rows['0'].emp_email;
		console.log("memail",uemail);
			
		pdbconnect.query("update users set reset_flg='N',login_allowed='Y',login_attempts='0',login_check='N' where user_id=$1",[uid],function(err,result){
		
		var smtpTransport = nodemailer.createTransport('SMTP',{
		service: 'gmail',
		auth:
		{
			  user: 'amber@nurture.co.in',
			  pass: 'nurture@123'
		}
		});

		var mailOptions = {
					to: uemail,
					from: 'amber@nurture.co.in',
					subject: 'Amber account unlock',
					text: 'Hi ' + uname + ',\n\n' +
					'You are receiving this mail because you (or someone else) has registered in Amber.\n\n' +
					'Your Amber account has been unlocked successfully with your old password:\n' +
					'In case u dont remember the old Password , Try Forgot Password Option.'+ '\n\n\n\n' +
					'- Regards,\nAmber'
				 };

               smtpTransport.sendMail(mailOptions, function(err) {
               });


			req.flash('success',"Account Unlocked Successfully for User Id :" + uid + ".")
			res.redirect('/resetModule/resetDetails/resetDetails');
		});	
		});

	}
	else
	{
		console.log("fail");
		req.flash('error',"Employee details does not exists :")
		res.redirect('/resetModule/resetDetails/resetDetails');
	}

	});
	});

};


///////////////////////////////////////////////////////////////////

module.exports = router;
