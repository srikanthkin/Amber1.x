var express = require('express');
var router = express.Router();
var app = express();
var pdbconnect=require('../../routes/database/psqldbconnect');
//var emp_id = "1408";


var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

var d = new Date();



router.get('/approveAppraisal',function(req,res){
var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;
//select emp_id, appraisal_month,appraisal_year from Appraisal_master_table where app_flg ='Y' and emp_appraiser ='1408'
//select app.emp_id, app.appraisal_month,app.appraisal_year, emp.emp_name from Appraisal_master_table app, emp_master_tbl emp where app_flg ='Y' and emp_appraiser ='1408' and emp.emp_id = app.emp_id

 console.log('vanthuten approveAppraisal');
pdbconnect.query("select app.emp_id, app.appraisal_month,app.appraisal_year, emp.emp_name from app_entry_tbl app, emp_master_tbl emp where app_flg =$1 and emp_appraiser =$2 and rej_flg=$3 and emp.emp_id = app.emp_id" ,['N',emp_id,'N'], function(err, result) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = result.rowCount
            	rowData = result.rows;

            //	for(var i=0;i<rowData.length;i++){
            //		console.log("row",rowData[0].appraisal_month)
            //	}
            	console.log("row",rowData)
           console.log('usersCount',usersCount);
           //console.log('rowData',rowData['0'].APPRAISAL_MONTH);
          }	


  pdbconnect.query("select app.emp_id, app.appraisal_month,app.appraisal_year, emp.emp_name from app_entry_tbl app, emp_master_tbl emp where app_flg =$1 and emp_appraiser =$2 and rej_flg=$3  and emp.emp_id = app.emp_id" ,['Y',emp_id,'N'], function(err, resultAlreadyApproved) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = resultAlreadyApproved.rowCount
              rowDataAlreadyApproved = resultAlreadyApproved.rows;

            //  for(var i=0;i<rowData.length;i++){
            //    console.log("row",rowData[0].appraisal_month)
            //  }
              console.log("row",rowDataAlreadyApproved)
           console.log('usersCount',usersCount);
           //console.log('rowData',rowData['0'].APPRAISAL_MONTH);
          } 
         pdbconnect.query("select app.emp_id, app.appraisal_month,app.appraisal_year, emp.emp_name from app_entry_tbl app, emp_master_tbl emp where app_flg =$1 and emp_appraiser =$2 and rej_flg=$3 and app_conf=$4 and emp.emp_id = app.emp_id" ,['Y',emp_id,'Y','N'], function(err, resultRejected) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = resultRejected.rowCount
              rowDataRejected = resultRejected.rows;

            //  for(var i=0;i<rowData.length;i++){
            //    console.log("row",rowData[0].appraisal_month)
            //  }
              console.log("row",rowDataRejected)
           console.log('usersCount',usersCount);
           //console.log('rowData',rowData['0'].APPRAISAL_MONTH);
          } 

           pdbconnect.query("select app.emp_id, app.appraisal_month,app.appraisal_year, emp.emp_name from app_entry_tbl app, emp_master_tbl emp where app_flg =$1 and emp_appraiser =$2 and rej_flg=$3 and app_conf=$4 and emp.emp_id = app.emp_id" ,['Y',emp_id,'Y','Y'], function(err, resultClosed) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = resultClosed.rowCount
              rowDataRejectedClosed = resultClosed.rows;

            //  for(var i=0;i<rowData.length;i++){
            //    console.log("row",rowData[0].appraisal_month)
            //  }
              console.log("row",rowDataRejectedClosed)
           console.log('usersCount',usersCount);
           //console.log('rowData',rowData['0'].APPRAISAL_MONTH);
          } 
        

          
  res.render('appraisalModule/approveAppraisal',{
eid:req.user.rows[0].user_id,
ename:req.user.rows[0].user_name,
emp_access:req.user.rows[0].user_type,
usersCount:usersCount,
rowData:rowData,
rowDataAlreadyApproved:rowDataAlreadyApproved,
rowDataRejected:rowDataRejected,
rowDataRejectedClosed:rowDataRejectedClosed,

my_name:my_name,
my_id:my_id
  });
        
    });

});
});
});
});


module.exports = router;
