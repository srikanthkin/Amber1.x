console.log("model user");
var bcrypt = require('bcryptjs');
var pdbconnect=require('../routes/database/psqldbconnect');
//comparing login username
module.exports.getUserByUsername = function(username,callback){

    var query=pdbconnect.query("SELECT u.user_name,u.password,u.user_id,u.user_type,u.client_ip,u.session_id FROM users u WHERE LOWER(u.user_id) = LOWER($1)",[username],function(err,result){
        if(err) throw err;
        console.log('result user',result.rows);
        callback(null,result);
    });
}
module.exports.getUserByUsernamepwd1 = function(username,callback){
    
    var query=pdbconnect.query("SELECT user_name,password,user_id,user_type,client_ip,session_id FROM users WHERE user_id=$1",[username],function(err,result){
        if(err) throw err;
        callback(null,result);
    });
}

module.exports.getUserById = function(id,callback)
{
     
        pdbconnect.query("SELECT u.user_name,u.user_id,u.user_type,u.client_ip,u.session_id FROM users u WHERE u.user_id=$1",[id],function(err,result){
       
        if(err) throw err;;   
        callback(err,result);
});
    }

module.exports.comparePassword = function(candidatePassword,hash,callback ){
    console.log("comparing password while login")
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
 
    if(err) throw err;
      callback(null,isMatch);
      console.log("pwd checking3")
 
});
}
module.exports.comparePasswordpwd = function(candidatePassword,hash,callback ){
   // console.log("comparing password while login")

    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if(err) throw err;
      callback(null,isMatch);
      // console.log("pwd checking3")
             //  console.log(isMatch);

 
});
}

