var express = require('express');
var router = express.Router();
var app = express();
var Promise = require('mpromise');
var pdbconnect=require('../../routes/database/psqldbconnect');
var User = require('../../models/user');
var ensureAuthenticated=require('../../routes/utils/utils');
var moment = require('moment');
var rp = require('request-promise');
var mislog=require('winston');
var generator = require('generate-password');
var nodemailer = require('nodemailer');
var bcrypt = require('bcryptjs');
var arrayDifference = require("array-difference");
var mislog=require('winston');
var dateFormat = require('dateformat');
var generatePassword = require("password-generator");

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// Add Mode ////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/commonDetails',function(req,res)
{
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

	var empid = req.user.rows['0'].user_id;
	var code_id = "";
	var comm_code_id = "";
	var comm_code_desc = "";

	pdbconnect.query("SELECT user_type from users where user_id = $1",[empid],function(err,result){
	var emp_access=result.rows['0'].user_type;

        if(emp_access != "A1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {
		res.render('commoncodeModule/commonDetails',
		{
			emp_access:emp_access,
			ename:req.user.rows['0'].user_name,
			eid:req.user.rows['0'].user_id,
			code_id:code_id,
			comm_code_id:comm_code_id,
			comm_code_desc:comm_code_desc
		});
	}

	});
});


///////////////////////////////////////////////////// Add Post /////////////////////////////////////////////////////////////////

router.post('/addcode',addcode);
function addcode(req , res)
{

	var empid = req.user.rows['0'].user_id;
	var code_id = req.body.code_id;
	var comm_code_id = req.body.comm_code_id;
	var comm_code_desc = req.body.comm_code_desc;

	pdbconnect.query("SELECT user_type from users where user_id = $1",[empid],function(err,result){
	var emp_access=result.rows['0'].user_type;

	pdbconnect.query("SELECT * from common_code_tbl where code_id = $1 and del_flg='N'",[code_id],function(err,result){
	var rcount_tbl=result.rowCount;

	if(rcount_tbl == "0")
	{

		pdbconnect.query("insert into common_code_tbl(code_id,comm_code_id,comm_code_desc,del_flg) values($1,$2,$3,$4)",[code_id,comm_code_id,comm_code_desc,'N'],function(err,result)
		{
			if(err) throw err;

 			req.flash('success',"Code ID : " + code_id + " with Common Code ID : " + comm_code_id + " has been added successfully.")
                	res.redirect('/commoncodeModule/commonDetails/commonDetails');
		});

	}
	else
	{
		pdbconnect.query("SELECT * from common_code_tbl where code_id = $1 and comm_code_id = $2 and del_flg='N'",[code_id,comm_code_id],function(err,result){
		var rcount_tbl_comm_code_id = result.rowCount;

                if(rcount_tbl_comm_code_id == "0")
                {

			pdbconnect.query("insert into common_code_tbl(code_id,comm_code_id,comm_code_desc,del_flg) values($1,$2,$3,$4)",[code_id,comm_code_id,comm_code_desc,'N'],function(err,result)
                	{
                        	if(err) throw err;

                        	req.flash('success',"Code ID : " + code_id + " with Common Code ID : " + comm_code_id + " has been added successfully.")
                        	res.redirect('/commoncodeModule/commonDetails/commonDetails');
                	});
                }
                else
                {
			var error = "Common Code Id: " + comm_code_id + " already exists for this Code Id: " + code_id + "."; 

                        res.render('commoncodeModule/commonDetails',
                        {
                                emp_access:emp_access,
                                error:error,
                                ename:req.user.rows['0'].user_name,
                                eid:req.user.rows['0'].user_id,
                                code_id:code_id,
                                comm_code_id:comm_code_id,
                                comm_code_desc:comm_code_desc
                        });

                }
                });
	}
	});
	});
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// Copy Mode /////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/commonDetailsCopy',function(req,res)
{
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

        var empid = req.user.rows['0'].user_id;
        var comm_code_id = "";
        var comm_code_desc = "";

        pdbconnect.query("SELECT user_type from users where user_id = $1",[empid],function(err,result){
        var emp_access=result.rows['0'].user_type;

        if(emp_access != "A1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {

		pdbconnect.query("SELECT code_id,comm_code_id,comm_code_desc from common_code_tbl where del_flg='N' order by code_id asc",function(err,result){
		data_array=result.rows;
		data_array_count=result.rowCount;


			res.render('commoncodeModule/commonDetailsCopy',
			{
				emp_access:emp_access,
				ename:req.user.rows['0'].user_name,
				eid:req.user.rows['0'].user_id,
				data_array:data_array,
				data_array_count:data_array_count
			});

		});
	}
        });
});

