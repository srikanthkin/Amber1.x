var express = require('express');
var router = express.Router();
var pdbconnect = require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');
var moment = require('moment');
var fs = require('fs');
router.get('/reimburseApprove', reimburseApprove);
var remb_id = "";

function reimburseApprove(req, res) {

    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;

    if(emp_access=='L3'||emp_access=='L2'||emp_access=='L1')
    {
    
   
    var test = req.body.test;
    var id = req.query.id;
    var duplicate_flag="N";
    var billupld_flg="Y";
    console.log('id', id);
    console.log('reimburseUserDetails func ');
    var urlValue = id.split(":");
    remb_id = urlValue[0].trim();
    lodge_date = urlValue[1].trim();
    //emp_Id=urlValue[2].trim();
    console.log('remb_id', remb_id);
    //console.log('remb_id',remb_id.length);
    console.log('lodge_date', lodge_date);
    //console.log('lodge_date',lodge_date.length);
    //console.log('User emp_Id',emp_Id);
    pdbconnect.query("SELECT remb_id, emp_id, emp_name, hr_id, repmgr_id, project_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date, settlement_amount,settlement_remarks,hr_status FROM reimbursement_master_tbl where remb_id =$1 and lodge_date=$2 and del_flg=$3", [remb_id, lodge_date, 'N'], function(err, empResult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            var rowData = empResult.rows;
            console.log("row", rowData);
            remburse_id = empResult.rows['0'].remb_id;
            empname = empResult.rows['0'].emp_name;
            empid = empResult.rows['0'].emp_id;
            project_id = empResult.rows['0'].project_id;
            hr_id = empResult.rows['0'].hr_id;
            repmgr_id = empResult.rows['0'].repmgr_id;
            amt_payable = empResult.rows['0'].amt_payable;
            advance_amt = empResult.rows['0'].advance_amt
            net_amt_payable = empResult.rows['0'].net_amt_payable;
            user_remarks = empResult.rows['0'].user_remarks;
            manager_remarks = empResult.rows['0'].manager_remarks;
            hr_remarks = empResult.rows['0'].hr_remarks;
            status = empResult.rows['0'].status;
            lodge_date = empResult.rows['0'].lodge_date;
             settlement_amount =empResult.rows['0'].settlement_amount;
             settlement_remarks=empResult.rows['0'].settlement_remarks;
             hr_status=empResult.rows['0'].hr_status;
            console.log("remburse_id", remburse_id);
        }
        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id =$1 and del_flg=$2", [repmgr_id, 'N'], function(err, result2) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                console.log("result", result2);
                reporting_mgr = result2.rows['0'].emp_name;
                console.log("reporting_mgr", reporting_mgr);
            }
            pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id =$1 and del_flg=$2", [hr_id, 'N'], function(err, result2) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    console.log("result", result2);
                    hr_name = result2.rows['0'].emp_name;
                    console.log("hr_name", hr_name);
                }
                pdbconnect.query("SELECT remb_id, bill_date, bill_id, nature_of_expenses,ticket_amt,remarks from reimbursement_details_tbl where remb_id =$1 and del_flg=$2", [remb_id, 'N'], function(err, billData) {
                    if (err) {
                        console.error('Error with table query', err);
                    } else {
                        console.log("billData", billData);
                        var billData = billData.rows;
                        //billDataCount=billData.rowCount;
                        // hr_name=result2.rows['0'].emp_name;
                        console.log("billData.rowCount", billData.rowCount);

                        //console.log("billData.length", billData.length);
                    }

                  var billDocs=[];
                    var billLen=0

             var targetDir = './data/CMS/bills/'+empid+"/";
             var finaltargetDir=targetDir+remburse_id+"/";
            console.log("finaltargetDir",finaltargetDir);
             if (!fs.existsSync(finaltargetDir))
            {
              //req.flash('error',"No records found")
            }
            else
           {
             fs.readdirSync(finaltargetDir).forEach(
             function (name) 
           {
          billDocs[billLen] = name;
          billLen = billLen + 1;
           });
         }
                    

console.log("settlement_amount",settlement_amount);
                    res.render('reimbursementModule/reimburseApprove', {
                        rowData: rowData,
                        billData: billData,
                        emp_id: emp_id,
                        empid: empid,
                        emp_name: emp_name,
                        empname: empname,
                        remburse_id: remburse_id,
                        project_id: project_id,
                        hr_id: hr_id,
                        hr_name: hr_name,
                        reporting_mgr: reporting_mgr,
                        emp_access: emp_access,
                        repmgr_id: repmgr_id,
                        amt_payable: amt_payable,
                        net_amt_payable: net_amt_payable,
                        advance_amt: advance_amt,
                        user_remarks: user_remarks,
                        manager_remarks: manager_remarks,
                        hr_remarks: hr_remarks,
                        status: status,
                        lodge_date: lodge_date,
                        billDocs:billDocs,
                        billLen:billLen,
                        settlement_amount:settlement_amount,
                        settlement_remarks:settlement_remarks,
                        hr_status:hr_status,
                        duplicate_flag:duplicate_flag,
                        billupld_flg:billupld_flg
                    });
                });
            });
        });
    });
}else
   {
    res.redirect('/admin-dashboard/adminDashboard/admindashboard');
   }
}
router.get('/reimburseHrApprove', reimburseHrApprove);
var remb_id = "";

