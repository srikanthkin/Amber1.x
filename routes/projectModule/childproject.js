var express = require('express');
var dateFormat = require('dateformat');
var multer = require('multer');
var app = express();
var util = require('util');
var path = require('path');
var fs = require('fs');
var formidable = require("formidable");
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
var project = "";
var projectname = "";
var sowDocs = [],poDocs = [],mileDocs = [],cloDocs = [],fbDocs = [],aDocs = [];
var sowLen = 0,poLen = 0,mileLen = 0 ,cloLen = 0 ,fbLen = 0,aLen = 0;
var emp_id_count = "";
var emprejlist=[];
var rlist="";
var alist="";
var empacclist=[];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// Child Project Add (GET) ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/childproject',function(req,res)
{
        var empId = req.user.rows['0'].user_id;
        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        var emp_access=result.rows['0'].user_type;

	if(emp_access != "L1" && emp_access != "L2")
	{
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
	else
	{
		pdbconnect.query("SELECT emp_id from emp_master_tbl order by emp_id asc",function(err,result)
		{
			var employee=result.rows;
			var empid_count=result.rowCount;
			console.log("empid:::",employee);
			console.log("empid_count:::",empid_count);

		pdbconnect.query("SELECT emp_name from emp_master_tbl order by emp_id asc",function(err,result)
		{
			var empname=result.rows;
			var empname_count=result.rowCount;
			console.log("empname:::",empname);
			console.log("empname_count:::",empname_count);

		pdbconnect.query("SELECT customer_id from customer_master_tbl order by customer_id asc",function(err,result)
		{
			var customer_id=result.rows;
			var customer_count=result.rowCount;
			console.log("cid:::",customer_id);
			console.log("cid_count:::",customer_count);

		pdbconnect.query("SELECT customer_name from customer_master_tbl order by customer_id asc",function(err,result)
		{
			var customer_name=result.rows;
			var customername_count=result.rowCount;
			console.log("cname:::",customer_name);
			console.log("cidname_count:::",customername_count);

		pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'CUS' order by comm_code_id asc",function(err,result)
		{
			var comm_code_id=result.rows;
			var comm_code_id_count=result.rowCount;
			console.log("classid:::",comm_code_id);
			console.log("classid_count:::",comm_code_id_count);

		pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id = 'CUS'  order by comm_code_id asc",function(err,result)
		{
			var comm_code_desc=result.rows;
			var comm_code_desc_count=result.rowCount;
			console.log("classdesc::",comm_code_desc);
			console.log("classdesc_count:::",comm_code_desc_count);

		pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'PCR'  order by comm_code_id asc",function(err,result)
		{
			var comm_code_pcr=result.rows;
			var comm_code_pcr_count=result.rowCount;
			console.log("classdesc::",comm_code_pcr);
			console.log("classdesc_count:::",comm_code_pcr_count);

		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PTY'  order by comm_code_id asc",function(err,result)
		{
			var comm_code_pty=result.rows;
			var comm_code_pty_count=result.rowCount;
			console.log("classdesc::",comm_code_pty);
			console.log("classdesc_count:::",comm_code_pty_count);

		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TNU'  order by comm_code_id asc",function(err,result)
		{
			comm_code_tnu=result.rows;
			comm_code_tnu_count=result.rowCount;
			console.log("classdesc::",comm_code_tnu);
			console.log("classdesc_count:::",comm_code_tnu_count);

		pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_access in ('L1','L2') order by emp_id asc",function(err,result)
		{
			var delname=result.rows;
			var delname_count=result.rowCount;
			console.log("delname:::",delname);
			console.log("delname_count:::",delname_count);

		pdbconnect.query("SELECT emp_id from emp_master_tbl where emp_access in ('L1','L2') order by emp_id asc",function(err,result)
		{
			var delid=result.rows;
			var delid_count=result.rowCount;
			console.log("delid:::",delid);
			console.log("delid_count:::",delid_count);

		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PAT' order by comm_code_id asc",function(err,result)
		{
			var comm_paymentype=result.rows;
			var comm_paymentype_count=result.rowCount;
			console.log("classpayment:::",comm_paymentype);
			console.log("classpayment_count:::",comm_paymentype_count);

		pdbconnect.query("select project_id from project_master_tbl where closure_flg='N' and chld_flg='N' order by project_id asc ",function(err,result)
		{
			var parpid=result.rows;
			var parpid_count=result.rowCount;

			res.render('projectModule/childproject',{
			emp_access:emp_access,
			ename:req.user.rows['0'].user_name,
			eid:req.user.rows['0'].user_id,
			parpid:parpid,
			parpid_count:parpid_count,
			employee:employee,
			empid_count:empid_count,
			empname:empname,
			customer_id:customer_id,
			customer_count:customer_count,
			customer_name:customer_name,
			comm_code_id:comm_code_id,
			comm_code_id_count:comm_code_id_count,
			comm_code_desc:comm_code_desc,
			comm_code_pcr:comm_code_pcr,
			comm_code_pcr_count:comm_code_pcr_count,
			comm_code_pty:comm_code_pty,
			comm_code_pty_count:comm_code_pty_count,
			comm_code_tnu:comm_code_tnu,
			comm_code_tnu_count:comm_code_tnu_count,
			delname_count:delname_count,
			delname:delname,
			delid:delid,
			delid_count:delid_count,
			comm_paymentype_count:comm_paymentype_count,
			comm_paymentype:comm_paymentype
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
		});
	}
		});
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// Child Parent Project Fetch ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/fetchDet',fetchDet);
function fetchDet(req,res)
{
        
	var parpid = req.query.parpid;

        pdbconnect.query("select cid,delivery_mgr,payment_type,customer_class,team_size,project_mgr,project_type,project_curr,bill_addrline1,bill_addrline2,bill_country,bill_city,bill_pin_code,project_loc,perdium_amount_per_day,perdium_curr_per_day from project_master_tbl where project_id=$1",[parpid],function(err,result)
	{
        	if(err)
		{
        		console.error('Error with table query', err);
        	} 
		else 
		{
        		var cid = result.rows['0'].cid
        		var delmgr = result.rows['0'].delivery_mgr;
        		var paymenttype = result.rows['0'].payment_type;
			console.log("paymenttype",paymenttype);
        		var classid = result.rows['0'].customer_class;
        		var projectsize = result.rows['0'].team_size;
        		var projmgr = result.rows['0'].project_mgr;
        		var projtype = result.rows['0'].project_type;
        		var projcur = result.rows['0'].project_curr;
        		var clientaddr1 = result.rows['0'].bill_addrline1;
        		var clientaddr2 = result.rows['0'].bill_addrline2;
        		var countryId = result.rows['0'].bill_country;
        		var cityId = result.rows['0'].bill_city;
        		var pincode = result.rows['0'].bill_pin_code;
        		var perloc = result.rows['0'].project_loc;
        		var perdiumamt = result.rows['0'].perdium_amount_per_day;
        		var perprocurr = result.rows['0'].perdium_curr_per_day;

			pdbconnect.query("SELECT customer_id,customer_name from customer_master_tbl where customer_id=$1",[cid],function(err,result){
                	var customer_name=result.rows['0'].customer_name;
                	var cid=result.rows['0'].customer_id;
			var cid = cid  + "-" +  customer_name;

                        pdbconnect.query("SELECT emp_id,emp_name from emp_master_tbl where emp_id=$1",[delmgr],function(err,result){
                        var delmgr_name=result.rows['0'].emp_name;
                        var delmgr=result.rows['0'].emp_id;
			var delmgr = delmgr  + "-" +  delmgr_name;

        		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'CUS' and comm_code_id=$1",[classid],function(err,result){
                	var class_id_name=result.rows['0'].comm_code_desc;
                	var classid=result.rows['0'].comm_code_id;
			var classid = classid  + "-" +  class_id_name;

        		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PTY' and comm_code_id=$1",[projtype],function(err,result){
                	var project_type_name=result.rows['0'].comm_code_desc;
                	var projtype=result.rows['0'].comm_code_id;
			var projtype = projtype  + "-" +  project_type_name;


			res.json({key:cid,key1:delmgr,key2:paymenttype,key3:classid,key4:projectsize,key5:projmgr,key6:projtype,key7:projcur,key8:clientaddr1,key9:clientaddr2,key10:countryId,key11:cityId,key12:pincode,key13:perloc,key14:perdiumamt,key15:perprocurr,key16:parpid});

        		});
        		});
        		});
        		});
        	}
    	});
}




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// Child Project Add (POST) //////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/addchildproject',addchildproject);
function addchildproject(req , res)
{

           var empId = req.user.rows['0'].user_id;
           var eid = req.user.rows['0'].user_id;
           var now = new Date();
           var rcreuserid=empId;
           var rcretime=now;
           var lchguserid=empId;
           var lchgtime=now;
           var parpid=req.body.parpid1;
           var paymenttype=req.body.paymenttype;
           var projectsize=req.body.projectsize;
           var projectmgr=req.body.projmgr;
	   var projcur=req.body.projcur;
           var projsdate=req.body.projsdate;
           var projcdate=req.body.projcdate;
           var Projbud=req.body.Projbud;
           var targmar=req.body.targmar;
           var Totalbud=req.body.Totalbud;
           var salary=req.body.salary;
           var perdium=req.body.perdium;
           var travel=req.body.travel;
           var other=req.body.other;
           var module=req.body.module;
           var nousers=req.body.nousers;
           var nobranch=req.body.nobranch;
           var fpexpdate=req.body.fpexpdate;
           var millength=req.body.millength;

	   if(fpexpdate == "")
	   {
        	var fpexpdate=null;
	   }
   
	  var tenure=req.body.tenure;
   	  var projexpdate=req.body.projexpdate;
 
	  if(projexpdate == "")
	  {
        	var projexpdate=null;
	  }

	 var subper=req.body.subper;
	 var subamt=req.body.subamt;
	 var povalue=req.body.povalue;
	 var Noofppl=req.body.Noofppl;
	 var perloc=req.body.perloc;
	 var perdiumamt=req.body.perdiumamt;
	 var percur=req.body.percur;
	 var rateamt=req.body.rateamt;
	 var ponumber=req.body.ponumber;
	 var rmks=req.body.rmks;
	 var perloc=req.body.perloc;
	 var perdiumamt=req.body.perdiumamt;
	 var perprocurr=req.body.perprocurr;
	 var salarycurr=req.body.salarycurr;
	 var perdiemamtcurr=req.body.perdiemamtcurr;
	 var travelamtcurr=req.body.travelamtcurr;
	 var otheramtcurr=req.body.otheramtcurr;
	 var projectid=0;
	 var milcount=0;
	 var datetime = new Date();
	   var salrate=req.body.salrate;
	   var perrate=req.body.perrate;
	   var travelrate=req.body.travelrate;
	   var otherrate=req.body.otherrate;
	   var salconamt=req.body.salconamt;
	   var perconamt=req.body.perconamt;
	   var traconamt=req.body.traconamt;
	   var othconamt=req.body.othconamt;


        pdbconnect.query("select cid,delivery_mgr,customer_class,team_size,project_type,bill_addrline1,bill_addrline2,bill_country,bill_city,bill_pin_code from project_master_tbl where project_id=$1",[parpid],function(err,result)
        {
                if(err)
                {
                        console.error('Error with table query', err);
                }
                else
                {
                        var cid = result.rows['0'].cid
                        var delmgr = result.rows['0'].delivery_mgr;
                        var classid = result.rows['0'].customer_class;
                        var projectsize = result.rows['0'].team_size;
                        var projtype = result.rows['0'].project_type;
                        var clientaddr1 = result.rows['0'].bill_addrline1;
                        var clientaddr2 = result.rows['0'].bill_addrline2;
                        var countryId = result.rows['0'].bill_country;
                        var cityId = result.rows['0'].bill_city;
                        var pincode = result.rows['0'].bill_pin_code;
		}

        pdbconnect.query("SELECT chld_cnt from project_master_tbl where project_id = $1",[parpid],function(err,result)
	{
        	if(err) throw err;

        	var proj_count = result.rows[0].chld_cnt;
        	console.log("child count",proj_count);

		if(proj_count == 0)
		{
        		proj_count = 1;
		}
		else
		{
       	 		proj_count = (proj_count - 0) + (1 - 0);
		}

        	projectid = classid + "-" + cid + "-" + projtype + "-" + "C" + "-" + proj_count;
        	console.log("project id",projectid);

       		pdbconnect.query("SELECT * from project_master_tbl where LOWER(project_id) = LOWER($1)",[projectid],function(err,resultset)
		{
                	if(err) throw err;
			var rcount = resultset.rowCount;
			console.log("rcount",rcount);
	
			if(rcount == 0)
			{
				console.log("inside rcount");

                		var milname_arr = [];
                		var caper_arr = [];
                		var diramt_arr = [];
                		var milDate_arr = [];

 				pdbconnect.query("INSERT INTO project_master_tbl(project_id,cid,project_loc,payment_type,customer_class,team_size,project_mgr,delivery_mgr,project_type,project_curr,project_budget,target_margin,tot_budget,salary,salarycurr,perdium,perdiumcurr,travel,travelcurr,other_exp,other_expcurr,fl_modules_included,fl_num_users,fl_num_of_branches,start_date,end_date,rcre_user_id,rcre_time,lchg_user_id,lchg_time,del_flg,perdium_amount_per_day,perdium_curr_per_day,bill_addrline1,bill_addrline2,bill_country,bill_city,bill_pin_code,rate,po_number,remarks,closure_flg,sow_upld,chld_flg,chld_parent_prj,salary_rate,perdiem_rate,travel_rate,other_rate,salary_converted_amt,travel_converted_amt,perdiem_converted_amt,other_converted_amt) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53)",[projectid,cid,perloc,paymenttype,classid,projectsize,projectmgr,delmgr,projtype,projcur,Projbud,targmar,Totalbud,salary,salarycurr,perdium,perdiemamtcurr,travel,travelamtcurr,other,otheramtcurr,module,nousers,nobranch,projsdate,projcdate,rcreuserid,rcretime,lchguserid,lchgtime,'N',perdiumamt,perprocurr,clientaddr1,clientaddr2,countryId,cityId,pincode,rateamt,ponumber,rmks,'N','N','Y',parpid,salrate,perrate,travelrate,otherrate,salconamt,perconamt,traconamt,othconamt],function(err,done)
				{
                			if(err) throw err;
        				//var millength1 = (millength - 0) - (1 - 0);
        
					for(i=0;i<millength;i++)
        				{
						var milname=req.body["milname_" + i];
						var caper=req.body["caper_" + i];
						var diramt=req.body["diramt_" + i];
						var milDate=req.body["milDate_" + i];
						console.log("name",milname);
						console.log("caper",caper);
						console.log("diramt",diramt);
						console.log("milDate",milDate);

                        			if(typeof milname === 'undefined')
						{

						}
						else
						{
								milname_arr.push(milname);
								caper_arr.push(caper);
								diramt_arr.push(diramt);
								milDate_arr.push(milDate);
				               			milcount = (milcount - 0) + (1 - 0);
                 			
							pdbconnect.query("INSERT INTO milestone_proj_tbl(project_id,serial_number,milestone_name,capture_per,direct_amount,milestone_exp_date,del_flg,rcre_user_id,lchg_user_id,rcre_time,lchg_time,confirm_flg,paid_flg,status_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)",[projectid,i,milname,caper,diramt,milDate,'N',rcreuserid,lchguserid,rcretime,lchgtime,'N','N','N'],function(err,done)
							{
                						if(err) throw err;
							});

							pdbconnect.query("update project_master_tbl set chld_cnt=$1 where project_id=$2",[proj_count,parpid],function(err,result){
							});  

						}
        				}


        pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[delmgr],function(err,result)
	{
        	var delname=result.rows['0'].emp_name;
        	console.log("delname:::",delname);

        pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[projectmgr],function(err,result)
	{
        	var projmgrname=result.rows['0'].emp_name;
        	console.log("project manager name:::",projmgrname);

        pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[rcreuserid],function(err,result)
	{
        	var createdgrname=result.rows['0'].emp_name;
        	console.log("created user name:::",createdgrname);

        pdbconnect.query("select project_mgr,delivery_mgr from project_master_tbl where project_id=$1",[projectid],function(err,result)
	{
        	var projectmgr  = result.rows['0'].project_mgr;
        	var deliverymgr = result.rows['0'].delivery_mgr;
        	console.log("projectmgr!!!",projectmgr);
        	console.log("deliverymgr!!",deliverymgr);

        pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id =$1",[projectmgr],function(err,result)
	{
        	var projectmgremail  = result.rows['0'].emp_email;
        	console.log("projectmgremail--",projectmgremail);

        pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id =$1",[deliverymgr],function(err,result)
	{
        	var deliverymgremail = result.rows['0'].emp_email;
        	console.log("deliverymgremail--",deliverymgremail);

        pdbconnect.query("SELECT reporting_mgr from emp_master_tbl where emp_id=$1",[delmgr],function(err,result)
	{
        	var delrpt=result.rows['0'].reporting_mgr;
        	console.log("delivery manager's manager");

        pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id=$1",[delrpt],function(err,result)
	{
        	var delrptmail=result.rows['0'].emp_email;
        	console.log("delivery manager's manager email");


        pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='FIN'",function(err,result)
	{
        	var finemail = result.rows['0'].comm_code_desc;
        	console.log("finance mail",finemail);

         	var mailids = projectmgremail +","+ deliverymgremail ;
        	console.log("mailids",mailids);

        	var cclist = finemail +","+ delrptmail;
        	console.log("cclist",cclist);


            	var smtpTransport = nodemailer.createTransport('SMTP',{
               	service: 'gmail',
               	auth:
            	{
                	user: 'amber@nurture.co.in',
                	pass: 'nurture@123'
            	}
            	});

    		var mailOptions = 
		{
                	to: mailids,
                	cc: cclist,
			from: 'amber@nurture.co.in',
                	subject: 'Project Creation Notification ',
                	text: 'Hi Team ,\n\n' +
			' Child Project Creation Details.\n\n' +
                	' Parent Project ID   : ' + parpid + ' .\n' +
                	' Child Project ID    : ' + projectid + ' .\n' +
                        ' Delivery manager    : ' + delmgr + '-' + delname + ' .\n' + 
			' Project manager     : ' + projectmgr + '-' + projmgrname + '\n' +
                        ' Project created by  : ' + rcreuserid + '-' + createdgrname +'.\n\n\n\n' +
			'- Regards,\n Amber'
               };

               smtpTransport.sendMail(mailOptions, function(err) {
               });
          	
	      req.flash('success',"Child Project :" + projectid + " created sucessfully for Parent Project :" + parpid + ".")
	      res.redirect('/projectModule/childproject/childproject');

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
          	req.flash('error',"Project Details Already Added")
          	res.redirect(req.get('referer'));
	}

		});
	});
	});
};








module.exports = router;
