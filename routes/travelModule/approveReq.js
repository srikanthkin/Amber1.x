var express = require('express');
var router = express.Router();
var pdbconnect = require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');
console.log('approve req');
router.get('/approveReq', approveReq);
var req_id = "";

function approveReq(req, res) {
    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;
    var test = req.body.test;
    var id = req.query.id;
    var empid = "";
    console.log('id', id);
    console.log('approveReq func ');
    var urlValue = id.split(":");
    req_id = urlValue[0].trim();
    project_id = urlValue[1].trim();
    console.log('req_id', req_id);
    console.log('req_id', req_id.length);
    console.log('project_id', project_id);
    console.log('req_id', project_id.length);
    var emp_id = req.user.rows[0].user_id;
    var emp_name = req.user.rows[0].user_name;
    var modify_flg="";
	var travel_totalamt_spend="";
	var availableAmount="";
	var travel="";
	var trvlCurr="";
	var rate="";
	var thresholdAmt="";
    console.log('approveReq func::emp_access::',emp_access);
	if(emp_access=='L3'||emp_access=='L2'||emp_access=='L1'){
    pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,free_text_1,free_text_2,free_text_3,budgetovershoot_flg,modify_flg,request_status FROM travel_master_tbl_temp where req_id =$1 and project_id=$2 and del_flg=$3", [req_id, project_id, 'N'], function(err, empResult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            var rowData = empResult.rows;
            console.log("row", rowData);
            if (empResult.rowCount != '0') {
                req_id = empResult.rows['0'].req_id;
                empname = empResult.rows['0'].emp_name;
                empaccess = empResult.rows['0'].emp_access;
                empid = empResult.rows['0'].emp_id;
                project_id = empResult.rows['0'].project_id;
                from_date = empResult.rows['0'].from_date;
                to_date = empResult.rows['0'].to_date;
                from_location = empResult.rows['0'].from_location;
                to_location = empResult.rows['0'].to_location;
                request_status = empResult.rows['0'].request_status;
                approver_id = empResult.rows['0'].approver_id;
                free_text_1 = empResult.rows['0'].free_text_1;
                free_text_3 = empResult.rows['0'].free_text_3;
                free_text_2 = empResult.rows['0'].free_text_2;
                modify_flg = empResult.rows['0'].modify_flg;
                console.log("approver_id", approver_id);
                remarks = empResult.rows['0'].remarks;
            }
        }
        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [empid, project_id], function(err, result2) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                console.log("result", result2);
                var mgrName = result2.rows['0'].emp_name;
                console.log('hii', mgrName);
            }
        pdbconnect.query("SELECT * FROM travel_master_tbl_hist where req_id =$1 and project_id=$2 and emp_id=$3 and request_status in ($4,$5) and del_flg=$6", [req_id, project_id, empid,'MOD','SUB','N'], function(err, modifiedList) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            
            console.log("modifiedList", modifiedListData);
            if (modifiedList.rowCount != '0') {
                var lchg_time=modifiedList.rows['0'].lchg_time;
				console.log("lchg_time", lchg_time);
            }
			var modifiedListData = modifiedList.rows;
        }     
			
			pdbconnect.query("SELECT travelcurr , rate, travel,travel_totalamt_spend from project_master_tbl where project_id =$1 ", [ project_id], function(err, availBal) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                console.log("travel", availBal.rows);
            travel = availBal.rows['0'].travel;
            console.log("availableAmount::", travel);
            trvlCurr = availBal.rows['0'].travelcurr;
            console.log("trvlCurr::", trvlCurr);
            rate = availBal.rows['0'].rate;
            console.log("rate::", rate);
			travel_totalamt_spend = availBal.rows['0'].travel_totalamt_spend;
			if (trvlCurr != 'INR') {
                amt = parseInt(travel) * parseInt(rate);
                console.log("amt::", amt);
				availableAmount=parseInt(amt)- parseInt(travel_totalamt_spend);
				thresholdAmt=parseInt(amt)*0.15;
					console.log("thresholdAmt::in iff::", thresholdAmt);
				
            } else {
                amt = travel;
                console.log("amt::", amt);
				availableAmount=parseInt(amt)- parseInt(travel_totalamt_spend);
				thresholdAmt=parseInt(amt)*0.15;
				console.log("thresholdAmt::in else:::", thresholdAmt);
            }
				
            }
            res.render('travelModule/approveReq', {
                rowData: rowData,
                emp_id: emp_id,
                empid: empid,
                emp_name: emp_name,
                empname: empname,
                mgrName: mgrName,
                req_id: req_id,
                emp_access: emp_access,
                project_id: project_id,
                approver_id: approver_id,
                from_date: from_date,
                to_date: to_date,
                from_location: from_location,
                to_location: to_location,
                request_status: request_status,
                remarks: remarks,
                free_text_1: free_text_1,
                free_text_3: free_text_3,
                free_text_2: free_text_2,
                modify_flg : modify_flg,
				availableAmount:availableAmount,
				thresholdAmt:thresholdAmt,
				modifiedList:modifiedList,
				modifiedListData:modifiedListData
            });
			});
			 });
        });
    });
	}else{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
}
router.post('/checkbudget', checkbudget);
var budgetAmount = "";
var variableAmount = "";
var finalBudgetAmount = "";
var project_id = "";
var cost = "";
var amount_refunded = "";
var modify_flg="";
var prevCost="";
function checkbudget(req, res) {
    project_id = req.body.project_id;
    cost = req.body.cost;
	amount_refunded = req.body.amount_refunded;
    approver_id = req.body.approver_id;
    emp_access = req.body.emp_access;
	req_id = req.body.req_id;
	modify_flg=req.body.modify_flg;
	prevCost=req.body.prevCost;
    
    console.log("cost", cost);
	 console.log("amount_refunded::", amount_refunded);
    console.log("project_id", project_id);
	console.log("prevCost", prevCost);
	console.log("modify_flg:modify_flg", modify_flg);
    console.log("approver_id", approver_id);
    console.log("emp_access", emp_access);
    pdbconnect.query("SELECT travel , travelcurr , rate FROM project_master_tbl where project_id=$1", [project_id], function(err, chkBudgetResult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("travel", chkBudgetResult.rows);
            travel = chkBudgetResult.rows['0'].travel;
            console.log("budgetAmount::", travel);
            trvlCurr = chkBudgetResult.rows['0'].travelcurr;
            console.log("trvlCurr::", trvlCurr);
            rate = chkBudgetResult.rows['0'].rate;
            console.log("rate::", rate);
            if (trvlCurr != 'INR') {
                budgetAmount = parseInt(travel) * parseInt(rate);
                console.log("budgetAmount::", budgetAmount);
            } else {
                budgetAmount = travel;
                console.log("budgetAmount::in else ::", budgetAmount);
            }
        }
        pdbconnect.query("SELECT travel_totalamt_spend FROM project_master_tbl where project_id=$1", [project_id], function(err, projectBudgetResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                rcount = projectBudgetResult.rowCount;
                var travel_totalamt_spend = projectBudgetResult.rows[0].travel_totalamt_spend;
                console.log("travel_totalamt_spend", travel_totalamt_spend);
                console.log("rcount", rcount);
                if (travel_totalamt_spend == 0) {
                    finalBudgetAmount = budgetAmount;
                } else {
                    // for (var i = 0; i < rcount; i++) {
                    //     variableAmount = 0;
                    //     variableAmount = rowData[i].free_text_1;
                    //     if (variableAmount != null) {
                    //         finalBudgetAmount = 0;
                    //         console.log("variableAmount:::::", variableAmount);
                    //         finalBudgetAmount = parseInt(finalBudgetAmount) + parseInt(variableAmount);
                    //     } else {
                    //         variableAmount = 0;
                    //         console.log("variableAmount: inside else::::", variableAmount);
                    //         finalBudgetAmount = parseInt(finalBudgetAmount) + parseInt(variableAmount);
                    //     }
                    //     console.log("variableAmount::::finalBudgetAmount:", finalBudgetAmount);
                    // }
                    // finalBudgetAmount = parseInt(budgetAmount) - parseInt(finalBudgetAmount);
                    // console.log("budgetAmount:::::", budgetAmount);
                    // console.log("finalBudgetAmount:::::", finalBudgetAmount);
					
					
			 // if(modify_flg == 'Y'&&prevCost!=''){ 
                     // if(modify_flg=='Y'&&prevCost!=null){ 
					  // console.log("inside iffff::iffffinalBudgetAmount");
					 // finalBudgetAmount=parseInt(budgetAmount)-parseInt(travel_totalamt_spend)+parseInt(amount_refunded);
					 // }
			 // }
				// else{
					 console.log("inside else::elsefinalBudgetAmount");
					finalBudgetAmount=parseInt(budgetAmount)-parseInt(travel_totalamt_spend);
				//}
                          
               }       
              
				 
				 
            res.json({
                key: finalBudgetAmount
            });
			
			
            }
			
        });
    });

};




router.get('/reqAprvd', reqAprvd);
var req_id = "";

function reqAprvd(req, res) {
    var test = req.body.test;
    var id = req.query.id;
    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;
    console.log('reqAprvd::emp_access::', emp_access);
	if(emp_access=='F1'){
    console.log('approveReq func ');
    var urlValue = id.split(":");
    var approver_remarks = "";
    req_id = urlValue[0].trim();
    project_id = urlValue[1].trim();
    console.log('req_id', req_id);
    console.log('req_id', req_id.length);
    console.log('project_id', project_id);
    console.log('req_id', project_id.length);
    var emp_id = req.user.rows[0].user_id;
     var modify_flg="";
	 var pnr_number="";
	 var ticket_number="";
	 var availableAmount="";
	 var thresholdAmt="";
    console.log('approveReq func');
    pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,free_text_1,free_text_2,free_text_3,budgetovershoot_flg,approver_remarks,modify_flg,request_status,pnr_number,ticket_number FROM travel_master_tbl where req_id =$1 and project_id=$2 and del_flg=$3", [req_id, project_id, 'N'], function(err, empResult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            var rowData = empResult.rows;
            console.log("row", rowData);
            if (empResult.rowCount != '0') {
                var req_id = empResult.rows['0'].req_id;
                console.log("req_id", req_id);
                var empaccess=empResult.rows['0'].emp_access,
                empname = empResult.rows['0'].emp_name;
                console.log("empname", empname);
                empid = empResult.rows['0'].emp_id;
                console.log("empid", empid);
                project_id = empResult.rows['0'].project_id;
                console.log("project_id", project_id);
                from_date = empResult.rows['0'].from_date;
                to_date = empResult.rows['0'].to_date;
                from_location = empResult.rows['0'].from_location;
                to_location = empResult.rows['0'].to_location;
                request_status = empResult.rows['0'].request_status;
                approver_id = empResult.rows['0'].approver_id;
                free_text_1 = empResult.rows['0'].free_text_1;
                free_text_3 = empResult.rows['0'].free_text_3;
                free_text_2 = empResult.rows['0'].free_text_2;
                console.log("approver_id", approver_id);
                remarks = empResult.rows['0'].remarks;
                approver_remarks = empResult.rows['0'].approver_remarks;
                modify_flg = empResult.rows['0'].modify_flg;
                console.log("modify_flg:::", modify_flg);
                console.log("approver_remarks:::", approver_remarks);
				 pnr_number = empResult.rows['0'].pnr_number;
                ticket_number = empResult.rows['0'].ticket_number;
            }
        }
        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [empid, project_id], function(err, result2) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                console.log("result", result2);
                if(result2.rowCount!=0)
                {
                var mgrName = result2.rows['0'].emp_name;
                console.log('hii', mgrName);
            }
            }
		 pdbconnect.query("SELECT * FROM travel_master_tbl_hist where req_id =$1 and project_id=$2 and emp_id=$3 and request_status in ($4,$5) and del_flg=$6 order by lchg_time desc", [req_id, project_id, empid,'MOD','SUB','N'], function(err, modifiedList) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            
            console.log("modifiedList", modifiedListData);
            if (modifiedList.rowCount != '0') {
                var lchg_time=modifiedList.rows['0'].lchg_time;
				console.log("lchg_time", lchg_time);
            }
			var modifiedListData = modifiedList.rows;
        }     	
            //  if(to_date.length!='0')  
            // {  
            // to_date=to_date.toDateString();
            //  }  
            res.render('travelModule/approveReq', {
                rowData: rowData,
                emp_id: emp_id,
                empid: empid,
                emp_name: emp_name,
                empname: empname,
                mgrName: mgrName,
                req_id: req_id,
                emp_access: emp_access,
                project_id: project_id,
                empaccess:empaccess,
                approver_id: approver_id,
                from_date: from_date,
                to_date: to_date,
                from_location: from_location,
                to_location: to_location,
                request_status: request_status,
                remarks: remarks,
                free_text_1: free_text_1,
                free_text_3: free_text_3,
                free_text_2: free_text_2,
                approver_remarks: approver_remarks,
                modify_flg : modify_flg,
				availableAmount:availableAmount,
				thresholdAmt:thresholdAmt,
				modifiedListData:modifiedListData,
				modifiedList:modifiedList,
				pnr_number:pnr_number,
				ticket_number:ticket_number
			});
            });
        });
    })
	}else{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
}
router.get('/reqConfirm', reqConfirm);
var req_id = "";

