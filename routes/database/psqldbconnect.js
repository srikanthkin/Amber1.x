var pg = require("pg");
require('dotenv').config()
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
 
var hw = encrypt("magicmis")

var config = {
  user:'portal',
  database:'IS_Live',
  password:'Poquahv3',
  host:'192.168.168.10',
  port:5432,
  max:10000,
  idleTimeoutMillis: 30000,
};

/*var config = {
  user:'postgres',
  database:'rakesh',
  password:decrypt(hw),
  host:'192.168.168.29',
  port:'5432',
  max:10,
  idleTimeoutMillis: 30000,
  
};*/

//Dev Environment Public IP

/*var config = {
  user:'postgres',
  database:'devenvironment',
  password:'magicmis',
  host:'182.74.74.124',
  port:'5432',
  max:10,
  idleTimeoutMillis: 30000,
};

*/

var pool = new pg.Pool(config);

pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);

  }
  console.log("Connection Successfully  Established with Postgres");
  done();
  console.log("Hello")
});
module.exports = pool;
