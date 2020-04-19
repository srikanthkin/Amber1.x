var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();

console.log('vanthuten accept appraisal');


var accept_flag ='Y';



router.get('/viewAppraisalData',viewAppraisalData);
router.post('/viewAppraisalDataSearch',viewAppraisalDataSearch);



 function viewAppraisalData(req,res){

var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;



              
          pdbconnect.query("SELECT emp_name, emp_id FROM emp_master_tbl  where del_flg = $1  order by emp_name asc" ,['N'], function(err, empList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = empList.rowCount;
                empData = empList.rows;

                
                }


res.render('appraisalModule/viewAppraisalData',{
eid:req.user.rows[0].user_id,
ename:req.user.rows[0].user_name,
emp_access:emp_access,
my_id:my_id,
my_name:my_name,
empData:empData


});
});

}


 function viewAppraisalDataSearch(req,res){

var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;

var selectedId = req.body.emp_id;
var month = req.body.month;
var year = req.body.year;

console.log('selectedId',selectedId);
console.log('month',month);
console.log('year',year);

var userQuery="select emp.emp_name ,* from app_entry_tbl app , emp_master_tbl emp  where  emp.emp_id = app.emp_appraiser and  app.emp_id ='"+selectedId+"' ";

 
      if(month!=null && month){
      userQuery+="AND appraisal_month = '"+month+"'";
      console.log('userQuery',userQuery);
     }


      if(year!=null && year ){
      userQuery+=" AND appraisal_year = '"+year+"'";
      console.log('userQuery',userQuery);
     }



              
          pdbconnect.query( userQuery, function(err, appList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                
                appData = appList.rows;

                console.log('appData',appData);
                }



          pdbconnect.query( "Select emp_name from emp_master_tbl where emp_id = $1 and del_flg = $2 ",[selectedId,'N'], function(err, empNameList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                
                employeeName = empNameList.rows[0].emp_name;

                console.log('appData',appData);
                }


res.render('appraisalModule/viewAppraisalDataSearch',{

my_id:my_id,
my_name:my_name,
emp_access:emp_access,
appData:appData,
employeeName:employeeName,
selectedId:selectedId

});


});
});

}
module.exports = router;