///////////////////////////////////////////////////// Taking to next page  /////////////////////////////////////////////////////////////////

router.post('/copycode',copycode);
function copycode(req , res)
{

        var array = req.body.button;
        var empid = req.user.rows['0'].user_id;

        pdbconnect.query("SELECT user_type from users where user_id = $1",[empid],function(err,result){
        var emp_access=result.rows['0'].user_type;


        pdbconnect.query("SELECT code_id,comm_code_id,comm_code_desc from common_code_tbl where del_flg='N' order by code_id asc",function(err,result){

        var code_id = result.rows[array].code_id;
        var comm_code_id = result.rows[array].comm_code_id;
        var comm_code_desc = result.rows[array].comm_code_desc;


        res.render('commoncodeModule/commonDetailsCopyNext',
        {
                emp_access:emp_access,
                ename:req.user.rows['0'].user_name,
                eid:req.user.rows['0'].user_id,
                code_id:code_id,
                comm_code_id:comm_code_id,
                comm_code_desc:comm_code_desc
        });

        });
        });

}

///////////////////////////////////////////////////// copying the code id  ////////////////////////////////////////////////

router.post('/copytotbl',copytotbl);
function copytotbl(req , res)
{

        var empid = req.user.rows['0'].user_id;
        var code_id = req.body.code_id;
        var comm_code_id = req.body.comm_code_id;
        var comm_code_desc = req.body.comm_code_desc;

        pdbconnect.query("SELECT user_type from users where user_id = $1",[empid],function(err,result){
        var emp_access=result.rows['0'].user_type;

        pdbconnect.query("SELECT * from common_code_tbl where code_id = $1 and del_flg='N'",[code_id],function(err,result){
        var rcount_tbl=result.rowCount;

        if(rcount_tbl == "0")
        {

                pdbconnect.query("insert into common_code_tbl(code_id,comm_code_id,comm_code_desc,del_flg) values($1,$2,$3,$4)",[code_id,comm_code_id,comm_code_desc,'N'],function(err,result)
                {
                        if(err) throw err;

                        req.flash('success',"Code ID : " + code_id + " with Common Code ID : " + comm_code_id + " has been copied successfully.")
                        res.redirect('/commoncodeModule/commonDetails/commonDetailsCopy');
                });

        }
        else
        {
                pdbconnect.query("SELECT * from common_code_tbl where code_id = $1 and comm_code_id = $2 and del_flg='N'",[code_id,comm_code_id],function(err,result){
                var rcount_tbl_comm_code_id = result.rowCount;

                if(rcount_tbl_comm_code_id == "0")
                {

                        pdbconnect.query("insert into common_code_tbl(code_id,comm_code_id,comm_code_desc,del_flg) values($1,$2,$3,$4)",[code_id,comm_code_id,comm_code_desc,'N'],function(err,result)
                        {
                                if(err) throw err;

                                req.flash('success',"Code ID : " + code_id + " with Common Code ID : " + comm_code_id + " has been copied successfully.")
                                res.redirect('/commoncodeModule/commonDetails/commonDetailsCopy');
                        });
                }
                else
                {
                        var error = "Common Code Id: " + comm_code_id + " already exists for this Code Id: " + code_id + ".";

                        res.render('commoncodeModule/commonDetailsCopy',
                        {
                                emp_access:emp_access,
                                error:error,
                                ename:req.user.rows['0'].user_name,
                                eid:req.user.rows['0'].user_id,
                                code_id:code_id,
                                comm_code_id:comm_code_id,
                                comm_code_desc:comm_code_desc
                        });

                }
                });
        }
        });
        });
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// Modify Mode /////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/commonDetailsModify',function(req,res)
{
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

        var empid = req.user.rows['0'].user_id;
        var comm_code_id = "";
        var comm_code_desc = "";

        pdbconnect.query("SELECT user_type from users where user_id = $1",[empid],function(err,result){
        var emp_access=result.rows['0'].user_type;

        if(emp_access != "A1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {
		pdbconnect.query("SELECT code_id,comm_code_id,comm_code_desc from common_code_tbl where del_flg='N' order by code_id asc",function(err,result){
		data_array=result.rows;
		data_array_count=result.rowCount;


			res.render('commoncodeModule/commonDetailsModify',
			{
				emp_access:emp_access,
				ename:req.user.rows['0'].user_name,
				eid:req.user.rows['0'].user_id,
				data_array:data_array,
				data_array_count:data_array_count
			});

		});
	}
        });
});

