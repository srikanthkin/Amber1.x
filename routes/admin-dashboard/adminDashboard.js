var express = require('express');
var router = express.Router();
var moment=require('moment');
var mislog=require('winston');
var fs = require('fs');         //Added by arun 21=07=2017 16:15
var ensureAuthenticated=require('../../routes/utils/utils');

var pdbconnect=require('../../routes/database/psqldbconnect');
router.get('/admindashboard',ensureAuthenticated, adminDashboard);
function adminDashboard(req,res){
var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows['0'].user_type;
var now = new Date();
var docPendingCount = 0; //Added by arun 21-07-2017 16:15
//to check the number of unread messages

	pdbconnect.query("SELECT * FROM messages  where del_flg = $1 and to_user_id = $2 and read_flg= $3" ,['N',req.user.rows['0'].user_id,'N'], function(err, unreadCountList){
            if (err) 
	    {
                	console.error('Error with table query', err);
            } 
	    else 
	    {
                unReadCount = unreadCountList.rowCount;
            }

        pdbconnect.query("SELECT * from project_master_tbl where project_mgr = $1 and closure_flg='N' and del_flg='N' order by project_id asc",[emp_id],function(err,result){ 
            if (err)
            {
                        console.error('Error with table query', err);
            }
            else
            {
                markCount = result.rowCount;
            }

                //to check the number of users online
            pdbconnect.query("SELECT * FROM users  where login_check = $1 and user_id != $2" ,['Y',emp_id], function(err, onlinelist) {
            if (err) 
	    {
                console.error('Error with table query', err);
            } 
	    else 
	    {
                onlineCount = onlinelist.rowCount;
                onlineData = onlinelist.rows;
            }

            //to get phone numbers
            pdbconnect.query("select empMaster.emp_email, empMaster.emp_name,empMaster.emp_id, phone1, phone2, emergency_num from emp_info_tbl empInfo,emp_master_tbl empMaster where  empMaster.emp_id = empInfo.emp_id and empInfo.del_flg = $1 and empMaster.del_flg= $2 order by empMaster.emp_name asc" ,['N','N'], function(err, directoryList) {
            if (err) 
	    {
                console.error('Error with table query', err);
            } 
	    else 
            {
                directoryCount = directoryList.rowCount;
                directoryData = directoryList.rows;
            }

                //select dob,cast(dob + ((extract(year from age(dob)) + 1) * interval '1' year) as date) as next_birthday from emp_info_tbl

            pdbconnect.query("SELECT dob, emp_name, cast(dob + ((extract(year from age(dob)) + 1) * interval '1' year) as date) as next_birthday from emp_info_tbl where del_flg = $1   order by next_birthday asc " ,['N'], function(err, bdayList) {
            if (err) 
	    {
                console.error('Error with table query', err);
            } 
	    else 
	    {
                bdayCount = bdayList.rowCount;
                bdayData = bdayList.rows;
            }

                // to get the pending appraisal related counts
	    pdbconnect.query("SELECT APPRAISAL_MONTH, APPRAISAL_YEAR FROM appraisal_master_table where emp_id =$1 and app_flg =$2 and app_conf =$3 and rej_flg=$4" ,[emp_id,'N','N','N'], function(err, resultNotApproved) {
            if (err) 
	    {
                console.error('Error with table query', err);
            } 
	    else 
	    {
              app_notApproved = resultNotApproved.rowCount;
            } 


	   pdbconnect.query("SELECT APPRAISAL_MONTH, APPRAISAL_YEAR FROM appraisal_master_table where emp_id =$1 and app_flg =$2 and app_conf=$3 and rej_flg=$4" ,[emp_id,'Y','N','N'], function(err, resultNotAccepted) {
           if (err) 
	   {
                console.error('Error with table query', err);
           } 
	   else 
	   {
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


	  // added by srikanth //
	  pdbconnect.query("SELECT * from emp_master_tbl_temp where entity_cre_flg='N'", function(err, getInfo){ 
          if (err) 
	  {
                console.error('Error with table query', err);
          } 
          else 
	  { 
                pending_empProf = getInfo.rowCount
   	  }

          pdbconnect.query("SELECT * from emp_info_tbl_temp where entity_cre_flg='N'", function(err, getdata){
          if (err) 
	  {
                console.error('Error with table query', err);
          } 
	  else 
	  {
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

	  // added for invoice module from srikanth on 05-10-2017 10:22 AM

	  // invoice due	
          pdbconnect.query("select * from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e,emp_master_tbl s where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and s.emp_id = p.project_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' order by m.milestone_exp_date asc", function(err, getdata){
          if (err)
          {
                console.error('Error with table query', err);
          }
          else
          {
                pending_invoiceDue = getdata.rowCount
          }


          // invoice raise
          pdbconnect.query("select * from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e,emp_master_tbl s where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and s.emp_id = p.project_mgr and m.confirm_flg='Y' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' order by m.milestone_exp_date asc", function(err, getdata){
          if (err)
          {
                console.error('Error with table query', err);
          }
          else
          {
                pending_invoiceRaise = getdata.rowCount
          }


          // invoice to be paid
          pdbconnect.query("SELECT * from invoice_mast_tbl where confirm_flg = 'Y' and paid_flg = 'N' and del_flg = 'N'", function(err, getdata){
          if (err)
          {
                console.error('Error with table query', err);
          }
          else
          {
                pending_invoicePay = getdata.rowCount
          }

	  var invoice_main = parseInt(pending_invoiceDue) + parseInt(pending_invoiceRaise) + parseInt(pending_invoicePay);


	  // added by srikanth ends here //

	  //Added by arun 27-01-2017 16:15
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
		}
		
		pdbconnect.query("SELECT req_id,emp_id FROM travel_master_tbl where appr_flg=$1 and confrm_flg=$2 and reject_flg=$3 and del_flg=$4 order by req_id::integer desc",['Y','N','N','N'], function(err, pendingResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	 pendingStatusData = pendingResult.rows;
				var trvlPendngCount = pendingResult.rowCount;
                
          
			
		}
		pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date FROM reimbursement_master_tbl where repmgr_id=$1 and status=$2 and del_flg=$3 order by remb_id::integer desc",[emp_id,'pending','N'], function(err, claimResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var claimRowDataPending = claimResult.rows;
		var claimPendngCount = claimResult.rowCount;
            	
           
			
		}
		pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date FROM reimbursement_master_tbl where hr_id=$1 and status=$2 and hr_status=$3 and del_flg=$4 order by remb_id::integer desc",[emp_id,'approved','pending','N'], function(err, claimResulthr) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var claimRowPending = claimResulthr.rows;
				var claimPendngHrCount = claimResulthr.rowCount;
            	
          
			
		}

    pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date FROM reimbursement_master_tbl where hr_id=$1 and status=$2 and hr_status=$3 and del_flg=$4 and settlement_paid_flg=$5 order by remb_id::integer desc",[emp_id,'approved','confirmed','N','N'], function(err, claimsettleStatus) {
            if (err) {
                console.error('Error with table query', err);
            } else {
        
        
              var claimStatusRowPending = claimsettleStatus.rows;
              var claimsettleStatusCount = claimsettleStatus.rowCount;
    	}

	/// added by srikanth for leave

    pdbconnect.query("SELECT comm_code_desc cocd ,emp_name emp, * from leaves l,common_code_tbl cocd , emp_master_tbl emp where  emp.del_flg ='N' and  l.del_flg='N' and l.emp_id =$1 and l.approver_id = emp.emp_id and cocd.del_flg ='N'and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP' and l.app_flg='N' and l.rej_flg='N'",[emp_id],function(err,resultleave) {
            if (err) 
	    {
                console.error('Error with table query', err);
            } 
	    else 
            {
              	var leave_tobe_approved = resultleave.rowCount;
            }


        pdbconnect.query("SELECT  comm_code_desc cocd ,emp_name emp,* from leaves l, emp_master_tbl emp, common_code_tbl cocd  where l.del_flg= 'N' and l.approver_id =$1 and l.app_flg = 'N' and l.emp_id = emp.emp_id and rej_flg = 'N' and cocd.del_flg ='N' and emp.del_flg ='N' and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP' and l.app_flg='N' and l.rej_flg='N'",[emp_id],function(err,resultleave){
            if (err)
            {
                console.error('Error with table query', err);
            }
            else
            {
                var leave_to_approve = resultleave.rowCount;
            }

            var total_leave_count = parseInt(leave_tobe_approved) + parseInt(leave_to_approve);

          //End



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

 //added by nandhini 08-09-2017 for reimbursement module
              var document_date="";
        var nowDate=moment().format('YYYY-MM-DD');
       
         pdbconnect.query("SELECT document_date,remb_id FROM reimbursement_master_tbl where emp_id =$1 and status =$2 and hr_status=$3" ,[emp_id,'approved','pending'], function(err, approvedResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                approvedResultCount = approvedResult.rowCount
                var approvedDataResult = approvedResult.rows;
               
                console.log('approvedDataResult.length',approvedDataResult.length);
                for (var i = 0; i < approvedDataResult.length; i++) {
                document_dateString = approvedDataResult[i].document_date;
                remb_id=approvedDataResult[i].remb_id
               
                var duration = moment.duration(moment(document_dateString).diff(nowDate));
                var days = duration.asDays();

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
          pdbconnect.query("SELECT from_date,req_id FROM travel_master_tbl_temp where emp_id =$1 and appr_flg =$2" ,[emp_id,'N'], function(err, pendingResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                pendingResultCount = pendingResult.rowCount
                var pendingDataResult = pendingResult.rows;
               
                console.log('pendingDataResult.length',pendingDataResult.length);
                for (var i = 0; i < pendingDataResult.length; i++) {
                document_dateString = pendingDataResult[i].from_date;
                req_id=pendingDataResult[i].req_id;
               
                var duration = moment.duration(moment(document_dateString).diff(nowDate));
                var days = duration.asDays();

                if(days<0)
                {
                 pdbconnect.query("UPDATE  travel_master_tbl_temp set  del_flag = $1 where req_id=$2",['Y',req_id],function(err,done){
             if(err) 
            console.error('Error with table query', err);
                pdbconnect.query("UPDATE  reimbursement_master_tbl_hist set  del_flag = $1 where req_id=$2",['Y',req_id],function(err,done){
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
         




  	res.render('admin-dashboard/adminDashboard',{
        ename:req.user.rows['0'].user_name,
        eid:req.user.rows['0'].user_id,
	emp_access:req.user.rows['0'].user_type,
        unReadCount:unReadCount,
        onlineCount:onlineCount,
        onlineData:onlineData,
	bdayCount:bdayCount,
        bdayData:bdayData,
        currentDate:now,
	pending_empProf:pending_empProf,    //added by srikanth
	pending_empPer:pending_empPer,	//added by srikanth
	showFlg:showFlg, // added by srikanth
	pending_invoiceDue:pending_invoiceDue, // added by srikanth
	pending_invoiceRaise:pending_invoiceRaise, // added by srikanth
	pending_invoicePay:pending_invoicePay, // added by srikanth
        totalAppPending:totalAppPending,
        app_notApproved:app_notApproved,
        app_pendingAccep:app_pendingAccep,
        app_rejPendClosure:app_rejPendClosure,
	docPendingCount:docPendingCount,         //Added by arun 27-01-2017 16:15
	trvlPendngRowData:trvlPendngRowData,
	trvlPendngCount:trvlPendngCount,
	claimPendngCount:claimPendngCount,
	claimsettleStatusCount:claimsettleStatusCount,
	claimPendngHrCount:claimPendngHrCount,
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
   });
   });
};



module.exports = router;
