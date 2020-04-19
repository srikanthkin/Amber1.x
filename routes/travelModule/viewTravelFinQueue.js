var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');
var proj="";
console.log('vanthuten applyLeave');

router.get('/travelHrReqQueue',viewTravelFinQueue);
router.get('/viewTravelFinQueue',viewTravelFinQueue);

function viewTravelFinQueue(req,res){
	  var emp_access =req.user.rows[0].user_type;
    console.log("inside new viewTravelFinQueue  ");
if(emp_access=='F1'){
    viewTravelFinQueueApplyStatus(req,res);
}else{
	res.redirect('/admin-dashboard/adminDashboard/admindashboard');
}
}

router.post('/viewTravelFinQueueApplyStatus', viewTravelFinQueueApplyStatus);

function viewTravelFinQueueApplyStatus(req,res){

    console.log("inside viewTravelFinQueueApplyStatus req - ", req);
    var emp_id =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var emp_name =req.user.rows[0].user_name;
    //var travelStatus =req.query.travelStatus;
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
            totalRecordCount:totalRecordCount
        });
    });
    });
   
    

  
  }




module.exports = router;