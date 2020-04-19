var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');
console.log('vanthuten forwardAppraisal');

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


router.post('/forwardAppraisal',forwardAppraisal);


  function forwardAppraisal(req,res){
    var emp_id =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var emp_name =req.user.rows[0].user_name;
var id = req.query.id;
  //console.log("id",id);
  var splitValues = id.split("-");
  //console.log("splitValues",splitValues);
  var employee_id  = splitValues[0];
  var month = splitValues[1];
  var year =splitValues[2];
     var now = new Date();
   var fwd_emp_id = req.body.fwd_emp_id;
   var forward_comments = req.body.forward_comments;
   


   var lchgtime=now;
  console.log("forward_comments ", forward_comments);
  console.log("fwd_emp_id ", fwd_emp_id);
  

 pdbconnect.query("UPDATE  app_entry_tbl set   lchg_time = $1, lchg_user_id = $2 , fwd_appraiser = $3 , emp_appraiser = $4 , fwd_comments = $5 where  appraisal_month = $6 and appraisal_year =$7 and emp_id =$8",[lchgtime,emp_id ,emp_id,fwd_emp_id, forward_comments , month,year,employee_id ],function(err,done){
             if(err) throw err;


pdbconnect.query("SELECT emp_name,emp_email FROM emp_master_tbl where emp_id =$1  ",[fwd_emp_id], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              fwd_emp_name=empResult.rows['0'].emp_name;
              fwd_emp_email = empResult.rows['0'].emp_email;
              console.log('emp_name' ,fwd_emp_name);
            }
pdbconnect.query("SELECT emp_name,emp_email FROM emp_master_tbl where emp_id =$1  ",[employee_id], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              appraisee_name=empResult.rows['0'].emp_name;
              appraisee_email = empResult.rows['0'].emp_email;
              console.log('emp_name' ,fwd_emp_name);
            }

   pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
             appraiser_email=empResult.rows['0'].emp_email;
              console.log('appraisee_email' ,appraisee_email);
     //         manager_email ='ahs.hari@gmail.com';
              
            } 
        var ccEmail = appraiser_email +',' + appraisee_email;
console.log('ccEmail' ,ccEmail);
 var smtpTransport = nodemailer.createTransport('SMTP',{
               service: 'gmail',
               auth: 
            {
                user: 'nurtureportal',
                pass: 'nurture@123'
            }
            });
           


    var mailOptions = {
                to: fwd_emp_email,
                cc: ccEmail,
                from: 'nurtureportal@gmail.com',
                subject: 'Appraisal forward notification ',
                text:  ''+ emp_name + ' - ' + emp_id + ' has forwarded the appraisal data of '+ appraisee_name + ' for the month ' + month + '-' + year +  'to you and it is waiting for your approval.\n' +
                       'Please review and get in touch with the employee and take it forward for closure. \n' + '\n' + '\n' + '\n' + '\n' +

                       ' - Appraisal System'
               };


               smtpTransport.sendMail(mailOptions, function(err) {
               });



  res.render('appraisalModule/forwardAppraisal',{
  	
    fwd_emp_id:fwd_emp_id,
    emp_access:emp_access,
    emp_id:emp_id,
    emp_name:emp_name,
    fwd_emp_name:fwd_emp_name

  });
 });
});
});
});

}



module.exports = router;