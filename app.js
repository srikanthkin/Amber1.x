var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport')
,LocalStrategy = require('passport-local').Strategy;
var ip = require("ip");
var Promise = require('mpromise');
var mislog=require('winston');
mislog.add(mislog.transports.File, { filename: 'NurturePortallogfile.log', level: 'info' });
var pdbconnect=require('./routes/database/psqldbconnect');
var schedule = require('node-schedule');
var cron = require('node-cron');
var moment = require('moment');
var nodemailer = require('nodemailer');
var dateFormat = require('dateformat');
var generatePassword = require("password-generator");
var bcrypt = require('bcryptjs');

///////////////////////////////////////////// Business logic ///////////////////////////

var routes = require('./routes/loginurl');
var cms = require('./routes/cmsModule/cms');
var appraisal = require('./routes/appraisalModule/appraisal');
var doAppraisal = require('./routes/appraisalModule/doAppraisal');
var viewAppraisal = require('./routes/appraisalModule/viewAppraisal');
var approveAppraisal = require('./routes/appraisalModule/approveAppraisal');
var rejectAppraisal = require('./routes/appraisalModule/rejectAppraisal');
var acceptAppraisal = require('./routes/appraisalModule/acceptAppraisal');
var closureAppraisal = require('./routes/appraisalModule/closureAppraisal');
var viewAppraisalData = require('./routes/appraisalModule/viewAppraisalData');
var forwardAppraisal = require('./routes/appraisalModule/forwardAppraisal');
var createAppData = require('./routes/appRenovated/createAppData');
var addAppraisal = require('./routes/appRenovated/addAppraisal');
var appraisalDataMonth = require('./routes/appRenovated/appraisalDataMonth');
var appraiser = require('./routes/appRenovated/appraiser');
var appraisalApproval = require('./routes/appRenovated/appraisalApproval');
var capture = require('./routes/captureModule/captureDetail');
var applyLeave = require('./routes/requestModule/applyLeave');
var viewLeave = require('./routes/requestModule/viewLeave');
var approveLeaves = require('./routes/requestModule/approveLeaves');
var holidays = require('./routes/holidaysModule/holidays');
var project = require('./routes/projectModule/projectDetails');
var messages = require('./routes/messages/messages');
var viewMessages = require('./routes/messages/viewMessages');
var sentItems = require('./routes/messages/sentItems');
var viewSentMessages = require('./routes/messages/viewSentMessages');
var sendMessages = require('./routes/messages/sendMessages');
var deleteMessages = require('./routes/messages/deleteMessages');
var login = require('./routes/loginModule/login');
var adminDashboard = require('./routes/admin-dashboard/adminDashboard');
var emp = require('./routes/employeeModule/employeeDetails');
var invoice = require('./routes/invoiceModule/invoiceDetails');
var report = require('./routes/reportModule/reportDetails');
var commoncode = require('./routes/commoncodeModule/commonDetails');
var markModule = require('./routes/markModule/markDetails');
var passwordupdate = require('./routes/changePassword/changePassword');
var logout = require('./routes/logoutModule/logout');
var asset = require('./routes/assetModule/assetDetails');
var travelRequest = require('./routes/travelModule/travel');
var travelempDetails = require('./routes/travelModule/travelempDetails');
var travelHrReqQueue =require('./routes/travelModule/viewTravelFinQueue');
var travelDetail = require('./routes/travelModule/travelDetail');
var travelrequestStatus =require('./routes/travelModule/travelrequestStatus');
var travelFAQDetails =require('./routes/travelModule/travelFAQDetails');
var approveReq = require('./routes/travelModule/approveReq');
var reqDetails = require('./routes/travelModule/reqDetails');
var initiateRem = require('./routes/reimbursementModule/initiateRem');
var reimburseDetails = require('./routes/reimbursementModule/reimburseDetails');
var reimburseUserDetails = require('./routes/reimbursementModule/reimburseUserDetails');
var reimburseQueue =  require('./routes/reimbursementModule/reimburseQueue');
var reimburseApprove = require('./routes/reimbursementModule/reimburseApprove');
var reimburseHrReqQueue = require('./routes/reimbursementModule/viewClaimFinQueue');
var reimburseFAQDetails = require('./routes/reimbursementModule/reimburseFAQDetails');
var viewClaimReq = require('./routes/reimbursementModule/viewClaimReq');
var viewClaimApprQueue = require('./routes/reimbursementModule/viewClaimApprQueue');
var viewClaimFinQueue = require('./routes/reimbursementModule/viewClaimFinQueue');
var cmsFAQDetails = require('./routes/cmsModule/cmsFAQDetails');
var projectFAQDetails = require('./routes/projectModule/projectFAQDetails');
var assetFAQDetails = require('./routes/assetModule/assetFAQDetails');
var appraisalFAQDetails = require('./routes/appraisalModule/appraisalFAQDetails');
var leaveFAQDetails = require('./routes/requestModule/leaveFAQDetails');
var visual = require('./routes/visualModule/visualisation');
var deletemilestone = require('./routes/projectModule/deleteMilestone');
var childproject = require('./routes/projectModule/childproject');
var viewTravelReq = require('./routes/travelModule/viewTravelReq');
var viewTravelApprQueue = require('./routes/travelModule/viewTravelApprQueue');
var viewTravelFinQueue = require('./routes/travelModule/viewTravelFinQueue');
var productdetails = require('./routes/projectModule/productdetails');
var resetsession = require('./routes/resetModule/resetDetails');

