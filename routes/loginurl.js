var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //console.log("hi ffdfdf");
  res.render('loginModule/login');
});


module.exports = router;
