var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();


//var emp_id = "1408";


var monthNames = ["JAN","FEB","MAR", "APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

var d = new Date();

d.setMonth(d.getMonth() + 5);

var prevMonth =  monthNames[d.getMonth()];
var prevMonthYear =  d.getFullYear();

d.setMonth(d.getMonth() + 6);
var oneBfrPrevMonth =  monthNames[d.getMonth()];
var oneBfrPrevYear =  d.getFullYear();

var currentYear =  d.getFullYear();

var index =0;
var monthArrays=[];
var yearArrays=[];


router.get('/doAppraisal', doAppraisal);


  function doAppraisal(req,res){
    var emp_id =req.user.rows[0].user_id;
    var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;
    index=0;
var emp_access =req.user.rows[0].user_type;
pdbconnect.query("SELECT * FROM app_entry_tbl where emp_id =$1 and LOWER(appraisal_month) = LOWER($2) and appraisal_year =$3",[emp_id,prevMonth,prevMonthYear], function(err, result) {
            if (result.rowCount ==0) {
              console.log('no record for the month 1',prevMonth);
              monthArrays[index] = prevMonth;
              yearArrays[index] = prevMonthYear;
              index++;
          }
          console.log('index the month 1',index);
        
  

pdbconnect.query("SELECT * FROM app_entry_tbl where emp_id =$1 and LOWER(appraisal_month) = LOWER($2) and appraisal_year =$3",[emp_id,oneBfrPrevMonth,oneBfrPrevYear], function(err, result) {
            if (result.rowCount ==0) {
              console.log('no record for the month 2',oneBfrPrevMonth);
              monthArrays[index] = oneBfrPrevMonth;
              yearArrays[index] = oneBfrPrevYear;
              index++;
          }
          console.log('index the month 2',index);
        

           res.render('appraisalModule/doAppraisal',{
		ename:req.user.rows['0'].user_name,
                eid:req.user.rows['0'].user_id,
		emp_access:req.user.rows['0'].user_type,
		monthArrays:monthArrays,
    		yearArrays:yearArrays,
    		my_name:my_name,
    		my_id:my_id,
    		index:index

    });
    });
  });

 

}

module.exports = router;
