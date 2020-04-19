var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');
var proj="";


router.get('/requestStatus',requestStatus);
 

 var req_id="";
 var project_id="";
 var empname="";
 var emp_name="";
 var emp_Name="";
var empid="";
var emp_access="";
var project_id="";
var from_date="";
var to_date="";
var from_location="";
var to_location="";
var approver_id="";
var request_status="";
var remarks="";
var empName="";
var pnr_number="";
var ticket_number="";
var hr_remarks="";

  function requestStatus(req,res){
    var test = req.body.test;
    var id = req.query.id;
    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var empname = req.user.rows[0].user_name;
    var approver_remarks="";
	var emp_Name="";
	var from_date="";
var to_date="";
var from_location="";
var to_location="";
	console.log('id',id);
	console.log('approveReq func ');
	console.log('emp_Name::::::::',emp_Name);
	console.log('emp_access::::::::',emp_access);
	if(emp_access=='L1'||emp_access=='L2'||emp_access=='L3'){
    var urlValue = id.split(":");
		var emp_name="";
       req_id=urlValue[0].trim();
       project_id=urlValue[1].trim();
       if(typeof urlValue[2] === 'undefined')
       {
		   console.log("11111111111::::::");
	console.log('req_id',req_id);
	console.log('req_id',req_id.length);
	console.log('project_id',project_id);
	console.log('req_id',project_id.length);
	pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,pnr_number,ticket_number ,hr_remarks FROM travel_master_tbl_temp where req_id =$1 and project_id=$2 and del_flg=$3",[req_id,project_id,'N'], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;

            	console.log("row",rowData);
                
           if(empResult.rowCount!='0')
           {
			req_id=empResult.rows['0'].req_id;
            empname=empResult.rows['0'].emp_name;
			empid=empResult.rows['0'].emp_id;
			emp_access=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;

			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("approver_id",approver_id);
			remarks =  empResult.rows['0'].remarks;
			pnr_number =  empResult.rows['0'].pnr_number;
			ticket_number =  empResult.rows['0'].ticket_number;
			hr_remarks=empResult.rows['0'].hr_remarks;
			}
            //from_date=from_date.toDateString();
            //to_date=to_date.toDateString();
			
		}
		pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,pnr_number,ticket_number,hr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2 and del_flg=$3",[req_id,project_id,'N'], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;

            	console.log("row",rowData);
                
           if(empResult.rowCount!='0')
           {
			req_id=empResult.rows['0'].req_id;
            empname=empResult.rows['0'].emp_name;
			empid=empResult.rows['0'].emp_id;
			emp_access=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;

			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("approver_id",approver_id);
			remarks =  empResult.rows['0'].remarks;
			pnr_number =  empResult.rows['0'].pnr_number;
			ticket_number =  empResult.rows['0'].ticket_number;
			hr_remarks=empResult.rows['0'].hr_remarks;
			}
            //from_date=from_date.toDateString();
            //to_date=to_date.toDateString();
			
		}
		
		

            pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2 and del_flg=$3)", [emp_id,project_id,'N'], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
            //var empName = result2.rows;
		   if(result2.rowCount!='0')
           {
             empName=result2.rows['0'].emp_name;
            console.log("empName", empName);
		   }
        }
		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TMC'  order by comm_code_id asc", function(err, result1) {
                    comm_code_tmc = result1.rows;
                    comm_code_tmc_count = result1.rowCount;
                    console.log("comm_code_tmc::", comm_code_tmc);
                    console.log("comm_code_tmc_count:::", comm_code_tmc_count);
                   
  	     console.log("from_location:::in 111:", from_location);
                    console.log("to_location::: in 1:;::", to_location);  
