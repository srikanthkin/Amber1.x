var express = require('express');
var router = express.Router();
var User= require('../../models/user');
var pdbconnect=require('../../routes/database/psqldbconnect');
var bcrypt=require('bcryptjs');
var generatePassword = require("password-generator");
var nodemailer = require('nodemailer');
var requestIp = require('request-ip');
var app = express();
var storepass="";
var newpasscode=[];
var pwd1=[];
var a="";
var b="";

var mislog=require('winston');

router.get('/loginpage',function(req,res){
 res.redirect('/');
 }); 

router.get('/changePassword',function(req,res)
{

        var error1="";

        res.render('changePassword/changePassword',{ 
        error1:error1
        });
});

router.get('/forgotPassword',function(req,res){
res.render('changePassword/forgotPassword');
});

router.post('/updatepwd',updatePwd);

function updatePwd(req , res){
   var userid=req.body.empid;
   var oldpasscode=req.body.oldpass;
   var newpasscode=req.body.newpass;
   var conpasscode=req.body.conpass;
   var error1="";
   var pwdarr=[];
      var updatedetails = function(db, callback) {
      User.getUserByUsernamepwd1(userid,function(err,user){

        if(err) throw err;
        if(user.rowCount == 0){
                                            
                        res.render('changePassword/changePassword',
			{
                          error:"Employee Id Does not exist",
                          error1:error1
                        });
        }
        else{

          User.comparePassword(oldpasscode,user.rows['0'].password,function(err,isMatch){

                if(err){
                  
                  res.render('changePassword/changePassword',{
                    error:"Employee Id and Password doesn't match",
                    error1:error1
                  });
                }

                if(!isMatch){
                
                res.render('changePassword/changePassword',{
                  error:'Incorrect Old Password',
                  error1:error1
                });

                }
                   if(isMatch){

              User.comparePasswordpwd(newpasscode,user.rows['0'].password,function(err,isMatch){
              
              if(err) throw err;
               if(isMatch){
                  res.render('changePassword/changePassword',{
                     error:'New Password cannot be same as Old Password',
                     error1:error1 
                  });    
               }
               else
               {
                  bcrypt.genSalt(10, function(err, salt) {
                   bcrypt.hash(newpasscode, salt, function(err, hash) {
                     storepass = newpasscode;
                     storepass = hash;
                     pdbconnect.query("UPDATE users set password=$1,reset_flg='N',client_ip='',session_id='' where user_id=$2 and login_allowed =$3",[storepass,userid,'Y'],function(err,result1){
                  
                   
                  req.flash('success_msg','Password updated successfully')

                    res.redirect('/');
                  });
                  });
                   });
                }
            }); 
            }
         });
       }
});
        }
   updatedetails();     
};

router.post('/forgotpwd',forgotPwd);

function forgotPwd(req , res)
{
  var userid=req.body.empid;
  console.log('userid',userid);
  var ranpass = generatePassword(4, false);
  console.log('ranpass',ranpass);
  finalpass=userid + "@" + ranpass;
  console.log('finalpass',finalpass);


  User.getUserByUsernamepwd1(userid,function(err,user)
      {

        if(err) throw err;
        if(user.rowCount == 0)
        {
                                            
                        res.render('changePassword/forgotPassword',{error:"Employee does not exist"});
        }
        else
        {
          pdbconnect.query("select emp_email,emp_name from emp_master_tbl where LOWER(emp_id)=LOWER($1)",[userid],function(err,resultset){
           if (err) throw err;
           var email=resultset.rows['0'].emp_email;
           var employee_name=resultset.rows['0'].emp_name;
           console.log('email',email);

            var smtpTransport = nodemailer.createTransport('SMTP',{
            service: 'gmail',
            auth: 
            {
                user: 'amber@nurture.co.in',
                pass: 'nurture@123'
            }
            });

            pdbconnect.query("update users set reset_flg='Y',client_ip='',session_id='' where user_id=$1 ",[userid],function(err,done)
            {

                if(err) throw err;
            });

                        var mailOptions = {
                   				to: email,
                                                from: 'amber@nurture.co.in',
		   				subject: 'Forgot Password',
                                                html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyvnOH41NjMz_1n8KlR4I388BASwPfRMNx44Es9Ru17aen8HTLqQ" height="95"><br><br>' +
                                                '<h3>Dear ' + employee_name + ',<br><br>' +
                                                '<p>Please reset your Password with following details</p><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">User Id</th> ' +
                                                                '<th style="border: 10px solid black;">' + userid + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">New Password</td> ' +
                                                                '<th style="border: 10px solid black;">' + finalpass + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
                   				'Kindly do not share your password with anyone else.<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
                                         };


                 smtpTransport.sendMail(mailOptions, function(err) {
                  });

                 bcrypt.hash(finalpass,10,function(err,hash)
                 {

                    hashpassword=finalpass;
                    hashpassword=hash;

                    pdbconnect.query("update users set password=$1,client_ip='',session_id='' where user_id=$2 ",[hash,userid],function(err,done){
                    if(err) throw err;
                     req.flash('success_msg','New Password generated successfully and mailed to your registered mail id')
                    res.redirect('/');

                    });
                  });
              });

                  
        }

      });
};

