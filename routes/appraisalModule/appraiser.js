var express = require('express');
var router = express.Router();
var app = express();


var pdbconnect=require('../../routes/database/psqldbconnect');

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


router.get('/appraiser',appraiser);
router.get('/appraisalAlreadyApproved',appraisalAlreadyApproved);
router.get('/appraisalRejected',appraisalRejected);
router.get('/rejectedClosed',rejectedClosed);



  function appraiser(req,res){
var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;
var emp_access =req.user.rows[0].user_type;

	var id = req.query.id;
  //console.log("id",id);
  var splitValues = id.split("-");
  //console.log("splitValues",splitValues);
  var emp_id = splitValues[0];
  var month =splitValues[1];
  var year =splitValues[2];



console.log("emp_id ", emp_id);
  console.log("month ", month);
  console.log("year ", year);


	pdbconnect.query("SELECT emp_name,designation,project_id,joining_date ,prev_expr_year, prev_expr_month, rcre_time FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
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

			join_date_month =  monthNames[joining_date.getMonth()];
			join_date_year =  joining_date.getFullYear();

			nur_exp_year = currentYear -join_date_year ;
			nur_exp_month = d.getMonth() - joining_date.getMonth() ;
			console.log('nur_exp_month is ',nur_exp_month);
			console.log('prev_expr_month is ',prev_expr_month);
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

pdbconnect.query("SELECT fwd_appraiser,  rcre_time, emp_comments, app_comments, future_goals FROM appraisal_master_table where emp_id =$1 and appraisal_month= $2 and appraisal_year =$3  ",[emp_id,month,year], function(err, appResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                
            	
           //console.log('got the result' ,empResult);
           rcre_time=appResult.rows['0'].rcre_time;
         
                 emp_comments =appResult.rows['0'].emp_comments;
         
                 future_goals =appResult.rows['0'].future_goals;
                fwd_appraiser  =appResult.rows['0'].fwd_appraiser;
          
			app_date  = rcre_time.toDateString();
			
		//console.log('got the result rcre_time' ,app_date);
    console.log('got the result fwd_appraiser' ,fwd_appraiser);

          }

        
          pdbconnect.query("SELECT emp_name, emp_id FROM emp_master_tbl  where del_flg = $1 and emp_access in ('L1','L2') order by emp_name asc" ,['N'], function(err, empList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = empList.rowCount;
                empData = empList.rows;

                
                }


                pdbconnect.query("SELECT emp_name FROM emp_master_tbl where emp_id =$1  ",[fwd_appraiser], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {

               if(fwd_appraiser!=null && fwd_appraiser!="")
                {
              fwd_emp_name=empResult.rows['0'].emp_name;
              console.log('fwd_emp_name' ,fwd_emp_name);    
                  }else{
                    fwd_emp_name="";
              console.log('fwd_emp_name' ,fwd_emp_name);    
                  }


              
            }



  res.render('appraisalModule/appraiser',{

  	  	id:id,
  	emp_name:emp_name,
  	designation:designation,
  	project_id:project_id,
  	emp_id:emp_id,
    my_id:my_id,
    my_name:my_name,
  	rcre_time:app_date,
  	nur_exp_year:nur_exp_year,
  	nur_exp_month:nur_exp_month,
  	tot_exp_year:tot_exp_year,
  	tot_exp_month:tot_exp_month,
  	month:month,
  	year:year,
  	   ability_at_pos_emp:ability_at_pos_emp,
  	attendence_emp:attendence_emp,
  	leadership_quality_emp:leadership_quality_emp,
  	ability_meet_deadlines_emp:ability_meet_deadlines_emp,
  	technical_skills_emp:technical_skills_emp,
  	quality_of_work_emp:quality_of_work_emp,
  	team_work_skills_emp:team_work_skills_emp,

  	  ability_at_pos_rmks_emp:ability_at_pos_rmks_emp,
                 attendence_rmks_emp:attendence_rmks_emp,
 					leadership_quality_rmks_emp:leadership_quality_rmks_emp,
 					ability_meet_deadlines_rmks_emp:ability_meet_deadlines_rmks_emp,
    				technical_skills_rmks_emp :technical_skills_rmks_emp,
    				quality_of_work_rmks_emp:quality_of_work_rmks_emp,
    				team_work_skills_rmks_emp :team_work_skills_rmks_emp,

  	emp_comments:emp_comments,
  	emp_access:emp_access,
  	future_goals:future_goals,
    empData:empData,
    fwd_appraiser:fwd_appraiser,
    fwd_emp_name:fwd_emp_name

});
  });
});
});
});

}