///////////////////////////////////////////////////// Taking to next page  /////////////////////////////////////////////////////////////////

router.post('/modifycode',modifycode);
function modifycode(req , res)
{

	var array = req.body.button;
	var empid = req.user.rows['0'].user_id;
        
	pdbconnect.query("SELECT user_type from users where user_id = $1",[empid],function(err,result){
        var emp_access=result.rows['0'].user_type;


 	pdbconnect.query("SELECT code_id,comm_code_id,comm_code_desc from common_code_tbl where del_flg='N' order by code_id asc",function(err,result){

        var code_id = result.rows[array].code_id;
        var comm_code_id = result.rows[array].comm_code_id;
        var comm_code_desc = result.rows[array].comm_code_desc;


	res.render('commoncodeModule/commonDetailsModifyNext',
	{
		emp_access:emp_access,
		ename:req.user.rows['0'].user_name,
		eid:req.user.rows['0'].user_id,
		code_id:code_id,
		comm_code_id:comm_code_id,
		comm_code_desc:comm_code_desc
	});

	});
	});

}

/////////////////////////////////////////// modify Post /////////////////////////////////////////////////////////////////

router.post('/updatecode',updatecode);
function updatecode(req , res)
{
        var empid = req.user.rows['0'].user_id;
        var code_id = req.body.code_id;
        var comm_code_id = req.body.comm_code_id;
        var comm_code_desc = req.body.comm_code_desc;

        pdbconnect.query("SELECT user_type from users where user_id = $1",[empid],function(err,result){
        var emp_access=result.rows['0'].user_type;

	pdbconnect.query("update common_code_tbl set comm_code_desc=$3 where code_id=$1 and comm_code_id=$2",[code_id,comm_code_id,comm_code_desc],function(err,result)
	{
		if(err) throw err;

		req.flash('success',"Code ID : " + code_id + " with Common Code ID : " + comm_code_id + " has been modified successfully.")
		res.redirect('/commoncodeModule/commonDetails/commonDetailsModify');
	});
        });
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// View Mode ///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


router.get('/commonDetailsView',function(req,res)
{
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

        var empid = req.user.rows['0'].user_id;
        var comm_code_id = "";
        var comm_code_desc = "";

        pdbconnect.query("SELECT user_type from users where user_id = $1",[empid],function(err,result){
        var emp_access=result.rows['0'].user_type;

        if(emp_access != "A1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {
		pdbconnect.query("SELECT code_id,comm_code_id,comm_code_desc from common_code_tbl where del_flg='N' order by code_id asc",function(err,result){
		data_array=result.rows;
		data_array_count=result.rowCount;


			res.render('commoncodeModule/commonDetailsView',
			{
				emp_access:emp_access,
				ename:req.user.rows['0'].user_name,
				eid:req.user.rows['0'].user_id,
				data_array:data_array,
				data_array_count:data_array_count
			});

		});
	}
        });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// Delete Mode /////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/commonDetailsDelete',function(req,res)
{
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

        var empid = req.user.rows['0'].user_id;
        var comm_code_id = "";
        var comm_code_desc = "";

        pdbconnect.query("SELECT user_type from users where user_id = $1",[empid],function(err,result){
        var emp_access=result.rows['0'].user_type;

        if(emp_access != "A1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {
		pdbconnect.query("SELECT code_id,comm_code_id,comm_code_desc from common_code_tbl where del_flg='N' order by code_id asc",function(err,result){
		data_array=result.rows;
		data_array_count=result.rowCount;


			res.render('commoncodeModule/commonDetailsDelete',
			{
				emp_access:emp_access,
				ename:req.user.rows['0'].user_name,
				eid:req.user.rows['0'].user_id,
				data_array:data_array,
				data_array_count:data_array_count
			});

		});
	}
        });
});

/////////////////////////////////////////// taking to next page for delete //////////////////////////////////////////////////////////////

router.post('/delcode',delcode);
function delcode(req , res)
{

        var array = req.body.button;
        var empid = req.user.rows['0'].user_id;

        pdbconnect.query("SELECT user_type from users where user_id = $1",[empid],function(err,result){
        var emp_access=result.rows['0'].user_type;


        pdbconnect.query("SELECT code_id,comm_code_id,comm_code_desc from common_code_tbl where del_flg='N' order by code_id asc",function(err,result){

        var code_id = result.rows[array].code_id;
        var comm_code_id = result.rows[array].comm_code_id;
        var comm_code_desc = result.rows[array].comm_code_desc;


        res.render('commoncodeModule/commonDetailsDeleteNext',
        {
                emp_access:emp_access,
                ename:req.user.rows['0'].user_name,
                eid:req.user.rows['0'].user_id,
                code_id:code_id,
                comm_code_id:comm_code_id,
                comm_code_desc:comm_code_desc
        });

        });
        });

}

/////////////////////////////////////////// delete record to insert into history //////////////////////////////////////////////////

router.post('/delfromtbl',delfromtbl);
function delfromtbl(req , res)
{

        var empid = req.user.rows['0'].user_id;
        var code_id = req.body.code_id;
        var comm_code_id = req.body.comm_code_id;
        var comm_code_desc = req.body.comm_code_desc;

        pdbconnect.query("SELECT user_type from users where user_id = $1",[empid],function(err,result){
        var emp_access=result.rows['0'].user_type;

        pdbconnect.query("select * from common_code_tbl_hist where code_id=$1 and comm_code_id=$2",[code_id,comm_code_id],function(err,result){
	var hscount = result.rowCount;

	if(hscount == "0")
	{

	        pdbconnect.query("insert into common_code_tbl_hist select * from common_code_tbl where code_id=$1 and comm_code_id=$2 and comm_code_desc=$3",[code_id,comm_code_id,comm_code_desc],function(err,result)
        	{
			if(err) throw err;

	    		pdbconnect.query("delete from common_code_tbl where code_id=$1 and comm_code_id=$2 and comm_code_desc=$3",[code_id,comm_code_id,comm_code_desc],function(err,result){
			if(err) throw err;

		req.flash('success',"Code ID : " + code_id + " with Common Code ID : " + comm_code_id + " has been deleted successfully.")
		res.redirect('/commoncodeModule/commonDetails/commonDetailsDelete');

		});
        });
	}
	else
	{
                pdbconnect.query("update common_code_tbl_hist set code_id=$1,comm_code_id=$2,comm_code_desc=$3 where code_id=$1 and comm_code_id=$2",[code_id,comm_code_id,comm_code_desc],function(err,result)
                {
                        if(err) throw err;

                        pdbconnect.query("delete from common_code_tbl where code_id=$1 and comm_code_id=$2 and comm_code_desc=$3",[code_id,comm_code_id,comm_code_desc],function(err,result){
                        if(err) throw err;

                req.flash('success',"Code ID : " + code_id + " with Common Code ID : " + comm_code_id + " has been deleted successfully.")
                res.redirect('/commoncodeModule/commonDetails/commonDetailsDelete');

                });
                });
	}
        });
        });

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// FAQ's ///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


router.get('/commoncodeFAQDetails',commoncodeFAQDetails);
function commoncodeFAQDetails(req,res)
{
        var emp_id = req.user.rows[0].user_id;
        var emp_name =req.user.rows[0].user_name;

        pdbconnect.query("SELECT user_type from users where user_id = $1",[emp_id],function(err,result){
        var emp_access=result.rows['0'].user_type;

        if(emp_access != "A1")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {
		res.render('commoncodeModule/commoncodeFAQDetails',{
		emp_id:emp_id,
		emp_name:emp_name,
		emp_access:emp_access
        					
	 });
	}

	});
};


///////////////////////////////////////////// End Of Logic /////////////////////////////////////////////////////////////////

module.exports = router;
