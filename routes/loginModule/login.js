console.log("routes login");
var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var Promise = require('mpromise');
var User = require('../../models/user');
var ensureAuthenticated=require('../../routes/utils/utils');
var pdbconnect=require('../../routes/database/psqldbconnect');
var moment = require('moment');
var rp = require('request-promise');
var mislog=require('winston');
var getIP = require('ipware')().get_ip;
var requestIp = require('request-ip');
var check="";
var fs = require('fs');         //Added by arun 21=07=2017 16:00
var logincheck="";
module.exports.distributedCount="";
var attempts=0;

//Passport authentication for user log in
passport.use(new LocalStrategy(
function(username, password, done) 
{
  pdbconnect.query("SELECT login_attempts from users where LOWER(user_id) = LOWER($1)",
                      [username],function(err,result){
		console.log(username);
             if(err) throw err;
             attempts=result.rows['0'].login_attempts;           
  });

  User.getUserByUsername(username,function(err,user)
  {
    if(err) throw err     
     
    if(user.rows == "")
     {
      console.log("user doesnt existssss")
      return done(null,false,{message:'user doesnt exist'});
     }
    
   User.comparePassword(password,user.rows[0].password,function(err,isMatch)
   {

      if(err)throw err;
      
       if(isMatch){
              return done(null,user);
              } 
        else if(attempts<4){
      
          attempts++;
            pdbconnect.query("UPDATE users SET login_attempts=$1 WHERE LOWER(user_id)=LOWER($2)",[attempts,username]); 
          return done(null,false,{message:'Wrong Passcode. Please try again. '+ (4-attempts) + ' attempts remaining.' });
         }
       else if(attempts==4) {

          pdbconnect.query("UPDATE users SET login_allowed=$1,login_attempts=$2 WHERE LOWER(user_id)=LOWER($3)",['N',attempts,username]);
      
                return done(null,false,{
                  message:'Your Account is locked. Please contact administrator.'
                });
              }
            });
          });
        }));  

passport.serializeUser(function(user, done) {
  console.log("checked");
  done(null, user.rows[0].user_id);
});

passport.deserializeUser(function(user_id,done) 
{
  User.getUserById(user_id, function(err, user) {
    done(err,user);
  });
  //console.log('checked1');
 });


var user;

router.post('/logincheck',passport.authenticate('local',{failureRedirect:'/',failureFlash:true}),loginCheck);    
router.get('/resetSession',ensureAuthenticated,resetsession);    
router.get('/multiSession',ensureAuthenticated,multiSession);    

function resetsession(req, res)
{
var username=req.user.rows['0'].user_id;
var cIp=req.user.rows['0'].client_ip;
var esid = req.user.rows[0].session_id;
console.log("esid-reset>",esid);
var clientIp = requestIp.getClientIp(req);
console.log("clientIp-reset->",clientIp);
var sId =req.sessionID;
console.log("sId-reset->",sId);

if(esid != sId)
{
pdbconnect.query("UPDATE users SET login_check=$1,client_ip='',session_id='' where LOWER(user_id)=LOWER($2)",['N',username]);
res.redirect('/');
}
};

