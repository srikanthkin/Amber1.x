var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');

router.get('/reimburseHrReqQueue',viewClaimFinQueue);
router.get('/viewClaimFinQueue',viewClaimFinQueue);


function viewClaimFinQueue(req,res){
    var emp_access =req.user.rows[0].user_type;
    if(emp_access=='F1')
    {
     viewClaimFinQueueApplyStatus(req,res);
   }else
   {
    res.redirect('/admin-dashboard/adminDashboard/admindashboard');
   }
   
}

router.post('/viewClaimFinQueueApplyStatus',viewClaimFinQueueApplyStatus);

function viewClaimFinQueueApplyStatus(req,res){
    var emp_id =req.user.rows[0].user_id;
    var emp_name =req.user.rows[0].user_name;
    var emp_access =req.user.rows[0].user_type;

    var claimFinStatus =req.body.claimFinStatus;
    
    if(claimFinStatus == null){
        claimFinStatus= "PEN";
    }
    
    

    var queryString = "SELECT remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, upper(status) as status , lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3, settlement_amount, settlement_paid_flg, settlement_remarks, upper(hr_status) as hr_status FROM reimbursement_master_tbl where hr_id=$1 and status='approved' and del_flg='N'" ;

    if(claimFinStatus=="PEN"){
        queryString = queryString + " and hr_status = 'pending'";
    }
    else if(claimFinStatus=="CNF"){
        queryString = queryString + " and hr_status = 'confirmed'";
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
                recordCount:recordCount
            
            });
        });
    });
}

module.exports = router;
