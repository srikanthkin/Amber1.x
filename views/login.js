console.log("view login");
var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var Promise = require('mpromise');
var pdbconnect=require('../../routes/database/psqldbconnect');
var User = require('../../models/user');
var moment = require('moment');
var rp = require('request-promise');

var check="";
/*added*/
//var borrower="";
//var borrowerlength="";
//var depositor="";
//var depositorlength="";
/*end*/


/*added for rest borrowers and depositors*/
module.exports.depositor="";
module.exports.borrower="";
module.exports.borrowerlength="";
module.exports.depositorlength="";
/*end*/

var  logincheck="";

var attempts=0;
//Passport authentication for user log in
passport.use(new LocalStrategy(
  function(username, password, done) {
  pdbconnect.query("SELECT login_attempts from users where LOWER(user_name) = LOWER($1)",
                      [username],function(err,result){
             if(err) throw err;
             attempts=result.rows['0'].login_attempts;           
  });

  User.getUserByUsername(username,function(err,user){
    console.log("user result:::::::",user);
    if(err) throw err     
     
    if(user.rows == ""){
      console.log("user doesnt existssss")

      return done(null,false,{message:'user doesnt exist'});
    }


    
  User.comparePassword(password,user.rows[0].password,function(err,isMatch){
      if(err)throw err;
      
       if(isMatch){
              return done(null,user);
              } 
        else if(attempts<4){
      
          attempts++;
            pdbconnect.query("UPDATE users SET login_attempts=$1 where user_name=$2",[attempts,username]); 
          return done(null,false,{message:'Wrong Passcode. Please try again. '+ (3-attempts) + ' attempts remaining.' });
         }
   else if(attempts==4) {

      pdbconnect.query("UPDATE users SET login_allowed=$1,login_attempts=$2 where user_name=$3",['unchecked',attempts,username]);
      
      return done(null,false,{message:'Your Account is locked. Please contact administrator.'});
      }
      });
});
}));  

passport.serializeUser(function(user, done) {
  console.log("checked");
  done(null, user.rows[0].user_id);
});

passport.deserializeUser(function(user_id,done) {
  
  User.getUserById(user_id, function(err, user) {
    done(err,user);
  });
  console.log('checked1')
});


var user;