console.log("emp_access22222222", emp_access);


  res.render('travelModule/travelRequestDetails',{
	
	rowData:rowData,
  	emp_id:empid,
  	emp_Name:emp_Name,
  	emp_name:empname,
  	empName:empName,
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
	approver_remarks:approver_remarks,
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	comm_code_tmc:comm_code_tmc,
	comm_code_tmc_count: comm_code_tmc_count,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	hr_remarks:hr_remarks
  	});
		});
});
});
});
}
else if(urlValue[2]=='M'&&urlValue[3]=='p')
{   
	var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_Name = req.user.rows[0].user_name;
    console.log('emp_access::::::::',emp_access);
	var pendingFlg="";
	var approver_remarks="";
	var modifyFlg=urlValue[2].trim();
	if(urlValue[3].trim()!='')
	{
		 pendingFlg=urlValue[3].trim();
	}
	console.log("2222222222::::::");
 console.log("Inside the else condition");
 console.log('req_id',req_id);
	console.log('req_id',req_id.length);
	console.log('project_id',project_id);
	console.log('req_id',project_id.length);
    
       
         
         
          pdbconnect.query("SELECT project_allocation_date,emp_project_relieving_date from project_alloc_tbl where project_id=$1 and emp_id=$2 and del_flg=$3", [project_id,emp_id,'N'], function(err, locresult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            
            var project_allocation_date=locresult.rows['0'].project_allocation_date;
            var relieving_date=locresult.rows['0'].emp_project_relieving_date;
            var  resultList = locresult.rows;
            console.log("project_allocation_date", project_allocation_date);
            console.log("relieving_date", relieving_date);
          }



	pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,pnr_number,ticket_number,hr_remarks FROM travel_master_tbl_temp where req_id =$1 and project_id=$2 and del_flg=$3",[req_id,project_id,'N'], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;

            	console.log("row",rowData);
                
           if(empResult.rowCount!='0')
           {
			req_id=empResult.rows['0'].req_id;
            empname=empResult.rows['0'].emp_name;
			empid=empResult.rows['0'].emp_id;
			empaccess=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;

			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("approver_id",approver_id);
			remarks =  empResult.rows['0'].remarks;
			pnr_number =  empResult.rows['0'].pnr_number;
			ticket_number =  empResult.rows['0'].ticket_number;
			hr_remarks=empResult.rows['0'].hr_remarks;
			}
            
		}
		

            pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2 and del_flg=$3)", [emp_id,project_id,'N'], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
           // var empName = result2.rows;
		    if(result2.rowCount!='0')
           {
             empName=result2.rows['0'].emp_name;
            console.log("empName", empName);
		   }

        }
         console.log('emp_access::::::::',emp_access);
		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TMC'  order by comm_code_id asc", function(err, result1) {
                    comm_code_tmc = result1.rows;
                    comm_code_tmc_count = result1.rowCount;
                    console.log("comm_code_tmc::", comm_code_tmc);
                    console.log("comm_code_tmc_count:::", comm_code_tmc_count);
                   

  res.render('travelModule/modifyTravelDetails',{
	
	rowData:rowData,
  	emp_id:empid,
  	emp_Name:emp_Name,
  	emp_name:empname,
  	empName:empName,
	req_id:req_id,
	emp_access:emp_access,
	empaccess:empaccess,
  	project_id:project_id,
  	approver_id:approver_id,
    from_date:from_date,
    to_date:to_date,
  	from_location:from_location,
  	to_location:to_location,
	request_status:request_status,
	remarks:remarks,
	approver_remarks:approver_remarks,
	modifyFlg:modifyFlg,
	pendingFlg:pendingFlg,
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	resultList:resultList,
	comm_code_tmc:comm_code_tmc,
	comm_code_tmc_count: comm_code_tmc_count,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	hr_remarks:hr_remarks
  	});
});
});
});
});

}
  }else{
	  res.redirect('/admin-dashboard/adminDashboard/admindashboard');
  }
 }
router.get('/requestCancelStatus',requestCancelStatus);
 

 var req_id="";
 var project_id="";
 var empname="";
 var emp_name="";
 var emp_Name="";
