var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();

console.log('vanthuten send message');

router.post('/sendMessages', function (req,res){
var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;
var my_name =req.user.rows[0].user_name;

 var now = new Date();
var lchgtime=now;
console.log('req value' ,req.body);

var message_content = req.body.message_content;
var to_user_id = req.body.to_user_id;
var subject = req.body.subject;

//INSERT INTO public.messages(
  //to_user_id, from_user_id, message_content, read_flg, del_flg, rcre_user_id, rcre_time, lchg_user_id, lchg_time, subject, msg_id, free_text_3)
  //VALUES ('1408', '1430', 'this is text message from someone', 'N', 'N', '1430', null, '1430', null, 'mail mail', null, null);
      pdbconnect.query("SELECT * from messages",function(err,done){
             if (err) {
                console.error('Error with table query', err);
            } else {
               msg_id_value = done.rowCount;
              console.log('msg_id_value',msg_id_value);
               msg_id_value = msg_id_value +100;
               console.log('msg_id_value1',msg_id_value);
              msg_id = msg_id_value+1;
              console.log('msg_id',msg_id);
            }

              pdbconnect.query("SELECT emp_name, emp_id FROM emp_master_tbl  where del_flg = $1  order by emp_name asc" ,['N'], function(err, empList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = empList.rowCount;
                empData = empList.rows;

                
                }
    

 pdbconnect.query("INSERT INTO messages(to_user_id, from_user_id, message_content, read_flg, del_flg, rcre_user_id, rcre_time, lchg_user_id, lchg_time, subject, msg_id,del_flg_sent) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",[to_user_id,emp_id,message_content,'N','N',emp_id,now,emp_id,now,subject,msg_id,'N'],function(err,done){
             if(err) throw err;
              });
            

  res.render('messages/sendMessages',{
   rowData:rowData,
   my_name:my_name,
   emp_id:emp_id,
   empData:empData,
   emp_access:emp_access,
   eid:req.user.rows[0].user_id,
   ename:req.user.rows[0].user_name

	 

});
  
});
});
      });


// birthday wishes post

router.post('/sendWishes', function (req,res){
var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;
var my_name =req.user.rows[0].user_name;

 var now = new Date();
var lchgtime=now;
console.log('req value' ,req.body);

var message_content = req.body.message_content;
var to_user_id = req.body.to_user_id;
var subject = req.body.subject;

      pdbconnect.query("SELECT * from messages",function(err,done){
             if (err) {
                console.error('Error with table query', err);
            } else {
               msg_id_value = done.rowCount;
              console.log('msg_id_value',msg_id_value);
               msg_id_value = msg_id_value +100;
               console.log('msg_id_value1',msg_id_value);
              msg_id = msg_id_value+1;
              console.log('msg_id',msg_id);
            }

              pdbconnect.query("SELECT emp_name, emp_id FROM emp_master_tbl  where del_flg = $1  order by emp_name asc" ,['N'], function(err, empList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = empList.rowCount;
                empData = empList.rows;

                
                }
    

 pdbconnect.query("INSERT INTO messages(to_user_id, from_user_id, message_content, read_flg, del_flg, rcre_user_id, rcre_time, lchg_user_id, lchg_time, subject, msg_id,del_flg_sent) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",[to_user_id,emp_id,message_content,'N','N',emp_id,now,emp_id,now,subject,msg_id,'N'],function(err,done){
             if(err) throw err;
              });
            

                                req.flash('sucess',"Wishes has been sent Successfully.")
				res.redirect('/admin-dashboard/adminDashboard/admindashboard');
});
});
      });

// end of logic 

module.exports = router;
