var express = require('express');
var multer = require('multer');
var app = express();
var path = require('path');
var util = require('util');
var fs = require('fs');

var archiver = require('archiver'),
    archive  = archiver('zip');

var moment = require('moment');
var formidable = require("formidable");
var router = express.Router();
var bodyParser = require('body-parser');
var pdbconnect=require('../../routes/database/psqldbconnect');
var nodemailer = require('nodemailer');
var invalidAccessRedirect = require('../../routes/invalidAccess');
var mailId = "";
var name = "";
var emp = "";
var newName = "";
var emp_name = "";
var oldPath = "";
var testFolder = "";
var cpath = [];
var docs = [];
var len = 0, len1 = 0,len2 = 0,plen = 0,rlen = 0,len3 = 0,totLen = 0, totYear = 0;
var govLen = 0, eduLen = 0, medLen = 0,expLen = 0, phLen = 0, resLen = 0, hrLen = 0,cerLen = 0, othrLen =0, bgLen = 0, polLen = 0, policy_count = 0;
var govDocs = [], eduDocs = [], medDocs = [],expDocs = [], phDocs = [], resDocs = [], hrDocs = [], cerDocs = [], othrDocs = [], bgDocs = [], polDocs = [];
var policyTag = "";
var rdocs = [],pdocs = [];
var rpath = [],ppath = [];
var rreas = [];
var resAppr = [];
var empArray = [];
var empNameArray = [];
var magzYear = [], magzDoc = [], magzTot = [],magzQtr = [];
var i=0,j=0;
var empId = "";
var empFile = "";
var txtFile = "";
var doc = "";
var panFlg = "N", aadharFlg = "N", sslcFlg = "N", preunivFlg = "N", degreeFlg = "N";
var updQuery = "", selQuery = "";
var mailCommPath = '/home/portal/central/';

router.get('/cms',function(req,res)
{
	var eid =req.user.rows[0].user_id;
	var ename = req.user.rows[0].user_name;
	var emp_access = req.user.rows[0].user_type;
	if(emp_access == "A1")
	{
		cmsUploadAdmin(req,res);
	}
	else
	{
		
		res.render('cmsModule/cmsUploadEmployee',{ename:ename,eid:eid,emp_access:emp_access});
	}
});

// [ Admin Functions definition Start 19-07-2017 18:30
router.get('/cmsUploadAdmin',cmsUploadAdmin);

