var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();

console.log('vanthuten messages');

router.get('/deleteMessagesInbox', deleteMessagesInbox);
router.get('/deleteMessagesSentItems', deleteMessagesSentItems);


  function deleteMessagesInbox(req,res){
var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;
var emp_name =req.user.rows[0].user_name;
var my_name =req.user.rows[0].user_name;
var msg_id = req.query.id;
 var now = new Date();
var lchgtime=now;

  pdbconnect.query("UPDATE  messages set   del_flg = $1, lchg_user_id = $2 , lchg_time = $3 where  msg_id = $4 ",['Y',emp_id,lchgtime , msg_id],function(err,done){
              if (err) {
                console.error('Error with table query', err);
            } else {
//               console.log('111111111111111111111111111');
              
              }
  


pdbconnect.query("SELECT emp.emp_name,msg.rcre_time, msg.read_flg, msg.msg_id, msg.from_user_id, msg.to_user_id, msg.subject, msg.message_content FROM messages msg, emp_master_tbl emp where msg.to_user_id = $1  and msg.del_flg = $2 and msg.from_user_id = emp.emp_id order by msg.msg_id desc" ,[emp_id,'N'], function(err, result) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = result.rowCount
            	rowData = result.rows;
            //  console.log('222222222222222222222222222222');

            	
            	}

pdbconnect.query("SELECT * FROM messages  where del_flg = $1 and to_user_id = $2 and read_flg= $3" ,['N',emp_id,'N'], function(err, unreadCountList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                unReadCount = unreadCountList.rowCount
                //rowData = result.rows;
            //    console.log('333333333333333333333333333333');
                
                }



            	
        	pdbconnect.query("SELECT emp_name, emp_id FROM emp_master_tbl  where del_flg = $1  order by emp_name asc" ,['N'], function(err, empList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = empList.rowCount;
                empData = empList.rows;

                
                }

  res.render('messages/messages',{
   rowData:rowData,
   empData:empData,
   unReadCount:unReadCount,
   emp_id:emp_id,
   emp_name:emp_name,
  emp_access:emp_access
	 

});
  
});
});
});
});
}

  function deleteMessagesSentItems(req,res){
var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;
var emp_name =req.user.rows[0].user_name;
var my_name =req.user.rows[0].user_name;
var msg_id = req.query.id;
 var now = new Date();
var lchgtime=now;

  pdbconnect.query("UPDATE  messages set   del_flg_sent = $1, lchg_user_id = $2 , lchg_time = $3 where  msg_id = $4 ",['Y',emp_id,lchgtime , msg_id],function(err,done){
              if (err) {
                console.error('Error with table query', err);
            } else {
//               console.log('111111111111111111111111111');
              
              }
  


pdbconnect.query("SELECT emp.emp_name ,msg.rcre_time, msg.read_flg, msg.msg_id, msg.from_user_id, msg.to_user_id, msg.subject, msg.message_content FROM messages msg, emp_master_tbl emp where msg.from_user_id = $1  and msg.del_flg_sent = $2 and msg.to_user_id = emp.emp_id order by msg.msg_id desc" ,[emp_id,'N'], function(err, result) {
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
    

  res.render('messages/sentItems',{
   rowData:rowData,
   empData:empData,
   emp_id:emp_id,
   emp_name:emp_name,
   emp_access:emp_access,
   eid:req.user.rows[0].user_id,
   ename:req.user.rows[0].user_name

   

});
  
});
});
});
}

module.exports = router;
