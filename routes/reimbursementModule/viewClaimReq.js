var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');

router.get('/viewClaimReq',viewClaimReq);

function viewClaimReq(req,res){
    var emp_access =req.user.rows[0].user_type;
    if(emp_access=='L3'||emp_access=='L2'||emp_access=='L1')
    {
    viewClaimReqApplyStatus(req,res);
   }else
   {
    res.redirect('/admin-dashboard/adminDashboard/admindashboard');
   }
}

router.post('/viewClaimReqApplyStatus',viewClaimReqApplyStatus);
function viewClaimReqApplyStatus(req,res){

    var emp_id =req.user.rows[0].user_id;
    var emp_name =req.user.rows[0].user_name;
    var emp_access =req.user.rows[0].user_type;

    var claimMStatus =req.body.claimMStatus;
    var claimFStatus =req.body.claimFStatus;
    
    
    if(claimMStatus == null){
        claimMStatus= "ALL";
    }
    if(claimFStatus == null){
        claimFStatus= "ALL";
    }
   

    console.log("claimMStatus :: ", claimMStatus);
    console.log("claimFStatus :: ", claimFStatus);
   

    var queryString = "SELECT remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, upper(status) as status , lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3, settlement_amount, settlement_paid_flg, settlement_remarks, upper(hr_status) as hr_status FROM reimbursement_master_tbl where emp_id=$1 and del_flg='N'" ;

    
    if(claimMStatus=="PEN"){
        queryString = queryString + " and status = 'pending'";
    }
    else if(claimMStatus=="APP"){
        queryString = queryString + " and status = 'approved'";
    }
    else if(claimMStatus=="REJ"){
        queryString = queryString + " and status = 'rejected'";
    }

        
        
    if(claimFStatus=="PEN"){
        queryString = queryString + " and hr_status = 'pending'";
    }
    else if(claimFStatus=="CNF"){
        queryString = queryString + " and hr_status = 'confirmed'";
    }
    else if(claimFStatus=="CAN"){
        queryString = queryString + " and hr_status = 'cancelled'";
    }
    
    

    queryString = queryString + " order by remb_id desc";

    console.log("\n\n\n queryString formation :: " + queryString);

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
        
            pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'MCS' order by comm_code_id asc",function(err,result){
                cocd_MgrClaimStatus=result.rows;
                cocd_MgrClaimStatus_count=result.rowCount;
                
                pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'FCS' order by comm_code_id asc",function(err,result){
                    cocd_FinClaimStatus=result.rows;
                    cocd_FinClaimStatus_count=result.rowCount;
            res.render('reimbursementModule/viewClaimReq',{
                emp_id:emp_id,
                emp_name:emp_name,
                emp_access:emp_access,

                claimMStatus:claimMStatus,
                claimFStatus:claimFStatus,
                

                claimsReqList:claimsReqList,
                recordCount:recordCount,
                cocd_MgrClaimStatus:cocd_MgrClaimStatus,
                cocd_MgrClaimStatus_count:cocd_MgrClaimStatus_count,
                cocd_FinClaimStatus:cocd_FinClaimStatus,
                cocd_FinClaimStatus_count:cocd_FinClaimStatus_count
                
            });
        });
      });
    });
}

module.exports = router;
