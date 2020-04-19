var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');

console.log('reimburseHrReqQueue');
var req_id="";

var empname="";
var empid="";
var project_id="";
var remb_id="";
var lodge_date="";
 var hr_status="";

router.get('/reimburseHrReqQueue',reimburseHrReqQueue);


   function reimburseHrReqQueue(req,res){
var emp_id =req.user.rows[0].user_id;
var emp_name =req.user.rows[0].user_name;
var emp_access =req.user.rows[0].user_type;


  console.log("emp_id ", emp_id);
  console.log("emp_name ", emp_name);
  console.log("emp_access ", emp_access);
 
if(emp_access=='F1')
    {
   
    
	pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status,hr_status, lodge_date, document_date FROM reimbursement_master_tbl where hr_id=$1 and status=$2 and del_flg=$3 and hr_status=$4 order by remb_id::integer desc",[emp_id,'approved','N','pending'], function(err, empResult) {
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
      hr_status=empResult.rows['0'].hr_status
			
           }
			
		}

    console.log("before emp_id",emp_id);
pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status,hr_status ,lodge_date, document_date FROM reimbursement_master_tbl where hr_id=$1 and hr_status=$2 and del_flg=$3 order by remb_id::integer desc",[emp_id,'cancelled','N'], function(err, rejectedResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowDataReject = rejectedResult.rows;
            	console.log("rowDataReject",rowDataReject);
		}
		
		pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status,hr_status, lodge_date, document_date FROM reimbursement_master_tbl where hr_id=$1 and hr_status=$2 and del_flg=$3 and settlement_paid_flg=$4 order by remb_id::integer desc",[emp_id,'confirmed','N','N'], function(err, approvedResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowDataApprvd = approvedResult.rows;
            	console.log("rowDataApprvd",rowDataApprvd);	
		}

    pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status,hr_status, lodge_date, document_date FROM reimbursement_master_tbl where hr_id=$1 and hr_status=$2 and settlement_paid_flg=$3 and del_flg=$4 order by remb_id::integer desc",[emp_id,'confirmed','Y','N'], function(err, amtPaidResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
        
        
              var amtPaidResultData = amtPaidResult.rows;
              console.log("amtPaidResult",amtPaidResult.rowCount);
              console.log("amtPaidResult",amtPaidResultData); 
    }

var maxCount="";
        
        if((empResult.rowCount>=rejectedResult.rowCount)&&(empResult.rowCount>=approvedResult.rowCount)&&(empResult.rowCount>=amtPaidResult.rowCount))
        {
               console.log('inside first if',maxCount);
              maxCount=empResult.rowCount;
              console.log('maxCount1',maxCount);
       }
      else if((rejectedResult.rowCount>=empResult.rowCount)&&(rejectedResult.rowCount>=approvedResult.rowCount)&&(rejectedResult.rowCount>=amtPaidResult.rowCount))
        {
                   maxCount=rejectedResult.rowCount;
                   console.log('maxCount2',maxCount);
        }
     
     else if((approvedResult.rowCount>=empResult.rowCount)&&(approvedResult.rowCount>=rejectedResult.rowCount)&&(approvedResult.rowCount>=amtPaidResult.rowCount))  
       {
                   maxCount=approvedResult.rowCount;
                   console.log('maxCount3',maxCount);
        }
        
        else
        {
          maxCount=amtPaidResult.rowCount;
        }

   console.log('maxCount',maxCount);


  res.render('reimbursementModule/reimburseHrReqQueue',{
	  rowDataReject:rowDataReject,
	  rowData:rowData,
	  rowDataApprvd:rowDataApprvd,
    amtPaidResultData:amtPaidResultData,
  	empid:empid,
  	empname:empname,
	  emp_id:emp_id,
  	emp_name:emp_name,
  	emp_access:emp_access,
  	project_id:project_id,
  	remb_id:remb_id,
    lodge_date:lodge_date,
    maxCount:maxCount,
    hr_status:hr_status
	 });
  	
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
