var express = require('express');
var router = express.Router();
var pdbconnect = require('../../routes/database/psqldbconnect');
var app = express();
var moment=require('moment');
var nodemailer = require('nodemailer');
var proj = "";

router.get('/viewTravelApprQueue', viewTravelApprQueue);
var pid = "";
var pid_count = "";


var empname="";
var empid="";
var project_id="";

    
function viewTravelApprQueue(req,res){
    console.log("inside new viewTravelApprQueue  ");
	var emp_access =req.user.rows[0].user_type;
	if(emp_access=='L1'||emp_access=='L2'||emp_access=='L3'){
    viewTravelApprQueueApplyStatus(req,res);
	}else{
	res.redirect('/admin-dashboard/adminDashboard/admindashboard');
}
}


router.post('/viewTravelApprQueueApplyStatus', viewTravelApprQueueApplyStatus);

function viewTravelApprQueueApplyStatus(req,res){
    console.log("inside viewTravelApprQueueApplyStatus req - ", req);
    var emp_id =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var emp_name =req.user.rows[0].user_name;
    //var travelStatus =req.query.travelStatus;
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
            totalRecordCount:totalRecordCount
        });
    });
    });
    });
    });
}

module.exports = router;