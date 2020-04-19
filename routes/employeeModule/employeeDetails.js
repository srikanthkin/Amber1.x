var express = require('express');
var router = express.Router();
var app = express();
var url = require('url');
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
var mislog=require('winston');
var dateFormat = require('dateformat');
var generatePassword = require("password-generator");
var fs = require('fs');

//////////////////////////////////// Employee Admin View starts Here ////////////////////////////////
router.get('/employeeDetails',function(req,res)
{
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

	var empId = req.user.rows['0'].user_id;

	pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
	emp_access=result.rows['0'].user_type;

        if(emp_access != "A1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {

		pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'ACC' order by comm_code_id asc",function(err,result){
		comm_code_id=result.rows;
		comm_code_id_count=result.rowCount;

		pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id = 'ACC'  order by comm_code_id asc",function(err,result){
		comm_code_desc=result.rows;
		comm_code_desc_count=result.rowCount;

		pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'DSG' order by comm_code_id asc",function(err,result){
		desig_code_id=result.rows;
		desig_code_id_count=result.rowCount;

		pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id = 'DSG'  order by comm_code_id asc",function(err,result){
		desig_code_desc=result.rows;
		desig_code_desc_count=result.rowCount;

                pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'CURR' order by comm_code_id asc",function(err,result){
                sal_curr=result.rows;
                sal_curr_count=result.rowCount;

		pdbconnect.query("SELECT emp_id from emp_master_tbl order by emp_id",function(err,result){
		rptMan_id=result.rows;
		rptMan_count=result.rowCount;
		
		pdbconnect.query("SELECT emp_name from emp_master_tbl order by emp_id",function(err,result){
		rpt_name=result.rows;
		rpt_name_count=result.rowCount;
	

		res.render('employeeModule/employeeDetails',{
		emp_access:emp_access,
		ename:req.user.rows['0'].user_name,
		eid:req.user.rows['0'].user_id,
		comm_code_id:comm_code_id,
		comm_code_id_count:comm_code_id_count,
		comm_code_desc:comm_code_desc,
		comm_code_desc_count:comm_code_desc_count,
		desig_code_id:desig_code_id,
		desig_code_id_count:desig_code_id_count,
		desig_code_desc:desig_code_desc,
		desig_code_desc_count:desig_code_desc_count,
		sal_curr:sal_curr,
		sal_curr_count:sal_curr_count,	
		rptMan_id:rptMan_id,
		rptMan_count:rptMan_count,
		rpt_name:rpt_name,
		rpt_name_count:rpt_name_count
								});
							});
						});
					});
				});
			});
		});
	     });
	   }
     });
});


router.post('/addempdet',addempdet);
function addempdet(req , res)
{
	var test = req.body.test;

	if(test == "Add Profile")
	{
		var now = new Date();
		var rcreuserid=req.user.rows['0'].user_id;
		var rcretime=now;
		var lchguserid=req.user.rows['0'].user_id;
		var lchgtime=now;
		var empid=req.body.empid;
		var empname=req.body.empName;
		var email=req.body.email;
		var empaccess=req.body.empAccess;
		var jDate=req.body.jDate;
		var desig=req.body.desig;
		var empClass=req.body.empClass;
		var salary=req.body.salary;
		var sal_curr=req.body.sal_curr;
		var rptman=req.body.rptMan;
		var probPeriod=req.body.probPeriod;
		var preem=req.body.preem;
		if(preem=="Y")
		{
			var preExpyear=req.body.preExpyear;
			var preExpmonth=req.body.preExpmonth;
			var preEmp=req.body.preEmp;
			var preEmp2=req.body.preEmp2;
			var preEmp3=req.body.preEmp3;
			var preEmp4=req.body.preEmp4;
			var preEmp5=req.body.preEmp5;
		}
		else
		{
			var preExpyear="0";
			var preExpmonth="0";
			var preEmp="";
			var preEmp2="";
			var preEmp3="";
			var preEmp4="";
			var preEmp5="";
		}

		var entity_cre_flg="Y";
		var reset_flg="N";
		
		// added for e-docket
		var pan_flg="N";
		var aadhar_flg="N";
		var sslc_flg="N";
		var preuniv_flg="N";
		var degree_flg="N";
		var del_flg="N";

		pdbconnect.query("SELECT * from users u INNER JOIN emp_master_tbl e ON u.user_id=e.emp_id where LOWER(u.user_id) = LOWER($1)",
			      [empid],function(err,resultset){
		if(err) throw err;
		var rcount = resultset.rowCount;
		if(rcount == 0)
		{ 


			pdbconnect.query("SELECT * from emp_master_tbl where emp_email=$1",[email],function(err,test){
			if(err) throw err;
			var emailcheck = test.rowCount;

			if(emailcheck >= 1)
			{
				req.flash('error',"This Email-Id :" + email + " is registered with Amber")
				res.redirect(req.get('referer'));
			}
			else
			{

			pdbconnect.query("INSERT INTO emp_master_tbl(emp_id,emp_name,emp_access,emp_email,joining_date,designation,salary,reporting_mgr,prev_expr_year,prev_expr_month,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,emp_prob,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,entity_cre_flg,pre_emp_flg,emp_classification,salary_curr) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)",[empid,empname,empaccess,email,jDate,desig,salary,rptman,preExpyear,preExpmonth,preEmp,preEmp2,preEmp3,preEmp4,preEmp5,probPeriod,'N',rcreuserid,rcretime,lchguserid,lchgtime,entity_cre_flg,preem,empClass,sal_curr],function(err,done){
			if(err) throw err;

			var userid=req.body.empid;
			var ranpass = generatePassword(4, false);
			var finalpass =userid + "@" + ranpass;
			
			var smtpTransport = nodemailer.createTransport('SMTP',{
			service: 'gmail',
			auth: 
			{
				  user: 'amber@nurture.co.in',
				  pass: 'nurture@123'
			}
			});


			var mailOptions = {
						to: email,
						from: 'amber@nurture.co.in',
						subject: 'Amber Portal account creation',
						html: '<img src="http://www.confessionsofareviewer.com/wp-content/uploads/2017/05/welcome-on-board.jpg" height="85"><br><br>' +
						'<h3>Dear <b>' + empname + '</b>,<br><br>' +
						'You are receiving this mail because you (or someone else) has registered in <b>Amber</b>.<br>' +
						'Please follow the below Account Activation details : <br><br>' +
						'<table style="border: 10px solid black;"><tr style="border: 10px solid black;"><th style="border: 10px solid black;">User Id</th><th style="border: 10px solid black;">' + empid + '</th></tr><tr style="border: 10px solid black;"><td style="border: 10px solid black;"> Password </td><td style="border: 10px solid black;">' + finalpass + '</td></tr></table><br><br>' +
						'URL: http://amber.nurture.co.in <br><br>' + 
						'Contact HR for any clarifications.<br>' +  
						'Kindly do not share your password with anyone else.<br><br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
					 };

		       smtpTransport.sendMail(mailOptions, function(err) {
		       });

		       bcrypt.hash(finalpass,10,function(err,hash)
		       {

				hashpassword=finalpass;
                    		hashpassword=hash;


				pdbconnect.query("INSERT INTO users(user_name,user_id,password,user_type,expiry_date,login_allowed,login_attempts,del_flag,login_check,reset_flg,session_id,client_ip) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",[empname,empid,hash,empaccess,'01-01-2099','Y','0','N','N','N','',''],function(err,done){
				if (err) throw err;
				});
			});
		
			pdbconnect.query("insert into e_docket_tbl(emp_id,pan_flg,aadhar_flg,sslc_flg,preuniv_flg,degree_flg,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",[empid,pan_flg,aadhar_flg,sslc_flg,preuniv_flg,degree_flg,del_flg,rcreuserid,rcretime,lchguserid,lchgtime],function(err,done){
			req.flash('success',"User successfully added and an E-mail has been sent to " + email + " with further instructions.")
			res.redirect(req.get('referer'));

		});
		});
		}
		});
		}
		else
		{
			req.flash('error',"Employee Details Already Added for this Employee:" +empname)
			res.redirect(req.get('referer'));
		}

		});
		//For fetching Which Value on click of submit(if loop)
	   }
	   
};

/////////////////////////// View other employee details /////////////////////////
//to view all employee details

router.get('/employeeDetailsView',function(req,res)
{
	var empId = req.user.rows['0'].user_id;

	pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
	emp_access=result.rows['0'].user_type;

        if(emp_access != "A1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {

		var empid="";
		var empName="";
		var email="";
		var empAccess="";
		var jDate="";
		var desig="";
		var empClass="";
		var salary="";
		var salary_curr="";
		var salary_curr_desc=""; 
		var pid="";
		var rptMan="";
		var rptMan_desc="";
		var probPeriod="";
		var preem="";
		var preExpyear="";
		var preExpmonth="";
		var preEmp="";
		var preEmp2="";
		var preEmp3="";
		var preEmp4="";
		var preEmp5="";
		var gender="";
		var dob="";
		var bgroup="";
		var shirt="";
		var commAdd="";
		var state="";
		var city="";
		var pincode="";
		var resAdd="";
		var state1="";
		var city1="";
		var pincode1="";
		var mobNum="";
		var telNum="";
		var econNum="";
		var emerPer="";
		var fathersName="";
		var mothersName="";
		var maritalstatus="";
		var spouseName="";
		var panNum="";
		var passNum="";
		var aadhaarNum="";
		var dlNum="";
		var uan="";
		var nameinBank="";
		var bankName="";
		var branchName="";
		var acctNum="";
		var ifscCode="";
		var enFlg="";
		var cflag="";
	       
		pdbconnect.query("SELECT emp_id from emp_master_tbl order by emp_id asc",function(err,result){
		employee=result.rows;
		emp_id_count=result.rowCount;

		pdbconnect.query("SELECT emp_name from emp_master_tbl order by emp_id asc",function(err,result){
		empname=result.rows;
		empname_count=result.rowCount;

		res.render('employeeModule/employeeDetailsView',{
				emp_access:emp_access,
				ename:req.user.rows['0'].user_name,
				eid:req.user.rows['0'].user_id,
				employee:employee,
				emp_id_count:emp_id_count,
				empname:empname,
				empid:empid,
				empName:empName,
				email:email,
				empAccess:empAccess,
				jDate:jDate,
				desig:desig,
				empClass:empClass,
				salary:salary,
				salary_curr:salary_curr,
				salary_curr_desc:salary_curr_desc,
				pid:pid,
				rptMan:rptMan,
				rptMan_desc:rptMan_desc,
				probPeriod:probPeriod,
				preem:preem,
				preExpyear:preExpyear,
				preExpmonth:preExpmonth,
				preEmp:preEmp,
				preEmp2:preEmp2,
				preEmp3:preEmp3,
				preEmp4:preEmp4,
				preEmp5:preEmp5,
				gender:gender,
				dob:dob,
				bgroup:bgroup,
				shirt:shirt,
				commAdd:commAdd,
				state:state,
				city:city,
				pincode:pincode,
				resAdd:resAdd,
				state1:state1,
				city1:city1,
				pincode1:pincode1,
				mobNum:mobNum,
				telNum:telNum,
				econNum:econNum,
				emerPer:emerPer,
				fathersName:fathersName,
				mothersName:mothersName,
				maritalstatus:maritalstatus,
				spouseName:spouseName,
				panNum:panNum,
				passNum:passNum,
				aadhaarNum:aadhaarNum,
				dlNum:dlNum,
				uan:uan,
				nameinBank:nameinBank,
				bankName:bankName,
				branchName:branchName,
				acctNum:acctNum,
				ifscCode:ifscCode,
				enFlg:enFlg,
				cflag:cflag
								//closing bracket of render
								});

				});
			});
		}
	});
});