function reimburseHrApprove(req, res) {
    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;

    if(emp_access=='F1'){
    var test = req.body.test;
    var id = req.query.id;
    var duplicate_id="";
    var duplicate_flag="N";
    var billupld_flg="Y";
    console.log('id', id);
    console.log('reimburseUserDetails func ');
    var urlValue = id.split(":");
    remb_id = urlValue[0].trim();
    lodge_date = urlValue[1].trim();
    //status1=urlValue[2].trim();
    console.log('remb_id', remb_id);
    //console.log('remb_id',remb_id.length);
    console.log('lodge_date', lodge_date);
    //console.log('lodge_date',lodge_date.length);
    //console.log('User emp_Id',emp_Id);
    pdbconnect.query("SELECT remb_id, emp_id, emp_name, hr_id, repmgr_id, project_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date,settlement_amount,settlement_paid_flg,settlement_remarks,hr_status FROM reimbursement_master_tbl where remb_id =$1 and lodge_date=$2 and del_flg=$3", [remb_id, lodge_date, 'N'], function(err, empResult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            var rowData = empResult.rows;
            console.log("row", rowData);
            remburse_id = empResult.rows['0'].remb_id;
            empname = empResult.rows['0'].emp_name;
            empid = empResult.rows['0'].emp_id;
            project_id = empResult.rows['0'].project_id;
            hr_id = empResult.rows['0'].hr_id;
            repmgr_id = empResult.rows['0'].repmgr_id;
            amt_payable = empResult.rows['0'].amt_payable;
            advance_amt = empResult.rows['0'].advance_amt
            net_amt_payable = empResult.rows['0'].net_amt_payable;
            user_remarks = empResult.rows['0'].user_remarks;
            manager_remarks = empResult.rows['0'].manager_remarks;
            hr_remarks = empResult.rows['0'].hr_remarks;
            status = empResult.rows['0'].status;
            lodge_date = empResult.rows['0'].lodge_date;
            settlement_amount=empResult.rows['0'].settlement_amount;
            settlement_paid_flg=empResult.rows['0'].settlement_paid_flg;
            settlement_remarks=empResult.rows['0'].settlement_remarks;
            hr_status=empResult.rows['0'].hr_status
            console.log("remburse_id", remburse_id);
        }
        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id =$1 and del_flg=$2", [repmgr_id, 'N'], function(err, result2) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                console.log("result", result2);
                reporting_mgr = result2.rows['0'].emp_name;
                console.log("reporting_mgr", reporting_mgr);
            }
            pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id =$1 and del_flg=$2", [hr_id, 'N'], function(err, result2) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    console.log("result", result2);
                    hr_name = result2.rows['0'].emp_name;
                    console.log("hr_name", hr_name);
                }
                pdbconnect.query("SELECT remb_id, bill_date, bill_id, nature_of_expenses,ticket_amt,remarks from reimbursement_details_tbl where remb_id =$1 and del_flg=$2", [remb_id, 'N'], function(err, billData) {
                    if (err) {
                        console.error('Error with table query', err);
                    } else {
                        console.log("billData", billData);
                        var billData = billData.rows;
                        // billDataCount=billData.rowCount;
                        // hr_name=result2.rows['0'].emp_name;
                        console.log("billData.rowCount", billData.rowCount);
                        console.log("billData.length", billData.length);
                    }

                    var billDocs=[];
                    var billLen=0

             var targetDir = './data/CMS/bills/'+empid+"/";
             var finaltargetDir=targetDir+remburse_id+"/";
            console.log("finaltargetDir",finaltargetDir);
             if (!fs.existsSync(finaltargetDir))
            {
              //req.flash('error',"No records found")
            }
            else
           {
             fs.readdirSync(finaltargetDir).forEach(
             function (name) 
           {
          billDocs[billLen] = name;
          billLen = billLen + 1;
           });

           }

           pdbconnect.query("SELECT * from reimbursement_details_tbl where bill_id in(SELECT bill_id from reimbursement_details_tbl where remb_id =$1 and del_flg=$2)", [remb_id,'N'], function(err,orginalData) {
                    if (err) {
                        console.error('Error with table query', err);
                    } else {
                        duplicate_id=orginalData.rowCount;
                        console.log("::::::duplicate_id::::::",duplicate_id);
                        if(duplicate_id>1)
                        {
                            duplicate_flag="Y";
                        }
                        }
             pdbconnect.query("SELECT count(*) from reimbursement_details_tbl where remb_id =$1 and del_flg=$2 and nature_of_expenses in ($3,$4)", [remb_id, 'N','HOTEL','TRAVEL'], function(err, natureOfExpList) {
                    if (err) {
                        console.error('Error with table query', err);
                    } else {
                        console.log("natureOfExpList", natureOfExpList);
                         billTOupload=natureOfExpList.rows['0'].count;
                         console.log("billTOupload", billTOupload);
                        console.log("natureOfExpList.rowCount", natureOfExpList.rowCount);
                        
                    }  
                    if(billTOupload>0)
                    {
                       if(billLen<1)
                       {
                        billupld_flg="N";
                       } 
                    }
                   
                   console.log("::::::duplicate_flag::::::",duplicate_flag);
                  console.log("billLen",billLen);
                  console.log("emp_access",emp_access)
                    res.render('reimbursementModule/reimburseApprove', {
                        rowData: rowData,
                        billData: billData,
                        billDocs:billDocs,
                        billLen:billLen,
                        emp_id: emp_id,
                        empid: empid,
                        emp_name: emp_name,
                        empname: empname,
                        remburse_id: remburse_id,
                        project_id: project_id,
                        hr_id: hr_id,
                        hr_name: hr_name,
                        reporting_mgr: reporting_mgr,
                        emp_access: emp_access,
                        repmgr_id: repmgr_id,
                        amt_payable: amt_payable,
                        net_amt_payable: net_amt_payable,
                        advance_amt: advance_amt,
                        user_remarks: user_remarks,
                        manager_remarks: manager_remarks,
                        hr_remarks: hr_remarks,
                        status: status,
                        lodge_date: lodge_date,
                        settlement_amount:settlement_amount,
                        settlement_paid_flg:settlement_paid_flg,
                        settlement_remarks:settlement_remarks,
                        hr_status:hr_status,
                        duplicate_flag:duplicate_flag,
                        billupld_flg:billupld_flg,
                    });
                    });
                });
            });
        });
    });
 });
}else
   {
    res.redirect('/admin-dashboard/adminDashboard/admindashboard');
   }
}



