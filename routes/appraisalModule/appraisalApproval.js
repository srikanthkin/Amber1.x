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


router.post('/appraisalApproval', appraisalApproval);
router.post('/appraisalApproval1', appraisalApproval1);



  function appraisalApproval(req,res){
var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;
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

//var emp_id ='1408';
var emp_appraiser = '';



var ability_at_pos_app = req.body.ability;
var attendence_app = req.body.attendance;
var leadership_quality_app = req.body.lAbility;
var ability_meet_deadlines_app  = req.body.deadlines;
var technical_skills_app = req.body.skills;
var quality_of_work_app = req.body.qow;
var team_work_skills_app = req.body.teamWork;


var ability_at_pos_rmks = req.body.abilityRemarks;
var attendence_rmks = req.body.attendanceRemarks;
var leadership_quality_rmks = req.body.lAbilityRemarks;
var ability_meet_deadlines_rmks  = req.body.deadlinesRemarks;
var technical_skills_rmks = req.body.skillsRemarks;
var quality_of_work_rmks = req.body.qowRemarks;
var team_work_skills_rmks = req.body.temaAbilityRemarks;
var app_comments = req.body.app_comments;


var app_flg = 'Y';
//var rcre_time =rcretime.toDateString();
//var lchg_user_id ='1408';



             pdbconnect.query("UPDATE  appraisal_master_table set  ability_at_pos_app =$1, attendence_app =$2, leadership_quality_app =$3, ability_meet_deadlines_app =$4, technical_skills_app =$5, quality_of_work_app =$6, team_work_skills_app= $7,  app_flg = $8,  lchg_time = $9, lchg_user_id = $10 ,ability_at_pos_rmks = $11,attendence_rmks = $12,leadership_quality_rmks = $13,ability_meet_deadlines_rmks = $14,technical_skills_rmks = $15,quality_of_work_rmks = $16,team_work_skills_rmks = $17,app_comments=$18  where emp_appraiser =$19 and appraisal_month = $20 and appraisal_year =$21 and emp_id =$22",[ability_at_pos_app,attendence_app,leadership_quality_app,ability_meet_deadlines_app,technical_skills_app,quality_of_work_app,team_work_skills_app,app_flg ,lchgtime,emp_id,ability_at_pos_rmks,attendence_rmks,leadership_quality_rmks,ability_meet_deadlines_rmks,technical_skills_rmks,quality_of_work_rmks,team_work_skills_rmks,app_comments,emp_id,month,year,employee_id],function(err,done){
             if(err) throw err;
              });


  pdbconnect.query("SELECT emp_email, emp_name,designation,project_id,joining_date ,prev_expr_year, prev_expr_month, rcre_time , reporting_mgr FROM emp_master_tbl where emp_id =$1  ",[employee_id], function(err, empResult) {
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
      reporting_mgr = empResult.rows['0'].reporting_mgr;
      employee_email = empResult.rows['0'].emp_email;
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
      //tot_exp_month = parseInt(add_expr_month) + parseInt(tot_exp_month) ;


/*
    console.log('got the result joining_date' ,join_date_month);
    console.log('got the result joining_date' ,join_date_year);

    console.log('got the result prev_expr_year' ,prev_expr_year);
    console.log('got the result prev_expr_month' ,prev_expr_month);

    console.log('got the result nur_exp_year' ,nur_exp_year);
    console.log('got the result nur_exp_month' ,nur_exp_month);

    console.log('got the result tot_exp_month' ,tot_exp_month);
    console.log('got the result tot_exp_year' ,tot_exp_year);

    console.log('got the result add_expr_year' ,add_expr_year);
    console.log('got the result add_expr_month' ,add_expr_month);
    
  */        }
        

pdbconnect.query("SELECT emp_name, emp_email FROM emp_master_tbl where emp_id =$1  ",[reporting_mgr], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              appraiser_name =empResult.rows['0'].emp_name;
              manager_email = empResult.rows['0'].emp_email;
              console.log('appraiser_name' ,appraiser_name);
            }



  pdbconnect.query("SELECT  rcre_time, ability_at_pos_emp, attendence_emp, leadership_quality_emp, ability_meet_deadlines_emp, technical_skills_emp, quality_of_work_emp, team_work_skills_emp , ability_at_pos_app, attendence_app, leadership_quality_app, ability_meet_deadlines_app, technical_skills_app, quality_of_work_app, team_work_skills_app , ability_at_pos_rmks, attendence_rmks, leadership_quality_rmks, ability_meet_deadlines_rmks, technical_skills_rmks, quality_of_work_rmks, team_work_skills_rmks,ability_at_pos_rmks_emp, attendence_rmks_emp, leadership_quality_rmks_emp, ability_meet_deadlines_rmks_emp, technical_skills_rmks_emp, quality_of_work_rmks_emp, team_work_skills_rmks_emp, emp_comments, app_comments, future_goals, emp_appraiser FROM appraisal_master_table where emp_id =$1 and appraisal_month= $2 and appraisal_year =$3  ",[employee_id,month,year], function(err, appResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                
           
              console.log('got the emp_id' ,employee_id);
              console.log('got the year' ,year);
              console.log('got the month' ,month);
           console.log('got the month1' ,month);
           //console.log('got the month1' ,appResult);
           rcre_time=appResult.rows['0'].rcre_time;
           console.log('got the month11' ,month);
            console.log('got the result' ,appResult.rows['0']);


           ability_at_pos_emp =appResult.rows['0'].ability_at_pos_emp;
            attendence_emp =appResult.rows['0'].attendence_emp;
             leadership_quality_emp =appResult.rows['0'].leadership_quality_emp;
              ability_meet_deadlines_emp =appResult.rows['0'].ability_meet_deadlines_emp;
               technical_skills_emp =appResult.rows['0'].technical_skills_emp;
                quality_of_work_emp =appResult.rows['0'].quality_of_work_emp;
                 team_work_skills_emp =appResult.rows['0'].team_work_skills_emp;
/*
 ability_at_pos_app =appResult.rows['0'].ability_at_pos_app;
            attendence_app =appResult.rows['0'].attendence_app;
             leadership_quality_app =appResult.rows['0'].leadership_quality_app;
              ability_meet_deadlines_app =appResult.rows['0'].ability_meet_deadlines_app;
               technical_skills_app =appResult.rows['0'].technical_skills_app;
                quality_of_work_app =appResult.rows['0'].quality_of_work_app;
                 team_work_skills_app =appResult.rows['0'].team_work_skills_app;
    
             ability_at_pos_rmks =appResult.rows['0'].ability_at_pos_rmks;
            attendence_rmks =appResult.rows['0'].attendence_rmks;
             leadership_quality_rmks =appResult.rows['0'].leadership_quality_rmks;
              ability_meet_deadlines_rmks =appResult.rows['0'].ability_meet_deadlines_rmks;
               technical_skills_rmks =appResult.rows['0'].technical_skills_rmks;
                quality_of_work_rmks =appResult.rows['0'].quality_of_work_rmks;
                 team_work_skills_rmks =appResult.rows['0'].team_work_skills_rmks;

*/

             ability_at_pos_rmks_emp =appResult.rows['0'].ability_at_pos_rmks_emp;
            attendence_rmks_emp =appResult.rows['0'].attendence_rmks_emp;
             leadership_quality_rmks_emp =appResult.rows['0'].leadership_quality_rmks_emp;
              ability_meet_deadlines_rmks_emp =appResult.rows['0'].ability_meet_deadlines_rmks_emp;
               technical_skills_rmks_emp =appResult.rows['0'].technical_skills_rmks_emp;
                quality_of_work_rmks_emp =appResult.rows['0'].quality_of_work_rmks_emp;
                 team_work_skills_rmks_emp =appResult.rows['0'].team_work_skills_rmks_emp;

                 emp_appraiser =appResult.rows['0'].emp_appraiser;
                 emp_comments =appResult.rows['0'].emp_comments;
           //      app_comments =appResult.rows['0'].app_comments;
                 future_goals =appResult.rows['0'].future_goals;
                
          
      app_date  = rcre_time.toDateString();
      
    console.log('got the result rcre_time' ,app_date);

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
                to: employee_email,
                cc: manager_email,
                from: 'nurtureportal@gmail.com',
                subject: 'Appraisal approval notification ',
                text: 'Your appraisal for the month ' + month + '-' + year +  ' has been approved by your reporting manager ' + appraiser_name + ' and it is pending for your acceptance .\n' +
                       'Please review and get in touch with your reporting manager and take it forward for closure. \n' + '\n' + '\n' + '\n' + '\n' +

                       ' - Appraisal System'
               };


               smtpTransport.sendMail(mailOptions, function(err) {
               });


           
  res.render('appraisalModule/appraisalApproval',{
   id:id,
    month:month,
    year:year,
    emp_name:emp_name,
    designation:designation,
    project_id:project_id,
    emp_id:emp_id,
    rcre_time:app_date,
    nur_exp_year:nur_exp_year,
    nur_exp_month:nur_exp_month,
    tot_exp_year:tot_exp_year,
    tot_exp_month:tot_exp_month,

       ability_at_pos_emp:ability_at_pos_emp,
    attendence_emp:attendence_emp,
    leadership_quality_emp:leadership_quality_emp,
    ability_meet_deadlines_emp:ability_meet_deadlines_emp,
    technical_skills_emp:technical_skills_emp,
    quality_of_work_emp:quality_of_work_emp,
    team_work_skills_emp:team_work_skills_emp,

        ability_at_pos_app:ability_at_pos_app,
    attendence_app:attendence_app,
    leadership_quality_app:leadership_quality_app,
    ability_meet_deadlines_app:ability_meet_deadlines_app,
    technical_skills_app:technical_skills_app,
    quality_of_work_app:quality_of_work_app,
    team_work_skills_app:team_work_skills_app,
        ability_at_pos_rmks:ability_at_pos_rmks,
    attendence_rmks:attendence_rmks,
    leadership_quality_rmks:leadership_quality_rmks,
    ability_meet_deadlines_rmks:ability_meet_deadlines_rmks,
    technical_skills_rmks:technical_skills_rmks,
    quality_of_work_rmks:quality_of_work_rmks,
    team_work_skills_rmks:team_work_skills_rmks,


    ability_at_pos_rmks_emp:ability_at_pos_rmks_emp,
    attendence_rmks_emp:attendence_rmks_emp,
    leadership_quality_rmks_emp:leadership_quality_rmks_emp,
    ability_meet_deadlines_rmks_emp:ability_meet_deadlines_rmks_emp,
    technical_skills_rmks_emp:technical_skills_rmks_emp,
    quality_of_work_rmks_emp:quality_of_work_rmks_emp,
    team_work_skills_rmks_emp:team_work_skills_rmks_emp,

    appraiser_name:appraiser_name,
    emp_appraiser:emp_appraiser,
    emp_comments:emp_comments,
    app_comments:app_comments,
    future_goals:future_goals,
    emp_access:emp_access,
    employee_id:employee_id,
    my_name:my_name

  });

});

});
});
}