var app = express(); 

app.get('*',checkGetUser);
app.post('*',checkPostUser);
//View Engine
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

//Body Parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '500mb',extended: false}));
app.use(cookieParser());

//set Static Folder
app.use(express.static(path.join(__dirname,'public')));

//Express Session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

//Express Validator Middleware

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

process.on('uncaughtException', function(err) { console.log("Uncaught exception!", err); });
//connect flash
app.use(flash());

// Global Vars
  app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.success=req.flash('success');
  res.locals.successrem=req.flash('successrem');
  res.locals.successpass=req.flash('successpass');
  res.locals.generationsuccess_msg=req.flash('generationsuccess_msg');
  
  //res.locals.user = req.user || null;
  next();
});


app.use('/',routes);
app.use('/cmsModule/cms',cms);
app.use('/appraisalModule/appraisal',appraisal);
app.use('/appraisalModule/doAppraisal',doAppraisal);
app.use('/appraisalModule/viewAppraisal',viewAppraisal);
app.use('/appraisalModule/approveAppraisal',approveAppraisal);
app.use('/appraisalModule/acceptAppraisal',acceptAppraisal);
app.use('/appraisalModule/rejectAppraisal',rejectAppraisal);
app.use('/appraisalModule/closureAppraisal',closureAppraisal);
app.use('/appraisalModule/viewAppraisalData',viewAppraisalData);
app.use('/appraisalModule/forwardAppraisal',forwardAppraisal);
app.use('/captureModule/captureDetail',capture);
app.use('/requestModule/applyLeave',applyLeave);
app.use('/requestModule/viewLeave',viewLeave);
app.use('/requestModule/approveLeaves',approveLeaves);
app.use('/appRenovated/createAppData',createAppData);
app.use('/appRenovated/addAppraisal',addAppraisal);
app.use('/appRenovated/appraisalDataMonth',appraisalDataMonth);
app.use('/appRenovated/appraiser',appraiser);
app.use('/appRenovated/appraisalApproval',appraisalApproval);
app.use('/holidaysModule/holidays',holidays);
app.use('/messages/messages',messages);
app.use('/messages/viewMessages',viewMessages);
app.use('/messages/viewSentMessages',viewSentMessages);
app.use('/messages/sentItems',sentItems);
app.use('/messages/sendMessages',sendMessages);
app.use('/messages/deleteMessages',deleteMessages);
app.use('/loginModule/login',login);
app.use('/admin-dashboard/adminDashboard',adminDashboard);
app.use('/employeeModule/employeeDetails',emp);
app.use('/invoiceModule/invoiceDetails',invoice);
app.use('/reportModule/reportDetails',report);
app.use('/commoncodeModule/commonDetails',commoncode);
app.use('/markModule/markDetails',markModule);
app.use('/projectModule/projectDetails',project);
app.use('/changePassword/changePassword',passwordupdate);
app.use('/logoutModule/logout',logout);
app.use('/assetModule/assetDetails',asset);
app.use('/travelModule/travel',travelRequest);
app.use('/travelModule/travel',travelempDetails);
app.use('/travelModule/travel',travelHrReqQueue);
app.use('/travelModule/travel',travelDetail);
app.use('/travelModule/approveReq',approveReq);
app.use('/travelModule/travelrequestStatus',travelrequestStatus);
app.use('/travelModule/travelFAQDetails',travelFAQDetails);
app.use('/travelModule/reqDetails',reqDetails);
app.use('/travelModule/viewTravelReq',viewTravelReq);
app.use('/travelModule/viewTravelApprQueue',viewTravelApprQueue);
app.use('/travelModule/viewTravelFinQueue',viewTravelFinQueue);
app.use('/reimbursementModule/initiateRem',initiateRem);
app.use('/reimbursementModule/reimburseDetails',reimburseDetails);
app.use('/reimbursementModule/reimburseUserDetails',reimburseUserDetails);
app.use('/reimbursementModule/reimburseQueue',reimburseQueue);
app.use('/reimbursementModule/reimburseApprove',reimburseApprove);
app.use('/reimbursementModule/initiateRem',reimburseHrReqQueue);
app.use('/reimbursementModule/reimburseFAQDetails',reimburseFAQDetails);
app.use('/reimbursementModule/viewClaimReq',viewClaimReq);
app.use('/reimbursementModule/viewClaimApprQueue',viewClaimApprQueue);
app.use('/reimbursementModule/viewClaimFinQueue',viewClaimFinQueue);
app.use('/cmsModule/cmsFAQDetails',cmsFAQDetails);
app.use('/projectModule/projectFAQDetails',projectFAQDetails);
app.use('/assetModule/assetFAQDetails',assetFAQDetails);
app.use('/appraisalModule/appraisalFAQDetails',appraisalFAQDetails);
app.use('/requestModule/leaveFAQDetails',leaveFAQDetails);
app.use('/visualModule/visualisation',visual);
app.use('/projectModule/deleteMilestone',deletemilestone);
app.use('/projectModule/childproject',childproject);
app.use('/projectModule/productdetails',productdetails);
app.use('/resetModule/resetDetails',resetsession);


