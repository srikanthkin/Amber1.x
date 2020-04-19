var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();

console.log('vanthuten messages');

router.get('/viewMessages', function (req,res){
var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;
var my_name =req.user.rows[0].user_name;
var msg_id = req.query.id;
 var now = new Date();
var lchgtime=now;

pdbconnect.query("SELECT emp.emp_name,emp.emp_email ,msg.rcre_time, msg.read_flg, msg.msg_id, msg.from_user_id, msg.to_user_id, msg.subject, msg.message_content FROM messages msg, emp_master_tbl emp where msg.to_user_id = $1  and msg.del_flg = $2 and msg.from_user_id = emp.emp_id and msg.msg_id =$3" ,[emp_id,'N',msg_id], function(err, result) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = result.rowCount
            	rowData = result.rows;

            	
            	}

               pdbconnect.query("SELECT emp_name, emp_id FROM emp_master_tbl  where del_flg = $1  order by emp_name asc" ,['N'], function(err, empList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = empList.rowCount;
                empData = empList.rows;

                
                }
            	
         pdbconnect.query("UPDATE  messages set   read_flg = $1, lchg_user_id = $2 , lchg_time = $3 where  msg_id = $4 ",['Y',emp_id,lchgtime , msg_id],function(err,done){
             if(err) throw err;
              }); 	

  res.render('messages/viewMessages',{
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

module.exports = router;
