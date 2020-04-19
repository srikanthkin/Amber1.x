var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');
var proj="";
console.log('vanthuten applyLeave');


router.get('/travelempDetails',travelempDetails);

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

 function travelempDetails(req,res){

 	var emp_id =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var emp_name =req.user.rows[0].user_name;

	console.log('approveReq func ');
	pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3 FROM travel_master_tbl_temp where emp_id=$1 and request_status in ($2,$3) and del_flg=$4 order by req_id::integer desc",[emp_id,'SUB','MOD','N'], function(err, pendingResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var pendingStatusData = pendingResult.rows;
            	console.log("row",pendingStatusData);
                
         
			
		}
          

          pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks FROM travel_master_tbl where emp_id=$1 and request_status=$2 and del_flg=$3  order by req_id::integer desc",[emp_id,'APM','N'], function(err, approvedResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var approvedData = approvedResult.rows;
            	console.log("approvedData",approvedData);
                
         
			
		}
		 pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks FROM travel_master_tbl where emp_id=$1 and request_status=$2 and del_flg=$3  order by req_id::integer desc",[emp_id,'APM','N'], function(err, approvedResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var approvedData = approvedResult.rows;
            	console.log("approvedData",approvedData);
                
         
			
		}
		
		pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks FROM travel_master_tbl where emp_id=$1 and request_status in ($2,$3) and del_flg=$4 order by req_id::integer desc",[emp_id,'RJM','RJD','N'], function(err, rejectResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rejectedData = rejectResult.rows;
            	console.log("rejectedData",rejectedData);
                
          
			
		}

           

           pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks FROM travel_master_tbl where emp_id=$1 and request_status=$2 and del_flg=$3 order by req_id::integer desc",[emp_id,'APF','N'], function(err, confirmResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var confirmData = confirmResult.rows;
            	console.log("confirmData",confirmData);
                
            	
         
   
			
		}

		 pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks FROM travel_master_tbl where emp_id=$1 and request_status=$2 and del_flg=$3 order by req_id::integer desc",[emp_id,'RJF','N'], function(err, hrRejectResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var hrRejectedData = hrRejectResult.rows;
            	console.log("hrRejectedData",hrRejectedData);
                
            	
		}
		 pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks FROM travel_master_tbl where emp_id=$1 and request_status=$2 and del_flg=$3 order by req_id::integer desc",[emp_id,'CAN','N'], function(err, cancelledResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var cancelledData = cancelledResult.rows;
            	console.log("cancelledData",cancelledData);
                
            	
		}
	var maxCount="";
		
		 if(((pendingResult.rowCount>=approvedResult.rowCount) && (pendingResult.rowCount>=rejectResult.rowCount)) && ((pendingResult.rowCount>=confirmResult.rowCount) &&  (pendingResult.rowCount>=hrRejectResult.rowCount)))
			{
				maxCount=pendingResult.rowCount;
				console.log('maxCount AFTER LOOP11:::',maxCount);
			}
			else if(((approvedResult.rowCount>=pendingResult.rowCount) && (approvedResult.rowCount>=rejectResult.rowCount)) && ((approvedResult.rowCount>=confirmResult.rowCount) && (approvedResult.rowCount>=hrRejectResult.rowCount)))
			{
				maxCount=approvedResult.rowCount;
				console.log('maxCount AFTER22 LOOP:::',maxCount);
			}
			else if(((rejectResult.rowCount>=pendingResult.rowCount) && (rejectResult.rowCount>=approvedResult.rowCount)) && ((rejectResult.rowCount>=confirmResult.rowCount) && (rejectResult.rowCount>=hrRejectResult.rowCount)))
			{
			
				maxCount=rejectResult.rowCount;
				console.log('maxCount AFTER33 LOOP:::',maxCount);
			}
			else if(((confirmResult.rowCount>=pendingResult.rowCount) && (confirmResult.rowCount>=approvedResult.rowCount))&& ((confirmResult.rowCount>=rejectResult.rowCount) && (confirmResult.rowCount>=hrRejectResult.rowCount)))
			{
				maxCount=confirmResult.rowCount;
				console.log('maxCount AFTER44 LOOP:::',maxCount);
 
			}
			else{
				maxCount=hrRejectResult.rowCount;
				console.log('maxCount AFTER55 LOOP:::',maxCount);
			}
		console.log('maxCount AFTER LOOP66:::',maxCount);

  res.render('travelModule/travelempDetails',{
	
    approvedData:approvedData,
	pendingStatusData:pendingStatusData,
	rejectedData:rejectedData,
	confirmData:confirmData,
	hrRejectedData:hrRejectedData,
	cancelledData:cancelledData,
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
	maxCount:maxCount
  	});
	});
});
});
	});
	});
	});
});
  }




module.exports = router;