var express = require('express');
var router = express.Router();
var mislog=require('winston');


//Authentication
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('error_msg', 'You are not Logged In');
    res.redirect('/');               
  }
}


module.exports = router;  