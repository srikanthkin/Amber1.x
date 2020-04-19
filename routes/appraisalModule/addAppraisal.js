var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');
console.log('vanthuten add appraisal');

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


router.post('/addAppraisal', addAppraisal);
router.post('/addAppraisal1', addAppraisal1);


  function addAppraisal(req,res){

var emp_id =req.user.rows[0].user_id;
     var now = new Date();
   
   var rcretime=now;
      var rcretimeToDateString=rcretime.toDateString();
   var lchgtime=now;
console.log('req value ',req.query);

//var emp_id ='1408';
var emp_appraiser = '';

var emp_access =req.user.rows[0].user_type;
var emp_name =req.user.rows[0].user_name;

var id = req.query.id;
var splitValues = id.split("-");
  //console.log("splitValues",splitValues);
  var appraisal_month = splitValues[0];
  var appraisal_year =splitValues[1];


var ability_at_pos_emp = req.body.ability;
var attendence_emp = req.body.attendance;
var leadership_quality_emp = req.body.lAbility;
var ability_meet_deadlines_emp  = req.body.deadlines;
var technical_skills_emp = req.body.skills;
var quality_of_work_emp = req.body.qow;
var team_work_skills_emp = req.body.teamWork;
var emp_comments = req.body.empConcerns;
var future_goals = req.body.goals;

var ability_at_pos_emp_rmks = req.body.abilityRemarks_emp;
var attendence_emp_rmks = req.body.attendanceRemarks_emp;
var leadership_quality_emp_rmks = req.body.lAbilityRemarks_emp;
var ability_meet_deadlines_emp_rmks  = req.body.deadlinesRemarks_emp;
var technical_skills_emp_rmks = req.body.skillsRemarks_emp;
var quality_of_work_emp_rmks = req.body.qowRemarks_emp;
var team_work_skills_em_rmks = req.body.temaAbilityRemarks_emp;



var app_flg = 'N';
//var rcre_time =rcretime.toDateString();
//var lchg_user_id ='1408';
console.log('ability_at_pos_emp ',ability_at_pos_emp);
console.log('attendence_emp ',attendence_emp);
console.log('leadership_quality_emp ',leadership_quality_emp);
console.log('ability_meet_deadlines_emp ',ability_meet_deadlines_emp);
console.log('technical_skills_emp ',technical_skills_emp);
console.log('team_work_skills_emp ',team_work_skills_emp);
console.log('emp_comments ',emp_comments);

pdbconnect.query("SELECT emp_email , reporting_mgr ,emp_name,designation,project_id,joining_date ,prev_expr_year, prev_expr_month, rcre_time FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
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
      employee_email = empResult.rows['0'].emp_email;
      console.log('employee_email' ,employee_email);
      //employee_email = 'hari.nurture@gmail.com';
    console.log('employee_email' ,employee_email);

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



pdbconnect.query("SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              emp_appraiser=empResult.rows['0'].reporting_mgr;
              console.log('emp_appraiser' ,emp_appraiser);
            }


   pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[emp_appraiser], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
             manager_email=empResult.rows['0'].emp_email;
              console.log('manager_email' ,manager_email);
     //         manager_email ='ahs.hari@gmail.com';
              console.log('manager_email' ,manager_email);
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
                to: manager_email,
                cc: employee_email,
                from: 'nurtureportal@gmail.com',
                subject: 'Appraisal submission notification ',
                text: 'Employee ' + emp_name + ' - ' + emp_id + ' has submitted his/her appraisal for the month ' + appraisal_month + '-' + appraisal_year +  ' and its waiting for your approval.\n' +
                       'Please review and get in touch with the employee and take it forward for closure. \n' + '\n' + '\n' + '\n' + '\n' +

                       ' - Appraisal System'
               };


               smtpTransport.sendMail(mailOptions, function(err) {
               });


             pdbconnect.query("INSERT INTO appraisal_master_table(emp_id, emp_appraiser, appraisal_month, appraisal_year, ability_at_pos_emp, attendence_emp, leadership_quality_emp, ability_meet_deadlines_emp, technical_skills_emp, quality_of_work_emp, team_work_skills_emp, emp_comments, future_goals, app_flg, rcre_time, lchg_time, lchg_user_id,ability_at_pos_rmks_emp,attendence_rmks_emp,leadership_quality_rmks_emp,ability_meet_deadlines_rmks_emp,technical_skills_rmks_emp,quality_of_work_rmks_emp,team_work_skills_rmks_emp,app_conf,rej_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)",[emp_id,emp_appraiser,appraisal_month,appraisal_year,ability_at_pos_emp,attendence_emp,leadership_quality_emp,ability_meet_deadlines_emp,technical_skills_emp,quality_of_work_emp,team_work_skills_emp,emp_comments,future_goals,app_flg,rcretime,lchgtime,emp_id,ability_at_pos_emp_rmks,attendence_emp_rmks,leadership_quality_emp_rmks,ability_meet_deadlines_emp_rmks,technical_skills_emp_rmks,quality_of_work_emp_rmks,team_work_skills_em_rmks,'N','N'],function(err,done){
             if(err) throw err;
              });
           
  res.render('appraisalModule/addAppraisal',{
    id:id,

emp_appraiser:emp_appraiser,
 appraisal_month:appraisal_month,
appraisal_year:appraisal_year,


 ability_at_pos_emp:ability_at_pos_emp,
 attendence_emp:attendence_emp,
 leadership_quality_emp:leadership_quality_emp,
 ability_meet_deadlines_emp:ability_meet_deadlines_emp,
 technical_skills_emp:technical_skills_emp,
 quality_of_work_emp:quality_of_work_emp,
 team_work_skills_emp:team_work_skills_emp,
 emp_comments:emp_comments,
 future_goals:future_goals,

 ability_at_pos_rmks_emp:ability_at_pos_emp_rmks,  
 attendence_rmks_emp:attendence_emp_rmks,
 leadership_quality_rmks_emp:leadership_quality_emp_rmks, 
 ability_meet_deadlines_rmks_emp:ability_meet_deadlines_emp_rmks,
 technical_skills_rmks_emp:technical_skills_emp_rmks,
 quality_of_work_rmks_emp:quality_of_work_emp_rmks,
 team_work_skills_rmks_emp:team_work_skills_em_rmks,
    emp_access:emp_access,
    rcre_time:rcretimeToDateString,
    emp_name:emp_name,
     designation:designation,
      project_id:project_id,
      prev_expr_year:prev_expr_year,
      prev_expr_month:prev_expr_month,
      joining_date:joining_date,
      reporting_mgr:reporting_mgr,
      join_date_month:join_date_month,
      join_date_year:join_date_year,

      nur_exp_year:nur_exp_year,
      nur_exp_month:nur_exp_month,
      tot_exp_month:tot_exp_month,
   emp_id:emp_id,
    tot_exp_year:tot_exp_year,
    emp_name:emp_name


  });

});
});
});
}

 function addAppraisal1(req,res){

var emp_id =req.user.rows[0].user_id;
     var now = new Date();
   
   var rcretime=now;
      var rcretimeToDateString=rcretime.toDateString();
   var lchgtime=now;
console.log('req value ',req.query);

//var emp_id ='1408';
var emp_appraiser = '';

var emp_access =req.user.rows[0].user_type;
var emp_name =req.user.rows[0].user_name;

var id = req.query.id;
var splitValues = id.split("-");
  //console.log("splitValues",splitValues);
  var appraisal_month = splitValues[0];
  var appraisal_year =splitValues[1];


var ability_at_pos_emp = req.body.ability1;
var attendence_emp = req.body.attendance1;
var leadership_quality_emp = req.body.lAbility1;
var ability_meet_deadlines_emp  = req.body.deadlines1;
var technical_skills_emp = req.body.skills1;
var quality_of_work_emp = req.body.qow1;
var team_work_skills_emp = req.body.teamWork1;
var emp_comments = req.body.empConcerns1;
var future_goals = req.body.goals1;

var ability_at_pos_emp_rmks = req.body.abilityRemarks_emp1;
var attendence_emp_rmks = req.body.attendanceRemarks_emp1;
var leadership_quality_emp_rmks = req.body.lAbilityRemarks_emp1;
var ability_meet_deadlines_emp_rmks  = req.body.deadlinesRemarks_emp1;
var technical_skills_emp_rmks = req.body.skillsRemarks_emp1;
var quality_of_work_emp_rmks = req.body.qowRemarks_emp1;
var team_work_skills_em_rmks = req.body.temaAbilityRemarks_emp1;



var app_flg = 'N';
//var rcre_time =rcretime.toDateString();
//var lchg_user_id ='1408';
console.log('ability_at_pos_emp ',ability_at_pos_emp);
console.log('attendence_emp ',attendence_emp);
console.log('leadership_quality_emp ',leadership_quality_emp);
console.log('ability_meet_deadlines_emp ',ability_meet_deadlines_emp);
console.log('technical_skills_emp ',technical_skills_emp);
console.log('team_work_skills_emp ',team_work_skills_emp);
console.log('emp_comments ',emp_comments);

pdbconnect.query("SELECT emp_email , reporting_mgr ,emp_name,designation,project_id,joining_date ,prev_expr_year, prev_expr_month, rcre_time FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
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
      employee_email = empResult.rows['0'].emp_email;
      console.log('employee_email' ,employee_email);
      //employee_email = 'hari.nurture@gmail.com';
    console.log('employee_email' ,employee_email);

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



pdbconnect.query("SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              emp_appraiser=empResult.rows['0'].reporting_mgr;
              console.log('emp_appraiser' ,emp_appraiser);
            }


   pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[emp_appraiser], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
             manager_email=empResult.rows['0'].emp_email;
              console.log('manager_email' ,manager_email);
     //         manager_email ='ahs.hari@gmail.com';
              console.log('manager_email' ,manager_email);
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
                to: manager_email,
                cc: employee_email,
                from: 'nurtureportal@gmail.com',
                subject: 'Appraisal submission notification ',
                text: 'Employee ' + emp_name + ' - ' + emp_id + ' has submitted his/her appraisal for the month ' + appraisal_month + '-' + appraisal_year +  ' and its waiting for your approval.\n' +
                       'Please review and get in touch with the employee and take it forward for closure. \n' + '\n' + '\n' + '\n' + '\n' +

                       ' - Appraisal System'
               };


               smtpTransport.sendMail(mailOptions, function(err) {
               });


             pdbconnect.query("INSERT INTO appraisal_master_table(emp_id, emp_appraiser, appraisal_month, appraisal_year, ability_at_pos_emp, attendence_emp, leadership_quality_emp, ability_meet_deadlines_emp, technical_skills_emp, quality_of_work_emp, team_work_skills_emp, emp_comments, future_goals, app_flg, rcre_time, lchg_time, lchg_user_id,ability_at_pos_rmks_emp,attendence_rmks_emp,leadership_quality_rmks_emp,ability_meet_deadlines_rmks_emp,technical_skills_rmks_emp,quality_of_work_rmks_emp,team_work_skills_rmks_emp,app_conf,rej_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)",[emp_id,emp_appraiser,appraisal_month,appraisal_year,ability_at_pos_emp,attendence_emp,leadership_quality_emp,ability_meet_deadlines_emp,technical_skills_emp,quality_of_work_emp,team_work_skills_emp,emp_comments,future_goals,app_flg,rcretime,lchgtime,emp_id,ability_at_pos_emp_rmks,attendence_emp_rmks,leadership_quality_emp_rmks,ability_meet_deadlines_emp_rmks,technical_skills_emp_rmks,quality_of_work_emp_rmks,team_work_skills_em_rmks,'N','N'],function(err,done){
             if(err) throw err;
              });
           
  res.render('appraisalModule/addAppraisal',{
    id:id,

emp_appraiser:emp_appraiser,
 appraisal_month:appraisal_month,
appraisal_year:appraisal_year,


 ability_at_pos_emp:ability_at_pos_emp,
 attendence_emp:attendence_emp,
 leadership_quality_emp:leadership_quality_emp,
 ability_meet_deadlines_emp:ability_meet_deadlines_emp,
 technical_skills_emp:technical_skills_emp,
 quality_of_work_emp:quality_of_work_emp,
 team_work_skills_emp:team_work_skills_emp,
 emp_comments:emp_comments,
 future_goals:future_goals,

 ability_at_pos_rmks_emp:ability_at_pos_emp_rmks,  
 attendence_rmks_emp:attendence_emp_rmks,
 leadership_quality_rmks_emp:leadership_quality_emp_rmks, 
 ability_meet_deadlines_rmks_emp:ability_meet_deadlines_emp_rmks,
 technical_skills_rmks_emp:technical_skills_emp_rmks,
 quality_of_work_rmks_emp:quality_of_work_emp_rmks,
 team_work_skills_rmks_emp:team_work_skills_em_rmks,
    emp_access:emp_access,
    rcre_time:rcretimeToDateString,
    emp_name:emp_name,
     designation:designation,
      project_id:project_id,
      prev_expr_year:prev_expr_year,
      prev_expr_month:prev_expr_month,
      joining_date:joining_date,
      reporting_mgr:reporting_mgr,
      join_date_month:join_date_month,
      join_date_year:join_date_year,

      nur_exp_year:nur_exp_year,
      nur_exp_month:nur_exp_month,
      tot_exp_month:tot_exp_month,
   emp_id:emp_id,
    tot_exp_year:tot_exp_year,
    emp_name:emp_name


  });

});
});
});
}

module.exports = router;