router.post('/viewempdet',viewempdet);
function viewempdet(req , res)
{
	var emp_id=req.body.emp_id;

	var empId = req.user.rows['0'].user_id;

	pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
	emp_access=result.rows['0'].user_type;

	pdbconnect.query("SELECT * from emp_master_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,check){
	rcount_master=check.rowCount;
	
	pdbconnect.query("SELECT * from emp_info_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,test){
	rcount_info=test.rowCount;

	pdbconnect.query("SELECT * from emp_info_tbl_temp where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,test){
	var flag=test.rowCount;

	pdbconnect.query("SELECT * from emp_info_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,main){
	var mflag=main.rowCount;

	var cflag="Y";	

	if(flag == 1)
	{
		var enFlg="N";
	}

	if(mflag == 1)
	{
		var enFlg="Y";
	}

	if(flag == mflag)
	{
		var enFlg="N";
	}

	if(rcount_master == rcount_info)
	{

		//query 1 to fetch professional details
		pdbconnect.query("select emp_id,emp_name,emp_email,emp_access,joining_date,designation,salary,reporting_mgr,prev_expr_year,prev_expr_month,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,emp_prob,pre_emp_flg,emp_classification,salary_curr from emp_master_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,resultset){
		if (err) throw err;
		var empid=resultset.rows['0'].emp_id;
		var empName=resultset.rows['0'].emp_name;
		var email=resultset.rows['0'].emp_email;
		var empAccess=resultset.rows['0'].emp_access;
		var jDate=resultset.rows['0'].joining_date;
		var jDate=dateFormat(jDate,"yyyy-mm-dd");
		var desig=resultset.rows['0'].designation;
		var empClass=resultset.rows['0'].emp_classification;
		var salary=resultset.rows['0'].salary;
		var salary_curr=resultset.rows['0'].salary_curr;
		var rptMan=resultset.rows['0'].reporting_mgr;
		var probPeriod=resultset.rows['0'].emp_prob;
		var preem=resultset.rows['0'].pre_emp_flg;
		var preExpyear=resultset.rows['0'].prev_expr_year;
		var preExpmonth=resultset.rows['0'].prev_expr_month;
		var preEmp=resultset.rows['0'].prev_empr;
		var preEmp2=resultset.rows['0'].prev_empr2;
		var preEmp3=resultset.rows['0'].prev_empr3;
		var preEmp4=resultset.rows['0'].prev_empr4;
		var preEmp5=resultset.rows['0'].prev_empr5;
		

		pdbconnect.query("select * from project_alloc_tbl where emp_id = $1",[empid],function(err,resultset){
		if (err) throw err;
		pidcount=resultset.rowCount;

		if(pidcount > 1 )
		{
			var pid = "MULTIPLE";

		}
		
		if(pidcount == 1)
		{
			pdbconnect.query("select project_id from project_alloc_tbl where emp_id = $1",[empid],function(err,resultset)
			{
					if (err) throw err;
					pid=resultset.rows['0'].project_id;	
			});
		}

		if(pidcount == 0)
		{
			var pid="Not Allocated";
		
		}

		//query 2 to fetch personal details
		pdbconnect.query("select gender,dob,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,phone1,phone2,father_name,mother_name,martial_status,spouse_name,pan_number,passport_num,aadhaar_num,license_num,blood_group,shirt_size,emergency_num,emergency_con_person,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code from emp_info_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,result){
		if (err) throw err;
		var gender=result.rows['0'].gender;
		var dob=result.rows['0'].dob;
		var dob=dateFormat(dob,"yyyy-mm-dd");
		var bgroup=result.rows['0'].blood_group;
		var shirt=result.rows['0'].shirt_size;
		var commAdd=result.rows['0'].comm_addr1;
		var state=result.rows['0'].state;
		var city=result.rows['0'].city;
		var pincode=result.rows['0'].pincode;
		var resAdd=result.rows['0'].comm_addr2;
		var state1=result.rows['0'].state1;
		var city1=result.rows['0'].city1;
		var pincode1=result.rows['0'].pincode1;
		var mobNum=result.rows['0'].phone1;
		var telNum=result.rows['0'].phone2;
		var econNum=result.rows['0'].emergency_num;
		var emerPer=result.rows['0'].emergency_con_person;
		var fathersName=result.rows['0'].father_name;
		var mothersName=result.rows['0'].mother_name;
		var maritalstatus=result.rows['0'].martial_status;
		var spouseName=result.rows['0'].spouse_name;
		var panNum=result.rows['0'].pan_number;
		var passNum=result.rows['0'].passport_num;
		var aadhaarNum=result.rows['0'].aadhaar_num;
		var dlNum=result.rows['0'].license_num;
		var uan=result.rows['0'].uan_num;
		var nameinBank=result.rows['0'].name_in_bank;
		var bankName=result.rows['0'].bank_name;
		var branchName=result.rows['0'].branch_name;
		var acctNum=result.rows['0'].account_num;
		var ifscCode=result.rows['0'].ifsc_code;

		//Setting Values for designation List

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='ACC' and comm_code_id=$1",[empAccess],function(err,resultset){
		empAccess=resultset.rows['0'].comm_code_desc;
		
		//Setting Values for designation List

		pdbconnect.query("select emp_name from emp_master_tbl where emp_id=$1",[rptMan],function(err,resultset){
		rptMan_desc=resultset.rows['0'].emp_name;

		//Setting Values for designation List

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='DSG' and comm_code_id=$1",[desig],function(err,resultset){
		desig=resultset.rows['0'].comm_code_desc;

		//Setting Values for Marriage List

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='MAR' and comm_code_id=$1",[maritalstatus],function(err,resultset){
		maritalstatus=resultset.rows['0'].comm_code_desc;

		//Setting Values for Gender List

		if(gender == "M"){gender = "MALE";}
		if(gender == "F"){gender = "FEMALE";}

		//Setting Values for Gender List

		if(probPeriod == "Y"){probPeriod = "YES";}
		if(probPeriod == "N"){probPeriod = "NO";}
		
		// setting values for previous experience
		if(preem == "Y"){preem = "YES";}
		if(preem == "N"){preem = "NO";}

		//Setting Values for Shirt List

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='BLG' and comm_code_id=$1",[bgroup],function(err,resultset){
		bgroup=resultset.rows['0'].comm_code_desc;

		//Setting Values for Shirt List

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='SHR' and comm_code_id=$1",[shirt],function(err,resultset){
		shirt=resultset.rows['0'].comm_code_desc;

		//Setting Values for State List

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='STA' and comm_code_id=$1",[state],function(err,resultset){
		state=resultset.rows['0'].comm_code_desc;

		//Setting Values for State List

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='STA' and comm_code_id=$1",[state1],function(err,resultset){
		state1=resultset.rows['0'].comm_code_desc;
		
		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='CURR' and comm_code_id=$1",[salary_curr],function(err,resultset){
		salary_curr_desc=resultset.rows['0'].comm_code_desc;

		res.render('employeeModule/employeeDetailsView',{
		enFlg:enFlg,
		cflag:cflag,
		emp_access:emp_access,
		ename:req.user.rows['0'].user_name,
		eid:req.user.rows['0'].user_id,
		empid:empid,
		empName:empName,
		email:email,
		empAccess:empAccess,
		jDate:jDate,
		desig:desig,
		empClass:empClass,
		salary:salary,
		salary_curr:salary_curr,
		salary_curr_desc:salary_curr_desc,
		pid:pid,	
		rptMan:rptMan,
		rptMan_desc:rptMan_desc,
		preem:preem,
		probPeriod:probPeriod,
		preExpyear:preExpyear,
		preExpmonth:preExpmonth,
		preEmp:preEmp,
		preEmp2:preEmp2,
		preEmp3:preEmp3,
		preEmp4:preEmp4,
		preEmp5:preEmp5,
		gender:gender,
		dob:dob,
		bgroup:bgroup,
		shirt:shirt,
		commAdd:commAdd,
		state:state,
		city:city,
		pincode:pincode,
		resAdd:resAdd,
		state1:state1,
		city1:city1,
		pincode1:pincode1,
		mobNum:mobNum,
		telNum:telNum,
		econNum:econNum,
		emerPer:emerPer,
		fathersName:fathersName,
		mothersName:mothersName,
		maritalstatus:maritalstatus,
		spouseName:spouseName,
		panNum:panNum,
		passNum:passNum,
		aadhaarNum:aadhaarNum,
		dlNum:dlNum,
		uan:uan,
		nameinBank:nameinBank,
		bankName:bankName,
		branchName:branchName,
		acctNum:acctNum,
		ifscCode:ifscCode
							//closing bracket of render
							});
			//closing bracket of query1
			});
		//closing bracket of query2
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
	//closing of if loop
	}
	else
	{

		var gender="";
		var dob="";
		var bgroup="";
		var shirt="";
		var commAdd="";
		var state="";
		var city="";
		var pincode="";
		var resAdd="";
		var state1="";
		var city1="";
		var pincode1="";
		var mobNum="";
		var telNum="";
		var econNum="";
		var emerPer="";
		var fathersName="";
		var mothersName="";
		var maritalstatus="";
		var spouseName="";
		var panNum="";
		var passNum="";
		var aadhaarNum="";
		var dlNum="";
		var uan="";
		var nameinBank="";
		var bankName="";
		var branchName="";
		var acctNum="";
		var ifscCode="";

		//query 1 to fetch professional details
		pdbconnect.query("select emp_id,emp_name,emp_email,emp_access,joining_date,designation,salary,reporting_mgr,prev_expr_year,prev_expr_month,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,emp_prob,pre_emp_flg,emp_classification,salary_curr from emp_master_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,resultset){
		if (err) throw err;
		var empid=resultset.rows['0'].emp_id;
		var empName=resultset.rows['0'].emp_name;
		var email=resultset.rows['0'].emp_email;
		var empAccess=resultset.rows['0'].emp_access;
		var jDate=resultset.rows['0'].joining_date;
		var jDate=dateFormat(jDate,"yyyy-mm-dd");
		var desig=resultset.rows['0'].designation;
		var empClass=resultset.rows['0'].emp_classification;
		var salary=resultset.rows['0'].salary;
		var salary_curr=resultset.rows['0'].salary_curr;
		var rptMan=resultset.rows['0'].reporting_mgr;
		var probPeriod=resultset.rows['0'].emp_prob;
		var preem=resultset.rows['0'].pre_emp_flg;
		var preExpyear=resultset.rows['0'].prev_expr_year;
		var preExpmonth=resultset.rows['0'].prev_expr_month;
		var preEmp=resultset.rows['0'].prev_empr;
		var preEmp2=resultset.rows['0'].prev_empr2;
		var preEmp3=resultset.rows['0'].prev_empr3;
		var preEmp4=resultset.rows['0'].prev_empr4;
		var preEmp5=resultset.rows['0'].prev_empr5;

                pdbconnect.query("select * from project_alloc_tbl where emp_id = $1",[empid],function(err,resultset){
                if (err) throw err;
                pidcount=resultset.rowCount;
                if(pidcount > 1 )
                {
                        var pid = "MULTIPLE";

                }

                if(pidcount == 1)
                {
                        pdbconnect.query("select project_id from project_alloc_tbl where emp_id = $1",[empid],function(err,resultset){
                        if (err) throw err;
                        pid=resultset.rows['0'].project_id;
                        });
                }

                if(pidcount == 0)
                {
                        var pid="Not Allocated";
                }
	
		//Setting Values for designation List

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='ACC' and comm_code_id=$1",[empAccess],function(err,resultset){
		empAccess=resultset.rows['0'].comm_code_desc;

		pdbconnect.query("select emp_name from emp_master_tbl where emp_id=$1",[rptMan],function(err,resultset){
		rptMan_desc=resultset.rows['0'].emp_name;

		//Setting Values for designation List

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='DSG' and comm_code_id=$1",[desig],function(err,resultset){
		desig=resultset.rows['0'].comm_code_desc;
		
		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='CURR' and comm_code_id=$1",[salary_curr],function(err,resultset){
		salary_curr_desc=resultset.rows['0'].comm_code_desc;

		//Setting Values for Gender List

		if(gender == "M"){gender = "MALE";}
		if(gender == "F"){gender = "FEMALE";}

		//Setting Values for Gender List

		if(probPeriod == "Y"){probPeriod = "YES";}
		if(probPeriod == "N"){probPeriod = "NO";}
		
		// setting values for previous experience
		if(preem == "Y"){preem = "YES";}
		if(preem == "N"){preem = "NO";}

		res.render('employeeModule/employeeDetailsView',{
			enFlg:enFlg,
			cflag:cflag,
			emp_access:emp_access,
			ename:req.user.rows['0'].user_name,
			eid:req.user.rows['0'].user_id,
			empid:empid,
			empName:empName,
			email:email,
			empAccess:empAccess,
			jDate:jDate,
			desig:desig,
			empClass:empClass,
			salary:salary,
			salary_curr:salary_curr,
			salary_curr_desc:salary_curr_desc,
			pid:pid,
			rptMan:rptMan,
			rptMan_desc:rptMan_desc,
			preem:preem,
			probPeriod:probPeriod,
			preExpyear:preExpyear,
			preExpmonth:preExpmonth,
			preEmp:preEmp,
			preEmp2:preEmp2,
			preEmp3:preEmp3,
			preEmp4:preEmp4,
			preEmp5:preEmp5,
			gender:gender,
			dob:dob,
			bgroup:bgroup,
			shirt:shirt,
			commAdd:commAdd,
			state:state,
			city:city,
			pincode:pincode,
			resAdd:resAdd,
			state1:state1,
			city1:city1,
			pincode1:pincode1,
			mobNum:mobNum,
			telNum:telNum,
			econNum:econNum,
			emerPer:emerPer,
			fathersName:fathersName,
			mothersName:mothersName,
			maritalstatus:maritalstatus,
			spouseName:spouseName,
			panNum:panNum,
			passNum:passNum,
			aadhaarNum:aadhaarNum,
			dlNum:dlNum,
			uan:uan,
			nameinBank:nameinBank,
			bankName:bankName,
			branchName:branchName,
			acctNum:acctNum,
			ifscCode:ifscCode
					//closing bracket of query1
					});        
				});
				});
				});
				});
				});
				});
	//closing of else loop
	}
	//closing of check
	});
	});
	//closing of test
	});
	});
	});
//closing of function	
};

///////////////////////////////// Employee Details Modify //////////////////////////

router.get('/employeeDetailsModify',function(req,res)
{
	var empId = req.user.rows['0'].user_id;

	pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
	emp_access=result.rows['0'].user_type;

        if(emp_access != "A1")
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {

		var empid=""
		var empName="";
		var email="";
		var empAccess="";
		var empAccess_desc="";
		var comm_code_empAccess="";
		var comm_code_empAccess_count="";
		var jDate="";
		var desig="";
		var desig_desc="";
		var comm_code_desig="";
		var comm_code_desig_count="";
		var empClass="";
		var salary="";
                var sal_currency="";
                var sal_currency_desc="";
		var sal_curr="";
		var sal_curr_count="";
		var rptMan="";
		var rptMan_desc="";
		var comm_code_rptMan="";
		var comm_code_rptMan_count="";	
		var probPeriod="";
		var preem="";
		var preExpyear="";
		var preExpmonth="";
		var preEmp="";
		var preEmp2="";
		var preEmp3="";
		var preEmp4="";
		var preEmp5="";

		pdbconnect.query("SELECT emp_id from emp_master_tbl order by emp_id asc",function(err,result){
		employee=result.rows;
		emp_id_count=result.rowCount;

		pdbconnect.query("SELECT emp_name from emp_master_tbl order by emp_id asc",function(err,result){
		empname=result.rows;
		empname_count=result.rowCount;

		res.render('employeeModule/employeeDetailsModify',{
		emp_access:emp_access,
		ename:req.user.rows['0'].user_name,
		eid:req.user.rows['0'].user_id,
		employee:employee,
		emp_id_count:emp_id_count,
		empname:empname,
		empid:empid,
		empName:empName,
		email:email,
		empAccess:empAccess,
		empAccess_desc:empAccess_desc,
		comm_code_empAccess:comm_code_empAccess,
		comm_code_empAccess_count:comm_code_empAccess_count,
		jDate:jDate,
		desig:desig,
		desig_desc:desig_desc,
		comm_code_desig:comm_code_desig,
		comm_code_desig_count:comm_code_desig_count,
		empClass:empClass,
		salary:salary,
		sal_currency:sal_currency,
		sal_currency_desc:sal_currency_desc,
                sal_curr:sal_curr,
                sal_curr_count:sal_curr_count,
		rptMan:rptMan,
		rptMan_desc:rptMan_desc,
		comm_code_rptMan:comm_code_rptMan,
		comm_code_rptMan_count:comm_code_rptMan_count,	
		probPeriod:probPeriod,
		preem:preem,
		preExpyear:preExpyear,
		preExpmonth:preExpmonth,
		preEmp:preEmp,
		preEmp2:preEmp2,
		preEmp3:preEmp3,
		preEmp4:preEmp4,
		preEmp5:preEmp5
								    });;
							});
					});
			}
		});
});

