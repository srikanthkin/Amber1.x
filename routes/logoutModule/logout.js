var express = require('express');
var router = express.Router();

var pdbconnect=require('../../routes/database/psqldbconnect');
var ensureAuthenticated=require('../../routes/utils/utils');

router.get('/logout',ensureAuthenticated,logout);

function logout(req,res){
console.log('user_type',req.user.rows['0'].user_type)
console.log('emp_name',req.user.rows['0'].user_name)

var userid=req.user.rows[0].user_id;
 pdbconnect.query("UPDATE users SET login_check=$1,client_ip='',session_id='' where user_id=$2",['N',userid]);
  req.logout();
  req.flash('success_msg','You are successfully Logged Out');
  res.redirect('/');
};

module.exports = router;
