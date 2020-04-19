var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');

console.log('reqAprvd req');


	
  


  router.get('/reqAprvd',reqAprvd);
 
 var req_id="";
 

  function reqAprvd(req,res){

    var test = req.body.test;
	var hr_remarks="";
	 var id = req.query.id;
	 var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;
	var approver_remarks="";
	var budgetovershoot_flg="";
	var pnr_number="";
	var ticket_number="";
	 var empname1 ="";
	 var req_status="";
	
     var urlValue = id.split(":");
     var delvrymgr_remarks="";

	 console.log("Inside the reqAprvd event::::::::");
	 
       req_id=urlValue[0].trim();
       project_id=urlValue[1].trim();
	    empname1=urlValue[2].trim();
		if(typeof urlValue[3]==='undefined'){
		 
		}else{
			req_status=urlValue[4].trim();
		}
		if (typeof urlValue[3]==='undefined'){
			
		}
		else{
		budgetovershoot_flg=urlValue[3].trim();
		}
		if (urlValue[3] =='undefined'){
			pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status,free_text_1,free_text_2,free_text_3,approver_remarks,budgetovershoot_flg ,delvrymgr_remarks,pnr_number,ticket_number ,hr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2",[req_id,project_id], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;
            	console.log("row",rowData);
                 if(empResult.rowCount!='0')
           {	
            	
			 var req_id=empResult.rows['0'].req_id;
			console.log("req_id",req_id);
            empname=empResult.rows['0'].emp_name;
			console.log("empname",empname);
			empid=empResult.rows['0'].emp_id;
			console.log("empid",empid);
			empaccess=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			console.log("project_id",project_id);
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;

			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			console.log("approver_id:::::",approver_id);
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("free_text_1:::::",free_text_1);
			remarks =  empResult.rows['0'].remarks;
			approver_remarks =  empResult.rows['0'].approver_remarks;
			console.log("approver_remarks:::::",approver_remarks);
			budgetovershoot_flg = empResult.rows['0'].budgetovershoot_flg;
			delvrymgr_remarks=empResult.rows['0'].delvrymgr_remarks;
			console.log("delvrymgr_remarks:::::",delvrymgr_remarks);
			ticket_number=empResult.rows['0'].ticket_number;
			console.log("ticket_number:::::",ticket_number);
			pnr_number=empResult.rows['0'].pnr_number;
			console.log("pnr_number:::::",pnr_number);
			hr_remarks=empResult.rows['0'].hr_remarks;
			console.log("hr_remarks:::::",hr_remarks);
			
			
		   }
			
		}
			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [empid,project_id], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
			if (approver_id != 'NA'){
       var mgrName=result2.rows['0'].emp_name;
			}
			else
			{
			 var mgrName='NA';	
			}
	console.log('hii',mgrName);
	
			}
		 
            


  res.render('travelModule/reqDetails',{
	
	rowData:rowData,
	emp_id:emp_id,
  	empid:empid,
  	emp_name:emp_name,
  	empname:empname,
	mgrName:mgrName,
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
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	approver_remarks:approver_remarks,
	budgetovershoot_flg:budgetovershoot_flg,
	delvrymgr_remarks:delvrymgr_remarks,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	hr_remarks:hr_remarks
  	

});
});
});
		}
		else{
			          if (typeof urlValue[3]==='undefined'){
			
		               }
		                     else{
		                             budgetovershoot_flg=urlValue[3].trim();
		                      }
	
	
    var emp_id =req.user.rows[0].user_id;
	
	
	if (budgetovershoot_flg != 'A'||req_status!='CAF'){
		
	pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,approver_remarks,budgetovershoot_flg ,delvrymgr_remarks,pnr_number,ticket_number,hr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2",[req_id,project_id], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;
            	console.log("row",rowData);
                 if(empResult.rowCount!='0')
           {	
            	
			 var req_id=empResult.rows['0'].req_id;
			console.log("req_id",req_id);
            empname=empResult.rows['0'].emp_name;
			console.log("empname",empname);
			empid=empResult.rows['0'].emp_id;
			console.log("empid",empid);
			empaccess=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			console.log("project_id",project_id);
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;

			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			console.log("approver_id:::::",approver_id);
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("free_text_1:::::",free_text_1);
			remarks =  empResult.rows['0'].remarks;
			approver_remarks =  empResult.rows['0'].approver_remarks;
			console.log("approver_remarks:::::",approver_remarks);
			budgetovershoot_flg = empResult.rows['0'].budgetovershoot_flg;
			delvrymgr_remarks=empResult.rows['0'].delvrymgr_remarks;
			console.log("delvrymgr_remarks:::::",delvrymgr_remarks);
			ticket_number=empResult.rows['0'].ticket_number;
			console.log("ticket_number:::::",ticket_number);
			pnr_number=empResult.rows['0'].pnr_number;
			console.log("pnr_number:::::",pnr_number);
			hr_remarks=empResult.rows['0'].hr_remarks;
			console.log("hr_remarks:::::",hr_remarks);
			
		   }
			
		}
			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [empid,project_id], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
			if (approver_id != 'NA'){
            var mgrName=result2.rows['0'].emp_name;
			}
			else
			{
			 var mgrName='NA';	
			}
	console.log('hii',mgrName);
	
			}

		 
            


  res.render('travelModule/reqDetails',{
	
	rowData:rowData,
	emp_id:emp_id,
  	empid:empid,
  	emp_name:emp_name,
  	empname:empname,
	mgrName:mgrName,
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
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	approver_remarks:approver_remarks,
	budgetovershoot_flg:budgetovershoot_flg,
	delvrymgr_remarks:delvrymgr_remarks,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	hr_remarks:hr_remarks
  	

});
});
		
});

  }else if(budgetovershoot_flg=='A'&&urlValue[4]=='APF')
  {
	  	console.log("Inside the A and the APF event::::::::");
	pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3,approver_remarks,budgetovershoot_flg ,delvrymgr_remarks,pnr_number,ticket_number,hr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2",[req_id,project_id], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;
            	console.log("row",rowData);
                 if(empResult.rowCount!='0')
           {	
            	
			 var req_id=empResult.rows['0'].req_id;
			console.log("req_id",req_id);
            empname=empResult.rows['0'].emp_name;
			console.log("empname",empname);
			empid=empResult.rows['0'].emp_id;
			console.log("empid",empid);
			empaccess=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			console.log("project_id",project_id);
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;

			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			console.log("approver_id:::::",approver_id);
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("free_text_1:::::",free_text_1);
			remarks =  empResult.rows['0'].remarks;
			approver_remarks =  empResult.rows['0'].approver_remarks;
			console.log("approver_remarks:::::",approver_remarks);
			budgetovershoot_flg = empResult.rows['0'].budgetovershoot_flg;
			delvrymgr_remarks=empResult.rows['0'].delvrymgr_remarks;
			console.log("delvrymgr_remarks:::::",delvrymgr_remarks);
			ticket_number=empResult.rows['0'].ticket_number;
			console.log("ticket_number:::::",ticket_number);
			pnr_number=empResult.rows['0'].pnr_number;
			console.log("pnr_number:::::",pnr_number);
			hr_remarks=empResult.rows['0'].hr_remarks;
			console.log("hr_remarks:::::",hr_remarks);
			
		   }
			
		}
			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [empid,project_id], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
			if (approver_id != 'NA'){
       var mgrName=result2.rows['0'].emp_name;
			}
			else
			{
			 var mgrName='NA';	
			}
	console.log('hii',mgrName);
	
			}

		 
            


  res.render('travelModule/reqDetails',{
	
	rowData:rowData,
	emp_id:emp_id,
  	empid:empid,
  	emp_name:emp_name,
  	empname:empname,
	mgrName:mgrName,
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
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	approver_remarks:approver_remarks,
	budgetovershoot_flg:budgetovershoot_flg,
	delvrymgr_remarks:delvrymgr_remarks,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	hr_remarks:hr_remarks
  	

});
});
		
});
  }
 
  else{
	console.log("Inside the else of A and APF event::::::::");
    var emp_id =req.user.rows[0].user_id;
	console.log('approveReq func');
	     
      
	pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status,free_text_1,free_text_2,free_text_3,deliverymgr_id,delvrymgr_remarks,approver_remarks,available_budget, budgetovershoot_flg,pnr_number,ticket_number,hr_remarks FROM travel_master_tbl where req_id =$1 and project_id=$2",[req_id,project_id], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;
            	console.log("row",rowData);
                 if(empResult.rowCount!='0')
           {	
            	
			 var req_id=empResult.rows['0'].req_id;
			console.log("req_id",req_id);
            empname=empResult.rows['0'].emp_name;
			console.log("empname",empname);
			empid=empResult.rows['0'].emp_id;
			console.log("empid",empid);
			empaccess=empResult.rows['0'].emp_access;
			project_id=empResult.rows['0'].project_id;
			console.log("project_id",project_id);
			from_date =empResult.rows['0'].from_date;
			to_date =empResult.rows['0'].to_date;
			from_location =empResult.rows['0'].from_location;

			to_location =  empResult.rows['0'].to_location;
			request_status =  empResult.rows['0'].request_status;
			approver_id =  empResult.rows['0'].approver_id;
			free_text_1 =  empResult.rows['0'].free_text_1;
			free_text_3 =  empResult.rows['0'].free_text_3;
			free_text_2 =  empResult.rows['0'].free_text_2;
			console.log("free_text_1:::::",free_text_1);
			remarks =  empResult.rows['0'].remarks;
			delvrymgr_remarks=empResult.rows['0'].delvrymgr_remarks;
			 approver_remarks =empResult.rows['0'].approver_remarks;
			  available_budget =empResult.rows['0'].available_budget;
			console.log("available_budget:::::",available_budget);
			
			budgetovershoot_flg =empResult.rows['0'].budgetovershoot_flg;
			console.log("budgetovershoot_flg:::::",budgetovershoot_flg);
			ticket_number=empResult.rows['0'].ticket_number;
			console.log("ticket_number:::::",ticket_number);
			pnr_number=empResult.rows['0'].pnr_number;
			console.log("pnr_number:::::",pnr_number);
			hr_remarks=empResult.rows['0'].hr_remarks;
			console.log("hr_remarks:::::",hr_remarks);
		   }
			
		}
		
		pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [empid,project_id], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
			if(result2.rowCount!=0)
			{
			if (approver_id != 'NA'){
               var mgrName=result2.rows['0'].emp_name;
			}
			else
			{
			 var mgrName='NA';	
			}
			}
	console.log('hii',mgrName);
	
			}

		 
            


  res.render('travelModule/confirmTravel',{
	
	rowData:rowData,
	emp_id:emp_id,
  	empid:empid,
  	emp_name:emp_name,
  	empname:empname,
	mgrName:mgrName,
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
	free_text_1:free_text_1,
	free_text_3:free_text_3,
	free_text_2:free_text_2,
	delvrymgr_remarks:delvrymgr_remarks,
	approver_remarks:approver_remarks,
	available_budget:available_budget,
	budgetovershoot_flg:budgetovershoot_flg,
	ticket_number:ticket_number,
	pnr_number:pnr_number,
	hr_remarks:hr_remarks
  	
 

});

});

});
 }	
  }
   }




	


module.exports = router;