router.post('/modempdet',modempdet);
function modempdet(req , res)
{

		var emp_id=req.body.emp_id;		
	
		var empId = req.user.rows['0'].user_id;

		pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
		emp_access=result.rows['0'].user_type;

		//query 1 to fetch professional details
		pdbconnect.query("select emp_id,emp_name,emp_email,emp_access,joining_date,designation,salary,reporting_mgr,emp_prob,prev_expr_year,prev_expr_month,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,pre_emp_flg,emp_classification,salary_curr from emp_master_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,resultset){
		if (err) throw err;
		var empid=resultset.rows['0'].emp_id;
		var empName=resultset.rows['0'].emp_name;
		var email=resultset.rows['0'].emp_email;
		var empAccess=resultset.rows['0'].emp_access;
		var jDate=resultset.rows['0'].joining_date;
		var jDate=dateFormat(jDate,"yyyy-mm-dd");
		var desig=resultset.rows['0'].designation;
		var empClass=resultset.rows['0'].emp_classification;
		var salary=resultset.rows['0'].salary;
		var sal_currency=resultset.rows['0'].salary_curr;
		var rptMan=resultset.rows['0'].reporting_mgr;
		var probPeriod=resultset.rows['0'].emp_prob;
		var preem=resultset.rows['0'].pre_emp_flg;
		var preExpyear=resultset.rows['0'].prev_expr_year;
		var preExpmonth=resultset.rows['0'].prev_expr_month;
		var preEmp=resultset.rows['0'].prev_empr;
		var preEmp2=resultset.rows['0'].prev_empr2;
		var preEmp3=resultset.rows['0'].prev_empr3;
		var preEmp4=resultset.rows['0'].prev_empr4;
		var preEmp5=resultset.rows['0'].prev_empr5;

		//query to select description of employee Access

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='ACC' and comm_code_id=$1",[empAccess],function(err,resultset){
		empAccess_desc=resultset.rows['0'].comm_code_desc;
		
		//query to fetch other Data from Table for employee Access

		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'ACC' ",function(err,result){
		comm_code_empAccess=result.rows;
		comm_code_empAccess_count=result.rowCount;

		//query to select description of designation

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='DSG' and comm_code_id=$1",[desig],function(err,resultset){
		desig_desc=resultset.rows['0'].comm_code_desc;

		//query to fetch other Data from Table for designation

		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id='DSG'",function(err,result){
		comm_code_desig=result.rows;
		comm_code_desig_count=result.rowCount;

		//query to fetch other Data from Table for reporting manager

		pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id =$1 order by emp_id",[rptMan],function(err,result){
		rptMan_desc=result.rows['0'].emp_name;

		//query to select employee id,employee name for reporting manager

		pdbconnect.query("SELECT emp_id,emp_name from emp_master_tbl where emp_id!=$1 order by emp_id",[empid],function(err,result){
		comm_code_rptMan=result.rows;
		comm_code_rptMan_count=result.rowCount;
		
		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'CURR' ",function(err,result){
		sal_curr=result.rows;
		sal_curr_count=result.rowCount;

		pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id = 'CURR' and comm_code_id=$1",[sal_currency],function(err,result){
		sal_currency_desc=result.rows['0'].comm_code_desc;

		res.render('employeeModule/employeeDetailsModify',{
		emp_access:emp_access,
	        ename:req.user.rows['0'].user_name,
        	eid:req.user.rows['0'].user_id,
		empid:empid,
		empName:empName,
		email:email,
		empAccess:empAccess,
		empAccess_desc:empAccess_desc,
		comm_code_empAccess:comm_code_empAccess,
		comm_code_empAccess_count:comm_code_empAccess_count,
		jDate:jDate,
		desig:desig,
		desig_desc:desig_desc,
		comm_code_desig:comm_code_desig,
		comm_code_desig_count:comm_code_desig_count,
		empClass:empClass,
		salary:salary,
		sal_currency:sal_currency,
		sal_currency_desc:sal_currency_desc,
		sal_curr:sal_curr,
		sal_curr_count:sal_curr_count,
		rptMan:rptMan,
		rptMan_desc:rptMan_desc,
		probPeriod:probPeriod,
		preem:preem,
		comm_code_rptMan:comm_code_rptMan,
		comm_code_rptMan_count:comm_code_rptMan_count,	
		preExpyear:preExpyear,
		preExpmonth:preExpmonth,
		preEmp:preEmp,
		preEmp2:preEmp2,
		preEmp3:preEmp3,
		preEmp4:preEmp4,
		preEmp5:preEmp5
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
   });
}

router.post('/addmodempdet',addmodempdet);
function addmodempdet(req , res)
{
	var now = new Date();
	var rcreuserid=req.user.rows['0'].user_id;
	var rcretime=now;
	var lchguserid=req.user.rows['0'].user_id;
	var lchgtime=now;
	var empid=req.body.empid;	
	var empName=req.body.empName;
	var email=req.body.email;
	var empAccess=req.body.empAccess;
	var jDate=req.body.jDate;
	var desig=req.body.desig;
	var empClass=req.body.empClass;
	var salary=req.body.salary;
	var sal_curr=req.body.sal_curr;
	var rptMan=req.body.rptMan;
	var probPeriod=req.body.probPeriod;
	var preem=req.body.preem;
	if(preem=="Y")
        {
		var preExpyear=req.body.preExpyear;
		var preExpmonth=req.body.preExpmonth;
		var preEmp=req.body.preEmp;
		var preEmp2=req.body.preEmp2;
		var preEmp3=req.body.preEmp3;
		var preEmp4=req.body.preEmp4;
		var preEmp5=req.body.preEmp5;
        }
        else
        {
		var preExpyear="0";
		var preExpmonth="0";
		var preEmp="";
		var preEmp2="";
		var preEmp3="";
		var preEmp4="";
		var preEmp5="";
        }

	var entity_cre_flg="Y";

	pdbconnect.query("select * from emp_master_tbl_hist where emp_id = $1",[empid],function(err,done){
	var hist_count = done.rowCount;
	

	if(hist_count == "1")
	{

		pdbconnect.query("delete from emp_master_tbl_hist where emp_id = $1",[empid],function(err,done){
		if(err) throw err;
		});

		pdbconnect.query("insert into emp_master_tbl_hist select * from emp_master_tbl where emp_id=$1 ",[empid],function(err,result){
		if(err) throw err;
		});
	}
	else
	{

                pdbconnect.query("insert into emp_master_tbl_hist select * from emp_master_tbl where emp_id=$1 ",[empid],function(err,result){
                if(err) throw err;
                });
	}


		pdbconnect.query("UPDATE emp_master_tbl set emp_name=$2,emp_email=$3,emp_access=$4,joining_date=$5,designation=$6,salary=$7,reporting_mgr=$8,emp_prob=$9,prev_expr_year=$10,prev_expr_month=$11,prev_empr=$12,prev_empr2=$13,prev_empr3=$14,prev_empr4=$15,prev_empr5=$16,del_flg=$17,rcre_user_id=$18,rcre_time=$19,lchg_user_id=$20,lchg_time=$21,entity_cre_flg=$22,pre_emp_flg=$23,emp_classification=$24,salary_curr=$25 where emp_id=$1",[empid,empName,email,empAccess,jDate,desig,salary,rptMan,probPeriod,preExpyear,preExpmonth,preEmp,preEmp2,preEmp3,preEmp4,preEmp5,'N',rcreuserid,rcretime,lchguserid,lchgtime,entity_cre_flg,preem,empClass,sal_curr],function(err,done){
		if(err) throw err;
		
		pdbconnect.query("UPDATE users set user_type=$2 where user_id=$1",[empid,empAccess],function(err,done){
		if(err) throw err;
				
		// Added after new request

		var smtpTransport = nodemailer.createTransport('SMTP',{
		service: 'gmail',
		auth:
		{
			user: 'amber@nurture.co.in',
			pass: 'nurture@123'
		}
		});

		var mailOptions = {
				      to: email,
				      from: 'amber@nurture.co.in',
				      subject: 'Modification made on your Professional Details',
				      html: '<h3><p> Dear <b> ' + empName + ' </b> , <br><br>' + 
				      'You are receiving this mail because HR has modified your Professional details.<br>' +
				      'Please go through the details and cross check from your end<br>' +
				      'In case of any clarifications/concerns feel free to contact HR.<br>'+ 
				      'URL: http://amber.nurture.co.in <br><br><br><br><br>' +
				      '- Regards,<br><br>Amber</h3>'

			       };

	       smtpTransport.sendMail(mailOptions, function(err) {
	       });
	       });
	       });
       	       });
	       
	       req.flash('success',"Employee Professional Details has been Modified sucessfully for the Employee Id :" + empid + ".")
	       res.redirect('/employeeModule/employeeDetails/employeeDetailsModify');
	
}

/////////////////////////////// employee Approval /////////////////////////////////////////////////

router.get('/employeeApprovalDetails',function(req,res)
{

	var empId = req.user.rows['0'].user_id;

	pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result)
	{
		emp_access=result.rows['0'].user_type;
		
		if(emp_access != "A1")
		{
			      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
		}
		else
		{

			pdbconnect.query("select emp_id,emp_name from emp_info_tbl_temp where entity_cre_flg='N' order by emp_id asc",function(err,done)
			{
				if(err) throw err;
				emp=done.rows;
				emp_count=done.rowCount;
		
				res.render('employeeModule/employeeApprovalDetails',{

				emp_access:emp_access,
				ename:req.user.rows['0'].user_name,
				eid:req.user.rows['0'].user_id,
				emp:emp,
				emp_count:emp_count
		
									            });
			});
		}

	});
});


router.post('/apprPen',apprPen);
function apprPen(req , res)
{
		var emp_id=req.body.empid;		

		var empId = req.user.rows['0'].user_id;

		pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
		emp_access=result.rows['0'].user_type;

		pdbconnect.query("select emp_id,emp_name,gender,dob,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,phone1,phone2,father_name,mother_name,martial_status,spouse_name,pan_number,passport_num,aadhaar_num,license_num,blood_group,shirt_size,emergency_num,emergency_con_person,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code from emp_info_tbl_temp where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,result){
		if (err) throw err;

		var empid=result.rows['0'].emp_id;
		var empName=result.rows['0'].emp_name;
		var gender=result.rows['0'].gender;
		var dob=result.rows['0'].dob;
		var dob=dateFormat(dob,"yyyy-mm-dd");
		var bgroup=result.rows['0'].blood_group;
		var shirt=result.rows['0'].shirt_size;
		var commAdd=result.rows['0'].comm_addr1;
		var state=result.rows['0'].state;
		var city=result.rows['0'].city;
		var pincode=result.rows['0'].pincode;
		var resAdd=result.rows['0'].comm_addr2;
		var state1=result.rows['0'].state1;
		var city1=result.rows['0'].city1;
		var pincode1=result.rows['0'].pincode1;
		var mobNum=result.rows['0'].phone1;
		var telNum=result.rows['0'].phone2;
		var econNum=result.rows['0'].emergency_num;
		var emerPer=result.rows['0'].emergency_con_person;
		var fathersName=result.rows['0'].father_name;
		var mothersName=result.rows['0'].mother_name;
		var maritalstatus=result.rows['0'].martial_status;
		var spouseName=result.rows['0'].spouse_name;
		var panNum=result.rows['0'].pan_number;
		var passNum=result.rows['0'].passport_num;
		var aadhaarNum=result.rows['0'].aadhaar_num;
		var dlNum=result.rows['0'].license_num;
		var uan=result.rows['0'].uan_num;
		var nameinBank=result.rows['0'].name_in_bank;
		var bankName=result.rows['0'].bank_name;
		var branchName=result.rows['0'].branch_name;
		var acctNum=result.rows['0'].account_num;
		var ifscCode=result.rows['0'].ifsc_code;

		//query to select description of blood

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='BLG' and comm_code_id=$1",[bgroup],function(err,resultset){
		blood_desc=resultset.rows['0'].comm_code_desc;

		//query to fetch other Data from Table

		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'BLG'",function(err,result){
		comm_code_blood=result.rows;
		comm_code_blood_count=result.rowCount;

		//query to select shirt desc from common table

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='SHR' and comm_code_id=$1",[shirt],function(err,resultset){
		shirt_desc=resultset.rows['0'].comm_code_desc;

		//query to fetch other data related to shirt

		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'SHR' ",function(err,result){
		comm_code_shirt=result.rows;
		comm_code_shirt_count=result.rowCount;

		//query to select state desc from common table

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='STA' and comm_code_id=$1",[state],function(err,resultset){
		state_desc=resultset.rows['0'].comm_code_desc;

		//query to fetch other data related to state

		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'STA' ",function(err,result){
		comm_code_state=result.rows;
		comm_code_state_count=result.rowCount;

		//query to select state desc from common table

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='STA' and comm_code_id=$1",[state1],function(err,resultset){
		state_desc1=resultset.rows['0'].comm_code_desc;

		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'STA' ",function(err,result){
		comm_code_state1=result.rows;
		comm_code_state_count1=result.rowCount;

		pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='MAR' and comm_code_id=$1",[maritalstatus],function(err,resultset){
		maritalstatus_desc=resultset.rows['0'].comm_code_desc;

		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'MAR' ",function(err,result){
		comm_code_maritalstatus=result.rows;
		comm_code_maritalstatus_count=result.rowCount;


		res.render('employeeModule/employeeVerpersonal',{
		emp_access:emp_access,
		ename:req.user.rows['0'].user_name,
		eid:req.user.rows['0'].user_id,
		empid:empid,
		empName:empName,
		gender:gender,
		dob:dob,
		bgroup:bgroup,
		shirt:shirt,
		commAdd:commAdd,
		state:state,
		city:city,
		pincode:pincode,
		resAdd:resAdd,
		state1:state1,
		city1:city1,
		pincode1:pincode1,
		mobNum:mobNum,
		telNum:telNum,
		econNum:econNum,
		emerPer:emerPer,
		fathersName:fathersName,
		mothersName:mothersName,
		maritalstatus:maritalstatus,
		spouseName:spouseName,
		panNum:panNum,
		passNum:passNum,
		aadhaarNum:aadhaarNum,
		dlNum:dlNum,
		uan:uan,
		nameinBank:nameinBank,
		bankName:bankName,
		branchName:branchName,
		acctNum:acctNum,
		ifscCode:ifscCode
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
}

router.post('/verifyDetails',verifyDetails);
function verifyDetails(req , res)
{

	var now = new Date();
	var rcreuserid=req.user.rows['0'].user_id;
	var rcretime=now;
	var lchguserid=req.user.rows['0'].user_id;
	var lchgtime=now;
	var empid=req.body.empid;
	var empName=req.body.empName;
	var gender=req.body.gender;
	var dob=req.body.dob;
	var bgroup=req.body.bgroup;
	var shirt=req.body.shirt;
	var commAdd=req.body.commAdd;
	var state=req.body.state;
	var city=req.body.city;
	var pincode=req.body.pincode;
	var resAdd=req.body.resAdd;
	var state1=req.body.state1;
	var city1=req.body.city1;
	var pincode1=req.body.pincode1;
	var mobNum=req.body.mobNum;
	var telNum=req.body.telNum;
	var econNum=req.body.econNum;
	var emerPer=req.body.emerPer;
	var fathersName=req.body.fathersName;
	var mothersName=req.body.mothersName;
	var maritalstatus=req.body.maritalstatus;
	var spouseName=req.body.spouseName;
	var panNum=req.body.panNum;
	var passNum=req.body.passNum;
	var aadhaarNum=req.body.aadhaarNum;
	var dlNum=req.body.dlNum;
	var uan=req.body.uan;
	var nameinBank=req.body.nameinBank;
	var bankName=req.body.bankName;
	var branchName=req.body.branchName;
	var acctNum=req.body.acctNum;
	var ifscCode=req.body.ifscCode;
	var entity_cre_flg="Y";
	var rejReason=req.body.rejReason;
	var deleteReason=req.body.deleteReason;

	pdbconnect.query("select emp_email from emp_master_tbl where emp_id=$1",[empid],function(err,result){
	var email = result.rows['0'].emp_email;


	var test = req.body.test;
	if(test!="")
	{
		if(test == "Verify Profile")
		{
			
        		pdbconnect.query("select * from emp_info_tbl_hist where emp_id = $1",[empid],function(err,done){
        		var hist_count = done.rowCount;

        		if(hist_count == "1")
        		{

                		pdbconnect.query("delete from emp_info_tbl_hist where emp_id = $1",[empid],function(err,done){
                		if(err) throw err;
                		});

                		pdbconnect.query("insert into emp_info_tbl_hist select * from emp_info_tbl where emp_id=$1 ",[empid],function(err,result){
                		if(err) throw err;
                		});
        		}
        		else
        		{

				pdbconnect.query("insert into emp_info_tbl_hist select * from emp_info_tbl where emp_id=$1",[empid],function(err,result){
				if(err) throw err;
				});

        		}


			pdbconnect.query("select * from emp_info_tbl where emp_id=$1",[empid],function(err,result){		
			var rcount = result.rowCount;

			if(rcount == 0)
			{

				  pdbconnect.query("INSERT INTO emp_info_tbl(emp_id,emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code,del_flg,entity_cre_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)",[empid,empName,gender,dob,bgroup,shirt,commAdd,state,city,pincode,resAdd,state1,city1,pincode1,maritalstatus,mobNum,telNum,econNum,emerPer,fathersName,mothersName,spouseName,panNum,passNum,dlNum,aadhaarNum,uan,nameinBank,bankName,branchName,acctNum,ifscCode,'N',entity_cre_flg,rcreuserid,rcretime,lchguserid,lchgtime],function(err,done){
				if(err) throw err;

				pdbconnect.query("delete from emp_info_tbl_temp where emp_id=$1",[empid],function(err,done){
				if(err) throw err;	

				var smtpTransport = nodemailer.createTransport('SMTP',{
				service: 'gmail',
				auth:
				{
					  user: 'amber@nurture.co.in',
					  pass: 'nurture@123'
				}
				});
			

				var mailOptions = {
							to: email,
							from: 'amber@nurture.co.in',
							subject: 'Verification Successful for your Personal Details Added/Modified.',
							html:'<img src="http://www.helisconsulting.com/wp-content/uploads/2017/01/Employee-Verification_Helis-Conuslting.jpg" height="85"><br><br>' +
							'<h3>Dear <b>' + empName + '</b>,<br><br>' +
							'You are receiving this mail because HR has verified the Added/Modified Personal Details.<br>' +
							'Please go through the system for affected changes.<br>' + 
							'In case of any Clarifications/Concern please contact HR .<br>' + 
							'URL: http://amber.nurture.co.in <br><br><br>' +
						        '- Regards,<br><br>Amber</h3>'	
						 };

			       smtpTransport.sendMail(mailOptions, function(err) {
			       });


				req.flash('success',"Employee Personal Details Verified sucessfully for the user:" + empid + ".")
				res.redirect('/employeeModule/employeeDetails/employeeApprovalDetails');
				});
				});
			}
			else
			{
			
				 pdbconnect.query("update emp_info_tbl set gender=$2,dob=$3,blood_group=$4,shirt_size=$5,comm_addr1=$6,state=$7,city=$8,pincode=$9,comm_addr2=$10,state1=$11,city1=$12,pincode1=$13,martial_status=$14,phone1=$15,phone2=$16,emergency_num=$17,emergency_con_person=$18,father_name=$19,mother_name=$20,spouse_name=$21,pan_number=$22,passport_num=$23,license_num=$24,aadhaar_num=$25,uan_num=$26,name_in_bank=$27,bank_name=$28,branch_name=$29,account_num=$30,ifsc_code=$31,del_flg=$32,rcre_user_id=$33,rcre_time=$34,lchg_user_id=$35,lchg_time=$36,entity_cre_flg=$37 where emp_id=$1",[empid,gender,dob,bgroup,shirt,commAdd,state,city,pincode,resAdd,state1,city1,pincode1,maritalstatus,mobNum,telNum,econNum,emerPer,fathersName,mothersName,spouseName,panNum,passNum,dlNum,aadhaarNum,uan,nameinBank,bankName,branchName,acctNum,ifscCode,'N',rcreuserid,rcretime,lchguserid,lchgtime,entity_cre_flg],function(err,done){
				if(err) throw err;

				pdbconnect.query("delete from emp_info_tbl_temp where emp_id=$1",[empid],function(err,done){
				if(err) throw err;

                                var smtpTransport = nodemailer.createTransport('SMTP',{
                                service: 'gmail',
                                auth:
                                {
                                          user: 'amber@nurture.co.in',
                                          pass: 'nurture@123'
                                }
                                });

                                var mailOptions = {
                                                        to: email,
                                                        from: 'amber@nurture.co.in',
                                                        subject: 'Verification Successful for your Personal Details Added/Modified.',
                                                        html:'<img src="http://www.helisconsulting.com/wp-content/uploads/2017/01/Employee-Verification_Helis-Conuslting.jpg" height="85"><br><br>' +
                                                        '<h3>Dear <b>' + empName + '</b>,<br><br>' +
                                                        'You are receiving this mail because HR has verified the Added/Modified Personal Details.<br>' +
                                                        'Please go through the system for affected changes.<br>' +
                                                        'In case of any Clarifications/Concern please contact HR .<br>' +
                                                        'URL: http://amber.nurture.co.in <br><br><br>' +
						        '- Regards,<br><br>Amber</h3>'	
                                                 };


                               smtpTransport.sendMail(mailOptions, function(err) {
                               });


				req.flash('success',"Employee Perssonal Details Verified sucessfully for the user:" + empid + ".")
				res.redirect('/employeeModule/employeeDetails/employeeApprovalDetails');
			
				});
				});
			}
			});
			});
		}
	}

	var test1 = req.body.test1;
	if(test1!="")
	{
		if(test1 == "Reject Profile")
		{
			
			var smtpTransport = nodemailer.createTransport('SMTP',{
			service: 'gmail',
			auth:
			{
				  user: 'amber@nurture.co.in',
				  pass: 'nurture@123'
			}
			});

			var mailOptions = {
						to: email,
						from: 'amber@nurture.co.in',
						subject: 'Rejection of Employee Personal Details Added/Modified.',
						html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF3AN6vk9aZnh5KQ_KPzHWYwlVWNNCxzAFK-994yO9WY6UwfiSIA" height="85"><br><br>' +
						'<h3> Dear <b>' + empName + '</b>,<br><br>' +
						'You are receiving this mail because HR has rejected the Added/Modified Employee Personal Details.<br>' +
						'Please Provide the supporting documents or contact HR for any clarifications on the same .<br>' +
						'Rejection Reason : <u>' + rejReason + '</u>.<br><br>' + 
						'URL: http://amber.nurture.co.in' + '<br><br><br>' +
					        '- Regards,<br><br>Amber</h3>'	
					 };


		       smtpTransport.sendMail(mailOptions, function(err) {
		      
		       });	


		req.flash('success',"Employee Personal Details has been Rejected sucessfully for Employee Id:" + empid + " and E-mail has been sent to." + email + "with further instructions.")
		res.redirect('/employeeModule/employeeDetails/employeeApprovalDetails');
	
		}
	}

	var test2 = req.body.test2;
	if(test2!="")
	{
		if(test2 == "Delete Profile")
		{
			var smtpTransport = nodemailer.createTransport('SMTP',{
			service: 'gmail',
			auth:
			{
				  user: 'amber@nurture.co.in',
				  pass: 'nurture@123'
			}
			});

                        var mailOptions = {
                                                to: email,
                                                from: 'amber@nurture.co.in',
						subject: 'Deletion of your Personal Details Added/Modified.',
                                                html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhnWZ-CQDkryjFGSvC7gHqaoaJyZFp4vGSfuPYR-nrz5IcC09ayQ" height="85"><br><br>' +
                                                '<h3> Dear <b>' + empName + '</b>,<br><br>' +
                                                'You are receiving this mail because HR has deleted the Added/Modified Employee Personal Details.<br>' +
						'Please make a new entry by Adding/Modifying the Personal Details.<br><br>' +
						'Deletion Reason :<u>' + deleteReason + '</u>.<br><br>' +
                                                'URL: http://amber.nurture.co.in' + '<br><br><br>' +
					        '- Regards,<br><br>Amber</h3>'	
                                         };


		       smtpTransport.sendMail(mailOptions, function(err) {
		       });

		       pdbconnect.query("delete from emp_info_tbl_temp where emp_id=$1",[empid],function(err,done){
		       if(err) throw err;

		       req.flash('success',"Employee Personal Details has been deleted sucessfully for the Employee Id:" + empid + " and E-mail has been sent to." + email + " with further instructions.")
		       res.redirect('/employeeModule/employeeDetails/employeeApprovalDetails');
		       });
		}
	}
		       
      });
}

/////////////////////////////// Saved Details /////////////////////////////////////////////////

router.get('/employeeSavedDetails',function(req,res)
{

	var empId = req.user.rows['0'].user_id;

	pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result)
	{
		emp_access=result.rows['0'].user_type;

		if(emp_access != "A1")
		{
			      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
		}
		else
		{

			pdbconnect.query("select emp_id,emp_name from data_emp_master_tbl_temp where entity_cre_flg='N' order by emp_id asc",function(err,done)
			{
				if(err) throw err;
				emp=done.rows;
				emp_count=done.rowCount;

				res.render('employeeModule/employeeSavedDetails',{
				emp_access:emp_access,
				ename:req.user.rows['0'].user_name,
				eid:req.user.rows['0'].user_id,
				emp:emp,
				emp_count:emp_count
										});
			});
		}
	});
});


router.post('/savedPen',savedPen);
function savedPen(req , res)
{
                var emp_id=req.body.empid;

                //query 1 to fetch professional details
                pdbconnect.query("select emp_id,emp_name,emp_email,emp_access,joining_date,designation,salary,reporting_mgr,emp_prob,prev_expr_year,prev_expr_month,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,pre_emp_flg,emp_classification from data_emp_master_tbl_temp where emp_id=$1",[emp_id],function(err,resultset){
                if (err) throw err;

                var empid=resultset.rows['0'].emp_id;
                var empName=resultset.rows['0'].emp_name;
                var email=resultset.rows['0'].emp_email;
                var empAccess=resultset.rows['0'].emp_access;
                var jDate=resultset.rows['0'].joining_date;
                var jDate=dateFormat(jDate,"yyyy-mm-dd");
                var desig=resultset.rows['0'].designation;
                var empClass=resultset.rows['0'].emp_classification;
                var salary=resultset.rows['0'].salary;
                var rptMan=resultset.rows['0'].reporting_mgr;
                var probPeriod=resultset.rows['0'].emp_prob;
                var preem=resultset.rows['0'].pre_emp_flg;
                var preExpyear=resultset.rows['0'].prev_expr_year;
                var preExpmonth=resultset.rows['0'].prev_expr_month;
                var preEmp=resultset.rows['0'].prev_empr;
                var preEmp2=resultset.rows['0'].prev_empr2;
                var preEmp3=resultset.rows['0'].prev_empr3;
                var preEmp4=resultset.rows['0'].prev_empr4;
                var preEmp5=resultset.rows['0'].prev_empr5;
                //query to select description of employee Access

                pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='ACC' and comm_code_id=$1",[empAccess],function(err,resultset){
                empAccess_desc=resultset.rows['0'].comm_code_desc;

                //query to fetch other Data from Table for employee Access

                pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'ACC' ",function(err,result){
                comm_code_empAccess=result.rows;
                comm_code_empAccess_count=result.rowCount;

                //query to select description of designation

                pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='DSG' and comm_code_id=$1",[desig],function(err,resultset){
                desig_desc=resultset.rows['0'].comm_code_desc;

                //query to fetch other Data from Table for designation

                pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'DSG' ",function(err,result){
                comm_code_desig=result.rows;
                comm_code_desig_count=result.rowCount;

                //query to fetch other Data from Table for reporting manager

                pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id =$1 order by emp_id",[rptMan],function(err,result){
                rptMan_desc=result.rows['0'].emp_name;

                //query to select employee id,employee name for reporting manager

                pdbconnect.query("SELECT emp_id,emp_name from emp_master_tbl where emp_id!=$1 order by emp_id",[empid],function(err,result){
                comm_code_rptMan=result.rows;
                comm_code_rptMan_count=result.rowCount;
                

                pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'CURR' ",function(err,result){
                sal_curr=result.rows;
                sal_curr_count=result.rowCount;

		res.render('employeeModule/employeeSavedprofessional',{
                empid:empid,
                empName:empName,
 		ename:req.user.rows['0'].user_name,
 		eid:req.user.rows['0'].user_id,
                email:email,
                empAccess:empAccess,
                empAccess_desc:empAccess_desc,
                comm_code_empAccess:comm_code_empAccess,
                comm_code_empAccess_count:comm_code_empAccess_count,
                jDate:jDate,
                desig:desig,
                desig_desc:desig_desc,
                comm_code_desig:comm_code_desig,
                comm_code_desig_count:comm_code_desig_count,
                empClass:empClass,
                salary:salary,
		sal_curr:sal_curr,
		sal_curr_count:sal_curr_count,
                rptMan:rptMan,
                rptMan_desc:rptMan_desc,
                probPeriod:probPeriod,
                preem:preem,
                comm_code_rptMan:comm_code_rptMan,
                comm_code_rptMan_count:comm_code_rptMan_count,
                preExpyear:preExpyear,
                preExpmonth:preExpmonth,
                preEmp:preEmp,
                preEmp2:preEmp2,
                preEmp3:preEmp3,
                preEmp4:preEmp4,
                preEmp5:preEmp5
                                                                                });
                                                                        });
                                                                });
                                                        });
                                                });
                                        });
                                });
                        });
            });
}