function multiSession(req, res)
{
	var username=req.user.rows['0'].user_id;
	var cIp=req.user.rows['0'].client_ip;
	var esid = req.user.rows[0].session_id;
	console.log("esid-reset>",esid);
	var clientIp = requestIp.getClientIp(req);
	console.log("clientIp-reset->",clientIp);
	var sId =req.sessionID;
	console.log("sId-reset->",sId);


	pdbconnect.query("UPDATE users SET login_check=$1,client_ip='',session_id='' where LOWER(user_id)=LOWER($2)",['N',username]);
	res.redirect('/');

};



 
function loginCheck(req, res) 
 {

 console.log('row user',req.user.rows['0'].user_id);
 console.log('row password',req.user.rows['0'].password);
 console.log('client ip',req.user.rows['0'].client_ip);
 console.log('session_id',req.user.rows['0'].session_id);
  var username=req.user.rows['0'].user_id;
  var password=req.user.rows['0'].password;
  var emp_access = req.user.rows[0].user_type;
  var eip = req.user.rows[0].client_ip;
  console.log("eip-->",eip);	
  var esid = req.user.rows[0].session_id;
  console.log("esid-->",esid);	
  var error1="";
  var clientIp = requestIp.getClientIp(req);
  console.log('clentip-->',clientIp);
  var sId =req.sessionID; 

  var hu=['AU','RU'];
  var queryres="";
  var ename="";
  var eid="";
  var email="";
  var desig="";
  var unReadCount ="";
  var docPendingCount = 0;
  var now = new Date();
  module.exports.usertype = ""; 
  module.exports.users = ""; 
  module.exports.usercount="";
  module.exports.lastlogin="";
  module.exports.role="";
  module.exports.userid="";
  module.exports.reportcounts="";
  module.exports.downloadcounts="";
  module.exports.datecheck="";
  module.exports.sessiontimeout="";
  module.exports.activeuser="";
module.exports.user_email="";
module.exports.username="";
module.exports.email="";
module.exports.listofrecords="";
module.exports.profilepic="";
module.exports.reminderlist="";
module.exports.reminderlist_count="";
module.exports.reminderlist_past="";
//profilepic=req.user.rows[0].img;
//console.log("use",req.user.rows[0].img)
//console.log("profilepic",profilepic);
console.log("session:::::",req.sessionID);
console.log("esid##",esid);
console.log("sid##",sId);

if (esid == sId)
{
         var error="IP";
         res.render('loginModule/login',{
                          error:error
                        });

}

      pdbconnect.query("SELECT * FROM users where del_flag=$1",['N'], function(err, userscount) 
	{
            if (err) {
                console.error('Error with table query', err);
            } else {
          usercount=userscount.rowCount;
          console.log('usercount',usercount);
        }
      });

pdbconnect.query("SELECT reset_flg FROM users where user_id=$1",[username],function(err, flg)
{
    var check = flg.rows['0'].reset_flg;
      if (check == 'Y')
      {
        console.log("rende to reset page");
        console.log("error1",error1);
         var error1="Please Change The Default Password and Proceed";
                        res.render('changePassword/changePassword',{
                          error1:error1
                        });
      }
     //pdbconnect.query("UPDATE users SET login_attempts=$1,login_check=$2,reset_flg='N' where LOWER(user_id)=LOWER($3)",[attempts,'Y',username]);
       //          console.log("after update"); 
});

pdbconnect.query("SELECT del_flag FROM users where user_id=$1",[username],function(err, flg)
{
    var check = flg.rows['0'].del_flag;
      if (check == 'Y')
      {
         var success_msg="Your Account has been Suspended";
                        res.render('loginModule/login',{
                          success_msg:success_msg
                        });
      }
     //pdbconnect.query("UPDATE users SET login_attempts=$1,login_check=$2,reset_flg='N' where LOWER(user_id)=LOWER($3)",[attempts,'Y',username]);
       //          console.log("after update");
});




    pdbconnect.query("SELECT login_check,LOWER(user_id),user_type,expiry_date from users where LOWER(user_id) = LOWER($1) and (expiry_date>=$2 and login_allowed=$3) and(del_flag=$4)",
                      [username,now,'Y','N'],function(err,result){
       if(err) throw err;

         if(result.rows['0']!=null) 
	  {    
      	   console.log("within case check");
	   logincheck=result.rows['0'].login_check;
       	     if(logincheck=="N")
	     {
               userid=result.rows['0'].user_id;
               queryres=result.rows['0'].user_type;
               datecheck=result.rows['0'].expiry_date;
	       console.log('user_type',queryres);
               attempts=0;



                pdbconnect.query("UPDATE users SET login_attempts=$1,login_check=$2,reset_flg='N' where LOWER(user_id)=LOWER($3)",[attempts,'Y',username]);
                 console.log("after update");
//to check the number of unread messages
                pdbconnect.query("SELECT * FROM messages  where del_flg = $1 and to_user_id = $2 and read_flg= $3" ,['N',req.user.rows['0'].user_id,'N'], function(err, unreadCountList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                unReadCount = unreadCountList.rowCount;
                //rowData = result.rows;

             //     console.log('unReadCount in login ',unReadCount);
                }
              
//to check the number of users online
              pdbconnect.query("SELECT * FROM users  where login_check = $1 and user_id != $2" ,['Y',username], function(err, onlinelist) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                onlineCount = onlinelist.rowCount;
                onlineData = onlinelist.rows;
           //     console.log('onlineCount',onlineCount);
                  
                  
                }

 //to get phone numbers
              pdbconnect.query("select empMaster.emp_email, empMaster.emp_name,empMaster.emp_id, phone1, phone2, emergency_num from emp_info_tbl empInfo,emp_master_tbl empMaster where  empMaster.emp_id = empInfo.emp_id and empInfo.del_flg = $1 and empMaster.del_flg= $2 order by empMaster.emp_name asc" ,['N','N'], function(err, directoryList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                directoryCount = directoryList.rowCount;
                directoryData = directoryList.rows;
          //      console.log('directoryCount',directoryCount);
           //     console.log('directoryData', directoryData);
               
                  
                }

// to get the birthdays
//SELECT emp_name, dob,cast(dob + ((extract(year from age(dob)) + 1) * interval '1' year) as date) as next_birthday from emp_info_tbl where del_flg ='N' order by next_birthday asc
                 pdbconnect.query("SELECT emp_name, dob,cast(dob + ((extract(year from age(dob)) + 1) * interval '1' year) as date) as next_birthday from emp_info_tbl where del_flg =$1 order by next_birthday asc" ,['N'], function(err, bdayList) {            if (err) {
                console.error('Error with table query', err);
            } else {
                bdayCount = bdayList.rowCount;
                bdayData = bdayList.rows;
           //     console.log('onlineCount',bdayCount);
           //     console.log('onlineData', bdayData);
               
                  
                }

var emp_id=req.user.rows['0'].user_id;
// to get the pending appraisal related counts

pdbconnect.query("SELECT APPRAISAL_MONTH, APPRAISAL_YEAR FROM appraisal_master_table where emp_id =$1 and app_flg =$2 and app_conf =$3 and rej_flg=$4" ,[emp_id,'N','N','N'], function(err, resultNotApproved) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                
              app_notApproved = resultNotApproved.rowCount;
          } 


pdbconnect.query("SELECT APPRAISAL_MONTH, APPRAISAL_YEAR FROM appraisal_master_table where emp_id =$1 and app_flg =$2 and app_conf=$3 and rej_flg=$4" ,[emp_id,'Y','N','N'], function(err, resultNotAccepted) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                app_pendingAccep = resultNotAccepted.rowCount
           
          } 

//REJECTED APPRAISALS
          pdbconnect.query("SELECT APPRAISAL_MONTH, APPRAISAL_YEAR FROM appraisal_master_table where emp_id =$1 and app_flg =$2 and app_conf=$3 and rej_flg=$4" ,[emp_id,'Y','N','Y'], function(err, resultRejected) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                app_rejPendClosure = resultRejected.rowCount
           
          }

	var appraisal_main = parseInt(app_notApproved) + parseInt(app_pendingAccep) + parseInt(app_rejPendClosure);

      // added by srikanth 
                         pdbconnect.query("SELECT * from emp_master_tbl_temp where entity_cre_flg='N'", function(err, getInfo){
            if (err) {
                console.error('Error with table query', err);
             } else {
                pending_empProf = getInfo.rowCount
                console.log("pending_empProf",pending_empProf);

             }
                console.log("pending_empProf",pending_empProf);
 


                pdbconnect.query("SELECT * from emp_info_tbl_temp where entity_cre_flg='N'", function(err, getdata){
            if (err) {
                console.error('Error with table query', err);
             } else {
                pending_empPer = getdata.rowCount

             }

	  var emp_main = parseInt(pending_empProf) + parseInt(pending_empPer);

          pdbconnect.query("SELECT * from emp_info_tbl_temp where entity_cre_flg='N' and emp_id=$1",[emp_id],function(err, getdet){
          if (err)
          {
                console.error('Error with table query', err);
          }
          else
          {
                showFlg = getdet.rowCount
		var empCounter1 = getdet.rowCount;

                if(showFlg == "0")
                {
                        var showFlg = "No Records for Verification";
			var empCounter = "0";
                }
                else
                {
                        var showFlg = "Awaiting Verification";
			var empCounter = "1";
                }
          }

          pdbconnect.query("select * from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e,emp_master_tbl s where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and s.emp_id = p.project_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' order by m.milestone_exp_date asc", function(err, getdata){
          if (err)
          {
                console.error('Error with table query', err);
          }
          else
          {
                pending_invoiceDue = getdata.rowCount
          }

          pdbconnect.query("select * from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e,emp_master_tbl s where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and s.emp_id = p.project_mgr and m.confirm_flg='Y' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' order by m.milestone_exp_date asc", function(err, getdata){
          if (err)
          {
                console.error('Error with table query', err);
          }
          else
          {
                pending_invoiceRaise = getdata.rowCount
                console.log("invoice due",pending_invoiceRaise);
          }

          pdbconnect.query("SELECT * from invoice_mast_tbl where confirm_flg = 'Y' and paid_flg = 'N' and del_flg = 'N'", function(err, getdata){
          if (err)
          {
                console.error('Error with table query', err);
          }
          else
          {
                pending_invoicePay = getdata.rowCount
                console.log("invoice due",pending_invoicePay);
          }


	var invoice_main = parseInt(pending_invoiceDue) + parseInt(pending_invoiceRaise) + parseInt(pending_invoicePay);



          // added by srikanth ends here //



          //Added by arun 27-01-2017 15:50
		if(emp_access != "A1")
		{
			var pFolder = './data/CMS/employee/uploadDoc/'+emp_id+"/";
			if (!fs.existsSync(pFolder))
			{
				console.log('No records found for approval pending');
			}
			else
			{
				fs.readdirSync(pFolder).forEach(
				function(name)
				{
					var resValue = name.search("uv");
					if(resValue != -1)
					{
						docPendingCount = docPendingCount + 1;
					}
				});
			}
		}
		else
		{
			var len = 0,len1 = 0,len2 = 0;
			var cpath = [];
			var testFolder = './data/CMS/employee/uploadDoc/';
			if (!fs.existsSync(testFolder))
			{
				console.log('No users found for approval pending');
			}
			else
			{
				fs.readdirSync(testFolder).forEach(
				function(empId)
				{
					len1=0;
					cpath[len] = testFolder + empId + "/";
					try
					{
						fs.readdirSync(cpath[len]).forEach(
						function(empFile)
						{
							var resValue = empFile.search("uv");
							if(resValue != -1)
							{
								docPendingCount = docPendingCount + 1;
								throw "done";
							}
						});
					}
					catch (e) {if (e != "done") console.log(empId);}
				});
			}
		}
          //End

		  
		   //added by Divya for pending details in Claims and Travel module strts
		  console.log("BEFORE travel request CALL in dashboard:::");
				var trvlPendngRowData = 0;
				pdbconnect.query("SELECT req_id,emp_id FROM travel_master_tbl_temp where approver_id=$1 and appr_flg=$2 and del_flg=$3 order by req_id::integer desc",[emp_id,'N','N'], function(err, trvlPendingData) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				console.log("inside travel request query in dashboard:::");
            	var rowData = trvlPendingData.rows;
				console.log("row in dashboard:::",rowData);
				var trvlPendngRowData = trvlPendingData.rowCount;
            	
                console.log("empResult.rowcount :: INDASHBOARD::",trvlPendngRowData);
            	
           
			
		}
			pdbconnect.query("SELECT req_id,emp_id FROM travel_master_tbl where appr_flg=$1 and confrm_flg=$2 and reject_flg=$3 and del_flg=$4 order by req_id::integer desc",['Y','N','N','N'], function(err, pendingResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	 pendingStatusData = pendingResult.rows;
            	console.log("row",pendingStatusData);
				var trvlPendngCount = pendingResult.rowCount;
                
          
			
		}
		pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date FROM reimbursement_master_tbl where repmgr_id=$1 and status=$2 and del_flg=$3 order by remb_id::integer desc",[emp_id,'pending','N'], function(err, claimResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
            	var claimRowDataPending = claimResult.rows;
            	console.log("claimRowDataPending",claimRowDataPending);
				var claimPendngCount = claimResult.rowCount;
                console.log("empResult.rowcount",claimResult.rowCount);
		}

                pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date FROM reimbursement_master_tbl where hr_id=$1 and status=$2 and hr_status=$3 and del_flg=$4 order by remb_id::integer desc",[emp_id,'approved','pending','N'], function(err, claimResulthr) {
            if (err) {
                console.error('Error with table query', err);
            } else {

				
            	var claimRowPending = claimResulthr.rows;
            	console.log("row",rowData);
		var claimPendngHrCount = claimResulthr.rowCount;
                console.log("claimResulthr.rowcount",claimResulthr.rowCount);
            	
          
			
		}

    pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date FROM reimbursement_master_tbl where hr_id=$1 and status=$2 and hr_status=$3 and del_flg=$4 and settlement_paid_flg=$5 order by remb_id::integer desc",[emp_id,'approved','confirmed','N','N'], function(err, claimsettleStatus) {
            if (err) {
                console.error('Error with table query', err);
            } else {
        
        
              var claimStatusRowPending = claimsettleStatus.rows;
              console.log("claimStatusRowPending",claimStatusRowPending);
              var claimsettleStatusCount = claimsettleStatus.rowCount;
              console.log("claimsettleStatusCount",claimsettleStatusCount);
              
          
      
    }

    pdbconnect.query("SELECT comm_code_desc cocd ,emp_name emp, * from leaves l,common_code_tbl cocd , emp_master_tbl emp where  emp.del_flg ='N' and  l.del_flg='N' and l.emp_id =$1 and l.approver_id = emp.emp_id and cocd.del_flg ='N'and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP' and l.app_flg='N' and l.rej_flg='N'",[emp_id],function(err,resultleave) {
            if (err)
            {
                console.error('Error with table query', err);
            }
            else
            {
                var leave_tobe_approved = resultleave.rowCount;
            }

	pdbconnect.query("SELECT  comm_code_desc cocd ,emp_name emp,* from leaves l, emp_master_tbl emp, common_code_tbl cocd  where l.del_flg= 'N' and l.approver_id =$1 and l.app_flg = 'N' and l.emp_id = emp.emp_id and rej_flg = 'N' and l.app_flg='N' and l.rej_flg='N' and cocd.del_flg ='N' and emp.del_flg ='N' and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP'",[emp_id],function(err,resultleave){
            if (err)
            {
                console.error('Error with table query', err);
            }
            else
            {
                var leave_to_approve = resultleave.rowCount;
            }

            var total_leave_count = parseInt(leave_tobe_approved) + parseInt(leave_to_approve);

	
	//added by srikanth for l3 project manager if any

	var userId=req.user.rows['0'].user_id;;
	console.log("sri user",userId);
        pdbconnect.query("SELECT * from project_master_tbl where project_mgr = $1 and closure_flg='N' and del_flg='N' order by project_id asc",[userId],function(err,result)
        {
	        if (err) 
		{
                	console.error('Error with table query', err);
            	} 
		else 
		{
              		var markCount = result.rowCount;
              		console.log("markcount",markCount);
    		}




		//end

	// added to filter dashboard pending tasks 

        if(emp_access == "A1")
        {

         totalAppPending = parseInt(app_notApproved) + parseInt(app_pendingAccep) + parseInt(app_rejPendClosure) + parseInt(docPendingCount) + parseInt(pending_empProf) + parseInt(pending_empPer) + parseInt(total_leave_count);

        }
        else
        {
                // overides the total count only for finace
                if(emp_access == "F1")
                {

                        totalAppPending = parseInt(app_notApproved) + parseInt(app_pendingAccep) + parseInt(app_rejPendClosure) + parseInt(docPendingCount) + parseInt(empCounter) + parseInt(pending_invoiceDue) + parseInt(pending_invoiceRaise) + parseInt(pending_invoicePay)+ parseInt(trvlPendngCount)+ parseInt(claimPendngHrCount)+parseInt(claimsettleStatusCount) + parseInt(total_leave_count);



                }
				else if(emp_access == "L1" || emp_access == "L2")
				{
					totalAppPending = parseInt(app_notApproved) + parseInt(app_pendingAccep) + parseInt(app_rejPendClosure) + parseInt(docPendingCount) + parseInt(empCounter)+ parseInt(trvlPendngRowData)+ parseInt(claimPendngCount) + parseInt(total_leave_count);
				}
		
                else
                {
                        totalAppPending = parseInt(app_notApproved) + parseInt(app_pendingAccep) + parseInt(app_rejPendClosure) + parseInt(docPendingCount) + parseInt(empCounter) + parseInt(total_leave_count);
                }

        }

         var document_date="";
        var nowDate=moment().format('YYYY-MM-DD');
       
         pdbconnect.query("SELECT document_date,remb_id FROM reimbursement_master_tbl where emp_id =$1 and status =$2 and hr_status=$3" ,[emp_id,'approved','pending'], function(err, approvedResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                approvedResultCount = approvedResult.rowCount
                var approvedDataResult = approvedResult.rows;
                //console.error('approvedResult', approvedResult.rows);
                console.log('approvedDataResult.length',approvedDataResult.length);
                for (var i = 0; i < approvedDataResult.length; i++) {
                document_dateString = approvedDataResult[i].document_date;
                remb_id=approvedDataResult[i].remb_id
                //console.log('document_dateString',document_dateString) ;
                //document_date = moment('document_dateString').format('YYYY-MM-DD')
               //var dDate=moment(document_dateString).format('YYYY-MM-DD')
               // var diff = moment(document_dateString).startOf('day').fromNow();

                var duration = moment.duration(moment(document_dateString).diff(nowDate));
                var days = duration.asDays();

                //console.error('diff', diff);
                //console.error('days', days);
                console.error('nowDate', nowDate);
                console.error('document_date', document_date);
                if(days<0)
                {
                 pdbconnect.query("UPDATE  reimbursement_master_tbl set  status = $1 where remb_id=$2",['autoreject',remb_id],function(err,done){
             if(err) 
            console.error('Error with table query', err);
                pdbconnect.query("UPDATE  reimbursement_master_tbl_hist set  status = $1 where remb_id=$2",['autoreject',remb_id],function(err,done){
             if(err) 
            console.error('Error with table query', err);
        });
                 });

            pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id=$1", [emp_id], function(err, empResult) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    employee_name = empResult.rows['0'].emp_name;
                    employee_email = empResult.rows['0'].emp_email;
                    console.log('employee_name in confirm func', employee_name);
                    console.log('employee_email in confirm func', employee_email);
                }
                });
                var smtpTransport = nodemailer.createTransport('SMTP', {
                    service: 'gmail',
                    auth: {
                        user: 'nurtureportal',
                        pass: 'nurture@123'
                    }
                });
                var mailOptions = {
                    to: employee_email,
                    from: 'nurtureportal@gmail.com',
                    subject: 'IS:Reimbursement request autoreject',
                    text: ' The reimbursement request raised for' + remb_id + 'Id is autorejected since document submission date  exceeds the deadline.\n' + '\n' + ' -Reimbursement System'
                };
                smtpTransport.sendMail(mailOptions, function(err) {});
            
                
            
                }

                }

                
         
          
             }
           });
           pdbconnect.query("UPDATE users SET login_attempts=$1,login_check=$2,reset_flg='N',client_ip=$4,session_id=$5 where LOWER(user_id)=LOWER($3)",[attempts,'Y',username,clientIp,sId]);
                 console.log("after update");

               
                  res.render('admin-dashboard/adminDashboard',{
                            ename:req.user.rows['0'].user_name,
			    eid:req.user.rows['0'].user_id,
			    emp_access:req.user.rows['0'].user_type,
			    unReadCount:unReadCount,
			    onlineCount:onlineCount,
			    onlineData:onlineData,
			    bdayData:bdayData,
			    currentDate:now,
			    totalAppPending:totalAppPending,
			    app_notApproved:app_notApproved,
			    app_pendingAccep:app_pendingAccep,
			    app_rejPendClosure:app_rejPendClosure,
			    docPendingCount:docPendingCount,
			    pending_empProf:pending_empProf,
			    pending_empPer:pending_empPer,
			    showFlg:showFlg,
			    pending_invoiceDue:pending_invoiceDue,
			    pending_invoiceRaise:pending_invoiceRaise,
			    pending_invoicePay:pending_invoicePay,
			    emp_access:emp_access,
			trvlPendngRowData:trvlPendngRowData,
			trvlPendngCount:trvlPendngCount,
			claimPendngCount:claimPendngCount,
			claimPendngHrCount:claimPendngHrCount,
claimsettleStatusCount:claimsettleStatusCount,
markCount:markCount,
appraisal_main:appraisal_main,
emp_main:emp_main,
empCounter1:empCounter1,
invoice_main:invoice_main,
        leave_tobe_approved:leave_tobe_approved,
        leave_to_approve:leave_to_approve,
	total_leave_count:total_leave_count

			  });
			  });
			  });
			  });
			  });
	         });         });
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
});
	    } 
        else
        {

                  req.flash('error','LOGGED');
                  res.redirect('/');

        }

        }
        else
	{
              req.flash('error','Your Account is locked. Please contact administrator');
              res.redirect('/');
        }
       }); 
      };
      
module.exports = router;
