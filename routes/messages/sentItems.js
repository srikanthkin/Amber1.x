var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();

console.log('vanthuten messages');

router.get('/sentItems', function (req,res){
var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;
var emp_name =req.user.rows[0].user_name;
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

module.exports = router;