var empid="";
var emp_access="";
var project_id="";
var from_date="";
var to_date="";
var from_location="";
var to_location="";
var approver_id="";
var request_status="";
var remarks="";
var empName="";
var pnr_number="";
var ticket_number="";
var status_flg="";
var free_text_1="";
var free_text_2="";
var free_text_3="";
var hr_remarks="";
  function requestCancelStatus(req,res){
    var test = req.body.test;
    var id = req.query.id;
    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_Name = req.user.rows[0].user_name;
    var approver_remarks="";
	console.log('id',id);
	console.log('approveReq func ');
	console.log('emp_Name::::::::',emp_Name);
	console.log('emp_access::::::::',emp_access);
    var urlValue = id.split(":");
     
	if(emp_access=='L1'||emp_access=='L2'||emp_access=='L3'){
       req_id=urlValue[0].trim();
       project_id=urlValue[1].trim();
       status_flg=urlValue[2].trim();
	   console.log('status_flg',status_flg);
	console.log('req_id',req_id);
	console.log('req_id',req_id.length);
	console.log('project_id',project_id);
	console.log('req_id',project_id.length);
	if (status_flg == 'P'){
	pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,pnr_number,ticket_number,hr_remarks FROM travel_master_tbl_temp where req_id =$1 and project_id=$2 and del_flg=$3",[req_id,project_id,'N'], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;

            	console.log("row",rowData);
                
           if(empResult.rowCount!='0')
           {
			req_id=empResult.rows['0'].req_id;
            empname=empResult.rows['0'].emp_name;
			empid=empResult.rows['0'].emp_id;
			emp_access=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;
			console.log("from_date:::sri",from_date);
			console.log("to_date:::sri",to_date);
			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("approver_id",approver_id);
			remarks =  empResult.rows['0'].remarks;
			pnr_number =  empResult.rows['0'].pnr_number;
			ticket_number =  empResult.rows['0'].ticket_number;
			hr_remarks=empResult.rows['0'].hr_remarks;
			}
			
          
			}
			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2 and del_flg=$3)", [emp_id,project_id,'N'], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
           // var empName = result2.rows;
		    if(result2.rowCount!='0')
           {
             empName=result2.rows['0'].emp_name;
            console.log("empName", empName);
		   }

        }
		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TMC'  order by comm_code_id asc", function(err, result1) {
                    comm_code_tmc = result1.rows;
                    comm_code_tmc_count = result1.rowCount;
                    console.log("comm_code_tmc::", comm_code_tmc);
                    console.log("comm_code_tmc_count:::", comm_code_tmc_count);
                   
  	    
console.log("emp_access22222222", emp_access);

 /* from_date=from_date.toDateString();
	if (to_date != 	null){
            to_date=to_date.toDateString();
			}else{
			to_date="";
			}
	*/		console.log("from_date:::status_flg::H:",from_date);
			console.log("to_date:::status_flg::H:",to_date);
			
			
			
  res.render('travelModule/cancelTravelDetails',{
	
	rowData:rowData,
  	emp_id:empid,
  	emp_Name:emp_Name,
  	emp_name:empname,
  	empName:empName,
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
	approver_remarks:approver_remarks,
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	comm_code_tmc:comm_code_tmc,
	comm_code_tmc_count: comm_code_tmc_count,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	status_flg:status_flg,
	hr_remarks:hr_remarks
  	
});
});
});
	});
	}
			else if (status_flg == 'M'){
				pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,pnr_number,ticket_number,hr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2 and del_flg=$3",[req_id,project_id,'N'], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;

            	console.log("row",rowData);
                
           if(empResult.rowCount!='0')
           {
			req_id=empResult.rows['0'].req_id;
            empname=empResult.rows['0'].emp_name;
			empid=empResult.rows['0'].emp_id;
			emp_access=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;
			console.log("from_date:::sri",from_date);
			console.log("to_date:::sri",to_date);
			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("approver_id",approver_id);
			remarks =  empResult.rows['0'].remarks;
			pnr_number =  empResult.rows['0'].pnr_number;
			ticket_number =  empResult.rows['0'].ticket_number;
			hr_remarks=empResult.rows['0'].hr_remarks;
			}
			
            
           //from_date=from_date.toDateString();
          if (to_date != 	null){
            //to_date=to_date.toDateString();
			}else{
			//to_date="";
			}
			console.log("from_date:::status_flg::H:",from_date);
			console.log("to_date:::status_flg::H:",to_date);
			
			}
			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2 and del_flg=$3)", [emp_id,project_id,'N'], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
           // var empName = result2.rows;
		    if(result2.rowCount!='0')
           {
             empName=result2.rows['0'].emp_name;
            console.log("empName", empName);
		   }

        }
		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TMC'  order by comm_code_id asc", function(err, result1) {
                    comm_code_tmc = result1.rows;
                    comm_code_tmc_count = result1.rowCount;
                    console.log("comm_code_tmc::", comm_code_tmc);
                    console.log("comm_code_tmc_count:::", comm_code_tmc_count);
                   
  	      