router.post('/verifySaved',verifySaved);
function verifySaved(req , res)
{
                var now = new Date();
                var rcreuserid=req.user.rows['0'].user_id;
                var rcretime=now;
                var lchguserid=req.user.rows['0'].user_id;
                var lchgtime=now;
                var empid=req.body.empid;
                var empname=req.body.empName;
                var email=req.body.email;
                var empaccess=req.body.empAccess;
                var jDate=req.body.jDate;
                var desig=req.body.desig;
                var empClass=req.body.empClass;
                var salary=req.body.salary;
                var rptman=req.body.rptMan;
                var probPeriod=req.body.probPeriod;
                var preem=req.body.preem;
                if(preem=="Y")
                {
                        var preExpyear=req.body.preExpyear;
                        var preExpmonth=req.body.preExpmonth;
                        var preEmp=req.body.preEmp;
                        var preEmp2=req.body.preEmp2;
                        var preEmp3=req.body.preEmp3;
                        var preEmp4=req.body.preEmp4;
                        var preEmp5=req.body.preEmp5;
                }
                else
                {
                        var preExpyear="0";
                        var preExpmonth="0";
                        var preEmp="";
                        var preEmp2="";
                        var preEmp3="";
                        var preEmp4="";
                        var preEmp5="";
                }

                var entity_cre_flg="Y";

		// added for e-docket

                var pan_flg="N";
                var aadhar_flg="N";
                var sslc_flg="N";
                var preuniv_flg="N";
                var degree_flg="N";
                var del_flg="N";


                pdbconnect.query("SELECT * from users u INNER JOIN emp_master_tbl e ON u.user_id=e.emp_id where LOWER(u.user_id) = LOWER($1)",
                              [empid],function(err,resultset){
                if(err) throw err;
                var rcount = resultset.rowCount;
                if(rcount == 0)
                {
                        pdbconnect.query("SELECT * from emp_master_tbl where emp_email=$1",[email],function(err,test){
                        if(err) throw err;
                        var emailcheck = test.rowCount;

                        if(emailcheck >= 1)
                        {
                                req.flash('error',"This Email-Id has already been registered with Amber:"+email)
                        	res.redirect('/employeeModule/employeeDetails/employeeSavedDetails');
                        }
                        else
                        {
                        pdbconnect.query("INSERT INTO emp_master_tbl(emp_id,emp_name,emp_access,emp_email,joining_date,designation,salary,reporting_mgr,prev_expr_year,prev_expr_month,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,emp_prob,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,entity_cre_flg,pre_emp_flg,emp_classification) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)",[empid,empname,empaccess,email,jDate,desig,salary,rptman,preExpyear,preExpmonth,preEmp,preEmp2,preEmp3,preEmp4,preEmp5,probPeriod,'N',rcreuserid,rcretime,lchguserid,lchgtime,entity_cre_flg,preem,empClass],function(err,done){
                        if(err) throw err;

                        var userid=req.body.empid;
                        var ranpass = generatePassword(4, false);
                        var finalpass =userid + "@" + ranpass;

                        var smtpTransport = nodemailer.createTransport('SMTP',{
                        service: 'gmail',
                        auth:
                        {
                                  user: 'amber@nurture.co.in',
                                  pass: 'nurture@123'
                        }
                        });
			
                        var mailOptions = {
                                                to: email,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Amber Portal account creation',
                                                html: '<img src="http://www.confessionsofareviewer.com/wp-content/uploads/2017/05/welcome-on-board.jpg" height="85"><br><br>' +
                                                '<h3>Dear <b>' + empname + '</b>,<br><br>' +
                                                'You are receiving this mail because you (or someone else) has registered in <b>Amber</b>.<br>' +
                                                'Please follow the below Account Activation details : <br><br>' +
                                                '<table style="border: 10px solid black;"><tr style="border: 10px solid black;"><th style="border: 10px solid black;">User Id</th><th style="border: 10px solid black;">' + empid + '</th></tr><tr style="border: 10px solid black;"><td style="border: 10px solid black;"> Password </td><td style="border: 10px solid black;">' + finalpass + '</td></tr></table><br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br>' +
                                                'Contact HR for any clarifications.<br>' +
                                                'Kindly do not share your password with anyone else.<br><br><br><br>' +
					        '- Regards,<br><br>Amber</h3>'	
                                         };


                       smtpTransport.sendMail(mailOptions, function(err) {
                       });

                       bcrypt.hash(finalpass,10,function(err,hash)
                       {

                                hashpassword=finalpass;
                                hashpassword=hash;


                                pdbconnect.query("INSERT INTO users(user_name,user_id,password,user_type,expiry_date,login_allowed,login_attempts,del_flag,login_check,reset_flg,session_id,client_ip) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",[empname,empid,hash,empaccess,'01-01-2099','Y','0','N','N','N','',''],function(err,done){
                                if (err) throw err;
                                });
                        });

			pdbconnect.query("delete from data_emp_master_tbl_temp where emp_id = $1",[empid],function(err,resultset){
			if(err) throw err;

			pdbconnect.query("insert into e_docket_tbl(emp_id,pan_flg,aadhar_flg,sslc_flg,preuniv_flg,degree_flg,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",[empid,pan_flg,aadhar_flg,sslc_flg,preuniv_flg,degree_flg,del_flg,rcreuserid,rcretime,lchguserid,lchgtime],function(err,done){
			if(err) throw err;

                        req.flash('success',"Employee Professional details sucessfully verified and an E-mail has been sent to " + email + " with further instructions.")
                        res.redirect('/employeeModule/employeeDetails/employeeSavedDetails');

                });
                });
                });
                }
                });
                }
                else
                {
                        req.flash('error',"Employee Details Already Added for this Employee:"+empname)
                        res.redirect('/employeeModule/employeeDetails/employeeSavedDetails');
                }

                });
                //For fetching Which Value on click of submit(if loop


}
/////////////////////////////// End of Employee Admin Module /////////////////////////////////////////////////

