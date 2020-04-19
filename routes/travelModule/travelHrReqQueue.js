var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');
var proj="";
console.log('vanthuten applyLeave');


router.get('/travelHrReqQueue',travelHrReqQueue);

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
var	free_text_3="";
var	free_text_2="";
var budgetovershoot_flg="";
var deliverymgr_id="";
var approver_remarks="";
var request_status="";
var availableAmount ="";
var thresholdAmt="";


 function travelHrReqQueue(req,res){

 	var emp_id =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var emp_name =req.user.rows[0].user_name;


   
          
    


	console.log('approveReq func inside travelhrQueue');
	pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,deliverymgr_id,budgetovershoot_flg,approver_remarks FROM travel_master_tbl where request_status=$1 and del_flg=$2 and budgetovershoot_flg=$3 order by req_id desc",['APM','N','N'], function(err, pendingResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var pendingStatusData = pendingResult.rows;
            	console.log("row",pendingStatusData);
				var pendingRowCount = pendingResult.rowCount;
            	console.log("pendingRowCount",pendingRowCount);
				 if(pendingResult.rowCount!='0')
           {
				 deliverymgr_id=pendingResult.rows['0'].deliverymgr_id;
				console.log("row:::deliveryMgr_id",deliverymgr_id);
				
                
		   }

			
		}
          pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks,approver_remarks,budgetovershoot_flg FROM travel_master_tbl where budgetovershoot_flg in ($1,$2,$3) and del_flg=$4 order by req_id::integer desc",['P','A','D','N'], function(err, delvryMgrApp) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var pendingDelvryMgrApp = delvryMgrApp.rows;
            	console.log("pendingDelvryMgrApp:::",pendingDelvryMgrApp);
				if(delvryMgrApp.rowCount!=0)
				{
                budgetovershoot_flg=delvryMgrApp.rows['0'].budgetovershoot_flg;
				console.log("row:::budgetovershoot_flg::delvryMgrApp:::",budgetovershoot_flg);
				}
			if(delvryMgrApp.rowCount!=0)
              {
                console.log("inside the for loop",delvryMgrApp.rowCount)
              for(i=0;i<delvryMgrApp.rowCount;i++)
              {
                console.log("inside the for loop",delvryMgrApp.rows[i].budgetovershoot_flg);
                if(delvryMgrApp.rows[i].budgetovershoot_flg =='P')
                {
                  console.log("inside the if condition");
                  delvryMgrApp.rows[i].budgetovershoot_flg = "Pending";
                }
                else if(delvryMgrApp.rows[i].budgetovershoot_flg =='A')
                {
                   delvryMgrApp.rows[i].budgetovershoot_flg ="Approved";
                }
				else if(delvryMgrApp.rows[i].budgetovershoot_flg =='D')
                {
                   delvryMgrApp.rows[i].budgetovershoot_flg ="Declined";
                }
				
              }
            }
		}

          
				pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks,approver_remarks FROM travel_master_tbl where request_status=$1 and budgetovershoot_flg=$2 and del_flg=$3 and confrm_flg=$4 and reject_flg=$5 order by req_id::integer desc",['APM','A','N','N','N'], function(err, dlvyMgrAppdData) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var delvryMgrAppdData = dlvyMgrAppdData.rows;
            	console.log("delvryMgrAppdData:::",delvryMgrAppdData);
                			
		}

		pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks,approver_remarks FROM travel_master_tbl where request_status=$1 and del_flg=$2 and budgetovershoot_flg in ($3,$4)  order by req_id desc",['RJF','N','N','A'], function(err, rejectResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rejectedData = rejectResult.rows;
            	console.log("rejectedData",rejectedData);
         
		}
           pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks,approver_remarks,budgetovershoot_flg FROM travel_master_tbl where request_status=$1 and del_flg=$2 and budgetovershoot_flg in ($3,$4) order by req_id desc",['APF','N','N','A'], function(err, confirmResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var confirmData = confirmResult.rows;
            	console.log("confirmData",confirmData);  	
       }
	   
	   pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,deliverymgr_id,budgetovershoot_flg,approver_remarks FROM travel_master_tbl where request_status=$1 and del_flg=$2 and modify_flg=$3 and free_text_1 != ($4) order by req_id desc",['CAN','N','Y',''], function(err, cancelledResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var cancelledData = cancelledResult.rows;
            	console.log("row",cancelledData);
				var cancelledRowCount = cancelledResult.rowCount;
            	console.log("cancelledRowCount",cancelledRowCount);
				 

			
		}
		var maxCount="";
		
	 if(((pendingResult.rowCount>=delvryMgrApp.rowCount) ) && ((pendingResult.rowCount>=rejectResult.rowCount) && (pendingResult.rowCount>=confirmResult.rowCount)))
{
 maxCount=pendingResult.rowCount;
 console.log('maxCount LOOP111:::',maxCount);
}
else if(((delvryMgrApp.rowCount>=pendingResult.rowCount)) && ((delvryMgrApp.rowCount>=rejectResult.rowCount) && (delvryMgrApp.rowCount>=confirmResult.rowCount)))
{
 maxCount=delvryMgrApp.rowCount;
 console.log('maxCount LOOP2222:::',maxCount);
}

else if(((rejectResult.rowCount>=pendingResult.rowCount) && (rejectResult.rowCount>=delvryMgrApp.rowCount))&& (  (rejectResult.rowCount>=confirmResult.rowCount)))
{
 maxCount=rejectResult.rowCount;
 console.log('maxCount LOOP444:::',maxCount);
 
}
else{
 maxCount=confirmResult.rowCount;
 console.log('maxCount LOOP555:::',maxCount);
}
		console.log('maxCount AFTER LOOP:::',maxCount);

  res.render('travelModule/travelHrReqQueue',{
	
    //approvedData:approvedData,
	pendingStatusData:pendingStatusData,
	rejectedData:rejectedData,
	confirmData:confirmData,
	dlvyMgrAppdData:dlvyMgrAppdData,
	confirmResult:confirmResult,
	maxCount:maxCount,
  	emp_id:empid,
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
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	budgetovershoot_flg:budgetovershoot_flg,
	pendingDelvryMgrApp:pendingDelvryMgrApp,
	deliverymgr_id:deliverymgr_id,
	delvryMgrAppdData:delvryMgrAppdData,
	approver_remarks:approver_remarks,
	availableAmount:availableAmount,
	thresholdAmt:thresholdAmt,
	cancelledData:cancelledData
  	

});
		  
	});
	});
	});
	});
});
  });
 }




module.exports = router;