console.log("emp_access22222222", emp_access);


  res.render('travelModule/cancelTravelDetails',{
	
	rowData:rowData,
  	emp_id:empid,
  	emp_Name:emp_Name,
  	emp_name:empname,
  	empName:empName,
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
	approver_remarks:approver_remarks,
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	comm_code_tmc:comm_code_tmc,
	comm_code_tmc_count: comm_code_tmc_count,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	status_flg:status_flg,
	hr_remarks:hr_remarks
  	
});
});
});
			});
		}
		else if (status_flg == 'H'){
				pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,pnr_number,ticket_number ,hr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2 and del_flg=$3",[req_id,project_id,'N'], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;

            	console.log("row",rowData);
                
           if(empResult.rowCount!='0')
           {
			req_id=empResult.rows['0'].req_id;
            empname=empResult.rows['0'].emp_name;
			empid=empResult.rows['0'].emp_id;
			emp_access=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;
			console.log("from_date:::sri",from_date);
			console.log("to_date:::sri",to_date);
			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("approver_id",approver_id);
			remarks =  empResult.rows['0'].remarks;
			pnr_number =  empResult.rows['0'].pnr_number;
			ticket_number =  empResult.rows['0'].ticket_number;
			hr_remarks=empResult.rows['0'].hr_remarks;
			}
			
            
         //   from_date=from_date.toDateString();
          // if (to_date != 	null){
         //   to_date=to_date.toDateString();
			//}else{
			//to_date="";
			//}
			console.log("from_date:::status_flg::H:",from_date);
			console.log("to_date:::status_flg::H:",to_date);
			
			}
			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2 and del_flg=$3)", [emp_id,project_id,'N'], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
           // var empName = result2.rows;
		    if(result2.rowCount!='0')
           {
             empName=result2.rows['0'].emp_name;
            console.log("empName", empName);
		   }
        }
		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TMC'  order by comm_code_id asc", function(err, result1) {
                    comm_code_tmc = result1.rows;
                    comm_code_tmc_count = result1.rowCount;
                    console.log("comm_code_tmc::", comm_code_tmc);
                    console.log("comm_code_tmc_count:::", comm_code_tmc_count);
                   
  	      
console.log("emp_access22222222", emp_access);


  res.render('travelModule/cancelTravelDetails',{
	
	rowData:rowData,
  	emp_id:empid,
  	emp_Name:emp_Name,
  	emp_name:empname,
  	empName:empName,
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
	approver_remarks:approver_remarks,
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	comm_code_tmc:comm_code_tmc,
	comm_code_tmc_count: comm_code_tmc_count,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	status_flg:status_flg,
	hr_remarks:hr_remarks
  	
});
});
});
			});
		}

       }else{
	  res.redirect('/admin-dashboard/adminDashboard/admindashboard');
  }     

 } 
 