function reqConfirm(req, res) {
    var test = req.body.test;
    var id = req.query.id;
    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;
    var modify_flg="";
    console.log('id', id);
    console.log('approveReq func ');
    var urlValue = id.split(":");
    var available_budget = "";
    req_id = urlValue[0].trim();
    project_id = urlValue[1].trim();
    console.log('req_id', req_id);
    console.log('req_id', req_id.length);
    console.log('project_id', project_id);
    console.log('req_id', project_id.length);
    var emp_id = req.user.rows[0].user_id;
    console.log('emp_access func::emp_access::',emp_access);
	if(emp_access == 'L1'||emp_access == 'L2'){
    pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status,free_text_1,free_text_2,free_text_3,budgetovershoot_flg,approver_remarks,available_budget,modify_flg FROM travel_master_tbl where req_id =$1 and project_id=$2 and del_flg=$3", [req_id, project_id, 'N'], function(err, empResult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            var rowData = empResult.rows;
            console.log("row", rowData);
            if (empResult.rowCount != '0') {
                var req_id = empResult.rows['0'].req_id;
                console.log("req_id", req_id);
                empname = empResult.rows['0'].emp_name;
                console.log("empname", empname);
                empid = empResult.rows['0'].emp_id;
                console.log("empid", empid);
                project_id = empResult.rows['0'].project_id;
                console.log("project_id", project_id);
                from_date = empResult.rows['0'].from_date;
                to_date = empResult.rows['0'].to_date;
                from_location = empResult.rows['0'].from_location;
                to_location = empResult.rows['0'].to_location;
                request_status = empResult.rows['0'].request_status;
                approver_id = empResult.rows['0'].approver_id;
                free_text_1 = empResult.rows['0'].free_text_1;
                console.log("free_text_1::::inreconfim", free_text_1);
                free_text_3 = empResult.rows['0'].free_text_3;
                free_text_2 = empResult.rows['0'].free_text_2;
                console.log("approver_id", approver_id);
                remarks = empResult.rows['0'].remarks;
                approver_remarks = empResult.rows['0'].approver_remarks;
                available_budget = empResult.rows['0'].available_budget;
                modify_flg = empResult.rows['0'].modify_flg;
                console.log("available_budget", available_budget);
            }
        }
        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [empid, project_id], function(err, result2) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                console.log("result", result2);
                var mgrName = result2.rows['0'].emp_name;
                console.log('hii', mgrName);
            }
            //  if(to_date.length!='0')  
            // {  
            // to_date=to_date.toDateString();
            //  }  
            res.render('travelModule/reqConfirm', {
                rowData: rowData,
                emp_id: emp_id,
                empid: empid,
                emp_name: emp_name,
                empname: empname,
                mgrName: mgrName,
                req_id: req_id,
                emp_access: emp_access,
                project_id: project_id,
                approver_id: approver_id,
                from_date: from_date,
                to_date: to_date,
                from_location: from_location,
                to_location: to_location,
                request_status: request_status,
                remarks: remarks,
                free_text_1: free_text_1,
                free_text_3: free_text_3,
                free_text_2: free_text_2,
                approver_remarks: approver_remarks,
                available_budget: available_budget,
                 modify_flg :modify_flg,
            });
        });
    });
	}else{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
}
router.get('/appRejectedReq', appRejectedReq);
var req_id = "";

function appRejectedReq(req, res) {
    var test = req.body.test;
    var id = req.query.id;
    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;
    console.log('id', id);
    console.log('approveReq func ');
    var urlValue = id.split(":");
    req_id = urlValue[0].trim();
    project_id = urlValue[1].trim();
    console.log('req_id', req_id);
    console.log('req_id', req_id.length);
    console.log('project_id', project_id);
    console.log('req_id', project_id.length);
    var emp_id = req.user.rows[0].user_id;
    var deliveryMgr_id = "";
    var delvrymgr_remarks = "";
    var reqStatus = "";
	var available_bal="";
    console.log('appRejectedReq emp_access::',emp_access);
	if(emp_access == 'L1'||emp_access == 'L2'){
    pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,budgetovershoot_flg, deliveryMgr_id,delvrymgr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2 and del_flg=$3", [req_id, project_id, 'N'], function(err, empResult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            var rowData = empResult.rows;
            console.log("row", rowData);
            if (empResult.rowCount != '0') {
                var req_id = empResult.rows['0'].req_id;
                console.log("req_id", req_id);
                empname = empResult.rows['0'].emp_name;
                console.log("empname", empname);
                empid = empResult.rows['0'].emp_id;
                console.log("empid", empid);
                project_id = empResult.rows['0'].project_id;
                console.log("project_id", project_id);
                from_date = empResult.rows['0'].from_date;
                to_date = empResult.rows['0'].to_date;
                from_location = empResult.rows['0'].from_location;
                to_location = empResult.rows['0'].to_location;
                request_status = empResult.rows['0'].request_status;
                approver_id = empResult.rows['0'].approver_id;
                free_text_1 = empResult.rows['0'].free_text_1;
                free_text_3 = empResult.rows['0'].free_text_3;
                free_text_2 = empResult.rows['0'].free_text_2;
                console.log("approver_id", approver_id);
                remarks = empResult.rows['0'].remarks;
                deliveryMgr_id = empResult.rows['0'].deliveryMgr_id;
                console.log("deliveryMgr_id", deliveryMgr_id);
                budgetovershoot_flg = empResult.rows['0'].budgetovershoot_flg;
                console.log("budgetovershoot_flg", budgetovershoot_flg);
                delvrymgr_remarks = empResult.rows['0'].delvrymgr_remarks;
                console.log("delvrymgr_remarks", delvrymgr_remarks);
                if (budgetovershoot_flg == 'A') {
                    reqStatus = "APPROVED";
                }
                if (budgetovershoot_flg == 'D') {
                    reqStatus = "REJECTED";
                }
                console.log("reqStatus::::", reqStatus);
            }
        }
        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [empid, project_id], function(err, result2) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                console.log("result", result2);
                var mgrName = result2.rows['0'].emp_name;
                console.log('hii', mgrName);
            }
			
            res.render('travelModule/appRejectedReq', {
                rowData: rowData,
                emp_id: emp_id,
                empid: empid,
                emp_name: emp_name,
                empname: empname,
                mgrName: mgrName,
                req_id: req_id,
                emp_access: emp_access,
                project_id: project_id,
                approver_id: approver_id,
                from_date: from_date,
                to_date: to_date,
                from_location: from_location,
                to_location: to_location,
                request_status: request_status,
                remarks: remarks,
                free_text_1: free_text_1,
                free_text_3: free_text_3,
                free_text_2: free_text_2,
                delvrymgr_remarks: delvrymgr_remarks,
                budgetovershoot_flg: budgetovershoot_flg,
                deliveryMgr_id: deliveryMgr_id,
                reqStatus: reqStatus
            });
			
        });
    });
	}else{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
}
router.post('/approve', approve);

