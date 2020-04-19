var express = require('express');
var router = express.Router();
var app = express();
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


//////////////////////////////////////////// Calling Index Page ////////////////////////////////
router.get('/index',function(req,res)
{
	res.render('captureModule/index');

});


router.post('/nextPage',nextPage);
function nextPage(req , res)
{
	var empid = req.body.empid
	console.log("empid",empid);
 
	pdbconnect.query("SELECT * from data_emp_master_tbl_temp where emp_id = $1",[empid],function(err,result){
	mcount=result.rowCount;

	pdbconnect.query("SELECT * from data_emp_info_tbl_temp where emp_id = $1",[empid],function(err,resultset){
	icount=resultset.rowCount;

        pdbconnect.query("SELECT * from emp_master_tbl where emp_id = $1",[empid],function(err,result){
        main_count=result.rowCount;
	console.log("main_count",main_count);

	if(main_count == 0)
	{
		if(mcount == 0)
		{
			if(icount == 0)
			{
				//res.redirect('/captureModule/captureDetail/captureDetailProfessional');
				res.render('captureModule/captureDetailProfessional',
                        	{
                          		empid:empid
                        	});

			}
			else
			{

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

				res.render('captureModule/captureDetailPersonal',{
                                empid:empid,
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

			}
			
		}
		else
		{
			if(icount == 1)
			{
				req.flash('error',"Verification Pending for this Employee Id:  "+empid)
				res.redirect('/captureModule/captureDetail/index');
		
			}
			else
			{
				//res.redirect('/captureModule/captureDetail/captureDetailPersonal');
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

                                res.render('captureModule/captureDetailPersonal',{
                                empid:empid,
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

			}
		}
	}
	else
	{
				req.flash('error',"You have Already been registered in Amber")
				res.redirect('/captureModule/captureDetail/index');
	}
	});
	});
	});
};

//////////////////////////////////////////// Adding Employee Details ////////////////////////////////
router.get('/captureDetailProfessional',function(req,res)
{

       res.render('captureModule/captureDetailProfessional');

});

router.post('/addempdet',addempdet);

function addempdet(req , res)
{
                var now = new Date();
                var rcreuserid="ADMIN"
                var rcretime=now;
                var lchguserid="ADMIN"
                var lchgtime=now;
                var empid=req.body.empid;
                var empname=req.body.empName;
                var email=req.body.email;
                var empaccess="L3"
                var jDate=req.body.jDate;
                var desig="T"
                var empClass="A1";
                var salary="0";
                var rptman="0001";
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
                var entity_cre_flg="N";

        pdbconnect.query("SELECT * from data_emp_master_tbl_temp where emp_id = $1",[empid],function(err,result){
        var mcount=result.rowCount;

        pdbconnect.query("SELECT * from emp_master_tbl where emp_id = $1",[empid],function(err,result){
        var main_count=result.rowCount;
        console.log("main_count",main_count);

        if(main_count == 0)
        {
                if(mcount == 0)
                {
				pdbconnect.query("INSERT INTO data_emp_master_tbl_temp(emp_id,emp_name,emp_access,emp_email,joining_date,designation,salary,reporting_mgr,prev_expr_year,prev_expr_month,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,emp_prob,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,entity_cre_flg,pre_emp_flg,emp_classification) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)",[empid,empname,empaccess,email,jDate,desig,salary,rptman,preExpyear,preExpmonth,preEmp,preEmp2,preEmp3,preEmp4,preEmp5,probPeriod,'N',rcreuserid,rcretime,lchguserid,lchgtime,entity_cre_flg,preem,empClass],function(err,done){
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
                                                subject: 'Amber Portal account creation',
                                                html: '<img src="http://www.confessionsofareviewer.com/wp-content/uploads/2017/05/welcome-on-board.jpg" height="85"><br><br>' +
                                                '<h3>Dear <b>' + empname + '</b>,<br><br>' +
                                                'You are receiving this mail because you (or someone else) has filled in the details <b>Amber</b>.<br>' +
                                                'Registered Account details : <br><br>' +
                                                '<table style="border: 10px solid black;"><tr style="border: 10px solid black;"><th style="border: 10px solid black;">User Id</th><th style="border: 10px solid black;">' + empid + '</th></tr><tr style="border: 10px solid black;"><td style="border: 10px solid black;"> Employee Name </td><td style="border: 10px solid black;">' + empname + '</td></tr></table><br><br>' +
						'Password will be generated once HR Approves your Record<br>' +
						'Contact administrator for any clarifications<br><br><br>'+
						'- Regards,<br><br>Amber</h3>'
                                         };


		       smtpTransport.sendMail(mailOptions, function(err) {
		       });

		       req.flash('success',"User successfully added and An e-mail has been sent to " + email + " with further instructions.")
		       //res.redirect('/captureModule/captureDetail/captureDetailPersonal');

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

			res.render('captureModule/captureDetailPersonal',{
			empid:empid,
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
             }
	     else
	     {
                                req.flash('error',"Verification Pending By Admin")
                                res.redirect('/captureModule/captureDetail/index');
	     }

        }
        else
        {
                                req.flash('error',"You have Already been registered in Amber")
                                res.redirect('/captureModule/captureDetail/index');
        }
	});
	});

};

///////////////////////////////////////////////////////////////////////////////////////
router.get('/captureDetailPersonal',function(req,res)
{
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

                res.render('captureModule/captureDetailPersonal',{
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

router.post('/addempper',addempper);
function addempper (req , res)
{
        var now = new Date();
        var rcreuserid="ADMIN";
        var rcretime=now;
        var lchguserid="ADMIN";
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
        var nameinBank="";
        var bankName="";
        var branchName="";
        var acctNum="";
        var ifscCode="";
        var entity_cre_flg="N";

        pdbconnect.query("SELECT * from data_emp_master_tbl_temp e where LOWER(e.emp_id) = LOWER($1)",
        [empid],function(err,resultset){
        if(err) throw err;
        var mcount = resultset.rowCount;

        pdbconnect.query("SELECT * from data_emp_info_tbl_temp e where LOWER(e.emp_id) = LOWER($1)",
        [empid],function(err,resultset){
        if(err) throw err;
        var tcount = resultset.rowCount;

        pdbconnect.query("SELECT * from emp_info_tbl where emp_id = $1",[empid],function(err,result){
        var main_count=result.rowCount;
        console.log("main_count",main_count);

        pdbconnect.query("SELECT * from emp_info_tbl_temp where emp_id = $1",[empid],function(err,result){
        var maintmp_count=result.rowCount;
        console.log("main_counttmp",maintmp_count);

        if(main_count == 0)
        {
	    if(maintmp_count == 0)
	     {
			if(mcount == 0)
			{
				if(tcount == 0)
				{
					  pdbconnect.query("INSERT INTO data_emp_info_tbl_temp(emp_id,emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code,del_flg,entity_cre_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)",[empid,empName,gender,dob,bgroup,shirt,commAdd,state,city,pincode,resAdd,state1,city1,pincode1,maritalstatus,mobNum,telNum,econNum,emerPer,fathersName,mothersName,spouseName,panNum,passNum,dlNum,aadhaarNum,uan,nameinBank,bankName,branchName,acctNum,ifscCode,'N',entity_cre_flg,rcreuserid,rcretime,lchguserid,lchgtime],function(err,done)
					{
						if(err) throw err;
					});
					req.flash('success',"Employee Details Captured sucessfully.")
					res.redirect('/captureModule/captureDetail/index');
				}
				else
				{
					req.flash('error',"Record Pending for Verification")
					res.redirect(req.get('referer'));
				}
			}
			else
			{
				if(tcount == 1)
				{
					req.flash('error',"Record Pending for Verification.")
					res.redirect(req.get('referer'));
				}
				else
				{
					  pdbconnect.query("INSERT INTO data_emp_info_tbl_temp(emp_id,emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code,del_flg,entity_cre_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)",[empid,empName,gender,dob,bgroup,shirt,commAdd,state,city,pincode,resAdd,state1,city1,pincode1,maritalstatus,mobNum,telNum,econNum,emerPer,fathersName,mothersName,spouseName,panNum,passNum,dlNum,aadhaarNum,uan,nameinBank,bankName,branchName,acctNum,ifscCode,'N',entity_cre_flg,rcreuserid,rcretime,lchguserid,lchgtime],function(err,done)
					{
						if(err) throw err;
					});
					req.flash('success',"Employee Details Captured sucessfully.")
					res.redirect('/captureModule/captureDetail/index');
				}
			}
		}
		else
		{
				req.flash('error',"Employee Details Already Present in Amber for verification.")
				res.redirect('/captureModule/captureDetail/index');
		}
	}
	else
	{
                        req.flash('error',"Employee Details Already Present in Amber.")
        		res.redirect('/captureModule/captureDetail/index');
	}

                });
                });
        });
    });
};
/////////////////////////////// End of Logic /////////////////////////////////////////////////
module.exports = router;
