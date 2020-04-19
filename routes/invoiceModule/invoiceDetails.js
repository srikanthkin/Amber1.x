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
var dateFormat = require('dateformat');
var converter = require('number-to-words');
var cron = require('node-cron');
const roundTo = require('round-to');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////// PANEL CHOOSE /////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/chooseinvoiceDetails',function(req,res)
{

        var eid = req.user.rows['0'].user_id;

        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;

        if(emp_access != "F1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {

	pdbconnect.query("select * from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e,emp_master_tbl s where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and s.emp_id = p.project_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.status_flg='N' and m.del_flg='N' and p.del_flg='N' order by m.milestone_exp_date asc",function(err,result){
	invDueCount=result.rowCount;
	
	pdbconnect.query("select * from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e,emp_master_tbl s where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and s.emp_id = p.project_mgr and m.confirm_flg='Y' and m.paid_flg='N' and m.status_flg='Y' and m.del_flg='N' and p.del_flg='N' order by m.milestone_exp_date asc",function(err,result){
	invRaiseCount=result.rowCount;
	
	pdbconnect.query("select * from invoice_mast_tbl where confirm_flg='Y' and del_flg='N' and paid_flg='N' and status_flg='M'",function(err,result){
	invPaidCount=result.rowCount;
	
	pdbconnect.query("select * from invoice_mast_tbl where confirm_flg='Y' and del_flg='N' and paid_flg='N' and status_flg='M'",function(err,result){
	invreGenCount=result.rowCount;

	res.render('invoiceModule/chooseinvoiceDetails',{
	ename:req.user.rows['0'].user_name,
	eid:req.user.rows['0'].user_id,
	emp_access:emp_access,
	invDueCount:invDueCount,
	invRaiseCount:invRaiseCount,
	invPaidCount:invPaidCount,
	invreGenCount:invreGenCount
	});
	});
	});
	});
	});
	}
	});
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////INVOICE DUE PREV////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/invoiceduePrev',function(req,res)
{
        var eid = req.user.rows['0'].user_id;

        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;

        if(emp_access != "F1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {

        pdbconnect.query("select * from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.del_flg='N' and m.status_flg='N' and p.del_flg='N' and m.milestone_exp_date < current_date order by m.milestone_exp_date asc",function(err,result)   {
        row_count=result.rowCount;

        pdbconnect.query("select m.project_id,m.milestone_name from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.project_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.status_flg='N' and m.del_flg='N' and p.del_flg='N' and m.milestone_exp_date < current_date order by m.milestone_exp_date asc",function(err,result)        {
        pmid=result.rows;

        pdbconnect.query("select p.project_mgr,e.emp_name,m.project_id,m.milestone_name,m.capture_per,m.direct_amount,m.milestone_exp_date,p.project_curr from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.project_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.status_flg='N' and m.milestone_exp_date < current_date order by m.milestone_exp_date asc",function(err,result)     {
        parse=result.rows;

        pdbconnect.query("select p.delivery_mgr,e.emp_name,m.project_id,m.milestone_name,m.capture_per,m.direct_amount,m.milestone_exp_date,p.project_curr from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.status_flg='N' and m.milestone_exp_date < current_date order by m.milestone_exp_date asc",function(err,result)   {
        del=result.rows;

        pdbconnect.query("select e.emp_email from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.project_mgr and m.confirm_flg='N' and m.status_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.milestone_exp_date < current_date order by m.milestone_exp_date asc",function(err,result)    {
        prj_mgr_email=result.rows;

        pdbconnect.query("select e.emp_email from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and m.confirm_flg='N' and m.status_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.milestone_exp_date < current_date order by m.milestone_exp_date asc",function(err,result)    {
        del_mgr_email=result.rows;


                res.render('invoiceModule/invoiceduePrev',{
                emp_access:emp_access,
	        ename:req.user.rows['0'].user_name,
        	eid:req.user.rows['0'].user_id,
                row_count:row_count,
                pmid:pmid,
                parse:parse,
                del:del,
		prj_mgr_email:prj_mgr_email,
		del_mgr_email:del_mgr_email
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



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////INVOICE DUE TODAT /////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/invoicedueToday',function(req,res)
{

        var eid = req.user.rows['0'].user_id;

        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;

        if(emp_access != "F1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {
        
	pdbconnect.query("select * from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.status_flg='N' and m.milestone_exp_date = current_date order by m.milestone_exp_date asc",function(err,result)	{
	row_count=result.rowCount;
        
	pdbconnect.query("select m.project_id,m.milestone_name from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.project_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.status_flg='N' and m.del_flg='N' and p.del_flg='N' and m.milestone_exp_date = current_date order by m.milestone_exp_date asc",function(err,result)	{
	pmid=result.rows;

        pdbconnect.query("select p.project_mgr,e.emp_name,m.project_id,m.milestone_name,m.capture_per,m.direct_amount,m.milestone_exp_date,p.project_curr from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.project_mgr and m.confirm_flg='N' and m.status_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.milestone_exp_date = current_date order by m.milestone_exp_date asc",function(err,result)	{
	parse=result.rows;

        pdbconnect.query("select p.delivery_mgr,e.emp_name,m.project_id,m.milestone_name,m.capture_per,m.direct_amount,m.milestone_exp_date,p.project_curr from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and m.confirm_flg='N' and m.status_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.milestone_exp_date = current_date order by m.milestone_exp_date asc",function(err,result)	{
	del=result.rows;

	pdbconnect.query("select e.emp_email from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.project_mgr and m.confirm_flg='N' and m.status_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.milestone_exp_date = current_date order by m.milestone_exp_date asc",function(err,result)    {
	prj_mgr_email=result.rows;
	
	pdbconnect.query("select e.emp_email from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and m.confirm_flg='N' and m.status_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.milestone_exp_date = current_date order by m.milestone_exp_date asc",function(err,result)    {
	del_mgr_email=result.rows;

		res.render('invoiceModule/invoicedueToday',{
		emp_access:emp_access,
		ename:req.user.rows['0'].user_name,
        	eid:req.user.rows['0'].user_id,
		row_count:row_count,
		pmid:pmid,
		parse:parse,
		prj_mgr_email:prj_mgr_email,
		del_mgr_email:del_mgr_email,
		del:del
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////INVOICE DUE Next //////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/invoicedueNext',function(req,res)
{
        var eid = req.user.rows['0'].user_id;

        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;

        if(emp_access != "F1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {

        pdbconnect.query("select * from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.status_flg='N' and m.milestone_exp_date > current_date order by m.milestone_exp_date asc",function(err,result){
        row_count=result.rowCount;

        pdbconnect.query("select m.project_id,m.milestone_name from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.project_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.status_flg='N' and m.del_flg='N' and p.del_flg='N' and m.milestone_exp_date > current_date order by m.milestone_exp_date asc",function(err,result)        {
        pmid=result.rows;
	console.log("pmid",pmid);

        pdbconnect.query("select p.project_mgr,e.emp_name,m.project_id,m.milestone_name,m.capture_per,m.direct_amount,m.milestone_exp_date,p.project_curr from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.project_mgr and m.confirm_flg='N' and m.status_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.milestone_exp_date > current_date order by m.milestone_exp_date asc",function(err,result)     {
        parse=result.rows;

        pdbconnect.query("select p.delivery_mgr,e.emp_name,m.project_id,m.milestone_name,m.capture_per,m.direct_amount,m.milestone_exp_date,p.project_curr from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.milestone_exp_date > current_date order by m.milestone_exp_date asc",function(err,result)   {
        del=result.rows;

        pdbconnect.query("select e.emp_email from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.project_mgr and m.confirm_flg='N' and m.status_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.milestone_exp_date > current_date order by m.milestone_exp_date asc",function(err,result)    {
        prj_mgr_email=result.rows;

        pdbconnect.query("select e.emp_email from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and m.confirm_flg='N' and m.status_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.milestone_exp_date > current_date order by m.milestone_exp_date asc",function(err,result)    {
        del_mgr_email=result.rows;


                res.render('invoiceModule/invoicedueNext',{
                emp_access:emp_access,
	        ename:req.user.rows['0'].user_name,
        	eid:req.user.rows['0'].user_id,
                row_count:row_count,
                pmid:pmid,
                parse:parse,
                del:del,
		prj_mgr_email:prj_mgr_email,
		del_mgr_email:del_mgr_email

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



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////INVOICE TO BE RAISED ////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/invoiceRaise',function(req,res)
{

        var eid = req.user.rows['0'].user_id;
	var pid ="";
	var milestoneName="";

        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;

        if(emp_access != "F1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {
        
	pdbconnect.query("select * from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.project_mgr and m.confirm_flg='Y' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.status_flg='Y' order by m.milestone_exp_date asc",function(err,result){
        row_count=result.rowCount;
        
	pdbconnect.query("select m.project_id,m.milestone_name from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.project_mgr and m.confirm_flg='Y' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.status_flg='Y' order by m.milestone_exp_date asc",function(err,result){
        pmid=result.rows;

        pdbconnect.query("select p.project_mgr,e.emp_name,m.project_id,m.milestone_name,m.capture_per,m.confirm_amount,m.milestone_exp_date,p.project_curr,e.emp_email from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.project_mgr and m.confirm_flg='Y' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.status_flg='Y' order by m.milestone_exp_date asc",function(err,result){
        parse=result.rows;
        
	pdbconnect.query("select p.delivery_mgr,e.emp_name,m.project_id,m.milestone_name,m.capture_per,m.confirm_amount,m.milestone_exp_date,p.project_curr,e.emp_email from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and m.confirm_flg='Y' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.status_flg='Y' order by m.milestone_exp_date asc",function(err,result){
        del=result.rows;

        pdbconnect.query("select e.emp_email from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.project_mgr and m.confirm_flg='Y' and m.status_flg='Y' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' order by m.milestone_exp_date asc",function(err,result)    {
        prj_mgr_email=result.rows;

        pdbconnect.query("select e.emp_email from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and m.confirm_flg='Y' and m.status_flg='Y' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' order by m.milestone_exp_date asc",function(err,result)    {
        del_mgr_email=result.rows;



        res.render('invoiceModule/invoiceRaise',{
        emp_access:emp_access,
        ename:req.user.rows['0'].user_name,
        eid:req.user.rows['0'].user_id,
        row_count:row_count,
        parse:parse,
	del:del,
	pmid:pmid,
	prj_mgr_email:prj_mgr_email,
	del_mgr_email:del_mgr_email
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

///////////////////////////////////////////////// To Fetch PID And Milestone Name  //////////////////////////////////////////////////////////////////////

router.post('/getInvdet',getInvdet);
function getInvdet(req , res)
{
	var array = req.body.button;
	console.log("array value",array);
        
	pdbconnect.query("select m.project_id,m.milestone_name from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e,emp_master_tbl s where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and s.emp_id = p.project_mgr and m.confirm_flg='Y' and m.paid_flg='N' and m.del_flg='N' and m.status_flg='Y' and p.del_flg='N' order by m.milestone_exp_date asc",function(err,result){

        pid=result.rows[array].project_id;
	console.log("parse pid",pid);
        milestoneName=result.rows[array].milestone_name;
	console.log("parse mileName",milestoneName);

	pdbconnect.query("SELECT payment_type,project_curr from project_master_tbl where project_id = $1",[pid],function(err,result){
        payment_type=result.rows['0'].payment_type;
        project_curr=result.rows['0'].project_curr;
	console.log("payment_type",payment_type);
	console.log("project_curr",project_curr);
        
        pdbconnect.query("select * from invoice_mast_tbl where project_id = $1 and milestone_name=$2",[pid,milestoneName],function(err,result){
        var rcount=result.rowCount;

	if(rcount < 1)
	{
		if((payment_type != "FP")&&(payment_type != "TNM"))
		{
			req.flash('error',"Invoice Template Not Available")
			res.redirect('/invoiceModule/invoiceDetails/chooseinvoiceDetails');
		}

		if((payment_type == "FP")&&(project_curr == "INR"))
		{
			console.log("FP");
			console.log("parse pid",pid);
			console.log("parse mileName",milestoneName);

			var eid = req.user.rows['0'].user_id;
			var customer_class="";
			var address_1="";
			var address_2="";
			var country="";
			var city="";
			var pincode="";
			var billedTo="";
			var sacNo="";
			var clientGstin="";
			var cTax="";
			var sTax="";
			var gstTax="";
			var total="";
			var words="";
			var gstin="";
			var panNo="";
			var raisedBy="";
			var raisedBy_desc="";
			var invDate="";
			var invNum="";
			var invsrl="";
			var unique="";

			pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
			emp_access=result.rows['0'].user_type;
			
			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id = $1",[eid],function(err,result){
			raisedBy_desc=result.rows['0'].emp_name;

			pdbconnect.query("SELECT confirm_amount,capture_per from milestone_proj_tbl where project_id = $1 and milestone_name=$2",[pid,milestoneName],function(err,result){
			amt=result.rows['0'].confirm_amount;
			per=result.rows['0'].capture_per;

			pdbconnect.query("SELECT designation from emp_master_tbl where emp_id = $1 order by emp_id asc",[eid],function(err,result){
			desig=result.rows['0'].designation;

			pdbconnect.query("select comm_code_desc from common_code_tbl where comm_code_id=$1",[desig],function(err,resultset){
			desig_desc=resultset.rows['0'].comm_code_desc;

			pdbconnect.query("select customer_class,po_number,bill_addrline1,bill_addrline2,bill_country,bill_city,bill_pin_code from project_master_tbl where project_id=$1",[pid],function(err,resultset){

			customer_class:resultset.rows['0'].customer_class;
			invPO=resultset.rows['0'].po_number;
			address_1=resultset.rows['0'].bill_addrline1;
			address_2=resultset.rows['0'].bill_addrline2;
			country=resultset.rows['0'].bill_country;
			city=resultset.rows['0'].bill_city;
			pincode=resultset.rows['0'].bill_pin_code;

			//words = converter.toWords(total).toUpperCase();

			// invoice number generation logic

			pdbconnect.query("select * from invoice_mast_tbl where project_id=$1",[pid],function(err,result){
			mcount = result.rowCount;

			if(mcount == 0)
			{
				var date = new Date();
				var year = date.getFullYear();
				var nextyear = year + 1;
				var sysDate = new Date();
				var sysyear = sysDate.getFullYear();

				pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'INV'",function(err,result){
				var common_year=result.rows['0'].comm_code_id;

				if(common_year == sysyear)
				{
					unique = ((mcount - 0) + (1 - 0));
					var invgen = pid;
					var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;
					pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){

					res.render('invoiceModule/invoiceFP',{
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
					emp_access:emp_access,
					eid:eid,
					pid:pid,
					invDate:invDate,
					billedTo:billedTo,
					customer_class:customer_class,
					address_1:address_1,
					address_2:address_2,
					country:country,
					city:city,
					pincode:pincode,
					invPO:invPO,
					milestoneName:milestoneName,
					sacNo:sacNo,
					clientGstin:clientGstin,
					per:per,
					amt:amt,
					cTax:cTax,
					sTax:sTax,
					gstTax:gstTax,
					total:total,
					raisedBy:eid,
					raisedBy_desc:raisedBy_desc,
					desig:desig,
					desig_desc:desig_desc,
					gstin:gstin,
					panNo:panNo,
					per:per,
					amt:amt,
					invsrl:unique,
					invNum:invNum
					});
					});
				}
				else
				{

					var unique = "1";
					var invgen = pid;
					var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;

					pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){

                                        res.render('invoiceModule/invoiceFP',{
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
                                        emp_access:emp_access,
                                        eid:eid,
                                        pid:pid,
                                        invDate:invDate,
                                        billedTo:billedTo,
                                        customer_class:customer_class,
                                        address_1:address_1,
                                        address_2:address_2,
                                        country:country,
                                        city:city,
                                        pincode:pincode,
                                        invPO:invPO,
                                        milestoneName:milestoneName,
                                        sacNo:sacNo,
                                        clientGstin:clientGstin,
                                        per:per,
                                        amt:amt,
                                        cTax:cTax,
                                        sTax:sTax,
                                        gstTax:gstTax,
                                        total:total,
                                        raisedBy:eid,
                                        raisedBy_desc:raisedBy_desc,
                                        desig:desig,
                                        desig_desc:desig_desc,
                                        gstin:gstin,
                                        panNo:panNo,
                                        per:per,
                                        amt:amt,
                                        invsrl:unique,
                                        invNum:invNum
                                        });
                                        });
				}
				});
			}
			else
			{
				var date = new Date();
				var year = date.getFullYear();
				var nextyear = year + 1;

				var sysDate = new Date();
				var sysyear = sysDate.getFullYear();

				pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'INV'",function(err,result){
				var common_year=result.rows['0'].comm_code_id;

				if(common_year == sysyear)
				{
					console.log("pid sri",pid);
					pdbconnect.query("SELECT max(inv_srl_num) as srlno from invoice_mast_tbl where project_id = $1",[pid],function(err,result){

					var unique=result.rows['0'].srlno;

					console.log("unique before sri",unique);

					var unique=((unique - 0) + (1 - 0));

					var invgen = pid;
					var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;

					console.log("invNum",invNum);

					pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){

                                        res.render('invoiceModule/invoiceFP',{
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
                                        emp_access:emp_access,
                                        eid:eid,
                                        pid:pid,
                                        invDate:invDate,
                                        billedTo:billedTo,
                                        customer_class:customer_class,
                                        address_1:address_1,
                                        address_2:address_2,
                                        country:country,
                                        city:city,
                                        pincode:pincode,
                                        invPO:invPO,
                                        milestoneName:milestoneName,
                                        sacNo:sacNo,
                                        clientGstin:clientGstin,
                                        per:per,
                                        amt:amt,
                                        cTax:cTax,
                                        sTax:sTax,
                                        gstTax:gstTax,
                                        total:total,
                                        raisedBy:eid,
                                        raisedBy_desc:raisedBy_desc,
                                        desig:desig,
                                        desig_desc:desig_desc,
                                        gstin:gstin,
                                        panNo:panNo,
                                        per:per,
                                        amt:amt,
                                        invsrl:unique,
                                        invNum:invNum
                                        });
					});
					});
				}
				else
				{
					var unique = "1";
					var invgen = pid;
					var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;

					pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){

                                        res.render('invoiceModule/invoiceFP',{
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
                                        emp_access:emp_access,
                                        eid:eid,
                                        pid:pid,
                                        invDate:invDate,
                                        billedTo:billedTo,
                                        customer_class:customer_class,
                                        address_1:address_1,
                                        address_2:address_2,
                                        country:country,
                                        city:city,
                                        pincode:pincode,
                                        invPO:invPO,
                                        milestoneName:milestoneName,
                                        sacNo:sacNo,
                                        clientGstin:clientGstin,
                                        per:per,
                                        amt:amt,
                                        cTax:cTax,
                                        sTax:sTax,
                                        gstTax:gstTax,
                                        total:total,
                                        raisedBy:eid,
                                        raisedBy_desc:raisedBy_desc,
                                        desig:desig,
                                        desig_desc:desig_desc,
                                        gstin:gstin,
                                        panNo:panNo,
                                        per:per,
                                        amt:amt,
                                        invsrl:unique,
                                        invNum:invNum
                                        });
                                        });
					}
					});
					}
					});
					});
					});
					});
					});
					});
					});
		}

		if((payment_type == "FP")&&(project_curr == "USD"))
		{
			console.log("FPUSD");
			console.log("parse pid",pid);
			console.log("parse mileName",milestoneName);

			var eid = req.user.rows['0'].user_id;
			var customer_class="";
			var address_1="";
			var address_2="";
			var country="";
			var city="";
			var pincode="";
			var billedTo="";
			var cTax="";
			var sTax="";
			var gstTax="";
			var total="";
			var words="";
			var gstin="";
			var panNo="";
			var raisedBy="";
			var raisedBy_desc="";
			var invDate="";
			var invsrl="";
			var invNum="";

			pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
			emp_access=result.rows['0'].user_type;
			
			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id = $1",[eid],function(err,result){
			raisedBy_desc=result.rows['0'].emp_name;

			pdbconnect.query("SELECT confirm_amount,capture_per from milestone_proj_tbl where project_id = $1 and milestone_name=$2",[pid,milestoneName],function(err,result){
			amt=result.rows['0'].confirm_amount;
			per=result.rows['0'].capture_per;

			pdbconnect.query("SELECT designation from emp_master_tbl where emp_id = $1 order by emp_id asc",[eid],function(err,result){
			desig=result.rows['0'].designation;

			pdbconnect.query("select comm_code_desc from common_code_tbl where comm_code_id=$1",[desig],function(err,resultset){
			desig_desc=resultset.rows['0'].comm_code_desc;

			pdbconnect.query("select customer_class,po_number,bill_addrline1,bill_addrline2,bill_country,bill_city,bill_pin_code from project_master_tbl where project_id=$1",[pid],function(err,resultset){

			customer_class:resultset.rows['0'].customer_class;
			invPO=resultset.rows['0'].po_number;
			address_1=resultset.rows['0'].bill_addrline1;
			address_2=resultset.rows['0'].bill_addrline2;
			country=resultset.rows['0'].bill_country;
			city=resultset.rows['0'].bill_city;
			pincode=resultset.rows['0'].bill_pin_code;

                        pdbconnect.query("select * from invoice_mast_tbl where project_id=$1",[pid],function(err,result){
                        mcount = result.rowCount;

                        if(mcount == 0)
                        {
                                var date = new Date();
                                var year = date.getFullYear();
                                var nextyear = year + 1;
                                var sysDate = new Date();
                                var sysyear = sysDate.getFullYear();

                                pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'INV'",function(err,result){
                                var common_year=result.rows['0'].comm_code_id;

                                if(common_year == sysyear)
                                {
					unique = ((mcount - 0) + (1 - 0));

                                        var invgen = pid;
                                        var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;
                                        pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){

                                        res.render('invoiceModule/invoiceusdFP',{
                                        emp_access:emp_access,
                                        eid:eid,
                                        pid:pid,
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
                                        invDate:invDate,
                                        billedTo:billedTo,
                                        customer_class:customer_class,
                                        address_1:address_1,
                                        address_2:address_2,
                                        country:country,
                                        city:city,
                                        pincode:pincode,
                                        invPO:invPO,
                                        milestoneName:milestoneName,
                                        per:per,
                                        amt:amt,
                                        cTax:cTax,
                                        sTax:sTax,
                                        gstTax:gstTax,
                                        total:total,
                                        raisedBy:eid,
                                        raisedBy_desc:raisedBy_desc,
                                        desig:desig,
                                        desig_desc:desig_desc,
                                        gstin:gstin,
                                        panNo:panNo,
                                        per:per,
                                        amt:amt,
                                        invsrl:unique,
                                        invNum:invNum
                                        });
                                        });
                                }
                                else
                                {

                                        var unique = "1";
                                        var invgen = pid;
                                        var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;

                                        pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){

                                        res.render('invoiceModule/invoiceusdFP',{
                                        emp_access:emp_access,
                                        eid:eid,
                                        pid:pid,
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
                                        invDate:invDate,
                                        billedTo:billedTo,
                                        customer_class:customer_class,
                                        address_1:address_1,
                                        address_2:address_2,
                                        country:country,
                                        city:city,
                                        pincode:pincode,
                                        invPO:invPO,
                                        milestoneName:milestoneName,
                                        per:per,
                                        amt:amt,
                                        cTax:cTax,
                                        sTax:sTax,
                                        gstTax:gstTax,
                                        total:total,
                                        raisedBy:eid,
                                        raisedBy_desc:raisedBy_desc,
                                        desig:desig,
                                        desig_desc:desig_desc,
                                        gstin:gstin,
                                        panNo:panNo,
                                        per:per,
                                        amt:amt,
                                        invsrl:unique,
                                        invNum:invNum
                                        });
                                        });
                                }
                                });
                        }
                        else
                        {
                                var date = new Date();
                                var year = date.getFullYear();
                                var nextyear = year + 1;

                                var sysDate = new Date();
                                var sysyear = sysDate.getFullYear();

                                pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'INV'",function(err,result){
                                var common_year=result.rows['0'].comm_code_id;

                                if(common_year == sysyear)
                                {
                                        console.log("pid sri",pid);
                                        pdbconnect.query("SELECT max(inv_srl_num) as srlno from invoice_mast_tbl where project_id = $1",[pid],function(err,result){

                                        var unique=result.rows['0'].srlno;
                                        console.log("unique before sri",unique);

                                        var unique=((unique - 0) + (1 - 0));

                                        var invgen = pid;
                                        var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;

                                        console.log("invNum",invNum);

                                        pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){

                                        res.render('invoiceModule/invoiceusdFP',{
                                        emp_access:emp_access,
                                        eid:eid,
                                        pid:pid,
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
                                        invDate:invDate,
                                        billedTo:billedTo,
                                        customer_class:customer_class,
                                        address_1:address_1,
                                        address_2:address_2,
                                        country:country,
                                        city:city,
                                        pincode:pincode,
                                        invPO:invPO,
                                        milestoneName:milestoneName,
                                        per:per,
                                        amt:amt,
                                        cTax:cTax,
                                        sTax:sTax,
                                        gstTax:gstTax,
                                        total:total,
                                        raisedBy:eid,
                                        raisedBy_desc:raisedBy_desc,
                                        desig:desig,
                                        desig_desc:desig_desc,
                                        gstin:gstin,
                                        panNo:panNo,
                                        per:per,
                                        amt:amt,
                                        invsrl:unique,
                                        invNum:invNum
                                        });
                                        });
                                        });
                                }
                                else
                                {

                                        var unique = "1";
                                        var invgen = pid;
                                        var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;

                                        pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){

                                        res.render('invoiceModule/invoiceusdFP',{
                                        emp_access:emp_access,
                                        eid:eid,
                                        pid:pid,
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
                                        invDate:invDate,
                                        billedTo:billedTo,
                                        customer_class:customer_class,
                                        address_1:address_1,
                                        address_2:address_2,
                                        country:country,
                                        city:city,
                                        pincode:pincode,
                                        invPO:invPO,
                                        milestoneName:milestoneName,
                                        per:per,
                                        amt:amt,
                                        cTax:cTax,
                                        sTax:sTax,
                                        gstTax:gstTax,
                                        total:total,
                                        raisedBy:eid,
                                        raisedBy_desc:raisedBy_desc,
                                        desig:desig,
                                        desig_desc:desig_desc,
                                        gstin:gstin,
                                        panNo:panNo,
                                        per:per,
                                        amt:amt,
                                        invsrl:unique,
                                        invNum:invNum
                                        });
                                        });
                                        }
                                        });
                                        }
                                        });
                                        });
                                        });
                                        });
                                        });
                                        });
                                        });
                }

		if((payment_type == "TNM")&&(project_curr == "INR"))
		{
			console.log("TNM");
			console.log("parse pid",pid);
			console.log("parse mileName",milestoneName);

			var eid = req.user.rows['0'].user_id;

			var customer_class="";
			var address_1="";
			var address_2="";
			var country="";
			var city="";
			var pincode="";
			var billedTo="";
			var sacNo="";
			var clientGstin="";
			var cTax="";
			var sTax="";
			var gstTax="";
			var total="";
			var words="";
			var gstin="";
			var panNo="";
			var raisedBy="";
			var raisedBy_desc="";
			var invDate="";
			var grnNum="";

			pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
			emp_access=result.rows['0'].user_type;

			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id = $1",[eid],function(err,result){
			raisedBy_desc=result.rows['0'].emp_name;

			pdbconnect.query("SELECT confirm_amount,capture_per from milestone_proj_tbl where project_id = $1 and milestone_name=$2",[pid,milestoneName],function(err,result){
			amt=result.rows['0'].confirm_amount;
			per=result.rows['0'].capture_per;

			pdbconnect.query("SELECT designation from emp_master_tbl where emp_id = $1 order by emp_id asc",[eid],function(err,result){
			desig=result.rows['0'].designation;

			pdbconnect.query("select comm_code_desc from common_code_tbl where comm_code_id=$1",[desig],function(err,resultset){
			desig_desc=resultset.rows['0'].comm_code_desc;

			pdbconnect.query("select customer_class,po_number,bill_addrline1,bill_addrline2,bill_country,bill_city,bill_pin_code from project_master_tbl where project_id=$1",[pid],function(err,resultset){

			customer_class:resultset.rows['0'].customer_class;
			console.log("customer_class",customer_class);
			invPO=resultset.rows['0'].po_number;
			console.log("invPO",invPO);
			address_1=resultset.rows['0'].bill_addrline1;
			address_2=resultset.rows['0'].bill_addrline2;
			country=resultset.rows['0'].bill_country;
			city=resultset.rows['0'].bill_city;
			pincode=resultset.rows['0'].bill_pin_code;

                        pdbconnect.query("select * from invoice_mast_tbl where project_id=$1",[pid],function(err,result){
                        mcount = result.rowCount;

                        if(mcount == 0)
                        {
                                var date = new Date();
                                var year = date.getFullYear();
                                var nextyear = year + 1;
                                var sysDate = new Date();
                                var sysyear = sysDate.getFullYear();

                                pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'INV'",function(err,result){
                                var common_year=result.rows['0'].comm_code_id;

                                if(common_year == sysyear)
                                {
					unique = ((mcount - 0) + (1 - 0));

                                        var invgen = pid;
                                        var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;
                                        pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){

                                        res.render('invoiceModule/invoiceTNM',{
                                        emp_access:emp_access,
                                        eid:eid,
                                        pid:pid,
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
                                        invDate:invDate,
                                        billedTo:billedTo,
                                        customer_class:customer_class,
                                        address_1:address_1,
                                        address_2:address_2,
                                        country:country,
                                        city:city,
                                        pincode:pincode,
                                        invPO:invPO,
                                        grnNum:grnNum,
                                        milestoneName:milestoneName,
                                        sacNo:sacNo,
                                        clientGstin:clientGstin,
                                        per:per,
                                        amt:amt,
                                        cTax:cTax,
                                        sTax:sTax,
                                        gstTax:gstTax,
                                        total:total,
                                        raisedBy:eid,
                                        raisedBy_desc:raisedBy_desc,
                                        desig:desig,
                                        desig_desc:desig_desc,
                                        gstin:gstin,
                                        panNo:panNo,
                                        per:per,
                                        amt:amt,
                                        invsrl:unique,
                                        invNum:invNum
                                        });
                                        });
                                }
                                else
                                {

                                        var unique = "1";
                                        var invgen = pid;
                                        var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;

                                        pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){

                                        res.render('invoiceModule/invoiceTNM',{
                                        emp_access:emp_access,
                                        eid:eid,
                                        pid:pid,
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
                                        invDate:invDate,
                                        billedTo:billedTo,
                                        customer_class:customer_class,
                                        address_1:address_1,
                                        address_2:address_2,
                                        country:country,
                                        city:city,
                                        pincode:pincode,
                                        invPO:invPO,
                                        grnNum:grnNum,
                                        milestoneName:milestoneName,
                                        sacNo:sacNo,
                                        clientGstin:clientGstin,
                                        per:per,
                                        amt:amt,
                                        cTax:cTax,
                                        sTax:sTax,
                                        gstTax:gstTax,
                                        total:total,
                                        raisedBy:eid,
                                        raisedBy_desc:raisedBy_desc,
                                        desig:desig,
                                        desig_desc:desig_desc,
                                        gstin:gstin,
                                        panNo:panNo,
                                        per:per,
                                        amt:amt,
                                        invsrl:unique,
                                        invNum:invNum
                                        });
                                        });
                                }
                                });
                        }
                        else
                        {
                                var date = new Date();
                                var year = date.getFullYear();
                                var nextyear = year + 1;

                                var sysDate = new Date();
                                var sysyear = sysDate.getFullYear();

                                pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'INV'",function(err,result){
                                var common_year=result.rows['0'].comm_code_id;

                                if(common_year == sysyear)
                                {
                                        console.log("pid sri",pid);
                                        pdbconnect.query("SELECT max(inv_srl_num) as srlno from invoice_mast_tbl where project_id = $1",[pid],function(err,result){

                                        var unique=result.rows['0'].srlno;

                                        console.log("unique before sri",unique);

                                        var unique=((unique - 0) + (1 - 0));

                                        var invgen = pid;
                                        var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;

                                        console.log("invNum",invNum);

                                        pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){

                                        res.render('invoiceModule/invoiceTNM',{
                                        emp_access:emp_access,
                                        eid:eid,
                                        pid:pid,
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
                                        invDate:invDate,
                                        billedTo:billedTo,
                                        customer_class:customer_class,
                                        address_1:address_1,
                                        address_2:address_2,
                                        country:country,
                                        city:city,
                                        pincode:pincode,
                                        invPO:invPO,
                                        grnNum:grnNum,
                                        milestoneName:milestoneName,
                                        sacNo:sacNo,
                                        clientGstin:clientGstin,
                                        per:per,
                                        amt:amt,
                                        cTax:cTax,
                                        sTax:sTax,
                                        gstTax:gstTax,
                                        total:total,
                                        raisedBy:eid,
                                        raisedBy_desc:raisedBy_desc,
                                        desig:desig,
                                        desig_desc:desig_desc,
                                        gstin:gstin,
                                        panNo:panNo,
                                        per:per,
                                        amt:amt,
                                        invsrl:unique,
                                        invNum:invNum
                                        });
                                        });
                                        });
                                }
                                else
                                {
                                        var unique = "1";
                                        var invgen = pid;
                                        var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;

                                        pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){

                                        res.render('invoiceModule/invoiceTNM',{
                                        emp_access:emp_access,
                                        eid:eid,
                                        pid:pid,
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
                                        invDate:invDate,
                                        billedTo:billedTo,
                                        customer_class:customer_class,
                                        address_1:address_1,
                                        address_2:address_2,
                                        country:country,
                                        city:city,
                                        pincode:pincode,
                                        invPO:invPO,
                                        grnNum:grnNum,
                                        milestoneName:milestoneName,
                                        sacNo:sacNo,
                                        clientGstin:clientGstin,
                                        per:per,
                                        amt:amt,
                                        cTax:cTax,
                                        sTax:sTax,
                                        gstTax:gstTax,
                                        total:total,
                                        raisedBy:eid,
                                        raisedBy_desc:raisedBy_desc,
                                        desig:desig,
                                        desig_desc:desig_desc,
                                        gstin:gstin,
                                        panNo:panNo,
                                        per:per,
                                        amt:amt,
                                        invsrl:unique,
                                        invNum:invNum
                                        });
                                        });
                                        }
                                        });
                                        }
                                        });
                                        });
                                        });
                                        });
                                        });
                                        });
                                        });
                }


		if((payment_type == "TNM")&&(project_curr == "USD"))
		{
			console.log("TNM");
			console.log("parse pid",pid);
			console.log("parse mileName",milestoneName);

			var eid = req.user.rows['0'].user_id;

			var customer_class="";
			var address_1="";
			var address_2="";
			var country="";
			var city="";
			var pincode="";
			var billedTo="";
			var cTax="";
			var sTax="";
			var gstTax="";
			var total="";
			var words="";
			var gstin="";
			var panNo="";
			var raisedBy="";
			var raisedBy_desc="";
			var invDate="";
			var grnNum="";

			pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
			emp_access=result.rows['0'].user_type;

			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id = $1",[eid],function(err,result){
			raisedBy_desc=result.rows['0'].emp_name;

			pdbconnect.query("SELECT confirm_amount,capture_per from milestone_proj_tbl where project_id = $1 and milestone_name=$2",[pid,milestoneName],function(err,result){
			amt=result.rows['0'].confirm_amount;
			per=result.rows['0'].capture_per;

			pdbconnect.query("SELECT designation from emp_master_tbl where emp_id = $1 order by emp_id asc",[eid],function(err,result){
			desig=result.rows['0'].designation;
			pdbconnect.query("select comm_code_desc from common_code_tbl where comm_code_id=$1",[desig],function(err,resultset){
			desig_desc=resultset.rows['0'].comm_code_desc;

			pdbconnect.query("select customer_class,po_number,bill_addrline1,bill_addrline2,bill_country,bill_city,bill_pin_code from project_master_tbl where project_id=$1",[pid],function(err,resultset){

			customer_class:resultset.rows['0'].customer_class;
			console.log("customer_class",customer_class);
			invPO=resultset.rows['0'].po_number;
			console.log("invPO",invPO);
			address_1=resultset.rows['0'].bill_addrline1;
			address_2=resultset.rows['0'].bill_addrline2;
			country=resultset.rows['0'].bill_country;
			city=resultset.rows['0'].bill_city;
			pincode=resultset.rows['0'].bill_pin_code;

                        pdbconnect.query("select * from invoice_mast_tbl where project_id=$1",[pid],function(err,result){
                        mcount = result.rowCount;

                        if(mcount == 0)
                        {
                                var date = new Date();
                                var year = date.getFullYear();
                                var nextyear = year + 1;
                                var sysDate = new Date();
                                var sysyear = sysDate.getFullYear();

                                pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'INV'",function(err,result){
                                var common_year=result.rows['0'].comm_code_id;

                                if(common_year == sysyear)
                                {
					unique = ((mcount - 0) + (1 - 0));

                                        var invgen = pid;
                                        var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;
                                        pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){

                                        res.render('invoiceModule/invoiceusdTNM',{
                                        emp_access:emp_access,
                                        eid:eid,
                                        pid:pid,
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
                                        invDate:invDate,
                                        billedTo:billedTo,
                                        customer_class:customer_class,
                                        address_1:address_1,
                                        address_2:address_2,
                                        country:country,
                                        city:city,
                                        pincode:pincode,
                                        invPO:invPO,
                                        grnNum:grnNum,
                                        milestoneName:milestoneName,
                                        per:per,
                                        amt:amt,
                                        cTax:cTax,
                                        sTax:sTax,
                                        gstTax:gstTax,
                                        total:total,
                                        raisedBy:eid,
                                        raisedBy_desc:raisedBy_desc,
                                        desig:desig,
                                        desig_desc:desig_desc,
                                        gstin:gstin,
                                        panNo:panNo,
                                        per:per,
                                        amt:amt,
                                        invsrl:unique,
                                        invNum:invNum
                                        });
                                        });
                                }
                                else
                                {

                                        var unique = "1";
                                        var invgen = pid;
                                        var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;

                                        pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){

                                        res.render('invoiceModule/invoiceusdTNM',{
                                        emp_access:emp_access,
                                        eid:eid,
                                        pid:pid,
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
                                        invDate:invDate,
                                        billedTo:billedTo,
                                        customer_class:customer_class,
                                        address_1:address_1,
                                        address_2:address_2,
                                        country:country,
                                        city:city,
                                        pincode:pincode,
                                        invPO:invPO,
                                        grnNum:grnNum,
                                        milestoneName:milestoneName,
                                        per:per,
                                        amt:amt,
                                        cTax:cTax,
                                        sTax:sTax,
                                        gstTax:gstTax,
                                        total:total,
                                        raisedBy:eid,
                                        raisedBy_desc:raisedBy_desc,
                                        desig:desig,
                                        desig_desc:desig_desc,
                                        gstin:gstin,
                                        panNo:panNo,
                                        per:per,
                                        amt:amt,
                                        invsrl:unique,
                                        invNum:invNum

                                        });
                                        });
                                }
                                });
                        }
                        else
                        {
                                var date = new Date();
                                var year = date.getFullYear();
                                var nextyear = year + 1;

                                var sysDate = new Date();
                                var sysyear = sysDate.getFullYear();

                                pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'INV'",function(err,result){
                                var common_year=result.rows['0'].comm_code_id;

                                if(common_year == sysyear)
                                {
                                        console.log("pid sri",pid);
                                        pdbconnect.query("SELECT max(inv_srl_num) as srlno from invoice_mast_tbl where project_id = $1",[pid],function(err,result){

                                        var unique=result.rows['0'].srlno;

                                        console.log("unique before sri",unique);

                                        var unique=((unique - 0) + (1 - 0));

                                        var invgen = pid;
                                        var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;

                                        console.log("invNum",invNum);

                                        pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){


                                        res.render('invoiceModule/invoiceusdTNM',{
                                        emp_access:emp_access,
                                        eid:eid,
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
                                        pid:pid,
                                        invDate:invDate,
                                        billedTo:billedTo,
                                        customer_class:customer_class,
                                        address_1:address_1,
                                        address_2:address_2,
                                        country:country,
                                        city:city,
                                        pincode:pincode,
                                        invPO:invPO,
                                        grnNum:grnNum,
                                        milestoneName:milestoneName,
                                        per:per,
                                        amt:amt,
                                        cTax:cTax,
                                        sTax:sTax,
                                        gstTax:gstTax,
                                        total:total,
                                        raisedBy:eid,
                                        raisedBy_desc:raisedBy_desc,
                                        desig:desig,
                                        desig_desc:desig_desc,
                                        gstin:gstin,
                                        panNo:panNo,
                                        per:per,
                                        amt:amt,
                                        invsrl:unique,
                                        invNum:invNum
                                        });
                                        });
                                        });
                                }
                                else
                                {
                                        var unique = "1";
                                        var invgen = pid;
                                        var invNum = invgen + "/" + unique + "/" + year + "-" + nextyear;

                                        pdbconnect.query("update common_code_tbl set comm_code_id=$1 where code_id='INV'",[sysyear],function(err,result){

                                        res.render('invoiceModule/invoiceusdTNM',{
                                        emp_access:emp_access,
                                        eid:eid,
                                        pid:pid,
					ename:req.user.rows['0'].user_name,
					eid:req.user.rows['0'].user_id,
                                        invDate:invDate,
                                        billedTo:billedTo,
                                        customer_class:customer_class,
                                        address_1:address_1,
                                        address_2:address_2,
                                        country:country,
                                        city:city,
                                        pincode:pincode,
                                        invPO:invPO,
                                        grnNum:grnNum,
                                        milestoneName:milestoneName,
                                        per:per,
                                        amt:amt,
                                        cTax:cTax,
                                        sTax:sTax,
                                        gstTax:gstTax,
                                        total:total,
                                        raisedBy:eid,
                                        raisedBy_desc:raisedBy_desc,
                                        desig:desig,
                                        desig_desc:desig_desc,
                                        gstin:gstin,
                                        panNo:panNo,
                                        per:per,
                                        amt:amt,
                                        invsrl:unique,
                                        invNum:invNum
                                        });
                                        });
                                        }
                                        });
                                        }
                                        });
                                        });
                                        });
                                        });
                                        });
                                        });
                                        });
                }
        }
	else
	{
		req.flash('error',"Invoice has already been Generated for this Project Id " + pid + " and Milestone Name " + milestoneName + " awaiting for Payment")
		res.redirect('/invoiceModule/invoiceDetails/chooseinvoiceDetails');
	}
	});
	});
	});
};

router.get('/percentage',percentage);
function percentage(req,res){
        var milestoneName   =       req.query.milestoneName;
        console.log(milestoneName);
        pdbconnect.query("SELECT capture_per from milestone_proj_tbl where milestone_name = $1 order by project_id asc",[milestoneName],function(err,percentage){
        if(err){
        console.error('Error with table query', err);
        } else {
        console.log("result",percentage);
        percentage      =       percentage.rows['0'].capture_per;
        }
        res.json({key:percentage});
        });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// FP Type OF INVOICE INR ////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/invoiceFP',function(req,res)
{

        var eid = req.user.rows['0'].user_id;
        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;

        res.render('invoiceModule/chooseinvoiceDetails',{
        ename:req.user.rows['0'].user_name,
        eid:req.user.rows['0'].user_id,
        emp_access:emp_access
        });
        });
});