function appraisalAlreadyApproved(req,res){
var emp_access =req.user.rows[0].user_type;
var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;
var id = req.query.id;
  //console.log("id",id);
  var splitValues = id.split("-");
  //console.log("splitValues",splitValues);
  var emp_id = splitValues[0];
  var month = splitValues[1];
  var year =splitValues[2];
  
  console.log("month ", month);
  console.log("year ", year);


  pdbconnect.query("SELECT emp_name,designation,project_id,joining_date ,prev_expr_year, prev_expr_month, rcre_time , reporting_mgr FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
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
        

pdbconnect.query("SELECT emp_name FROM emp_master_tbl where emp_id =$1  ",[reporting_mgr], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              appraiser_name =empResult.rows['0'].emp_name;
              console.log('appraiser_name' ,appraiser_name);
            }



  pdbconnect.query("SELECT  rcre_time, ability_at_pos_emp, attendence_emp, leadership_quality_emp, ability_meet_deadlines_emp, technical_skills_emp, quality_of_work_emp, team_work_skills_emp , ability_at_pos_app, attendence_app, leadership_quality_app, ability_meet_deadlines_app, technical_skills_app, quality_of_work_app, team_work_skills_app , ability_at_pos_rmks, attendence_rmks, leadership_quality_rmks, ability_meet_deadlines_rmks, technical_skills_rmks, quality_of_work_rmks, team_work_skills_rmks,ability_at_pos_rmks_emp, attendence_rmks_emp, leadership_quality_rmks_emp, ability_meet_deadlines_rmks_emp, technical_skills_rmks_emp, quality_of_work_rmks_emp, team_work_skills_rmks_emp, emp_comments, app_comments, future_goals, emp_appraiser FROM appraisal_master_table where emp_id =$1 and appraisal_month= $2 and appraisal_year =$3  ",[emp_id,month,year], function(err, appResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                
              
           //console.log('got the result' ,empResult);
           rcre_time=appResult.rows['0'].rcre_time;
           ability_at_pos_emp =appResult.rows['0'].ability_at_pos_emp;
            attendence_emp =appResult.rows['0'].attendence_emp;
             leadership_quality_emp =appResult.rows['0'].leadership_quality_emp;
              ability_meet_deadlines_emp =appResult.rows['0'].ability_meet_deadlines_emp;
               technical_skills_emp =appResult.rows['0'].technical_skills_emp;
                quality_of_work_emp =appResult.rows['0'].quality_of_work_emp;
                 team_work_skills_emp =appResult.rows['0'].team_work_skills_emp;

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



             ability_at_pos_rmks_emp =appResult.rows['0'].ability_at_pos_rmks_emp;
            attendence_rmks_emp =appResult.rows['0'].attendence_rmks_emp;
             leadership_quality_rmks_emp =appResult.rows['0'].leadership_quality_rmks_emp;
              ability_meet_deadlines_rmks_emp =appResult.rows['0'].ability_meet_deadlines_rmks_emp;
               technical_skills_rmks_emp =appResult.rows['0'].technical_skills_rmks_emp;
                quality_of_work_rmks_emp =appResult.rows['0'].quality_of_work_rmks_emp;
                 team_work_skills_rmks_emp =appResult.rows['0'].team_work_skills_rmks_emp;

                 emp_appraiser =appResult.rows['0'].emp_appraiser;
                 emp_comments =appResult.rows['0'].emp_comments;
                 app_comments =appResult.rows['0'].app_comments;
                 future_goals =appResult.rows['0'].future_goals;
                
          
      app_date  = rcre_time.toDateString();
      
    console.log('got the result rcre_time' ,app_date);

          }


  res.render('appraisalModule/appraisalAlreadyApproved',{
    id:id,
    month:month,
    year:year,
    emp_name:emp_name,
    designation:designation,
    project_id:project_id,
    emp_id:emp_id,
     my_id:my_id,
    my_name:my_name,
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
    emp_access:emp_access


  });

    });

});




});
}


