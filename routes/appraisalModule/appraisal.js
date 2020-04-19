var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();



var emp_name="";
var designation="";
var project_id="";
var app_date="";
var join_date_month="";
var join_date_year="";
//var emp_id="1408";
var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

var d = new Date();
var currentMonth =  monthNames[d.getMonth()];
var currentYear =  d.getFullYear();;


router.get('/appraisal',appraisal);


  function appraisal(req,res){
    var emp_id =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var emp_name =req.user.rows[0].user_name;
var id = req.query.id;
  //console.log("id",id);
  var splitValues = id.split("-");
  //console.log("splitValues",splitValues);
  var month = splitValues[0];
  var year =splitValues[1];

  console.log("month ", month);
  console.log("year ", year);

pdbconnect.query("SELECT reporting_mgr ,emp_name,designation,project_id,joining_date ,prev_expr_year, prev_expr_month, rcre_time FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                
              
           //console.log('got the result' ,empResult);
           emp_name=empResult.rows['0'].emp_name;
           designation=empResult.rows['0'].designation;
      project_id=empResult.rows['0'].project_id;
      prev_expr_year =empResult.rows['0'].prev_expr_year;
      prev_expr_month =empResult.rows['0'].prev_expr_month;
      joining_date =empResult.rows['0'].joining_date;
      reporting_mgr =empResult.rows['0'].reporting_mgr;
      join_date_month =  monthNames[joining_date.getMonth()];
      join_date_year =  joining_date.getFullYear();

      nur_exp_year = currentYear -join_date_year ;
      nur_exp_month = d.getMonth() - joining_date.getMonth() ;
      tot_exp_month = parseInt(nur_exp_month) + parseInt(prev_expr_month);
      add_expr_year = 0;
      add_expr_month = 0;

      if(tot_exp_month > 11 )
      {
        add_expr_year = 1;
        tot_exp_month = tot_exp_month - 12 ;

      }

      tot_exp_year  =  parseInt(nur_exp_year) + parseInt(prev_expr_year) + parseInt(add_expr_year);

}

//select * from appraisal_params where role ='TL' and del_flg ='N'

pdbconnect.query("select * from appraisal_params where role =$1 and del_flg =$2 and kpi_type =$3",[designation,'N','P'], function(err, paramResultProf) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              paramDataProf =paramResultProf.rows;
          //    console.log('paramDataProf ****' ,paramDataProf);
            }
pdbconnect.query("select * from appraisal_params where role =$1 and del_flg =$2 and kpi_type =$3",[designation,'N','B'], function(err, paramResultBehav) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              paramDataBehav =paramResultBehav.rows;
          //    console.log('paramDataBehav ****' ,paramDataBehav);
            }


pdbconnect.query("SELECT emp_name FROM emp_master_tbl where emp_id =$1  ",[reporting_mgr], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              appraiser_name =empResult.rows['0'].emp_name;
              console.log('appraiser_name' ,appraiser_name);
            }


  res.render('appRenovated/doAppraisal',{
  	id:id,
    emp_name:emp_name,
    designation:designation,
    project_id:project_id,
    emp_id:emp_id,
    emp_name:emp_name,
    rcre_time:d.toDateString(),
    nur_exp_year:nur_exp_year,
    nur_exp_month:nur_exp_month,
    tot_exp_year:tot_exp_year,
    tot_exp_month:tot_exp_month,
    appraiser_name:appraiser_name,
    emp_access:emp_access,
    paramDataProf:paramDataProf,
    paramDataBehav:paramDataBehav

  });
});
});
});
});

}



module.exports = router;