router.post('/addfpInv',addfpInv);
function addfpInv(req , res)
{
        var eid = req.user.rows['0'].user_id;
        var pid = req.body.pid;
        var invNum = req.body.invNum;
	console.log("gen inv",invNum);
        var invsrl = req.body.invsrl;
        var invDate = req.body.invDate;
        var billedTo = req.body.billedTo;
        var invPO = req.body.invPO;
        var milestoneName = req.body.milestoneName;
        var particulars = req.body.particulars;
        var sacNo = req.body.sacNo;
	var clientGstin = req.body.clientGstin;
        var per = req.body.per;
        var amt = req.body.amt;
        var cTax = req.body.cTax;
        var sTax = req.body.sTax;
	var gstTax = req.body.gstTax;
        var total = req.body.total;
        var raisedBy = req.body.raisedBy;
        var desig = req.body.desig;
        var gstin = req.body.gstin;
        var panNo = req.body.panNo;
	var invNum = req.body.invNum;
	var invsrl = req.body.invsrl;
	var now = new Date();
	var rcreuserid=req.user.rows['0'].user_id;
	var rcretime=now;
	var lchguserid=req.user.rows['0'].user_id;
	var lchgtime=now;
	var payment_type = "FP";
	var confirm_flg="Y";
	var paid_flg="N";
	var del_flg="N";
	var project_curr="INR";

        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;
        
	pdbconnect.query("SELECT * from invoice_mast_tbl where project_id = $1 and milestone_name=$2",[pid,milestoneName],function(err,result){
        rowCnt=result.rowCount;

	if(rowCnt == "0")
	{
		pdbconnect.query("INSERT INTO invoice_mast_tbl(project_id,invoice_date,billed_to,invoice_po,milestone_name,particulars,sac_num,milestone_per,milestone_amt,total,raised_by,designation,gstin_num,pan_num,payment_type,confirm_flg,paid_flg,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,central_tax,state_tax,igst_tax,project_curr,client_gstin,invoice_num,inv_srl_num,status_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)",[pid,invDate,billedTo,invPO,milestoneName,particulars,sacNo,per,amt,total,raisedBy,desig,gstin,panNo,payment_type,confirm_flg,paid_flg,del_flg,rcreuserid,rcretime,lchguserid,lchgtime,cTax,sTax,gstTax,project_curr,clientGstin,invNum,invsrl,'M'],function(err,done)
		{
			if(err) throw err;

			pdbconnect.query("update milestone_proj_tbl set confirm_flg='Y',paid_flg='N',del_flg='N',status_flg='M' where project_id=$1 and milestone_name=$2",[pid,milestoneName],function(err,done)
			{
				if(err) throw err;

				var calctax = "";
				var calstax = "";
				var diff ="";
				
		
				if((cTax != "")&&(sTax != ""))
				{
					calctax = ((amt - 0)*(cTax - 0)/(100-0));
					calctax = calctax.toFixed(2);
					calstax = ((amt - 0)*(sTax - 0)/(100-0));
					calstax = calstax.toFixed(2);
				}
				else
				{
					diff = ((amt - 0)*(gstTax)/(100 - 0)); 
					diff = diff.toFixed(2);
				}

				amt = parseFloat(amt);
				amt = amt.toFixed(2);	

				var total_words = converter.toWords(total).toUpperCase();
				
				pdbconnect.query("SELECT comm_code_desc from common_code_tbl where comm_code_id = $1",[desig],function(err,result){
				desig=result.rows['0'].comm_code_desc;

				// logic of generation ends here

				res.render('invoiceModule/generateinrReport',{
				pid:pid,
				ename:req.user.rows['0'].user_name,
				eid:req.user.rows['0'].user_id,
				invNum:invNum,
				invDate:invDate,
				billedTo:billedTo,
				invPO:invPO,
				particulars:particulars,
				sacNo:sacNo,
				amt:amt,
				clientGstin:clientGstin,
				cTax:cTax,
				sTax:sTax,
				gstTax:gstTax,
				calctax:calctax,
				calstax:calstax,
				diff:diff,
				total:total,
				total_words:total_words,
				raisedBy:raisedBy,
				desig:desig,
				gstin:gstin,
				project_curr:project_curr,
				panNo:panNo
				});
				});

			});
		});
	}
	else
	{

                pdbconnect.query("UPDATE invoice_mast_tbl set project_id=$1,invoice_date=$2,billed_to=$3,invoice_po=$4,milestone_name=$5,particulars=$6,sac_num=$7,milestone_per=$8,milestone_amt=$9,total=$10,raised_by=$11,designation=$12,gstin_num=$13,pan_num=$14,payment_type=$15,confirm_flg=$16,paid_flg=$17,del_flg=$18,rcre_user_id=$19,rcre_time=$20,lchg_user_id=$21,lchg_time=$22,central_tax=$23,state_tax=$24,igst_tax=$25,project_curr=$26,client_gstin=$27,invoice_num=$28,inv_srl_num=$29,status_flg=$30 where project_id = $1 and milestone_name = $5 ",[pid,invDate,billedTo,invPO,milestoneName,particulars,sacNo,per,amt,total,raisedBy,desig,gstin,panNo,payment_type,confirm_flg,paid_flg,del_flg,rcreuserid,rcretime,lchguserid,lchgtime,cTax,sTax,gstTax,project_curr,clientGstin,invNum,invsrl,'M'],function(err,done)
                {
                        if(err) throw err;


                        pdbconnect.query("update milestone_proj_tbl set confirm_flg='Y',paid_flg='N',del_flg='N',status_flg='M' where project_id=$1 and milestone_name=$2",[pid,milestoneName],function(err,done)
                        {
                                if(err) throw err;
                                
				pdbconnect.query("SELECT comm_code_desc from common_code_tbl where comm_code_id = $1",[desig],function(err,result){
                                desig=result.rows['0'].comm_code_desc;

                                var calctax = "";
                                var calstax = "";
                                var diff ="";


                                if((cTax != "")&&(sTax != ""))
                                {
                                        calctax = ((amt - 0)*(cTax - 0)/(100-0));
                                        calctax = calctax.toFixed(2);
                                        calstax = ((amt - 0)*(sTax - 0)/(100-0));
                                        calstax = calstax.toFixed(2);
                                }
                                else
                                {
                                        diff = ((amt - 0)*(gstTax)/(100 - 0));
                                        diff = diff.toFixed(2);
                                }

                                amt = parseFloat(amt);
                                amt = amt.toFixed(2);
                                var total_words = converter.toWords(total).toUpperCase();

                                res.render('invoiceModule/generateinrReport',{
				pid:pid,
				ename:req.user.rows['0'].user_name,
				eid:req.user.rows['0'].user_id,
                                invNum:invNum,
                                invDate:invDate,
                                billedTo:billedTo,
                                invPO:invPO,
                                particulars:particulars,
                                sacNo:sacNo,
                                amt:amt,
                                clientGstin:clientGstin,
                                cTax:cTax,
                                sTax:sTax,
                                gstTax:gstTax,
                                calctax:calctax,
                                calstax:calstax,
                                diff:diff,
                                total:total,
                                total_words:total_words,
                                raisedBy:raisedBy,
                                desig:desig,
                                gstin:gstin,
				project_curr:project_curr,
                                panNo:panNo
 					});
                                });
                        });
                });
	}
	});
	});
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// FP Type OF INVOICE INR ////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/invoiceusdFP',function(req,res)
{

        var eid = req.user.rows['0'].user_id;
        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;

        res.render('invoiceModule/invoiceDetails',{
        ename:req.user.rows['0'].user_name,
        eid:req.user.rows['0'].user_id,
        emp_access:emp_access
        });
        });
});