router.get('/requestStatusHr',requestStatusHr);

   function requestStatusHr(req,res){
    var test = req.body.test;
    var id = req.query.id;
    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_Name = req.user.rows[0].user_name;
	var pnr_number="";
	var free_text_1="";
	var free_text_2="";
	var free_text_3="";
	var from_location="";
	var to_location="";
	var ticket_number="";
	var emp_name="";
	var empaccess="";
    console.log('emp_access::::::::',emp_access);
	console.log('id',id);
	console.log('approveReq func ');
	console.log('emp_Name::::::::',emp_Name);
	if(emp_access=='L1'||emp_access=='L2'||emp_access=='L3'){
    var urlValue = id.split(":");
     

       req_id=urlValue[0].trim();
       project_id=urlValue[1].trim();
		
	console.log('req_id',req_id);
	console.log('req_id',req_id.length);
	console.log('project_id',project_id);
	console.log('req_id',project_id.length);
	if(typeof urlValue[2] === 'undefined'&&typeof urlValue[3] === 'undefined')
       {
       	console.log('inside where no values passed');
	pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,approver_remarks,pnr_number,ticket_number,hr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2 and del_flg=$3",[req_id,project_id,'N'], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;

            	console.log("row",rowData);
                
            if(empResult.rowCount!='0')
           {	
			req_id=empResult.rows['0'].req_id;
            empname=empResult.rows['0'].emp_name;
			empid=empResult.rows['0'].emp_id;
			empaccess=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;

			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			approver_remarks =empResult.rows['0'].approver_remarks;
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("approver_id",approver_id);
			remarks =  empResult.rows['0'].remarks;
			pnr_number =  empResult.rows['0'].pnr_number;
			ticket_number =  empResult.rows['0'].ticket_number;
			hr_remarks=empResult.rows['0'].hr_remarks;
			
           // from_date=from_date.toDateString();
           // to_date=to_date.toDateString();
		}	
		}
		

            pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id = $1",[approver_id],function(err,result){
		 if (err) {
                console.error('Error with table query', err);
            } else {
            	if(result.rowCount!=0)
            	{
        empName=result.rows['0'].emp_name;
	console.log('hii',empName);
}
			}
  	      
console.log("emp_access111111111", emp_access);


  res.render('travelModule/travelRequestDetails',{
	
	rowData:rowData,
  	emp_id:empid,
  	emp_Name:emp_Name,
  	emp_name:empname,
  	empName:empName,
	empaccess:empaccess,
	req_id:req_id,
	emp_access:emp_access,
  	project_id:project_id,
  	approver_id:approver_id,
    from_date:from_date,
    to_date:to_date,
  	from_location:from_location,
  	to_location:to_location,
	request_status:request_status,
	approver_remarks:approver_remarks,
	remarks:remarks,
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	hr_remarks:hr_remarks
  	
});
});
});
  }
 if(urlValue[2]=='M'&& typeof urlValue[3]==='undefined')
{
	var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_Name = req.user.rows[0].user_name;
	var modifyFlg=urlValue[2].trim();
	var pendingFlg ="";
	console.log('emp_access::::::::',emp_access);
 console.log("Inside the else condition");
 console.log('req_id',req_id);
	console.log('req_id',req_id.length);
	console.log('project_id',project_id);
	console.log('req_id',project_id.length);

	 pdbconnect.query("SELECT project_allocation_date,emp_project_relieving_date from project_alloc_tbl where project_id=$1 and emp_id=$2 and del_flg=$3", [project_id,emp_id,'N'], function(err, locresult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            
            var project_allocation_date=locresult.rows['0'].project_allocation_date;
            var relieving_date=locresult.rows['0'].emp_project_relieving_date;
            var  resultList = locresult.rows;
            console.log("project_allocation_date", project_allocation_date);
            console.log("relieving_date", relieving_date);
          }
	pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,approver_remarks,pnr_number,ticket_number,hr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2 and del_flg=$3",[req_id,project_id,'N'], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
            	var rowData = empResult.rows;
            	console.log("row",rowData);
            if(empResult.rowCount!='0')
           {	
			req_id=empResult.rows['0'].req_id;
            empname=empResult.rows['0'].emp_name;
			empid=empResult.rows['0'].emp_id;
			empaccess=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;

			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			approver_remarks=empResult.rows['0'].approver_remarks;
			console.log("approver_id",approver_id);
			remarks =  empResult.rows['0'].remarks;
			pnr_number =  empResult.rows['0'].pnr_number;
			ticket_number =  empResult.rows['0'].ticket_number;
			hr_remarks=empResult.rows['0'].hr_remarks;
		}	
			
		}
		

             pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id = $1",[approver_id],function(err,result){
		 if (err) {
                console.error('Error with table query', err);
            } else {
				 if(result.rowCount!='0')
           {
        empName=result.rows['0'].emp_name;
	console.log('hii',empName);
		   }
			}
  	        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TMC'  order by comm_code_id asc", function(err, result1) {
                    comm_code_tmc = result1.rows;
                    comm_code_tmc_count = result1.rowCount;
                    console.log("comm_code_tmc::", comm_code_tmc);
                    console.log("comm_code_tmc_count:::", comm_code_tmc_count);
                   
  	      
console.log("emp_access2222222", emp_access);


  res.render('travelModule/modifyTravelDetails',{
	
	rowData:rowData,
  	emp_id:empid,
  	emp_Name:emp_Name,
  	emp_name:empname,
  	empName:empName,
	empaccess:empaccess,
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
	pendingFlg:pendingFlg,
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	modifyFlg:modifyFlg,
	approver_remarks:approver_remarks,
  	resultList:resultList,
	comm_code_tmc:comm_code_tmc,
	comm_code_tmc_count:comm_code_tmc_count,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	hr_remarks:hr_remarks
  });
  });
});
});
});

}
else if(urlValue[3]=='h'&&urlValue[2]=='M')
{   
	var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_Name = req.user.rows[0].user_name;
	var pendingFlg="";
	var approver_remarks="";
	var hr_remarks="";
	var modifyFlg=urlValue[2].trim();
	if(urlValue[3].trim()!='')
	{
		 pendingFlg=urlValue[3].trim();
	}
 console.log("Inside the else condition");
 console.log('req_id',req_id);
	console.log('req_id',req_id.length);
	console.log('project_id',project_id);
	console.log('req_id',project_id.length);
     pdbconnect.query("SELECT project_allocation_date,emp_project_relieving_date from project_alloc_tbl where project_id=$1 and emp_id=$2 and del_flg=$3", [project_id,emp_id,'N'], function(err, locresult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            
            var project_allocation_date=locresult.rows['0'].project_allocation_date;
            var relieving_date=locresult.rows['0'].emp_project_relieving_date;
            var  resultList = locresult.rows;
            console.log("project_allocation_date", project_allocation_date);
            console.log("relieving_date", relieving_date);
          }


	pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3 ,pnr_number,ticket_number ,hr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2 and del_flg=$3",[req_id,project_id,'N'], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;

            	console.log("row",rowData);
                
           if(empResult.rowCount!='0')
           {
			req_id=empResult.rows['0'].req_id;
            empname=empResult.rows['0'].emp_name;
			empid=empResult.rows['0'].emp_id;
			emp_access=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;

			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("approver_id",approver_id);
			remarks =  empResult.rows['0'].remarks;
			pnr_number =  empResult.rows['0'].pnr_number;
			ticket_number =  empResult.rows['0'].ticket_number;
			hr_remarks=empResult.rows['0'].hr_remarks;
			}
            //from_date=from_date.toDateString();
            //to_date=to_date.toDateString();
			
		}
		

            pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id,project_id], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
           // var empName = result2.rows;
		   				 if(result2.rowCount!='0')
           {
             empName=result2.rows['0'].emp_name;
            console.log("empName", empName);
		   }
        }
		pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TMC'  order by comm_code_id asc", function(err, result1) {
                    comm_code_tmc = result1.rows;
                    comm_code_tmc_count = result1.rowCount;
                    console.log("comm_code_tmc::", comm_code_tmc);
                    console.log("comm_code_tmc_count:::", comm_code_tmc_count);
  	      
  console.log("emp_access333333333", emp_access);


  res.render('travelModule/modifyTravelDetails',{
	
	rowData:rowData,
  	emp_id:empid,
  	emp_Name:emp_Name,
  	emp_name:empname,
  	empName:empName,
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
	approver_remarks:approver_remarks,
	modifyFlg:modifyFlg,
	pendingFlg:pendingFlg,
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
  	resultList:resultList,
	comm_code_tmc:comm_code_tmc,
	comm_code_tmc_count:comm_code_tmc_count,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	hr_remarks:hr_remarks
	
  });
  });
});
});
});

}