function approve(req, res) {
    var test = req.body.test;
	var approve = req.body.approve;
	var testApp = req.body.testApp;
	var test22 = req.body.test22;
	var test11 = req.body.test11;
	var test21=  req.body.test21;
	var refundAmt=  req.body.refundAmt;
    var success = "";
    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;
    var from_date = "";
    var to_date = "";
    var rowDataReject = "";
    var rowDataApprvd = "";
    var rowData = "";
    var mgrName = "";
    if (testApp == "Approve") {
        console.log('inside if ');
        var now = new Date();
        var rcre_user_id = emp_id;
        var rcre_time = now;
        var lchg_user_id = emp_id;
        var lchg_time = now;
        var req_id = req.body.req_id;
        console.log('req_id ', req_id);
        var empid = req.body.empid;
        console.log('emp_id', emp_id);
        var empname = req.body.empname;
        var empaccess = "";
        var project_id = req.body.project_id;
        from_date = req.body.from_date;
        console.log('from_date', from_date);
        to_date = req.body.to_date;
        console.log('to_date', to_date);
        var from_location = req.body.from_location;
        var to_location = req.body.to_location;
        var remarks = req.body.remarks;
        var mgrName = req.body.approver_id;
        var request_status = "";
        var del_flg = "N";
        var confirm_flg = "N";
        var reject_flg = "N";
        var approver_remarks = req.body.app_remarks;
        console.log("app_remarks:::", approver_remarks);
        var prevCost = req.body.prevCost;
        console.log("prevCost:::", prevCost);
        var free_text_1 = req.body.free_text_1;
        var free_text_2 = req.body.free_text_2;
        var free_text_3 = req.body.free_text_3;
        var budgetovershoot_flg = "N";
        var modify_flg=""; 
			var deliverymgr_email="";	
var mgr_id="";		
          pdbconnect.query("SELECT emp_id from emp_master_tbl where emp_name =$1", [mgrName], function(err, result2) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                console.log("result", result2);
                var approver_id = result2.rows['0'].emp_id;
                console.log('hii', approver_id);
            }
            //   if(to_date.length!='0')  
            //    {  
            // to_date=to_date;
            //  }  
            pdbconnect.query("select emp_name , emp_id from emp_master_tbl where emp_id in(select emp_reporting_mgr from project_alloc_tbl where  emp_id in (select approver_id from travel_master_tbl_temp where req_id=$1))", [req_id], function(err, empResult) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
					if(empResult.rowCount != 0){
                    deliveryMgr_name = empResult.rows['0'].emp_name;
                    deliveryMgr_id = empResult.rows['0'].emp_id;
                    console.log('deliveryMgr_name in confirm func', deliveryMgr_name);
                    console.log('deliveryMgr_id in confirm func', deliveryMgr_id);
				}
                }
                pdbconnect.query("select modify_flg from travel_master_tbl_temp where req_id=$1",[req_id], function(err, modifyflg) {
                	if(modifyflg.rows['0'].modify_flg=='Y')
                	{
                        modify_flg='Y'
                	}
                	else
                	{
                		modify_flg='N'
                	}
					pdbconnect.query("select emp_access ,approver_id from travel_master_tbl_temp where req_id=$1",[req_id], function(err, accessRes) {
						 if (err) {
                    console.error('Error with table query', err);
                } else {
					 empaccess = accessRes.rows['0'].emp_access;
					  console.log('empaccess', empaccess);
					   mgr_id = accessRes.rows['0'].approver_id;
					  console.log('mgr_id', mgr_id);
				}
                pdbconnect.query("INSERT INTO travel_master_tbl(req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,request_status,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,free_text_2,free_text_3,budgetovershoot_flg,deliveryMgr_id,approver_remarks,modify_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)", [req_id, empid, empname, empaccess, project_id, from_date, to_date, from_location, to_location, remarks, mgr_id, del_flg,'APM',rcre_user_id, rcre_time, lchg_user_id, lchg_time, prevCost, free_text_2, free_text_3, budgetovershoot_flg, deliveryMgr_id, approver_remarks,modify_flg], function(err, done) {
                    if (err) throw err;
                   pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)", [req_id], function(err, done) {
                        if (err) throw err;
						  success = "Request has been approved sucessfully for Request Id:" + req_id + ".";
                       req.flash('success',"Request has been approved sucessfully for Request Id:" + req_id + ".");
                        //res.render('/travelModule/travelDetail/travelDetail');
                        pdbconnect.query("DELETE FROM travel_master_tbl_temp WHERE req_id=$1", [req_id], function(err, re) {
                            console.log("record deleted in temp table");
                           
                            console.log("sUCCES INSIDE APP FUNC", success);
                            console.log("success", success);
                            var emp_id = req.user.rows[0].user_id;
                            var emp_name = req.user.rows[0].user_name;
                            var emp_access = req.user.rows[0].user_type;
                            console.log("emp_id ", emp_id);
                            console.log("emp_name ", emp_name);
                            console.log("emp_access ", emp_access);
                            
												
												
												pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        } else {
                                            employee_name = empResult.rows['0'].emp_name;
                                            employee_email = empResult.rows['0'].emp_email;
                                            console.log('employee name ', employee_name);
                                            console.log('employee id ', employee_email);
                                        }
                                        pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
											
											pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select deliverymgr_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
												if(empResult.rowCount != 0){
                                                deliverymgr_name = empResult.rows['0'].emp_name;
                                                deliverymgr_email = empResult.rows['0'].emp_email;
                                                console.log('deliverymgr_name name ', deliverymgr_name);
                                                console.log('manager id ', deliverymgr_email);
												}else{
												deliverymgr_email='';	
												}
											}
											pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1",['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                financemgr_name = empResult.rows['0'].emp_name;
                                                financemgr_email = empResult.rows['0'].emp_email;
                                                console.log('financemgr_name  ', financemgr_name);
                                                console.log('financemgr_email ', financemgr_email);
                                            }
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
                                            var mailOptions = {
                                                to: financemgr_email,
                                                cc: employee_email,deliverymgr_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been approved for' + project_id + ' to travel from  ' + from_location + '  to ' + to_location + ' on ' + from_date + ' for employee ' + empname + '(' + empid + ').\n' + 'Kindly proceed further.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
												
								var travelAppStatus =req.body.travelAppStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var queryStringDM = "";
    var paramString = "";
    var paramStringMain = "";
    var paramStringDM = "";
    
   
    if(travelAppStatus == null){
        travelAppStatus= "PEN";
    }

    
   
    

    if(travelAppStatus == "PEN" || travelAppStatus == "ALL"){
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2,$3) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramString = [emp_id,'SUB','MOD'];
    }
    else {
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramString = [emp_id,''];
    }
    


    if(travelAppStatus == "PEN"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,''];
    }
    else if(travelAppStatus == "APP"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,'APM'];
    }
    else if(travelAppStatus == "REJ"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,'RJM'];
    }
    else{
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2,$3) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,'RJM','APM'];
    }
    
    
    if(travelAppStatus == "PEN"){
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'P'];
    }
    else if(travelAppStatus == "APP"){
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'A'];
    }
    else if(travelAppStatus == "REJ"){
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'D'];
    }
    else{
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2,$3,$4) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'P','A','D'];
    }

    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('\n\nError with table query :: \n', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("\n\n\ntravelReqList :: ",travelReqList);
        }
        var recordCountTemp="";
        recordCountTemp=trvReqTempResult.rowCount;
        

        pdbconnect.query(queryStringMain,paramStringMain, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('\n\n\nError with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("\n\n\ntravelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    

        
            pdbconnect.query(queryStringDM,paramStringDM, function(err, trvReqDMResult) {
                
                        if(err){
                            console.error('\n\n\nError with table query', err);
                        } 
                        else{
                            var travelReqDMList = trvReqDMResult.rows;
                            console.log("\n\n\travelReqDMList :: ",travelReqDMList);
                        }
                        var recordCountDM="";
                        recordCountDM=trvReqDMResult.rowCount;
                        

        var totalRecordCount= recordCountMain+recordCountTemp+recordCountDM;

        console.log("\n\n\n recordCountMain :: ",recordCountMain);
        console.log(" recordCountTemp :: ",recordCountTemp);
        console.log(" recordCountDM :: ",recordCountDM);
        console.log(" totalRecordCount :: ",totalRecordCount);

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'AQS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;

            
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count);  
        res.render('travelModule/viewTravelApprQueue',{
            
            emp_id:emp_id,
            emp_name:emp_name,
            emp_access:emp_access,

            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,
            travelReqDMList:travelReqDMList,
            
            cocd_appQueueStatus:cocd_appQueueStatus,
            cocd_appQueueStatus_count:cocd_appQueueStatus_count,
            
            travelAppStatus:travelAppStatus,

            recordCountTemp:recordCountTemp,
            recordCountMain:recordCountMain,
            recordCountDM:recordCountDM,
            totalRecordCount:totalRecordCount,
			success:success
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
    }if (approve == "Approve") {
        console.log('inside if ');
        var now = new Date();
        var rcre_user_id = emp_id;
		  console.log('emp_id', emp_id);
        var rcre_time = now;
        var lchg_user_id = emp_id;
        var lchg_time = now;
        var req_id = req.body.req_id;
        console.log('req_id ', req_id);
        var empid = req.body.empid;
        console.log('empid', empid);
        var empname = req.body.empname;
		  console.log('empname', empname);
        var empaccess = "";
		 
        var project_id = req.body.project_id;
        from_date = req.body.from_date;
        console.log('from_date', from_date);
        to_date = req.body.to_date;
        console.log('to_date', to_date);
        var from_location = req.body.from_location;
        var to_location = req.body.to_location;
        var remarks = req.body.remarks;
        var mgrName = req.body.approver_id;
		console.log('mgrName::mgrName::', mgrName);
        var request_status = "";
        var del_flg = "N";
        var confirm_flg = "N";
        var reject_flg = "N";
        var approver_remarks = req.body.app_remarks;
        console.log("app_remarks:::", approver_remarks);
        var prevCost = req.body.prevCost;
        console.log("prevCost:::", prevCost);
        var free_text_1 = req.body.free_text_1;
        var free_text_2 = req.body.free_text_2;
        var free_text_3 = req.body.free_text_3;
        var budgetovershoot_flg = "N";
        var modify_flg="";  
var deliverymgr_email="";		
var mgr_id="";		
          pdbconnect.query("SELECT emp_id from emp_master_tbl where emp_name =$1", [mgrName], function(err, result2) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                console.log("result", result2);
				if(result2.rowCount != 0){
                var approver_id = result2.rows['0'].emp_id;
                console.log('hii', approver_id);
				}
            }
            //   if(to_date.length!='0')  
            //    {  
            // to_date=to_date;
            //  }  
            pdbconnect.query("select emp_name , emp_id from emp_master_tbl where emp_id in(select emp_reporting_mgr from project_alloc_tbl where  emp_id in (select approver_id from travel_master_tbl_temp where req_id=$1))", [req_id], function(err, empResult) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
					if(empResult.rowCount != 0){
                    deliveryMgr_name = empResult.rows['0'].emp_name;
                    deliveryMgr_id = empResult.rows['0'].emp_id;
                    console.log('deliveryMgr_name in confirm func', deliveryMgr_name);
                    console.log('deliveryMgr_id in confirm func', deliveryMgr_id);
				}
                }
                pdbconnect.query("select modify_flg from travel_master_tbl_temp where req_id=$1",[req_id], function(err, modifyflg) {
                	if(modifyflg.rows['0'].modify_flg=='Y')
                	{
                        modify_flg='Y'
                	}
                	else
                	{
                		modify_flg='N'
                	}
					  console.log('modify_flg', modify_flg);
					    pdbconnect.query("select emp_access,approver_id from travel_master_tbl_temp where req_id=$1",[req_id], function(err, accessRes) {
						 if (err) {
                    console.error('Error with table query', err);
                } else {
					 empaccess = accessRes.rows['0'].emp_access;
					  console.log('empaccess', empaccess);
					  mgr_id = accessRes.rows['0'].approver_id;
					  console.log('mgr_id', mgr_id);
				}
					 
                pdbconnect.query("INSERT INTO travel_master_tbl(req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,request_status,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,free_text_2,free_text_3,budgetovershoot_flg,deliveryMgr_id,approver_remarks,modify_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)", [req_id, empid, empname, empaccess, project_id, from_date, to_date, from_location, to_location, remarks, mgr_id, del_flg,'APM',rcre_user_id, rcre_time, lchg_user_id, lchg_time, prevCost, free_text_2, free_text_3, budgetovershoot_flg, deliveryMgr_id, approver_remarks,modify_flg], function(err, done) {
                    if (err) throw err;
                   pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)", [req_id], function(err, done) {
                        if (err) throw err;
						  success = "Request has been approved sucessfully for Request Id:" + req_id + ".";
                        req.flash('success',"Request has been approved sucessfully for Request Id:" + req_id + ".");
                        //res.render('/travelModule/travelDetail/travelDetail');
                        pdbconnect.query("DELETE FROM travel_master_tbl_temp WHERE req_id=$1", [req_id], function(err, re) {
                            console.log("record deleted in temp table");
                          
                            console.log("sUCCES INSIDE APP FUNC", success);
                            console.log("success", success);
                            var emp_id = req.user.rows[0].user_id;
                            var emp_name = req.user.rows[0].user_name;
                            var emp_access = req.user.rows[0].user_type;
                            console.log("emp_id ", emp_id);
                            console.log("emp_name ", emp_name);
                            console.log("emp_access ", emp_access);
                            
												
												
												pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        } else {
                                            employee_name = empResult.rows['0'].emp_name;
                                            employee_email = empResult.rows['0'].emp_email;
                                            console.log('employee name ', employee_name);
                                            console.log('employee id ', employee_email);
                                        }
                                        pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
												
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
											
											pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select deliverymgr_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
												if(empResult.rowCount != 0){
                                                deliverymgr_name = empResult.rows['0'].emp_name;
                                                deliverymgr_email = empResult.rows['0'].emp_email;
                                                console.log('deliverymgr_name name ', deliverymgr_name);
                                                console.log('manager id ', deliverymgr_email);
												}else{
												deliverymgr_email='';	
												}
                                            }
											pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1",['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                financemgr_name = empResult.rows['0'].emp_name;
                                                financemgr_email = empResult.rows['0'].emp_email;
                                                console.log('financemgr_name  ', financemgr_name);
                                                console.log('financemgr_email ', financemgr_email);
                                            }
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
                                            var mailOptions = {
                                                to: financemgr_email,
                                                cc: employee_email,deliverymgr_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been approved for' + project_id + ' to travel from  ' + from_location + '  to ' + to_location + ' on ' + from_date + ' for employee ' + empname + '(' + empid + ').\n' + 'Kindly proceed further.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
												
								var travelAppStatus =req.body.travelAppStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var queryStringDM = "";
    var paramString = "";
    var paramStringMain = "";
    var paramStringDM = "";
    
   
    if(travelAppStatus == null){
        travelAppStatus= "PEN";
    }

    
   
    

    if(travelAppStatus == "PEN" || travelAppStatus == "ALL"){
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2,$3) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramString = [emp_id,'SUB','MOD'];
    }
    else {
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramString = [emp_id,''];
    }
    


    if(travelAppStatus == "PEN"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,''];
    }
    else if(travelAppStatus == "APP"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,'APM'];
    }
    else if(travelAppStatus == "REJ"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,'RJM'];
    }
    else{
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2,$3) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,'RJM','APM'];
    }
    
    
    if(travelAppStatus == "PEN"){
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'P'];
    }
    else if(travelAppStatus == "APP"){
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'A'];
    }
    else if(travelAppStatus == "REJ"){
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'D'];
    }
    else{
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2,$3,$4) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'P','A','D'];
    }

    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('\n\nError with table query :: \n', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("\n\n\ntravelReqList :: ",travelReqList);
        }
        var recordCountTemp="";
        recordCountTemp=trvReqTempResult.rowCount;
        

        pdbconnect.query(queryStringMain,paramStringMain, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('\n\n\nError with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("\n\n\ntravelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    

        
            pdbconnect.query(queryStringDM,paramStringDM, function(err, trvReqDMResult) {
                
                        if(err){
                            console.error('\n\n\nError with table query', err);
                        } 
                        else{
                            var travelReqDMList = trvReqDMResult.rows;
                            console.log("\n\n\travelReqDMList :: ",travelReqDMList);
                        }
                        var recordCountDM="";
                        recordCountDM=trvReqDMResult.rowCount;
                        

        var totalRecordCount= recordCountMain+recordCountTemp+recordCountDM;

        console.log("\n\n\n recordCountMain :: ",recordCountMain);
        console.log(" recordCountTemp :: ",recordCountTemp);
        console.log(" recordCountDM :: ",recordCountDM);
        console.log(" totalRecordCount :: ",totalRecordCount);

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'AQS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;

            
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count);  
        res.render('travelModule/viewTravelApprQueue',{
            
            emp_id:emp_id,
            emp_name:emp_name,
            emp_access:emp_access,

            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,
            travelReqDMList:travelReqDMList,
            
            cocd_appQueueStatus:cocd_appQueueStatus,
            cocd_appQueueStatus_count:cocd_appQueueStatus_count,
            
            travelAppStatus:travelAppStatus,

            recordCountTemp:recordCountTemp,
            recordCountMain:recordCountMain,
            recordCountDM:recordCountDM,
            totalRecordCount:totalRecordCount,
			success:success
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
    } 
	else if (test == "Reject") {
        console.log('inside if ');
        var now = new Date();
        var rcre_user_id = emp_id;
        var rcre_time = now;
        var lchg_user_id = emp_id;
        var lchg_time = now;
        var req_id = req.body.req_id;
        var empid = req.body.empid;
        var empname = req.body.empname;
        var empaccess = "";
		var mgr_id="";
        var project_id = req.body.project_id;
        var from_date = req.body.from_date;
        var to_date = req.body.to_date;
        var from_location = req.body.from_location;
        var to_location = req.body.to_location;
        var remarks = req.body.remarks;
        var mgrName = req.body.approver_id;
        var request_status = "";
        var approver_remarks = req.body.app_remarks;
        console.log("app_remarks:::", approver_remarks);
        var del_flg = "N";
        var confirm_flg = "N";
        var reject_flg = "Y";
        var free_text_1 = req.body.free_text_1;
        var free_text_2 = req.body.free_text_2;
        var free_text_3 = req.body.free_text_3;
        var budgetovershoot_flg = "N";
        var deliveryMgr_id = "";
        var modify_flg=""; 
        pdbconnect.query("SELECT emp_id from emp_master_tbl where emp_name =$1", [mgrName], function(err, result2) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				if(result2.rowCount != 0){
                console.log("result", result2);
                var approver_id = result2.rows['0'].emp_id;
                console.log('hii', approver_id);
				}
            }
            pdbconnect.query("select emp_name , emp_id from emp_master_tbl where emp_id in(select reporting_mgr from emp_master_tbl where  emp_id in (select approver_id from travel_master_tbl_temp where req_id=$1))", [req_id], function(err, empResult) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
					if(empResult.rowCount != 0){
                    deliveryMgr_name = empResult.rows['0'].emp_name;
                    deliveryMgr_id = empResult.rows['0'].emp_id;
                    console.log('deliveryMgr_name in confirm func', deliveryMgr_name);
                    console.log('deliveryMgr_id in confirm func', deliveryMgr_id);
					}
                }
				 pdbconnect.query("select emp_access,approver_id ,modify_flg from travel_master_tbl_temp where req_id=$1",[req_id], function(err, accessRes) {
						 if (err) {
                    console.error('Error with table query', err);
                } else {
					 empaccess = accessRes.rows['0'].emp_access;
					  console.log('empaccess', empaccess);
					   mgr_id = accessRes.rows['0'].approver_id;
					  console.log('mgr_id', mgr_id);
					    modify_flg = accessRes.rows['0'].modify_flg;
					  console.log('modify_flg', modify_flg);
				}
				  console.log('emp_access', emp_access);
                pdbconnect.query("INSERT INTO travel_master_tbl(req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,request_status,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,free_text_2,free_text_3,budgetovershoot_flg,deliveryMgr_id,approver_remarks) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)", [req_id, empid, empname, empaccess, project_id, from_date, to_date, from_location, to_location, remarks, mgr_id, del_flg,'RJM', rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3, budgetovershoot_flg, deliveryMgr_id, approver_remarks], function(err, done) {
                    if (err) throw err;
                   pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)", [req_id], function(err, done) {
                        if (err) throw err;
						 success = "Request has been rejected sucessfully for Request Id:" + req_id + ".";
                        req.flash('success',"Request has been rejected sucessfully for Request Id:" + req_id + ".")
                        //res.redirect(req.get('referer'));
                        pdbconnect.query("DELETE FROM travel_master_tbl_temp WHERE req_id=$1", [req_id], function(err, re) {
                            console.log("record deleted in temp table");
                            
                            console.log("sUCCES INSIDE FUNC", success);
                            console.log("success", success);
                            var emp_id = req.user.rows[0].user_id;
                            var emp_name = req.user.rows[0].user_name;
                            var emp_access = req.user.rows[0].user_type;
                            console.log("emp_id ", emp_id);
                            console.log("emp_name ", emp_name);
                            console.log("emp_access ", emp_access);
                                                pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                                    if (err) {
                                                        console.error('Error with table query', err);
                                                    } else {
                                                        employee_name = empResult.rows['0'].emp_name;
                                                        employee_email = empResult.rows['0'].emp_email;
                                                        console.log('employee name ', employee_name);
                                                        console.log('employee id ', employee_email);
                                                    }
                                                    console.log('smtpTransport call ');
                                                    var smtpTransport = nodemailer.createTransport('SMTP', {
                                                        service: 'gmail',
                                                        auth: {
                                                            user:  'amber@nurture.co.in',
                                                            pass: 'nurture@123'
                                                        }
                                                    });
                                                    var mailOptions = {
                                                        to: employee_email,
                                                        from:  'amber@nurture.co.in',
                                                        subject: 'Travel Request notification',
                                                        text: 'Travel Request ' + req_id + ' approved by you for project id ' + project_id + ' to travel from  ' + from_location + '  to ' + to_location + ' on ' + from_date + ' for employee ' + empname + '(' + empid + ') has been rejected.\n' + 'Kindly discuss for further clarification.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                                    };
                                                    console.log('mailOptions', mailOptions);
                                                    smtpTransport.sendMail(mailOptions, function(err) {});
                                                   
                                                   var travelAppStatus =req.body.travelAppStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var queryStringDM = "";
    var paramString = "";
    var paramStringMain = "";
    var paramStringDM = "";
    
   
    if(travelAppStatus == null){
        travelAppStatus= "PEN";
    }

    
   
    

    if(travelAppStatus == "PEN" || travelAppStatus == "ALL"){
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2,$3) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramString = [emp_id,'SUB','MOD'];
    }
    else {
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramString = [emp_id,''];
    }
    


    if(travelAppStatus == "PEN"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,''];
    }
    else if(travelAppStatus == "APP"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,'APM'];
    }
    else if(travelAppStatus == "REJ"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,'RJM'];
    }
    else{
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2,$3) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,'RJM','APM'];
    }
    
    
    if(travelAppStatus == "PEN"){
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'P'];
    }
    else if(travelAppStatus == "APP"){
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'A'];
    }
    else if(travelAppStatus == "REJ"){
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'D'];
    }
    else{
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2,$3,$4) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'P','A','D'];
    }

    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('\n\nError with table query :: \n', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("\n\n\ntravelReqList :: ",travelReqList);
        }
        var recordCountTemp="";
        recordCountTemp=trvReqTempResult.rowCount;
        

        pdbconnect.query(queryStringMain,paramStringMain, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('\n\n\nError with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("\n\n\ntravelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    

        
            pdbconnect.query(queryStringDM,paramStringDM, function(err, trvReqDMResult) {
                
                        if(err){
                            console.error('\n\n\nError with table query', err);
                        } 
                        else{
                            var travelReqDMList = trvReqDMResult.rows;
                            console.log("\n\n\travelReqDMList :: ",travelReqDMList);
                        }
                        var recordCountDM="";
                        recordCountDM=trvReqDMResult.rowCount;
                        

        var totalRecordCount= recordCountMain+recordCountTemp+recordCountDM;

        console.log("\n\n\n recordCountMain :: ",recordCountMain);
        console.log(" recordCountTemp :: ",recordCountTemp);
        console.log(" recordCountDM :: ",recordCountDM);
        console.log(" totalRecordCount :: ",totalRecordCount);

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'AQS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;

            
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count);  
        res.render('travelModule/viewTravelApprQueue',{
            
            emp_id:emp_id,
            emp_name:emp_name,
            emp_access:emp_access,

            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,
            travelReqDMList:travelReqDMList,
            
            cocd_appQueueStatus:cocd_appQueueStatus,
            cocd_appQueueStatus_count:cocd_appQueueStatus_count,
            
            travelAppStatus:travelAppStatus,

            recordCountTemp:recordCountTemp,
            recordCountMain:recordCountMain,
            recordCountDM:recordCountDM,
            totalRecordCount:totalRecordCount,
			success:success
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
    } else if (test == "Confirm") {
        console.log('inside Confirm ');
        var now = new Date();
        var rcre_user_id = emp_id;
        var rcre_time = now;
        var lchg_user_id =emp_id;
        var lchg_time = now;
        var req_id = req.body.req_id;
        var empid = req.body.empid;
        var empname = req.body.empname;
        var empaccess = req.body.empaccess;
        console.log('emp_access', emp_access);
		var empaccessOH = req.body.emp_access;
		 console.log('empaccessOH', empaccessOH);
        var project_id = req.body.project_id;
        var from_date = req.body.from_date;
        var to_date = req.body.to_date;
        var from_location = req.body.from_location;
        var to_location = req.body.to_location;
        var remarks = req.body.remarks;
		  var hr_remarks = req.body.hr_remarks;
        var approver_id = req.body.approver_id;
        var request_status = "";
        var approver_remarks = req.body.app_remarks;
        console.log("app_remarks:::", approver_remarks);
        var del_flg = "N";
        var confirm_flg = "Y";
        var reject_flg = "N";
        var free_text_1 = req.body.free_text_1;
        var free_text_2 = req.body.free_text_2;
        var free_text_3 = req.body.free_text_3;
        var approvedData = "";
        var pendingStatusData = "";
        var rejectedData = "";
        var confirmData = "";
        var budgetAmount = "";
        var finalBudgetAmount = "0";
        var free_text_1_temp="";
        var final_amount_spend="";
        var cost = "";
        var modify_flg=""; 
		var ticket_number=req.body.ticket_number;
		var pnr_number=req.body.pnr_number;
		console.log("ticket_number", ticket_number);
		console.log("pnr_number", pnr_number);
        console.log("req_id", req_id);
        pdbconnect.query("select travel_totalamt_spend from project_master_tbl where project_id=$1" ,[project_id],function(err,travel_totalamt_spendResult){
        	if (err) throw err;
        	var travel_totalamt_spend=travel_totalamt_spendResult.rows[0].travel_totalamt_spend;
        	console.log("travel_totalamt_spend", travel_totalamt_spend);
        	
        	if(travel_totalamt_spend!=0)
        	{
        		free_text_1_temp=parseInt(travel_totalamt_spend)+parseInt(free_text_1);
        		console.log("inside the if loop travel_totalamt_spend", travel_totalamt_spend);
        	}
        	else 
        	{
        		 free_text_1_temp = free_text_1;
        	}
        
        pdbconnect.query("update project_master_tbl set travel_totalamt_spend=$1 where project_id=$2", [free_text_1_temp,project_id], function(err, done) {
            if (err) 
            {
                   throw err;
            }else
            {
               console.log('updated successfully');
            }
            pdbconnect.query("update project_master_tbl_hist set travel_totalamt_spend=$1 where project_id=$2", [free_text_1_temp,project_id], function(err, done) {
            if (err) 
            {
                   throw err;
            }else
            {
               console.log('updated successfully');
            }
        pdbconnect.query("UPDATE  travel_master_tbl SET  request_status=$1,lchg_time=$2,free_text_1=$3 ,pnr_number=$4 ,ticket_number=$5,hr_remarks=$6 where req_id=$7", ['APF', lchg_time, free_text_1,pnr_number,ticket_number, hr_remarks,req_id], function(err, done) {
            if (err) throw err;
			pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
                 success = "Travel request has been confirmed  with Request Id:" + req_id + ".";
                req.flash('success',"Travel request has been confirmed  with Request Id:" + req_id + ".")
                //res.redirect(req.get('referer'));
                var emp_id = req.user.rows[0].user_id;
                var emp_access = req.user.rows[0].user_type;
                var emp_name = req.user.rows[0].user_name;
                console.log('approveReq func inside travelhrQueue');
              
                                    console.log(' project_id', project_id);
                                    pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        } else {
											if(empResult.rowCount != 0){
                                            employee_name = empResult.rows['0'].emp_name;
                                            employee_email = empResult.rows['0'].emp_email;
                                            console.log('employee name ', employee_name);
                                            console.log('employee id ', employee_email);
											}
                                        }
                                        pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
											
											pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select deliverymgr_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                deliverymgr_name = empResult.rows['0'].emp_name;
                                                deliverymgr_email = empResult.rows['0'].emp_email;
                                                console.log('deliverymgr_name name ', deliverymgr_name);
                                                console.log('manager id ', deliverymgr_email);
                                            }
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											if (empaccessOH != 'L1'){
                                            var mailOptions = {
                                                to: approver_email,
                                                cc: employee_email,deliverymgr_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' approved by you for project id ' + project_id + ' to travel from  ' + from_location + '  to ' + to_location + ' on ' + from_date + ' for employee ' + empname + '(' + empid + ') has been confirmed.\n' + 'Kindly discuss with HR for further clarification.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
											
                                         
											}
											else{
												var mailOptions = {
                                                to: employee_email,
                                               
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                 text: 'Travel Request ' + req_id + ' approved by you for project id ' + project_id + ' to travel from  ' + from_location + '  to ' + to_location + ' on ' + from_date + ' for employee ' + empname + '(' + empid + ') has been confirmed.\n' + 'Kindly discuss with HR for further clarification.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
											}
                                            
                                        var travelHrStatus =req.body.travelHrStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var queryStringDM = "";
    var paramString = "";
    var paramStringMain = "";
    var paramStringDM = "";
    
   
    if(travelHrStatus == null){
        travelHrStatus= "PEN";
    }

   if(travelHrStatus == "ALL"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1,$2,$3,$4,$5,$6,$7) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        
        paramStringMain = ['APM','APF','RJF','APD','FWD','CPF','CAF'];
    }
    else if(travelHrStatus == "PEN"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1, $2,$3) and t1.budgetovershoot_flg in ($4,$5) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['APM','APD','MOD','N','A'];
    }
    else if(travelHrStatus == "PND"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['FWD','P'];
    }
    else if(travelHrStatus == "APP"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['APF'];
    }
    else if(travelHrStatus == "REJ"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['RJF'];
    }
	else if(travelHrStatus == "CAF"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['CAF'];
    }
	else if(travelHrStatus == "CPF"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['CPF'];
    }
 
 

    console.log("queryStringMain :: ", queryStringMain);
        pdbconnect.query(queryStringMain,paramStringMain, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('\n\n\nError with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("\n\n\ntravelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;

                    console.log('\n\n\n recordCount Main ::: ',recordCountMain);

        
            

        var totalRecordCount= recordCountMain;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'AQS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;

            
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count);  
        res.render('travelModule/viewTravelFinQueue',{
            
            emp_id:emp_id,
            emp_name:emp_name,
            emp_access:emp_access,

            travelReqMainList:travelReqMainList,
            cocd_appQueueStatus:cocd_appQueueStatus,
            cocd_appQueueStatus_count:cocd_appQueueStatus_count,
            travelHrStatus:travelHrStatus,
            
            recordCountMain:recordCountMain,
            totalRecordCount:totalRecordCount,
			success:success
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
    } else if(test11 == "Confirm")
    {
         console.log('inside verify ');
        var now = new Date();
        var rcre_user_id = emp_id;
        var rcre_time = now;
        var lchg_user_id = emp_id;
        var lchg_time = now;
        var req_id = req.body.req_id;
        var empid = req.body.empid;
        var empname = req.body.empname;
        var empaccess = req.body.empaccess;
        console.log('emp_access', emp_access);
		var empaccessOH = req.body.emp_access;
		 console.log('empaccessOH', empaccessOH);
        var project_id = req.body.project_id;
        var from_date = req.body.from_date;
        var to_date = req.body.to_date;
        var from_location = req.body.from_location;
        var to_location = req.body.to_location;
        var remarks = req.body.remarks;
        var approver_id = req.body.approver_id;
        var request_status = "";
        var approver_remarks = req.body.app_remarks;
        console.log("app_remarks:::", approver_remarks);
        var del_flg = "N";
        var confirm_flg = "Y";
        var reject_flg = "N";
        var free_text_1 = req.body.free_text_1;
        var free_text_2 = req.body.free_text_2;
        var free_text_3 = req.body.free_text_3;
        var ticket_Amount = req.body.ticket_Amount;
        var amount_refunded =req.body.amount_refunded;
        var approvedData = "";
        var pendingStatusData = "";
        var rejectedData = "";
        var confirmData = "";
        var budgetAmount = "";
        var finalBudgetAmount = "0";
        var free_text_1_temp="";
        var final_amount_spend="";
        var cost = "";
		var bookedAmt="";
		var budgetovershoot_flg="";
		var ticket_number=req.body.ticket_number;
		var pnr_number=req.body.pnr_number;
		console.log("ticket_number", ticket_number);
		console.log("pnr_number", pnr_number);
        var hr_remarks=req.body.hr_remarks;
          final_amount_spend = free_text_1;
           
        
        console.log("req_id", req_id);
        pdbconnect.query("select travel_totalamt_spend from project_master_tbl where project_id=$1" ,[project_id],function(err,travel_totalamt_spendResult){
        	if (err) throw err;
        	var travel_totalamt_spend=travel_totalamt_spendResult.rows[0].travel_totalamt_spend;
        	console.log("travel_totalamt_spend", travel_totalamt_spend);
        	
        	if(travel_totalamt_spend!=0)
        	{
        		free_text_1_temp=parseInt(travel_totalamt_spend)+parseInt(free_text_1);
        		console.log("inside the if loop travel_totalamt_spend", travel_totalamt_spend);
				console.log("inside the if loop travel_totalamt_spend", free_text_1_temp);
        	}
        	else 
        	{
        		 free_text_1_temp = parseInt(free_text_1);
        	}
        
        pdbconnect.query("update project_master_tbl set travel_totalamt_spend=$1 where project_id=$2", [free_text_1_temp,project_id], function(err, done) {
            if (err) 
            {
                   throw err;
            }else
            {
               console.log('updated successfully');
            }
            pdbconnect.query("update project_master_tbl_hist set travel_totalamt_spend=$1 where project_id=$2", [free_text_1_temp,project_id], function(err, done) {
            if (err) 
            {
                   throw err;
            }else
            {
               console.log('updated successfully');
            }
			  pdbconnect.query("select free_text_1 from  travel_master_tbl  where req_id=$1", [req_id], function(err, empResult) {
            if (err) 
            {
                   throw err;
            }else
            {
                bookedAmt = empResult.rows['0'].free_text_1;
				console.log("bookedAmt",bookedAmt);
					console.log("free_text_1",free_text_1);
					bookedAmt=parseInt(bookedAmt)+parseInt(free_text_1);
            }
			console.log("bookedAmt::::bookedAmt::",bookedAmt);
        pdbconnect.query("UPDATE  travel_master_tbl SET  request_status=$1, free_text_1=$2,lchg_time=$3, pnr_number=$4,ticket_number=$5 ,hr_remarks=$6 where req_id=$7", ['APF', bookedAmt, lchg_time,pnr_number,ticket_number,hr_remarks,req_id], function(err, done) {
            if (err) throw err;
           pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
                 success = "Travel request has been confirmed  with Request Id:" + req_id + ".";
                req.flash('success',"Travel request has been confirmed  with Request Id:" + req_id + ".")
                //res.redirect(req.get('referer'));
                var emp_id = req.user.rows[0].user_id;
                var emp_access = req.user.rows[0].user_type;
                var emp_name = req.user.rows[0].user_name;
                console.log('approveReq func inside travelhrQueue');
               
                                    console.log(' project_id', project_id);
                                    pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        } else {
                                            employee_name = empResult.rows['0'].emp_name;
                                            employee_email = empResult.rows['0'].emp_email;
                                            console.log('employee name ', employee_name);
                                            console.log('employee id ', employee_email);
                                        }
                                        pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
												if (empResult.rowCount != 0){
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
												
												}
                                            }
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											if (empaccessOH != 'L1'){
                                            var mailOptions = {
                                                to: approver_email,
                                                cc: employee_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' approved by you for project id ' + project_id + ' to travel from  ' + from_location + '  to ' + to_location + ' on ' + from_date + ' for employee ' + empname + '(' + empid + ') has been confirmed.\n' + 'Kindly discuss with HR for further clarification.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
											}
											else{
												var mailOptions = {
                                                to: employee_email,
                                               
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' approved by you for project id ' + project_id + ' to travel from  ' + from_location + '  to ' + to_location + ' on ' + from_date + ' for employee ' + empname + '(' + empid + ') has been confirmed.\n' + 'Kindly discuss with HR for further clarification.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
											}
                                           var travelHrStatus =req.body.travelHrStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var queryStringDM = "";
    var paramString = "";
    var paramStringMain = "";
    var paramStringDM = "";
    
   
    if(travelHrStatus == null){
        travelHrStatus= "PEN";
    }

   if(travelHrStatus == "ALL"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1,$2,$3,$4,$5,$6,$7) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        
        paramStringMain = ['APM','APF','RJF','APD','FWD','CPF','CAF'];
    }
    else if(travelHrStatus == "PEN"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1, $2,$3) and t1.budgetovershoot_flg in ($4,$5) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['APM','APD','MOD','N','A'];
    }
    else if(travelHrStatus == "PND"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['FWD','P'];
    }
    else if(travelHrStatus == "APP"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['APF'];
    }
    else if(travelHrStatus == "REJ"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['RJF'];
    }
	else if(travelHrStatus == "CAF"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['CAF'];
    }
	else if(travelHrStatus == "CPF"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['CPF'];
    }
 
 

    console.log("queryStringMain :: ", queryStringMain);
        pdbconnect.query(queryStringMain,paramStringMain, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('\n\n\nError with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("\n\n\ntravelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;

                    console.log('\n\n\n recordCount Main ::: ',recordCountMain);

        
            

        var totalRecordCount= recordCountMain;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'AQS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;

            
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count);  
        res.render('travelModule/viewTravelFinQueue',{
            
            emp_id:emp_id,
            emp_name:emp_name,
            emp_access:emp_access,

            travelReqMainList:travelReqMainList,
            cocd_appQueueStatus:cocd_appQueueStatus,
            cocd_appQueueStatus_count:cocd_appQueueStatus_count,
            travelHrStatus:travelHrStatus,
            
            recordCountMain:recordCountMain,
            totalRecordCount:totalRecordCount,
			success:success
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
    else if (test22 == "Confirm") {
        console.log('inside Approve the request ');
        var now = new Date();
        var rcre_user_id = emp_id;
        var rcre_time = now;
        var lchg_user_id =emp_id;
        var lchg_time = now;
        var req_id = req.body.req_id;
        var empid = req.body.empid;
        var empname = req.body.empname;
        var empaccess = req.body.empaccess;
		
        console.log('emp_access', emp_access);
        var project_id = req.body.project_id;
        var from_date = req.body.from_date;
        var to_date = req.body.to_date;
        var from_location = req.body.from_location;
        var to_location = req.body.to_location;
        var remarks = req.body.remarks;
        var approver_id = req.body.approver_id;
        var request_status = "";
        var approver_remarks = req.body.app_remarks;
        console.log("app_remarks:::", approver_remarks);
		var hr_remarks=req.body.hr_remarks;
        var del_flg = "N";
        var confirm_flg = "Y";
        var reject_flg = "N";
        var free_text_1 = req.body.free_text_1;
        var free_text_2 = req.body.free_text_2;
        var free_text_3 = req.body.free_text_3;
        var approvedData = "";
        var pendingStatusData = "";
        var rejectedData = "";
        var confirmData = "";
        var budgetAmount = "";
        var finalBudgetAmount = "0";
        var free_text_1_temp="";
        var final_amount_spend="";
        var cost = "";
        var modify_flg="";
		var budgetovershoot_flg="";
		var ticket_number=req.body.ticket_number;
		var pnr_number=req.body.pnr_number;
		console.log("ticket_number", ticket_number);
		console.log("pnr_number", pnr_number);	
        console.log("req_id", req_id);
        pdbconnect.query("select travel_totalamt_spend from project_master_tbl where project_id=$1" ,[project_id],function(err,travel_totalamt_spendResult){
        	if (err) throw err;
        	var travel_totalamt_spend=travel_totalamt_spendResult.rows[0].travel_totalamt_spend;
        	console.log("travel_totalamt_spend", travel_totalamt_spend);
        	
        	if(travel_totalamt_spend!=0)
        	{
        		free_text_1_temp=parseInt(travel_totalamt_spend)+parseInt(free_text_1);
        		console.log("inside the if loop travel_totalamt_spend", travel_totalamt_spend);
				console.log("inside the if loop travel_totalamt_spend", free_text_1_temp);
        	}
        	else 
        	{
        		 free_text_1_temp = parseInt(free_text_1);
        	}
        
        pdbconnect.query("update project_master_tbl set travel_totalamt_spend=$1 where project_id=$2", [free_text_1_temp,project_id], function(err, done) {
            if (err) 
            {
                   throw err;
            }else
            {
               console.log('updated successfully');
            }
            pdbconnect.query("update project_master_tbl_hist set travel_totalamt_spend=$1 where project_id=$2", [free_text_1_temp,project_id], function(err, done) {
            if (err) 
            {
                   throw err;
            }else
            {
               console.log('updated successfully');
            }
        pdbconnect.query("UPDATE  travel_master_tbl SET  request_status=$1, free_text_1=$2,lchg_time=$3, pnr_number=$4,ticket_number=$5,hr_remarks=$6 where req_id=$7", ['APF', free_text_1, lchg_time,pnr_number,ticket_number,hr_remarks,req_id], function(err, done) {
            if (err) throw err;
           pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
                 success = "Travel request has been confirmed  with Request Id:" + req_id + ".";
                req.flash('success',"Travel request has been confirmed  with Request Id:" + req_id + ".")
                //res.redirect(req.get('referer'));
                var emp_id = req.user.rows[0].user_id;
                var emp_access = req.user.rows[0].user_type;
                var emp_name = req.user.rows[0].user_name;
                console.log('approveReq func inside travelhrQueue');
             
                                    console.log(' project_id', project_id);
                                    pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        } else {
                                            employee_name = empResult.rows['0'].emp_name;
                                            employee_email = empResult.rows['0'].emp_email;
                                            console.log('employee name ', employee_name);
                                            console.log('employee id ', employee_email);
                                        }
                                       
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											
                                            var mailOptions = {
                                                to: employee_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' approved by you for project id ' + project_id + ' to travel from  ' + from_location + '  to ' + to_location + ' on ' + from_date + ' for employee ' + empname + '(' + empid + ') has been confirmed.\n' + 'Kindly discuss with HR for further clarification.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
											
                                          var travelHrStatus =req.body.travelHrStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var queryStringDM = "";
    var paramString = "";
    var paramStringMain = "";
    var paramStringDM = "";
    
   
    if(travelHrStatus == null){
        travelHrStatus= "PEN";
    }

   if(travelHrStatus == "ALL"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1,$2,$3,$4,$5,$6,$7) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        
        paramStringMain = ['APM','APF','RJF','APD','FWD','CPF','CAF'];
    }
    else if(travelHrStatus == "PEN"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1, $2,$3) and t1.budgetovershoot_flg in ($4,$5) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['APM','APD','MOD','N','A'];
    }
    else if(travelHrStatus == "PND"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['FWD','P'];
    }
    else if(travelHrStatus == "APP"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['APF'];
    }
    else if(travelHrStatus == "REJ"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['RJF'];
    }
	else if(travelHrStatus == "CAF"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['CAF'];
    }
	else if(travelHrStatus == "CPF"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['CPF'];
    }
 
 
 

    console.log("queryStringMain :: ", queryStringMain);
        pdbconnect.query(queryStringMain,paramStringMain, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('\n\n\nError with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("\n\n\ntravelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;

                    console.log('\n\n\n recordCount Main ::: ',recordCountMain);

        
            

        var totalRecordCount= recordCountMain;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'AQS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;

            
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count);  
        res.render('travelModule/viewTravelFinQueue',{
            
            emp_id:emp_id,
            emp_name:emp_name,
            emp_access:emp_access,

            travelReqMainList:travelReqMainList,
            cocd_appQueueStatus:cocd_appQueueStatus,
            cocd_appQueueStatus_count:cocd_appQueueStatus_count,
            travelHrStatus:travelHrStatus,
            
            recordCountMain:recordCountMain,
            totalRecordCount:totalRecordCount,
			success:success
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
    else if (test == "Cancel" ||  test21 == "Cancel") {
        console.log('inside CANCEL ');
        var now = new Date();
        var rcre_user_id =emp_id;
        var rcre_time = now;
        var lchg_user_id = emp_id;
        var lchg_time = now;
        var req_id = req.body.req_id;
        console.log('req_id', req_id);
        var empid = req.body.empid;
        var empname = req.body.empname;
        var empaccess = req.body.empaccess;
        var project_id = req.body.project_id;
        var from_date = req.body.from_date;
        var to_date = req.body.to_date;
        var from_location = req.body.from_location;
        var to_location = req.body.to_location;
        var remarks = req.body.remarks;
        var approver_id = req.body.approver_id;
		var hr_remarks=req.body.hr_remarks;
        var request_status = "";
        var approver_remarks = req.body.app_remarks;
        console.log("app_remarks:::", approver_remarks);
        var del_flg = "N";
        var confirm_flg = "N";
        var reject_flg = "Y";
        var free_text_1 = req.body.free_text_1;
        var free_text_2 = req.body.free_text_2;
        var free_text_3 = req.body.free_text_3;
        var approvedData = "";
        var pendingStatusData = "";
        var rejectedData = "";
        var confirmData = "";
		var pnr_number="";
		var ticket_number="";
        console.log("free_text_1:::free_text_1::free_text_1", free_text_1);
         pdbconnect.query("UPDATE  travel_master_tbl SET  request_status=$1,lchg_time=$2,free_text_1=$3 ,pnr_number=$4 ,ticket_number=$5 ,hr_remarks=$6 where req_id=$7", ['RJF', lchg_time, free_text_1,pnr_number,ticket_number, hr_remarks,req_id], function(err, done) {
            if (err) throw err;
			pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
                 success = "Travel request has been cancelled  with Request Id:" + req_id + ".";
                req.flash('success',"Travel request has been cancelled  with Request Id:" + req_id + ".")
                //res.redirect(req.get('referer'));
                var emp_id = req.user.rows[0].user_id;
                var emp_access = req.user.rows[0].user_type;
                var emp_name = req.user.rows[0].user_name;
                console.log('approveReq func inside travelhrQueue');
               
                                        pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                employee_name = empResult.rows['0'].emp_name;
                                                employee_email = empResult.rows['0'].emp_email;
                                                console.log('employee name ', employee_name);
                                                console.log('employee id ', employee_email);
                                            }
                                            pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                                if (err) {
                                                    console.error('Error with table query', err);
                                                } else {
													if (empResult.rowCount != 0){
                                                    approver_name = empResult.rows['0'].emp_name;
                                                    approver_email = empResult.rows['0'].emp_email;
                                                    console.log('manager name ', approver_name);
                                                    console.log('manager id ', approver_email);
													}
                                                }
                                                console.log('smtpTransport call ');
                                                var smtpTransport = nodemailer.createTransport('SMTP', {
                                                    service: 'gmail',
                                                    auth: {
                                                        user:  'amber@nurture.co.in',
                                                        pass: 'nurture@123'
                                                    }
                                                });
												if (empaccessOH != 'L1'){
                                                var mailOptions = {
                                                    to: approver_email,
                                                    cc: employee_email,
                                                    from:  'amber@nurture.co.in',
                                                    subject: 'Travel Request notification',
                                                    text: 'Travel Request ' + req_id + ' approved by you for project id ' + project_id + ' to travel from  ' + from_location + '  to ' + to_location + ' on ' + from_date + ' for employee ' + empname + '(' + empid + ') has been rejected.\n' + '\n' + 'Kindly discuss with HR for further clarification.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                                };
                                                console.log('mailOptions', mailOptions);
                                                smtpTransport.sendMail(mailOptions, function(err) {});
												}else{
													 var mailOptions = {
                                                    to: employee_email,
                                                    
                                                    from:  'amber@nurture.co.in',
                                                    subject: 'Travel Request notification',
                                                    text: 'Travel Request ' + req_id + ' approved by you for project id ' + project_id + ' to travel from  ' + from_location + '  to ' + to_location + ' on ' + from_date + ' for employee ' + empname + '(' + empid + ') has been rejected.\n' + '\n' + 'Kindly discuss with HR for further clarification.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                                };
                                                console.log('mailOptions', mailOptions);
                                                smtpTransport.sendMail(mailOptions, function(err) {});
												
												}
                                               var travelHrStatus =req.body.travelHrStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var queryStringDM = "";
    var paramString = "";
    var paramStringMain = "";
    var paramStringDM = "";
    
   
    if(travelHrStatus == null){
        travelHrStatus= "PEN";
    }

   if(travelHrStatus == "ALL"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1,$2,$3,$4,$5,$6,$7) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        
        paramStringMain = ['APM','APF','RJF','APD','FWD','CPF','CAF'];
    }
    else if(travelHrStatus == "PEN"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1, $2,$3) and t1.budgetovershoot_flg in ($4,$5) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['APM','APD','MOD','N','A'];
    }
    else if(travelHrStatus == "PND"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['FWD','P'];
    }
    else if(travelHrStatus == "APP"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['APF'];
    }
    else if(travelHrStatus == "REJ"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['RJF'];
    }
	else if(travelHrStatus == "CAF"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['CAF'];
    }
	else if(travelHrStatus == "CPF"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['CPF'];
    }
 
 

    console.log("queryStringMain :: ", queryStringMain);
        pdbconnect.query(queryStringMain,paramStringMain, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('\n\n\nError with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("\n\n\ntravelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;

                    console.log('\n\n\n recordCount Main ::: ',recordCountMain);

        
            

        var totalRecordCount= recordCountMain;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'AQS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;

            
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count);  
        res.render('travelModule/viewTravelFinQueue',{
            
            emp_id:emp_id,
            emp_name:emp_name,
            emp_access:emp_access,

            travelReqMainList:travelReqMainList,
            cocd_appQueueStatus:cocd_appQueueStatus,
            cocd_appQueueStatus_count:cocd_appQueueStatus_count,
            travelHrStatus:travelHrStatus,
            
            recordCountMain:recordCountMain,
            totalRecordCount:totalRecordCount,
			success:success
        });
    });
    });
                    });
                });
            });
        });
    } else if (test == "Forward") {
        console.log('inside CANCEL ');
        var now = new Date();
        var rcre_user_id = emp_id;
        var rcre_time = now;
        var lchg_user_id =emp_id;
        var lchg_time = now;
        var req_id = req.body.req_id;
        console.log('req_id', req_id);
        var empid = req.body.empid;
        var empname = req.body.empname;
        var empaccess = req.body.empaccess;
        var project_id = req.body.project_id;
        var from_date = req.body.from_date;
        var to_date = req.body.to_date;
        var from_location = req.body.from_location;
        var to_location = req.body.to_location;
        var remarks = req.body.remarks;
        var approver_id = req.body.approver_id;
        var request_status = "";
        var approver_remarks = req.body.app_remarks;
        console.log("app_remarks:::", approver_remarks);
		var hr_remarks=req.body.hr_remarks;
        var del_flg = "N";
        var confirm_flg = "N";
        var reject_flg = "Y";
        var free_text_1 = req.body.free_text_1;
        console.log("free_text_1::free_text_1", free_text_1);
        var free_text_2 = req.body.free_text_2;
        var free_text_3 = req.body.free_text_3;
        var available_budget = req.body.available_budget;
        console.log("::available_budget::", available_budget);
        var approvedData = "";
        var pendingStatusData = "";
        var rejectedData = "";
        var confirmData = "";
        var budgetovershoot_flg = "";
        var deliveryMgr_id = "";
		//var ticket_number=req.body.ticket_number;
		//var pnr_number=req.body.pnr_number;
		console.log("ticket_number", ticket_number);
		console.log("pnr_number", pnr_number);
        pdbconnect.query("SELECT deliveryMgr_id FROM travel_master_tbl where req_id=$1  and del_flg=$2 order by req_id::integer desc", [req_id, 'N'], function(err, result) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                var resultData = result.rows;
                console.log("resultData", resultData);
                deliveryMgr_id = result.rows['0'].deliveryMgr_id;
                console.log("deliveryMgr_id::resultData", deliveryMgr_id);
            }
            pdbconnect.query("UPDATE  travel_master_tbl SET  budgetovershoot_flg=$1,free_text_1=$2 ,available_budget=$3,lchg_time=$4,lchg_user_id=$5,request_status=$6,hr_remarks=$7 where req_id=$8 ", ['P', free_text_1, available_budget,lchg_time,lchg_user_id,'FWD',hr_remarks, req_id], function(err, done) {
                if (err) throw err;
                pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
                     success = "Travel request has been forwared  with Request Id:" + req_id + "for further Approval.";
                    req.flash('success',"Travel request has been forwared  with Request Id:" + req_id + "for further Approval.")
                    //res.redirect(req.get('referer'));
                    var emp_id = req.user.rows[0].user_id;
                    var emp_access = req.user.rows[0].user_type;
                    var emp_name = req.user.rows[0].user_name;
                    console.log('approveReq func inside travelhrQueue');
               
                                    
											 pdbconnect.query("select emp_name,emp_id from travel_master_tbl where req_id=$1", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                employee_name = empResult.rows['0'].emp_name;
                                               
                                                console.log('employee name ', employee_name);
                                              
                                            }
                                            pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                                if (err) {
                                                    console.error('Error with table query', err);
                                                } else {
													
                                                    approver_name = empResult.rows['0'].emp_name;
                                                    approver_email = empResult.rows['0'].emp_email;
                                                    console.log('employee name ', approver_name);
                                                    console.log('employee id ', approver_email);
                                                }
                                                // pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks,approver_remarks FROM travel_master_tbl where appr_flg=$1 and budgetovershoot_flg=$2 and del_flg=$3 and confrm_flg=$4 and reject_flg=$5 order by req_id::integer desc", ['Y', 'A', 'N', 'N', 'N'], function(err, delvryMgrAppdData) {
                                                    // if (err) {
                                                        // console.error('Error with table query', err);
                                                    // } else {
                                                        // var delvryMgrAppdData = delvryMgrAppdData.rows;
                                                        // console.log("delvryMgrAppdData:::", delvryMgrAppdData);
                                                    // }
                                                    pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select deliverymgr_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                                        if (err) {
                                                            console.error('Error with table query', err);
                                                        } else {
                                                            deliverymgr_name = empResult.rows['0'].emp_name;
                                                            deliverymgr_email = empResult.rows['0'].emp_email;
                                                            console.log('manager name ', deliverymgr_name);
                                                            console.log('manager id ', deliverymgr_email);
                                                        }
                                                        console.log('smtpTransport call ');
                                                        var smtpTransport = nodemailer.createTransport('SMTP', {
                                                            service: 'gmail',
                                                            auth: {
                                                                user:  'amber@nurture.co.in',
                                                                pass: 'nurture@123'
                                                            }
                                                        });
                                                        var mailOptions = {
                                                            to: deliverymgr_email,
                                                            cc: approver_email,
                                                            from:  'amber@nurture.co.in',
                                                            subject: 'Travel Request notification',
                                                            
                                                            text: 'The budget for Travel Request with id ' + req_id + ' has been overshooted for project id ' + project_id + ' to travel from  ' + from_location + '  to ' + to_location + ' on ' + from_date + ' for employee ' + empname + '(' + empid + ').\n' + '\n' + 'Kindly confirm whether employee needs to travel or not.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                                        };
                                                        console.log('mailOptions', mailOptions);
                                                        smtpTransport.sendMail(mailOptions, function(err) {});
                                                        
var travelHrStatus =req.body.travelHrStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var queryStringDM = "";
    var paramString = "";
    var paramStringMain = "";
    var paramStringDM = "";
    
   
    if(travelHrStatus == null){
        travelHrStatus= "PEN";
    }

   if(travelHrStatus == "ALL"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1,$2,$3,$4,$5,$6,$7) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        
        paramStringMain = ['APM','APF','RJF','APD','FWD','CPF','CAF'];
    }
    else if(travelHrStatus == "PEN"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1, $2,$3) and t1.budgetovershoot_flg in ($4,$5) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['APM','APD','MOD','N','A'];
    }
    else if(travelHrStatus == "PND"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['FWD','P'];
    }
    else if(travelHrStatus == "APP"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['APF'];
    }
    else if(travelHrStatus == "REJ"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['RJF'];
    }
	else if(travelHrStatus == "CAF"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['CAF'];
    }
	else if(travelHrStatus == "CPF"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['CPF'];
    }
 
 

    console.log("queryStringMain :: ", queryStringMain);
        pdbconnect.query(queryStringMain,paramStringMain, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('\n\n\nError with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("\n\n\ntravelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;

                    console.log('\n\n\n recordCount Main ::: ',recordCountMain);

        
            

        var totalRecordCount= recordCountMain;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'AQS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;

            
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count);  
        res.render('travelModule/viewTravelFinQueue',{
            
            emp_id:emp_id,
            emp_name:emp_name,
            emp_access:emp_access,

            travelReqMainList:travelReqMainList,
            cocd_appQueueStatus:cocd_appQueueStatus,
            cocd_appQueueStatus_count:cocd_appQueueStatus_count,
            travelHrStatus:travelHrStatus,
            
            recordCountMain:recordCountMain,
            totalRecordCount:totalRecordCount,
			success:success
        });
    });
    });
                                                       
                                                    
                            });
                        });
                    });
                });
            });
      });
    } else if (test == "Accept") {
        console.log('inside Confirm ');
        var now = new Date();
        var rcre_user_id = emp_id;
        var rcre_time = now;
        var lchg_user_id = emp_id;
        var lchg_time = now;
        var req_id = req.body.req_id;
        var empid = req.body.empid;
        var empname = req.body.empname;
        var empaccess = req.body.empaccess;
        console.log('emp_access', emp_access);
        var project_id = req.body.project_id;
        var from_date = req.body.from_date;
        var to_date = req.body.to_date;
        var from_location = req.body.from_location;
        var to_location = req.body.to_location;
        var remarks = req.body.remarks;
        var approver_id = req.body.approver_id;
        var request_status = "";
		
        var approver_remarks = req.body.app_remarks;
        console.log("app_remarks:::", approver_remarks);
        var del_flg = "N";
        var confirm_flg = "N";
        var reject_flg = "N";
        var free_text_1 = req.body.free_text_1;
        var free_text_2 = req.body.free_text_2;
        var free_text_3 = req.body.free_text_3;
        var approvedData = "";
        var pendingStatusData = "";
        var rejectedData = "";
        var confirmData = "";
        var budgetAmount = "";
        var finalBudgetAmount = "0";
        var cost = "";
        var budgetovershoot_flg = "";
        var deliveryMgr_id = "";
        var deliveryMgr_remarks = req.body.dMgrremarks;
        console.log("deliveryMgr_remarks", deliveryMgr_remarks);
		//var ticket_number=req.body.ticket_number;
		//var pnr_number=req.body.pnr_number;
		console.log("ticket_number", ticket_number);
		console.log("pnr_number", pnr_number);
        pdbconnect.query("UPDATE  travel_master_tbl SET  budgetovershoot_flg=$1 ,delvryMgr_remarks=$2,request_status=$3,lchg_time=$4,lchg_user_id=$5  where req_id=$6 ", ['A', deliveryMgr_remarks,'APD',lchg_time,lchg_user_id, req_id], function(err, done) {
            if (err) throw err;
            pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
               success = "Travel request for budget overshooted  has been approved with Request Id:" + req_id + ".";
                req.flash('success',"Travel request for budget overshooted  has been approved with Request Id:" + req_id + ".")
                //res.redirect(req.get('referer'));
                var emp_id = req.user.rows[0].user_id;
                var emp_access = req.user.rows[0].user_type;
                var emp_name = req.user.rows[0].user_name;
               								
                                    pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        } else {
                                            approver_name = empResult.rows['0'].emp_name;
                                            approver_email = empResult.rows['0'].emp_email;
                                            console.log('employee name ', approver_name);
                                            console.log('employee id ', approver_email);
                                        }
                                        pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1", ['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                finMgr_name = empResult.rows['0'].emp_name;
                                                finMgr_email = empResult.rows['0'].emp_email;
                                                console.log('finMgr_email name ', finMgr_name);
                                                console.log('finMgr_email id ', finMgr_email);
                                            }
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
                                            var mailOptions = {
                                                to: finMgr_email,
                                                cc: approver_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' requested for project id ' + project_id + ' to travel from  ' + from_location + '  to ' + to_location + ' on ' + from_date + ' for employee ' + empname + '(' + empid + ') has been approved.\n' + '\n' + 'Kindly discuss for further clarification.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                           
                                            var travelAppStatus =req.body.travelAppStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var queryStringDM = "";
    var paramString = "";
    var paramStringMain = "";
    var paramStringDM = "";
    
   
    if(travelAppStatus == null){
        travelAppStatus= "PEN";
    }

    
   
    

    if(travelAppStatus == "PEN" || travelAppStatus == "ALL"){
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2,$3) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramString = [emp_id,'SUB','MOD'];
    }
    else {
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramString = [emp_id,''];
    }
    


    if(travelAppStatus == "PEN"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,''];
    }
    else if(travelAppStatus == "APP"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,'APM'];
    }
    else if(travelAppStatus == "REJ"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,'RJM'];
    }
    else{
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2,$3) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,'RJM','APM'];
    }
    
    
    if(travelAppStatus == "PEN"){
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'P'];
    }
    else if(travelAppStatus == "APP"){
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'A'];
    }
    else if(travelAppStatus == "REJ"){
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'D'];
    }
    else{
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2,$3,$4) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'P','A','D'];
    }

    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('\n\nError with table query :: \n', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("\n\n\ntravelReqList :: ",travelReqList);
        }
        var recordCountTemp="";
        recordCountTemp=trvReqTempResult.rowCount;
        

        pdbconnect.query(queryStringMain,paramStringMain, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('\n\n\nError with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("\n\n\ntravelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    

        
            pdbconnect.query(queryStringDM,paramStringDM, function(err, trvReqDMResult) {
                
                        if(err){
                            console.error('\n\n\nError with table query', err);
                        } 
                        else{
                            var travelReqDMList = trvReqDMResult.rows;
                            console.log("\n\n\travelReqDMList :: ",travelReqDMList);
                        }
                        var recordCountDM="";
                        recordCountDM=trvReqDMResult.rowCount;
                        

        var totalRecordCount= recordCountMain+recordCountTemp+recordCountDM;

        console.log("\n\n\n recordCountMain :: ",recordCountMain);
        console.log(" recordCountTemp :: ",recordCountTemp);
        console.log(" recordCountDM :: ",recordCountDM);
        console.log(" totalRecordCount :: ",totalRecordCount);

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'AQS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;

            
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count);  
        res.render('travelModule/viewTravelApprQueue',{
            
            emp_id:emp_id,
            emp_name:emp_name,
            emp_access:emp_access,

            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,
            travelReqDMList:travelReqDMList,
            
            cocd_appQueueStatus:cocd_appQueueStatus,
            cocd_appQueueStatus_count:cocd_appQueueStatus_count,
            
            travelAppStatus:travelAppStatus,

            recordCountTemp:recordCountTemp,
            recordCountMain:recordCountMain,
            recordCountDM:recordCountDM,
            totalRecordCount:totalRecordCount,
			success:success
        });
    });
    });
    });
    });
                    });
                });
            });
        });
    } else if (test == "Decline") {
        console.log('inside Confirm ');
        var now = new Date();
        var rcre_user_id = emp_id;
        var rcre_time = now;
        var lchg_user_id = emp_id;
        var lchg_time = now;
        var req_id = req.body.req_id;
        var empid = req.body.empid;
        var empname = req.body.empname;
        var empaccess = req.body.empaccess;
        console.log('emp_access', emp_access);
        var project_id = req.body.project_id;
        var from_date = req.body.from_date;
        var to_date = req.body.to_date;
        var from_location = req.body.from_location;
        var to_location = req.body.to_location;
        var remarks = req.body.remarks;
        var approver_id = req.body.approver_id;
        var request_status = "";
        var approver_remarks = req.body.app_remarks;
        console.log("app_remarks:::", approver_remarks);
        var del_flg = "N";
        var confirm_flg = "N";
        var reject_flg = "Y";
        var free_text_1 = req.body.free_text_1;
        var free_text_2 = req.body.free_text_2;
        var free_text_3 = req.body.free_text_3;
        var approvedData = "";
        var pendingStatusData = "";
        var rejectedData = "";
        var confirmData = "";
        var budgetAmount = "";
        var finalBudgetAmount = "0";
        var cost = "";
        var budgetovershoot_flg = "";
        var deliveryMgr_id = "";
        var deliveryMgr_remarks = req.body.dMgrremarks;
        console.log("req_id", req_id);
        pdbconnect.query("UPDATE  travel_master_tbl SET  budgetovershoot_flg=$1,delvryMgr_remarks=$2 ,request_status=$3,lchg_time=$4,lchg_user_id=$5  where req_id=$6 ", ['D', deliveryMgr_remarks, 'RJD',lchg_time,lchg_user_id, req_id], function(err, done) {
            if (err) throw err;
            pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
                 success = "Travel request for budget overshooted  has been discarded with Request Id:" + req_id + ".";
                req.flash('success',"Travel request for budget overshooted  has been discarded with Request Id:"+ req_id +" .")
                //res.redirect(req.get('referer'));
                var emp_id = req.user.rows[0].user_id;
                var emp_access = req.user.rows[0].user_type;
                var emp_name = req.user.rows[0].user_name;
                pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                    if (err) {
                        console.error('Error with table query', err);
                    } else {
                        employee_name = empResult.rows['0'].emp_name;
                        employee_email = empResult.rows['0'].emp_email;
                        console.log('employee name ', employee_name);
                        console.log('employee id ', employee_email);
                    }
                    pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                        if (err) {
                            console.error('Error with table query', err);
                        } else {
                            approver_name = empResult.rows['0'].emp_name;
                            approver_email = empResult.rows['0'].emp_email;
                            console.log('manager name ', approver_name);
                            console.log('manager id ', approver_email);
                        }
                        pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1", ['F1'], function(err, empResult) {
                            if (err) {
                                console.error('Error with table query', err);
                            } else {
                                finMgr_name = empResult.rows['0'].emp_name;
                                finMgr_email = empResult.rows['0'].emp_email;
                                console.log('finMgr_email name ', finMgr_name);
                                console.log('finMgr_email id ', finMgr_email);
                            }
                            console.log('smtpTransport call ');
                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                service: 'gmail',
                                auth: {
                                    user:  'amber@nurture.co.in',
                                    pass: 'nurture@123'
                                }
                            });
                            var mailOptions = {
                                to: approver_email,
                                finMgr_email,
                                cc: employee_email,
                                from:  'amber@nurture.co.in',
                                subject: 'Travel Request notification',
                                text: 'Travel Request ' + req_id + ' requested for project id ' + project_id + ' to travel from  ' + from_location + '  to ' + to_location + ' on ' + from_date + ' for employee ' + empname + '(' + empid + ') has been rejected, since travel cost is exceeded.\n' + '\n' + 'Kindly discuss for further clarification.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                            };
                            console.log('mailOptions', mailOptions);
                            smtpTransport.sendMail(mailOptions, function(err) {});
                           var travelAppStatus =req.body.travelAppStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var queryStringDM = "";
    var paramString = "";
    var paramStringMain = "";
    var paramStringDM = "";
    
   
    if(travelAppStatus == null){
        travelAppStatus= "PEN";
    }

    
   
    

    if(travelAppStatus == "PEN" || travelAppStatus == "ALL"){
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2,$3) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramString = [emp_id,'SUB','MOD'];
    }
    else {
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramString = [emp_id,''];
    }
    


    if(travelAppStatus == "PEN"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,''];
    }
    else if(travelAppStatus == "APP"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,'APM'];
    }
    else if(travelAppStatus == "REJ"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,'RJM'];
    }
    else{
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.approver_id=$1 and t1.del_flg='N' and t1.request_status in ($2,$3) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = [emp_id,'RJM','APM'];
    }
    
    
    if(travelAppStatus == "PEN"){
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'P'];
    }
    else if(travelAppStatus == "APP"){
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'A'];
    }
    else if(travelAppStatus == "REJ"){
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'D'];
    }
    else{
        queryStringDM = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.deliveryMgr_id=$1 and t1.del_flg='N' and t1.budgetovershoot_flg in ($2,$3,$4) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        paramStringDM = [emp_id,'P','A','D'];
    }

    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('\n\nError with table query :: \n', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("\n\n\ntravelReqList :: ",travelReqList);
        }
        var recordCountTemp="";
        recordCountTemp=trvReqTempResult.rowCount;
        

        pdbconnect.query(queryStringMain,paramStringMain, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('\n\n\nError with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("\n\n\ntravelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    

        
            pdbconnect.query(queryStringDM,paramStringDM, function(err, trvReqDMResult) {
                
                        if(err){
                            console.error('\n\n\nError with table query', err);
                        } 
                        else{
                            var travelReqDMList = trvReqDMResult.rows;
                            console.log("\n\n\travelReqDMList :: ",travelReqDMList);
                        }
                        var recordCountDM="";
                        recordCountDM=trvReqDMResult.rowCount;
                        

        var totalRecordCount= recordCountMain+recordCountTemp+recordCountDM;

        console.log("\n\n\n recordCountMain :: ",recordCountMain);
        console.log(" recordCountTemp :: ",recordCountTemp);
        console.log(" recordCountDM :: ",recordCountDM);
        console.log(" totalRecordCount :: ",totalRecordCount);

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'AQS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;

            
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count);  
        res.render('travelModule/viewTravelApprQueue',{
            
            emp_id:emp_id,
            emp_name:emp_name,
            emp_access:emp_access,

            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,
            travelReqDMList:travelReqDMList,
            
            cocd_appQueueStatus:cocd_appQueueStatus,
            cocd_appQueueStatus_count:cocd_appQueueStatus_count,
            
            travelAppStatus:travelAppStatus,

            recordCountTemp:recordCountTemp,
            recordCountMain:recordCountMain,
            recordCountDM:recordCountDM,
            totalRecordCount:totalRecordCount,
			success:success
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
	else if (refundAmt== "Update Amount"){
		console.log("refundAmt:::refundAmt::refundAmt::");
	var ticket_number=req.body.ticket_number;
		var pnr_number=req.body.pnr_number;
		console.log("ticket_number", ticket_number);
		console.log("pnr_number", pnr_number);
		
		
		
		var now = new Date();
        var rcre_user_id = emp_id;
        var rcre_time = now;
        var lchg_user_id = emp_id;
        var lchg_time = now;
        var req_id = req.body.req_id;
        var empid = req.body.empid;
        var empname = req.body.empname;
        var empaccess = req.body.empaccess;
        console.log('empaccess', empaccess);
		var empaccessOH = req.body.emp_access;
		 console.log('empaccessOH', empaccessOH);
        var project_id = req.body.project_id;
        var from_date = req.body.from_date;
        var to_date = req.body.to_date;
        var from_location = req.body.from_location;
        var to_location = req.body.to_location;
        var remarks = req.body.remarks;
        var approver_id = req.body.approver_id;
        var request_status = "";
        var approver_remarks = req.body.app_remarks;
        console.log("app_remarks:::", approver_remarks);
        var del_flg = "N";
        var confirm_flg = "Y";
        var reject_flg = "N";
        var free_text_1 = req.body.free_text_1;
        var free_text_2 = req.body.free_text_2;
        var free_text_3 = req.body.free_text_3;
		var hr_remarks=req.body.hr_remarks;
      
        var approvedData = "";
        var pendingStatusData = "";
        var rejectedData = "";
        var confirmData = "";
       
     
	 project_id = req.body.project_id;
	amount_refunded = req.body.amount_refunded;
	console.log("amount_refunded", amount_refunded);
    req_id = req.body.req_id;
	
	pdbconnect.query("SELECT travel_totalamt_spend FROM project_master_tbl where project_id=$1", [project_id], function(err, amtspendResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				    travel_totalamt_spend = amtspendResult.rows[0].travel_totalamt_spend;
                console.log("travel_totalamt_spend", travel_totalamt_spend);
				console.log("amount_refunded", amount_refunded);
				travel_totalamt_spend=parseInt(travel_totalamt_spend)-parseInt(amount_refunded);
				 console.log("travel_totalamt_spend:::::::", travel_totalamt_spend);
				  pdbconnect.query("update project_master_tbl set travel_totalamt_spend=$1 where project_id=$2", [travel_totalamt_spend,project_id], function(err, done) {
            if (err) 
            {
                   throw err;
            }else
            {
               console.log('updated successfully');
            }
			pdbconnect.query("update travel_master_tbl set refund_amount=$1,pnr_number=$2,ticket_number=$3 , request_status=$4,lchg_time=$5 ,hr_remarks=$6 where req_id=$7", [amount_refunded,pnr_number,ticket_number,'APF',lchg_time,hr_remarks,req_id], function(err, done) {
            if (err) 
            {
                   throw err;
            }else
            {
                success="The amount refunded and ticket has been confirmed for id"+req_id+".";
			   req.flash('success',"The amount refunded  and ticket has been confirmed for id"+ req_id +".") ;
            }
			pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
			 
                                    console.log(' project_id', project_id);
                                    pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        } else {
                                            employee_name = empResult.rows['0'].emp_name;
                                            employee_email = empResult.rows['0'].emp_email;
                                            console.log('employee name ', employee_name);
                                            console.log('employee id ', employee_email);
                                        }
                                        pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
												
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
												
											
                                            }
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											if (empaccessOH != 'L1'){
                                            var mailOptions = {
                                                to: approver_email,
                                                cc: employee_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' approved by you for project id ' + project_id + ' to travel from  ' + from_location + '  to ' + to_location + ' on ' + from_date + ' for employee ' + empname + '(' + empid + ') has been confirmed.\n' + 'Kindly discuss with HR for further clarification.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
											}
											else{
												var mailOptions = {
                                                to: employee_email,
                                               
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' approved by you for project id ' + project_id + ' to travel from  ' + from_location + '  to ' + to_location + ' on ' + from_date + ' for employee ' + empname + '(' + empid + ') has been confirmed.\n' + 'Kindly discuss with HR for further clarification.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
											}
                                           
                                          var travelHrStatus =req.body.travelHrStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var queryStringDM = "";
    var paramString = "";
    var paramStringMain = "";
    var paramStringDM = "";
    
   
    if(travelHrStatus == null){
        travelHrStatus= "PEN";
    }

    if(travelHrStatus == "ALL"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1,$2,$3,$4,$5,$6,$7) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        
        paramStringMain = ['APM','APF','RJF','APD','FWD','CPF','CAF'];
    }
    else if(travelHrStatus == "PEN"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1, $2,$3) and t1.budgetovershoot_flg in ($4,$5) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['APM','APD','MOD','N','A'];
    }
    else if(travelHrStatus == "PND"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['FWD','P'];
    }
    else if(travelHrStatus == "APP"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['APF'];
    }
    else if(travelHrStatus == "REJ"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['RJF'];
    }
	else if(travelHrStatus == "CAF"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['CAF'];
    }
	else if(travelHrStatus == "CPF"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['CPF'];
    }
 

    console.log("queryStringMain :: ", queryStringMain);
        pdbconnect.query(queryStringMain,paramStringMain, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('\n\n\nError with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("\n\n\ntravelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;

                    console.log('\n\n\n recordCount Main ::: ',recordCountMain);

        
            

        var totalRecordCount= recordCountMain;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'AQS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;

            
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count);  
        res.render('travelModule/viewTravelFinQueue',{
            
            emp_id:emp_id,
            emp_name:emp_name,
            emp_access:emp_access,

            travelReqMainList:travelReqMainList,
            cocd_appQueueStatus:cocd_appQueueStatus,
            cocd_appQueueStatus_count:cocd_appQueueStatus_count,
            travelHrStatus:travelHrStatus,
            
            recordCountMain:recordCountMain,
            totalRecordCount:totalRecordCount,
			success:success
			
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

}
	
router.get('/canReq', canReq);


function canReq(req, res) {
    var test = req.body.test;
    var id = req.query.id;
    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;
    console.log('id', id);
    console.log('approveReq func ');
    var urlValue = id.split(":");
    var approver_remarks = "";
    req_id = urlValue[0].trim();
    project_id = urlValue[1].trim();
    console.log('req_id', req_id);
    console.log('req_id', req_id.length);
    console.log('project_id', project_id);
    console.log('req_id', project_id.length);
    var emp_id = req.user.rows[0].user_id;
     var modify_flg="";
	 var pnr_number="";
	 var ticket_number="";
	 var availableAmount="";
	 var thresholdAmt="";
    console.log('approveReq func');
	if(emp_access=='F1'){
    pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,free_text_1,free_text_2,free_text_3,budgetovershoot_flg,approver_remarks,modify_flg,request_status,pnr_number,ticket_number ,hr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2 and del_flg=$3", [req_id, project_id, 'N'], function(err, empResult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            var rowData = empResult.rows;
            console.log("row", rowData);
            if (empResult.rowCount != '0') {
                var req_id = empResult.rows['0'].req_id;
                console.log("req_id", req_id);
                var empaccess=empResult.rows['0'].emp_access,
                empname = empResult.rows['0'].emp_name;
                console.log("empname", empname);
                empid = empResult.rows['0'].emp_id;
                console.log("empid", empid);
                project_id = empResult.rows['0'].project_id;
                console.log("project_id", project_id);
                from_date = empResult.rows['0'].from_date;
                to_date = empResult.rows['0'].to_date;
                from_location = empResult.rows['0'].from_location;
                to_location = empResult.rows['0'].to_location;
                request_status = empResult.rows['0'].request_status;
                approver_id = empResult.rows['0'].approver_id;
                free_text_1 = empResult.rows['0'].free_text_1;
                free_text_3 = empResult.rows['0'].free_text_3;
                free_text_2 = empResult.rows['0'].free_text_2;
                console.log("approver_id", approver_id);
                remarks = empResult.rows['0'].remarks;
                approver_remarks = empResult.rows['0'].approver_remarks;
                modify_flg = empResult.rows['0'].modify_flg;
                console.log("modify_flg:::", modify_flg);
                console.log("approver_remarks:::", approver_remarks);
				 pnr_number = empResult.rows['0'].pnr_number;
                ticket_number = empResult.rows['0'].ticket_number;
				hr_remarks=empResult.rows['0'].hr_remarks;
            }
        }
        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [empid, project_id], function(err, result2) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                console.log("result", result2);
                if(result2.rowCount!=0)
                {
                var mgrName = result2.rows['0'].emp_name;
                console.log('hii', mgrName);
            }
            }
		 pdbconnect.query("SELECT * FROM travel_master_tbl_hist where req_id =$1 and project_id=$2 and emp_id=$3 and request_status in ($4,$5) and del_flg=$6 order by lchg_time desc", [req_id, project_id, empid,'MOD','SUB','N'], function(err, modifiedList) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            
            console.log("modifiedList", modifiedListData);
            if (modifiedList.rowCount != '0') {
                var lchg_time=modifiedList.rows['0'].lchg_time;
				console.log("lchg_time", lchg_time);
            }
			var modifiedListData = modifiedList.rows;
        }     	
            //  if(to_date.length!='0')  
            // {  
            // to_date=to_date.toDateString();
            //  }  
            res.render('travelModule/canReq', {
                rowData: rowData,
                emp_id: emp_id,
                empid: empid,
                emp_name: emp_name,
                empname: empname,
                mgrName: mgrName,
                req_id: req_id,
                emp_access: emp_access,
                project_id: project_id,
                empaccess:empaccess,
                approver_id: approver_id,
                from_date: from_date,
                to_date: to_date,
                from_location: from_location,
                to_location: to_location,
                request_status: request_status,
                remarks: remarks,
                free_text_1: free_text_1,
                free_text_3: free_text_3,
                free_text_2: free_text_2,
                approver_remarks: approver_remarks,
                modify_flg : modify_flg,
				availableAmount:availableAmount,
				thresholdAmt:thresholdAmt,
				modifiedListData:modifiedListData,
				modifiedList:modifiedList,
				pnr_number:pnr_number,
				ticket_number:ticket_number,
				hr_remarks:hr_remarks
			});
            });
        });
    })
	}else{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
}
router.post('/cancelRequest', cancelRequest);


function cancelRequest(req, res) {
			console.log("cancelRequest:::cancelRequest::cancelRequest::");
	var ticket_number=req.body.ticket_number;
		var pnr_number=req.body.pnr_number;
		console.log("ticket_number", ticket_number);
		console.log("pnr_number", pnr_number);
		var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;
		
		var hr_remarks= req.body.hr_remarks;
		var now = new Date();
       
        var req_id = req.body.req_id;
        var empid = req.body.empid;
        var empname = req.body.empname;
		 var rcre_user_id = emp_id;
        var rcre_time = now;
        var lchg_user_id = emp_id;
        var lchg_time = now;
        var empaccess = req.body.empaccess;
        console.log('emp_access', emp_access);
		var empaccessOH = req.body.emp_access;
		 console.log('empaccessOH', empaccessOH);
        var project_id = req.body.project_id;
        var from_date = req.body.from_date;
        var to_date = req.body.to_date;
        var from_location = req.body.from_location;
        var to_location = req.body.to_location;
        var remarks = req.body.remarks;
        var approver_id = req.body.approver_id;
        var request_status = "";
        var approver_remarks = req.body.app_remarks;
        console.log("app_remarks:::", approver_remarks);
        var del_flg = "N";
        var confirm_flg = "Y";
        var reject_flg = "N";
        var free_text_1 = req.body.free_text_1;
        var free_text_2 = req.body.free_text_2;
        var free_text_3 = req.body.free_text_3;
    
      
        var approvedData = "";
        var pendingStatusData = "";
        var rejectedData = "";
        var confirmData = "";
		var budgetovershoot_flg="";
     
	 project_id = req.body.project_id;
	amount_refunded = req.body.amount_refunded;
	console.log("amount_refunded", amount_refunded);
    req_id = req.body.req_id;
	
	pdbconnect.query("SELECT travel_totalamt_spend FROM project_master_tbl where project_id=$1", [project_id], function(err, amtspendResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				    travel_totalamt_spend = amtspendResult.rows[0].travel_totalamt_spend;
                console.log("travel_totalamt_spend", travel_totalamt_spend);
				console.log("amount_refunded", amount_refunded);
				travel_totalamt_spend=parseInt(travel_totalamt_spend)-parseInt(amount_refunded);
				 console.log("travel_totalamt_spend:::::::", travel_totalamt_spend);
				  
			pdbconnect.query("update travel_master_tbl set refund_amount=$1, request_status=$2,lchg_time=$3,hr_remarks=$4 where req_id=$5", [amount_refunded,'CAF',lchg_time,hr_remarks,req_id], function(err, done) {
            if (err) 
            {
                   throw err;
            }else
            {
               console.log('updated successfully');
			    
            }
			pdbconnect.query("update project_master_tbl set travel_totalamt_spend=$1 where project_id=$2", [travel_totalamt_spend,project_id], function(err, done) {
            if (err) 
            {
                   throw err;
            }else
            {
               console.log('updated successfully');
            }
			success="The amount refunded and request has been cancelled for id"+req_id+".";
			   req.flash('success',"The amount refunded and request has been cancelled for id:"+ req_id +".") ;
			pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
			
                                    console.log(' project_id', project_id);
                                    pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        } else {
                                            employee_name = empResult.rows['0'].emp_name;
                                            employee_email = empResult.rows['0'].emp_email;
                                            console.log('employee name ', employee_name);
                                            console.log('employee id ', employee_email);
                                        }
                                        pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
												
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
												
											
                                            }
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											if (empaccessOH != 'L1'){
                                            var mailOptions = {
                                                to: employee_email,
                                                cc: approver_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' requested by you for cancellation  has been approved.\n' + 'Kindly discuss with HR for further clarification.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
											}
											else{
												var mailOptions = {
                                                to: employee_email,
                                               
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                 text: 'Travel Request ' + req_id + ' requested by you for cancellation  has been approved.\n' + 'Kindly discuss with HR for further clarification.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
											}
                                            var travelHrStatus =req.body.travelHrStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var queryStringDM = "";
    var paramString = "";
    var paramStringMain = "";
    var paramStringDM = "";
    
   
    if(travelHrStatus == null){
        travelHrStatus= "PEN";
    }

   if(travelHrStatus == "ALL"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1,$2,$3,$4,$5,$6,$7) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        
        paramStringMain = ['APM','APF','RJF','APD','FWD','CPF','CAF'];
    }
    else if(travelHrStatus == "PEN"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1, $2,$3) and t1.budgetovershoot_flg in ($4,$5) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['APM','APD','MOD','N','A'];
    }
    else if(travelHrStatus == "PND"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t1.budgetovershoot_flg in ($2) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['FWD','P'];
    }
    else if(travelHrStatus == "APP"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['APF'];
    }
    else if(travelHrStatus == "REJ"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['RJF'];
    }
	else if(travelHrStatus == "CAF"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['CAF'];
    }
	else if(travelHrStatus == "CPF"){
        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t1.budgetovershoot_flg, t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.del_flg='N' and t1.request_status in ($1) and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";
        
        paramStringMain = ['CPF'];
    }
 
 
 

    console.log("queryStringMain :: ", queryStringMain);
        pdbconnect.query(queryStringMain,paramStringMain, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('\n\n\nError with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("\n\n\ntravelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;

                    console.log('\n\n\n recordCount Main ::: ',recordCountMain);

        
            

        var totalRecordCount= recordCountMain;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'AQS' order by comm_code_id asc",function(err,result){
            cocd_appQueueStatus=result.rows;
            cocd_appQueueStatus_count=result.rowCount;

            
            console.log('cocd_appQueueStatus_count ::: ',cocd_appQueueStatus_count);  
        res.render('travelModule/viewTravelFinQueue',{
            
            emp_id:emp_id,
            emp_name:emp_name,
            emp_access:emp_access,

            travelReqMainList:travelReqMainList,
            cocd_appQueueStatus:cocd_appQueueStatus,
            cocd_appQueueStatus_count:cocd_appQueueStatus_count,
            travelHrStatus:travelHrStatus,
            
            recordCountMain:recordCountMain,
            totalRecordCount:totalRecordCount,
			success:success,
			
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
module.exports = router;