router.post('/addfpusdInv',addfpusdInv);
function addfpusdInv(req , res)
{
        var eid = req.user.rows['0'].user_id;
        var pid = req.body.pid;
        var invDate = req.body.invDate;
        var billedTo = req.body.billedTo;
        var invPO = req.body.invPO;
        var milestoneName = req.body.milestoneName;
        var particulars = req.body.particulars;
        var per = req.body.per;
        var amt = req.body.amt;
        var newTax = req.body.newTax;
        var total = req.body.total;
        var raisedBy = req.body.raisedBy;
        var desig = req.body.desig;
        var gstin = req.body.gstin;
        var panNo = req.body.panNo;
        var invNum = req.body.invNum;
        var invsrl = req.body.invsrl;
        var now = new Date();
        var rcreuserid=req.user.rows['0'].user_id;
        var rcretime=now;
        var lchguserid=req.user.rows['0'].user_id;
        var lchgtime=now;
        var payment_type="FP";
        var confirm_flg="Y";
        var paid_flg="N";
        var del_flg="N";
	var project_curr="USD";

        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;

        pdbconnect.query("SELECT * from invoice_mast_tbl where project_id = $1 and milestone_name=$2",[pid,milestoneName],function(err,result){
        rowCnt=result.rowCount;

        if(rowCnt == "0")
        {
        	pdbconnect.query("INSERT INTO invoice_mast_tbl(project_id,invoice_date,billed_to,invoice_po,milestone_name,particulars,milestone_per,milestone_amt,total,raised_by,designation,gstin_num,pan_num,payment_type,confirm_flg,paid_flg,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,usd_tax,project_curr,invoice_num,inv_srl_num,status_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)",[pid,invDate,billedTo,invPO,milestoneName,particulars,per,amt,total,raisedBy,desig,gstin,panNo,payment_type,confirm_flg,paid_flg,del_flg,rcreuserid,rcretime,lchguserid,lchgtime,newTax,project_curr,invNum,invsrl,'M'],function(err,done)
                {
                        if(err) throw err;

                        pdbconnect.query("update milestone_proj_tbl set confirm_flg='Y',paid_flg='N',del_flg='N',status_flg='M' where project_id=$1 and milestone_name=$2",[pid,milestoneName],function(err,done)
                        {
                                if(err) throw err;

                                var calctax = "";

                                if(newTax != "")
                                {
                                        calctax = ((amt - 0)*(newTax - 0)/(100-0));
                                        calctax = calctax.toFixed(2);
                                }

                                amt = parseFloat(amt);
                                amt = amt.toFixed(2);

                                var total_words = converter.toWords(total).toUpperCase();

                                pdbconnect.query("SELECT comm_code_desc from common_code_tbl where comm_code_id = $1",[desig],function(err,result){
                                desig=result.rows['0'].comm_code_desc;


                                res.render('invoiceModule/generateusdReport',{
				ename:req.user.rows['0'].user_name,
				eid:req.user.rows['0'].user_id,
				pid:pid,
                                invNum:invNum,
                                invDate:invDate,
                                billedTo:billedTo,
				invPO:invPO,
                                particulars:particulars,
                                amt:amt,
				newTax:newTax,
                                calctax:calctax,
                                total:total,
                                total_words:total_words,
                                raisedBy:raisedBy,
                                desig:desig,
                                gstin:gstin,
				project_curr:project_curr,
                                panNo:panNo
                                });
                                });

                        });
                });
        }
        else
        {
        		pdbconnect.query("update invoice_mast_tbl set project_id=$1,invoice_date=$2,billed_to=$3,invoice_po=$4,milestone_name=$5,particulars=$6,milestone_per=$7,milestone_amt=$8,total=$9,raised_by=$10,designation=$11,gstin_num=$12,pan_num=$13,payment_type=$14,confirm_flg=$15,paid_flg=$16,del_flg=$17,rcre_user_id=$18,rcre_time=$19,lchg_user_id=$20,lchg_time=$21,usd_tax=$22,project_curr=$23,invoice_num=$24,inv_srl_num=$25,status_flg=$26 where project_id=$1 and milestone_name=$5",[pid,invDate,billedTo,invPO,milestoneName,particulars,per,amt,total,raisedBy,desig,gstin,panNo,payment_type,confirm_flg,paid_flg,del_flg,rcreuserid,rcretime,lchguserid,lchgtime,newTax,project_curr,invNum,invsrl,'M'],function(err,done)
                {
                        if(err) throw err;


                        pdbconnect.query("update milestone_proj_tbl set confirm_flg='Y',paid_flg='N',del_flg='N',status_flg='M' where project_id=$1 and milestone_name=$2",[pid,milestoneName],function(err,done)
                        {
                                if(err) throw err;

                                pdbconnect.query("SELECT comm_code_desc from common_code_tbl where comm_code_id = $1",[desig],function(err,result){
                                desig=result.rows['0'].comm_code_desc;

                                var calctax = "";

                                if(newTax != "")
                                {
                                        calctax = ((amt - 0)*(newTax - 0)/(100-0));
                                        calctax = calctax.toFixed(2);
                                }

                                amt = parseFloat(amt);
                                amt = amt.toFixed(2);

                                var total_words = converter.toWords(total).toUpperCase();

                                res.render('invoiceModule/generateusdReport',{
				ename:req.user.rows['0'].user_name,
        			eid:req.user.rows['0'].user_id,
				pid:pid,
                                invNum:invNum,
                                invDate:invDate,
                                billedTo:billedTo,
                                invPO:invPO,
                                particulars:particulars,
                                amt:amt,
                                newTax:newTax,
                                calctax:calctax,
                                total:total,
                                total_words:total_words,
                                raisedBy:raisedBy,
				project_curr:project_curr,
                                desig:desig,
                                gstin:gstin,
                                panNo:panNo
                                        });
                                });
                        });
                });
        }
        });
        });
};



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////INVOICE TO BE PAID //////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/invoicePay',function(req,res)
{

        var eid = req.user.rows['0'].user_id;
        var pid ="";
        var milestoneName="";

        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;

        if(emp_access != "F1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {
		pdbconnect.query("select * from invoice_mast_tbl where confirm_flg='Y' and paid_flg='N' and del_flg='N' and status_flg='M' order by invoice_date asc",function(err,result){
		parse=result.rows;
		parse_count=result.rowCount;

		res.render('invoiceModule/invoicePay',{
		emp_access:emp_access,
		ename:req.user.rows['0'].user_name,
		eid:req.user.rows['0'].user_id,
		parse_count:parse_count,
		parse:parse
						     });

	       });
       }
       });

});