else if(urlValue[3]=='AP'&&urlValue[2]=='OH')
{   
	var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_Name = req.user.rows[0].user_name;
	var pendingFlg="";
	var approver_remarks="";
	var modifyFlg=urlValue[2].trim();
	if(urlValue[3].trim()!='')
	{
		 pendingFlg=urlValue[3].trim();
	}
 console.log("Inside the else condition");
 console.log('req_id',req_id);
	console.log('req_id',req_id.length);
	console.log('project_id',project_id);
	console.log('req_id',project_id.length);
     

	pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,pnr_number,ticket_number,hr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2 and del_flg=$3",[req_id,project_id,'N'], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;

            	console.log("row",rowData);
                
           if(empResult.rowCount!='0')
           {
			req_id=empResult.rows['0'].req_id;
            empname=empResult.rows['0'].emp_name;
			empid=empResult.rows['0'].emp_id;
			emp_access=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;
			console.log("from_location::&&&&:::",from_location);
			to_location =  empResult.rows['0'].to_location;
			console.log("TO_location::&&&&:::",to_location);
			console.log("approver_id",approver_id);
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("approver_id",approver_id);
			remarks =  empResult.rows['0'].remarks;
			pnr_number =  empResult.rows['0'].pnr_number;
			ticket_number =  empResult.rows['0'].ticket_number;
			hr_remarks =empResult.rows['0'].hr_remarks;
			}
            //from_date=from_date.toDateString();
            //to_date=to_date.toDateString();
			
		}
		



  res.render('travelModule/modifyTravelDetails',{
	
	rowData:rowData,
  	emp_id:empid,
  	emp_Name:emp_Name,
  	emp_name:empname,
  	empName:empName,
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
	approver_remarks:approver_remarks,
	modifyFlg:modifyFlg,
	pendingFlg:pendingFlg,
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	hr_remarks:hr_remarks
  	
  });
});


}
else if(urlValue[3]=='HR'&&urlValue[2]=='OH')
{   
	var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_Name = req.user.rows[0].user_name;
	var pendingFlg="";
	var approver_remarks="";
	var hr_remarks="";
	var modifyFlg=urlValue[2].trim();
	if(urlValue[3].trim()!='')
	{
		 pendingFlg=urlValue[3].trim();
	}
 console.log("Inside the else condition");
 console.log('req_id',req_id);
	console.log('req_id',req_id.length);
	console.log('project_id',project_id);
	console.log('req_id',project_id.length);
     

	pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,pnr_number,ticket_number ,hr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2",[req_id,project_id,'N'], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;

            	console.log("row",rowData);
                
           if(empResult.rowCount!='0')
           {
			req_id=empResult.rows['0'].req_id;
            empname=empResult.rows['0'].emp_name;
			empid=empResult.rows['0'].emp_id;
			emp_access=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;

			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("approver_id",approver_id);
			remarks =  empResult.rows['0'].remarks;
			pnr_number =  empResult.rows['0'].pnr_number;
			ticket_number =  empResult.rows['0'].ticket_number;
			hr_remarks=empResult.rows['0'].hr_remarks;
			}
            //from_date=from_date.toDateString();
            //to_date=to_date.toDateString();
			
		}
		



  res.render('travelModule/modifyTravelDetails',{
	
	rowData:rowData,
  	emp_id:empid,
  	emp_Name:emp_Name,
  	emp_name:empname,
  	empName:empName,
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
	approver_remarks:approver_remarks,
	modifyFlg:modifyFlg,
	pendingFlg:pendingFlg,
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	hr_remarks:hr_remarks
  	
  });
});


   }
   }
   else{
	   res.redirect('/admin-dashboard/adminDashboard/admindashboard');
   }
}