router.post('/logincheck',
                        passport.authenticate('local',
                                                         { 
                                                            failureRedirect:'/',
                                                            failureFlash:true
                                                            }), 

                                              loginCheck);    
 function loginCheck(req, res) {
  var usertype=req.body.usertype;
  var username=req.body.username;
  var hu=['AU','RU'];
  var queryres="";

  var now = new Date();
  module.exports.users = ""; 
  module.exports.usercount="";
  module.exports.lastlogin="";
  module.exports.role="";
  module.exports.userid="";
  module.exports.reportcounts="";
  module.exports.downloadcounts="";
  module.exports.datecheck="";
  module.exports.sessiontimeout="";
  module.exports.activeuser="";


var options = {
    uri: 'http://192.168.168.8:8080/rest-1.0/api/AvatarService/query?',
    qs: {
    seq:'select acct_name,sum(deposit_amount) as sum from (select cif_id,deposit_amount,acct_name from tbaadm.gam g,tbaadm.tam t where g.acid = t.acid order by deposit_amount desc ) where rownum <= 17 group by cif_id,acct_name order by sum desc'
    },
    method:'get',
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
};

rp(options)
.catch(function (err) {
status='failure'
var k=err;
depositor=0;
console.log('depositor',depositor)
depositorlength=0;
console.log(depositorlength)
})
.then(function (response) {
status='success';
depositor=response;
depositorlength=depositor.length;
console.log('depositorlength',depositorlength)
console.log(depositor)
});

var options = {
    uri: 'http://192.168.168.8:8080/rest-1.0/api/AvatarService/query?',
    qs: {
    seq:'select acct_name,sum(dis_amt) as sum from(select cif_id,l.acid,dis_amt,acct_name from tbaadm.lam l,tbaadm.gam g where g.acid = l.acid order by dis_amt desc) where rownum < 7 group by acct_name order by sum(dis_amt) desc'
    },
    method:'get',
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
};

rp(options)

.catch(function (err) {
  console.log("Failed")
status='failure'
var k=err;
borrower=0;
borrowerlength=0;

})

.then(function (response) {
    status='success';
 borrower=response;
 borrowerlength=borrower.length;
 //console.log("borrowers",borrower)
//console.log("borrowers", borrowerlength)



  pdbconnect.query("SELECT param_value FROM params WHERE param_id=$1",['3'],function(err,params){
       if (err) {
                console.error('Error with table query', err);
            } else {
     
     sessiontimeout=params.rows['0'].param_value;
     console.log('timeout',sessiontimeout);
   }
  });
    pdbconnect.query("SELECT COUNT(report_id) AS report_id FROM master_reports", function(err, reportcount) {
            if (err) {
                console.error('Error with table query', err);
            } else {
          reportcounts=reportcount.rows['0'].report_id;
          console.log('reportcounts',reportcounts)
        }
    });



      pdbconnect.query("SELECT * FROM users", function(err, userscount) {
            if (err) {
                console.error('Error with table query', err);
            } else {
          usercount=userscount.rowCount;
          console.log('usercount',usercount);
        }
    });


    pdbconnect.query("SELECT user_id,user_type,expiry_date,LOWER(user_name),last_login,role from users where LOWER(user_name) = LOWER($1) and (expiry_date>=$2 and login_allowed=$3) and(del_flag=$4)",
                      [username,now,'checked','N'],function(err,result){
            console.log("result:::",result);
          if(err) throw err;


          pdbconnect.query("SELECT user_id,LOWER(user_name),login_check from login where LOWER(user_name)=  LOWER($1) ",[username],function(err,loginresult){
              logincheck=loginresult.rows['0'].login_check;
              if(err) throw err;
         
 if(logincheck=="N"){
     
   console.log("within case check");

//console.log("errborrowerlenght",borrowerlength)
//console.log("depositorslength",depositorlength)

         if(result.rows['0']!=null) {    
          role=result.rows[0].role;
          console.log(role)
          userid=result.rows['0'].user_id;
          lastlogin = result.rows['0'].last_login;
          users=result.rows['0'].lower;
               queryres=result.rows['0'].user_type;
               datecheck=result.rows['0'].expiry_date;
          console.log('userid',userid);
       if(queryres==usertype){
        attempts=0;
        
              if(queryres=='AU'){ 
                pdbconnect.query("UPDATE users SET login_attempts=$1,last_login=$2 where LOWER(user_name)=LOWER($3)",[attempts,now,username]);
                pdbconnect.query("UPDATE login SET login_check=$1 where LOWER(user_name) = LOWER($2)",['Y',username]);
                pdbconnect.query("SELECT COUNT(login_check) FROM login where login_check=$1",['Y'], function(err, activeusers) {
                activeuser=activeusers.rows['0'].count;
                pdbconnect.query("SELECT COUNT(generated_time) AS generated_time FROM generation_queue where (DATE(generated_time)>=CURRENT_DATE AND DATE(generated_time) < CURRENT_DATE + INTERVAL '1 DAY') AND (status IN ('Triggered Successfully','Report Generated Sucessfully','In Progress','Failed') AND(user_id=$1 AND del_flag=$2));",[req.user.rows[0].user_id,'N'], function(err, downloadcount) {
            console.log('downloadcountttt::::',downloadcount)
            if (err) {
                console.error('Error with table query', err);
            } else {
          downloadcounts=downloadcount.rows['0'].generated_time;
          console.log('reportcounts',downloadcounts)
        }
    
                  res.render('admin-dashboard/adminDashboard',{
                borrowerlength:borrowerlength,depositorlength:depositorlength,borrower:borrower,depositor:depositor,user:req.user.rows[0].user_id,usercount:usercount,lastlogin:lastlogin,moment:moment,reportcounts:reportcounts,downloadcounts:downloadcounts,datecheck:datecheck,activeuser:activeuser
                  });
              });
});
        }
      if(queryres=='RU'){ 
        pdbconnect.query("UPDATE users SET login_attempts=$1,last_login=$2 where LOWER(user_name)=LOWER($3)",[attempts,now,username]);
            pdbconnect.query("UPDATE login SET login_check=$1 where LOWER(user_name) = LOWER($2)",['Y',username]);
            pdbconnect.query("SELECT COUNT(login_check) FROM login where login_check=$1",['Y'], function(err, activeusers) {
                  // res.redirect('/users/userdashboard');
                activeuser=activeusers.rows['0'].count;
                    pdbconnect.query("SELECT COUNT(generated_time) AS generated_time FROM generation_queue where (DATE(generated_time)>=CURRENT_DATE AND DATE(generated_time) < CURRENT_DATE + INTERVAL '1 DAY') AND (status IN ('Triggered Successfully','Report Generated Sucessfully','In Progress','Failed') AND(user_id=$1 AND del_flag=$2));",[req.user.rows[0].user_id,'N'], function(err, downloadcount) {
            console.log('downloadcountttt::::',downloadcount)
            if (err) {
                console.error('Error with table query', err);
            } else {
          downloadcounts=downloadcount.rows['0'].generated_time;
          console.log('reportcounts',downloadcounts)
        }
                  res.render('user-dashboard/userDashboard',{
              borrowerlength:borrowerlength,depositorlength:depositorlength,borrower:borrower,depositor:depositors, user:req.user.rows[0].user_id,lastlogin:lastlogin,moment:moment,reportcounts:reportcounts,downloadcounts:downloadcounts,datecheck:datecheck,sessiontimeout:sessiontimeout,activeuser:activeuser
                  });
              });  
              });   
        }
      }

   else if(queryres=='HU'){
    attempts=0;


         if(usertype==hu[0]){
          pdbconnect.query("UPDATE users SET login_attempts=$1,last_login=$2 where LOWER(user_name)=LOWER($3)",[attempts,now,username]);
            pdbconnect.query("UPDATE login SET login_check=$1 where LOWER(user_name) = LOWER($2)",['Y',username]);
            pdbconnect.query("SELECT COUNT(login_check) FROM login where login_check=$1",['Y'], function(err, activeusers) {
                console.log('activeusers::::::::::',activeusers);
                activeuser=activeusers.rows['0'].count;
                console.log('activeuser:::',activeuser);
                    pdbconnect.query("SELECT COUNT(generated_time) AS generated_time FROM generation_queue where (DATE(generated_time)>=CURRENT_DATE AND DATE(generated_time) < CURRENT_DATE + INTERVAL '1 DAY') AND (status IN ('Triggered Successfully','Report Generated Sucessfully','In Progress','Failed') AND(user_id=$1 AND del_flag=$2));",[req.user.rows[0].user_id,'N'], function(err, downloadcount) {
            console.log('downloadcountttt::::',downloadcount)
            if (err) {
                console.error('Error with table query', err);
            } else {
          downloadcounts=downloadcount.rows['0'].generated_time;
          console.log('reportcounts',downloadcounts)
        }
         res.render('admin-dashboard/adminDashboard',{
                     borrowerlength:borrowerlength,depositorlength:depositorlength,borrower:borrower,depositor:depositor, user:req.user.rows[0].user_id,usercount:usercount,lastlogin:lastlogin,moment:moment,reportcounts:reportcounts,downloadcounts:downloadcounts,datecheck:datecheck,activeuser:activeuser
                  });
            });
            });
           }
     
         else if(usertype==hu[1]){
            pdbconnect.query("UPDATE users SET login_attempts=$1,last_login=$2 where LOWER(user_name) = LOWER($3)",[attempts,now,username]);
            pdbconnect.query("UPDATE login SET login_check=$1 where LOWER(user_name) =  LOWER($2)",['Y',username]);
            pdbconnect.query("SELECT COUNT(login_check) FROM login where login_check=$1",['Y'], function(err, activeusers) {
                activeuser=activeusers.rows['0'].count;
                 pdbconnect.query("SELECT COUNT(generated_time) AS generated_time FROM generation_queue where (DATE(generated_time)>=CURRENT_DATE AND DATE(generated_time) < CURRENT_DATE + INTERVAL '1 DAY') AND (status IN ('Triggered Successfully','Report Generated Sucessfully','In Progress','Failed') AND(user_id=$1 AND del_flag=$2));",[req.user.rows[0].user_id,'N'], function(err, downloadcount) {
            console.log('downloadcountttt::::',downloadcount)
            if (err) {
                console.error('Error with table query', err);
            } else {
          downloadcounts=downloadcount.rows['0'].generated_time;
          console.log('reportcounts',downloadcounts)
        }
                res.render('user-dashboard/userDashboard',{
                    borrowerlength:borrowerlength,depositorlength:depositorlength,borrower:borrower,depositor:depositor, user:req.user.rows[0].user_id,lastlogin:lastlogin,moment:moment,reportcounts:reportcounts,downloadcounts:downloadcounts,datecheck:datecheck,sessiontimeout:sessiontimeout,activeuser:activeuser
                  });
            });
});
        } 
        }

       else {
        req.flash('error',"Please login with valid user id and user type combination.")
          res.redirect('/');
        }  
        }
        else
        {
          req.flash('error','Your Account is locked. Please contact administrator.');
          res.redirect('/');
        } 
        }
        else{
              req.flash('error','User is already logged in');
              res.redirect('/');
        }  
         
         }); 
           });
      });


  };
module.exports = router;