function appraisalApproval1(req,res){
var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;
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

//var emp_id ='1408';
var emp_appraiser = '';



var ability_at_pos_app = req.body.ability1;
var attendence_app = req.body.attendance1;
var leadership_quality_app = req.body.lAbility1;
var ability_meet_deadlines_app  = req.body.deadlines1;
var technical_skills_app = req.body.skills1;
var quality_of_work_app = req.body.qow1;
var team_work_skills_app = req.body.teamWork1;


var ability_at_pos_rmks = req.body.abilityRemarks1;
var attendence_rmks = req.body.attendanceRemarks1;
var leadership_quality_rmks = req.body.lAbilityRemarks1;
var ability_meet_deadlines_rmks  = req.body.deadlinesRemarks1;
var technical_skills_rmks = req.body.skillsRemarks1;
var quality_of_work_rmks = req.body.qowRemarks1;
var team_work_skills_rmks = req.body.temaAbilityRemarks1;
var app_comments = req.body.app_comments1;


var app_flg = 'Y';
//var rcre_time =rcretime.toDateString();
//var lchg_user_id ='1408';



             pdbconnect.query("UPDATE  appraisal_master_table set  ability_at_pos_app =$1, attendence_app =$2, leadership_quality_app =$3, ability_meet_deadlines_app =$4, technical_skills_app =$5, quality_of_work_app =$6, team_work_skills_app= $7,  app_flg = $8,  lchg_time = $9, lchg_user_id = $10 ,ability_at_pos_rmks = $11,attendence_rmks = $12,leadership_quality_rmks = $13,ability_meet_deadlines_rmks = $14,technical_skills_rmks = $15,quality_of_work_rmks = $16,team_work_skills_rmks = $17,app_comments=$18  where emp_appraiser =$19 and appraisal_month = $20 and appraisal_year =$21 and emp_id =$22",[ability_at_pos_app,attendence_app,leadership_quality_app,ability_meet_deadlines_app,technical_skills_app,quality_of_work_app,team_work_skills_app,app_flg ,lchgtime,emp_id,ability_at_pos_rmks,attendence_rmks,leadership_quality_rmks,ability_meet_deadlines_rmks,technical_skills_rmks,quality_of_work_rmks,team_work_skills_rmks,app_comments,emp_id,month,year,employee_id],function(err,done){
             if(err) throw err;
              });


  pdbconnect.query("SELECT emp_email, emp_name,designation,project_id,joining_date ,prev_expr_year, prev_expr_month, rcre_time , reporting_mgr FROM emp_master_tbl where emp_id =$1  ",[employee_id], function(err, empResult) {
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
      reporting_mgr = empResult.rows['0'].reporting_mgr;
      employee_email = empResult.rows['0'].emp_email;
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
      //tot_exp_month = parseInt(add_expr_month) + parseInt(tot_exp_month) ;
     }
        

pdbconnect.query("SELECT emp_name, emp_email FROM emp_master_tbl where emp_id =$1  ",[reporting_mgr], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              appraiser_name =empResult.rows['0'].emp_name;
              manager_email = empResult.rows['0'].emp_email;
              console.log('appraiser_name' ,appraiser_name);
            }



  pdbconnect.query("SELECT  rcre_time, ability_at_pos_emp, attendence_emp, leadership_quality_emp, ability_meet_deadlines_emp, technical_skills_emp, quality_of_work_emp, team_work_skills_emp , ability_at_pos_app, attendence_app, leadership_quality_app, ability_meet_deadlines_app, technical_skills_app, quality_of_work_app, team_work_skills_app , ability_at_pos_rmks, attendence_rmks, leadership_quality_rmks, ability_meet_deadlines_rmks, technical_skills_rmks, quality_of_work_rmks, team_work_skills_rmks,ability_at_pos_rmks_emp, attendence_rmks_emp, leadership_quality_rmks_emp, ability_meet_deadlines_rmks_emp, technical_skills_rmks_emp, quality_of_work_rmks_emp, team_work_skills_rmks_emp, emp_comments, app_comments, future_goals, emp_appraiser FROM appraisal_master_table where emp_id =$1 and appraisal_month= $2 and appraisal_year =$3  ",[employee_id,month,year], function(err, appResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                
           
              console.log('got the emp_id' ,employee_id);
              console.log('got the year' ,year);
              console.log('got the month' ,month);
           console.log('got the month1' ,month);
           //console.log('got the month1' ,appResult);
           rcre_time=appResult.rows['0'].rcre_time;
           console.log('got the month11' ,month);
            console.log('got the result' ,appResult.rows['0']);


           ability_at_pos_emp =appResult.rows['0'].ability_at_pos_emp;
            attendence_emp =appResult.rows['0'].attendence_emp;
             leadership_quality_emp =appResult.rows['0'].leadership_quality_emp;
              ability_meet_deadlines_emp =appResult.rows['0'].ability_meet_deadlines_emp;
               technical_skills_emp =appResult.rows['0'].technical_skills_emp;
                quality_of_work_emp =appResult.rows['0'].quality_of_work_emp;
                 team_work_skills_emp =appResult.rows['0'].team_work_skills_emp;


             ability_at_pos_rmks_emp =appResult.rows['0'].ability_at_pos_rmks_emp;
            attendence_rmks_emp =appResult.rows['0'].attendence_rmks_emp;
             leadership_quality_rmks_emp =appResult.rows['0'].leadership_quality_rmks_emp;
              ability_meet_deadlines_rmks_emp =appResult.rows['0'].ability_meet_deadlines_rmks_emp;
               technical_skills_rmks_emp =appResult.rows['0'].technical_skills_rmks_emp;
                quality_of_work_rmks_emp =appResult.rows['0'].quality_of_work_rmks_emp;
                 team_work_skills_rmks_emp =appResult.rows['0'].team_work_skills_rmks_emp;

                 emp_appraiser =appResult.rows['0'].emp_appraiser;
                 emp_comments =appResult.rows['0'].emp_comments;
           //      app_comments =appResult.rows['0'].app_comments;
                 future_goals =appResult.rows['0'].future_goals;
                
          
      app_date  = rcre_time.toDateString();
      
    console.log('got the result rcre_time' ,app_date);

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
                to: employee_email,
                cc: manager_email,
                from: 'nurtureportal@gmail.com',
                subject: 'Appraisal approval notification ',
                text: 'Your appraisal for the month ' + month + '-' + year +  ' has been approved by your reporting manager ' + appraiser_name + ' and it is pending for your acceptance .\n' +
                       'Please review and get in touch with your reporting manager and take it forward for closure. \n' + '\n' + '\n' + '\n' + '\n' +

                       ' - Appraisal System'
               };


               smtpTransport.sendMail(mailOptions, function(err) {
               });


           
  res.render('appraisalModule/appraisalApproval',{
   id:id,
    month:month,
    year:year,
    emp_name:emp_name,
    designation:designation,
    project_id:project_id,
    emp_id:emp_id,
    rcre_time:app_date,
    nur_exp_year:nur_exp_year,
    nur_exp_month:nur_exp_month,
    tot_exp_year:tot_exp_year,
    tot_exp_month:tot_exp_month,

       ability_at_pos_emp:ability_at_pos_emp,
    attendence_emp:attendence_emp,
    leadership_quality_emp:leadership_quality_emp,
    ability_meet_deadlines_emp:ability_meet_deadlines_emp,
    technical_skills_emp:technical_skills_emp,
    quality_of_work_emp:quality_of_work_emp,
    team_work_skills_emp:team_work_skills_emp,

        ability_at_pos_app:ability_at_pos_app,
    attendence_app:attendence_app,
    leadership_quality_app:leadership_quality_app,
    ability_meet_deadlines_app:ability_meet_deadlines_app,
    technical_skills_app:technical_skills_app,
    quality_of_work_app:quality_of_work_app,
    team_work_skills_app:team_work_skills_app,
        ability_at_pos_rmks:ability_at_pos_rmks,
    attendence_rmks:attendence_rmks,
    leadership_quality_rmks:leadership_quality_rmks,
    ability_meet_deadlines_rmks:ability_meet_deadlines_rmks,
    technical_skills_rmks:technical_skills_rmks,
    quality_of_work_rmks:quality_of_work_rmks,
    team_work_skills_rmks:team_work_skills_rmks,


    ability_at_pos_rmks_emp:ability_at_pos_rmks_emp,
    attendence_rmks_emp:attendence_rmks_emp,
    leadership_quality_rmks_emp:leadership_quality_rmks_emp,
    ability_meet_deadlines_rmks_emp:ability_meet_deadlines_rmks_emp,
    technical_skills_rmks_emp:technical_skills_rmks_emp,
    quality_of_work_rmks_emp:quality_of_work_rmks_emp,
    team_work_skills_rmks_emp:team_work_skills_rmks_emp,

    appraiser_name:appraiser_name,
    emp_appraiser:emp_appraiser,
    emp_comments:emp_comments,
    app_comments:app_comments,
    future_goals:future_goals,
    emp_access:emp_access,
    employee_id:employee_id,
    my_name:my_name

  });

});

});
});
}


module.exports = router;