/////////////////////////////// start of Employee User Module /////////////////////////////////////////////////

//////////////////////////////////////////// Adding Employee Details ////////////////////////////////

router.get('/employeeAddpersonal',function(req,res)
{
		var empId = req.user.rows['0'].user_id;
		
		pdbconnect.query("SELECT * from emp_info_tbl where emp_id = $1",[empId],function(err,result){
                mtbl=result.rowCount;
		
		pdbconnect.query("SELECT * from emp_info_tbl_temp where emp_id = $1",[empId],function(err,result){
                ttbl=result.rowCount;
		
		pdbconnect.query("SELECT * from data_emp_info_tbl_temp where emp_id = $1",[empId],function(err,result){
                dtbl=result.rowCount;

		pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
                emp_access=result.rows['0'].user_type;

		if(emp_access == "A1")
		{
			      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
		}
		else
		{

		pdbconnect.query("SELECT emp_id from emp_master_tbl where emp_id = $1",[empId],function(err,result){
		empid=result.rows['0'].emp_id;
		
		pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id = $1",[empId],function(err,result){
		empName=result.rows['0'].emp_name;

                // to fetch blood group
                pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'BLG' order by comm_code_id asc",function(err,result){
                comm_code_blood=result.rows;
                comm_code_blood_count=result.rowCount;

                // to fetch shirt size
                pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'SHR' order by comm_code_id asc",function(err,result){
                comm_code_shirt=result.rows;
                comm_code_shirt_count=result.rowCount;

                // to fetch state group
                pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'STA' order by comm_code_id asc",function(err,result){
                comm_code_state=result.rows;
                comm_code_state_count=result.rowCount;

                // to fetch maritial status
                pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'MAR' order by comm_code_id asc",function(err,result){
                comm_code_maritalstatus=result.rows;
                comm_code_maritalstatus_count=result.rowCount;

		res.render('employeeModule/employeeAddpersonal',{
		mtbl:mtbl,
		ttbl:ttbl,
		dtbl:dtbl,
		emp_access:emp_access,
		ename:req.user.rows['0'].user_name,
		eid:req.user.rows['0'].user_id,
		empid:empid,
		empName:empName,
                comm_code_blood:comm_code_blood,
                comm_code_blood_count:comm_code_blood_count,
                comm_code_shirt:comm_code_shirt,
                comm_code_shirt_count:comm_code_shirt_count,
                comm_code_state:comm_code_state,
                comm_code_state_count:comm_code_state_count

                                                                   });
                    });
                });
           });
      });
});
});
}
});
});
});
});
});

router.post('/addempper',addempper);
function addempper (req , res)
{
        var now = new Date();
	var rcreuserid=req.user.rows['0'].user_id;
        var rcretime=now;
        var lchguserid=req.user.rows['0'].user_id;
        var lchgtime=now;
        var empid=req.body.empid
        var empName=req.body.empName
        var gender=req.body.gender
        var dob=req.body.dob
        var bgroup=req.body.bgroup
        var shirt=req.body.shirt
        var commAdd=req.body.commAdd
        var state=req.body.state
        var city=req.body.city
        var pincode=req.body.pincode
        var resAdd=req.body.resAdd
        var state1=req.body.state1
        var city1=req.body.city1
        var pincode1=req.body.pincode1
        var mobNum=req.body.mobNum
        var telNum=req.body.telNum
        var econNum=req.body.econNum
        var emerPer=req.body.emerPer
        var fathersName=req.body.fathersName
        var mothersName=req.body.mothersName
        var maritalstatus=req.body.maritalstatus
        var spouseName=req.body.spouseName
        var panNum=req.body.panNum
        var passNum=req.body.passNum
        var aadhaarNum=req.body.aadhaarNum
        var dlNum=req.body.dlNum
        var uan=req.body.uan
        var nameinBank=req.body.nameinBank
        var bankName=req.body.bankName
        var branchName=req.body.branchName
        var acctNum=req.body.acctNum
        var ifscCode=req.body.ifscCode
        var entity_cre_flg="N";

        pdbconnect.query("SELECT * from emp_info_tbl e where LOWER(e.emp_id) = LOWER($1)",
        [empid],function(err,resultset){
        if(err) throw err;
        var mcount = resultset.rowCount;

        pdbconnect.query("SELECT * from emp_info_tbl_temp e where LOWER(e.emp_id) = LOWER($1)",
        [empid],function(err,resultset){
        if(err) throw err;
        var tcount = resultset.rowCount;

        if(mcount == 0)
        {
                if(tcount == 0)
                {
                          pdbconnect.query("INSERT INTO emp_info_tbl_temp(emp_id,emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code,del_flg,entity_cre_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)",[empid,empName,gender,dob,bgroup,shirt,commAdd,state,city,pincode,resAdd,state1,city1,pincode1,maritalstatus,mobNum,telNum,econNum,emerPer,fathersName,mothersName,spouseName,panNum,passNum,dlNum,aadhaarNum,uan,nameinBank,bankName,branchName,acctNum,ifscCode,'N',entity_cre_flg,rcreuserid,rcretime,lchguserid,lchgtime],function(err,done)
                        {
                                if(err) throw err;
                        });
                        req.flash('success',"Personal Details Added sucessfully, Verification pending by Admin.")
                        res.redirect(req.get('referer'));


                }
                else
                {

                        req.flash('error',"Record Already Exists.")
                        res.redirect(req.get('referer'));

                }

        }
        else
        {
                if(tcount == 1)
                {
                        req.flash('error',"Record Already Exists.")
                        res.redirect(req.get('referer'));
                }
                else
                {

                        pdbconnect.query("INSERT INTO emp_info_tbl_temp(emp_id,emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code,del_flg,entity_cre_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)",[empid,empName,gender,dob,bgroup,shirt,commAdd,state,city,pincode,resAdd,state1,city1,pincode1,maritalstatus,mobNum,telNum,econNum,emerPer,fathersName,mothersName,spouseName,panNum,passNum,dlNum,aadhaarNum,uan,nameinBank,bankName,branchName,acctNum,ifscCode,'N',entity_cre_flg,rcreuserid,rcretime,lchguserid,lchgtime],function(err,done)
                        {
                                if(err) throw err;
                        });
                        req.flash('success',"Personal Details Added sucessfully, Verification pending by Admin.")
                        res.redirect(req.get('referer'));
                }


        }
                });
        });
};

//////////////////////////// View Only User Details Self ///////////////////


router.get('/employeeDetailsViewUser',function(req,res)
{

        var emp_id=req.user.rows['0'].user_id;

        var empId = req.user.rows['0'].user_id;

	pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
	emp_access=result.rows['0'].user_type;

        if(emp_access == "A1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {

		pdbconnect.query("SELECT * from emp_master_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,check){
		rcount_master=check.rowCount;

		pdbconnect.query("SELECT * from emp_info_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,test){
		rcount_info=test.rowCount;

		pdbconnect.query("SELECT * from emp_info_tbl_temp where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,test){
		var flag=test.rowCount;

		pdbconnect.query("SELECT * from emp_info_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,main){
		var mflag=main.rowCount;

		if(flag == 1)
		{
			var enFlg="N";
		}

		if(mflag == 1)
		{
			var enFlg="Y";
		}

		if(flag == mflag)
		{
			var enFlg="N";
		}

		if(rcount_master == rcount_info)
		{

			//query 1 to fetch professional details
			pdbconnect.query("select emp_id,emp_name,emp_email,emp_access,joining_date,designation,salary,reporting_mgr,emp_prob,prev_expr_year,prev_expr_month,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,pre_emp_flg,emp_classification,salary_curr from emp_master_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,resultset){
			if (err) throw err;
			var empid=resultset.rows['0'].emp_id;
			var empName=resultset.rows['0'].emp_name;
			var email=resultset.rows['0'].emp_email;
			var empAccess=resultset.rows['0'].emp_access;
			var jDate=resultset.rows['0'].joining_date;
			var jDate=dateFormat(jDate,"yyyy-mm-dd");
			var desig=resultset.rows['0'].designation;
			var empClass=resultset.rows['0'].emp_classification;
			var salary=resultset.rows['0'].salary;
			var salary_curr=resultset.rows['0'].salary_curr;
			var rptMan=resultset.rows['0'].reporting_mgr;
			var probPeriod=resultset.rows['0'].emp_prob;
			var preem=resultset.rows['0'].pre_emp_flg;
			var preExpyear=resultset.rows['0'].prev_expr_year;
			var preExpmonth=resultset.rows['0'].prev_expr_month;
			var preEmp=resultset.rows['0'].prev_empr;
			var preEmp2=resultset.rows['0'].prev_empr2;
			var preEmp3=resultset.rows['0'].prev_empr3;
			var preEmp4=resultset.rows['0'].prev_empr4;
			var preEmp5=resultset.rows['0'].prev_empr5;

			pdbconnect.query("select * from project_alloc_tbl where emp_id = $1",[empid],function(err,resultset){
			if (err) throw err;
			pidcount=resultset.rowCount;

			if(pidcount > 1 )
			{
				var pid = "MULTIPLE";

			}

			if(pidcount == 1)
			{
				pdbconnect.query("select project_id from project_alloc_tbl where emp_id = $1",[empid],function(err,resultset){
				if (err) throw err;
				pid=resultset.rows['0'].project_id;

				});
			}

			if(pidcount == 0)
			{
				var pid="Not Allocated";

			}

			//query 2 to fetch personal details
			pdbconnect.query("select gender,dob,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,phone1,phone2,father_name,mother_name,martial_status,spouse_name,pan_number,passport_num,aadhaar_num,license_num,blood_group,shirt_size,emergency_num,emergency_con_person,pincode,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code from emp_info_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,result){
			if (err) throw err;
			var gender=result.rows['0'].gender;
			var dob=result.rows['0'].dob;
			var dob=dateFormat(dob,"yyyy-mm-dd");
			var bgroup=result.rows['0'].blood_group;
			var shirt=result.rows['0'].shirt_size;
			var commAdd=result.rows['0'].comm_addr1;
			var state=result.rows['0'].state;
			var city=result.rows['0'].city;
			var pincode=result.rows['0'].pincode;
			var resAdd=result.rows['0'].comm_addr2;
			var state1=result.rows['0'].state1;
			var city1=result.rows['0'].city1;
			var pincode1=result.rows['0'].pincode1;
			var mobNum=result.rows['0'].phone1;
			var telNum=result.rows['0'].phone2;
			var econNum=result.rows['0'].emergency_num;
			var emerPer=result.rows['0'].emergency_con_person;
			var fathersName=result.rows['0'].father_name;
			var mothersName=result.rows['0'].mother_name;
			var maritalstatus=result.rows['0'].martial_status;
			var spouseName=result.rows['0'].spouse_name;
			var panNum=result.rows['0'].pan_number;
			var passNum=result.rows['0'].passport_num;
			var aadhaarNum=result.rows['0'].aadhaar_num;
			var dlNum=result.rows['0'].license_num;
			var uan=result.rows['0'].uan_num;
			var nameinBank=result.rows['0'].name_in_bank;
			var bankName=result.rows['0'].bank_name;
			var branchName=result.rows['0'].branch_name;
			var acctNum=result.rows['0'].account_num;
			var ifscCode=result.rows['0'].ifsc_code;

			//Setting Values for designation List

			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='ACC' and comm_code_id=$1",[empAccess],function(err,resultset){
			empAccess=resultset.rows['0'].comm_code_desc;

			//Setting Values for designation List

			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='DSG' and comm_code_id=$1",[desig],function(err,resultset){
			desig=resultset.rows['0'].comm_code_desc;

			//Setting Values for Marriage List

			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='MAR' and comm_code_id=$1",[maritalstatus],function(err,resultset){
			maritalstatus=resultset.rows['0'].comm_code_desc;

			//Setting Values for Gender List

			if(gender == "M"){gender = "Male";}
			if(gender == "F"){gender = "Female";}

			//Setting Values for Probation Period
			if(probPeriod == "Y"){probPeriod = "YES";}
			if(probPeriod == "N"){probPeriod = "NO";}


			//Setting Values for Previous experience 
			if(preem == "Y"){preem = "YES";}
			if(preem == "N"){preem = "NO";}

			//Setting Values for Shirt List

			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='BLG' and comm_code_id=$1",[bgroup],function(err,resultset){
			bgroup=resultset.rows['0'].comm_code_desc;

			//Setting Values for Shirt List

			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='SHR' and comm_code_id=$1",[shirt],function(err,resultset){
			shirt=resultset.rows['0'].comm_code_desc;

			//Setting Values for State List

			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='STA' and comm_code_id=$1",[state],function(err,resultset){
			state=resultset.rows['0'].comm_code_desc;

			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='STA' and comm_code_id=$1",[state1],function(err,resultset){
			state1=resultset.rows['0'].comm_code_desc;
		
			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id=$1",[rptMan],function(err,result){
			rptMan_desc=result.rows['0'].emp_name;
			
			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='CURR' and comm_code_id=$1",[salary_curr],function(err,resultset){
			salary_curr_desc=resultset.rows['0'].comm_code_desc;

			res.render('employeeModule/employeeDetailsViewUser',{
					emp_access:emp_access,
					enFlg:enFlg,
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
					empid:empid,
					empName:empName,
					email:email,
					empAccess:empAccess,
					jDate:jDate,
					desig:desig,
					empClass:empClass,
					salary:salary,
					salary_curr:salary_curr,
					salary_curr_desc:salary_curr_desc,
					pid:pid,
					rptMan:rptMan,
					rptMan_desc:rptMan_desc,
					probPeriod:probPeriod,
					preem:preem,
					preExpyear:preExpyear,
					preExpmonth:preExpmonth,
					preEmp:preEmp,
					preEmp2:preEmp2,
					preEmp3:preEmp3,
					preEmp4:preEmp4,
					preEmp5:preEmp5,
					gender:gender,
					dob:dob,
					bgroup:bgroup,
					shirt:shirt,
					commAdd:commAdd,
					state:state,
					city:city,
					pincode:pincode,
					resAdd:resAdd,
					state1:state1,
					city1:city1,
					pincode1:pincode1,
					mobNum:mobNum,
					telNum:telNum,
					econNum:econNum,
					emerPer:emerPer,
					fathersName:fathersName,
					mothersName:mothersName,
					maritalstatus:maritalstatus,
					spouseName:spouseName,
					panNum:panNum,
					passNum:passNum,
					aadhaarNum:aadhaarNum,
					dlNum:dlNum,
					uan:uan,
					nameinBank:nameinBank,
					bankName:bankName,
					branchName:branchName,
					acctNum:acctNum,
					ifscCode:ifscCode
										});
									});
								});
							});
						});
						});
					});
				});
			});
		});
		});
		});
		});
		//closing of if loop
		}
		else
		{
			var gender="";
			var dob="";
			var bgroup="";
			var shirt="";
			var commAdd="";
			var state="";
			var city="";
			var pincode="";
			var resAdd="";
			var state1="";
			var city1="";
			var pincode1="";
			var mobNum="";
			var telNum="";
			var econNum="";
			var emerPer="";
			var fathersName="";
			var mothersName="";
			var maritalstatus="";
			var spouseName="";
			var panNum="";
			var passNum="";
			var aadhaarNum="";
			var dlNum="";
			var uan="";
			var nameinBank="";
			var bankName="";
			var branchName="";
			var acctNum="";
			var ifscCode="";


			//query 1 to fetch professional details
			pdbconnect.query("select emp_id,emp_name,emp_email,emp_access,joining_date,designation,salary,project_id,reporting_mgr,emp_prob,prev_expr_year,prev_expr_month,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,pre_emp_flg,emp_classification,salary_curr from emp_master_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,resultset){
			if (err) throw err;
			var empid=resultset.rows['0'].emp_id;
			var empName=resultset.rows['0'].emp_name;
			var email=resultset.rows['0'].emp_email;
			var empAccess=resultset.rows['0'].emp_access;
			var jDate=resultset.rows['0'].joining_date;
			var jDate=dateFormat(jDate,"yyyy-mm-dd");
			var desig=resultset.rows['0'].designation;
			var empClass=resultset.rows['0'].emp_classification;
			var salary=resultset.rows['0'].salary;
			var salary_curr=resultset.rows['0'].salary_curr;
			var rptMan=resultset.rows['0'].reporting_mgr;
			var probPeriod=resultset.rows['0'].emp_prob;
			var preem=resultset.rows['0'].pre_emp_flg;
			var preExpyear=resultset.rows['0'].prev_expr_year;
			var preExpmonth=resultset.rows['0'].prev_expr_month;
			var preEmp=resultset.rows['0'].prev_empr;
			var preEmp2=resultset.rows['0'].prev_empr2;
			var preEmp3=resultset.rows['0'].prev_empr3;
			var preEmp4=resultset.rows['0'].prev_empr4;
			var preEmp5=resultset.rows['0'].prev_empr5;
			

			pdbconnect.query("select * from project_alloc_tbl where emp_id = $1",[empid],function(err,resultset){
			if (err) throw err;
			pidcount=resultset.rowCount;

			if(pidcount > 1 )
			{
				var pid = "MULTIPLE";

			}

			if(pidcount == 1)
			{
				pdbconnect.query("select project_id from project_alloc_tbl where emp_id = $1",[empid],function(err,resultset){
				if (err) throw err;
				pid=resultset.rows['0'].project_id;

				});
			}

			if(pidcount == 0)
			{
				var pid="Not Allocated";
			}

			//Setting Values for designation List

			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='ACC' and comm_code_id=$1",[empAccess],function(err,resultset){
			empAccess=resultset.rows['0'].comm_code_desc;

			//Setting Values for designation List

			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='DSG' and comm_code_id=$1",[desig],function(err,resultset){
			desig=resultset.rows['0'].comm_code_desc;

			//Setting Values for Gender List

			if(gender == "M"){gender = "Male";}
			if(gender == "F"){gender = "Female";}

			//Setting Values for Probation Period

			if(probPeriod == "Y"){probPeriod = "YES";}
			if(probPeriod == "N"){probPeriod = "NO";}
			
			//Setting Values for pre_emp_flg

			if(preem == "Y"){preem = "YES";}
			if(preem == "N"){preem = "NO";}
			
			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id=$1",[rptMan],function(err,result){
			rptMan_desc=result.rows['0'].emp_name;
			
			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='CURR' and comm_code_id=$1",[salary_curr],function(err,resultset){
			salary_curr_desc=resultset.rows['0'].comm_code_desc;

				res.render('employeeModule/employeeDetailsViewUser',{
				emp_access:emp_access,
				enFlg:enFlg,
				ename:req.user.rows['0'].user_name,
				eid:req.user.rows['0'].user_id,
				empid:empid,
				empName:empName,
				email:email,
				empAccess:empAccess,
				jDate:jDate,
				desig:desig,
				empClass:empClass,
				salary:salary,
				salary_curr:salary_curr,
				salary_curr_desc:salary_curr_desc,
				pid:pid,
				rptMan:rptMan,
				rptMan_desc:rptMan_desc,
				probPeriod:probPeriod,
				preem:preem,
				preExpyear:preExpyear,
				preExpmonth:preExpmonth,
				preEmp:preEmp,
				preEmp2:preEmp2,
				preEmp3:preEmp3,
				preEmp4:preEmp4,
				preEmp5:preEmp5,
				gender:gender,
				dob:dob,
				bgroup:bgroup,
				shirt:shirt,
				commAdd:commAdd,
				state:state,
				city:city,
				pincode:pincode,
				resAdd:resAdd,
				state1:state1,
				city1:city1,
				pincode1:pincode1,
				mobNum:mobNum,
				telNum:telNum,
				econNum:econNum,
				emerPer:emerPer,
				fathersName:fathersName,
				mothersName:mothersName,
				maritalstatus:maritalstatus,
				spouseName:spouseName,
				panNum:panNum,
				passNum:passNum,
				aadhaarNum:aadhaarNum,
				dlNum:dlNum,
				uan:uan,
				nameinBank:nameinBank,
				bankName:bankName,
				branchName:branchName,
				acctNum:acctNum,
				ifscCode:ifscCode
			});
			});
			});
			});
			});
			});
			});
			}
			});
			});
			});
			});
			}
			});
});

