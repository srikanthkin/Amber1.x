var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');

console.log('travel details');
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
var approverid=""; 
var approver_remarks="";

router.get('/travelDetail',travelDetail);


   function travelDetail(req,res){
var emp_id =req.user.rows[0].user_id;
var emp_name =req.user.rows[0].user_name;
var emp_access =req.user.rows[0].user_type;


  console.log("emp_id ", emp_id);
  console.log("emp_name ", emp_name);
  console.log("emp_access ", emp_access);
 

    
	pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks FROM travel_master_tbl_temp where approver_id=$1 and request_status in ($2,$3) and del_flg=$4 order by req_id::integer desc",[emp_id,'SUB','MOD','N'], function(err, empResult1) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult1.rows;
            	console.log("row",rowData);
                console.log("empResult.rowcount",empResult1.rowCount);
            	
           if(empResult1.rowCount!='0')
           {
            empname=empResult1.rows['0'].emp_name;
			empid=empResult1.rows['0'].emp_id;
			project_id=empResult1.rows['0'].project_id;
			from_date =empResult1.rows['0'].from_date;
			to_date =empResult1.rows['0'].to_date;
			from_location =empResult1.rows['0'].from_location;

			to_location =  empResult1.rows['0'].to_location;
			request_status =  empResult1.rows['0'].request_status;
			approver_id =  empResult1.rows['0'].approver_id;
			remarks =  empResult1.rows['0'].remarks;
           }
			
		}
		

    console.log("before emp_id",emp_id);
pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks,approver_remarks FROM travel_master_tbl where approver_id=$1 and request_status=$2 and del_flg=$3  order by req_id::integer desc",[emp_id,'RJM','N'], function(err, empResult2) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowDataReject = empResult2.rows;
            	console.log("rowDataReject",rowDataReject);
                
			
		}
		
		pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks,approver_remarks FROM travel_master_tbl where approver_id=$1 and request_status=$2 and del_flg=$3 order by req_id::integer desc",[emp_id,'APM','N'], function(err, empResult3) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowDataApprvd = empResult3.rows;
            	console.log("rowDataApprvd",rowDataApprvd);
                
            	
         
  			
		}
	pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks,approver_remarks FROM travel_master_tbl where deliveryMgr_id=$1 and budgetovershoot_flg=$2 and del_flg=$3 order by req_id::integer desc",[emp_id,'P','N'], function(err, empResult4) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var pendingMgrApp = empResult4.rows;
            	console.log("pendingMgrApp",pendingMgrApp);
                
            
			
		}
		
		pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks,approver_remarks FROM travel_master_tbl where deliveryMgr_id=$1 and budgetovershoot_flg in ($2,$3) and del_flg=$4 order by req_id::integer desc",[emp_id,'A','D','N'], function(err, empResult5) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var appDisrow = empResult5.rows;
            	console.log("appDisrow",appDisrow);
                
            
			
		}

	var maxCount="";
	 console.log("empResult.rowcount",empResult1.rowCount);
		console.log("empResult2 rowcount",empResult2.rowCount);
	console.log("empResult3 rowcount",empResult3.rowCount);
	console.log("pendingMgrApp rowcount",empResult4.rowCount);
	console.log("empResult5 rowcount",empResult5.rowCount);
	if(((empResult1.rowCount>=empResult2.rowCount) && (empResult1.rowCount>=empResult3.rowCount)) && ((empResult1.rowCount>=empResult4.rowCount) &&  (empResult1.rowCount>=empResult5.rowCount)))
		{
			maxCount=empResult1.rowCount;
		}
		else if(((empResult2.rowCount>=empResult1.rowCount) && (empResult2.rowCount>=empResult3.rowCount)) && ((empResult2.rowCount>=empResult4.rowCount) && (empResult2.rowCount>=empResult5.rowCount)))
		{
			maxCount=empResult2.rowCount;
		}
		else if(((empResult3.rowCount>=empResult1.rowCount) && (empResult3.rowCount>=empResult2.rowCount)) && ((empResult3.rowCount>=empResult4.rowCount) && (empResult3.rowCount>=empResult5.rowCount)))
		{

			maxCount=empResult3.rowCount;
		}
		else if(((empResult4.rowCount>=empResult1.rowCount) && (empResult4.rowCount>=empResult2.rowCount))&& ((empResult4.rowCount>=empResult3.rowCount) && (empResult4.rowCount>=empResult5.rowCount)))
		{
			maxCount=empResult4.rowCount;
 
		}
		else{
			maxCount=empResult5.rowCount;
		}
		console.log(' maxCount',maxCount);



  res.render('travelModule/travelDetail',{
	rowDataReject:rowDataReject,
	rowData:rowData,
	rowDataApprvd:rowDataApprvd,
  	empid:empid,
  	empname:empname,
	emp_id:emp_id,
  	emp_name:emp_name,
  	emp_access:emp_access,
  	project_id:project_id,
  	approver_id:approver_id,
    from_date:from_date,
    to_date:to_date,
  	from_location:from_location,
  	to_location:to_location,
	request_status:request_status,
	remarks:remarks,
	maxCount:maxCount,
	pendingMgrApp:pendingMgrApp,
	appDisrow:appDisrow,
	approver_remarks:approver_remarks
	 });
	 
  	});
});
});

});
});




   }


module.exports = router;