router.get('/requestCancelStatusHr',requestCancelStatusHr);

   function requestCancelStatusHr(req,res){
    var test = req.body.test;
    var id = req.query.id;
    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_Name = req.user.rows[0].user_name;
	var pnr_number="";
	var free_text_1="";
	var free_text_2="";
	var free_text_3="";
	var from_location="";
	var to_location="";
	var ticket_number="";
	var emp_name="";
	var status_flg="";
	var hr_remarks="";
    console.log('emp_access::::::::',emp_access);
	console.log('id',id);
	console.log('approveReq func ');
	console.log('emp_Name::::::::',emp_Name);
	if(emp_access=='L1'||emp_access=='L2'||emp_access=='L3'){
    var urlValue = id.split(":");
     

       req_id=urlValue[0].trim();
       project_id=urlValue[1].trim();
		status_flg=urlValue[2].trim();
		console.log('status_flg::',status_flg);
	console.log('req_id',req_id);
	console.log('req_id',req_id.length);
	console.log('project_id',project_id);
	console.log('req_id',project_id.length);
		if(status_flg=='AP'){
       	console.log('inside where no values passed');
	pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,approver_remarks,pnr_number,ticket_number,hr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2 and del_flg=$3",[req_id,project_id,'N'], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;

            	console.log("row",rowData);
                
            if(empResult.rowCount!='0')
           {	
			req_id=empResult.rows['0'].req_id;
            empname=empResult.rows['0'].emp_name;
			empid=empResult.rows['0'].emp_id;
			empaccess=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;

			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			approver_remarks =empResult.rows['0'].approver_remarks;
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("approver_id",approver_id);
			remarks =  empResult.rows['0'].remarks;
			pnr_number =  empResult.rows['0'].pnr_number;
			ticket_number =  empResult.rows['0'].ticket_number;
			hr_remarks=empResult.rows['0'].hr_remarks;
			
           // from_date=from_date.toDateString();
           // to_date=to_date.toDateString();
		}	
		}
		

            pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id = $1",[approver_id],function(err,result){
		 if (err) {
                console.error('Error with table query', err);
            } else {
            	if(result.rowCount!=0)
            	{
        empName=result.rows['0'].emp_name;
	console.log('hii',empName);
}
			}
  	      
console.log("emp_access111111111", emp_access);
//from_date=from_date.toDateString();
         
			console.log("from_date:::status_flg::H:",from_date);
			console.log("to_date:::status_flg::H:",to_date);
			
			
  res.render('travelModule/cancelTravelDetails',{
	
	rowData:rowData,
  	emp_id:empid,
  	emp_Name:emp_Name,
  	emp_name:empname,
  	empName:empName,
	empaccess:empaccess,
	req_id:req_id,
	emp_access:emp_access,
  	project_id:project_id,
  	approver_id:approver_id,
    from_date:from_date,
    to_date:to_date,
  	from_location:from_location,
  	to_location:to_location,
	request_status:request_status,
	approver_remarks:approver_remarks,
	remarks:remarks,
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	status_flg:status_flg,
	hr_remarks:hr_remarks
  	
});
});
});

		}
		if(status_flg=='HR'){
       	console.log('inside where no values passed');
	pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,approver_remarks,pnr_number,ticket_number,hr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2 and del_flg=$3",[req_id,project_id,'N'], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;

            	console.log("row",rowData);
                
            if(empResult.rowCount!='0')
           {	
			req_id=empResult.rows['0'].req_id;
            empname=empResult.rows['0'].emp_name;
			empid=empResult.rows['0'].emp_id;
			empaccess=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;

			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			approver_remarks =empResult.rows['0'].approver_remarks;
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("approver_id",approver_id);
			remarks =  empResult.rows['0'].remarks;
			pnr_number =  empResult.rows['0'].pnr_number;
			ticket_number =  empResult.rows['0'].ticket_number;
			hr_remarks=empResult.rows['0'].hr_remarks;
			
           // from_date=from_date.toDateString();
           // to_date=to_date.toDateString();
		}	
		}
		

            pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id = $1",[approver_id],function(err,result){
		 if (err) {
                console.error('Error with table query', err);
            } else {
            	if(result.rowCount!=0)
            	{
        empName=result.rows['0'].emp_name;
	console.log('hii',empName);
}
			}
  	      
console.log("emp_access111111111", emp_access);
//from_date=from_date.toDateString();
    if (to_date != 	null){
           // to_date=to_date.toDateString();
			}else{
			//to_date="";
			}       
			console.log("from_date:::status_flg::H:",from_date);
			console.log("to_date:::status_flg::H:",to_date);
			console.log("free_text_1:",free_text_1);
			

  res.render('travelModule/cancelTravelDetails',{
	
	rowData:rowData,
  	emp_id:empid,
  	emp_Name:emp_Name,
  	emp_name:empname,
  	empName:empName,
	empaccess:empaccess,
	req_id:req_id,
	emp_access:emp_access,
  	project_id:project_id,
  	approver_id:approver_id,
    from_date:from_date,
    to_date:to_date,
  	from_location:from_location,
  	to_location:to_location,
	request_status:request_status,
	approver_remarks:approver_remarks,
	remarks:remarks,
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	status_flg:status_flg,
	hr_remarks:hr_remarks
  	
});
});
});

		}
}
   else{
	   res.redirect('/admin-dashboard/adminDashboard/admindashboard');
   }

}

module.exports = router;