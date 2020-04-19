var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');


var remb_id="";
var empname="";
var empid="";
var project_id="";
var net_amt_payable="";
var lodge_date="";
 

router.get('/reimburseDetails',reimburseDetails);


   function reimburseDetails(req,res){
var emp_id =req.user.rows[0].user_id;
var emp_name =req.user.rows[0].user_name;
var emp_access =req.user.rows[0].user_type;


  console.log("emp_id ", emp_id);
  console.log("emp_name ", emp_name);
  console.log("emp_access ", emp_access);
 

  if(emp_access=='L3'||emp_access=='L2'||emp_access=='L1')
    {
	pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date FROM reimbursement_master_tbl where emp_id=$1 and status=$2 order by remb_id desc",[emp_id,'pending'], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowData = empResult.rows;
            	console.log("row",rowData);
              console.log("empResult.rowCount",empResult.rowCount);
            	
         if(empResult.rowCount !='0')
         {
            remb_id=empResult.rows['0'].remb_id;
			      empid=empResult.rows['0'].emp_id;
			      project_id=empResult.rows['0'].project_id;
			      net_amt_payable=empResult.rows['0'].net_amt_payable;
			      lodge_date=empResult.rows['0'].lodge_date;
		}
		}

    
pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date FROM reimbursement_master_tbl where emp_id=$1 and status=$2 and hr_status=$3 order by remb_id desc",[emp_id,'approved','pending'], function(err, approvedResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowDataApproved = approvedResult.rows;
            	console.log("rowDataApproved",rowDataApproved);
		}
		
		pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date FROM reimbursement_master_tbl where emp_id=$1 and status=$2 order by remb_id desc",[emp_id,'rejected'], function(err, rejectedResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
				
				
            	var rowDataRejected = rejectedResult.rows;
            	console.log("rowDataRejected",rowDataRejected);
		}
         
       pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date FROM reimbursement_master_tbl where emp_id=$1 and hr_status=$2 and status=$3 and settlement_paid_flg=$4 order by remb_id desc",[emp_id,'confirmed','approved','N'], function(err, confirmedResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
            	var rowDataConfirmed= confirmedResult.rows;
            	console.log("rowDataConfirmed",rowDataConfirmed);
		}
  
 pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date FROM reimbursement_master_tbl where emp_id=$1 and hr_status=$2 order by remb_id desc",[emp_id,'cancelled'], function(err, cancelledResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
            	var rowDataRejectedHR= cancelledResult.rows;
            	console.log("rowDataRejectedHR",rowDataRejectedHR);
		}
  pdbconnect.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date,settlement_amount,settlement_paid_flg FROM reimbursement_master_tbl where emp_id=$1 and hr_status=$2 order by remb_id desc",[emp_id,'confirmed'], function(err, claimsSettledResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
             
              if(claimsSettledResult.rowCount!=0)
              {
                console.log("inside the for loop",claimsSettledResult.rowCount)
              for(i=0;i<claimsSettledResult.rowCount;i++)
              {
                console.log("inside the for loop",claimsSettledResult.rows[i].settlement_paid_flg);
                if(claimsSettledResult.rows[i].settlement_paid_flg =='Y')
                {
                  console.log("inside the if condition");
                  claimsSettledResult.rows[i].settlement_paid_flg = "Paid";
                }
                else if(claimsSettledResult.rows[i].settlement_paid_flg =='N')
                {
                   claimsSettledResult.rows[i].settlement_paid_flg ="Not Paid";
                }
              }
            }
             var billSettledResult= claimsSettledResult.rows;
              console.log("billSettledResult",billSettledResult);
         }
      var maxCount="";
        
        if((empResult.rowCount>=rejectedResult.rowCount)&&(empResult.rowCount>=approvedResult.rowCount)&&(empResult.rowCount>=claimsSettledResult.rowCount))
        {
               console.log('inside first if',maxCount);
              maxCount=empResult.rowCount;
              console.log('maxCount1',maxCount);
       }
      else if((rejectedResult.rowCount>=empResult.rowCount)&&(rejectedResult.rowCount>=approvedResult.rowCount)&&(rejectedResult.rowCount>=claimsSettledResult.rowCount))
        {
                   maxCount=rejectedResult.rowCount;
                   console.log('maxCount2',maxCount);
        }
     
     else if((approvedResult.rowCount>=empResult.rowCount)&&(approvedResult.rowCount>=rejectedResult.rowCount)&&(approvedResult.rowCount>=claimsSettledResult.rowCount))  
       {
                   maxCount=approvedResult.rowCount;
                   console.log('maxCount3',maxCount);
        }
        
        else
        {
          maxCount=claimsSettledResult.rowCount;
        }

   console.log('maxCount',maxCount);


  res.render('reimbursementModule/reimburseDetails',{
	  rowDataRejected:rowDataRejected,
	  rowData:rowData,
	  rowDataApproved:rowDataApproved,
	  rowDataRejectedHR:rowDataRejectedHR,
	  rowDataConfirmed:rowDataConfirmed,
    billSettledResult:billSettledResult,
  	empid:empid,
  	empname:empname,
	  emp_id:emp_id,
  	emp_name:emp_name,
  	emp_access:emp_access,
  	project_id:project_id,
  	remb_id:remb_id,
  	net_amt_payable:net_amt_payable,
	  lodge_date:lodge_date,
    maxCount:maxCount
	 });
  	});
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