/////////////////// Modify Details ////////
router.get('/employeePersonalMod',function(req,res)
{
                var empid=req.user.rows['0'].user_id;

		var empId = req.user.rows['0'].user_id;

		pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
		emp_access=result.rows['0'].user_type;

		if(emp_access == "A1")
		{
			      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
		}
		else
		{

                pdbconnect.query("select * from emp_info_tbl where emp_id = $1",[empid],function(err,resultset){
                if(err) throw err;
                var mcount = resultset.rowCount;
                if(mcount == 0)
                {
                        req.flash('error',"Record does not exist / Or Verification pending by Admin.")
                        res.redirect(req.get('referer'));
                }
                else
                {
                        pdbconnect.query("select * from emp_info_tbl_temp where emp_id = $1",[empid],function(err,result){
                        var tcount = result.rowCount;
                        if(err) throw err;
                        if(tcount == 1)
                        {
                                req.flash('error',"Verification pending by Admin")
                                res.redirect(req.get('referer'));
                        }
                        else
                        {

                        pdbconnect.query("select emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code from emp_info_tbl e where e.emp_id = $1",[empid],function(err,result){
                        if(err) throw err;

                        var empName=result.rows['0'].emp_name;
                        var gender=result.rows['0'].gender;
                        var dob=result.rows['0'].dob;
			var dob=dateFormat(dob,"yyyy-mm-dd");
                        var bgroup=result.rows['0'].blood_group;
                        var shirt=result.rows['0'].shirt_size;
                        var commAdd=result.rows['0'].comm_addr1;
                        var state=result.rows['0'].state;
                        var city=result.rows['0'].city;
                        var pincode=result.rows['0'].pincode;
                        var resAdd=result.rows['0'].comm_addr2;
                        var state1=result.rows['0'].state1;
                        var city1=result.rows['0'].city1;
                        var pincode1=result.rows['0'].pincode1;
                        var mobNum=result.rows['0'].phone1;
                        var telNum=result.rows['0'].phone2;
                        var econNum=result.rows['0'].emergency_num;
                        var emerPer=result.rows['0'].emergency_con_person;
                        var fathersName=result.rows['0'].father_name;
                        var mothersName=result.rows['0'].mother_name;
                        var maritalstatus=result.rows['0'].martial_status;
                        var spouseName=result.rows['0'].spouse_name;
                        var panNum=result.rows['0'].pan_number;
                        var passNum=result.rows['0'].passport_num;
                        var aadhaarNum=result.rows['0'].aadhaar_num;
                        var dlNum=result.rows['0'].license_num;
                        var uan=result.rows['0'].uan_num;
                        var nameinBank=result.rows['0'].name_in_bank;
                        var bankName=result.rows['0'].bank_name;
                        var branchName=result.rows['0'].branch_name;
                        var acctNum=result.rows['0'].account_num;
                        var ifscCode=result.rows['0'].ifsc_code;

                        //query to select description of blood

                        pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='BLG' and comm_code_id=$1",[bgroup],function(err,resultset){
                        blood_desc=resultset.rows['0'].comm_code_desc;

                        //query to fetch other Data from Table

                        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'BLG' ",function(err,result){
                        comm_code_blood=result.rows;
                        comm_code_blood_count=result.rowCount;

                        //query to select shirt desc from common table

                        pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='SHR' and comm_code_id=$1",[shirt],function(err,resultset){
                        shirt_desc=resultset.rows['0'].comm_code_desc;

                        //query to fetch other data related to shirt

                        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'SHR' ",function(err,result){
                        comm_code_shirt=result.rows;
                        comm_code_shirt_count=result.rowCount;

                        //query to select state desc from common table

                        pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='STA' and comm_code_id=$1",[state],function(err,resultset){
                        state_desc=resultset.rows['0'].comm_code_desc;

                        //query to fetch other data related to state

                        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'STA' ",function(err,result){
                        comm_code_state=result.rows;
                        comm_code_state_count=result.rowCount;

                        //query to select state desc from common table

                        pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='STA' and comm_code_id=$1",[state1],function(err,resultset){
                        state_desc1=resultset.rows['0'].comm_code_desc;

                        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'STA' ",function(err,result){
                        comm_code_state1=result.rows;
                        comm_code_state_count1=result.rowCount;

                        pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='MAR' and comm_code_id=$1",[maritalstatus],function(err,resultset){
                        maritalstatus_desc=resultset.rows['0'].comm_code_desc;

                        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'MAR' ",function(err,result){
                        comm_code_maritalstatus=result.rows;
                        comm_code_maritalstatus_count=result.rowCount;

                                res.render('employeeModule/employeePersonalMod',{
				emp_access:emp_access,
				ename:req.user.rows['0'].user_name,
        			eid:req.user.rows['0'].user_id,
                                empid:empid,
                                empName:empName,
                                gender:gender,
                                dob:dob,
                                bgroup:bgroup,
                                blood_desc:blood_desc,
                                comm_code_blood:comm_code_blood,
                                comm_code_blood_count:comm_code_blood_count,
                                shirt:shirt,
                                shirt_desc:shirt_desc,
                                comm_code_shirt:comm_code_shirt,
                                commAdd:commAdd,
                                state:state,
                                state_desc:state_desc,
                                comm_code_state:comm_code_state,
                                comm_code_state_count:comm_code_state_count,
                                city:city,
                                pincode:pincode,
                                resAdd:resAdd,
                                state1:state1,
                                state_desc1:state_desc1,
                                comm_code_state1:comm_code_state1,
                                comm_code_state_count1:comm_code_state_count1,
                                city1:city1,
                                pincode1:pincode1,
                                mobNum:mobNum,
                                telNum:telNum,
                                econNum:econNum,
                                emerPer:emerPer,
                                fathersName:fathersName,
                                mothersName:mothersName,
                                maritalstatus:maritalstatus,
                                maritalstatus_desc:maritalstatus_desc,
                                comm_code_maritalstatus:comm_code_maritalstatus,
                                comm_code_maritalstatus_count:comm_code_maritalstatus_count,
                                spouseName:spouseName,
                                panNum:panNum,
                                passNum:passNum,
                                aadhaarNum:aadhaarNum,
                                dlNum:dlNum,
                                uan:uan,
                                nameinBank:nameinBank,
                                bankName:bankName,
                                branchName:branchName,
                                acctNum:acctNum,
                                ifscCode:ifscCode

});
});
});
});
});
});
});
});
});
});
});
});
}
});
}
});
}
});
});

router.post('/addmodempdetper',addmodempdetper);
function addmodempdetper(req , res)
{
        var now = new Date();
        var rcreuserid=req.body.empid;
        var rcretime=now;
        var lchguserid=req.body.empid;
        var lchgtime=now;
        var empid=req.body.empid;
        var empName=req.body.empName;
        var gender=req.body.gender;
        var dob=req.body.dob;
        var bgroup=req.body.bgroup;
        var shirt=req.body.shirt;
        var commAdd=req.body.commAdd;
        var state=req.body.state;
        var city=req.body.city;
        var pincode=req.body.pincode;
        var resAdd=req.body.resAdd;
        var state1=req.body.state1;
        var city1=req.body.city1;
        var pincode1=req.body.pincode1;
        var mobNum=req.body.mobNum;
        var telNum=req.body.telNum;
        var econNum=req.body.econNum;
        var emerPer=req.body.emerPer;
        var fathersName=req.body.fathersName;
        var mothersName=req.body.mothersName;
        var maritalstatus=req.body.maritalstatus;
        var spouseName=req.body.spouseName;
        var panNum=req.body.panNum;
        var passNum=req.body.passNum;
        var aadhaarNum=req.body.aadhaarNum;
        var dlNum=req.body.dlNum;
        var uan=req.body.uan;
        var nameinBank=req.body.nameinBank;
        var bankName=req.body.bankName;
        var branchName=req.body.branchName;
        var acctNum=req.body.acctNum;
        var ifscCode=req.body.ifscCode;
        var entity_cre_flg="N";

                        pdbconnect.query("INSERT INTO emp_info_tbl_temp(emp_id,emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code,del_flg,entity_cre_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)",[empid,empName,gender,dob,bgroup,shirt,commAdd,state,city,pincode,resAdd,state1,city1,pincode1,maritalstatus,mobNum,telNum,econNum,emerPer,fathersName,mothersName,spouseName,panNum,passNum,dlNum,aadhaarNum,uan,nameinBank,bankName,branchName,acctNum,ifscCode,'N',entity_cre_flg,rcreuserid,rcretime,lchguserid,lchgtime],function(err,done)
                        {
                                if(err) throw err;
                                req.flash('success',"Employee Personal Details has been modified sucessfully, Verification Pending By Admin.")
                                res.redirect('/employeeModule/employeeDetails/employeeDetailsViewUser');
                        });
};

//////////////////////////////////////////////////////// Verify for migrated details ///////////////////////////////////