function checkUser(req, res, next) {
  if ( req.path == '/loginModule/login') return next();
	
  else{
	 return next(); 
}
}

function checkGetUser(req, res, next) {
  if ( req.path == '/loginModule/login') return next();

  else{
         return next();
}
}

function checkPostUser(req, res, next) {
  if ( req.path == '/loginModule/login') return next();

  else{
         return next();
}
}



//Set Port
app.set('port',(process.env.PORT || 8080));

app.listen(app.get('port'),function(re){
mislog.info('nurture portal running on',ip.address());
mislog.info('nurture portal started on port'+app.get('port'));
cron();


function cron(req,res)
{

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

			var cron = require('node-cron');
			// seconds,minutes,hour,daysinmonth,week
			cron.schedule('0 0 1 1-31 1-12 0-7', function()
			{
				 pdbconnect.query("select * from milestone_proj_tbl where confirm_flg='N' and paid_flg='N' and del_flg='N' and milestone_exp_date = current_date",function(err,result){

				var rowcount = result.rowCount;
				if(rowcount > 0)
				{
					pdbconnect.query("select project_id,milestone_name from milestone_proj_tbl where confirm_flg='N' and paid_flg='N' and del_flg='N' and milestone_exp_date = current_date",function(err,result){
					
					for(var n=0;n<rowcount;n++)
					{
						var pid = result.rows[n].project_id;
						var milestone_name = result.rows[n].milestone_name;

						var arr = [];
						arr.push(pid);
						
						var arr1 = [];
						arr1.push(milestone_name);

						arr.forEach(function(i)
						{
						    var pid  = i;

                                                arr1.forEach(function(j)
                                                {
						    var milestone_name  = j;

						   var smtpTransport = nodemailer.createTransport('SMTP',{
						   service: 'gmail',
						   auth:
						   {
							user: 'amber@nurture.co.in',
							pass: 'nurture@123'
						   }
						   });

						   pdbconnect.query("select project_mgr,delivery_mgr from project_master_tbl where project_id = $1",[pid],function(err,result){
						   var pmgr = result.rows['0'].project_mgr;
						   var dmgr = result.rows['0'].delivery_mgr;

						   pdbconnect.query("select emp_email,emp_name from emp_master_tbl where emp_id = $1",[pmgr],function(err,result){
						   var pmail = result.rows['0'].emp_email;
						   var pname = result.rows['0'].emp_name;


 						   pdbconnect.query("select emp_email,emp_name from emp_master_tbl where emp_id = $1",[dmgr],function(err,result){
						   var dmail = result.rows['0'].emp_email;
						   var dname = result.rows['0'].emp_name;


						   pdbconnect.query("select comm_code_desc from common_code_tbl where code_id='FIN' and comm_code_id='FIN' and del_flg='N'",function(err,result){

						   // logic for combining project and delivery manager mail

						   var mail = result.rows['0'].comm_code_desc;

						   var cmail = pmail + ',' + dmail; 

                        			var mailOptions = {
					   	to:mail,
					   	cc:cmail,
                                                from: 'amber@nurture.co.in',
						subject: 'Milestone due to be marked today',
                                                html: '<img src="https://millionmilesecrets.com/wp-content/uploads/2016/05/Application_Pending_Dont_Worry_Follow_These_Steps_01.jpg" height="85"><br><br>' +
                                                '<h3>Milestone is pending to be marked today for the Project Details Below.<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Project Id</th> ' +
                                                                '<th style="border: 10px solid black;">' + pid + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Milestone Name </td> ' +
                                                                '<th style="border: 10px solid black;">' + milestone_name + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Delivery Manager</th> ' +
                                                                '<th style="border: 10px solid black;">' + dmgr + '-' + dname + '</th>' +

                                                        '</tr>' +


                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Project Manager</th> ' +
                                                                '<th style="border: 10px solid black;">' + pmgr + '-' + pname + '</th>' +

                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
					        'Please follow up with respective Project Manager to mark the milestone in order to raise the Invoice<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br><br>' +
                                                '- Regards,<br><br>Amber</h3>'
                                         };


						  smtpTransport.sendMail(mailOptions, function(err) {
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
				else
				{
					console.log("No cron Job Execution Today");	
				}

				});

			});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			
			cron.schedule('0 45 0 * * *', function()
			{
                       
				var document_date="";
                		var nowDate=moment().format('YYYY-MM-DD');
				
				pdbconnect.query("SELECT * FROM reimbursement_master_tbl where status =$1 and hr_status=$2" ,['approved','pending'], function(err, approvedResult) {
    
				var rowcount = approvedResult.rowCount;
				if(rowcount > 0)
				{
				     approvedResultCount = approvedResult.rowCount
                		     var approvedDataResult = approvedResult.rows;

                		     for (var i = 0; i < approvedDataResult.length; i++) 
				     {
                				var document_dateString = approvedDataResult[i].document_date;
                				var remb_id=approvedDataResult[i].remb_id
               					document_date = moment('document_dateString').format('YYYY-MM-DD')

                				var duration = moment.duration(moment(document_dateString).diff(nowDate));
                				var days = duration.asDays();

                				if(days<0)
                				{
                 					pdbconnect.query("UPDATE  reimbursement_master_tbl set  status = $1 where remb_id=$2",['autoreject',remb_id],function(err,done){
             						if(err) 
            						console.error('Error with table query', err);
                
							pdbconnect.query("Insert into reimbursement_master_tbl_hist(select * from reimbursement_master_tbl where remb_id=$1)",[remb_id],function(err,done){
             						if(err) 
            						console.error('Error with table query', err);
               
            

							pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function(err, empResult) {
                					if (err) 
							{
                    						console.error('Error with table query', err);
                					} 
							else 
							{
                    						employee_name = empResult.rows['0'].emp_name;
                    						employee_email = empResult.rows['0'].emp_email;
                					}
               
							var smtpTransport = nodemailer.createTransport('SMTP',{
							service: 'gmail',
							auth:
							{
								user: 'amber@nurture.co.in',
								pass: 'nurture@123'
							}
							});

                        				var mailOptions = {
							to: employee_email,
							from: 'amber@nurture.co.in',
							subject: 'Reimbursement request autoreject',
							html: '<img src="http://3.bp.blogspot.com/--pfNVoWKX1k/UVmGjK4eRbI/AAAAAAAAs7U/fMYBDL9MyKA/s1600/iStock_000016794834XSmall.jpg" height="85"><br><br>' +
							'<h3>Reimbursement request has been auto rejected for the following<br><br>' +
							'<table style="border: 10px solid black;"> ' +
								'<tr style="border: 10px solid black;"> ' +
									'<th style="border: 10px solid black;">Reimbursement Id</th> ' +
									'<th style="border: 10px solid black;">' + remb_id + '</th>' +
								'</tr>' +
							'</table> ' +
							'<br><br>' +
							'The reimbursement request raised is autorejected since document submission date exceeds the deadline<br><br>' +
							'URL: http://amber.nurture.co.in <br><br><br>' +
							'- Regards,<br><br>Amber</h3>'
						 };


                					smtpTransport.sendMail(mailOptions, function(err) {});
                 					});
                 					});
                 					});
                			}
                	     }
                }
		else if(rowcount == 0)
		{
			console.log("No cron Job Execution Today");	
		}
                     
		});
		});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		cron.schedule('0 55 0 * * *', function()
		{
			var document_date="";
                	var nowDate=moment().format('YYYY-MM-DD');
			
			pdbconnect.query("SELECT * FROM travel_master_tbl_temp where request_status in ($1,$2)",['SUB','MOD'], function(err, pendingResult) {
			var rowcount = pendingResult.rowCount;
			
			if(rowcount > 0)
			{	
				    pendingResultCount = pendingResult.rowCount
                		    var pendingDataResult = pendingResult.rows;
               
				    for (var i = 0; i < pendingDataResult.length; i++) 
				    {
				    	var document_dateString = pendingDataResult[i].from_date;
					var req_id=pendingDataResult[i].req_id;
			       
					var duration = moment.duration(moment(document_dateString).diff(nowDate));
					var days = duration.asDays();
                
                		    if(days<0)
                		    {
                 			pdbconnect.query("UPDATE  travel_master_tbl_temp set  del_flg = $1,request_status=$2 where req_id=$3",['Y','ARJ',req_id],function(err,done){
             				if(err) 
            				console.error('Error with table query', err);
                
					pdbconnect.query("Insert into travel_master_tbl_hist (select * from travel_master_tbl_temp where req_id=$1)",[req_id],function(err,done){
             				if(err) 
            				console.error('Error with table query', err);
       

           				pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from travel_master_tbl_temp where req_id=$1)", [req_id], function(err, empResult) {
					if (err) 
					{
					    console.error('Error with table query', err);
					} 
					else 
					{
					    employee_name = empResult.rows['0'].emp_name;
					    employee_email = empResult.rows['0'].emp_email;
					}
                
					var smtpTransport = nodemailer.createTransport('SMTP',{
					service: 'gmail',
					auth:
					{
						user: 'amber@nurture.co.in',
						pass: 'nurture@123'
					}
					});


					var mailOptions = {
						to: employee_email,
						from: 'amber@nurture.co.in',
						subject: 'Travel request autoreject',
						html: '<img src="http://3.bp.blogspot.com/--pfNVoWKX1k/UVmGjK4eRbI/AAAAAAAAs7U/fMYBDL9MyKA/s1600/iStock_000016794834XSmall.jpg" height="85"><br><br>' +
						'<h3>Travel request is auto rejected for the following<br><br>' +
						'<table style="border: 10px solid black;"> ' +
							'<tr style="border: 10px solid black;"> ' +
								'<th style="border: 10px solid black;">Travel Request Id</th> ' +
								'<th style="border: 10px solid black;">' + req_id + '</th>' +
							'</tr>' +
						'</table> ' +
						'<br><br>' +
						'The travel request raised is autorejected since the Manager has not approved the request<br><br>' +
						'URL: http://amber.nurture.co.in <br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
					 };

                
					smtpTransport.sendMail(mailOptions, function(err) {});
                 			});
                 			});
                 			});
                			}
                		}
			    }
			    else if(rowcount == 0)
			    {
					console.log("No cron Job Execution Today");	
			    }
                      	});
			});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

			// employee verification list for usha on daily basis
                        var cron = require('node-cron');
                        // seconds,minutes,hour,daysinmonth,week
                        cron.schedule('0 10 1 1-31 1-12 0-7', function()
                        {

				pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'",function(err, result) {
				var hr_email = result.rows['0'].comm_code_desc;

				var cc_email = "amberteam@nurture.co.in";

                                pdbconnect.query("SELECT * from data_emp_master_tbl_temp",function(err, result) {
                                var migr_pro = result.rowCount;

                                pdbconnect.query("SELECT * from data_emp_info_tbl_temp",function(err, result) {
                                var migr_per = result.rowCount;
				
                                pdbconnect.query("SELECT * from emp_info_tbl_temp",function(err, result) {
                                var reg_per = result.rowCount;

			        var smtpTransport = nodemailer.createTransport('SMTP',{
			        service: 'gmail',
			        auth:
			        {
					user: 'amber@nurture.co.in',
					pass: 'nurture@123'
				}
				});

                                        var mailOptions = {
						to: hr_email,
						cc: cc_email,
                                                from: 'amber@nurture.co.in',
					        subject: 'Pending Verification Count in Employee Module',
                                                html: '<img src="https://millionmilesecrets.com/wp-content/uploads/2016/05/Application_Pending_Dont_Worry_Follow_These_Steps_01.jpg" height="85"><br><br>' +
                                                '<h3>Dear Usha,<br><br>' +
					      	'Pending Employee verification Count.\n' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Professional Details of Existing User</th> ' +
                                                                '<th style="border: 10px solid black;">' + reg_per + '</th>' +
                                                        '</tr>' +

                                                       '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Professional Details of New User</th> ' +
                                                                '<th style="border: 10px solid black;">' + migr_pro + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Personal Details of New User</th> ' +
                                                                '<th style="border: 10px solid black;">' + migr_per + '</th>' +
                                                        '</tr>' +

                                                '</table> ' +
                                                '<br><br>' +
                                                'Please verify the records in order to keep the records updated<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br><br>' +
                                                '- Regards,<br><br>Amber</h3>'
                                         };


		       		smtpTransport.sendMail(mailOptions, function(err) {
		       		});




				});
				});
				});
				});
			});// employee verification list for usha on daily basis ends here


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

			//logic of adding leaves every quarter ends here
                        var cron = require('node-cron');
                        // seconds,minutes,hour,dayofmonth,quarter,week
                        cron.schedule('0 15 0 1 jan,apr,july,oct *', function()
                        {
				console.log("inside my cron");

				var date = new Date();
				var year = date.getFullYear();
				console.log("year",year);


                                pdbconnect.query("select * from emp_master_tbl where del_flg='N' order by emp_id",function(err, result) {
                                var emp_list_count = result.rowCount;
				console.log("emp_list_count",emp_list_count);

                                if(emp_list_count > 0)
                                {
                                        pdbconnect.query("select emp_id from emp_master_tbl where del_flg='N' order by emp_id asc",function(err,result){

                                        for(var n=0;n<emp_list_count;n++)
                                        {
                                                var eid = result.rows[n].emp_id;
						console.log("eid",eid);

                                                var arr = [];
                                                arr.push(eid);

                                                arr.forEach(function(i)
                                                {
                                                        var eid  = i;
							console.log("eid",eid);

							
							pdbconnect.query("select quaterly_leave from leave_master where emp_id=$1 and year=$2 and leave_type='EL'",[eid,year],function(err,result){
						
                                                        if (err)
                                                        {
                                                                console.error('Error with table query', err);
                                                        }

	
							var quater_leave = result.rows['0'].quaterly_leave; 
							console.log("quaterly_leave",quater_leave);

							if(parseFloat(quater_leave) > 0)
							{
								var quater_leave = parseFloat(3) + parseFloat(quater_leave);
							        console.log("added quaterly_leave",quater_leave);	

							}
							else
							{
								var quater_leave = parseFloat(quater_leave) + parseFloat(3);
							        console.log("added quaterly_leave",quater_leave);	
							}



							pdbconnect.query("update leave_master set quaterly_leave=$1 where emp_id=$2 and year=$3",[quater_leave,eid,year],function(err,result){
							if (err)
							{
								console.error('Error with table query', err);
							}
							else
							{
								console.log("done");
							}
							});
						});
						});
					}
					});
				}
				});
			});//logic of adding leaves every quarter ends here

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

			// updation of leave carryforward leaves for next year
                        var cron = require('node-cron');
                        // seconds,minutes,hour,dayofmonth,quarter,week
                        cron.schedule('0 20 0 31 dec *', function()
                        {
                                console.log("inside my cron updation for carry");

                                var date = new Date();
                                var year = date.getFullYear();

                                pdbconnect.query("select * from emp_master_tbl where del_flg='N' order by emp_id",function(err, result) {
                                var emp_list_count = result.rowCount;

                                if(emp_list_count > 0)
                                {
                                        pdbconnect.query("select emp_id from emp_master_tbl where del_flg='N' order by emp_id asc",function(err,result){

                                        for(var n=0;n<emp_list_count;n++)
                                        {
                                                var eid = result.rows[n].emp_id;

                                                var arr = [];
                                                arr.push(eid);

                                                arr.forEach(function(i)
                                                {
                                                        var eid  = i;

                                                        pdbconnect.query("select credited_leaves,carry_forwarded,availed_leaves from leave_master where emp_id=$1 and year=$2 and leave_type='EL'",[eid,year],function(err,result){
                                                        if (err)
                                                        {
                                                                console.error('Error with table query', err);
                                                        }

                                                        var credited_leaves = result.rows['0'].credited_leaves;
                                                        var carry_forwarded = result.rows['0'].carry_forwarded;
                                                        var availed_leaves = result.rows['0'].availed_leaves;
					

							var total_leaves = parseFloat(credited_leaves) + parseFloat(carry_forwarded) - parseFloat(availed_leaves);
							console.log("total_leaves",total_leaves);


                                                        if(parseFloat(total_leaves) > 0)
                                                        {

								if(parseFloat(total_leaves) >= 6)
								{
                                                                	var total_leaves1 = "6"; 
                                                                	console.log("added carry_leave",total_leaves);
								}
								else
								{
                                                                	var total_leaves1 = total_leaves;  
                                                                	console.log("added carry_leave",total_leaves1);
								}

                                                        }
                                                        else
                                                        {
                                                                var total_leaves1 = "0";
                                                                console.log("added carry_leave",total_leaves1);
                                                        }


							var next_year = year + 1;
							console.log("next year",next_year);
							

							pdbconnect.query("select allocated_leaves from leave_config where leave_type='EL' and year=$1",[next_year],function(err,result){
                                                        if (err)
                                                        {
                                                                console.error('Error with table query', err);
                                                        }
							else
							{
								var allocated_leaves = result.rows['0'].allocated_leaves;
								console.log("allocated_leaves",allocated_leaves);

							}


						        pdbconnect.query("select * from leave_master where leave_type='EL' and year=$1 and emp_id=$2",[next_year,eid],function(err,result){
                                                        if (err)
                                                        {
                                                                console.error('Error with table query', err);
                                                        }
                                                        else
                                                        {
                                                                var leaves_master_rowCount = result.rowCount;
                                                                console.log("leaves_master_rowCount",leaves_master_rowCount);
                                                        }
	

							if(leaves_master_rowCount == 0)
							{
                                                        	pdbconnect.query("INSERT INTO leave_master(emp_id,leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves, rcre_user_id,rcre_time, lchg_user_id, lchg_time, year, quaterly_leave) values($1,'EL','N','0',$2,$3,'0001',null,'0001',null,$4,'0')",[eid,total_leaves1,allocated_leaves,next_year],function(err,result){
								if (err)
								{
									console.error('Error with table query', err);
								}
								else
								{
									console.log("done");
								}
                                                        });
							}
                                                        });
                                                        });
                                                });
                                                });
                                        }
                                        });
                                }
                                });
                        }); // updation of leave carryforward leaves ends here


                        var cron = require('node-cron');
			cron.schedule('0 30 0 1-31 1-12 0-7', function()
                        {
  				pdbconnect.query("update users set login_check='N'",function(err,result){
					if (err)
					{
						console.error('Error with table query', err);
					}
					else
					{
						console.log("done");
					}
                                });
                        });

                        var cron = require('node-cron');
                        cron.schedule('0 35 0 * * *', function()
                        {
				console.log("inside autoapproval");
                                pdbconnect.query("select * from leaves where app_flg='N' and rej_flg='N' and del_flg='N'",function(err,result){
                                        if (err)
                                        {
                                                console.error('Error with table query', err);
                                        }
                                        else
                                        {
						var leave_count = result.rowCount;
                                                console.log("leave_count",leave_count);

					   if(leave_count > 0)
					   {	
                                		pdbconnect.query("select leave_id,emp_id,approver_id,leave_type,from_date,to_date,reason,now()::date - rcre_time::date as date_diff from leaves where app_flg='N' and rej_flg='N' and del_flg='N'",function(err,result){

						for(var n=0;n<leave_count;n++)
						{
							var leave_id = result.rows[n].leave_id;
							var emp_id = result.rows[n].emp_id;
							var approver_id = result.rows[n].approver_id;
							var leave_type = result.rows[n].leave_type;
							var from_date = result.rows[n].from_date;
							var to_date = result.rows[n].to_date;
							var reason = result.rows[n].reason;
							var date_diff = result.rows[n].date_diff;

							var arr = [];
							arr.push(leave_id);
							var arr1 = [];
							arr1.push(emp_id);
							var arr2 = [];
							arr2.push(approver_id);
							var arr3 = [];
							arr3.push(leave_type);
							var arr4 = [];
							arr4.push(from_date);
							var arr5 = [];
							arr5.push(to_date);
							var arr6 = [];
							arr6.push(reason);
							var arr7 = [];
							arr7.push(date_diff);

							arr.forEach(function(i)
							{
								var leave_id = i;

                                                        arr1.forEach(function(j)
                                                        {
								var emp_id = j;

                                                        arr2.forEach(function(k)
                                                        {
								var approver_id = k;

                                                        arr3.forEach(function(l)
                                                        {
								var leave_type = l;

                                                        arr4.forEach(function(m)
                                                        {
								var from_date = m;
								var from_date=dateFormat(from_date,"yyyy-mm-dd");

                                                        arr5.forEach(function(n)
                                                        {
								var to_date = n;
								var to_date=dateFormat(to_date,"yyyy-mm-dd");

                                                        arr6.forEach(function(o)
                                                        {
								var reason = o;

                                                        arr7.forEach(function(p)
                                                        {
								var date_diff = p;
		
								if(date_diff >= 15)
								{
									pdbconnect.query("update leaves set app_flg='Y' where leave_id=$1",[leave_id],function(err,result){
										if (err)
										{
											console.error('Error with table query', err);
										}
										else
										{
											console.log("updated successfully");
										}

									pdbconnect.query("select emp_email,emp_name from emp_master_tbl where emp_id=$1",[emp_id],function(err,result){
										if (err)
										{
											console.error('Error with table query', err);
										}
										else
										{
											var emp_email = result.rows['0'].emp_email;
											var empname = result.rows['0'].emp_name;
										}


									pdbconnect.query("select emp_email from emp_master_tbl where emp_id=$1",[approver_id],function(err,result){
										if (err)
										{
											console.error('Error with table query', err);
										}
										else
										{
											var app_email = result.rows['0'].emp_email;
										}

									pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'",function(err, hrMailList) {
									    if (err)
									    {
										console.error('Error with table query', err);
									    }
									    else
									    {
										  var hrEmail = hrMailList.rows['0'].comm_code_desc;
									    }

										  var ccmail = hrEmail + ',' + app_email;
										  var tomail = emp_email;


									var smtpTransport = nodemailer.createTransport('SMTP',{
									service: 'gmail',
									auth:
									{
										  user: 'amber@nurture.co.in',
										  pass: 'nurture@123'
									}
									});

									var mailOptions = {
									to: tomail,
									cc: ccmail,
									from: 'amber@nurture.co.in',
									subject: 'Auto Approval of leave',
									html: '<img src="https://www.biospectrumasia.com/uploads/articles/approved-8873.jpg" height="85"><br><br>' +
									'<h3>Dear <b>' + empname + '</b>,<br><br>' +
									'Your Leave application has been Auto-approved.<br><br>' +
									'<table style="border: 10px solid black;"> ' +
									'<tr style="border: 10px solid black;"> ' +
										'<th style="border: 10px solid black;">Leave Type</th> ' +
										'<th style="border: 10px solid black;">' + leave_type + '</th>' +
									'</tr>' +

									'<tr style="border: 10px solid black;"> ' +
										'<th style="border: 10px solid black;"> Employee Name </td> ' +
										'<th style="border: 10px solid black;">' + empname + '</td> ' +
									'</tr>' +

									'<tr style="border: 10px solid black;"> ' +
										'<th style="border: 10px solid black;">Employee ID</th> ' +
										'<th style="border: 10px solid black;">' + emp_id + '</th>' +

									'</tr>' +

									'<tr style="border: 10px solid black;"> ' +
										'<th style="border: 10px solid black;"> From Date </td> ' +
										'<th style="border: 10px solid black;">' + from_date + '</td> ' +
									'</tr>' +

									'<tr style="border: 10px solid black;"> ' +
										'<th style="border: 10px solid black;">To Date</th> ' +
										'<th style="border: 10px solid black;">' + to_date + '</th>' +

									'</tr>' +

									'<tr style="border: 10px solid black;"> ' +
										'<th style="border: 10px solid black;"> Reason </td> ' +
										'<th style="border: 10px solid black;">' + reason + '</td> ' +
									'</tr>' +
									'</table> ' +
									'<br><br>' +
									'URL: http://amber.nurture.co.in <br><br><br>' +
									'- Regards,<br><br>Amber</h3>'
								 };
								 smtpTransport.sendMail(mailOptions, function(err) {
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
							         });
							         });
							         });
							}	
							});
							}	
							else
							{
								console.log("no leave cron today");
							}
						}
					});
                        });
};
});


/////////////////////////////////////// End Of Logic ////////////////////////////////////////