router.post('/markPay',markPay);
function markPay(req , res)
{
        var array = req.body.button;
	var confirm_flg = "Y";
	var paid_flg="Y";
	var del_flg="N";
	var paymentDate=req.body.paymentDate;
	var PayStatus=req.body.PayStatus;
	var remarks=req.body.remarks;
	var now = new Date();
        var rcreuserid=req.user.rows['0'].user_id;
        var rcretime=now;
        var lchguserid=req.user.rows['0'].user_id;
        var lchgtime=now;

        pdbconnect.query("select project_id,milestone_name from invoice_mast_tbl where confirm_flg='Y' and paid_flg='N' and del_flg='N'",function(err,result){
        pid=result.rows[array].project_id;
        milestoneName=result.rows[array].milestone_name;


	pdbconnect.query("update invoice_mast_tbl set confirm_flg=$3,paid_flg=$4,del_flg=$5,rcre_user_id=$6,rcre_time=$7,lchg_user_id=$8,lchg_time=$9,payment_date=$10,remarks=$11,status_flg=$12 where project_id=$1 and milestone_name=$2",[pid,milestoneName,confirm_flg,paid_flg,del_flg,rcreuserid,rcretime,lchguserid,lchgtime,paymentDate,remarks,PayStatus],function(err,done)
	{
        	if(err) throw err;

              pdbconnect.query("update milestone_proj_tbl set confirm_flg='Y',paid_flg='Y',del_flg='N',status_flg=$3 where project_id=$1 and milestone_name=$2",[pid,milestoneName,PayStatus],function(err,done)
              {
        	if(err) throw err;
		
		if(PayStatus == "P")
		{

			pdbconnect.query("update milestone_proj_tbl set paid_date=$3 where project_id=$1 and milestone_name=$2",[pid,milestoneName,paymentDate],function(err,done){
			});

			req.flash('success',"Project Id: " + pid + " with Milestone Name: " + milestoneName + " has been successfully Marked As Paid.")
			res.redirect('/invoiceModule/invoiceDetails/chooseinvoiceDetails');
		}
		else
		{
			// mail to finance team from common code tbl

			pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='FIN'",function(err,done){
			var FinEmail = done.rows['0'].comm_code_desc;
			
			// fetching list of respective dm and pm
			 
		        pdbconnect.query("select delivery_mgr,project_mgr from project_master_tbl where project_id=$1",[pid],function(err,result){
        		var del_manager = result.rows['0'].delivery_mgr;
		        var prj_manager = result.rows['0'].project_mgr;
		        
			pdbconnect.query("select emp_name from emp_master_tbl where emp_id=$1",[del_manager],function(err,result){
        		var del_manager_name = result.rows['0'].emp_name;
			
			pdbconnect.query("select emp_name from emp_master_tbl where emp_id=$1",[prj_manager],function(err,result){
        		var prj_manager_name = result.rows['0'].emp_name;
			
			// fetching list of respective dm's email
	
			pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id =$1",[del_manager],function(err,result){
			var del_manager_email = result.rows['0'].emp_email;
			
			// fetching list of respective dm's reporting manager
			
        		pdbconnect.query("SELECT reporting_mgr from emp_master_tbl where emp_id=$1",[del_manager],function(err,result){
        		var del_manager_rpt = result.rows['0'].reporting_mgr;
			
			// fetching list of respective dm's reporting manager's email

        		pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id=$1",[del_manager_rpt],function(err,result){
        		var del_manager_rpt_mail = result.rows['0'].emp_email;
			
			// combining dm's and dm's reporting manager to cc in mail

			var cclist = del_manager_email + "," + del_manager_rpt_mail;


                        var smtpTransport = nodemailer.createTransport('SMTP',{
                        service: 'gmail',
                        auth:
                        {
                                user: 'amber@nurture.co.in',
                                pass: 'nurture@123'
                        }
                        });

                        var mailOptions = {
						to: FinEmail,
						cc: cclist, 
                                                from: 'amber@nurture.co.in',
                                                subject: 'Milestone Rejection before Payment',
                                                html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF3AN6vk9aZnh5KQ_KPzHWYwlVWNNCxzAFK-994yO9WY6UwfiSIA" height="85"><br><br>' +
                                                '<h3>Rejected Milestone Details<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Project Id</th> ' +
                                                                '<th style="border: 10px solid black;">' + pid + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Milestone Name </td> ' +
                                                                '<th style="border: 10px solid black;">' + milestoneName + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Delivery Manager</th> ' +
                                                                '<th style="border: 10px solid black;">' + del_manager + '-' + del_manager_name + '</th>' +

                                                        '</tr>' +


                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Project Manager</th> ' +
                                                                '<th style="border: 10px solid black;">' + prj_manager + '-' + prj_manager_name + '</th>' +

                                                        '</tr>' +


                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Rejection Remarks </td> ' +
                                                                '<th style="border: 10px solid black;">' + remarks + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
                                         };


                       smtpTransport.sendMail(mailOptions, function(err) {
                       });

		       req.flash('success',"Project Id: " + pid + " with Milestone Name: " + milestoneName + " has been successfully Marked As Rejected.")
		       res.redirect('/invoiceModule/invoiceDetails/chooseinvoiceDetails');
			
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
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////// INVOICE DUE LIST ////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/invoicedueList',function(req,res)
{

        var eid = req.user.rows['0'].user_id;

        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;

        if(emp_access != "F1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {


        pdbconnect.query("select * from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e,emp_master_tbl s where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and s.emp_id = p.project_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.status_flg='N' and m.milestone_exp_date < current_date",function(err,result){
        prevCount=result.rowCount;

        pdbconnect.query("select * from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e,emp_master_tbl s where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and s.emp_id = p.project_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.status_flg='N' and m.milestone_exp_date > current_date",function(err,result){
        nextCount=result.rowCount;

        pdbconnect.query("select * from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e,emp_master_tbl s where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and s.emp_id = p.project_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' and m.status_flg='N' and m.milestone_exp_date = current_date",function(err,result){
        todayCount=result.rowCount;

        res.render('invoiceModule/invoicedueList',{
        ename:req.user.rows['0'].user_name,
        eid:req.user.rows['0'].user_id,
        emp_access:emp_access,
	prevCount:prevCount,
	nextCount:nextCount,
	todayCount:todayCount
        });
        });
        });
        });
	}
        });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////// INVOICE TNM INR ///////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/invoiceTNM',function(req,res)
{

        var eid = req.user.rows['0'].user_id;
        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;

        res.render('invoiceModule/chooseinvoiceDetails',{
        ename:req.user.rows['0'].user_name,
        eid:req.user.rows['0'].user_id,
        emp_access:emp_access
        });
        });
});

router.post('/addtnmInv',addtnmInv);
function addtnmInv(req , res)
{
        var eid = req.user.rows['0'].user_id;
        var pid = req.body.pid;
        var invDate = req.body.invDate;
        var billedTo = req.body.billedTo;
        var invPO = req.body.invPO;
        var grnNum = req.body.grnNum;
        var milestoneName = req.body.milestoneName;
        var particulars = req.body.particulars;
        var sacNo = req.body.sacNo;
        var clientGstin = req.body.clientGstin;
        var per = req.body.per;
        var amt = req.body.amt;
        var cTax = req.body.cTax;
        var sTax = req.body.sTax;
        var gstTax = req.body.gstTax;
        var total = req.body.total;
        var raisedBy = req.body.raisedBy;
        var desig = req.body.desig;
        var gstin = req.body.gstin;
        var panNo = req.body.panNo;
        var invNum = req.body.invNum;
        var invsrl = req.body.invsrl;
        var now = new Date();
        var rcreuserid=req.user.rows['0'].user_id;
        var rcretime=now;
        var lchguserid=req.user.rows['0'].user_id;
        var lchgtime=now;
        var payment_type = "TNM";
        var confirm_flg="Y";
        var paid_flg="N";
        var del_flg="N";
        var project_curr="INR";

        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;

        pdbconnect.query("SELECT * from invoice_mast_tbl where project_id = $1 and milestone_name=$2",[pid,milestoneName],function(err,result){
        rowCnt=result.rowCount;

        if(rowCnt == "0")
        {
                pdbconnect.query("INSERT INTO invoice_mast_tbl(project_id,invoice_date,billed_to,invoice_po,milestone_name,particulars,sac_num,milestone_per,milestone_amt,total,raised_by,designation,gstin_num,pan_num,payment_type,confirm_flg,paid_flg,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,central_tax,state_tax,igst_tax,project_curr,client_gstin,grn_number,invoice_num,inv_srl_num,status_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31)",[pid,invDate,billedTo,invPO,milestoneName,particulars,sacNo,per,amt,total,raisedBy,desig,gstin,panNo,payment_type,confirm_flg,paid_flg,del_flg,rcreuserid,rcretime,lchguserid,lchgtime,cTax,sTax,gstTax,project_curr,clientGstin,grnNum,invNum,invsrl,'M'],function(err,done)
                {
                        if(err) throw err;


                        pdbconnect.query("update milestone_proj_tbl set confirm_flg='Y',paid_flg='N',del_flg='N',status_flg='M' where project_id=$1 and milestone_name=$2",[pid,milestoneName],function(err,done)
                        {
                                if(err) throw err;

                                var calctax = "";
                                var calstax = "";
                                var diff ="";


                                if((cTax != "")&&(sTax != ""))
                                {
                                        calctax = ((amt - 0)*(cTax - 0)/(100-0));
                                        calctax = calctax.toFixed(2);
                                        calstax = ((amt - 0)*(sTax - 0)/(100-0));
                                        calstax = calstax.toFixed(2);
                                }
                                else
                                {
                                        diff = ((amt - 0)*(gstTax)/(100 - 0));
                                        diff = diff.toFixed(2);
                                }
                                amt = parseFloat(amt);
                                amt = amt.toFixed(2);

                                var total_words = converter.toWords(total).toUpperCase();

                                pdbconnect.query("SELECT comm_code_desc from common_code_tbl where comm_code_id = $1",[desig],function(err,result){
                                desig=result.rows['0'].comm_code_desc;

                                res.render('invoiceModule/generateinrReport',{
				ename:req.user.rows['0'].user_name,
        			eid:req.user.rows['0'].user_id,
				pid:pid,
				payment_type:payment_type,
                                invNum:invNum,
                                invDate:invDate,
                                billedTo:billedTo,
                                invPO:invPO,
				grnNum:grnNum,
                                particulars:particulars,
                                sacNo:sacNo,
                                amt:amt,
                                clientGstin:clientGstin,
                                cTax:cTax,
                                sTax:sTax,
                                gstTax:gstTax,
                                calctax:calctax,
                                calstax:calstax,
                                diff:diff,
                                total:total,
                                total_words:total_words,
                                raisedBy:raisedBy,
                                desig:desig,
                                gstin:gstin,
                                panNo:panNo
                                });

                        });
                });
                });
        }
        else
        {

                pdbconnect.query("UPDATE invoice_mast_tbl set project_id=$1,invoice_date=$2,billed_to=$3,invoice_po=$4,milestone_name=$5,particulars=$6,sac_num=$7,milestone_per=$8,milestone_amt=$9,total=$10,raised_by=$11,designation=$12,gstin_num=$13,pan_num=$14,payment_type=$15,confirm_flg=$16,paid_flg=$17,del_flg=$18,rcre_user_id=$19,rcre_time=$20,lchg_user_id=$21,lchg_time=$22,central_tax=$23,state_tax=$24,igst_tax=$25,project_curr=$26,client_gstin=$27,grn_number=$28,invoice_num=$29,inv_srl_num=$30,status_flg=$31 where project_id = $1 and milestone_name = $5 ",[pid,invDate,billedTo,invPO,milestoneName,particulars,sacNo,per,amt,total,raisedBy,desig,gstin,panNo,payment_type,confirm_flg,paid_flg,del_flg,rcreuserid,rcretime,lchguserid,lchgtime,cTax,sTax,gstTax,project_curr,clientGstin,grnNum,invNum,invsrl,'M'],function(err,done)
                {
                        if(err) throw err;


                        pdbconnect.query("update milestone_proj_tbl set confirm_flg='Y',paid_flg='N',del_flg='N',status_flg='M' where project_id=$1 and milestone_name=$2",[pid,milestoneName],function(err,done)
                        {
                                if(err) throw err;

                                pdbconnect.query("SELECT comm_code_desc from common_code_tbl where comm_code_id = $1",[desig],function(err,result){
                                desig=result.rows['0'].comm_code_desc;

                                var calctax = "";
                                var calstax = "";
                                var diff ="";


                                if((cTax != "")&&(sTax != ""))
                                {
                                        calctax = ((amt - 0)*(cTax - 0)/(100-0));
                                        calctax = calctax.toFixed(2);
                                        calstax = ((amt - 0)*(sTax - 0)/(100-0));
                                        calstax = calstax.toFixed(2);
                                }
                                else
                                {
                                        diff = ((amt - 0)*(gstTax)/(100 - 0));
                                        diff = diff.toFixed(2);
                                }

                                amt = parseFloat(amt);
                                amt = amt.toFixed(2);
                                var total_words = converter.toWords(total).toUpperCase();

                                res.render('invoiceModule/generateinrReport',{
        			ename:req.user.rows['0'].user_name,
        			eid:req.user.rows['0'].user_id,
				pid:pid,
				payment_type:payment_type,
                                invNum:invNum,
                                invDate:invDate,
                                billedTo:billedTo,
                                invPO:invPO,
				grnNum:grnNum,
                                particulars:particulars,
                                sacNo:sacNo,
                                amt:amt,
                                clientGstin:clientGstin,
                                cTax:cTax,
                                sTax:sTax,
                                gstTax:gstTax,
                                calctax:calctax,
                                calstax:calstax,
                                diff:diff,
                                total:total,
                                total_words:total_words,
                                raisedBy:raisedBy,
                                desig:desig,
                                gstin:gstin,
                                panNo:panNo
                                        });
                        });
                });
                });
        }
        });
        });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////// INVOICE TNM USD ///////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/invoiceusdTNM',function(req,res)
{

        var eid = req.user.rows['0'].user_id;
        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;

        res.render('invoiceModule/chooseinvoiceDetails',{
        ename:req.user.rows['0'].user_name,
        eid:req.user.rows['0'].user_id,
        emp_access:emp_access
        });
        });
});

router.post('/addtnmusdInv',addtnmusdInv);
function addtnmusdInv(req , res)
{
        var eid = req.user.rows['0'].user_id;
        var pid = req.body.pid;
        var invDate = req.body.invDate;
        var billedTo = req.body.billedTo;
        var invPO = req.body.invPO;
	var grnNum = req.body.grnNum;
        var milestoneName = req.body.milestoneName;
        var particulars = req.body.particulars;
        var per = req.body.per;
        var amt = req.body.amt;
        var newTax = req.body.newTax;
        var total = req.body.total;
        var raisedBy = req.body.raisedBy;
        var desig = req.body.desig;
        var gstin = req.body.gstin;
        var panNo = req.body.panNo;
        var invNum = req.body.invNum;
        var invsrl = req.body.invsrl;
        var rcreuserid=req.user.rows['0'].user_id;
	var now = new Date();
        var rcretime=now;
        var lchguserid=req.user.rows['0'].user_id;
        var lchgtime=now;
        var payment_type = "TNM";
        var confirm_flg="Y";
        var paid_flg="N";
        var del_flg="N";
        var project_curr="USD";

        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;

        pdbconnect.query("SELECT * from invoice_mast_tbl where project_id = $1 and milestone_name=$2",[pid,milestoneName],function(err,result){
        rowCnt=result.rowCount;

        if(rowCnt == "0")
        {
                pdbconnect.query("INSERT INTO invoice_mast_tbl(project_id,invoice_date,billed_to,invoice_po,milestone_name,particulars,milestone_per,milestone_amt,total,raised_by,designation,gstin_num,pan_num,payment_type,confirm_flg,paid_flg,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,usd_tax,project_curr,grn_number,invoice_num,inv_srl_num,status_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)",[pid,invDate,billedTo,invPO,milestoneName,particulars,per,amt,total,raisedBy,desig,gstin,panNo,payment_type,confirm_flg,paid_flg,del_flg,rcreuserid,rcretime,lchguserid,lchgtime,newTax,project_curr,grnNum,invNum,invsrl,'M'],function(err,done)
                {
                        if(err) throw err;

                        pdbconnect.query("update milestone_proj_tbl set confirm_flg='Y',paid_flg='N',del_flg='N',status_flg='M' where project_id=$1 and milestone_name=$2",[pid,milestoneName],function(err,done)
                        {
                                if(err) throw err;

                                var calctax = "";

                                if(newTax != "")
                                {
                                        calctax = ((amt - 0)*(newTax - 0)/(100-0));
                                        calctax = calctax.toFixed(2);
                                }

                                amt = parseFloat(amt);
                                amt = amt.toFixed(2);

                                var total_words = converter.toWords(total).toUpperCase();

                                pdbconnect.query("SELECT comm_code_desc from common_code_tbl where comm_code_id = $1",[desig],function(err,result){
                                desig=result.rows['0'].comm_code_desc;

                                res.render('invoiceModule/generateusdReport',{
			        ename:req.user.rows['0'].user_name,
        			eid:req.user.rows['0'].user_id,
                                pid:pid,
				payment_type:payment_type,
                                invNum:invNum,
                                invDate:invDate,
                                billedTo:billedTo,
                                invPO:invPO,
				grnNum:grnNum,
                                particulars:particulars,
                                amt:amt,
                                newTax:newTax,
                                calctax:calctax,
                                total:total,
                                total_words:total_words,
                                raisedBy:raisedBy,
                                desig:desig,
                                gstin:gstin,
                                panNo:panNo
                                });
                        });
                });
                });
        }
        else
        {
                        pdbconnect.query("update invoice_mast_tbl set project_id=$1,invoice_date=$2,billed_to=$3,invoice_po=$4,milestone_name=$5,particulars=$6,milestone_per=$7,milestone_amt=$8,total=$9,raised_by=$10,designation=$11,gstin_num=$12,pan_num=$13,payment_type=$14,confirm_flg=$15,paid_flg=$16,del_flg=$17,rcre_user_id=$18,rcre_time=$19,lchg_user_id=$20,lchg_time=$21,usd_tax=$22,project_curr=$23,grn_number=$24,invoice_num=$25,inv_srl_num=$26,status_flg=$27 where project_id=$1 and milestone_name=$5",[pid,invDate,billedTo,invPO,milestoneName,particulars,per,amt,total,raisedBy,desig,gstin,panNo,payment_type,confirm_flg,paid_flg,del_flg,rcreuserid,rcretime,lchguserid,lchgtime,newTax,project_curr,grnNum,invNum,invsrl,'M'],function(err,done)
                {
                        if(err) throw err;

                        pdbconnect.query("update milestone_proj_tbl set confirm_flg='Y',paid_flg='N',del_flg='N',status_flg='M' where project_id=$1 and milestone_name=$2",[pid,milestoneName],function(err,done)
                        {
                                if(err) throw err;

                                pdbconnect.query("SELECT comm_code_desc from common_code_tbl where comm_code_id = $1",[desig],function(err,result){
                                desig=result.rows['0'].comm_code_desc;

                                var calctax = "";
                                if(newTax != "")
                                {
                                        calctax = ((amt - 0)*(newTax - 0)/(100-0));
                                        calctax = calctax.toFixed(2);
                                }

                                amt = parseFloat(amt);
                                amt = amt.toFixed(2);

                                var total_words = converter.toWords(total).toUpperCase();

                                res.render('invoiceModule/generateusdReport',{
			        ename:req.user.rows['0'].user_name,
        			eid:req.user.rows['0'].user_id,
                                pid:pid,
				payment_type:payment_type,
                                invNum:invNum,
                                invDate:invDate,
                                billedTo:billedTo,
                                invPO:invPO,
				grnNum:grnNum,
                                particulars:particulars,
                                amt:amt,
                                newTax:newTax,
                                calctax:calctax,
                                total:total,
                                total_words:total_words,
                                raisedBy:raisedBy,
                                desig:desig,
                                gstin:gstin,
                                panNo:panNo
                                        });
                        });
                });
                });
        }
        });
        });
};

// Added For Report Generation
router.get('/generateinrReport',function(req,res)
{
	res.render('invoiceModule/generateinrReport');
});


router.get('/generateusdReport',function(req,res)
{
        res.render('invoiceModule/generateusdReport');
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////// Invoice FAQ Details ////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/invoiceFAQDetails',invoiceFAQDetails);
function invoiceFAQDetails(req,res)
{
        var emp_id =req.user.rows[0].user_id;
        var emp_name =req.user.rows[0].user_name;
        var emp_access =req.user.rows[0].user_type;

        res.render('invoiceModule/invoiceFAQDetails',{
	ename:req.user.rows['0'].user_name,
	eid:req.user.rows['0'].user_id,
        emp_id:emp_id,
        emp_name:emp_name,
        emp_access:emp_access
        });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////// Regenerate Invoice choose ///////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/invoiceRegeneratechoose',function(req,res)
{

        var eid = req.user.rows['0'].user_id;
        var pid ="";
        var milestoneName="";

        pdbconnect.query("SELECT user_type from users where user_id = $1",[eid],function(err,result){
        emp_access=result.rows['0'].user_type;

        if(emp_access != "F1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {
		pdbconnect.query("select * from invoice_mast_tbl where confirm_flg='Y' and paid_flg='N' and del_flg='N' and status_flg='M' order by invoice_date asc",function(err,result){
		parse=result.rows;
		parse_count=result.rowCount;

		res.render('invoiceModule/invoiceRegeneratechoose',{
		emp_access:emp_access,
		ename:req.user.rows['0'].user_name,
		eid:req.user.rows['0'].user_id,
		parse_count:parse_count,
		parse:parse
		});
		});
	}
        });

});

router.post('/regenerate',regenerate);
function regenerate(req , res)
{
        var array = req.body.button;
	console.log("regen",array);
        
	pdbconnect.query("select project_id,milestone_name from invoice_mast_tbl where confirm_flg='Y' and paid_flg='N' and del_flg='N' and status_flg='M' order by invoice_date asc",function(err,result){

	var pid = result.rows[array].project_id;
        var milestoneName = result.rows[array].milestone_name;
	
	pdbconnect.query("select payment_type,invoice_num,project_curr,billed_to,client_gstin,invoice_date,invoice_po,grn_number,particulars,sac_num,milestone_amt,central_tax,state_tax,igst_tax,usd_tax,total,gstin_num,pan_num from invoice_mast_tbl where project_id = $1 and milestone_name=$2 and confirm_flg='Y' and paid_flg='N' and del_flg='N' and status_flg='M' order by invoice_date asc",[pid,milestoneName],function(err,result){

        var payment_type = result.rows['0'].payment_type;
        var project_curr = result.rows['0'].project_curr;
        var invNum = result.rows['0'].invoice_num;
        var billedTo = result.rows['0'].billed_to;
        var clientGstin = result.rows['0'].client_gstin;
        var invDate = result.rows['0'].invoice_date;
        var invPO = result.rows['0'].invoice_po;
        var grnNum = result.rows['0'].grn_number;
        var particulars = result.rows['0'].particulars;
        var sacNo = result.rows['0'].sac_num;
        var amt = result.rows['0'].milestone_amt;
        var cTax = result.rows['0'].central_tax;
        var sTax = result.rows['0'].state_tax;
        var gstTax = result.rows['0'].igst_tax;
        var newTax = result.rows['0'].usd_tax;
        var total = result.rows['0'].total;
        var gstin = result.rows['0'].gstin_num;
        var panNo = result.rows['0'].pan_num;


	if(project_curr == "INR")
	{
			if((cTax != "")&&(sTax != ""))
			{
				var calctax = ((amt - 0)*(cTax - 0)/(100-0));
				var calctax = calctax.toFixed(2);
				var calstax = ((amt - 0)*(sTax - 0)/(100-0));
				var calstax = calstax.toFixed(2);
			}
			else
			{
				var diff = ((amt - 0)*(gstTax)/(100 - 0));
				var diff = diff.toFixed(2);
			}

			amt = parseFloat(amt);
			amt = amt.toFixed(2);

			var total_words = converter.toWords(total).toUpperCase();


			res.render('invoiceModule/reGenerateinrReport',{
			ename:req.user.rows['0'].user_name,
			eid:req.user.rows['0'].user_id,
			pid:pid,
			payment_type:payment_type,
			invNum:invNum,
			invDate:invDate,
			grnNum:grnNum,
			billedTo:billedTo,
			invPO:invPO,
			particulars:particulars,
			sacNo:sacNo,
			amt:amt,
			clientGstin:clientGstin,
			cTax:cTax,
			sTax:sTax,
			gstTax:gstTax,
			calctax:calctax,
			calstax:calstax,
			diff:diff,
			total:total,
			total_words:total_words,
			gstin:gstin,
			project_curr:project_curr,
			panNo:panNo
			});
	}
	else
	{

			if(newTax != "")
			{
				var calctax = ((amt - 0)*(newTax - 0)/(100-0));
				var calctax = calctax.toFixed(2);
			}

			var amt = parseFloat(amt);
			var amt = amt.toFixed(2);

			var total_words = converter.toWords(total).toUpperCase();

			res.render('invoiceModule/reGenerateusdReport',{
			ename:req.user.rows['0'].user_name,
			eid:req.user.rows['0'].user_id,
			pid:pid,
			payment_type:payment_type,
			invNum:invNum,
			invDate:invDate,
			billedTo:billedTo,
			grnNum:grnNum,
			invPO:invPO,
			particulars:particulars,
			amt:amt,
			newTax:newTax,
			calctax:calctax,
			total:total,
			total_words:total_words,
			gstin:gstin,
			project_curr:project_curr,
			panNo:panNo
			});
	}
	});
	});
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////END OF LOGIC ////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = router;
