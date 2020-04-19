var express = require('express');
var router = express.Router();
var pdbconnect = require('../../routes/database/psqldbconnect');
var app = express();
var moment=require('moment');
var nodemailer = require('nodemailer');
var proj = "";

router.get('/viewTravelReq', viewTravelReq);
var pid = "";
var pid_count = "";

var req_id="";
var empname="";
var empid="";
var project_id="";
var from_date="";
var to_date="";
var from_location="";
var to_location="";
var approver_id="";
var request_status="";
var remarks="";
var free_text_1="";
var free_text_3="";
var free_text_2="";
var request_status="";
    
function viewTravelReq(req,res){
	 var emp_access =req.user.rows[0].user_type;
    console.log("inside new viewTravelReq  ");
	if(emp_access=='L1'||emp_access=='L2'||emp_access=='L3'){
    viewTravelReqApplyStatus(req,res);
	}
	else{
	res.redirect('/admin-dashboard/adminDashboard/admindashboard');
}
}


router.post('/viewTravelReqApplyStatus', viewTravelReqApplyStatus);

function viewTravelReqApplyStatus(req,res){
    console.log("inside viewTravelReqApplyStatus req - ", req);
    var emp_id =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var emp_name =req.user.rows[0].user_name;
    //var travelStatus =req.query.travelStatus;
    var travelStatus =req.body.travelStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var paramString = "";
    console.log("inside viewTravelReqApplyStatus emp_id ::  ",emp_id);
    console.log("viewTravelReqApplyStatus travelStatus ::  ",travelStatus);


    if(travelStatus == null || travelStatus=="All"){
        queryStringTemp= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id];
    }
    else{
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id,travelStatus];
    }
    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('Error with table query', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("travelReqList :: ",travelReqList);
        }
        var recordCount="";
        recordCount=trvReqTempResult.rowCount;
        console.log('temp recordCount ::: ',recordCount);

        pdbconnect.query(queryStringMain,paramString, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('Error with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("travelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    console.log('recordCount ::: ',recordCountMain);
        var totalRecordCount= recordCountMain+recordCount;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TST' order by comm_code_id asc",function(err,result){
            cocd_travelStatus=result.rows;
            cocd_travelStatus_count=result.rowCount;

            
            console.log('cocd_travelStatus_count ::: ',cocd_travelStatus_count);  


        res.render('travelModule/viewTravelReq',{
            
            cocd_travelStatus:cocd_travelStatus,
            cocd_travelStatus_count:cocd_travelStatus_count,
            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,

            emp_id:emp_id,
            emp_name:emp_name,
            req_id:req_id,
            emp_access:emp_access,
            project_id:project_id,
            approver_id:approver_id,
            from_date:from_date,
            to_date:to_date,
            from_location:from_location,
            to_location:to_location,
            request_status:request_status,
            remarks:remarks,
            free_text_1:free_text_1,
            free_text_2:free_text_2,
            free_text_3:free_text_3,
            recordCount:recordCount,
            recordCountMain:recordCountMain,
            travelStatus:travelStatus,
            totalRecordCount:totalRecordCount
        });
    });
    });
});

}

module.exports = router;