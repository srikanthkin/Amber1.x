var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');

console.log('reimburseQueue');
var req_id="";
var empname="";
var empid="";
var project_id="";
var remb_id="";
var lodge_date="";
var maxCount=""; 
var hr_status="";
router.get('/reimburseQueue',reimburseQueue);


   function reimburseQueue(req,res){
var emp_id =req.user.rows[0].user_id;
var emp_name =req.user.rows[0].user_name;
var emp_access =req.user.rows[0].user_type;


  console.log("emp_id ", emp_id);
  console.log("emp_name ", emp_name);
  console.log("emp_access ", emp_access);
 
if(emp_access=='L3'||emp_access=='L2'||emp_access=='L1')
    {
  
    
	pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date,hr_status FROM reimbursement_master_tbl where repmgr_id=$1 and status=$2 and del_flg=$3 order by remb_id::integer desc",[emp_id,'pending','N'], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;
            	console.log("row",rowData);
                console.log("empResult.rowcount",empResult.rowCount);
            	
           if(empResult.rowCount!='0')
           {
            remb_id=empResult.rows['0'].remb_id;
			empid=empResult.rows['0'].emp_id;
			empname=empResult.rows['0'].emp_name;
			project_id=empResult.rows['0'].project_id;
			repmgr_id =empResult.rows['0'].repmgr_id;
			hr_id=empResult.rows['0'].hr_id;
			amt_payable=empResult.rows['0'].amt_payable;
			net_amt_payable=empResult.rows['0'].net_amt_payable;
			advance_amt=empResult.rows['0'].advance_amt;
			user_remarks =  empResult.rows['0'].user_remarks;
			manager_remarks =empResult.rows['0'].manager_remarks;
			hr_remarks=empResult.rows['0'].hr_remarks;
			status=empResult.rows['0'].status;
			lodge_date =empResult.rows['0'].lodge_date;
			document_date =empResult.rows['0'].document_date;
      hr_status=empResult.rows['0'].hr_status;

			
           }
			
		}

    console.log("before emp_id",emp_id);
pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date,hr_status FROM reimbursement_master_tbl where repmgr_id=$1 and status=$2 and del_flg=$3 order by remb_id::integer desc",[emp_id,'rejected','N'], function(err, rejectedResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowDataReject = rejectedResult.rows;
            	console.log("rowDataReject",rowDataReject);
                
            	
         
  

			
		}
		
		pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date,hr_status FROM reimbursement_master_tbl where repmgr_id=$1 and status=$2 and del_flg=$3 order by remb_id::integer desc",[emp_id,'approved','N'], function(err, approvedResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowDataApprvd = approvedResult.rows;
            	console.log("rowDataApprvd",rowDataApprvd);
                
            	
   

			
		}

   
     if(empResult.rowCount>rejectedResult.rowCount)
     {
     	console.log('Inside first if');
     	if(empResult.rowCount>approvedResult.rowCount)
     	{
              maxCount=empResult.rowCount;
              console.log('maxCount',maxCount);
     	}
     	else
     		{
                   maxCount=approvedResult.rowCount;
                   console.log('maxCount',maxCount);
     		}
     }
     else 
     {
     	console.log('Inside first else');
        if(rejectedResult.rowCount>approvedResult.rowCount)   
        {
        	console.log('Inside first elseif');
        	maxCount=rejectedResult.rowCount;
        	console.log('maxCount',maxCount);
        }   
        else
        {
        	console.log('Inside first elseelse');
        	 maxCount=approvedResult.rowCount;
        	 console.log('maxCount',maxCount);
        }

     }
console.log('maxCount',maxCount);

  res.render('reimbursementModule/reimburseQueue',{
	rowDataReject:rowDataReject,
	rowData:rowData,
	rowDataApprvd:rowDataApprvd,
  	empid:empid,
  	empname:empname,
	  emp_id:emp_id,
  	emp_name:emp_name,
  	emp_access:emp_access,
  	project_id:project_id,
  	remb_id:remb_id,
    lodge_date:lodge_date,
    maxCount:maxCount,
    hr_status:hr_status,
	 });
  	
});
});

});

  
   }else
   {
    res.redirect('/admin-dashboard/adminDashboard/admindashboard');
   }


   }


module.exports = router;