router.get('/migApprovalDetails',function(req,res)
{

        var empId = req.user.rows['0'].user_id;

        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        emp_access=result.rows['0'].user_type;

        if(emp_access != "A1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {

		pdbconnect.query("select emp_id,emp_name from data_emp_info_tbl_temp where entity_cre_flg='N' order by emp_id asc",function(err,done){
		if(err) throw err;
		emp=done.rows;
		emp_count=done.rowCount;

		res.render('employeeModule/migApprovalDetails',{
		emp_access:emp_access,
		ename:req.user.rows['0'].user_name,
		eid:req.user.rows['0'].user_id,
		emp:emp,
		emp_count:emp_count

	      						       });
	   			});
	}
	});
});


router.post('/migrPen',migrPen);
function migrPen(req , res)
{
                var empid=req.body.empid;

                pdbconnect.query("select * from emp_master_tbl e where e.emp_id = $1 and entity_cre_flg = 'Y'",[empid],function(err,result){
                if(err) throw err;
                var rcount = result.rowCount;
		
		if(rcount == 1)
		{
			pdbconnect.query("select emp_name from emp_master_tbl e where e.emp_id = $1",[empid],function(err,result){
			if(err) throw err;
			var empName = result.rows['0'].emp_name;
			
			pdbconnect.query("select gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code from data_emp_info_tbl_temp e where e.emp_id = $1",[empid],function(err,result){
			if(err) throw err;

			var gender=result.rows['0'].gender;
			var dob=result.rows['0'].dob;
			var dob=dateFormat(dob,"yyyy-mm-dd");
			var bgroup=result.rows['0'].blood_group;
			var shirt=result.rows['0'].shirt_size;
			var commAdd=result.rows['0'].comm_addr1;
			var state=result.rows['0'].state;
			var city=result.rows['0'].city;
			var pincode=result.rows['0'].pincode;
			var resAdd=result.rows['0'].comm_addr2;
			var state1=result.rows['0'].state1;
			var city1=result.rows['0'].city1;
			var pincode1=result.rows['0'].pincode1;
			var mobNum=result.rows['0'].phone1;
			var telNum=result.rows['0'].phone2;
			var econNum=result.rows['0'].emergency_num;
			var emerPer=result.rows['0'].emergency_con_person;
			var fathersName=result.rows['0'].father_name;
			var mothersName=result.rows['0'].mother_name;
			var maritalstatus=result.rows['0'].martial_status;
			var spouseName=result.rows['0'].spouse_name;
			var panNum=result.rows['0'].pan_number;
			var passNum=result.rows['0'].passport_num;
			var aadhaarNum=result.rows['0'].aadhaar_num;
			var dlNum=result.rows['0'].license_num;
			var uan=result.rows['0'].uan_num;
			var nameinBank=result.rows['0'].name_in_bank;
			var bankName=result.rows['0'].bank_name;
			var branchName=result.rows['0'].branch_name;
			var acctNum=result.rows['0'].account_num;
			var ifscCode=result.rows['0'].ifsc_code;

			//query to select description of blood

			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='BLG' and comm_code_id=$1",[bgroup],function(err,resultset){
			blood_desc=resultset.rows['0'].comm_code_desc;

			//query to fetch other Data from Table

			pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'BLG' ",function(err,result){
			comm_code_blood=result.rows;
			comm_code_blood_count=result.rowCount;

			//query to select shirt desc from common table

			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='SHR' and comm_code_id=$1",[shirt],function(err,resultset){
			shirt_desc=resultset.rows['0'].comm_code_desc;

			//query to fetch other data related to shirt

			pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'SHR' ",function(err,result){
			comm_code_shirt=result.rows;
			comm_code_shirt_count=result.rowCount;

			//query to select state desc from common table

			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='STA' and comm_code_id=$1",[state],function(err,resultset){
			state_desc=resultset.rows['0'].comm_code_desc;

			//query to fetch other data related to state

			pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'STA' ",function(err,result){
			comm_code_state=result.rows;
			comm_code_state_count=result.rowCount;

			//query to select state desc from common table

			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='STA' and comm_code_id=$1",[state1],function(err,resultset){
			state_desc1=resultset.rows['0'].comm_code_desc;

			pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'STA' ",function(err,result){
			comm_code_state1=result.rows;
			comm_code_state_count1=result.rowCount;

			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='MAR' and comm_code_id=$1",[maritalstatus],function(err,resultset){
			maritalstatus_desc=resultset.rows['0'].comm_code_desc;

			pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'MAR' ",function(err,result){
			comm_code_maritalstatus=result.rows;
			comm_code_maritalstatus_count=result.rowCount;

			res.render('employeeModule/migVerifyPersonalDetails',{
			empid:empid,
			empName:empName,
			ename:req.user.rows['0'].user_name,
        		eid:req.user.rows['0'].user_id,
			gender:gender,
			dob:dob,
			bgroup:bgroup,
			blood_desc:blood_desc,
			comm_code_blood:comm_code_blood,
			comm_code_blood_count:comm_code_blood_count,
			shirt:shirt,
			shirt_desc:shirt_desc,
			comm_code_shirt:comm_code_shirt,
			commAdd:commAdd,
			state:state,
			state_desc:state_desc,
			comm_code_state:comm_code_state,
			comm_code_state_count:comm_code_state_count,
			city:city,
			pincode:pincode,
			resAdd:resAdd,
			state1:state1,
			state_desc1:state_desc1,
			comm_code_state1:comm_code_state1,
			comm_code_state_count1:comm_code_state_count1,
			city1:city1,
			pincode1:pincode1,
			mobNum:mobNum,
			telNum:telNum,
			econNum:econNum,
			emerPer:emerPer,
			fathersName:fathersName,
			mothersName:mothersName,
			maritalstatus:maritalstatus,
			maritalstatus_desc:maritalstatus_desc,
			comm_code_maritalstatus:comm_code_maritalstatus,
			comm_code_maritalstatus_count:comm_code_maritalstatus_count,
			spouseName:spouseName,
			panNum:panNum,
			passNum:passNum,
			aadhaarNum:aadhaarNum,
			dlNum:dlNum,
			uan:uan,
			nameinBank:nameinBank,
			bankName:bankName,
			branchName:branchName,
			acctNum:acctNum,
			ifscCode:ifscCode
			});
			});
			});
			});
			});
			});
			});
			});
			});
			});
			});
			});
			});
			}
			else
			{
				req.flash('error',"Record does not exist / Verification is Pending for this Employee : " + empid + ". by Admin")
				res.redirect('/employeeModule/employeeDetails/migApprovalDetails');
			}
			});

}