function appraisalRejected(req,res){
var emp_access =req.user.rows[0].user_type;
var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;
var id = req.query.id;
  //console.log("id",id);
  var splitValues = id.split("-");
  //console.log("splitValues",splitValues);
  var emp_id = splitValues[0];
  var month = splitValues[1];
  var year =splitValues[2];
  
  console.log("month ", month);
  console.log("year ", year);


  pdbconnect.query("SELECT emp_name,designation,project_id,joining_date ,prev_expr_year, prev_expr_month, rcre_time , reporting_mgr FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
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
        

pdbconnect.query("SELECT emp_name FROM emp_master_tbl where emp_id =$1  ",[reporting_mgr], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              appraiser_name =empResult.rows['0'].emp_name;
              console.log('appraiser_name' ,appraiser_name);
            }



  pdbconnect.query("SELECT  rcre_time, ability_at_pos_emp, attendence_emp, leadership_quality_emp, ability_meet_deadlines_emp, technical_skills_emp, quality_of_work_emp, team_work_skills_emp , ability_at_pos_app, attendence_app, leadership_quality_app, ability_meet_deadlines_app, technical_skills_app, quality_of_work_app, team_work_skills_app , ability_at_pos_rmks, attendence_rmks, leadership_quality_rmks, ability_meet_deadlines_rmks, technical_skills_rmks, quality_of_work_rmks, team_work_skills_rmks,ability_at_pos_rmks_emp, attendence_rmks_emp, leadership_quality_rmks_emp, ability_meet_deadlines_rmks_emp, technical_skills_rmks_emp, quality_of_work_rmks_emp, team_work_skills_rmks_emp, emp_comments, app_comments, future_goals, emp_appraiser, app_conf_reason FROM appraisal_master_table where emp_id =$1 and appraisal_month= $2 and appraisal_year =$3  ",[emp_id,month,year], function(err, appResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                
              
           //console.log('got the result' ,empResult);
           rcre_time=appResult.rows['0'].rcre_time;
           
           
           rej_remarks =appResult.rows['0'].app_conf_reason;
           ability_at_pos_emp =appResult.rows['0'].ability_at_pos_emp;
            attendence_emp =appResult.rows['0'].attendence_emp;
             leadership_quality_emp =appResult.rows['0'].leadership_quality_emp;
              ability_meet_deadlines_emp =appResult.rows['0'].ability_meet_deadlines_emp;
               technical_skills_emp =appResult.rows['0'].technical_skills_emp;
                quality_of_work_emp =appResult.rows['0'].quality_of_work_emp;
                 team_work_skills_emp =appResult.rows['0'].team_work_skills_emp;

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



             ability_at_pos_rmks_emp =appResult.rows['0'].ability_at_pos_rmks_emp;
            attendence_rmks_emp =appResult.rows['0'].attendence_rmks_emp;
             leadership_quality_rmks_emp =appResult.rows['0'].leadership_quality_rmks_emp;
              ability_meet_deadlines_rmks_emp =appResult.rows['0'].ability_meet_deadlines_rmks_emp;
               technical_skills_rmks_emp =appResult.rows['0'].technical_skills_rmks_emp;
                quality_of_work_rmks_emp =appResult.rows['0'].quality_of_work_rmks_emp;
                 team_work_skills_rmks_emp =appResult.rows['0'].team_work_skills_rmks_emp;

                 emp_appraiser =appResult.rows['0'].emp_appraiser;
                 emp_comments =appResult.rows['0'].emp_comments;
                 app_comments =appResult.rows['0'].app_comments;
                 future_goals =appResult.rows['0'].future_goals;
                
                          overallRating = parseInt(ability_at_pos_app)+ parseInt(attendence_app)+ parseInt(leadership_quality_app)+ parseInt(ability_meet_deadlines_app)+ parseInt(technical_skills_app)+ parseInt(quality_of_work_app)+ parseInt(team_work_skills_app);
          overallRatingValue = overallRating/7;
          var rating = overallRatingValue.toFixed(2);

      app_date  = rcre_time.toDateString();
      
    console.log('got the result rcre_time' ,app_date);

          }


  res.render('appraisalModule/appraisalRejected',{
    id:id,
    month:month,
    year:year,
    emp_name:emp_name,
    designation:designation,
    project_id:project_id,
    emp_id:emp_id,
    my_name:my_name,
    my_id:my_id,
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
    rej_remarks:rej_remarks,
    rating:rating


  });

    });

});




});
}

