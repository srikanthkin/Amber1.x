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

router.get('/productdetails',function(req,res)
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

			res.render('projectModule/productdetails',{
			emp_access:emp_access,
			parpid:parpid,
			ename:req.user.rows['0'].user_name,
			eid:req.user.rows['0'].user_id,
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

router.post('/addproductdetails',addproductdetails);
function addproductdetails(req , res)
{
	
	var empId = req.user.rows['0'].user_id;
	var eid = req.user.rows['0'].user_id;
var now = new Date();
var rcreuserid=empId;
var rcretime=now;
var lchguserid=empId;
var lchgtime=now;
var cid=req.body.cid;
var paymenttype=req.body.paymenttype;
var classid=req.body.classid;
var projectsize=req.body.projectsize;
var projectmgr=req.body.projmgr;
var projtype=req.body.projtype;
var projcur=req.body.projcur;
var projsdate=req.body.projsdate;
var projcdate=req.body.projcdate;
var delmgr=req.body.delmgr;
 var rateamt=req.body.rateamt;
 var ponumber=req.body.ponumber;
 var rmks=req.body.rmks;
 var projectid=0;
	 pdbconnect.query("SELECT count(*) as cnt from project_master_tbl where LOWER(cid)= LOWER($1) ",[cid],function(err,result){
         if(err) throw err;
         var proj_count = result.rows[0].cnt;
         console.log("rcount",proj_count);
	
	if(proj_count == 0)
	{
        	proj_count = 1;
	}
	else
	{
        	proj_count = (proj_count - 0) + (1 - 0);
	}

        console.log("classcount count",proj_count);

        projectid = classid +"-"+ cid +"-" +projtype +"-"+ proj_count;
        console.log("project id",projectid);


        pdbconnect.query("SELECT  * from project_master_tbl  where LOWER(project_id) = LOWER($1)",
        [projectid],function(err,resultset){
        if(err) throw err;
	var rcount = resultset.rowCount;
	console.log("rcount",rcount);
	if(rcount == 0)
	{
		var milname_arr = [];	
		var caper_arr = [];
		var diramt_arr = [];
		var milDate_arr = [];	
		
		pdbconnect.query("INSERT INTO project_master_tbl(project_id,cid,payment_type,customer_class,team_size,project_mgr,delivery_mgr,project_type,project_curr,start_date,end_date,rcre_user_id,rcre_time,lchg_user_id,lchg_time,del_flg,rate,po_number,remarks,closure_flg,sow_upld,chld_cnt,chld_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)",[projectid,cid,paymenttype,classid,projectsize,projectmgr,delmgr,projtype,projcur,projsdate,projcdate,rcreuserid,rcretime,lchguserid,lchgtime,'N',rateamt,ponumber,rmks,'N','N','0','N'],function(err,done){

        pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[projectmgr],function(err,result){
        projmgrname=result.rows['0'].emp_name;
        console.log("project manager name:::",projmgrname);

        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id=$1 ",[rcreuserid],function(err,result){
        createdgrname=result.rows['0'].emp_name;
        console.log("created user name:::",createdgrname);

        pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='MAIL' and comm_code_id='PROJ' ",function(err,result){
        maillist=result.rows['0'].comm_code_desc;
        console.log("mail list:::",maillist);

        pdbconnect.query("select project_mgr,delivery_mgr from project_master_tbl where project_id=$1",[projectid],function(err,result){
        projectmgr  = result.rows['0'].project_mgr;
        deliverymgr = result.rows['0'].delivery_mgr;
        console.log("projectmgr!!!",projectmgr);
        console.log("deliverymgr!!",deliverymgr);


        pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[deliverymgr],function(err,result){
        delname=result.rows['0'].emp_name;
        console.log("delname:::",delname);


        pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id =$1",[projectmgr],function(err,result){
        projectmgremail  = result.rows['0'].emp_email;
        console.log("projectmgremail--",projectmgremail);

        pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id =$1",[deliverymgr],function(err,result){
        deliverymgremail = result.rows['0'].emp_email;
        console.log("deliverymgremail--",deliverymgremail);

        pdbconnect.query("SELECT reporting_mgr from emp_master_tbl where emp_id=$1",[deliverymgr],function(err,result){
        delrpt=result.rows['0'].reporting_mgr;
        console.log("delivery manager's manager");

        pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id=$1",[delrpt],function(err,result){
        delrptmail=result.rows['0'].emp_email;
        console.log("delivery manager's manager email");

        pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='FIN'",function(err,result){
        finemail = result.rows['0'].comm_code_desc;
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


    		var mailOptions = {
                to: mailids,
                cc: cclist,
                from: 'amber@nurture.co.in',
                subject: 'Project Creation Notification ',
                text: 'Dear Team,\n\n' +
                'Product Creation Details.\n\n' +
                'Project ID:  ' + projectid + '\n' +
                'Delivery manager:  ' + deliverymgr + '-' + delname + '\n' +
                'Project manager:   ' + projectmgr + '-' + projmgrname + '\n' +
                'Project created by ' + rcreuserid + '-' + createdgrname + '.\n\n\n\n' +
                '- Regards,\n Amber'
               };

               smtpTransport.sendMail(mailOptions, function(err) {
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

	       req.flash('success',"Product Id created successfully with Project Id " + projectid + ".")
	       res.redirect('/projectModule/productdetails/productdetails');	
	       if(err) throw err;
 });

}
else
{
 req.flash('error',"Project Details Already Added")
 res.redirect(req.get('referer'));
}

});
});
};



module.exports = router;