router.post('/vermigper',vermigper);
function vermigper(req , res)
{
        var now = new Date();
        var rcreuserid=req.user.rows['0'].user_id;
        var rcretime=now;
        var lchguserid=req.user.rows['0'].user_id;
        var lchgtime=now;
        var empid=req.body.empid;
        var empName=req.body.empName;
        var gender=req.body.gender;
        var dob=req.body.dob;
        var bgroup=req.body.bgroup;
        var shirt=req.body.shirt;
        var commAdd=req.body.commAdd;
        var state=req.body.state;
        var city=req.body.city;
        var pincode=req.body.pincode;
        var resAdd=req.body.resAdd;
        var state1=req.body.state1;
        var city1=req.body.city1;
        var pincode1=req.body.pincode1;
        var mobNum=req.body.mobNum;
        var telNum=req.body.telNum;
        var econNum=req.body.econNum;
        var emerPer=req.body.emerPer;
        var fathersName=req.body.fathersName;
        var mothersName=req.body.mothersName;
        var maritalstatus=req.body.maritalstatus;
        var spouseName=req.body.spouseName;
        var panNum=req.body.panNum;
        var passNum=req.body.passNum;
        var aadhaarNum=req.body.aadhaarNum;
        var dlNum=req.body.dlNum;
        var uan=req.body.uan;
        var nameinBank=req.body.nameinBank;
        var bankName=req.body.bankName;
        var branchName=req.body.branchName;
        var acctNum=req.body.acctNum;
        var ifscCode=req.body.ifscCode;
        var entity_cre_flg="Y";

	pdbconnect.query("INSERT INTO emp_info_tbl(emp_id,emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code,del_flg,entity_cre_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)",[empid,empName,gender,dob,bgroup,shirt,commAdd,state,city,pincode,resAdd,state1,city1,pincode1,maritalstatus,mobNum,telNum,econNum,emerPer,fathersName,mothersName,spouseName,panNum,passNum,dlNum,aadhaarNum,uan,nameinBank,bankName,branchName,acctNum,ifscCode,'N',entity_cre_flg,rcreuserid,rcretime,lchguserid,lchgtime],function(err,done)
	{
		if(err) throw err;
		pdbconnect.query("delete from data_emp_info_tbl_temp where emp_id = $1",[empid],function(err,done){

		req.flash('success',"Personal Details Verified sucessfully for Employee Id : " + empid + " Employee Name" + empName + ".")
		res.redirect('/employeeModule/employeeDetails/migApprovalDetails');
	});
	});
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////// Employee FAQ Details ////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/employeeFAQDetails',employeeFAQDetails);
function employeeFAQDetails(req,res)
{
	var emp_id =req.user.rows[0].user_id;
	var emp_name =req.user.rows[0].user_name;
	var emp_access =req.user.rows[0].user_type;

  	res.render('employeeModule/employeeFAQDetails',{
        emp_id:emp_id,
        emp_name:emp_name,
   	emp_access:emp_access
	});
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////// View to finance Team /////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/employeeDetailsViewFin',function(req,res)
{
        var empId = req.user.rows['0'].user_id;

        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        emp_access=result.rows['0'].user_type;

        if(emp_access != "F1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {

                var empid="";
                var empName="";
                var email="";
                var empAccess="";
                var jDate="";
                var desig="";
                var empClass="";
                var salary="";
                var pid="";
                var rptMan="";
                var rptMan_desc="";
                var probPeriod="";
                var preem="";
                var preExpyear="";
                var preExpmonth="";
                var preEmp="";
                var preEmp2="";
                var preEmp3="";
                var preEmp4="";
                var preEmp5="";
                var gender="";
                var dob="";
                var bgroup="";
                var shirt="";
                var commAdd="";
                var state="";
                var city="";
                var pincode="";
                var resAdd="";
                var state1="";
                var city1="";
                var pincode1="";
                var mobNum="";
                var telNum="";
                var econNum="";
                var emerPer="";
                var fathersName="";
                var mothersName="";
                var maritalstatus="";
                var spouseName="";
                var panNum="";
                var passNum="";
                var aadhaarNum="";
                var dlNum="";
                var uan="";
                var nameinBank="";
                var bankName="";
                var branchName="";
                var acctNum="";
                var ifscCode="";
                var enFlg="";
                var cflag="";
                pdbconnect.query("SELECT emp_id from emp_master_tbl order by emp_id asc",function(err,result){
                employee=result.rows;
                emp_id_count=result.rowCount;

                pdbconnect.query("SELECT emp_name from emp_master_tbl order by emp_id asc",function(err,result){
                empname=result.rows;
                empname_count=result.rowCount;

                res.render('employeeModule/employeeDetailsViewFin',{
                                emp_access:emp_access,
                                ename:req.user.rows['0'].user_name,
                                eid:req.user.rows['0'].user_id,
                                employee:employee,
                                emp_id_count:emp_id_count,
                                empname:empname,
                                empid:empid,
                                empName:empName,
                                email:email,
                                empAccess:empAccess,
                                jDate:jDate,
                                desig:desig,
                                empClass:empClass,
                                salary:salary,
                                pid:pid,
                                rptMan:rptMan,
                                rptMan_desc:rptMan_desc,
                                probPeriod:probPeriod,
                                preem:preem,
                                preExpyear:preExpyear,
                                preExpmonth:preExpmonth,
                                preEmp:preEmp,
                                preEmp2:preEmp2,
                                preEmp3:preEmp3,
                                preEmp4:preEmp4,
                                preEmp5:preEmp5,
                                gender:gender,
                                dob:dob,
                                bgroup:bgroup,
                                shirt:shirt,
                                commAdd:commAdd,
                                state:state,
                                city:city,
                                pincode:pincode,
                                resAdd:resAdd,
                                state1:state1,
                                city1:city1,
                                pincode1:pincode1,
                                mobNum:mobNum,
                                telNum:telNum,
                                econNum:econNum,
                                emerPer:emerPer,
                                fathersName:fathersName,
                                mothersName:mothersName,
                                maritalstatus:maritalstatus,
                                spouseName:spouseName,
                                panNum:panNum,
                                passNum:passNum,
                                aadhaarNum:aadhaarNum,
                                dlNum:dlNum,
                                uan:uan,
                                nameinBank:nameinBank,
                                bankName:bankName,
                                branchName:branchName,
                                acctNum:acctNum,
                                ifscCode:ifscCode,
                                enFlg:enFlg,
                                cflag:cflag
                                                                //closing bracket of render
                                                                });

                                });
                        });
                }
        });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////  Post Method Finance /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/viewempdetFin',viewempdetFin);
function viewempdetFin(req , res)
{
        var emp_id=req.body.emp_id;

        var empId = req.user.rows['0'].user_id;

        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        emp_access=result.rows['0'].user_type;

        pdbconnect.query("SELECT * from emp_master_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,check){
        rcount_master=check.rowCount;

        pdbconnect.query("SELECT * from emp_info_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,test){
        rcount_info=test.rowCount;

        pdbconnect.query("SELECT * from emp_info_tbl_temp where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,test){
        var flag=test.rowCount;

        pdbconnect.query("SELECT * from emp_info_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,main){
        var mflag=main.rowCount;

        var cflag="Y";

        if(flag == 1)
        {
                var enFlg="N";
        }

        if(mflag == 1)
        {
                var enFlg="Y";
        }

        if(flag == mflag)
        {
                var enFlg="N";
        }

        if(rcount_master == rcount_info)
        {

                //query 1 to fetch professional details
                pdbconnect.query("select emp_id,emp_name,emp_email,emp_access,joining_date,designation,salary,reporting_mgr,prev_expr_year,prev_expr_month,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,emp_prob,pre_emp_flg,emp_classification from emp_master_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,resultset){
                if (err) throw err;
                var empid=resultset.rows['0'].emp_id;
                var empName=resultset.rows['0'].emp_name;
                var email=resultset.rows['0'].emp_email;
                var empAccess=resultset.rows['0'].emp_access;
                var jDate=resultset.rows['0'].joining_date;
                var jDate=dateFormat(jDate,"yyyy-mm-dd");
                var desig=resultset.rows['0'].designation;
                var empClass=resultset.rows['0'].emp_classification;
                var salary=resultset.rows['0'].salary;
                var rptMan=resultset.rows['0'].reporting_mgr;
                var probPeriod=resultset.rows['0'].emp_prob;
                var preem=resultset.rows['0'].pre_emp_flg;
                var preExpyear=resultset.rows['0'].prev_expr_year;
                var preExpmonth=resultset.rows['0'].prev_expr_month;
                var preEmp=resultset.rows['0'].prev_empr;
                var preEmp2=resultset.rows['0'].prev_empr2;
                var preEmp3=resultset.rows['0'].prev_empr3;
                var preEmp4=resultset.rows['0'].prev_empr4;
                var preEmp5=resultset.rows['0'].prev_empr5;


                pdbconnect.query("select * from project_alloc_tbl where emp_id = $1",[empid],function(err,resultset){
                if (err) throw err;
                pidcount=resultset.rowCount;

                if(pidcount > 1 )
                {
                        var pid = "MULTIPLE";

                }

                if(pidcount == 1)
                {
                        pdbconnect.query("select project_id from project_alloc_tbl where emp_id = $1",[empid],function(err,resultset)
                        {
                                        if (err) throw err;
                                        pid=resultset.rows['0'].project_id;
                        });
                }

                if(pidcount == 0)
                {
                        var pid="Not Allocated";

                }

                //query 2 to fetch personal details
                pdbconnect.query("select gender,dob,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,phone1,phone2,father_name,mother_name,martial_status,spouse_name,pan_number,passport_num,aadhaar_num,license_num,blood_group,shirt_size,emergency_num,emergency_con_person,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code from emp_info_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,result){
                if (err) throw err;
                var gender=result.rows['0'].gender;
                var dob=result.rows['0'].dob;
                var dob=dateFormat(dob,"yyyy-mm-dd");
                var bgroup=result.rows['0'].blood_group;
                var shirt=result.rows['0'].shirt_size;
                var commAdd=result.rows['0'].comm_addr1;
                var state=result.rows['0'].state;
                var city=result.rows['0'].city;
                var pincode=result.rows['0'].pincode;
                var resAdd=result.rows['0'].comm_addr2;
                var state1=result.rows['0'].state1;
                var city1=result.rows['0'].city1;
                var pincode1=result.rows['0'].pincode1;
                var mobNum=result.rows['0'].phone1;
                var telNum=result.rows['0'].phone2;
                var econNum=result.rows['0'].emergency_num;
                var emerPer=result.rows['0'].emergency_con_person;
                var fathersName=result.rows['0'].father_name;
                var mothersName=result.rows['0'].mother_name;
                var maritalstatus=result.rows['0'].martial_status;
                var spouseName=result.rows['0'].spouse_name;
                var panNum=result.rows['0'].pan_number;
                var passNum=result.rows['0'].passport_num;
                var aadhaarNum=result.rows['0'].aadhaar_num;
                var dlNum=result.rows['0'].license_num;
                var uan=result.rows['0'].uan_num;
                var nameinBank=result.rows['0'].name_in_bank;
                var bankName=result.rows['0'].bank_name;
                var branchName=result.rows['0'].branch_name;
                var acctNum=result.rows['0'].account_num;
                var ifscCode=result.rows['0'].ifsc_code;

                //Setting Values for designation List

                pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='ACC' and comm_code_id=$1",[empAccess],function(err,resultset){
                empAccess=resultset.rows['0'].comm_code_desc;

                //Setting Values for designation List

                pdbconnect.query("select emp_name from emp_master_tbl where emp_id=$1",[rptMan],function(err,resultset){
                rptMan_desc=resultset.rows['0'].emp_name;

                //Setting Values for designation List

                pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='DSG' and comm_code_id=$1",[desig],function(err,resultset){
                desig=resultset.rows['0'].comm_code_desc;

                //Setting Values for Marriage List

                pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='MAR' and comm_code_id=$1",[maritalstatus],function(err,resultset){
                maritalstatus=resultset.rows['0'].comm_code_desc;

                //Setting Values for Gender List

                if(gender == "M"){gender = "MALE";}
                if(gender == "F"){gender = "FEMALE";}

                //Setting Values for Gender List

                if(probPeriod == "Y"){probPeriod = "YES";}
                if(probPeriod == "N"){probPeriod = "NO";}

                // setting values for previous experience
                if(preem == "Y"){preem = "YES";}
                if(preem == "N"){preem = "NO";}

                //Setting Values for Shirt List

                pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='BLG' and comm_code_id=$1",[bgroup],function(err,resultset){
                bgroup=resultset.rows['0'].comm_code_desc;

                //Setting Values for Shirt List

                pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='SHR' and comm_code_id=$1",[shirt],function(err,resultset){
                shirt=resultset.rows['0'].comm_code_desc;

                //Setting Values for State List

                pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='STA' and comm_code_id=$1",[state],function(err,resultset){
                state=resultset.rows['0'].comm_code_desc;

                //Setting Values for State List

                pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='STA' and comm_code_id=$1",[state1],function(err,resultset){
                state1=resultset.rows['0'].comm_code_desc;

                res.render('employeeModule/employeeDetailsViewFin',{
                enFlg:enFlg,
                cflag:cflag,
                emp_access:emp_access,
                ename:req.user.rows['0'].user_name,
                eid:req.user.rows['0'].user_id,
                empid:empid,
                empName:empName,
                email:email,
                empAccess:empAccess,
                jDate:jDate,
                desig:desig,
                empClass:empClass,
                salary:salary,
                pid:pid,
                rptMan:rptMan,
                rptMan_desc:rptMan_desc,
                preem:preem,
                probPeriod:probPeriod,
                preExpyear:preExpyear,
                preExpmonth:preExpmonth,
                preEmp:preEmp,
                preEmp2:preEmp2,
                preEmp3:preEmp3,
                preEmp4:preEmp4,
                preEmp5:preEmp5,
                gender:gender,
                dob:dob,
                bgroup:bgroup,
                shirt:shirt,
                commAdd:commAdd,
                state:state,
                city:city,
                pincode:pincode,
                resAdd:resAdd,
                state1:state1,
                city1:city1,
                pincode1:pincode1,
                mobNum:mobNum,
                telNum:telNum,
                econNum:econNum,
                emerPer:emerPer,
                fathersName:fathersName,
                mothersName:mothersName,
                maritalstatus:maritalstatus,
                spouseName:spouseName,
                panNum:panNum,
                passNum:passNum,
                aadhaarNum:aadhaarNum,
                dlNum:dlNum,
                uan:uan,
                nameinBank:nameinBank,
                bankName:bankName,
                branchName:branchName,
                acctNum:acctNum,
                ifscCode:ifscCode
                                                        //closing bracket of render
                                                        });
                        //closing bracket of query1
                        });
                //closing bracket of query2
                });
                });
                });
                });
                });
                });
                });
                });
                });
                });
        //closing of if loop
        }
        else
        {

                var gender="";
                var dob="";
                var bgroup="";
                var shirt="";
                var commAdd="";
                var state="";
                var city="";
                var pincode="";
                var resAdd="";
                var state1="";
                var city1="";
                var pincode1="";
                var mobNum="";
                var telNum="";
                var econNum="";
                var emerPer="";
                var fathersName="";
                var mothersName="";
                var maritalstatus="";
                var spouseName="";
                var panNum="";
                var passNum="";
                var aadhaarNum="";
                var dlNum="";
                var uan="";
                var nameinBank="";
                var bankName="";
                var branchName="";
                var acctNum="";
                var ifscCode="";

                //query 1 to fetch professional details
                pdbconnect.query("select emp_id,emp_name,emp_email,emp_access,joining_date,designation,salary,reporting_mgr,prev_expr_year,prev_expr_month,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,emp_prob,pre_emp_flg,emp_classification from emp_master_tbl where LOWER(emp_id)=LOWER($1)",[emp_id],function(err,resultset){
                if (err) throw err;
                var empid=resultset.rows['0'].emp_id;
                var empName=resultset.rows['0'].emp_name;
                var email=resultset.rows['0'].emp_email;
                var empAccess=resultset.rows['0'].emp_access;
                var jDate=resultset.rows['0'].joining_date;
                var jDate=dateFormat(jDate,"yyyy-mm-dd");
                var desig=resultset.rows['0'].designation;
                var empClass=resultset.rows['0'].emp_classification;
                var salary=resultset.rows['0'].salary;
                var rptMan=resultset.rows['0'].reporting_mgr;
                var probPeriod=resultset.rows['0'].emp_prob;
                var preem=resultset.rows['0'].pre_emp_flg;
                var preExpyear=resultset.rows['0'].prev_expr_year;
                var preExpmonth=resultset.rows['0'].prev_expr_month;
                var preEmp=resultset.rows['0'].prev_empr;
                var preEmp2=resultset.rows['0'].prev_empr2;
                var preEmp3=resultset.rows['0'].prev_empr3;
                var preEmp4=resultset.rows['0'].prev_empr4;
                var preEmp5=resultset.rows['0'].prev_empr5;

                pdbconnect.query("select * from project_alloc_tbl where emp_id = $1",[empid],function(err,resultset){
                if (err) throw err;
                pidcount=resultset.rowCount;
                if(pidcount > 1 )
                {
                        var pid = "MULTIPLE";

                }

                if(pidcount == 1)
                {
                        pdbconnect.query("select project_id from project_alloc_tbl where emp_id = $1",[empid],function(err,resultset){
                        if (err) throw err;
                        pid=resultset.rows['0'].project_id;
                        });
                }

                if(pidcount == 0)
                {
                        var pid="Not Allocated";
                }

                //Setting Values for designation List

                pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='ACC' and comm_code_id=$1",[empAccess],function(err,resultset){
                empAccess=resultset.rows['0'].comm_code_desc;

                pdbconnect.query("select emp_name from emp_master_tbl where emp_id=$1",[rptMan],function(err,resultset){
                rptMan_desc=resultset.rows['0'].emp_name;

                //Setting Values for designation List

                pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='DSG' and comm_code_id=$1",[desig],function(err,resultset){
                desig=resultset.rows['0'].comm_code_desc;

                //Setting Values for Gender List

                if(gender == "M"){gender = "MALE";}
                if(gender == "F"){gender = "FEMALE";}

                //Setting Values for Gender List

                if(probPeriod == "Y"){probPeriod = "YES";}
                if(probPeriod == "N"){probPeriod = "NO";}

                // setting values for previous experience
                if(preem == "Y"){preem = "YES";}
                if(preem == "N"){preem = "NO";}

                res.render('employeeModule/employeeDetailsViewFin',{
                        enFlg:enFlg,
                        cflag:cflag,
                        emp_access:emp_access,
                        ename:req.user.rows['0'].user_name,
                        eid:req.user.rows['0'].user_id,
                        empid:empid,
                        empName:empName,
                        email:email,
                        empAccess:empAccess,
                        jDate:jDate,
                        desig:desig,
                        empClass:empClass,
                        salary:salary,
                        pid:pid,
                        rptMan:rptMan,
                        rptMan_desc:rptMan_desc,
                        preem:preem,
                        probPeriod:probPeriod,
                        preExpyear:preExpyear,
                        preExpmonth:preExpmonth,
                        preEmp:preEmp,
                        preEmp2:preEmp2,
                        preEmp3:preEmp3,
                        preEmp4:preEmp4,
                        preEmp5:preEmp5,
                        gender:gender,
                        dob:dob,
                        bgroup:bgroup,
                        shirt:shirt,
                        commAdd:commAdd,
                        state:state,
                        city:city,
                        pincode:pincode,
                        resAdd:resAdd,
                        state1:state1,
                        city1:city1,
                        pincode1:pincode1,
                        mobNum:mobNum,
                        telNum:telNum,
                        econNum:econNum,
                        emerPer:emerPer,
                        fathersName:fathersName,
                        mothersName:mothersName,
                        maritalstatus:maritalstatus,
                        spouseName:spouseName,
                        panNum:panNum,
                        passNum:passNum,
                        aadhaarNum:aadhaarNum,
                        dlNum:dlNum,
                        uan:uan,
                        nameinBank:nameinBank,
                        bankName:bankName,
                        branchName:branchName,
                        acctNum:acctNum,
                        ifscCode:ifscCode
                                        //closing bracket of query1
                                        });
                                });
                                });
                                });
                                });
                                });
        //closing of else loop
        }
        //closing of check
        });
        });
        //closing of test
        });
        });
        });
//closing of function
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////Finance Team Modify Bank Details ///////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/employeePersonalModFin',employeePersonalModFin);
function employeePersonalModFin(req,res)
{
        var eid =req.user.rows[0].user_id;
        var ename =req.user.rows[0].user_name;
        var emp_access =req.user.rows[0].user_type;
	var employee_id="";

        if(emp_access != "F1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {

                pdbconnect.query("SELECT emp_id,emp_name from emp_info_tbl where entity_cre_flg='Y' and del_flg='N' order by emp_id asc",function(err,result)
		{
                	employee=result.rows;
                	emp_id_count=result.rowCount;

			res.render('employeeModule/employeePersonalModFin',
			{
				eid:eid,
				ename:ename,
				emp_access:emp_access,
				employee:employee,
				emp_id_count:emp_id_count,
				employee_id:employee_id
			});
		});
        }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// Finance Team Modify Bank Details Fetch Through Ajax ///////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/fetchDetfin',fetchDetfin);
function fetchDetfin(req,res)
{

        var empid = req.query.empid;

        pdbconnect.query("select emp_id,emp_name,name_in_bank,bank_name,branch_name,account_num,ifsc_code from emp_info_tbl where emp_id=$1 and entity_cre_flg='Y' and del_flg='N'",[empid],function(err,result)
        {
                if(err)
                {
                        console.error('Error with table query', err);
                }
                else
                {
                        var employee_id = result.rows['0'].emp_id;
                        var empName = result.rows['0'].emp_name;
                        var nameinBank = result.rows['0'].name_in_bank;
                        var bankName = result.rows['0'].bank_name;
                        var branchName = result.rows['0'].branch_name;
                        var acctNum = result.rows['0'].account_num;
                        var ifscCode = result.rows['0'].ifsc_code;

                        res.json({key:employee_id,key1:empName,key2:nameinBank,key3:bankName,key4:branchName,key5:acctNum,key6:ifscCode});

		}
	});

};

//////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// Finance Team Modify Bank Details Post Through Ajax ///////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/modempdetperFin',modempdetperFin);
function modempdetperFin(req , res)
{
        var now = new Date();
        var eid=req.user.rows[0].user_id;
        var rcreuserid=eid;
        var rcretime=now;
        var lchguserid=eid;
        var lchgtime=now;
        var employee_id=req.body.employee_id;
        var empName=req.body.empName;
        var nameinBank=req.body.nameinBank;
        var bankName=req.body.bankName;
        var branchName=req.body.branchName;
        var acctNum=req.body.acctNum;
        var ifscCode=req.body.ifscCode;
        var entity_cre_flg="Y";
        var del_flg="N";


	pdbconnect.query("SELECT * from emp_info_tbl where emp_id = $1",[employee_id],function(err,result)
	{
		var mtbl=result.rowCount;
		if(mtbl == "1")
		{
			pdbconnect.query("SELECT * from emp_info_tbl_temp where emp_id = $1",[employee_id],function(err,result)
			{
				var ttbl=result.rowCount;
				if(ttbl == "0")
				{

					pdbconnect.query("update emp_info_tbl set name_in_bank=$2,bank_name=$3,branch_name=$4,account_num=$5,ifsc_code=$6,del_flg=$7,entity_cre_flg=$8,rcre_user_id=$9,rcre_time=$10,lchg_user_id=$11,lchg_time=$12 where emp_id=$1",[employee_id,nameinBank,bankName,branchName,acctNum,ifscCode,del_flg,entity_cre_flg,rcreuserid,rcretime,lchguserid,lchgtime],function(err,done)
					{
						if(err) throw err;
						req.flash('success',"Bank Details has been Sucessfully Modified for the Employee Id :" + employee_id + ".")
						res.redirect('/employeeModule/employeeDetails/employeePersonalModFin');
					});
				}
				else
				{
					req.flash('error',"Bank Details cannot be Modified since verification Pending by admin for this Employee:" + employee_id + ".")
					res.redirect('/employeeModule/employeeDetails/employeePersonalModFin');
				}
			  });
		}
		else
		{
					req.flash('error',"Record Does Not Exists / Or Verifcation Pending By Admin.")
					res.redirect('/employeeModule/employeeDetails/employeePersonalModFin');
		}
	});
};




/////////////////////////////// End of Employee Admin Module /////////////////////////////////////////////////

module.exports = router;