function cmsUploadAdmin(req,res)
{
	var eid =req.user.rows[0].user_id;
	var ename = req.user.rows[0].user_name;
	var emp_access = req.user.rows[0].user_type;

	if(emp_access == "A1")
	{
		pdbconnect.query("SELECT emp_id,emp_name from emp_master_tbl where del_flg=$1 order by emp_id asc",['N'],
			function(err,result){
			employee=result.rows;
			emp_id_count=result.rowCount;

			res.render('cmsModule/cmsUploadAdmin',{
			ename:ename,
			eid:eid,
			emp_id_count:emp_id_count,
			employee:employee,
			emp_access:emp_access
			});
		});
	}
	else
	{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
}

router.post('/cmsUploadPostAdmin',cmsUploadPostAdmin);

router.get('/cmsViewAdmin',function(req,res)
{
	var eid =req.user.rows[0].user_id;
	var ename = req.user.rows[0].user_name;
	var emp_access = req.user.rows[0].user_type;

	if(emp_access == "A1")
        {
		pdbconnect.query("SELECT emp_id,emp_name from emp_master_tbl where del_flg=$1 order by emp_id asc",['N'],
			function(err,result){
			employee=result.rows;
			emp_id_count=result.rowCount;

			res.render('cmsModule/cmsViewAdmin',{
			ename:ename,
			eid:eid,
			emp_id_count:emp_id_count,
			employee:employee,
			emp_access:emp_access
			});
		});
	}
	else
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
});

router.post('/cmsViewEmpIdAdmin',cmsViewEmpIdAdmin);

router.get('/cmsApprAdmin',cmsApprAdmin);

router.get('/cmsApprEmpIdAdmin',cmsApprEmpIdAdmin);

router.get('/cmsViewFilesAdmin',cmsViewFilesAdmin);

router.post('/cmsApprPostAdmin',cmsApprPostAdmin);

router.get('/cmsApprRejectAdmin',cmsApprRejectAdmin);

router.get('/cmsApprIndvAdmin',cmsApprIndvAdmin);

router.get('/policyUploadAdmin',function(req,res)
{
        var eid =req.user.rows[0].user_id;
        var ename = req.user.rows[0].user_name;
        var emp_access = req.user.rows[0].user_type;

	if(emp_access == "A1")
        {
		pdbconnect.query("SELECT COMM_CODE_DESC FROM COMMON_CODE_TBL WHERE CODE_ID = 'POL'  ORDER BY COMM_CODE_ID ASC",function(err,result){
		policy=result.rows;
		policy_count=result.rowCount;

		res.render('cmsModule/policyUploadAdmin',{ename:ename,eid:eid,emp_access:emp_access,policy:policy,policy_count:policy_count});
		});
	}
        else
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
});

router.post('/policyUploadPostAdmin',policyUploadPostAdmin);

router.get('/policyViewAdmin',function(req,res) 
{
	policyTag = "";
	policyViewAdmin(req,res);
});

router.all('/policyViewAdminPost',policyViewAdmin);

router.get('/policyViewFilesAdmin',policyViewFilesAdmin);

router.get('/policyDeleteDocs',policyDeleteDocs);

router.get('/policyViewEmployee',policyViewEmployee);

router.all('/policyViewEmployeePost',policyViewEmployee);

router.get('/magazineUploadAdmin',function(req,res)
{
        var eid =req.user.rows[0].user_id;
        var ename = req.user.rows[0].user_name;
        var emp_access = req.user.rows[0].user_type;
	if(emp_access == "A1")
        {
		res.render('cmsModule/magazineUploadAdmin',{ename:ename,eid:eid,emp_access:emp_access});
	}
        else
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
});

router.post('/magazineUploadPostAdmin',magazineUploadPostAdmin);

router.get('/magazineViewAdmin',magazineViewAdmin);

router.get('/magazineViewFilesAdmin',magazineViewFilesAdmin);

router.get('/magazineViewEmployee',magazineViewEmployee);

router.get('/cmsMailDoc',cmsMailDoc);

// ] Admin Functions definition End 19-07-2017 18:30

// [ Employee Functions definition Start 15-07-2017 12:20
router.get('/cmsUploadEmployee',function(req,res)
{
	var eid =req.user.rows[0].user_id;
	var ename = req.user.rows[0].user_name;
	var emp_access = req.user.rows[0].user_type;
	if(emp_access != "A1")
        {
		res.render('cmsModule/cmsUploadEmployee',{ename:ename,eid:eid,emp_access:emp_access});
	}
        else
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
});

router.post('/cmsUploadPostEmployee',cmsUploadPostEmployee);

router.get('/cmsViewEmployee',cmsViewEmployee);

router.get('/cmsViewStatusEmployee',cmsViewStatusEmployee);

router.get('/cmsViewFilesEmployee',cmsViewFilesEmployee);

router.get('/cmsViewFilesEmployeeReject',cmsViewFilesEmployeeReject);

router.get('/cmsDeletePenDocEmployee',cmsDeletePenDocEmployee);

router.get('/cmsDeleteRejDocEmployee',cmsDeleteRejDocEmployee);

// ] Employee Functions End 15-07-2017 12:20


// [ Employee Function operations Start 17-07-2017 09:00
function cmsUploadPostEmployee(req,res)
{
	console.log("hi");
	var emp_access = req.user.rows[0].user_type;
	var eid =req.user.rows[0].user_id;
	if(emp_access != "A1")
        {
		doc = "";
		var form = new formidable.IncomingForm();
		form.parse(req, 
			function (err, fields, files) 
			{
				var empId = eid;
				var docCat = fields["docCat"];
				if(docCat == "1" || docCat == "2")
				{
					var docType = fields["docType"];
					if(docCat == "2")
					{
						if(docType == "12")
						{
							var docTypeText = fields["docTypeText"];
							docTypeText = docTypeText.replace(/ /g,'_').toUpperCase();
						}
					}
				}
				if(docCat == "7" || docCat == "8" || docCat == "4")
				{
					var docCatText = fields["docCatText"];
					docCatText = docCatText.replace(/ /g,'_').toUpperCase();
				}
				if(docCat == "1")
				{ 
					if(docType == "1")
					{
						doc = "GOVT_PASSPORT";
					}
					if(docType == "2")
					{
						doc = "GOVT_PANCARD";
					}
					if(docType == "3")
					{
						doc = "GOVT_VOTERID";
					}
					if(docType == "4")
					{
						doc = "GOVT_DRIVLIC";
					}
					if(docType == "5")
					{
						doc = "GOVT_AADHAR";
					}
				}
				if(docCat == "2")
				{
					if(docType == "1")
					{
						doc = "EDUC_SSLC";
					}
					if(docType == "2")
					{
						doc = "EDUC_PRE_UNIV";
					}
					if(docType == "3")
					{
						doc = "EDUC_SEM1";
					}
					if(docType == "4")
					{
						doc = "EDUC_SEM2";
					}
					if(docType == "5")
					{
						doc = "EDUC_SEM3";
					}
					if(docType == "6")
					{
						doc = "EDUC_SEM4";
					}
					if(docType == "7")
					{
						doc = "EDUC_SEM5";
					}
					if(docType == "8")
					{
						doc = "EDUC_SEM6";
					}
					if(docType == "9")
					{
						doc = "EDUC_SEM7";
					}
					if(docType == "10")
					{
						doc = "EDUC_SEM8";
					}
					if(docType == "11")
					{
						doc = "EDUC_DEGREE";
					}
					if(docType == "12")
					{
						doc = "EDUC_OTHERS_"+docTypeText;
					}
				}
				if(docCat == "3")
				{
					doc = "MEDICAL";
				}
				if(docCat == "4")
				{
					doc = "EXPERIENCE_"+docCatText;
				}
				if(docCat == "5")
				{
					doc = "PHOTO";
				}
				if(docCat == "6")
				{
					doc = "RESUME";
				}
				if(docCat == "7")
				{
					doc = "CERT_"+docCatText;
				}
				if(docCat == "8")
				{
					doc = "OTHR_"+docCatText;
				}

				var dir2 = './data/CMS/employee/uploadDoc/'+empId+"/";
				if (!fs.existsSync(dir2))
				{
					fs.mkdirSync(dir2);
				}
				if(docCat == "5")
				{
					var newName = empId+"_"+doc+"_uv.jpg";
				}
				else if(docCat == "6")
				{
					var newName = empId+"_"+doc+"_uv.doc";
				}
				else
				{
					var newName = empId+"_"+doc+"_uv.pdf";
				}

				var trejFoleder = './data/CMS/employee/rejectDoc/'+empId+"/";
				var treasFoleder = './data/CMS/employee/rejectReason/'+empId+"/";
				if (!fs.existsSync(trejFoleder))
				{
					console.log("No rejected documents");
				}
				else
				{
					fs.readdirSync(trejFoleder).forEach(
					function (name) 
					{
						var searchPattern = empId+"_"+doc;
						var resValue = name.search(searchPattern);
						if(resValue != -1)
						{
							if(doc == "PHOTO")
							{
								var rejFile = trejFoleder + searchPattern+"_rj.jpg";
							}
							else if(doc == "RESUME")
							{
								var rejFile = trejFoleder + searchPattern+"_rj.doc";
							}
							else
							{
								var rejFile = trejFoleder + searchPattern+"_rj.pdf";
							}
							var reasFile = treasFoleder + searchPattern+"_rj.txt";
							fs.unlinkSync(rejFile);
							fs.unlinkSync(reasFile);
						}
					});
				}
				
				var newPath = dir2 + newName;

				fs.rename(oldPath, newPath, 
					function (err) 
					{
						if (err) throw err;
						req.flash('success',"Document Uploaded Successfully")
						res.redirect(req.get('referer'));
					});
			});

		var oldName = "doc.pdf";
		var dir1 = './data/CMS/employee/uploadDoc/'+eid+"/";;
		var oldPath = dir1 + oldName;
		if (!fs.existsSync(dir1))
		{
			fs.mkdirSync(dir1);
		}
		var storage = multer.diskStorage({
			destination: function(req, file, callback) {
				console.log(file);
				callback(null, dir1)
			},
			filename: function(req, file, callback) {
				callback(null,oldName)
			}
		})

		var upload = multer({storage: storage}).single('uploadDoc')
		upload(req, res, function(err) {
			if (err) {
					return res.end("Something went wrong!");
				 }
			});
	}
	else
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
}

function cmsViewEmployee(req,res)
{
	var eid =req.user.rows[0].user_id;
	var ename = req.user.rows[0].user_name;
	var emp_access = req.user.rows[0].user_type;
	if(emp_access != "A1")
	{
		var resValue1;
		govLen = 0;
		eduLen = 0; 
		medLen = 0;
		expLen = 0;
		phLen = 0;
		othrLen = 0;
		resLen = 0;
		hrLen = 0;
		cerLen = 0;
		bgLen = 0;
		var testFolder = './data/CMS/employee/uploadDoc/'+eid+"/";
		if (!fs.existsSync(testFolder))
		{
			req.flash('error',"No records found")
			res.redirect(req.get('referer'));
		}
		else
		{
			fs.readdirSync(testFolder).forEach(
			function (name) 
			{
				var resValue = name.search("uv");
				if(resValue == -1)
				{
					resValue1 = name.search("GOVT");
					if(resValue1 != -1)
					{
						govDocs[govLen] = name;
						govLen = govLen + 1;
					}
					resValue1 = name.search("EDUC");
					if(resValue1 != -1)
					{
						eduDocs[eduLen] = name;
						eduLen = eduLen + 1;
					}
					resValue1 = name.search("MEDICAL");
					if(resValue1 != -1)
					{
						medDocs[medLen] = name;
						medLen = medLen + 1;
					}
					resValue1 = name.search("EXPERIENCE");
					if(resValue1 != -1)
					{
						expDocs[expLen] = name;
						expLen = expLen + 1;
					}
					resValue1 = name.search("PHOTO");
					if(resValue1 != -1)
					{
						phDocs[phLen] = name;
						phLen = phLen + 1;
					}
					resValue1 = name.search("RESUME");
					if(resValue1 != -1)
					{
						resDocs[resLen] = name;
						resLen = resLen + 1;
					}
					resValue1 = name.search("_HR");
					if(resValue1 != -1)
					{
						hrDocs[hrLen] = name;
						hrLen = hrLen + 1;
					}
					resValue1 = name.search("CERT");
					if(resValue1 != -1)
					{
						cerDocs[cerLen] = name;
						cerLen = cerLen + 1;
					}
					resValue1 = name.search("BACKGROUND");
					if(resValue1 != -1)
					{
						bgDocs[bgLen] = name;
						bgLen = bgLen + 1;
					}
					resValue1 = name.search("OTHR");
					if(resValue1 != -1)
					{
						othrDocs[othrLen] = name;
						othrLen = othrLen + 1;
					}
				}
			});
		}

		res.render('cmsModule/cmsViewEmployee',{
			govDocs:govDocs,govLen:govLen,
			eduDocs:eduDocs,eduLen:eduLen,
			medDocs:medDocs,medLen:medLen,
			expDocs:expDocs,expLen:expLen,
			phDocs:phDocs,phLen:phLen,
			resDocs:resDocs,resLen:resLen,
			othrDocs:othrDocs,othrLen:othrLen,
			hrDocs:hrDocs,hrLen:hrLen,
			cerDocs:cerDocs,cerLen:cerLen,
			bgDocs:bgDocs,bgLen:bgLen,
			ename:ename,
			eid:eid,
			emp_access:emp_access
		});
	}
	else
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
}

function cmsViewStatusEmployee(req,res)
{
        var eid =req.user.rows[0].user_id;
        var ename = req.user.rows[0].user_name;
	var emp_access = req.user.rows[0].user_type;

	if(emp_access != "A1")
        {
		govLen = 0;
		eduLen = 0;
		medLen = 0;
		expLen = 0;
		phLen = 0;
		resLen = 0;
		othrLen = 0;
		hrLen = 0;
		cerLen = 0;
		bgLen = 0;
		rlen = 0;
		var resValue1;
		var pFolder = './data/CMS/employee/uploadDoc/'+eid+"/";

		if (!fs.existsSync(pFolder))
		{
			console.log('No records found for approval pending');
		}
		else
		{
			fs.readdirSync(pFolder).forEach(
			function(name)
			{
				var resValue = name.search("uv");
				if(resValue != -1)
				{
					resValue1 = name.search("GOVT");
					if(resValue1 != -1)
					{
						govDocs[govLen] = name;
						govLen = govLen + 1;
					}
					resValue1 = name.search("EDUC");
					if(resValue1 != -1)
					{
						eduDocs[eduLen] = name;
						eduLen = eduLen + 1;
					}
					resValue1 = name.search("MEDICAL");
					if(resValue1 != -1)
					{
						medDocs[medLen] = name;
						medLen = medLen + 1;
					}
					resValue1 = name.search("EXPERIENCE");
					if(resValue1 != -1)
					{
						expDocs[expLen] = name;
						expLen = expLen + 1;
					}
					resValue1 = name.search("PHOTO");
					if(resValue1 != -1)
					{
						phDocs[phLen] = name;
						phLen = phLen + 1;
					}
					resValue1 = name.search("RESUME");
					if(resValue1 != -1)
					{
						resDocs[resLen] = name;
						resLen = resLen + 1;
					}
					resValue1 = name.search("_HR");
					if(resValue1 != -1)
					{
						hrDocs[hrLen] = name;
						hrLen = hrLen + 1;
					}
					resValue1 = name.search("CERT");
					if(resValue1 != -1)
					{
						cerDocs[cerLen] = name;
						cerLen = cerLen + 1;
					}
					resValue1 = name.search("BACKGROUND");
					if(resValue1 != -1)
					{
						bgDocs[bgLen] = name;
						bgLen = bgLen + 1;
					}
					resValue1 = name.search("OTHR");
					if(resValue1 != -1)
					{
						othrDocs[othrLen] = name;
						othrLen = othrLen + 1;
					}
				}
			});

		}

		var rFolder = './data/CMS/employee/rejectDoc/'+eid+"/";
		if (!fs.existsSync(rFolder))
		{
			console.log('No records found for rejection');
		}
		else
		{
			fs.readdirSync(rFolder).forEach(
			function(name)
			{
				var resValue = name.search("rj");
				if(resValue != -1)
				{
					rdocs[rlen] = name;
					rpath[rlen] = rFolder + name;
			
					var chklen = name.length - 3;
					txtfile = name.substring(0,chklen);
					txtfile = './data/CMS/employee/rejectReason/'+eid+"/"+txtfile+"txt";
					var dataContent = fs.readFileSync(txtfile, 'utf8');
					rreas[rlen] = dataContent;
					rlen = rlen +1;
				}
			});
		}

		res.render('cmsModule/cmsViewStatusEmployee',{
			govDocs:govDocs,govLen:govLen,
			eduDocs:eduDocs,eduLen:eduLen,
			medDocs:medDocs,medLen:medLen,
			expDocs:expDocs,expLen:expLen,
			phDocs:phDocs,phLen:phLen,
			resDocs:resDocs,resLen:resLen,
			othrDocs:othrDocs,othrLen:othrLen,
			hrDocs:hrDocs,hrLen:hrLen,
			cerDocs:cerDocs,cerLen:cerLen,
			bgDocs:bgDocs,bgLen:bgLen,
			rdocs:rdocs,rpath:rpath,rlen:rlen,rreas:rreas,
			ename:ename,
			eid:eid,
			emp_access:emp_access
		});
	}
        else
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
}

function cmsViewFilesEmployee(req,res)
{
   var emp_access = req.user.rows[0].user_type;
   var eid1 =req.user.rows[0].user_id;
   if(emp_access != "A1")
   {
	var id = req.query.id;
	empId = req.query.empId;
	if(eid1 == empId)
	{
		var testFolder = './data/CMS/employee/uploadDoc/'+empId+"/";
		var file1 = testFolder +id;
		fs.readFile(file1, 
		function(err, file) 
		{
			var resValue = id.search("PHOTO");
			if(resValue == -1)
			{
				var resValue1 = id.search("RESUME");
				if(resValue1 == -1)
				{
					//Modified for security reason download option only
					/*res.writeHead(200, {"Content-Type" : "application/pdf"});
					res.write(file, "binary");
					res.end();*/
					res.setHeader('Content-disposition', 'attachment; filename=' + file1);
					res.download(file1);
				}
				else
				{
					res.setHeader('Content-disposition', 'attachment; filename=' + file1);
					res.download(file1);
				}
			}
			else
			{
				//Modified for security reason download option only
				/*res.writeHead(200, {"Content-Type" : "image/jpg" });
				res.write(file, "binary");
				res.end();*/
				res.setHeader('Content-disposition', 'attachment; filename=' + file1);
				res.download(file1);
			}
		});
		return;
	}
	else
	{
		//invalidAccessRedirect(req, res);
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
   }
   else
   {
	res.redirect('/admin-dashboard/adminDashboard/admindashboard');
   }
}

function cmsViewFilesEmployeeReject(req,res)
{
   var emp_access = req.user.rows[0].user_type;
   var eid1 =req.user.rows[0].user_id;
   if(emp_access != "A1")
   {
        var id = req.query.id;
        empId = req.query.empId;
	if(eid1 == empId)
	{
		var testFolder = './data/CMS/employee/rejectDoc/'+empId+"/";
		var file1 = testFolder +id;
		fs.readFile(file1,
		function(err, file)
		{
			var resValue = id.search("PHOTO");
			if(resValue == -1)
			{
				var resValue1 = id.search("RESUME");
				if(resValue1 == -1)
				{
					//Modified for security reason download option only
					/*res.writeHead(200, {"Content-Type" : "application/pdf"});
					res.write(file, "binary");
					res.end();*/
					res.setHeader('Content-disposition', 'attachment; filename=' + file1);
					res.download(file1);
				}
				else
				{
					res.setHeader('Content-disposition', 'attachment; filename=' + file1);
					res.download(file1);
				}
			}
			else
			{
				//Modified for security reason download option only
				/*res.writeHead(200, {"Content-Type" : "image/jpg" });
				res.write(file, "binary");
				res.end();*/
				res.setHeader('Content-disposition', 'attachment; filename=' + file1);
				res.download(file1);
			}
		});
		return;
	}
	else
	{
		//invalidAccessRedirect(req, res);
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
   }
   else
   {
 	res.redirect('/admin-dashboard/adminDashboard/admindashboard');
   }
}

function cmsDeletePenDocEmployee(req,res)
{
	var emp_access = req.user.rows[0].user_type;
	if(emp_access != "A1")
        {
		var eid =req.user.rows[0].user_id;
		var ename = req.user.rows[0].user_name;
		empId = req.query.empId;
		var doc = req.query.doc;
		if(eid == empId)
		{
			var rejFile = './data/CMS/employee/uploadDoc/'+empId+"/"+doc;

			fs.unlinkSync(rejFile);

			req.flash('success',"Document Deleted Successfully")
			res.redirect(req.get('referer'));
		}
		else
		{
			res.redirect('/admin-dashboard/adminDashboard/admindashboard');
		}
	}
	else
	{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
}

function cmsDeleteRejDocEmployee(req,res)
{
	var emp_access = req.user.rows[0].user_type;
        if(emp_access != "A1")
        {
		var eid =req.user.rows[0].user_id;
		var ename = req.user.rows[0].user_name;
		empId = req.query.empId;
		if(eid == empId)
		{
			var doc = req.query.doc;
			
			var caseInp1 = doc.length - 3;
			var name = doc.substring(0,caseInp1);
			
			var rejFile = './data/CMS/employee/rejectDoc/'+empId+"/"+doc;
			var rejReasFile = './data/CMS/employee/rejectReason/'+empId+"/"+name+"txt";
			
			fs.unlinkSync(rejFile);
			fs.unlinkSync(rejReasFile);
			
			req.flash('success',"Document Deleted Successfully")
			res.redirect(req.get('referer'));				
		}
                else
                {
                        res.redirect('/admin-dashboard/adminDashboard/admindashboard');
                }
	}
        else
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
}

// ] Employee Function operations End 17-07-2017 09:00



// [ Admin Functions operations Start 19-07-2017 18:30

function cmsUploadPostAdmin(req,res)
{
	var emp_access = req.user.rows[0].user_type;
	if(emp_access == "A1")
	{
		doc = "";
		updQuery = "",panFlg = "N", aadharFlg = "N", sslcFlg = "N", preunivFlg = "N", degreeFlg = "N";
		var form = new formidable.IncomingForm();

		form.parse(req, 
			function (err, fields, files) 
			{
				var empId = fields["empId"];
				var docCat = fields["docCat"];
				if(docCat == "1" || docCat == "2" || docCat == "10")
				{
					var docType = fields["docType"];
					if(docCat == "2")
					{
						if(docType == "12")
						{
							var docTypeText = fields["docTypeText"];
							docTypeText = docTypeText.replace(/ /g,'_').toUpperCase();
						}
					}
				}
				if(docCat == "7" || docCat == "8" || docCat == "4")
				{
					var docCatText = fields["docCatText"];
					docCatText = docCatText.replace(/ /g,'_').toUpperCase();
				}
				if(docCat == "1")
				{
					if(docType == "1")
					{
						doc = "GOVT_PASSPORT";
					}
					if(docType == "2")
					{
						doc = "GOVT_PANCARD";
						panFlg = "Y";
					}
					if(docType == "3")
					{
						doc = "GOVT_VOTERID";
					}
					if(docType == "4")
					{
						doc = "GOVT_DRIVLIC";
					}
					if(docType == "5")
					{
						doc = "GOVT_AADHAR";
						aadharFlg = "Y";
					}
				}
				if(docCat == "2")
				{
					if(docType == "1")
					{
						doc = "EDUC_SSLC";
						sslcFlg = "Y";
					}
					if(docType == "2")
					{
						doc = "EDUC_PRE_UNIV";
						preunivFlg = "Y";
					}
					if(docType == "3")
					{
						doc = "EDUC_SEM1";
					}
					if(docType == "4")
					{
						doc = "EDUC_SEM2";
					}
					if(docType == "5")
					{
						doc = "EDUC_SEM3";
					}
					if(docType == "6")
					{
						doc = "EDUC_SEM4";
					}
					if(docType == "7")
					{
						doc = "EDUC_SEM5";
					}
					if(docType == "8")
					{
						doc = "EDUC_SEM6";
					}
					if(docType == "9")
					{
						doc = "EDUC_SEM7";
					}
					if(docType == "10")
					{
						doc = "EDUC_SEM8";
					}
					if(docType == "11")
					{
						doc = "EDUC_DEGREE";
						degreeFlg = "Y";
					}
					if(docType == "12")
					{
						doc = "EDUC_OTHERS_"+docTypeText;
					}
				}
				if(docCat == "3")
				{
					doc = "MEDICAL";
				}
				if(docCat == "4")
				{
					doc = "EXPERIENCE_"+docCatText;
				}
				if(docCat == "5")
				{
					doc = "PHOTO";
				}
				if(docCat == "6")
				{
					doc = "RESUME";
				}
				if(docCat == "7")
				{
					doc = "CERT_"+docCatText;
				}
				if(docCat == "8")
				{
					doc = "OTHR_"+docCatText;
				}
				if(docCat == "9")
				{
					doc = "BACKGROUND";
				}
				if(docCat == "10")
				{
					if(docType == "1")
					{
						doc = "HR_OFFER_LETTER";
					}
					if(docType == "2")
					{
						doc = "HR_BOND";
					}
					if(docType == "3")
					{
						doc = "HR_APPOINMENT_LETTER";
					}
					if(docType == "4")
					{
						doc = "HR_CONFIRMATION_LETTER";
					}
					if(docType == "5")
					{
						doc = "HR_ONSITE_DEPLOYMENT_DOCKET";
					}
					if(docType == "6")
					{
						var d = new Date();
						var n = d.getFullYear();
						doc = "HR_REVISION_LETTER_"+n;
					}
					if(docType == "7")
					{
						doc = "HR_COMPENSATION_LETTER";
					}
					if(docType == "8")
					{
						doc = "HR_EXIT_INTERVIEW_LETTER";
					}
					if(docType == "9")
					{
						doc = "HR_RELIEVING_LETTER";
					}
				}

				var dir2 = './data/CMS/employee/uploadDoc/'+empId+"/";
				if (!fs.existsSync(dir2))
				{
					fs.mkdirSync(dir2);
				}
				if(docCat == "5")
				{
					var newName = empId+".jpg";
					dir2 = './public/images/profile/';
				}
				else if(docCat == "6")
				{
					var newName = empId+"_"+doc+".doc";
					dir2 = './data/CMS/employee/uploadDoc/'+empId+"/";
				}
				else
				{
					var newName = empId+"_"+doc+".pdf";
					dir2 = './data/CMS/employee/uploadDoc/'+empId+"/";
				}

				var trejFoleder = './data/CMS/employee/rejectDoc/'+empId+"/";
				var treasFoleder = './data/CMS/employee/rejectReason/'+empId+"/";
				if (!fs.existsSync(trejFoleder))
				{
					console.log("No rejected documents");
				}
				else
				{
					fs.readdirSync(trejFoleder).forEach(
					function (name)
					{
						console.log("name",name);
						var searchPattern = empId+"_"+doc;
						var resValue = name.search(searchPattern);
						if(resValue != -1)
						{
							if(doc == "PHOTO")
							{
								var rejFile = trejFoleder + searchPattern+"_rj.jpg";
							}
							else if(doc == "RESUME")
							{
								var rejFile = trejFoleder + searchPattern+"_rj.doc";
							}
							else
							{
								var rejFile = trejFoleder + searchPattern+"_rj.pdf";
							}

							var reasFile = treasFoleder + searchPattern+"_rj.txt";
							fs.unlinkSync(rejFile);
							fs.unlinkSync(reasFile);
						}
					});
				}

				console.log(oldPath);
				var newPath = dir2 + newName;
				console.log(newPath);

				fs.rename(oldPath, newPath,
				function (err)
				{
					if (err) throw err;

					if(panFlg == "Y")
					{
						pdbconnect.query("UPDATE E_DOCKET_TBL SET PAN_FLG = $1 WHERE EMP_ID = $2",[panFlg, empId],
						function(err,done)
						{
							if(err) throw err;
							req.flash('success',"Document Uploaded Successfully");
							res.redirect(req.get('referer'));
						});
					}
					else if(aadharFlg == "Y")
					{
						pdbconnect.query("UPDATE E_DOCKET_TBL SET AADHAR_FLG = $1 WHERE EMP_ID = $2",[aadharFlg, empId],
						function(err,done)
						{
							if(err) throw err;
							req.flash('success',"Document Uploaded Successfully");
							res.redirect(req.get('referer'));
						});
					}
					else if(sslcFlg == "Y")
					{
						pdbconnect.query("UPDATE E_DOCKET_TBL SET SSLC_FLG = $1 WHERE EMP_ID = $2",[sslcFlg, empId],
						function(err,done)
						{
							if(err) throw err;
							req.flash('success',"Document Uploaded Successfully");
							res.redirect(req.get('referer'));
						});
					}
					else if(preunivFlg == "Y")
					{
						pdbconnect.query("UPDATE E_DOCKET_TBL SET PREUNIV_FLG = $1 WHERE EMP_ID = $2",[preunivFlg, empId],
						function(err,done)
						{
							if(err) throw err;
							req.flash('success',"Document Uploaded Successfully");
							res.redirect(req.get('referer'));
						});
					}
					else if(degreeFlg  == "Y")
					{
						pdbconnect.query("UPDATE E_DOCKET_TBL SET DEGREE_FLG = $1 WHERE EMP_ID = $2",[degreeFlg, empId],
						function(err,done)
						{
							if(err) throw err;
							req.flash('success',"Document Uploaded Successfully");
							res.redirect(req.get('referer'));
						});
					}
					else
					{
						req.flash('success',"Document Uploaded Successfully");
						res.redirect(req.get('referer'));
					}
				});
			});

		var oldName = "doc.pdf";
		var dir1 = './data/CMS/employee/temp/';
		var oldPath = dir1 + oldName;
		if (!fs.existsSync(dir1))
		{
			fs.mkdirSync(dir1);
		}
		var storage = multer.diskStorage({
			destination: function(req, file, callback) {
				console.log(file);
				callback(null, dir1)
			},
			filename: function(req, file, callback) {
				callback(null,oldName)
			}
		})

		var upload = multer({storage: storage}).single('uploadDoc')
		upload(req, res, function(err) {
			if (err) {
					return res.end("Something went wrong!");
				 }
			});
	}
	else
	{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
}

function cmsViewEmpIdAdmin(req,res)
{
	var eid =req.user.rows[0].user_id;
	var ename = req.user.rows[0].user_name;
	var emp_access = req.user.rows[0].user_type;
	if(emp_access == "A1")
	{
		empId = req.body.empId;
		len=0;
		var resValue1;
		govLen = 0;
		eduLen = 0;
		medLen = 0;
		expLen = 0;
		phLen = 0;
		resLen = 0;
		othrLen = 0;
		hrLen = 0;
		cerLen = 0;
		bgLen = 0;
		var testFolder = './data/CMS/employee/uploadDoc/'+empId+"/";
		if (!fs.existsSync(testFolder))
		{
			req.flash('error',"No details found for this Employee")
			res.redirect(req.get('referer'));	
		}
		else
		{
			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id =$1 ",[empId],
				function(err,result){
				employee=result.rows;
				emp_id_count=result.rowCount;


				fs.readdirSync(testFolder).forEach(
				function (name) 
				{
					var resValue = name.search("uv");
					if(resValue == -1)
					{
						resValue1 = name.search("GOVT");
						if(resValue1 != -1)
						{
							govDocs[govLen] = name;
							govLen = govLen + 1;
						}
						resValue1 = name.search("EDUC");
						if(resValue1 != -1)
						{
							eduDocs[eduLen] = name;
							eduLen = eduLen + 1;
						}
						resValue1 = name.search("MEDICAL");
						if(resValue1 != -1)
						{
							medDocs[medLen] = name;
							medLen = medLen + 1;
						}
						resValue1 = name.search("EXPERIENCE");
						if(resValue1 != -1)
						{
							expDocs[expLen] = name;
							expLen = expLen + 1;
						}
						resValue1 = name.search("PHOTO");
						if(resValue1 != -1)
						{
							phDocs[phLen] = name;
							phLen = phLen + 1;
						}
						resValue1 = name.search("RESUME");
						if(resValue1 != -1)
						{
							resDocs[resLen] = name;
							resLen = resLen + 1;
						}
						resValue1 = name.search("OTHR");
						if(resValue1 != -1)
						{
							othrDocs[othrLen] = name;
							othrLen = othrLen + 1;
						}
						resValue1 = name.search("_HR");
						if(resValue1 != -1)
						{
							hrDocs[hrLen] = name;
							hrLen = hrLen + 1;
						}
						resValue1 = name.search("CERT");
						if(resValue1 != -1)
						{
							cerDocs[cerLen] = name;
							cerLen = cerLen + 1;
						}
						resValue1 = name.search("BACKGROUND");
						if(resValue1 != -1)
						{
							bgDocs[bgLen] = name;
							bgLen = bgLen + 1;
						}
					}
				});

				if(govLen == 0 && eduLen == 0 && medLen == 0 && expLen == 0 && phLen == 0 && resLen == 0 && othrLen == 0 && hrLen == 0 &&cerLen == 0 && bgLen == 0) 
				{
					req.flash('error',"No details found for this Employee")
					res.redirect(req.get('referer'));
				}
				else
				{
					res.render('cmsModule/cmsViewEmpIdAdmin',{
					govDocs:govDocs,govLen:govLen,
					eduDocs:eduDocs,eduLen:eduLen,
					medDocs:medDocs,medLen:medLen,
					expDocs:expDocs,expLen:expLen,
					phDocs:phDocs,phLen:phLen,
					resDocs:resDocs,resLen:resLen,
					othrDocs:othrDocs,othrLen:othrLen,
					hrDocs:hrDocs,hrLen:hrLen,
					cerDocs:cerDocs,cerLen:cerLen,
					bgDocs:bgDocs,bgLen:bgLen,
					empId:empId,
					ename:ename,
					eid:eid,
					employee:employee,
					emp_access:emp_access
					});
				}
			});
		}
	}
	else
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
}

function cmsViewFilesAdmin(req,res)
{
	var emp_access = req.user.rows[0].user_type;
	if(emp_access == "A1")
        {
		var id = req.query.id;
		empId = req.query.empId;
		var testFolder = './data/CMS/employee/uploadDoc/'+empId+"/";
		var file1 = testFolder +id;
		fs.readFile(file1, 
		function(err, file) 
		{
			var resValue = id.search("PHOTO");
			if(resValue == -1)
			{
				var resValue1 = id.search("RESUME");
				if(resValue1 == -1)
				{
					//Modified for security reason download option only
					/*res.writeHead(200, {"Content-Type" : "application/pdf"});
					res.write(file, "binary");
					res.end();*/
					res.setHeader('Content-disposition', 'attachment; filename=' + file1);
					res.download(file1);
				}
				else
				{
					res.setHeader('Content-disposition', 'attachment; filename=' + file1);
					res.download(file1);
				}
			}
			else
			{
				//Modified for security reason download option only	
				/*res.writeHead(200, {"Content-Type" : "image/jpg" });
				res.write(file, "binary");
				res.end();*/
				res.setHeader('Content-disposition', 'attachment; filename=' + file1);
				res.download(file1);
			}
		});
	}
	else
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
}

function cmsApprAdmin(req,res)
{
	var eid =req.user.rows[0].user_id;
	var ename = req.user.rows[0].user_name;
	var emp_access = req.user.rows[0].user_type;
	if(emp_access == "A1")
	{
		len = 0;
		len2 = 0;
		i = 0;
		var empString = "";
		selQuery = "";
		var testFolder = './data/CMS/employee/uploadDoc/';
		fs.readdirSync(testFolder).forEach(function (empId) 
		{
			len1=0;
			cpath[len] = testFolder + empId + "/";
		
				try
				{
					fs.readdirSync(cpath[len]).forEach(
					function(empFile)
					{
						var resValue = empFile.search("uv");
						if(resValue != -1)
						{
							empArray[len2] = empId;
							len2 = len2 +1;
							throw "done";
						}	
					});
				}
				catch (e) {if (e != "done") console.log(empId);}			
				docs[len] = empFile;
				len =len+1;
		});
		for(i=0;i<len2;)
		{
			empString = empString + "'" +empArray[i]+"'";
			i = i + 1;
			if(i < len2)
			{
				empString = empString + ",";
			}	
		}
		if(len2 >0)
		{
			selQuery = "SELECT emp_id,emp_name from emp_master_tbl where emp_id in ("+empString+") order by emp_id"

			pdbconnect.query(selQuery,
				function(err,result)
				{
					employee=result.rows;
					emp_id_count=result.rowCount;

					res.render('cmsModule/cmsApprAdmin',
					{
						employee:employee,
						emp_id_count:emp_id_count,
						len2:len2,
						ename:ename,
						eid:eid,
						emp_access:emp_access
					});
				});
		}
		else
		{
			res.render('cmsModule/cmsApprAdmin',
			{
				len2:len2,
				ename:ename,
				eid:eid,
				emp_access:emp_access
			});

		}
	}
	else
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
}

function cmsApprEmpIdAdmin(req,res)
{
	len=0;
        var eid =req.user.rows[0].user_id;
        var ename = req.user.rows[0].user_name;
	var emp_access = req.user.rows[0].user_type;
	if(emp_access == "A1")
	{
		empId = req.query.empid;
		var testFolder = './data/CMS/employee/uploadDoc/'+empId+"/";

		pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id =$1 ",[empId],
			function(err,result){
			employee=result.rows;
			emp_id_count=result.rowCount;

			fs.readdirSync(testFolder).forEach(
			function(name)
			{
				var resValue = name.search("uv");
				if(resValue != -1)
				{
					docs[len] = name;
					cpath[len] = testFolder + name;
					len = len +1;
				}
			});

			res.render('cmsModule/cmsApprEmpIdAdmin',{
			docs:docs,
			cpath:cpath,
			len:len,
			empId:empId,
			ename:ename,
			eid:eid,
			employee:employee,
			emp_access:emp_access
			});
		});
	}
	else
	{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
}

function cmsApprPostAdmin(req,res)
{
	var emp_access = req.user.rows[0].user_type;
	if(emp_access == "A1")
        {
		updQuery = "", panFlg = "N", aadharFlg = "N", sslcFlg = "N", preunivFlg = "N", degreeFlg = "N";
		len = req.query.len;
		empId = req.query.empId;
		i=0;
		j=0;
		var caseInp = "";
		for(i = 0; i < len; i++) 
		{
			var caseInp = req.body['caseinput' + i];
			if(caseInp == 1)
			{
				docs[i];
				var caseInp1 = docs[i].length - 7;
				var dir1 = './data/CMS/employee/uploadDoc/'+empId+"/";
				var oldPath = dir1 + docs[i];
				var name = docs[i].substring(0,caseInp1);
				
				var resValue = name.search("PHOTO");
				if(resValue != -1)
				{
					var newName = empId +".jpg";
					var dir2 = './public/images/profile/';
				}	
				else
				{
					var resValue1 = name.search("RESUME");
					if(resValue1 != -1)
					{
						var newName = name +".doc";
					}
					else
					{
						var newName = name +".pdf";
						var apprPattern = name.search("GOVT_PANCARD");
						if(apprPattern != -1)
						{
							panFlg = "Y";
						}
						var apprPattern = name.search("GOVT_AADHAR");
						if(apprPattern != -1)
						{
							aadharFlg = "Y";
						}
						var apprPattern = name.search("EDUC_SSLC");
						if(apprPattern != -1)
						{
							sslcFlg = "Y";
						}
						var apprPattern = name.search("EDUC_PRE_UNIV");
						if(apprPattern != -1)
						{
							preunivFlg = "Y";
						}
						var apprPattern = name.search("EDUC_DEGREE");
						if(apprPattern != -1)
						{
							degreeFlg = "Y";
						}

					}
					var dir2 = './data/CMS/employee/uploadDoc/'+empId+"/";
				}		
				var newPath = dir2 + newName;
				fs.rename(oldPath, newPath, function (err) {
					if (err) throw err;

			      });
			}
		}
		
		if(panFlg == "Y" || aadharFlg == "Y" || sslcFlg == "Y" || preunivFlg == "Y" || degreeFlg == "Y")
		{
			if(panFlg == "Y")
			{
				updQuery = "PAN_FLG = 'Y'";
			}
			if(aadharFlg == "Y")
			{
				if(updQuery == "")
				{
					updQuery = "AADHAR_FLG = 'Y'";
				}
				else
				{
					updQuery = updQuery + ",AADHAR_FLG = 'Y'";
				}
			}
			if(sslcFlg == "Y")
			{
				if(updQuery == "")
				{
					updQuery = "SSLC_FLG = 'Y'";
				}
				else
				{
					updQuery = updQuery + ",SSLC_FLG = 'Y'";
				}
			}
			if(preunivFlg == "Y")
			{
				if(updQuery == "")
				{
					updQuery = "PREUNIV_FLG = 'Y'";
				}
				else
				{
					updQuery = updQuery + ",PREUNIV_FLG = 'Y'";
				}
			}
			if(degreeFlg == "Y")
			{
				if(updQuery == "")
				{
					updQuery = "DEGREE_FLG = 'Y'";
				}
				else
				{
					updQuery = updQuery + ",DEGREE_FLG = 'Y'";
				}
			}
			console.log("updQuery : ",updQuery);

			pdbconnect.query("UPDATE E_DOCKET_TBL SET " + updQuery + " WHERE EMP_ID = $1", [empId],
			function(err,done)
			{
				if(err) throw err;
				req.flash('success',"Documents Approved Successfully");
				res.redirect(req.get('referer'));
			});
		}
		else
		{
			req.flash('success',"Documents Approved Successfully")
			res.redirect(req.get('referer'));
		}
	}
	else
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
}

function cmsApprIndvAdmin(req,res)
{
	var emp_access = req.user.rows[0].user_type;
	if(emp_access == "A1")
        {
		panFlg = "N", aadharFlg = "N", sslcFlg = "N", preunivFlg = "N", degreeFlg = "N";
		empId = req.query.empId;
		var doc = req.query.doc;
		var caseInp1 = doc.length - 7;
		var name = doc.substring(0,caseInp1);	
		var dir1 = './data/CMS/employee/uploadDoc/'+empId+"/";
		var oldPath = dir1 + doc;
		var resValue = doc.search("PHOTO");
		if(resValue != -1)
		{
			var newName = empId +".jpg";
			var dir2 = './public/images/profile/';
		}	
		else
		{
			var resValue1 = name.search("RESUME");
			if(resValue1 != -1)
			{
				var newName = name +".doc";
			}
			else
			{
				var newName = name +".pdf";
				var apprPattern = name.search("GOVT_PANCARD");
				if(apprPattern != -1)
				{
					panFlg = "Y";
				}
				var apprPattern = name.search("GOVT_AADHAR");
				if(apprPattern != -1)
				{
					aadharFlg = "Y";
				}
				var apprPattern = name.search("EDUC_SSLC");
				if(apprPattern != -1)
				{
					sslcFlg = "Y";
				}
				var apprPattern = name.search("EDUC_PRE_UNIV");
				if(apprPattern != -1)
				{
					preunivFlg = "Y";
				}
				var apprPattern = name.search("EDUC_DEGREE");
				if(apprPattern != -1)
				{
					degreeFlg = "Y";
				}
			}
			var dir2 = './data/CMS/employee/uploadDoc/'+empId+"/";
		}		

		var newPath = dir2 + newName;
		fs.rename(oldPath, newPath, 
		function (err) 
		{
			if (err) throw err;
			if(panFlg == "Y")
			{
				pdbconnect.query("UPDATE E_DOCKET_TBL SET PAN_FLG = $1 WHERE EMP_ID = $2",[panFlg, empId],
				function(err,done)
				{
					if(err) throw err;
					req.flash('success',"Document Approved Successfully");
					res.redirect(req.get('referer'));
				});
			}
			else if(aadharFlg == "Y")
			{
				pdbconnect.query("UPDATE E_DOCKET_TBL SET AADHAR_FLG = $1 WHERE EMP_ID = $2",[aadharFlg, empId],
				function(err,done)
				{
					if(err) throw err;
					req.flash('success',"Document Approved Successfully");
					res.redirect(req.get('referer'));
				});

			}
			else if(sslcFlg == "Y")
			{
				pdbconnect.query("UPDATE E_DOCKET_TBL SET SSLC_FLG = $1 WHERE EMP_ID = $2",[sslcFlg, empId],
				function(err,done)
				{
					if(err) throw err;
					req.flash('success',"Document Approved Successfully");
					res.redirect(req.get('referer'));
				});

			}
			else if(preunivFlg == "Y")
			{
				pdbconnect.query("UPDATE E_DOCKET_TBL SET PREUNIV_FLG = $1 WHERE EMP_ID = $2",[preunivFlg, empId],
				function(err,done)
				{
					if(err) throw err;
					req.flash('success',"Document Approved Successfully");
					res.redirect(req.get('referer'));
				});

			}
			else if(degreeFlg  == "Y")
			{
				pdbconnect.query("UPDATE E_DOCKET_TBL SET DEGREE_FLG = $1 WHERE EMP_ID = $2",[degreeFlg, empId],
				function(err,done)
				{
					if(err) throw err;
					req.flash('success',"Document Approved Successfully");
					res.redirect(req.get('referer'));
				});

			}
			else
			{
				req.flash('success',"Document Approved Successfully");
				res.redirect(req.get('referer'));
			}
		});
	}
	else
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
}

function cmsApprRejectAdmin(req,res)
{
	var eid =req.user.rows[0].user_id;
        var ename = req.user.rows[0].user_name;
	var emp_access = req.user.rows[0].user_type;
	if(emp_access == "A1")
	{
		empId = req.query.empId;
		var doc = req.query.doc;
		var reas = req.query.reas;
		var dirRej = './data/CMS/employee/rejectDoc/'+empId+"/";
		if (!fs.existsSync(dirRej))
		{
			fs.mkdirSync(dirRej);
		}
		var caseInp1 = doc.length - 7;
		var name = doc.substring(0,caseInp1);

		var resValue = name.search("PHOTO");
		if(resValue != -1)
		{
			var newName = name +"_rj.jpg";
		}
		else
		{
			var resValue1 = name.search("RESUME");
			if(resValue1 != -1)
			{
				var newName = name +"_rj.doc";
			}
			else
			{
				var newName = name +"_rj.pdf";
			}
		}

		var newPath = dirRej+newName;

		var dirReas = './data/CMS/employee/rejectReason/'+empId+"/";
		if (!fs.existsSync(dirReas))
		{
			fs.mkdirSync(dirReas);
		}
		var reastxt = name +"_rj.txt";
		var reasNewfile = dirReas+reastxt;

		var dirOld = './data/CMS/employee/uploadDoc/'+empId+"/";
		var oldPath = dirOld + doc;

		fs.rename(oldPath, newPath, 
			function (err) 
			{
				if (err) throw err;

				fs.writeFile(reasNewfile, reas, function (err) 
				{
				    if (err) 
					return console.log(err);
					len=0;
					var testFolder = './data/CMS/employee/uploadDoc/'+empId+"/";
					fs.readdirSync(testFolder).forEach(
					function(name)
					{
						var resValue = name.search("uv");
						if(resValue != -1)
						{
							docs[len] = name;
							cpath[len] = testFolder + name;
							len = len +1;
						}
					});
					req.flash('success',"Document Rejected Successfully")
					res.redirect(req.get('referer'));				
				});
			}
		);	
	}
	else
	{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
}

function policyUploadPostAdmin(req,res)
{
	var emp_access = req.user.rows[0].user_type;
	if(emp_access == "A1")
	{
		doc = "";
		policyTag = "";
		var form = new formidable.IncomingForm();
		form.parse(req,
			function (err, fields, files)
			{
				policyTag = fields["policyTag"];
				policyTag = policyTag.replace(/ /g,'_').toUpperCase();
				var docName = fields["docName"];
				docName = docName.replace(/ /g,'_').toUpperCase();
				var dir2 = './data/CMS/policy/uploadDoc/';
				if (!fs.existsSync(dir2))
				{
					fs.mkdirSync(dir2);
				}
				var d = new Date();
				d = moment(d).format('YYYYMMDD:hhmmss:a');
				d = d.replace(/:/g,'_').toUpperCase();
				var newName = policyTag+"_"+docName+"_"+d+".pdf";
				var newPath = dir2 + newName;

			/*	fs.readdirSync(dir2).forEach(
				function (name)
				{
					if(name == newName)
					{
						req.flash('error',"File already exists with same name")
						res.redirect(req.get('referer'));
					}
				});*/

				fs.rename(oldPath, newPath,
				function (err)
				{
					if (err) throw err;
					req.flash('success',"Document Uploaded Successfully")
					res.redirect(req.get('referer'));
				});
			});

			var oldName = "doc.pdf"
			var dirOld = './data/CMS/policy/temp/';
			var oldPath = dirOld + oldName;
			if (!fs.existsSync(dirOld))
			{
				fs.mkdirSync(dirOld);
			}

			var storage = multer.diskStorage({
			destination: function(req, file, callback) {
				console.log(file);
				callback(null, dirOld)
			},
			filename: function(req, file, callback) {
				callback(null,oldName)
			}
		})
		var upload = multer({storage: storage}).single('uploadDoc')
		upload(req, res, function(err) {
			if (err) {
					return res.end("Something went wrong!");
				 }
			});
	}
	else
	{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
}

function policyViewAdmin(req,res)
{
        var eid =req.user.rows[0].user_id;
        var ename = req.user.rows[0].user_name;
        var emp_access = req.user.rows[0].user_type;
	if(emp_access == "A1")
        {
		if(req.method == "POST")
		{
			policyTag = req.body.policyTag;
		}

		if(policyTag == null || policyTag == "")
		{
			policyTag = "ALL";
		}
		var policyTag1 = policyTag.replace(/ /g,'_').toUpperCase();
		polLen = 0;

		var polFolder = './data/CMS/policy/uploadDoc/';
		if (!fs.existsSync(polFolder))
		{
			req.flash('error',"No records found")
			res.redirect(req.get('referer'));
		}
		else
		{
			fs.readdirSync(polFolder).forEach(
			function (name)
			{
				if(policyTag == "ALL")
				{
					polDocs[polLen] = name;
					polLen = polLen + 1;
				}
				else
				{
					var resultDoc = name.search(policyTag1);
					if(resultDoc != -1)
					{
						polDocs[polLen] = name;
						polLen = polLen + 1;
					}
				}
			});
		}
		pdbconnect.query("SELECT COMM_CODE_DESC FROM COMMON_CODE_TBL WHERE CODE_ID = 'POL'  ORDER BY COMM_CODE_ID ASC",function(err,result){
			policy=result.rows;
			policy_count=result.rowCount;

			res.render('cmsModule/policyViewAdmin',{
				polDocs:polDocs,polLen:polLen,policyTag:policyTag,
				policy:policy,policy_count:policy_count,
				ename:ename,
				eid:eid,
				emp_access:emp_access
			});
		});
	}
	else
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
}

function policyViewFilesAdmin(req,res)
{
	var id = req.query.id;
        var polFolder = './data/CMS/policy/uploadDoc/';
	var file1 = polFolder + id;
	fs.readFile(file1, 
	function(err, file) 
	{
		res.setHeader('Content-disposition', 'attachment; filename=' + file1);
		res.download(file1);
	});
}

function policyDeleteDocs(req,res)
{
        var eid =req.user.rows[0].user_id;
        var ename = req.user.rows[0].user_name;
	var emp_access = req.user.rows[0].user_type;
	if(emp_access == "A1")
        {
		var doc = req.query.doc;
		policyTag = req.query.policyTag;
		var delFile = './data/CMS/policy/uploadDoc/'+doc;
		fs.unlinkSync(delFile);

		req.flash('success',"Document Deleted Successfully")
		res.redirect(req.get('referer'));
	}
        else
        {
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
}

function policyViewEmployee(req,res)
{
        var eid =req.user.rows[0].user_id;
        var ename = req.user.rows[0].user_name;
        var emp_access = req.user.rows[0].user_type;
	console.log("emp_access cms",emp_access);
	if(emp_access != "A1")
        {
		var policyTag2 = req.body.policyTag;

		if(policyTag2 == null || policyTag2 == "")
		{
			var policyTag2 = "ALL";
		}
		var policyTag1 = policyTag2.replace(/ /g,'_').toUpperCase();
		
		polLen = 0;

		var polFolder = './data/CMS/policy/uploadDoc/';
		if (!fs.existsSync(polFolder))
		{
			req.flash('error',"No records found")
			res.redirect(req.get('referer'));
		}
		else
		{
			fs.readdirSync(polFolder).forEach(
			function (name)
			{
				if(policyTag2 == "ALL")
				{
					polDocs[polLen] = name;
					polLen = polLen + 1;
				}
				else
				{
					var resultDoc = name.search(policyTag1);
					if(resultDoc != -1)
					{
						polDocs[polLen] = name;
						polLen = polLen + 1;
					}
				}
			});
		}

		pdbconnect.query("SELECT COMM_CODE_DESC FROM COMMON_CODE_TBL WHERE CODE_ID = 'POL'  ORDER BY COMM_CODE_ID ASC",function(err,result){
			policy=result.rows;
			policy_count=result.rowCount;

			res.render('cmsModule/policyViewEmployee',{
				polDocs:polDocs,polLen:polLen,policyTag:policyTag2,
				policy:policy,policy_count:policy_count,
				ename:ename,
				eid:eid,
				emp_access:emp_access
			});
		});
	}
	else
	{
                res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
}

function magazineUploadPostAdmin(req,res)
{
	var emp_access = req.user.rows[0].user_type;
	if(emp_access == "A1")
        {
		var form = new formidable.IncomingForm();
		form.parse(req,
			function (err, fields, files)
			{
				var magYear = fields["magYear"];
				var magQuarter = fields["magQuarter"];
				var dir2 = './data/CMS/magazine/uploadDoc/'+magYear+'/';
				if (!fs.existsSync(dir2))
				{
					fs.mkdirSync(dir2);
				}
				var newName = "laCarta"+"_"+magYear+"_"+magQuarter+".pdf";
				var newPath = dir2 + newName;

				fs.rename(oldPath, newPath,
				function (err)
				{
					if (err) throw err;
					req.flash('success',"Document Uploaded Successfully")
					res.redirect(req.get('referer'));
				});
			});

		var oldName = "doc.pdf"
		var dirOld = './data/CMS/magazine/temp/';
		var oldPath = dirOld + oldName;
		if (!fs.existsSync(dirOld))
		{
			fs.mkdirSync(dirOld);
		}

		var storage = multer.diskStorage({
			destination: function(req, file, callback) {
				console.log(file);
				callback(null, dirOld)
			},
			filename: function(req, file, callback) {
				callback(null,oldName)
			}
		})
		var upload = multer({storage: storage}).single('uploadDoc')
		upload(req, res, function(err) {
			if (err) {
					return res.end("Something went wrong!");
				 }
			});
	}
	else
	{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
}

function magazineViewAdmin(req,res)
{
	totYear = 0;
	len2 = 0;
	totLen = 0;
	i = 0;
	var eid = req.user.rows[0].user_id;
	var ename = req.user.rows[0].user_name;
	var emp_access = req.user.rows[0].user_type;
	if(emp_access == "A1")
        {
		var testFolder = './data/CMS/magazine/uploadDoc/';
		fs.readdirSync(testFolder).forEach(function (magYear) 
		{
			magzYear[totYear] = magYear;
			len2 = 0;
			var testFolder1 = './data/CMS/magazine/uploadDoc/'+magYear+'/';
			fs.readdirSync(testFolder1).forEach(function (magDoc)
			{
				magzDoc[totLen] = magDoc;
				var resultDoc = magDoc.search("Q1");
				if(resultDoc != -1)
				{
					magzQtr[totLen] = "Q1";
				}
				resultDoc = magDoc.search("Q2");
				if(resultDoc != -1)
				{
					magzQtr[totLen] = "Q2";
				}
				resultDoc = magDoc.search("Q3");
				if(resultDoc != -1)
				{
					magzQtr[totLen] = "Q3";
				}
				resultDoc = magDoc.search("Q4");
				if(resultDoc != -1)
				{
					magzQtr[totLen] = "Q4";
				}
				len2 = len2 + 1;
				totLen = totLen + 1;
			});

			magzTot[totYear] = len2;
			totYear = totYear + 1;
		});

		res.render('cmsModule/magazineViewAdmin',
		{
			magzYear:magzYear,
			magzDoc:magzDoc,
			magzTot:magzTot,
			magzQtr:magzQtr,
			totYear:totYear,
			totLen:totLen,
			ename:ename,
			eid:eid,
			emp_access:emp_access
		});
	}
	else
	{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
}

function magazineViewFilesAdmin(req,res)
{
	var yr = req.query.yr;
	var magdoc = req.query.magdoc;
        var magFolder = './data/CMS/magazine/uploadDoc/'+yr+'/';
	var magfile = magFolder + magdoc;
	fs.readFile(magfile, 
	function(err, file) 
	{
		//res.setHeader('Content-disposition', 'attachment; filename=' + magfile);
                //res.download(magfile);

		res.writeHead(200, {"Content-Type" : "application/pdf"});
		res.write(file, "binary");
		res.end();
	});
}

function magazineViewEmployee(req,res)
{
	totYear = 0;
	len2 = 0;
	totLen = 0;
	i = 0;
	var eid = req.user.rows[0].user_id;
	var ename = req.user.rows[0].user_name;
	var emp_access = req.user.rows[0].user_type;
	if(emp_access != "A1")
	{
		var testFolder = './data/CMS/magazine/uploadDoc/';
		fs.readdirSync(testFolder).forEach(function (magYear) 
		{
			magzYear[totYear] = magYear;
			len2 = 0;
			var testFolder1 = './data/CMS/magazine/uploadDoc/'+magYear+'/';
			fs.readdirSync(testFolder1).forEach(function (magDoc)
			{
				magzDoc[totLen] = magDoc;

				var resultDoc = magDoc.search("Q1");
				if(resultDoc != -1)
				{
					magzQtr[totLen] = "Q1";
				}
				resultDoc = magDoc.search("Q2");
				if(resultDoc != -1)
				{
					magzQtr[totLen] = "Q2";
				}
				resultDoc = magDoc.search("Q3");
				if(resultDoc != -1)
				{
					magzQtr[totLen] = "Q3";
				}
				resultDoc = magDoc.search("Q4");
				if(resultDoc != -1)
				{
					magzQtr[totLen] = "Q4";
				}

				len2 = len2 + 1;
				totLen = totLen + 1;
			});

			magzTot[totYear] = len2;
			totYear = totYear + 1;
		});

		res.render('cmsModule/magazineViewEmployee',
		{
			magzYear:magzYear,
			magzDoc:magzDoc,
			magzQtr:magzQtr,
			magzTot:magzTot,
			totYear:totYear,
			totLen:totLen,
			ename:ename,
			eid:eid,
			emp_access:emp_access
		});
	}
	else
	{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
}
// ] Admin Functions operations End 19-07-2017 18:30

function cmsMailDoc(req,res)
{
	var docmnt = req.query.id;
        empId = req.query.empId;
	var eid1 =req.user.rows[0].user_id;
	var ename = req.user.rows[0].user_name;
	var emp_access = req.user.rows[0].user_type;
	if(emp_access != "A1")
        {
		//var docPath = './data/CMS/policy/uploadDoc/'+empId+'/'+docmnt;
		var docPath = mailCommPath + 'data/CMS/employee/uploadDoc/'+eid1+'/'+docmnt;

		pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id = $1 ",[eid1],
			function(err,maildata)
			{
				if(err)
				{
					console.error('Error with table query', err);
				}
				else
				{
					rowData = maildata.rows;
					mailId = rowData[0].emp_email;
				}
		
			var smtpTransport = nodemailer.createTransport('SMTP',{
			       service: 'gmail',
			       auth:
			    {
				user: 'amber@nurture.co.in',
				pass: 'nurture@123'
			    }
			    });

                        
			var mailOptions = {
						to: mailId,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Amber - E-Docket Employee Document',
                                                html: '<img src="https://ddvqhbgjmdkmq.cloudfront.net/wp-content/uploads/sites/2/2016/02/12000453/document_version.png" height="85"><br><br>' +
                                                '<h3>Dear ' + ename + '<br><br>' +
						'<p>As requested, we are mailing your document available in E-Docket.</p>' + 
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Document Name</th> ' +
                                                                '<th style="border: 10px solid black;">' + docmnt + '</th>' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
						'If you have not requested for the document, Kindly contact admin for any concerns.<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br><br>' +
						'- Regards,<br><br>Amber</h3>',

						attachments: [
							{
								fileName:docmnt,
								filePath:docPath
							}
						     ]

                                         };


			smtpTransport.sendMail(mailOptions, function(err) {
			      });

			req.flash('success',"Mail Sent Successfully")
			res.redirect(req.get('referer'));
		});
	}
	else
	{
		res.redirect('/admin-dashboard/adminDashboard/admindashboard');
	}
}

///////////////// Upload Photo ////////////////////

router.post('/cmsUploadPhotoEmployee',cmsUploadPhotoEmployee);
function cmsUploadPhotoEmployee(req,res)
{
	var emp_access = req.user.rows[0].user_type;
	var eid =req.user.rows[0].user_id;
	doc = "";
	var form = new formidable.IncomingForm();
	form.parse(req, 
		function (err, fields, files) 
		{
			var dir2 = './public/images/profile/';
			
			newName = eid + ".jpg";
			var newPath = dir2 + newName;

			fs.rename(oldPath, newPath, 
				function (err) 
				{
					if (err) throw err;
					req.flash('success',"Document Uploaded Successfully")
					res.redirect('/admin-dashboard/adminDashboard/admindashboard');
				});
		});

	var oldName = "doc.jpg";
	var dir1 = './data/CMS/employee/uploadDoc/'+eid+"/";;
	var oldPath = dir1 + oldName;
	if (!fs.existsSync(dir1))
	{
		fs.mkdirSync(dir1);
	}
	var storage = multer.diskStorage({
		destination: function(req, file, callback) {
			console.log(file);
			callback(null, dir1)
		},
		filename: function(req, file, callback) {
			callback(null,oldName)
		}
	})

	var upload = multer({storage: storage}).single('file')
	upload(req, res, function(err) {
		if (err) {
				return res.end("Something went wrong!");
			 }
		});
}



module.exports = router;