function rejectedClosed(req,res){
var emp_access =req.user.rows[0].user_type;
var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;
var id = req.query.id;
  //console.log("id",id);
  var splitValues = id.split("-");
  //console.log("splitValues",splitValues);
  var emp_id = splitValues[0];
  var month = splitValues[1];
  var year =splitValues[2];
  
  console.log("month ", month);
  console.log("year ", year);


  pdbconnect.query("SELECT emp_name,designation,project_id,joining_date ,prev_expr_year, prev_expr_month, rcre_time , reporting_mgr FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
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
        

pdbconnect.query("SELECT emp_name FROM emp_master_tbl where emp_id =$1  ",[reporting_mgr], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              appraiser_name =empResult.rows['0'].emp_name;
              console.log('appraiser_name' ,appraiser_name);
            }



  pdbconnect.query("SELECT closure_comments,closure_rating, rcre_time, ability_at_pos_emp, attendence_emp, leadership_quality_emp, ability_meet_deadlines_emp, technical_skills_emp, quality_of_work_emp, team_work_skills_emp , ability_at_pos_app, attendence_app, leadership_quality_app, ability_meet_deadlines_app, technical_skills_app, quality_of_work_app, team_work_skills_app , ability_at_pos_rmks, attendence_rmks, leadership_quality_rmks, ability_meet_deadlines_rmks, technical_skills_rmks, quality_of_work_rmks, team_work_skills_rmks,ability_at_pos_rmks_emp, attendence_rmks_emp, leadership_quality_rmks_emp, ability_meet_deadlines_rmks_emp, technical_skills_rmks_emp, quality_of_work_rmks_emp, team_work_skills_rmks_emp, emp_comments, app_comments, future_goals, emp_appraiser, app_conf_reason FROM appraisal_master_table where emp_id =$1 and appraisal_month= $2 and appraisal_year =$3  ",[emp_id,month,year], function(err, appResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                
              
           //console.log('got the result' ,empResult);
           rcre_time=appResult.rows['0'].rcre_time;
           closure_comments =appResult.rows['0'].closure_comments;
           closure_rating = appResult.rows['0'].closure_rating;
           rej_remarks =appResult.rows['0'].app_conf_reason;
           ability_at_pos_emp =appResult.rows['0'].ability_at_pos_emp;
            attendence_emp =appResult.rows['0'].attendence_emp;
             leadership_quality_emp =appResult.rows['0'].leadership_quality_emp;
              ability_meet_deadlines_emp =appResult.rows['0'].ability_meet_deadlines_emp;
               technical_skills_emp =appResult.rows['0'].technical_skills_emp;
                quality_of_work_emp =appResult.rows['0'].quality_of_work_emp;
                 team_work_skills_emp =appResult.rows['0'].team_work_skills_emp;

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



             ability_at_pos_rmks_emp =appResult.rows['0'].ability_at_pos_rmks_emp;
            attendence_rmks_emp =appResult.rows['0'].attendence_rmks_emp;
             leadership_quality_rmks_emp =appResult.rows['0'].leadership_quality_rmks_emp;
              ability_meet_deadlines_rmks_emp =appResult.rows['0'].ability_meet_deadlines_rmks_emp;
               technical_skills_rmks_emp =appResult.rows['0'].technical_skills_rmks_emp;
                quality_of_work_rmks_emp =appResult.rows['0'].quality_of_work_rmks_emp;
                 team_work_skills_rmks_emp =appResult.rows['0'].team_work_skills_rmks_emp;

                 emp_appraiser =appResult.rows['0'].emp_appraiser;
                 emp_comments =appResult.rows['0'].emp_comments;
                 app_comments =appResult.rows['0'].app_comments;
                 future_goals =appResult.rows['0'].future_goals;
                
                          overallRating = parseInt(ability_at_pos_app)+ parseInt(attendence_app)+ parseInt(leadership_quality_app)+ parseInt(ability_meet_deadlines_app)+ parseInt(technical_skills_app)+ parseInt(quality_of_work_app)+ parseInt(team_work_skills_app);
          overallRatingValue = overallRating/7;
          var rating = overallRatingValue.toFixed(2);

      app_date  = rcre_time.toDateString();
      
    console.log('got the result rcre_time' ,app_date);

          }


  res.render('appraisalModule/rejectedClosed',{
    id:id,
    month:month,
    year:year,
    emp_name:emp_name,
    designation:designation,
    project_id:project_id,
    emp_id:emp_id,
    my_name:my_name,
my_id:my_id,
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
    rej_remarks:rej_remarks,
    rating:rating,
    closure_comments:closure_comments,
    closure_rating:closure_rating


  });

    });

});




});
}

module.exports = router;