////////////////////////////////////////////////////////////////////////
router.get('/generateOtp',generateOtp);
function generateOtp(req,res)
{
    	var empid = req.query.empid;
	console.log("emp_id",empid);
                
	     pdbconnect.query("select emp_email,emp_name from emp_master_tbl where emp_id=$1",[empid],function(err,result){
             if (err)
             {
                        console.error('Error with table query', err);
             }
             else
             {
			var emp_cnt = result.rowCount;
			console.log("emp_cnt",emp_cnt);

			if(emp_cnt > 0)
			{
				var emp_email = result.rows['0'].emp_email;
				console.log("emp_email",emp_email);
				var emp_name = result.rows['0'].emp_name;
				console.log("emp_name",emp_name);
				var err_display = "";
				console.log("err_display",err_display);

				var ranpass = generatePassword(4, false); 	
				
				pdbconnect.query("update users set otp=$2 where user_id=$1",[empid,ranpass],function(err,result){

				var smtpTransport = nodemailer.createTransport('SMTP',{
				service: 'gmail',
				auth:
				{
					  user: 'amber@nurture.co.in',
					  pass: 'nurture@123'
				}
				});

                        	var mailOptions = {
                                                to: emp_email,
                                                from: 'amber@nurture.co.in',
                                                subject: 'One Time password for Password Reset',
                                                html: '<img src="http://www.smartvision.ae/portals/0/OTP-sms-service.jpg" height="85"><br><br>' +
                                                '<h3>Dear <b>' + emp_name + '</b>,<br><br>' +
                                                'You are receiving this mail because you (or someone else) has attempted to change your password in <b>Amber</b>.<br>' +
                                                'Please go through the below details to change your password : <br><br>' +
                                                '<table style="border: 10px solid black;"><tr style="border: 10px solid black;"><th style="border: 10px solid black;">User Id</th><th style="border: 10px solid black;">' + empid + '</th></tr><tr style="border: 10px solid black;"><td style="border: 10px solid black;"> Otp </td><td style="border: 10px solid black;">' + ranpass + '</td></tr></table><br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br>' +
                                                'Contact HR for any clarifications.<br>' +
                                                'Kindly do not share your otp with anyone else.<br><br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
                                         };

                       smtpTransport.sendMail(mailOptions, function(err) {
                       });

	     			res.json({key:err_display});
				});
			}
			else
			{
				var err_display = "Employee Id Does not Exist";
				console.log("err_display",err_display);
	     			res.json({key:err_display});
			}
	     }
      });
}


router.get('/validateOtp',validateOtp);
function validateOtp(req,res)
{
    	var empid = req.query.empid;
	console.log("emp_id",empid);
    	
	var otp = req.query.otp;
	console.log("otp",otp);

	
             pdbconnect.query("select otp from users where user_id=$1",[empid],function(err,result){
             if (err)
             {
                        console.error('Error with table query', err);
             }
             else
             {
                        var emp_cnt = result.rowCount;
                        console.log("emp_cnt",emp_cnt);
                        if(emp_cnt > 0)
                        {
                                var tbl_otp = result.rows['0'].otp;
                                console.log("tbl_otp",tbl_otp);

				if(tbl_otp != otp)
				{
					var display_err = "Invalid Otp";
					console.log("display_err",display_err);
					res.json({key:display_err});
				}
				else
				{
					var display_err = "";
					console.log("display_err",display_err);
					res.json({key:display_err});
				}
			}
			else
			{
					var display_err = "Employee Id Does not Exist";
					console.log("display_err",display_err);
					res.json({key:display_err});
			}
	     }
	     });
}

router.get('/forgotSendMail',forgotSendMail);
function forgotSendMail(req , res)
{
  var userid = req.query.empid;
  console.log('userid',userid);

  var ranpass = generatePassword(4, false);
  console.log('ranpass',ranpass);

  var finalpass = userid + "@" + ranpass;
  console.log('finalpass',finalpass);

  User.getUserByUsernamepwd1(userid,function(err,user)
  {
        if(err) throw err;
        if(user.rowCount == 0)
        {

                        res.render('changePassword/forgotPassword',{error:"Employee does not exist"});
        }
        else
        {
		    pdbconnect.query("select emp_email,emp_name from emp_master_tbl where LOWER(emp_id)=LOWER($1)",[userid],function(err,resultset){
		    if (err) throw err;
		    var email=resultset.rows['0'].emp_email;
		    var employee_name=resultset.rows['0'].emp_name;
		    console.log('email',email);

		    var smtpTransport = nodemailer.createTransport('SMTP',{
		    service: 'gmail',
		    auth:
		    {
			user: 'amber@nurture.co.in',
			pass: 'nurture@123'
		    }
		    });

            	    pdbconnect.query("update users set reset_flg='Y',client_ip='',session_id='' where user_id=$1 ",[userid],function(err,done)
            	    {
                		if(err) throw err;
            	    });
                        
		    var mailOptions = {
                                                to: email,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Forgot Password',
                                                html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyvnOH41NjMz_1n8KlR4I388BASwPfRMNx44Es9Ru17aen8HTLqQ" height="95"><br><br>' +
                                                '<h3>Dear ' + employee_name + ',<br><br>' +
                                                '<p>Please reset your Password with following details</p><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">User Id</th> ' +
                                                                '<th style="border: 10px solid black;">' + userid + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">New Password</td> ' +
                                                                '<th style="border: 10px solid black;">' + finalpass + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
                                                'Kindly do not share your password with anyone else.<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
                                         };

                 smtpTransport.sendMail(mailOptions, function(err) {
                 });

                 bcrypt.hash(finalpass,10,function(err,hash)
                 {
                    	hashpassword=finalpass;
                    	hashpassword=hash;

                    	pdbconnect.query("update users set password=$1,client_ip='',session_id='' where user_id=$2 ",[hash,userid],function(err,done){
                    	if(err) throw err;
                    	pdbconnect.query("update users set otp='' where user_id=$1",[userid],function(err,done){
                    	if(err) throw err;
                    	});
                    	});
                 });
           });
        }
    });
};

///////////////////////////////////////////////////////////////////////////////

module.exports = router;
