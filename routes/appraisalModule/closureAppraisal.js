var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');
console.log('vanthuten accept appraisal');


var accept_flag ='Y';



router.post('/closureAppraisal',closureAppraisal);
router.post('/closureAppraisal1',closureAppraisal1);

 function closureAppraisal(req,res){

var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;
var id = req.query.id;
  //console.log("id",id);
  var splitValues = id.split("-");
  //console.log("splitValues",splitValues);
 
  var month =splitValues[0];
  var year =splitValues[1];
 var employee_id = splitValues[2];
     var now = new Date();
   
   
   var lchgtime=now;
console.log('req value ',req.query);


var closureRemarks = req.body.closure;
var closure_rating = req.body.closure_rating;

console.log('closureRemarks value ',closureRemarks);
console.log('closure_rating value ',closure_rating);



             pdbconnect.query("UPDATE  app_entry_tbl set   lchg_time = $1, lchg_user_id = $2 , app_conf = $3 , closure_comments =$4 , closure_rating =$5 where  appraisal_month = $6 and appraisal_year =$7 and emp_id =$8",[lchgtime,emp_id ,'Y' , closureRemarks,closure_rating ,month,year,employee_id ],function(err,done){
             if(err) throw err;
              });

  res.render('appraisalModule/closureAppraisal',{
   
emp_access:emp_access,
my_name:my_name,
my_id:my_id,





});
}


 function closureAppraisal1(req,res){

var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;
var id = req.query.id;
  //console.log("id",id);
  var splitValues = id.split("-");
  //console.log("splitValues",splitValues);
 
  var month =splitValues[0];
  var year =splitValues[1];
 var employee_id = splitValues[2];
     var now = new Date();
   
   
   var lchgtime=now;
console.log('req value ',req.query);


var closureRemarks = req.body.closure1;
var closure_rating = req.body.closure_rating1;

console.log('closureRemarks value ',closureRemarks);
console.log('closure_rating value ',closure_rating);



             pdbconnect.query("UPDATE  appraisal_master_table set   lchg_time = $1, lchg_user_id = $2 , app_conf = $3 , closure_comments =$4 , closure_rating =$5 where  appraisal_month = $6 and appraisal_year =$7 and emp_id =$8",[lchgtime,emp_id ,'Y' , closureRemarks,closure_rating ,month,year,employee_id ],function(err,done){
             if(err) throw err;
              });


               pdbconnect.query("SELECT emp_email, reporting_mgr FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
             employee_email=empResult.rows['0'].emp_email;
             reporting_mgr=empResult.rows['0'].reporting_mgr;
              
              console.log('employee_email' ,employee_email);
            }        


             pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[reporting_mgr], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
             manager_email=empResult.rows['0'].emp_email;
             
              
              console.log('manager_email' ,manager_email);
            }      



             pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_access =$1  ",['A1'], function(err, hrMailList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
             
                rowData = hrMailList.rows;
               
                  for(var i=0;i<rowData.length;i++){
                console.log("Hr email id",rowData[i].emp_email);
                      emailIdList = rowData[i].emp_email;
                      if(i){
                      tempList = tempList + ',' + emailIdList;  
                      }else
                      {
                        tempList = tempList  + emailIdList;  
                      }
                      
                     
                  }
                  console.log('tempList',tempList);

            }      



              

                  var smtpTransport = nodemailer.createTransport('SMTP',{
               service: 'gmail',
               auth: 
            {
                user: 'nurtureportal',
                pass: 'nurture@123'
            }
            });
           


    var mailOptions = {
                to: tempList,
                cc: employee_email,
                from: 'nurtureportal@gmail.com',
                subject: 'Appraisal closure notification ',
                text: 'Final closure of the rejected appraisal has been done. '
                         + '\n' +

                       ' - Appraisal System'
               };


               smtpTransport.sendMail(mailOptions, function(err) {
              });

  res.render('appraisalModule/closureAppraisal',{
   
emp_access:emp_access,
my_name:my_name,
my_id:my_id,





});
  });
             });
             });
               
}
module.exports = router;