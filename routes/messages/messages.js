var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();

console.log('vanthuten messages');

router.get('/messages', function (req,res){
var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;
var emp_name =req.user.rows[0].user_name;
pdbconnect.query("SELECT emp.emp_name,msg.rcre_time, msg.read_flg, msg.msg_id, msg.from_user_id, msg.to_user_id, msg.subject, msg.message_content FROM messages msg, emp_master_tbl emp where msg.to_user_id = $1  and msg.del_flg = $2 and msg.from_user_id = emp.emp_id order by msg.msg_id desc" ,[emp_id,'N'], function(err, result) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = result.rowCount
            	rowData = result.rows;
        console.log('rowData messages',rowData);
            	
            	}

pdbconnect.query("SELECT * FROM messages  where del_flg = $1 and to_user_id = $2 and read_flg= $3" ,['N',emp_id,'N'], function(err, unreadCountList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                unReadCount = unreadCountList.rowCount
                //rowData = result.rows;

                
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
   emp_access:emp_access,	
   eid:req.user.rows[0].user_id,
   ename:req.user.rows[0].user_name
});
  
});
});
});

});


router.get('/birthdaywishes', function (req,res){
var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;
var emp_name =req.user.rows[0].user_name;
var now = new Date();
pdbconnect.query("SELECT emp.emp_name,msg.rcre_time, msg.read_flg, msg.msg_id, msg.from_user_id, msg.to_user_id, msg.subject, msg.message_content FROM messages msg, emp_master_tbl emp where msg.to_user_id = $1  and msg.del_flg = $2 and msg.from_user_id = emp.emp_id order by msg.msg_id desc" ,[emp_id,'N'], function(err, result) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = result.rowCount
            	rowData = result.rows;
        console.log('rowData messages',rowData);
            	
            	}

pdbconnect.query("SELECT * FROM messages  where del_flg = $1 and to_user_id = $2 and read_flg= $3" ,['N',emp_id,'N'], function(err, unreadCountList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                unReadCount = unreadCountList.rowCount
                //rowData = result.rows;

                
                }

            	
            pdbconnect.query("SELECT emp_name,emp_id, cast(dob + ((extract(year from age(dob)) + 1) * interval '1' year) as date) as next_birthday from emp_info_tbl where del_flg = $1   order by next_birthday asc " ,['N'], function(err, empList) {

            if (err) {
                console.error('Error with table query', err);
            } else {
                usersCount = empList.rowCount;
                var empData = empList.rows;

                
                }

  res.render('messages/birthdaywishes',{
   rowData:rowData,
   empData:empData,
   currentDate:now,
   unReadCount:unReadCount,
   emp_id:emp_id,
   emp_name:emp_name,
   emp_access:emp_access,	
   eid:req.user.rows[0].user_id,
   ename:req.user.rows[0].user_name
});
  
});
});
});

});

module.exports = router;
