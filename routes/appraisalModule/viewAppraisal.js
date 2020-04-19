var express = require('express');
var router = express.Router();
var app = express();
var pdbconnect=require('../../routes/database/psqldbconnect');
var rowData ="";
//var emp_id ="1408";

router.get('/viewAppraisal',function(req,res){

var emp_id =req.user.rows[0].user_id;
var ename =req.user.rows[0].user_name;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;
  console.log('req value ',req.user.rows[0].user_id);
    console.log('emp_access',req.user.rows[0].user_type);


console.log('vanthuten viewAppraisal');
pdbconnect.query("SELECT APPRAISAL_MONTH, APPRAISAL_YEAR FROM app_entry_tbl where emp_id =$1 and app_flg =$2 and app_conf =$3 and rej_flg = $4" ,[emp_id,'Y','Y','N'], function(err, result) {
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


pdbconnect.query("SELECT APPRAISAL_MONTH, APPRAISAL_YEAR FROM app_entry_tbl where emp_id =$1 and app_flg =$2 and app_conf =$3 and rej_flg=$4" ,[emp_id,'N','N','N'], function(err, resultNotApproved) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                
              rowDataNotApproved = resultNotApproved.rows;

            //  for(var i=0;i<rowData.length;i++){
            //    console.log("row",rowData[0].appraisal_month)
            //  }
              console.log("row",rowDataNotApproved)
           console.log('usersCount',usersCount);
           //console.log('rowData',rowData['0'].APPRAISAL_MONTH);
          } 

pdbconnect.query("SELECT APPRAISAL_MONTH, APPRAISAL_YEAR FROM app_entry_tbl where emp_id =$1 and app_flg =$2 and app_conf=$3 and rej_flg=$4" ,[emp_id,'Y','N','N'], function(err, resultNotAccepted) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = resultNotAccepted.rowCount
              rowDataNotAccepted = resultNotAccepted.rows;

            //  for(var i=0;i<rowData.length;i++){
            //    console.log("row",rowData[0].appraisal_month)
            //  }
              console.log("row",rowDataNotAccepted)
           console.log('usersCount',usersCount);
           //console.log('rowData',rowData['0'].APPRAISAL_MONTH);
          } 

//REJECTED APPRAISALS
          pdbconnect.query("SELECT APPRAISAL_MONTH, APPRAISAL_YEAR FROM app_entry_tbl where emp_id =$1 and app_flg =$2 and app_conf=$3 and rej_flg=$4" ,[emp_id,'Y','N','Y'], function(err, resultRejected) {
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

//REJECTED APPRAISALS AND CLOSED
          pdbconnect.query("SELECT APPRAISAL_MONTH, APPRAISAL_YEAR FROM app_entry_tbl where emp_id =$1 and app_flg =$2 and app_conf=$3 and rej_flg=$4" ,[emp_id,'Y','Y','Y'], function(err, resultClosed) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = resultClosed.rowCount
              rowDataClosed = resultClosed.rows;

            //  for(var i=0;i<rowData.length;i++){
            //    console.log("row",rowData[0].appraisal_month)
            //  }
              console.log("row",rowDataClosed)
           console.log('usersCount',usersCount);
           //console.log('rowData',rowData['0'].APPRAISAL_MONTH);
          } 


          
  res.render('appraisalModule/viewAppraisal',{
eid:emp_id,
ename:ename,
emp_access:emp_access,
rowData:rowData,
rowDataNotAccepted:rowDataNotAccepted,
rowDataNotApproved:rowDataNotApproved,
emp_access:emp_access,
my_name:my_name,
my_id:my_id,
rowDataRejected:rowDataRejected,
rowDataClosed:rowDataClosed
  });
        
    });
});
});

});

});
});
module.exports = router;