router.post('/approve', approve);

function approve(req, res) {
    var test = req.body.test;
    var bills =req.body.bills;
    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;
    var remb_id = "";
    var lodge_date = "";
    var rowDataReject = "";
    var rowDataApprvd = "";
    var rowData = "";
    var employee_email = "";
    var duplicate_flag="N";
    var billupld_flg ="Y";
    if (test == "Approve") {
        var remb_id = req.body.remb_id;
        console.log("Inside approve", remb_id);
        var lodge_date = req.body.lodge_date;
        console.log("Inside approve", lodge_date);
        var manager_remarks = req.body.manremarks;
        console.log("manager_remarks", manager_remarks);
        var date = moment().add(7, 'days')
        var document_date = date.format('YYYY-MM-DD');
        console.log("Inside approve", date);
        //console.log("Inside approve",nowPlusOneDayStr);
        var manager_remarks = req.body.manremarks;
        pdbconnect.query("UPDATE  reimbursement_master_tbl set  status = $1,hr_status=$2,manager_remarks = $3,document_date =$4 where remb_id = $5 and lodge_date = $6", ['approved','pending', manager_remarks, document_date, remb_id, lodge_date], function(err, done) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                req.flash('success', "Request for Remburisement Id:" + remb_id +" "+" has been approved.");
                var success = "Request for Remburisement Id:" + remb_id + " has been approved.";
            }
            
             pdbconnect.query("Insert into reimbursement_master_tbl_hist(select * from reimbursement_master_tbl where remb_id = $1)", [remb_id], function(err, done) {
            if (err) {
                console.error('Error with table query', err);
            } 
            pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function(err, empResult) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    employee_name = empResult.rows['0'].emp_name;
                    employee_email = empResult.rows['0'].emp_email;
                    console.log('employee_name in confirm func', employee_name);
                    console.log('employee_email in confirm func', employee_email);
                }
                var smtpTransport = nodemailer.createTransport('SMTP', {
                    service: 'gmail',
                    auth: {
                        user: 'amber@nurture.co.in',
                        pass: 'nurture@123'
                    }
                });

                        var mailOptions = {
                                                to: employee_email,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Approval Notification for applied reimbursement',
                                                html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLlF0smh8vJWa4VC1QKXvfqwKH69p-wwYGYIKhPHujKQm5o4j-" height="85"><br><br>' +
                                                '<h3>The reimbursement request raised for following details has been approved<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Reimbursement Id</th> ' +
                                                                '<th style="border: 10px solid black;">' + remb_id + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Documents submission Date </td> ' +
                                                                '<th style="border: 10px solid black;">' + document_date + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
						'Kindly submit your documents on or before submission date <br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
                                         };



                smtpTransport.sendMail(mailOptions, function(err) {});
                var claimAppStatus =req.body.claimAppStatus;
    
    if(claimAppStatus == null){
        claimAppStatus= "PEN";
    }
    


    var queryString = "SELECT remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, upper(status) as status , lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3, settlement_amount, settlement_paid_flg, settlement_remarks, upper(hr_status) as hr_status FROM reimbursement_master_tbl where repmgr_id=$1 and del_flg='N'" ;

    if(claimAppStatus=="PEN"){
        queryString = queryString + " and status = 'pending'";
    }
    else if(claimAppStatus=="APP"){
        queryString = queryString + " and status = 'approved'";
    }
    else if(claimAppStatus=="REJ"){
        queryString = queryString + " and status = 'rejected'";
    }
   

    queryString = queryString + " order by remb_id desc";

    console.log("\n\n\n queryString :: " + queryString);

    pdbconnect.query(queryString,[emp_id], function(err, claimsResult) {
        if(err){
            console.error('\n\nError with table query :: \n', err);
        } 
        else{
            var claimsReqList = claimsResult.rows;
            console.log("\n\n claimsReqList :: ",claimsReqList);
        }
        var recordCount="";
        recordCount=claimsResult.rowCount;
        console.log('\n\n\ntemp recordCount ::: ',recordCount);

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'FCS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;
            
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count); 
            res.render('reimbursementModule/viewClaimApprQueue',{
                emp_id:emp_id,
                emp_name:emp_name,
                emp_access:emp_access,

                claimAppStatus:claimAppStatus,
                cocd_appQueueStatus:cocd_appQueueStatus,
                cocd_appQueueStatus_count:cocd_appQueueStatus_count,
                
                claimsReqList:claimsReqList,
                recordCount:recordCount,
                success: success
                
            });
        });
    });
            });
          });
        });
    }
    if(bills == "Upload supporting bills")
    {
        var emp_id = req.user.rows[0].user_id;
        var emp_access = req.user.rows[0].user_type;
        var emp_name = req.user.rows[0].user_name;
        var remb_id = req.body.remb_id;
                
                                console.log("reupload bills for "+remb_id);
                                    res.render('reimbursementModule/rembReqDetails', {
                                        remb_id: remb_id,
                                        emp_id: emp_id,
                                        emp_name: emp_name,
                                        emp_access: emp_access,
                                        
                                });
    }
    if(bills == "Submit")
    {
        var emp_id = req.user.rows[0].user_id;
        var emp_access = req.user.rows[0].user_type;
        var emp_name = req.user.rows[0].user_name;
        var billTOupload="";
                                 var remb_id = req.body.remb_id_hidden;
                                console.log("reupload bills for "+remb_id);
        pdbconnect.query("SELECT remb_id, emp_id, emp_name, hr_id, repmgr_id, project_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date,settlement_amount,settlement_paid_flg,settlement_remarks,hr_status FROM reimbursement_master_tbl where remb_id =$1 and del_flg=$2", [remb_id,'N'], function(err, empResult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            var rowData = empResult.rows;
            console.log("row", rowData);
            remburse_id = empResult.rows['0'].remb_id;
            empname = empResult.rows['0'].emp_name;
            empid = empResult.rows['0'].emp_id;
            project_id = empResult.rows['0'].project_id;
            hr_id = empResult.rows['0'].hr_id;
            repmgr_id = empResult.rows['0'].repmgr_id;
            amt_payable = empResult.rows['0'].amt_payable;
            advance_amt = empResult.rows['0'].advance_amt
            net_amt_payable = empResult.rows['0'].net_amt_payable;
            user_remarks = empResult.rows['0'].user_remarks;
            manager_remarks = empResult.rows['0'].manager_remarks;
            hr_remarks = empResult.rows['0'].hr_remarks;
            status = empResult.rows['0'].status;
            lodge_date = empResult.rows['0'].lodge_date;
            settlement_amount=empResult.rows['0'].settlement_amount;
            settlement_paid_flg=empResult.rows['0'].settlement_paid_flg;
            settlement_remarks=empResult.rows['0'].settlement_remarks;
            hr_status=empResult.rows['0'].hr_status;
            console.log("remburse_id", remburse_id);
        }
        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id =$1 and del_flg=$2", [repmgr_id, 'N'], function(err, result2) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                console.log("result", result2);
                reporting_mgr = result2.rows['0'].emp_name;
                console.log("reporting_mgr", reporting_mgr);
            }
            pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id =$1 and del_flg=$2", [hr_id, 'N'], function(err, result2) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    console.log("result", result2);
                    hr_name = result2.rows['0'].emp_name;
                    console.log("hr_name", hr_name);
                }
                pdbconnect.query("SELECT remb_id, bill_date, bill_id, nature_of_expenses,ticket_amt,remarks from reimbursement_details_tbl where remb_id =$1 and del_flg=$2", [remb_id, 'N'], function(err, billData) {
                    if (err) {
                        console.error('Error with table query', err);
                    } else {
                        console.log("billData", billData);
                        var billData = billData.rows;
                        var billDataRows = billData.rows;
                        console.log("billData.rowCount", billData.rowCount);
                        console.log("billData.length", billData.length);
                    }
                    pdbconnect.query("SELECT count(*) from reimbursement_details_tbl where remb_id =$1 and del_flg=$2 and nature_of_expenses in ($3,$4)", [remb_id, 'N','HOTEL','TRAVEL'], function(err, natureOfExpList) {
                    if (err) {
                        console.error('Error with table query', err);
                    } else {
                        console.log("natureOfExpList", natureOfExpList);
                         billTOupload=natureOfExpList.rows['0'].count;
                         console.log("billTOupload", billTOupload);
                        console.log("natureOfExpList.rowCount", natureOfExpList.rowCount);
                        
                    }

                    var billDocs=[];
                    var billLen=0

             var targetDir = './data/CMS/bills/'+empid+"/";
             var finaltargetDir=targetDir+remburse_id+"/";
            console.log("finaltargetDir",finaltargetDir);
             if (!fs.existsSync(finaltargetDir))
            {
              //req.flash('error',"No records found")
            }
            else
           {
             fs.readdirSync(finaltargetDir).forEach(
             function (name) 
           {
          billDocs[billLen] = name;
          billLen = billLen + 1;
           });

           }
           console.log("billLen",billLen);
           console.log("billTOupload",billTOupload);
           if(billTOupload>0)
                    {
                       if(billLen<1)
                       {
                        billupld_flg="N";
                       } 
                    }
                   
           if(parseInt(billTOupload)>parseInt(billLen)){
                 req.flash('error',"Number of files uploaded is less than the claimed bills");
                 var error="Number of files uploaded is less than the claimed bills";
                
                                console.log("reupload bills for "+remb_id);
                                    res.render('reimbursementModule/rembReqDetails', {
                                        remb_id: remb_id,
                                        emp_id: emp_id,
                                        emp_name: emp_name,
                                        emp_access: emp_access,
                                        error:error
                                        
                                });
                  }else if(parseInt(billTOupload)==0)
                  {
                      res.render('reimbursementModule/reimburseApprove', {
                        rowData: rowData,
                        billData: billData,
                        billDocs:billDocs,
                        billLen:billLen,
                        emp_id: emp_id,
                        empid: empid,
                        emp_name: emp_name,
                        empname: empname,
                        remburse_id: remburse_id,
                        project_id: project_id,
                        hr_id: hr_id,
                        hr_name: hr_name,
                        reporting_mgr: reporting_mgr,
                        emp_access: emp_access,
                        repmgr_id: repmgr_id,
                        amt_payable: amt_payable,
                        net_amt_payable: net_amt_payable,
                        advance_amt: advance_amt,
                        user_remarks: user_remarks,
                        manager_remarks: manager_remarks,
                        hr_remarks: hr_remarks,
                        status: status,
                        lodge_date: lodge_date,
                        settlement_amount:settlement_amount,
                        settlement_paid_flg:settlement_paid_flg,
                        settlement_remarks:settlement_remarks,
                        hr_status:hr_status,
                        duplicate_flag:duplicate_flag,
                        billupld_flg:billupld_flg
                    });   
                  }
                  else{
                  
                  console.log("emp_access",emp_access)
                    res.render('reimbursementModule/reimburseApprove', {
                        rowData: rowData,
                        billData: billData,
                        billDocs:billDocs,
                        billLen:billLen,
                        emp_id: emp_id,
                        empid: empid,
                        emp_name: emp_name,
                        empname: empname,
                        remburse_id: remburse_id,
                        project_id: project_id,
                        hr_id: hr_id,
                        hr_name: hr_name,
                        reporting_mgr: reporting_mgr,
                        emp_access: emp_access,
                        repmgr_id: repmgr_id,
                        amt_payable: amt_payable,
                        net_amt_payable: net_amt_payable,
                        advance_amt: advance_amt,
                        user_remarks: user_remarks,
                        manager_remarks: manager_remarks,
                        hr_remarks: hr_remarks,
                        status: status,
                        lodge_date: lodge_date,
                        settlement_amount:settlement_amount,
                        settlement_paid_flg:settlement_paid_flg,
                        settlement_remarks:settlement_remarks,
                        hr_status:hr_status,
                        duplicate_flag:duplicate_flag,
                        billupld_flg:billupld_flg
                    });
                }
                });
            });
        });
});
    });

    }


    test1=req.body.paid;
    if(test1=="Pay")
    {
 var settlement_amt=req.body.settlement_Amount;
 console.log("settlement_amt",settlement_amt);
 var remb_id=req.body.remb_id;
 console.log("remb_id",remb_id);
 var settlement_remarks = req.body.settlementRemarks;
 console.log("settlement_remarks", settlement_remarks);
 var advAmt=req.body.advAmt;
 console.log("advAmt",advAmt);
 

  
                       
                        pdbconnect.query("UPDATE  reimbursement_master_tbl set  settlement_paid_flg = $1,settlement_amount=$2,settlement_remarks=$3 where remb_id = $4", ['Y',settlement_amt,settlement_remarks,remb_id], function(err, done) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                req.flash('success', 'Claim amount for Remburisement Id:'+' '+ remb_id +' '+'has been settled.');
                var success = 'Claim amount for Remburisement Id:' + remb_id +' '+'has been settled.';
            }
            pdbconnect.query("Insert into reimbursement_master_tbl_hist(select * from reimbursement_master_tbl where remb_id = $1)", [remb_id], function(err, done) {
            if (err) {
                console.error('Error with table query', err);
            } 
             pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function(err, empResult) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    employee_name = empResult.rows['0'].emp_name;
                    employee_email = empResult.rows['0'].emp_email;
                    console.log('employee_name in confirm func', employee_name);
                    console.log('employee_email in confirm func', employee_email);
                }
                pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select repmgr_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
                var smtpTransport = nodemailer.createTransport('SMTP', {
                    service: 'gmail',
                    auth: {
                        user: 'amber@nurture.co.in',
                        pass: 'nurture@123'
                    }
                });

                        var mailOptions = {
                                                to: employee_email,
                    				cc: approver_email,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Reimbursement Settlement Notification',
                                                html:'<h3>The reimbursement request raised for following details has been Settled for Details<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Reimbursement Id</th> ' +
                                                                '<th style="border: 10px solid black;">' + remb_id + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Claim Amount</td> ' +
                                                                '<th style="border: 10px solid black;">' + settlement_amt + '</td> ' +
                                                        '</tr>' +
                                                        
							'<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Document submission date</td> ' +
                                                                '<th style="border: 10px solid black;">' + document_date + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
                                                'Kindly submit your documents on or before submission date to HR<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
                                         };

                smtpTransport.sendMail(mailOptions, function(err) {});

           var claimFinStatus =req.body.claimFinStatus;
    
    if(claimFinStatus == null){
        claimFinStatus= "PEN";
    }
    
    

    var queryString = "SELECT remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, upper(status) as status , lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3, settlement_amount, settlement_paid_flg, settlement_remarks, upper(hr_status) as hr_status FROM reimbursement_master_tbl where hr_id=$1 and status='approved' and del_flg='N'" ;

    if(claimFinStatus=="PEN"){
        queryString = queryString + " and hr_status = 'pending'";
    }
    else if(claimFinStatus=="PPY"){
        queryString = queryString + " and hr_status = 'confirmed' and settlement_paid_flg = ''";
    }
    else if(claimFinStatus=="PAY"){
        queryString = queryString + " and hr_status = 'confirmed' and settlement_paid_flg = ''";
    }
    else if(claimFinStatus=="CAN"){
        queryString = queryString + " and hr_status = 'cancelled'";
    }
   

    queryString = queryString + " order by remb_id desc";

    console.log("\n\n\n queryString :: " + queryString);

    pdbconnect.query(queryString,[emp_id], function(err, claimsResult) {
        if(err){
            console.error('\n\nError with table query :: \n', err);
        } 
        else{
            var claimsReqList = claimsResult.rows;
            console.log("\n\n claimsReqList :: ",claimsReqList);
        }
        var recordCount="";
        recordCount=claimsResult.rowCount;
        console.log('\n\n\ntemp recordCount ::: ',recordCount);

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'FCS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;
       
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count);             
            res.render('reimbursementModule/viewClaimFinQueue',{
                emp_id:emp_id,
                emp_name:emp_name,
                emp_access:emp_access,

                claimFinStatus:claimFinStatus,
                cocd_appQueueStatus:cocd_appQueueStatus,
                cocd_appQueueStatus_count:cocd_appQueueStatus_count,
                
                claimsReqList:claimsReqList,
                recordCount:recordCount,
                success: success,
            });
        });
    });
});
        });
         });

});

                   

  

}

    if (test == "Reject") {
        var remb_id = req.body.remb_id;
        console.log("Inside approve", remb_id);
        var lodge_date = req.body.lodge_date;
        console.log("Inside approve", lodge_date);
        var manager_remarks = req.body.manremarks;
        console.log("manager_remarks", manager_remarks);
        pdbconnect.query("UPDATE  reimbursement_master_tbl set  status = $1,manager_remarks = $2 where  remb_id = $3 and lodge_date = $4", ['rejected', manager_remarks, remb_id, lodge_date], function(err, done) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                req.flash('success', 'Request for Remburisement Id:' + remb_id +' '+' has been rejected.')
                var success = "Request for Remburisement Id:" + remb_id + " has been rejected.";
            }
             pdbconnect.query("Insert into reimbursement_master_tbl_hist(select * from reimbursement_master_tbl where remb_id = $1)", [remb_id], function(err, done) {
            if (err) {
                console.error('Error with table query', err);
            } 
            pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function(err, empResult) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    employee_name = empResult.rows['0'].emp_name;
                    employee_email = empResult.rows['0'].emp_email;
                    console.log('employee_name in confirm func', employee_name);
                    console.log('employee_email in confirm func', employee_email);
                }
                var smtpTransport = nodemailer.createTransport('SMTP', {
                    service: 'gmail',
                    auth: {
                        user: 'amber@nurture.co.in',
                        pass: 'nurture@123'
                    }
                });
		
		var mailOptions = {
					to: employee_email,
					from: 'amber@nurture.co.in',
					subject: 'Reimbursement Request Rejection notification',
                                        html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF3AN6vk9aZnh5KQ_KPzHWYwlVWNNCxzAFK-994yO9WY6UwfiSIA" height="85"><br><br>' +
					'<h3>Reimbursement Request has been rejected by your manager <br><br>' +
					'<table style="border: 10px solid black;"> ' +
						'<tr style="border: 10px solid black;"> ' +
							'<th style="border: 10px solid black;">Reimbursement Id</th> ' +
							'<th style="border: 10px solid black;">' + remb_id + '</th>' +
						'</tr>' +
					'</table> ' +
					'<br><br>' +
					'Kindly get in touch with your Manager.<br><br>'+
					'URL: http://amber.nurture.co.in <br><br><br>' +
					'- Regards,<br><br>Amber</h3>'
			 
  				};

                smtpTransport.sendMail(mailOptions, function(err) {});
                var claimAppStatus =req.body.claimAppStatus;
    
    if(claimAppStatus == null){
        claimAppStatus= "PEN";
    }
    


    var queryString = "SELECT remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, upper(status) as status , lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3, settlement_amount, settlement_paid_flg, settlement_remarks, upper(hr_status) as hr_status FROM reimbursement_master_tbl where repmgr_id=$1 and del_flg='N'" ;

    if(claimAppStatus=="PEN"){
        queryString = queryString + " and status = 'pending'";
    }
    else if(claimAppStatus=="APP"){
        queryString = queryString + " and status = 'approved'";
    }
    else if(claimAppStatus=="REJ"){
        queryString = queryString + " and status = 'rejected'";
    }
   

    queryString = queryString + " order by remb_id desc";

    console.log("\n\n\n queryString :: " + queryString);

    pdbconnect.query(queryString,[emp_id], function(err, claimsResult) {
        if(err){
            console.error('\n\nError with table query :: \n', err);
        } 
        else{
            var claimsReqList = claimsResult.rows;
            console.log("\n\n claimsReqList :: ",claimsReqList);
        }
        var recordCount="";
        recordCount=claimsResult.rowCount;
        console.log('\n\n\ntemp recordCount ::: ',recordCount);

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'FCS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;
            
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count); 
            res.render('reimbursementModule/viewClaimApprQueue',{
                emp_id:emp_id,
                emp_name:emp_name,
                emp_access:emp_access,

                claimAppStatus:claimAppStatus,
                cocd_appQueueStatus:cocd_appQueueStatus,
                cocd_appQueueStatus_count:cocd_appQueueStatus_count,
                
                claimsReqList:claimsReqList,
                recordCount:recordCount,
                success: success
                
            });
        });
    });
            });
           });
        });
    }
    if (test == "Confirm") {
        var remb_id = req.body.remb_id;
        console.log("Inside Confirm", remb_id);
        var lodge_date = req.body.lodge_date;
        console.log("Inside Confirm", lodge_date);
        var hr_remarks = req.body.hrremarks;
        var advance_amt=req.body.advanceAmt;
        // var settlement_remarks = req.body.settlementRemarks;
         console.log("advance_amt", advance_amt);
        pdbconnect.query("UPDATE  reimbursement_master_tbl set  hr_status = $1, hr_remarks =$2,advance_amt=$3 where  remb_id = $4 and lodge_date = $5",['confirmed', hr_remarks,advance_amt,remb_id, lodge_date], function(err, done) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                var success = "Reimbursement request has been confirmed  with Remburisement Id:" + remb_id + ".";
            }
              pdbconnect.query("Insert into reimbursement_master_tbl_hist(select * from reimbursement_master_tbl where remb_id = $1)", [remb_id], function(err, done) {
            if (err) {
                console.error('Error with table query', err);
            } 
            pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from reimbursement_master_tbl where remb_id=$1))", [remb_id], function(err, empResult) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    employee_name = empResult.rows['0'].emp_name;
                    employee_email = empResult.rows['0'].emp_email;
                    console.log('employee_name in confirm func', employee_name);
                    console.log('employee_email in confirm func', employee_email);
                }
                pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select repmgr_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function(err, mailResult) {
                    if (err) {
                        console.error('Error with table query', err);
                    } else {
                        approver_name = mailResult.rows['0'].emp_name;
                        approver_email = mailResult.rows['0'].emp_email;
                        console.log('approver_name in confirm func', approver_name);
                        console.log('approver_email in confirm func', approver_email);
                    }
                    pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id in(select repmgr_id from reimbursement_master_tbl where remb_id=$1))", [remb_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                if(empResult.rowCount!=0)
                                                {
                                                var deliverymgr_name = empResult.rows['0'].emp_name;
                                                var deliverymgr_email = empResult.rows['0'].emp_email;
                                                console.log('deliverymgr_name name ', deliverymgr_name);
                                                console.log('manager id ', deliverymgr_email);
                                            }
                                            }

                    var smtpTransport = nodemailer.createTransport('SMTP', {
                        service: 'gmail',
                        auth: {
                            user: 'amber@nurture.co.in',
                            pass: 'nurture@123'
                        }
                    });

                   var mailOptions = {
                        		to: employee_email,
                        		cc: approver_email,deliverymgr_email,
                                        from: 'amber@nurture.co.in',
                                        subject: 'Reimbursement Request Approval Notification by Finance Manager',
                                        html:'<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZRgKPsbLeLG_m8ZfR9FeMTNmunb3l8IAmsJAiR71QiThN50G4" height="85"><br><br>' +
                                        '<h3>Reimbursement Request has been approved by your Finance manager <br><br>' +
                                        '<table style="border: 10px solid black;"> ' +
                                                '<tr style="border: 10px solid black;"> ' +
                                                        '<th style="border: 10px solid black;">Reimbursement Id</th> ' +
                                                        '<th style="border: 10px solid black;">' + remb_id + '</th>' +
                                                '</tr>' +
                                        '</table> ' +
                                        '<br><br>' +
                                        'URL: http://amber.nurture.co.in <br><br><br>' +
					'- Regards,<br><br>Amber</h3>'

                                };

                    smtpTransport.sendMail(mailOptions, function(err) {});
                    var claimFinStatus =req.body.claimFinStatus;
    
    if(claimFinStatus == null){
        claimFinStatus= "PEN";
    }
    
    

    var queryString = "SELECT remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, upper(status) as status , lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3, settlement_amount, settlement_paid_flg, settlement_remarks, upper(hr_status) as hr_status FROM reimbursement_master_tbl where hr_id=$1 and status='approved' and del_flg='N'" ;

    if(claimFinStatus=="PEN"){
        queryString = queryString + " and hr_status = 'pending'";
    }
    else if(claimFinStatus=="PPY"){
        queryString = queryString + " and hr_status = 'confirmed' and settlement_paid_flg = ''";
    }
    else if(claimFinStatus=="PAY"){
        queryString = queryString + " and hr_status = 'confirmed' and settlement_paid_flg = ''";
    }
    else if(claimFinStatus=="CAN"){
        queryString = queryString + " and hr_status = 'cancelled'";
    }
   

    queryString = queryString + " order by remb_id desc";

    console.log("\n\n\n queryString :: " + queryString);

    pdbconnect.query(queryString,[emp_id], function(err, claimsResult) {
        if(err){
            console.error('\n\nError with table query :: \n', err);
        } 
        else{
            var claimsReqList = claimsResult.rows;
            console.log("\n\n claimsReqList :: ",claimsReqList);
        }
        var recordCount="";
        recordCount=claimsResult.rowCount;
        console.log('\n\n\ntemp recordCount ::: ',recordCount);

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'FCS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;
       
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count);             
            res.render('reimbursementModule/viewClaimFinQueue',{
                emp_id:emp_id,
                emp_name:emp_name,
                emp_access:emp_access,

                claimFinStatus:claimFinStatus,
                cocd_appQueueStatus:cocd_appQueueStatus,
                cocd_appQueueStatus_count:cocd_appQueueStatus_count,
                
                claimsReqList:claimsReqList,
                recordCount:recordCount,
                success: success
            
            });
        });
    });
                });
});
            });
            });
        });
    }
    if (test == "Cancel Request") {
        var remb_id = req.body.remb_id;
        console.log("Inside Cancel", remb_id);
        var lodge_date = req.body.lodge_date;
        console.log("Inside Cancel", lodge_date);
        var hr_remarks = req.body.hrremarks;
        console.log("hr_remarks", hr_remarks);
        pdbconnect.query("UPDATE  reimbursement_master_tbl set  hr_status = $1,hr_remarks=$2 where  remb_id = $3 and lodge_date = $4", ['cancelled', hr_remarks, remb_id, lodge_date], function(err, done) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                //   req.flash('success',"Request for Reimbursement Id:"+ remb_id +" has been cancelled")
                var success = "Request for Reimbursement Id:" + remb_id + " has been cancelled";
            }
              pdbconnect.query("Insert into reimbursement_master_tbl_hist(select * from reimbursement_master_tbl where remb_id = $1)", [remb_id], function(err, done) {
            if (err) {
                console.error('Error with table query', err);
            } 
            console.log("remb_id", remb_id);
            pdbconnect.query("select emp_name,emp_email from emp_master_tbl where emp_id in (select emp_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function(err, empResult) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    console.log("remb_id", remb_id);
                    console.log("empResult.rows", empResult.rows);
                    employee_name = empResult.rows['0'].emp_name;
                    employee_email = empResult.rows['0'].emp_email;
                    console.log('employee_name in confirm func', employee_name);
                    console.log('employee_email in confirm func', employee_email);
                }
                pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select repmgr_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function(err, mailResult) {
                    if (err) {
                        console.error('Error with table query', err);
                    } else {
                        approver_name = mailResult.rows['0'].emp_name;
                        approver_email = mailResult.rows['0'].emp_email;
                        console.log('approver_name in confirm func', approver_name);
                        console.log('approver_email in confirm func', approver_email);
                    }
              pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id in(select repmgr_id from reimbursement_master_tbl where remb_id=$1))", [remb_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                if(empResult.rowCount!=0)
                                                {
                                                var deliverymgr_name = empResult.rows['0'].emp_name;
                                                var deliverymgr_email = empResult.rows['0'].emp_email;
                                                console.log('deliverymgr_name name ', deliverymgr_name);
                                                console.log('manager id ', deliverymgr_email);
                                            }
                                            }       
                    var smtpTransport = nodemailer.createTransport('SMTP', {
                        service: 'gmail',
                        auth: {
                            user: 'amber@nurture.co.in',
                            pass: 'nurture@123'
                        }
                    });

                var mailOptions = {
					to: employee_email,
					cc: approver_email,deliverymgr_email,
                                        from: 'amber@nurture.co.in',
                                        subject: 'Reimbursement Request Rejection notification by Finance manager',
                                        html:'<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF3AN6vk9aZnh5KQ_KPzHWYwlVWNNCxzAFK-994yO9WY6UwfiSIA" height="85"><br><br>' +
                                        '<h3>Reimbursement Request has been rejected by your Finance manager <br><br>' +
                                        '<table style="border: 10px solid black;"> ' +
                                                '<tr style="border: 10px solid black;"> ' +
                                                        '<th style="border: 10px solid black;">Reimbursement Id</th> ' +
                                                        '<th style="border: 10px solid black;">' + remb_id + '</th>' +
                                                '</tr>' +
                                        '</table> ' +
                                        '<br><br>' +
                                        'Kindly get in touch with your Finance Manager.<br><br>'+
                                        'URL: http://amber.nurture.co.in <br><br><br>' +
					'- Regards,<br><br>Amber</h3>'

                                };

                    smtpTransport.sendMail(mailOptions, function(err) {});
                   var claimFinStatus =req.body.claimFinStatus;
    
    if(claimFinStatus == null){
        claimFinStatus= "PEN";
    }
    
    

    var queryString = "SELECT remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, upper(status) as status , lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3, settlement_amount, settlement_paid_flg, settlement_remarks, upper(hr_status) as hr_status FROM reimbursement_master_tbl where hr_id=$1 and status='approved' and del_flg='N'" ;

    if(claimFinStatus=="PEN"){
        queryString = queryString + " and hr_status = 'pending'";
    }
    else if(claimFinStatus=="PPY"){
        queryString = queryString + " and hr_status = 'confirmed' and settlement_paid_flg = ''";
    }
    else if(claimFinStatus=="PAY"){
        queryString = queryString + " and hr_status = 'confirmed' and settlement_paid_flg = ''";
    }
    else if(claimFinStatus=="CAN"){
        queryString = queryString + " and hr_status = 'cancelled'";
    }
   

    queryString = queryString + " order by remb_id desc";

    console.log("\n\n\n queryString :: " + queryString);

    pdbconnect.query(queryString,[emp_id], function(err, claimsResult) {
        if(err){
            console.error('\n\nError with table query :: \n', err);
        } 
        else{
            var claimsReqList = claimsResult.rows;
            console.log("\n\n claimsReqList :: ",claimsReqList);
        }
        var recordCount="";
        recordCount=claimsResult.rowCount;
        console.log('\n\n\ntemp recordCount ::: ',recordCount);

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'FCS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;
       
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count);             
            res.render('reimbursementModule/viewClaimFinQueue',{
                emp_id:emp_id,
                emp_name:emp_name,
                emp_access:emp_access,

                claimFinStatus:claimFinStatus,
                cocd_appQueueStatus:cocd_appQueueStatus,
                cocd_appQueueStatus_count:cocd_appQueueStatus_count,
                
                claimsReqList:claimsReqList,
                recordCount:recordCount,
                success: success
            
            });
        });
    });
                        });
                    });
                });
            });
        });
    }
}
module.exports = router;
