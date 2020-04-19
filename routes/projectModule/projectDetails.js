var express = require('express');
var dateFormat = require('dateformat');
var multer = require('multer');
var app = express();
var util = require('util');
var path = require('path');
var fs = require('fs');
var formidable = require("formidable");
var router = express.Router();
var bodyParser = require('body-parser');
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
var nodemailer = require('nodemailer');
const roundTo = require('round-to');
var sleep = require('system-sleep');
var project = "";
var projectname = "";
var sowDocs = [],poDocs = [],mileDocs = [],cloDocs = [],fbDocs = [],aDocs = [];
var sowLen = 0,poLen = 0,mileLen = 0 ,cloLen = 0 ,fbLen = 0,aLen = 0;
var convRate = 1;
var emp_id_count = "";
var emprejlist=[];
var rlist="";
var alist="";
var empacclist=[];

router.get('/projectDocuments',projectDocUpload);
router.get('/projectDocumentsView',projectDocumentView);
router.get('/projectViewAdmin',viewAndDownload);
router.get('/showConvRate',showConvRate);
router.post('/projectDoc',projectDocUpl);
router.post('/projectDocView',projectDocsView);

router.get('/startdateval',function(req,res)
{
        var pid   =       req.query.pId;
        pdbconnect.query("SELECT start_date from project_master_tbl where project_id = $1 ",[pid],function(err,sDate){
        if(err){
        console.error('Error with table query', err);
        } else {
    
        var sdate      =       sDate.rows['0'].start_date;
        sdate = dateFormat(sdate,"yyyy-mm-dd");
        console.log('sdate',sdate);
        }
        res.json({key:sdate});
        });
});


router.get('/enddateval',function(req,res)
{
        var pid   =       req.query.pId;
        pdbconnect.query("SELECT end_date from project_master_tbl where project_id = $1 ",[pid],function(err,eDate){
        if(err){
        console.error('Error with table query', err);
        } else {
    
        var edate      =       eDate.rows['0'].end_date;
        edate = dateFormat(edate,"yyyy-mm-dd");
        console.log('edate',edate);
        }
        res.json({key:edate});
        });
});

router.get('/alreadyallocated',function(req,res,next)
{
        var pid   =       req.query.pId;
        var sel =         req.query.selected;
	var sal="";
	var projCurr="";
	var sellist1="";
	var sellist2="";
        console.log ("------------------");
        console.log('pid',pid);
        console.log('selected',sel);
	var sel1 = sel.slice(0,-1);
	var sel1 = sel1.replace(/-/g,"','");
	var empArr = "'" + sel1 + "'";
	console.log(empArr);
	var emplist = sel;
        var emplist = sel.slice(0, -1);
        var arr = emplist.split("-").map(function (val) { return +val + 0; });

        console.log(arr);
        var sellist ="";
       	 	pdbconnect.query("SELECT count(distinct salary_curr) as cnt from emp_master_tbl where del_flg='N' and emp_id = ANY($1::varchar[])",[arr],function(err,resultset){
			if (err) throw err;
			var scount=resultset.rows[0].cnt;
			console.log('scount',scount);
			pdbconnect.query("SELECT project_curr from project_master_tbl where project_id=$1",[pid],function(err,resultset)
			{
				if(err) throw err;
				var projCurr	=	resultset.rows['0'].project_curr;
				pdbconnect.query("SELECT salary_curr from emp_master_tbl where del_flg='N' and emp_id = ANY($1::varchar[]) ",[arr],function(err,resultset)
				{
					if(err) throw err;
					var sal	   = resultset.rows[0].salary_curr;
					console.log(sal);
	arr.forEach(function(value)
        {
             console.log("in for each");
					pdbconnect.query("SELECT count(*) as cnt from project_alloc_tbl  where del_flg='N' and emp_id=$1 and project_id =$2",[value,pid],function(err,resultset)
					{
						if(err) throw err;
						var ecount = resultset.rows[0].cnt;
						console.log(ecount);
				     
						if (ecount >0 )
						{
							sellist = value;
							console.log("---------",sellist);
						//	res.json({key:sellist});
						}
						else
						{
							sellist = 0;
						}
						//res.json({key:sellist,key1:scount,key2:sal,key3:projCurr});
					});
				});
						res.json({key:sellist,key1:scount,key2:sal,key3:projCurr});
			});
        });
		});
});



router.get('/projectAllocation',function(req,res)
{

	var empId = req.user.rows['0'].user_id;
        var eid = req.user.rows['0'].user_id;
        var emp_access=req.user.rows['0'].user_type;
        console.log("empaccess",emp_access);
	
	if(emp_access != "L1" && emp_access != "L2")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {


        pdbconnect.query("SELECT customer_name,project_id from project_master_tbl p INNER JOIN customer_master_tbl c ON c.customer_id=p.cid where p.closure_flg='N' and p.del_flg='N' AND SOW_UPLD = 'Y' order by p.project_id asc",function(err,result)
	{
        	projectname=result.rows;
        	projid_count=result.rowCount;

        	pdbconnect.query("select e.emp_name,e.emp_id,(select COALESCE( NULLIF(sum(b.percentage_alloc),null) ,0) from project_alloc_tbl b where b.del_flg='N' and b.emp_id=e.emp_id) as alloc from emp_master_tbl e inner join e_docket_tbl d on e.emp_id=d.emp_id  where e.emp_access in ('L2','L3') and pan_flg='Y' and aadhar_flg='Y' and sslc_flg='Y' and preuniv_flg='Y' and degree_flg='Y' and d.del_flg='N' and e.emp_id not in (select a.emp_id from project_alloc_tbl a group by a.emp_id having sum(percentage_alloc) =100) order by e.emp_name asc",function(err,result)
		{
        		empname=result.rows;
        		empname_count=result.rowCount;

    			pdbconnect.query("select e.emp_id from emp_master_tbl e inner join e_docket_tbl d on e.emp_id=d.emp_id  where e.emp_access in ('L1','L2','L3') and pan_flg='Y' and aadhar_flg='Y' and sslc_flg='Y' and preuniv_flg='Y' and degree_flg='Y' and d.del_flg='N' order by e.emp_id asc",function(err,result)
			{
    				manager=result.rows;
    				id_count=result.rowCount;
			
				pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'HCUR'  order by comm_code_id asc",function(err,result)
				{
					home_cur=result.rows['0'].comm_code_id;
					home_cur_count=result.rowCount;
					console.log("home currency is",home_cur);
					console.log("home currency count :::",home_cur_count);

					pdbconnect.query("select e.emp_name from emp_master_tbl e inner join e_docket_tbl d on e.emp_id=d.emp_id  where e.emp_access in ('L1','L2','L3') and pan_flg='Y' and aadhar_flg='Y' and sslc_flg='Y' and preuniv_flg='Y' and degree_flg='Y' and d.del_flg='N' order by e.emp_id asc",function(err,result)
					{
						manname=result.rows;
						manname_count=result.rowCount;
						res.render('projectModule/projectAllocation',{
						emp_access:emp_access,
						ename:req.user.rows['0'].user_name,
						eid:req.user.rows['0'].user_id,
						manager:manager,
						manid_count:id_count,
						manname:manname,
						empname_count:empname_count,
						empname:empname,
						project:project,
						home_cur:home_cur,
						home_cur_count:home_cur_count,
						projid_count:projid_count,
						projectname:projectname
											    });

					});
				});
			});
		});
	});
 }
});

router.get('/ModifydelAllocation',function(req,res)
{
        var emp_access=req.user.rows['0'].user_type;
        console.log("empaccess",emp_access);

	if(emp_access != "L1" && emp_access != "L2")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {
		pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'HCUR'  order by comm_code_id asc",function(err,result)
		{
			home_cur=result.rows['0'].comm_code_id;
			home_cur_count=result.rowCount;
			console.log("home currency is",home_cur);
			console.log("home currency count :::",home_cur_count);



        pdbconnect.query("select  distinct a.project_id as project_id,c.customer_name from project_alloc_tbl a inner join project_master_tbl p on a.project_id=p.project_id inner join customer_master_tbl c on c.customer_id = p.cid where a.del_flg='N' and p.closure_flg='N' order by a.project_id asc",function(err,result)
	{
		var project1=result.rows;
		var projid_count1=result.rowCount;
		var alloc="";
		var alloc_count="";
		var project_id1="";
		var customername1 ="";
		var rmgr1 ="";
		var peralloc1 ="";
		var eloctype1 = "";
		var ebilltype1 = "";
		var padate1 = "";
		var pedate1 = "";
		var rmgr_name1="";
		var eid ="";
		var pid ="";
		var sdate="";
		var edate ="";
		var emp1="";
		var empid_count1="";
		proj_id="";
                var manager ="";
                var id_count = "";
                var manname = "";
                var employee = "";
                var empid_count = "";
                var empname = "";
                var project ="";
                var projid_count = "";
                var projectname = "";
                var emp_id = "";
                var project_id = "";
                var rmgr = "";
                var peralloc = "";
                var padate = "";
                var pedate = "";
                var ebilltype = "";
                var eloctype = "";
                var emp_name1 ="";
                var peralloc_count="";
                var peralloc="";
		var emp_name = "";
		var convRate="10";
	
		console.log("innnn");
    		res.render('projectModule/ModifydelAllocation',{
                emp_access:emp_access,
		ename:req.user.rows['0'].user_name,
        	eid:req.user.rows['0'].user_id,
                alloc:alloc,
                alloc_count:alloc_count,
                proj_id:proj_id,
                pid:pid,
		emp_id:emp_id,
		emp_name:emp_name,
                emp_name1:emp_name1,
                project_id1:project_id1,
                customername1:customername1,
                rmgr1:rmgr1,
                rmgr_name1:rmgr_name1,
                peralloc1:peralloc1,
                eloctype1:eloctype1,
                ebilltype1:ebilltype1,
                padate1:padate1,
                pedate1:pedate1,
                project1:project1,
                projid_count1:projid_count1,
                manager:manager,
                manid_count:id_count,
                manname:manname,
                employee:employee,
                empid_count:empid_count,
                empname:empname,
                project:project,
                projid_count:projid_count,
                projectname:projectname,
                emp_id1:emp_id,
                projid:project_id,
                projMgr:rmgr,
                peralloc:peralloc,
                paDate:padate,
                peDate:pedate,
                empbill:ebilltype,
                emploctype:eloctype,
                sdate:sdate,
                edate:edate,
                emp1:emp1,
                empid_count1:empid_count1,
                peralloc_count:peralloc_count,
		home_cur:home_cur,
		home_cur_count:home_cur_count,
                peralloc:peralloc,
		convRate:convRate
        				
							});

		});
		});
	}
});


router.get('/viewAllocation',function(req,res)
{
        var emp_access=req.user.rows['0'].user_type;
        console.log("empaccess",emp_access);
	
	if(emp_access != "L1" && emp_access != "L2")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {

        pdbconnect.query("select  distinct a.project_id as project_id,c.customer_name from project_alloc_tbl a inner join project_master_tbl p on a.project_id=p.project_id inner join customer_master_tbl c on c.customer_id = p.cid where a.del_flg='N' and p.closure_flg='N' order by a.project_id asc",function(err,result)
	{
		var project1=result.rows;
		var projid_count1=result.rowCount;
		var alloc="";
		var alloc_count="";
		var project_id1="";
		var customername1 ="";
		var rmgr1 ="";
		var peralloc1 ="";
		var eloctype1 = "";
		var ebilltype1 = "";
		var padate1 = "";
		var pedate1 = "";
		var rmgr_name1="";
		var eid ="";
		var pid ="";
		var proj_id="";
                var manager ="";
                var id_count = "";
                var manname = "";
                var employee = "";
                var empid_count = "";
                var empname = "";
                var project ="";
                var projid_count = "";
                var projectname = "";
                var emp_id = "";
                var project_id = "";
                var rmgr = "";
                var peralloc = "";
                var padate = "";
                var pedate = "";
                var ebilltype = "";
                var eloctype = "";
                var emp_name1 ="";
                var projectmgrname="";
                var deliverymgrname="";
                var projectmgrid ="";
                var deliverymgrid ="";


         	console.log("innnn");
    
		res.render('projectModule/Allocationview',{
                emp_access:emp_access,
	        ename:req.user.rows['0'].user_name,
        	eid:req.user.rows['0'].user_id,
                alloc:alloc,
                alloc_count:alloc_count,
                proj_id:proj_id,
                pid:pid,
                emp_name1:emp_name1,
                project_id1:project_id1,
                customername1:customername1,
                rmgr1:rmgr1,
                rmgr_name1:rmgr_name1,
                peralloc1:peralloc1,
                eloctype1:eloctype1,
                ebilltype1:ebilltype1,
                padate1:padate1,
                pedate1:pedate1,
                project1:project1,
                projid_count1 : projid_count1,
                manager:manager,
                manid_count:id_count,
                manname:manname,
                employee:employee,
                empid_count:empid_count,
                empname:empname,
                project:project,
                projid_count:projid_count,
                projectname:projectname,
                emp_id1:emp_id,
                projid:project_id,
                projMgr:rmgr,
                peralloc:peralloc,
                paDate:padate,
                peDate:pedate,
                empbill:ebilltype,
                projectmgrname:projectmgrname,
                deliverymgrname:deliverymgrname,
                projectmgrid:projectmgrid,
                deliverymgrid:deliverymgrid,
                emploctype:eloctype
        
								});

			});
	}
});


router.get('/viewEmpallocation',function(req,res)
{
        var emp_access=req.user.rows['0'].user_type;
        console.log("empaccess",emp_access);
	if(emp_access != "L1" && emp_access != "L2")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {

        pdbconnect.query("select  distinct a.emp_id as emp_id,e.emp_name from project_alloc_tbl a inner join emp_master_tbl e on a.emp_id=e.emp_id where a.del_flg='N' order by a.emp_id asc",function(err,result)
	{
		var emp1=result.rows;
		var empid_count1=result.rowCount;
		var alloc="";
		var alloc_count="";
		var project_id1="";
		var customername1 ="";
		var rmgr1 ="";
		var peralloc1 ="";
		var eloctype1 = "";
		var ebilltype1 = "";
		var padate1 = "";
		var pedate1 = "";
		var rmgr_name1="";
		var pid ="";
		var proj_id="";
                var manager ="";
                var id_count = "";
                var manname = "";
                var employee = "";
                var empid_count = "";
                var empname = "";
                var project ="";
                var projid_count = "";
                var projectname = "";
                var emp_id = "";
                var project_id = "";
                var rmgr = "";
                var peralloc = "";
                var padate = "";
                var pedate = "";
                var ebilltype = "";
                var eloctype = "";
                var emp_name1 ="";
		var emp_name = "";

         	console.log("innnn");
    		
		res.render('projectModule/empAllocationview',{
                emp_access:emp_access,
	        ename:req.user.rows['0'].user_name,
        	eid:req.user.rows['0'].user_id,
                alloc:alloc,
                alloc_count:alloc_count,
                proj_id:proj_id,
                pid:pid,
                emp_id:emp_id,
                emp_name1:emp_name1,
                project_id1:project_id1,
                customername1:customername1,
                rmgr1:rmgr1,
                rmgr_name1:rmgr_name1,
                peralloc1:peralloc1,
                eloctype1:eloctype1,
                ebilltype1:ebilltype1,
                padate1:padate1,
                pedate1:pedate1,
                emp1:emp1,
                empid_count1 : empid_count1,
                manager:manager,
                manid_count:id_count,
                manname:manname,
                employee:employee,
                empid_count:empid_count,
                empname:empname,
                project:project,
                projid_count:projid_count,
                projectname:projectname,
                emp_id1:emp_id,
                projid:project_id,
                projMgr:rmgr,
                peralloc:peralloc,
                paDate:padate,
                peDate:pedate,
                empbill:ebilltype,
                emploctype:eloctype,
		emp_name:emp_name
        
						});

	});
     }	
});



router.get('/projDealloc',function(req,res)
{
        var emp_access=req.user.rows['0'].user_type;
        console.log("empaccess",emp_access);
	if(emp_access != "L1" && emp_access != "L2")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {


        pdbconnect.query("select  distinct a.project_id as project_id,c.customer_name from project_alloc_tbl a inner join project_master_tbl p on a.project_id=p.project_id inner join customer_master_tbl c on c.customer_id = p.cid where a.del_flg='N' order by a.project_id asc",function(err,result)
	{
        	var project=result.rows;
        	var projid_count=result.rowCount;

     		res.render('projectModule/projDealloc',{
                emp_access:emp_access,
		ename:req.user.rows['0'].user_name,
		eid:req.user.rows['0'].user_id,
                project:project,
                projid_count:projid_count
        					       });

	});
      }	
});



router.post('/Modifydealloc',moddealloc);
function moddealloc(req , res)
{
    
	    var now = new Date();
	    var rcreuserid=req.user.rows[0].user_id;
	    var rcretime=now;
	    var lchguserid=req.user.rows[0].user_id;
	    var lchgtime=now;
	    var ftxt1="";
	    var ftxt2="";
	    var ftxt3="";
	    error_flg="N";
	    var emprelievedate=now;
	    var projId=req.body.projid;
	    var alloclength=req.body.alloclength;
	    var newrec=req.body.newrec;
	    var empsel = req.body.empselected;
	    var emplist = empsel.slice(0, -1);
	    var arr = emplist.split("-").map(function (val) { return +val + 0; });
	    var arronsite = arr; 
	    var arroffshore = arr;
	    console.log("arrayemp",arr);
	    var len = arr.length;
	    var arraycnt=0;
	    console.log('project id',projId);
	    console.log('no of table rows',alloclength);
	    var totsal =0;
	    var totperdium =0;
	    var totworkdays=0;

       	    pdbconnect.query("SELECT  comm_code_desc from common_code_tbl where del_flg='N' and code_id ='MAIL' and comm_code_id = 'PROJ' ",function(err,resultset)
	    {
            	if(err) throw err;
            	var mail1 = resultset.rows[0].comm_code_desc;

         	pdbconnect.query("select emp_email from emp_master_tbl where emp_id =$1",[rcreuserid],function(err,resultset)
		{
        		if(err) throw err;
        		var mail = resultset.rows[0].emp_email;
			pdbconnect.query("SELECT convertion_rate from project_alloc_tbl where project_id =$1",[projId],function(err,resultset)
			{
				if(err) throw err;
				var rate         = resultset.rows[0].convertion_rate;
				

				/*if ( (projcurr == "INR") && (salcurr == "USD") )
				{
				    usablesalary = ( usablesalary - 0 ) * ( rate - 0 ); 
				}

				if ( (projcurr == "USD") && (salcurr == "INR") )
				{
				    usablesalary = ( usablesalary - 0 ) / ( rate - 0 ); 
				}
				if ( (projcurr == "INR") && (salcurr == "GBP") )
				{
				    usablesalary = ( usablesalary - 0 ) * ( rate - 0 ); 
				}

				if ( (projcurr == "GBP") && (salcurr == "INR") )
				{
				    usablesalary = ( usablesalary - 0 ) / ( rate - 0 ); 
				}*/

	/*	if ( (projcurr == "INR") && (perdiumcurr == "USD") )
		{
		    usableperdium = ( usableperdium - 0 ) * ( rate - 0 ); 
		}
	      
		if ( (projcurr == "USD") && (perdiumcurr == "INR") )
		{
		    usableperdium = ( usableperdium - 0 ) / ( rate - 0 ); 
		}

		if ( (projcurr == "INR") && (perdiumcurrperday == "USD") )
		{
		    locperdium = ( locperdium - 0 ) * ( rate - 0 ); 
		}
	      
		if ( (projcurr == "USD") && (perdiumcurrperday == "INR") )
		{
		    locperdium = ( locperdium - 0 ) / ( rate - 0 ); 
		}

		if ( (projcurr == "INR") && (perdiumcurr == "GBP") )
		{
		    usableperdium = ( usableperdium - 0 ) * ( rate - 0 ); 
		}
	      
		if ( (projcurr == "GBP") && (perdiumcurr == "INR") )
		{
		    usableperdium = ( usableperdium - 0 ) / ( rate - 0 ); 
		}

		if ( (projcurr == "INR") && (perdiumcurrperday == "GBP") )
		{
		    locperdium = ( locperdium - 0 ) * ( rate - 0 ); 
		}
	      
		if ( (projcurr == "GBP") && (perdiumcurrperday == "INR") )
		{
		    locperdium = ( locperdium - 0 ) / ( rate - 0 ); 
		}*/


		arr.forEach(function(value)
		{
			  var eId = req.body["empid_"+ value];
			  var eRmgr = req.body["projMgr_"+ value];
			  var eLoc = req.body["emploctype_"+ value];
			  var pAlloc = req.body["peralloc_"+ value];
			  var aDate = req.body["paDate_"+ value];
			  var eDate = req.body["peDate_"+ value];
			  var bill =  req.body["empbill_"+ value];
			  var convRate = req.body["convRate_"+value];
			  var deAlloc =req.body["deallocate_"+ value];
			  var noofdays=req.body["noofworkingdays_"+ value];
			  var noofmonths=req.body["noofworkingmonths_"+ value];
			  var firstmonthdays = req.body["firstmonthdays_"+ value];
			  var lastmonthdays = req.body["lastmonthdays_"+ value];
			  var firstnoofdays = req.body["firstnoofdays_"+ value];
			  var lastnoofdays = req.body["lastnoofdays_"+ value];

			  console.log("eid",eId);
			  console.log("projectid",projId);
			  console.log("projman",eRmgr);
			  console.log("%alloc",pAlloc);
			  console.log("padate",aDate);
			  console.log("pedate",eDate);
			  console.log("employeebillable",bill);
			  console.log("emplocation",eLoc);
			  console.log("emplocation",eLoc);
			  console.log("convertionrate",convRate);
			  console.log('dealloc',deAlloc);
			  console.log('noofmonths',noofmonths);
			  console.log('firstmonthdays',firstmonthdays);
			  console.log('lastmonthdays',lastmonthdays);
			  console.log('firstnoofdays',firstnoofdays);
			  console.log('lastnoofdays',lastnoofdays);
    			pdbconnect.query("SELECT salary,project_curr,salarycurr,perdiumcurr,perdium_curr_per_day from project_master_tbl where closure_flg='N' and project_id =$1",[projId],function(err,resultset)
			{
    				if(err) throw err;
	
				var usablesalary = resultset.rows[0].salary;
				var projcurr     = resultset.rows[0].project_curr;
				var salcurr       =resultset.rows[0].salarycurr;
				var perdiumcurr   = resultset.rows[0].perdiumcurr;
				var perdiumcurrperday   = resultset.rows[0].perdium_curr_per_day;
				usablesalary = ( usablesalary - 0 ) * ( convRate - 0 );
				console.log(usablesalary);

     	pdbconnect.query("SELECT perdium,perdium_amount_per_day from project_master_tbl where closure_flg='N' and project_id =$1",[projId],function(err,resultset)
	{
     		if(err) throw err;
     		var usableperdium = resultset.rows[0].perdium;
     		var locperdium = resultset.rows[0].perdium_amount_per_day;
		usableperdium = ( usableperdium - 0 ) * ( convRate - 0 );
		locperdium = ( locperdium - 0 ) * ( convRate - 0 );
		console.log(usableperdium);
		console.log(locperdium);

            		  if( deAlloc != "Y" )
            		  {
                		pdbconnect.query("SELECT  count(*) as cnt from project_master_tbl where closure_flg='N' and project_id =$1 and end_date>=$2",[projId,eDate],function(err,resultset)
				{
                			if(err) throw err;
                			var cnt = resultset.rows[0].cnt;
        
             				if(cnt == 0)
                			{
                				error_flg="Y";
                			} 


				    pdbconnect.query("select salary from emp_master_tbl where emp_id=$1",[eId],function(err,resultset)
				    {
				    	if(err) throw err;
				    	
					var emp_sal = resultset.rows[0].salary;
				    	console.log('emp_sal',emp_sal);

				    	var firstsalperday = ( emp_sal - 0 ) / ( firstnoofdays - 0 );
				    	var firstsal = ( firstsalperday - 0 ) * ( firstmonthdays - 0 );
				    	console.log('firstsal',firstsal);

				    	var lastsalperday = ( emp_sal - 0 ) / ( lastnoofdays - 0 );
				    	var lastsal = ( lastsalperday - 0 ) * ( lastmonthdays - 0 );
				    	console.log('lastsal',lastsal);

				    	var monthsal = ( emp_sal - 0 ) * ( noofmonths - 0 );
				    	console.log('monthsal',monthsal);

				        if (noofmonths < 0)
				    	{
						lastsal = 0;
						monthsal = 0;

				    	}
	
            				totsal =( totsal - 0 ) + ( firstsal - 0 ) + ( lastsal - 0 ) + ( monthsal - 0 );
            				console.log('totsal',totsal);


            				var rowcnt = ( alloclength - 0 ) - ( 1 - 0 );
            				console.log("rowcnt",rowcnt);

            				if (eLoc == "ONSITE")
            				{ 
                				console.log("inside onsite");
						empperdium = ( noofdays - 0 ) * ( locperdium - 0 );
						totperdium = ( totperdium - 0 ) + ( empperdium - 0 );
						console.log("total consumed perdium",totperdium);
						console.log("usableperdium",usableperdium);

				    	}


                			if ( ( value == rowcnt ) && ( error_flg != "Y" ) )
                			{
                     
                        			/*if ( (projcurr == "USD"))
                            			{
                                			totsal = ( totsal - 0 ) / ( rate - 0 ); 
                            			}
                        
						if ( (projcurr == "GBP"))
                            			{
                                			totsal = ( totsal - 0 ) / ( rate - 0 ); 
                            			}*/
						totsal	=	(totsal-0) * (convRate-0);

                        			if (totsal > usablesalary)
                            			{
                            				var diff = (totsal - 0 ) - ( usablesalary- 0 );
                            				var Budjetdiff = roundTo(diff, 2);
                            
						        var smtpTransport = nodemailer.createTransport('SMTP',{
						    	service: 'gmail',
						    	auth: 
						    	{
								user: 'amber@nurture.co.in',
								pass: 'nurture@123'
						    	}
						    	});

						    	var mailOptions = 
							{
								to:mail1,
								cc:mail,
								from: 'amber@nurture.co.in',
								subject: 'Salary Budget Exceeding',
								text: 'Hi Team,\n\n' +
								'You are receiving this mail because you (or someone else) has tried modifying Employee allocation for:\n\n' +
								'Project ID' + projId + '\n' + 
								'Salary Budget is exceeding by ' + Budjetdiff + ' ' + projcurr + '\n\n\n\n' +
								'- Regards,\n Amber'
							};

							smtpTransport.sendMail(mailOptions, function(err) {
							});
						}



                        	    if (totperdium > usableperdium)
                                    {

                                        var diff = (totperdium - 0 ) - ( usableperdium - 0 );
                                        var Budjetdiff = roundTo(diff, 2);

                                    	var smtpTransport = nodemailer.createTransport('SMTP',{
                                    	service: 'gmail',
                                     	auth: 
                                     	{
                                    		user: 'amber@nurture.co.in',
                                    		pass: 'nurture@123'
                                    	}
                                    	});

                                	var mailOptions = 
					{
                                      		to:mail1,
                                      		cc:mail,
                                      		from: 'amber@nurture.co.in',
                                      		subject: 'Perdium Budjet Exceeding',
                                      		text: 'Hi Team,\n\n'+ 
                                      		'You are receiving this mail because you (or someone else) have tried modifying employee allocation for:\n'+ 
						'Project ID' + projId + '\n' + 
						'Perdium Budget is exceeding by '+ Budjetdiff + ' ' + projcurr + 'INR \n\n\n\n' +
						'- Regards,\n Amber'
                                      	};

                                     	smtpTransport.sendMail(mailOptions, function(err) {
                                      	});               
                                    }


                    arronsite.forEach(function(value)
                    {
			    var eId1 = req.body["empid_"+ value];
			    var eRmgr1 = req.body["projMgr_"+ value];
			    var eLoc1 = req.body["emploctype_"+ value];
			    var pAlloc1 = req.body["peralloc_"+ value];
			    var aDate = req.body["paDate_"+ value];
			    var eDate = req.body["peDate_"+ value];
			    var bill1 =  req.body["empbill_"+ value];
			  var convRate = req.body["convRate_"+value];
			    var deAlloc1 =req.body["deallocate_"+ value];
			    var noofdays1=req.body["noofworkingdays_"+ value];
			    var noofmonths1=req.body["noofworkingmonths_"+ value];
			    var firstmonthdays1 = req.body["firstmonthdays_"+ value];
			    var lastmonthdays1 = req.body["lastmonthdays_"+ value];
			    var firstnoofdays1 = req.body["firstnoofdays_"+ value];
			    var lastnoofdays1 = req.body["lastnoofdays_"+ value];
			    var aDate1 = dateFormat(aDate,"yyyy-mm-dd");
			    var eDate1 = dateFormat(eDate,"yyyy-mm-dd");
			    var reservedperdium =0;


                     	    if (eLoc1 == "ONSITE")
                            { 
                            	reservedperdium = ( noofdays1 - 0 ) * ( locperdium - 0 );
                            }

                            var empreservedperdium = roundTo(reservedperdium, 2);
                    	    var empreservedsal1 =0;
                    
			    pdbconnect.query("select salary from emp_master_tbl where emp_id=$1",[eId1],function(err,resultset)
			    {
                    			if(err) throw err;
                    			var emp_sal1 = resultset.rows[0].salary;
                    			console.log('emp_sal1',emp_sal1);
                    			var firstsalperday1 = ( emp_sal1 - 0 ) / ( firstnoofdays1 - 0 );
                    			var firstsal1 = ( firstsalperday1 - 0 ) * ( firstmonthdays1 - 0 );
                    			console.log('firstsal1',firstsal1);

                    			var lastsalperday1 = ( emp_sal1 - 0 ) / ( lastnoofdays1 - 0 );
                    			var lastsal1 = ( lastsalperday1 - 0 ) * ( lastmonthdays1 - 0 );
                    			console.log('lastsal1',lastsal1);

                    			var monthsal1 = ( emp_sal1 - 0 ) * ( noofmonths1 - 0 );
                    			console.log('monthsal1',monthsal1);

				    	if (noofmonths1 < 0)
				    	{
						lastsal1 = 0;
						monthsal1 = 0;
				    	}

                    			var reservedsal1 = ( firstsal1 - 0 ) + ( lastsal1 - 0 ) + ( monthsal1 - 0 );

                       			/*if (projcurr == "USD")
                      			{
                            			reservedsal1 = ( reservedsal1 - 0 ) / ( rate - 0 ); 
                      			}

                      			if (projcurr == "GBP")
                      			{
                            			reservedsal1 = ( reservedsal1 - 0 ) / ( rate - 0 ); 
                      			}*/
					
					reservedsal1 = ( reservedsal1 - 0 ) * ( convRate - 0 );
                    
                    			var empreservedsal1 = roundTo(reservedsal1, 2);
                    			console.log(' employee salary reserved 1',empreservedsal1);
                 
                    			pdbconnect.query("select ( COALESCE( NULLIF(sum(percentage_alloc),null) ,0) - (select COALESCE( NULLIF(percentage_alloc,null) ,0) from project_alloc_tbl where emp_id =$1 and project_id=$2 and del_flg='N')) as existalloc from project_alloc_tbl a WHERE del_flg='N' and a.emp_id=$1",[eId1,projId],function(err,result)
					{
                    				if(err) throw err;  
                    				var sAlloc = result.rows[0].existalloc;
                    				var sAlloc1 = sAlloc;
                    				
						if (sAlloc < 0)
                    				{
                        				sAlloc1 = ( sAlloc - 0 ) * ( 1 - 2 );
                    				}

					    	console.log('sumalloc1',sAlloc1);
					    	var totperalloc1 = ( sAlloc1 - 0 ) + ( pAlloc1 - 0 );
					     	var perremalloc1 = ( 100 - 0 ) - ( sAlloc1 - 0 )
					     	console.log('totperalloc1',totperalloc1);
					     	console.log('perremalloc1',perremalloc1);
    
		pdbconnect.query("select count(*) as cnt from project_alloc_tbl where emp_id =$1 and project_id=$2",[eId1,projId],function(err,resultset)
		{
			if(err) throw err;
			var cnt = resultset.rows[0].cnt;

			var rmgr = "";
			var loc = "";
			var pad1 = "";
			var ped1 = "";
			var bill = "";
			var pall = "";
			var pad = "";
			var ped = "";

			console.log('cnt',cnt);


                    if( cnt > 0 )
                    {
                    	
				pdbconnect.query("select emp_reporting_mgr,emp_loc_type,project_allocation_date,emp_project_relieving_date,emp_billable_flg,percentage_alloc from project_alloc_tbl where emp_id =$1 and project_id=$2 and del_flg='N' ",[eId1,projId],function(err,result)
				{
					    if(err) throw err;
					    rmgr = result.rows[0].emp_reporting_mgr;
					    loc  = result.rows[0].emp_loc_type;
					    pad1  = result.rows[0].project_allocation_date;
					    ped1  = result.rows[0].emp_project_relieving_date;
					    bill = result.rows[0].emp_billable_flg;
					    pall = result.rows[0].percentage_alloc;
					    pad = dateFormat(pad1,"yyyy-mm-dd");
					    ped = dateFormat(ped1,"yyyy-mm-dd");

                    		if ( (rmgr != eRmgr1) || (loc != eLoc1) || (pall != pAlloc1) || (pad != aDate1) || (ped != eDate1) || (bill != bill1) )
                    		{

				    if( totperalloc1 < 100 )
				    {
						console.log("tot",totperalloc1);
					    
					    pdbconnect.query("insert into project_alloc_tbl_hist select * from project_alloc_tbl where project_id=$1 and emp_id=$2",[projId,eId1],function(err,result){
					    if(err) throw err;
					    });

					    pdbconnect.query("delete from project_alloc_tbl where project_id=$1 and emp_id=$2",[projId,eId1],function(err,result){
					    if(err) throw err;                           
					    });

					    pdbconnect.query("INSERT INTO project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,convertion_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)",[projId,eId1,eLoc1,eRmgr1,aDate1,bill1,eDate1,rcreuserid,rcretime,lchguserid,lchgtime,'N',ftxt1,ftxt2,ftxt3,pAlloc1,noofdays1,empreservedsal1,empreservedperdium,projcurr,convRate],function(err,result){
					    if(err) throw err;
					    });
			
					    pdbconnect.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3",[eRmgr1,projId,eId1],function(err,done){
					    if(err) throw err;
					     });   
									 
				    }
				    else if(perremalloc1 > 0)
				    {
						console.log("perrem",perremalloc1);
					    
					    pdbconnect.query("insert into project_alloc_tbl_hist select * from project_alloc_tbl where project_id=$1 and emp_id=$2",[projId,eId1],function(err,result){
					    if(err) throw err;
					    });
					    pdbconnect.query("delete from project_alloc_tbl where project_id=$1 and emp_id=$2",[projId,eId1],function(err,result){
					    if(err) throw err;                           
					    });
					    pdbconnect.query("INSERT INTO public.project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,convertion_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)",[projId,eId1,eLoc1,eRmgr1,aDate1,bill1,eDate1,rcreuserid,rcretime,lchguserid,lchgtime,'N',ftxt1,ftxt2,ftxt3,perremalloc1,noofdays1,empreservedsal1,empreservedperdium,projcurr,convRate],function(err,result){
					    if(err) throw err;
					    });
					    pdbconnect.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3",[eRmgr1,projId,eId1],function(err,done){
					    if(err) throw err;
					     });   
					     
				    }  

                    		}/*compare old and new values*/

                	});/*fetch allocation query*/

                }/*if cnt*/
                else
                {
                      if( totperalloc1 < 100 )
                      {
                            
                            pdbconnect.query("insert into project_alloc_tbl_hist select * from project_alloc_tbl where project_id=$1 and emp_id=$2",[projId,eId1],function(err,result){
                            if(err) throw err;
                            });

                            pdbconnect.query("delete from project_alloc_tbl where project_id=$1 and emp_id=$2",[projId,eId1],function(err,result){
                            if(err) throw err;                           
                            });

                            pdbconnect.query("INSERT INTO project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,convertion_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)",[projId,eId1,eLoc1,eRmgr1,aDate1,bill1,eDate1,rcreuserid,rcretime,lchguserid,lchgtime,'N',ftxt1,ftxt2,ftxt3,pAlloc1,noofdays1,empreservedsal1,empreservedperdium,projcurr,convRate],function(err,result){
                            if(err) throw err;
                            });
        
                            pdbconnect.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3",[eRmgr1,projId,eId1],function(err,done){
                            if(err) throw err;
                            });   
                                                         
                     }
                     else if(perremalloc1 > 0)
                     {
                            
                            pdbconnect.query("insert into project_alloc_tbl_hist select * from project_alloc_tbl where project_id=$1 and emp_id=$2",[projId,eId1],function(err,result){
                            if(err) throw err;
                            });
                            pdbconnect.query("delete from project_alloc_tbl where project_id=$1 and emp_id=$2",[projId,eId1],function(err,result){
                            if(err) throw err;                           
                            });
                            pdbconnect.query("INSERT INTO public.project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,convertion_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)",[projId,eId1,eLoc1,eRmgr1,aDate1,bill1,eDate1,rcreuserid,rcretime,lchguserid,lchgtime,'N',ftxt1,ftxt2,ftxt3,perremalloc1,noofdays1,empreservedsal1,empreservedperdium,projcurr,convRate],function(err,result){
                            if(err) throw err;
                            });
                            pdbconnect.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3",[eRmgr1,projId,eId1],function(err,done){
                            if(err) throw err;
                             });   
                             
                    }  

                }/*else cnt*/
            
	     });/*cnt query*/

         });/*allocation % query*/
      
      });/*emp salary query*/ 

  });/* 2nd for loop */

	    req.flash('success'," Allocation details for Project  " + projId + "  Modified successfully")
	    res.redirect('/projectModule/projectDetails/ModifydelAllocation');   
            rowcnt = 0;

    }/*( value == rowcnt ) && ( error_flg != "Y" )*/
         
                }); /*emp salary query*/
                });/*pedate validation */


		    }/*de alloc if*/
		    else
		    {
			    pdbconnect.query("insert into project_alloc_tbl_hist select * from project_alloc_tbl where project_id=$1 and emp_id=$2",[projId,eId],function(err,result){
			    if(err) throw err;
			    pdbconnect.query("update project_alloc_tbl_hist set del_flg=$1,emp_project_relieving_date=$2 where emp_id=$4 and project_id=$3",['Y',lchgtime,projId,eId],function(err,done){
			    if(err) throw err;
			    pdbconnect.query("delete from project_alloc_tbl where project_id=$1 and emp_id=$2",[projId,eId],function(err,done){
			    if(err) throw err;

			    req.flash('success'," Allocation details for Project  " + projId + "  Modified successfully")
			    res.redirect('/projectModule/projectDetails/ModifydelAllocation');   

			    });   
			    });
			    });
				    
		    }/*dealloc else*/

    		});/*main for loop */

    });/*perdium query */

    });

    }); /*salary query*/    

    });/*user mail id */

    });/* mail query*/    
            
};


router.post('/projDeallocation',projdeallocation);
function projdeallocation(req , res)
{
	    var logged_emp_id =req.user.rows[0].user_id;
	    var now = new Date();
	    var lchguserid=logged_emp_id;
	    var lchgtime=now;
	    var emprelievedate=now;
	    var projId=req.body.projid;

	    pdbconnect.query("insert into project_alloc_tbl_hist select * from project_alloc_tbl where project_id=$1",[projId],function(err,result)
	    {
		if(err) throw err; 
    
    		pdbconnect.query("delete from project_alloc_tbl where project_id=$1",[projId],function(err,done)
		{
    			if(err) throw err;

     			pdbconnect.query("update project_alloc_tbl_hist set del_flg=$1,emp_project_relieving_date=$2,lchg_user_id=$3,lchg_time=$4 where project_id=$5",['Y',emprelievedate,lchguserid,lchgtime,projId],function(err,done)
			{
     				if(err) throw err;

              			req.flash('success',"Project  " + projId +" De-Allocated successfully")
              			res.redirect('/projectModule/projectDetails/projDealloc');   
     			});
     		});
     	   });
};


router.post('/fetchEmpalloc',fetchempalloc);
function fetchempalloc(req , res)
{
        var emp_access=req.user.rows['0'].user_type;
	var emp=req.user.rows['0'].user_id
        var proj_id=req.body.projid1; 
        console.log(proj_id);

        pdbconnect.query("select  distinct a.project_id as project_id,c.customer_name from project_alloc_tbl a inner join project_master_tbl p on a.project_id=p.project_id inner join customer_master_tbl c on c.customer_id = p.cid where a.del_flg='N' order by a.project_id asc",function(err,result)
	{
        	var project1=result.rows;
        	var projid_count1=result.rowCount;

        	pdbconnect.query("select a.emp_id,e.emp_name,a.emp_reporting_mgr,(select emp_name from emp_master_tbl where emp_id=a.emp_reporting_mgr) as ename,emp_loc_type,percentage_alloc,project_allocation_date,emp_project_relieving_date,emp_billable_flg from project_alloc_tbl a inner join emp_master_tbl e on a.emp_id=e.emp_id where a.del_flg='N' and a.project_id=$1 order by a.emp_id",[proj_id],function(err,result)
		{
        		alloc=result.rows;
        		alloc_count=result.rowCount;

        		pdbconnect.query("SELECT emp_id,emp_name from emp_master_tbl where emp_access in ('L1','L2') order by emp_name asc",function(err,result)
			{
        			manager=result.rows;
        			id_count=result.rowCount;

        			pdbconnect.query("select start_date,end_date from  project_master_tbl where project_id = $1",[proj_id],function(err,result)
				{
        				var sdate=result.rows[0].start_date;
        				var edate=result.rows[0].end_date;

					sdate = dateFormat(sdate,"yyyy-mm-dd");
					edate = dateFormat(edate,"yyyy-mm-dd");

        				pdbconnect.query("select e.emp_id,e.emp_name,(select COALESCE( NULLIF(sum(b.percentage_alloc),null) ,0) from project_alloc_tbl b where b.del_flg='N' and b.emp_id=e.emp_id) as alloc from emp_master_tbl e inner join e_docket_tbl d on e.emp_id=d.emp_id where e.emp_access in ('L2','L3') and pan_flg='Y' and aadhar_flg='Y' and sslc_flg='Y' and preuniv_flg='Y' and degree_flg='Y' and d.del_flg='N' and e.emp_id not in (select a.emp_id from project_alloc_tbl a group by a.emp_id having sum(percentage_alloc) =100) and e.emp_id not in (select DISTINCT a.emp_id from project_alloc_tbl a where a.project_id =$1) order by e.emp_name asc",[proj_id],function(err,result)
					{
        					var emp1=result.rows;
        					var empid_count1=result.rowCount;

        					pdbconnect.query("select e.emp_name,e.emp_id,(select COALESCE( NULLIF(sum(b.percentage_alloc),null) ,0) from project_alloc_tbl b where b.del_flg='N' and b.emp_id=e.emp_id) as alloc from emp_master_tbl e inner join e_docket_tbl d on e.emp_id=d.emp_id  where e.emp_access in ('L2','L3') and pan_flg='Y' and aadhar_flg='Y' and sslc_flg='Y' and preuniv_flg='Y' and degree_flg='Y' and d.del_flg='N' order by e.emp_name asc",function(err,result)
						{
        						var peralloc=result.rows;
        						var peralloc_count=result.rowCount;
							pdbconnect.query("select convertion_rate from project_alloc_tbl where project_id = $1 order by emp_id",[proj_id],function(err,result)
							{
								var convRate=result.rows;
								var convCnt=result.rowCount;

							

							console.log('emp1',emp1);
							console.log('empcnt',empid_count1);
							console.log('convRate',convRate);

							res.render('projectModule/ModifydelAllocation',{
							emp_access:emp_access,
							ename:req.user.rows['0'].user_name,
							eid:req.user.rows['0'].user_id,
							manager:manager,
							manid_count:id_count,
							proj_id:proj_id,
							project1:project1,
							projid_count1:projid_count1,
							alloc:alloc,
							alloc_count:alloc_count,
							sdate:sdate,
							edate:edate,
							emp1:emp1,
							empid_count1:empid_count1,
							convRate:convRate,
							convCnt:convCnt,
							peralloc_count:peralloc_count,
							peralloc:peralloc
							
													});
        					});
						});
        				});
        			});
        		});
        	});
        });
};


router.post('/viewProjectalloc',viewprojalloc);
function viewprojalloc(req , res)
{

        var emp_access=req.user.rows['0'].user_type;
        var proj_id=req.body.projid1; 
        console.log(proj_id);

        pdbconnect.query("select  distinct a.project_id as project_id,c.customer_name from project_alloc_tbl a inner join project_master_tbl p on a.project_id=p.project_id inner join customer_master_tbl c on c.customer_id = p.cid where a.del_flg='N' order by a.project_id asc",function(err,result)
	{
        	var project1=result.rows;
        	var projid_count1=result.rowCount;

        	pdbconnect.query("select a.emp_id,e.emp_name,a.emp_reporting_mgr,(select emp_name from emp_master_tbl where emp_id=a.emp_reporting_mgr) as ename,emp_loc_type,percentage_alloc,project_allocation_date,emp_project_relieving_date,emp_billable_flg from project_alloc_tbl a inner join emp_master_tbl e on a.emp_id=e.emp_id where a.del_flg='N' and a.project_id=$1 order by a.emp_id",[proj_id],function(err,result)
		{
        		alloc=result.rows;
        		alloc_count=result.rowCount;

        		pdbconnect.query("SELECT emp_id,emp_name from emp_master_tbl where emp_access in ('L1','L2') order by emp_id asc",function(err,result)
			{
        			manager=result.rows;
        			id_count=result.rowCount;
	
				pdbconnect.query("SELECT project_mgr,delivery_mgr from project_master_tbl where project_id=$1",[proj_id],function(err,result)
				{
					projectmgrid  = result.rows['0'].project_mgr;
					deliverymgrid = result.rows['0'].delivery_mgr;
					console.log("projectmgrid",projectmgrid);
					console.log("deliverymgrid",deliverymgrid);

					pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id=$1",[projectmgrid],function(err,result)
					{
						projectmgrname = result.rows['0'].emp_name;
						console.log("projectmgrname",projectmgrname);
	
						pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id=$1",[deliverymgrid],function(err,result)
						{
							deliverymgrname = result.rows['0'].emp_name;
							console.log("deliverymgrname",deliverymgrname); 
		
							res.render('projectModule/Allocationview',{
							emp_access:emp_access,
					        	ename:req.user.rows['0'].user_name,
						        eid:req.user.rows['0'].user_id,
							manager:manager,
							manid_count:id_count,
							proj_id:proj_id,
							project1:project1,
							projid_count1:projid_count1,
							alloc:alloc,
							projectmgrid:projectmgrid,
							deliverymgrid:deliverymgrid,
							projectmgrname:projectmgrname,
							deliverymgrname:deliverymgrname,
							alloc_count:alloc_count

						    						 });
						});
        				});
        			});
        		});
      		});
      	});
};



router.post('/viewEmpalloc',viewempalloc);
function viewempalloc(req , res)
{
        var emp_access=req.user.rows['0'].user_type;
        var emp_id=req.body.empid1; 
        console.log(emp_id);

        pdbconnect.query("select  distinct a.emp_id as emp_id,e.emp_name from project_alloc_tbl a inner join emp_master_tbl e on a.emp_id=e.emp_id where a.del_flg='N' order by a.emp_id asc",function(err,result)
	{
        	var emp1=result.rows;
        	var empid_count1=result.rowCount;

		pdbconnect.query("select a.project_id,a.emp_reporting_mgr,(select emp_name from emp_master_tbl where emp_id=a.emp_reporting_mgr) as ename,emp_loc_type,percentage_alloc,project_allocation_date,emp_project_relieving_date,emp_billable_flg from project_alloc_tbl a inner join emp_master_tbl e on a.emp_id=e.emp_id where a.del_flg='N' and a.emp_id=$1 order by a.project_id",[emp_id],function(err,result)
		{
			alloc=result.rows;
			alloc_count=result.rowCount;

			pdbconnect.query("SELECT emp_id,emp_name from emp_master_tbl where emp_access in ('L1','L2') order by emp_id asc",function(err,result)
			{
				manager=result.rows;
				id_count=result.rowCount;

        			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id=$1",[emp_id],function(err,result)
				{
        				var emp_name=result.rows[0].emp_name;

					res.render('projectModule/empAllocationview',{
					emp_access:emp_access,
	        			ename:req.user.rows['0'].user_name,
        				eid:req.user.rows['0'].user_id,
					manager:manager,
					manid_count:id_count,
					emp_id:emp_id,
					emp_name:emp_name,
					emp1:emp1,
					empid_count1:empid_count1,
					alloc:alloc,
					alloc_count:alloc_count
            									
										     });
        			});
        		});
        	});
        });
};



router.post('/projectAllocation',projectalloc);
function projectalloc(req , res)
{

	var now = new Date();
	var rcreuserid=req.user.rows[0].user_id;
	var rcretime=now;
	var lchguserid=req.user.rows[0].user_id;
	var lchgtime=now;
	var empsel=req.body.empselected;
	var noofdays=req.body.noofworkingdays;
	var noofmonths=req.body.noofworkingmonths;
	var firstmonthdays = req.body.firstmonthdays;
	var lastmonthdays = req.body.lastmonthdays;
	var firstnoofdays = req.body.firstnoofdays;
	var lastnoofdays = req.body.lastnoofdays;
	var projid=req.body.projid;
	var projman=req.body.projMgr;
	var peralloc=req.body.peralloc;
	var padate=req.body.paDate;
	var pedate=req.body.peDate;
	var employeebillable=req.body.empbill;
	var employeeloc=req.body.emploctype;
	var homecur=req.body.homecur;
	var convRate=req.body.convRate;
	var totempsal="";
	var ftxt1="";
	var ftxt2="";
	var ftxt3="";
	var errlength=0;
	var error_flg="N";
	if(convRate == "")
	{
		convRate = 1;
	}

	console.log('noofdays',noofdays);
	console.log('noofmonths',noofmonths);
	console.log('firstmonthdays',firstmonthdays);
	console.log('lastmonthdays',lastmonthdays);
	console.log('firstnoofdays',firstnoofdays);
	console.log('lastnoofdays',lastnoofdays);
	console.log("userid",rcreuserid);
	console.log("rtime",rcretime);
	console.log("luserid",lchguserid);
	console.log("ltime",lchgtime);
	console.log("selected",empsel);
	console.log("projectid",projid);
	console.log("projman",projman);
	console.log("%alloc",peralloc);
	console.log("padate",padate);
	console.log("pedate",pedate);
	console.log("homecur",homecur);
	console.log("employeebillable",employeebillable);
	console.log("emplocation",employeeloc);
	console.log("convertionrate",convRate);

        var emplist = empsel.slice(0, -1);
        var arr = emplist.split("-").map(function (val) { return +val + 0; });
        console.log("arrayemp",arr);
        var rArr =arr;
        var i=0;
        var j=0;
        emp="";
        totperalloc=0;
        perremalloc=0;
        var totempcnt=0;
        var totutilizedper=0;
        var len = arr.length;
        var arraycnt=0;
        console.log('arr len',len);

        if (len > 1)
        {
           peralloc=100; 
        }

        pdbconnect.query("SELECT sow_upld from project_master_tbl where project_id=$1",[projid],function(err,resultset)
	{
        	if(err) throw err;
        	var sow_upld_flg = resultset.rows[0].sow_upld;

		if(sow_upld_flg != "Y")
		{
			req.flash('error',"Project Allocation cannot be done , Since Project Sow Details have not been Uploaded")
			res.redirect('/projectModule/projectDetails/projectAllocation');
		}
		else
		{
        		pdbconnect.query("SELECT  comm_code_desc from common_code_tbl where del_flg='N' and code_id ='MAIL' and comm_code_id = 'PROJ' ",function(err,resultset)
			{
        			if(err) throw err;
        			var mail1 = resultset.rows[0].comm_code_desc;
        			console.log('mail1',mail1);


         			pdbconnect.query("select emp_email from emp_master_tbl where emp_id =$1",[rcreuserid],function(err,resultset)
				{
        				if(err) throw err;
        				var mail = resultset.rows[0].emp_email;

        				pdbconnect.query("SELECT  count(*) as cnt from project_master_tbl where closure_flg='N' and project_id =$1 and start_date<=$2",[projid,padate],function(err,resultset)
					{
        					if(err) throw err;
        					var count = resultset.rows[0].cnt;
        
            					if(count == 0)
            					{
                					error_flg="Y";
          					} 

						pdbconnect.query("SELECT  count(*) as cnt from project_master_tbl where closure_flg='N' and project_id =$1 and end_date>=$2",[projid,pedate],function(err,resultset)
						{
							if(err) throw err;
							var cnt = resultset.rows[0].cnt;
						
						    	if(cnt == 0)
						    	{
								error_flg="Y";
						      
						    	} 

					pdbconnect.query("SELECT salary,project_curr,rate,salarycurr,perdiumcurr,perdium_curr_per_day from project_master_tbl where closure_flg='N' and project_id =$1",[projid],function(err,resultset){
					if(err) throw err;
					var usablesalary = resultset.rows[0].salary;
					var projcurr     = resultset.rows[0].project_curr;
					var rate         = resultset.rows[0].rate;
					var salcurr       =resultset.rows[0].salarycurr;
					var perdiumcurr   = resultset.rows[0].perdiumcurr;
					var perdiumcurrperday   = resultset.rows[0].perdium_curr_per_day;

				//	if ( (projcurr == "INR") && (salcurr == "USD") )
			/*		if ( (projcurr == homecur) && (salcurr != homecur) )
					{
					    usablesalary = ( usablesalary - 0 ) * ( rate - 0 ); 
					}
				      
					if ( (projcurr != homecur) && (salcurr == homecur) )
					{
					    usablesalary = ( usablesalary - 0 ) / ( rate - 0 ); 
					}
					if ( (projcurr == homecur) && (salcurr != homecur) )
					{
					    usablesalary = ( usablesalary - 0 ) * ( rate - 0 ); 
					}
				      
					if ( (projcurr != homecur) && (salcurr == homecur) )
					{
					    usablesalary = ( usablesalary - 0 ) / ( rate - 0 ); 
					}*/
					usablesalary = ( usablesalary -0 ) * ( convRate - 0 );
					console.log(usablesalary);

		pdbconnect.query("SELECT sum(salary_reserved) as allocsalary from project_alloc_tbl where project_id =$1 and emp_loc_type='ONSITE' and del_flg='N'",[projid],function(err,resultset)
		{
			if(err) throw err;
			var allocatedsalary = resultset.rows[0].allocsalary;
        
        		arraycnt=0;
        		var totempsal=0;
        		
			arr.forEach(function(value)
        		{

				    console.log('noofmonths1',noofmonths);
				    console.log('firstmonthdays1',firstmonthdays);
				    console.log('lastmonthdays1',lastmonthdays);
				    console.log('allocatedsalary1',allocatedsalary);
				    console.log('firstnoofdays1',firstnoofdays);
				    console.log('lastnoofdays1',lastnoofdays);
				    console.log('usablesalary',usablesalary);

				    //pdbconnect.query("select salary from emp_master_tbl where emp_id=$1 group by salary_curr",[value],function(err,resultset){
				    pdbconnect.query("select salary from emp_master_tbl where emp_id=$1 ",[value],function(err,resultset){
				    if(err) throw err;
				    var emp_sal = resultset.rows[0].salary;
				    console.log('emp_sal',emp_sal);

				    var firstsalperday = ( emp_sal - 0 ) / ( firstnoofdays - 0 );
				    var firstsal = ( firstsalperday - 0 ) * ( firstmonthdays - 0 );
				    console.log('firstsal',firstsal);

				    var lastsalperday = ( emp_sal - 0 ) / ( lastnoofdays - 0 );
				    var lastsal = ( lastsalperday - 0 ) * ( lastmonthdays - 0 );
				    console.log('lastsal',lastsal);

				    var monthsal = ( emp_sal - 0 ) * ( noofmonths - 0 );
				    console.log('monthsal',monthsal);

				    if (noofmonths < 0)
				    {
					lastsal = 0;
					monthsal = 0;
				    }

            			    totempsal =( totempsal - 0 ) + ( firstsal - 0 ) + ( lastsal - 0 ) + ( monthsal - 0 );

            			    arraycnt = ( arraycnt - 0 ) + ( 1 - 0 );

    				    if ( (arraycnt == len) && (error_flg != "Y" ) )
    				    {
					  /*  if (projcurr != homecur)
					    {
						totempsal = ( totempsal - 0 ) / ( rate - 0 ); 
					    }

					    if (projcurr != homecur)
					    {
						totempsal = ( totempsal - 0 ) / ( rate - 0 ); 
					    }*/
					    totempsal	=	(totempsal - 0) * (convRate - 0);

					    totsal = ( totempsal - 0 ) + ( allocatedsalary - 0 );
					    console.log('totsal',totsal);


					    if (totsal > usablesalary)
					    {
            					    var diff = (totsal - 0 ) - ( usablesalary - 0 );
            					    var Budjetdiff = roundTo(diff, 2);

						    var smtpTransport = nodemailer.createTransport('SMTP',{
						    service: 'gmail',
						    auth: 
						    {
							user: 'amber@nurture.co.in',
							pass: 'nurture@123'
						    }
						    });

				    		    var mailOptions = 
						    {
					  			to:mail1,
					  			cc:mail,
					  			from: 'amber@nurture.co.in',
					  			subject: 'Salary Budjet Exceeding',
					  			text: 'Hi Team,\n\n' +
					  			'You are receiving this mail because you (or someone else) has tried modifying employee allocation for:\n' +
								'Project ID' + projid + '\n' +
								'Salary Budget is Exceeding by '+ Budjetdiff + ' ' + projcurr + '\n\n\n\n' +
								'- Regards,\nAmber'
					  	    };

					 	   smtpTransport.sendMail(mailOptions, function(err) {
					  	   });
		   
            			            }


     if (employeeloc == "ONSITE")
     {
        pdbconnect.query("SELECT perdium,perdium_amount_per_day from project_master_tbl where closure_flg='N' and project_id =$1",[projid],function(err,resultset){
        if(err) throw err;
        var usableperdium = resultset.rows[0].perdium;
        var locperdium = resultset.rows[0].perdium_amount_per_day;
 
 

        /*if ( (projcurr ==homecur ) && (perdiumcurr != homecur) )
        {
            usableperdium = ( usableperdium - 0 ) * ( rate - 0 ); 
        }
      
        if ( (projcurr != homecur) && (perdiumcurr == homecur) )
        {
            usableperdium = ( usableperdium - 0 ) / ( rate - 0 ); 
        }

        if ( (projcurr == homecur) && (perdiumcurrperday != homecur) )
        {
            locperdium = ( locperdium - 0 ) * ( rate - 0 ); 
        }
      
        if ( (projcurr != homecur) && (perdiumcurrperday ==homecur ) )
        {
            locperdium = ( locperdium - 0 ) / ( rate - 0 ); 
        }


        if ( (projcurr == homecur) && (perdiumcurr != homecur) )
        {
            usableperdium = ( usableperdium - 0 ) * ( rate - 0 ); 
        }
      
        if ( (projcurr != homecur) && (perdiumcurr == homecur) )
        {
            usableperdium = ( usableperdium - 0 ) / ( rate - 0 ); 
        }

        if ( (projcurr == homecur) && (perdiumcurrperday != homecur) )
        {
            locperdium = ( locperdium - 0 ) * ( rate - 0 ); 
        }
      
        if ( (projcurr != homecur) && (perdiumcurrperday == homecur) )
        {
            locperdium = ( locperdium - 0 ) / ( rate - 0 ); 
        }*/
	usableperdium=(usableperdium - 0) * (ConvRate - 0);
	locperdium = (locperdium -0) * (convRate - 0);

	
	console.log('usableperdium',usableperdium);
	console.log('locperdium',locperdium);

        pdbconnect.query("SELECT sum(working_days) as totdays from project_alloc_tbl where project_id =$1 and emp_loc_type='ONSITE' and del_flg='N'",[projid],function(err,resultset){
        if(err) throw err;
        var workdays = resultset.rows[0].totdays;

        var newworkdays = ( len - 0 ) * ( noofdays - 0 );
        var totworkdays=( newworkdays - 0 ) + ( workdays - 0 );
        totutilizedper=( locperdium - 0 ) * ( totworkdays - 0 );

        var reservedperdium = ( locperdium - 0 ) * ( noofdays - 0 );
        console.log('--------per reserved-----',reservedperdium);
        var empreservedperdium = roundTo(reservedperdium, 2);

        if (totutilizedper > usableperdium)
        {

            var diff = (totutilizedper - 0 ) - ( usableperdium - 0 );
            var Budjetdiff = roundTo(diff, 2);
            var smtpTransport = nodemailer.createTransport('SMTP',{
            service: 'gmail',
            auth: 
            {
                user: 'amber@nurture.co.in',
                pass: 'nurture@123'
            }
            });

            var mailOptions = {
                  to:mail1,
                  cc:mail,
                  from: 'amber@nurture.co.in',
                  subject: 'Perdium Budjet Exceeding',
                  text: 'Hi Team,\n' +
                  'You are receiving this because you (or someone else) have tried modifying employee allocation for:\n' +
		  'Project ID' + projid + '\n' + 
		  'Perdium Budget is exceeding by '+ Budjetdiff + ' ' + projcurr + '\n\n\n\n' +
		  '- Regards,\nAmber'
                  };

                 smtpTransport.sendMail(mailOptions, function(err) {
                  });
        }

    
    if(error_flg != "Y")
    {
     arr.forEach(function(value)
    	{

            
            pdbconnect.query("select salary from emp_master_tbl where emp_id=$1",[value],function(err,resultset){
            if(err) throw err;
            var emp_sal = resultset.rows[0].salary;
            console.log('emp_sal',emp_sal);
            var firstsalperday = ( emp_sal - 0 ) / ( firstnoofdays - 0 );
            var firstsal = ( firstsalperday - 0 ) * ( firstmonthdays - 0 );
            console.log('firstsal',firstsal);

            var lastsalperday = ( emp_sal - 0 ) / ( lastnoofdays - 0 );
            var lastsal = ( lastsalperday - 0 ) * ( lastmonthdays - 0 );
            console.log('lastsal',lastsal);

            var monthsal = ( emp_sal - 0 ) * ( noofmonths - 0 );
            console.log('monthsal',monthsal);

            if (noofmonths < 0)
            {
                lastsal = 0;
                monthsal = 0;

            }

            

            var reservedsal = ( firstsal - 0 ) + ( lastsal - 0 ) + ( monthsal - 0 );

            /*if (projcurr != homecur)
            {
                reservedsal = ( reservedsal - 0 ) / ( rate - 0 ); 
            }*/
	    reservedsal	=	( resrevedsal - 0) * (convRate - 0);

            /*if (projcurr == "GBP")
            if (projcurr != homecur)
            {
                reservedsal = ( reservedsal - 0 ) / ( rate - 0 ); 
            }*/
            var empreservedsal = roundTo(reservedsal, 2);
            console.log(' employee salary reserved',empreservedsal);

        pdbconnect.query("SELECT  count(*) as cnt from project_alloc_tbl  where del_flg='N' and emp_id =$1 and project_id =$2",[value,projid],function(err,resultset){
        if(err) throw err;
        var ecount = resultset.rows[0].cnt;
        console.log('ecount',ecount);
        if(ecount == 0)
        {
	        pdbconnect.query("SELECT  count(*) as cnt from project_alloc_tbl  where del_flg='N' and emp_id =$1",[value],function(err,resultset){
            if(err) throw err;
            var rcount = resultset.rows[0].cnt;
            if(rcount > 0)
			{
			pdbconnect.query("select sum(percentage_alloc) as salloc from project_alloc_tbl WHERE del_flg='N' and emp_id=$1",[value],function(err,result){
				if(err) throw err;	
				var sAlloc = result.rows[0].salloc;	
                console.log('sumalloc',sAlloc);
				totperalloc = ( sAlloc - 0 ) + ( peralloc - 0 );
				perremalloc = ( 100 - 0 ) - ( sAlloc - 0 )
				if( totperalloc < 100 )
				{
                    pdbconnect.query("INSERT INTO public.project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,convertion_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)",[projid,value,employeeloc,projman,padate,employeebillable,pedate,rcreuserid,rcretime,lchguserid,lchgtime,'N',ftxt1,ftxt2,ftxt3,peralloc,noofdays,empreservedsal,empreservedperdium,projcurr,convRate],function(err,result){
                    if(err) throw err;
                        pdbconnect.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3",[projman,projid,value],function(err,done){
                        if(err) throw err;
                         });   
                    });
                                 
				}
				if(perremalloc > 0)
				{
                    pdbconnect.query("INSERT INTO public.project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,convertion_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)",[projid,value,employeeloc,projman,padate,employeebillable,pedate,rcreuserid,rcretime,lchguserid,lchgtime,'N',ftxt1,ftxt2,ftxt3,perremalloc,noofdays,empreservedsal,empreservedperdium,projcurr,convRate],function(err,result){
                    if(err) throw err;
                        pdbconnect.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3",[projman,projid,value],function(err,done){
                        if(err) throw err;
                         });   
                    });
				}	

			});	
			}
			else
			{
            	pdbconnect.query("INSERT INTO public.project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,conertio_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)",[projid,value,employeeloc,projman,padate,employeebillable,pedate,rcreuserid,rcretime,lchguserid,lchgtime,'N',ftxt1,ftxt2,ftxt3,peralloc,noofdays,empreservedsal,empreservedperdium,projcurr,convRate],function(err,result){
            	if(err) throw err;
                       pdbconnect.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3",[projman,projid,value],function(err,done){
                        if(err) throw err;
                         });   
            	});

			}
				req.flash('success',"Employees Allocated to " + projid +" successfully")
          		res.redirect(req.get('referer'));
			});
		}
		else
		{
			console.log("already allocated");
		
		}

		});

    });/*salary query*/

    });



    }

    });
  
    });

    }

    /*For OFFSHORE Location*/
    else
    {

        var reservedperdium=0;
        var empreservedperdium = roundTo(reservedperdium, 2);

     arr.forEach(function(value)
        {

            console.log('in OFFSHORE else');

            var empreservedsal =0;
            pdbconnect.query("select salary from emp_master_tbl where emp_id=$1",[value],function(err,resultset){
            if(err) throw err;
            var emp_sal = resultset.rows[0].salary;
            console.log('emp_sal',emp_sal);
            var firstsalperday = ( emp_sal - 0 ) / ( firstnoofdays - 0 );
            var firstsal = ( firstsalperday - 0 ) * ( firstmonthdays - 0 );
            console.log('firstsal',firstsal);

            var lastsalperday = ( emp_sal - 0 ) / ( lastnoofdays - 0 );
            var lastsal = ( lastsalperday - 0 ) * ( lastmonthdays - 0 );
            console.log('lastsal',lastsal);

            var monthsal = ( emp_sal - 0 ) * ( noofmonths - 0 );
            console.log('monthsal',monthsal);

            if (noofmonths < 0)
            {
                lastsal = 0;
                monthsal = 0;

            }

            var reservedsal = ( firstsal - 0 ) + ( lastsal - 0 ) + ( monthsal - 0 );

            /*if (projcurr == "USD")
            {
                reservedsal = ( reservedsal - 0 ) / ( rate - 0 ); 
            }

            if (projcurr == "GBP")
            {
                reservedsal = ( reservedsal - 0 ) / ( rate - 0 ); 
            }*/
		reservedsal = ( reservedsal -0 ) * ( convRate - 0);
            var empreservedsal = roundTo(reservedsal, 2);
            console.log(' employee salary reserved',empreservedsal);

        pdbconnect.query("SELECT  count(*) as cnt from project_alloc_tbl  where del_flg='N' and emp_id =$1 and project_id =$2",[value,projid],function(err,resultset){
        if(err) throw err;
        var ecount = resultset.rows[0].cnt;
        console.log('ecount',ecount);
        if(ecount == 0)
        {
            pdbconnect.query("SELECT  count(*) as cnt from project_alloc_tbl  where del_flg='N' and emp_id =$1",[value],function(err,resultset){
            if(err) throw err;
            var rcount = resultset.rows[0].cnt;
            if(rcount > 0)
            {
            pdbconnect.query("select sum(percentage_alloc) as salloc from project_alloc_tbl WHERE del_flg='N' and emp_id=$1",[value],function(err,result){
                if(err) throw err;  
                var sAlloc = result.rows[0].salloc; 
                console.log('sumalloc',sAlloc);
                totperalloc = ( sAlloc - 0 ) + ( peralloc - 0 );
                perremalloc = ( 100 - 0 ) - ( sAlloc - 0 )
                if( totperalloc < 100 )
                {
                    pdbconnect.query("INSERT INTO public.project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,convertion_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)",[projid,value,employeeloc,projman,padate,employeebillable,pedate,rcreuserid,rcretime,lchguserid,lchgtime,'N',ftxt1,ftxt2,ftxt3,peralloc,noofdays,empreservedsal,empreservedperdium,projcurr,convRate],function(err,result){
                    if(err) throw err;
                        pdbconnect.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3",[projman,projid,value],function(err,done){
                        if(err) throw err;
                         });   
                    });
                                 
                }
                if(perremalloc > 0)
                {
                    pdbconnect.query("INSERT INTO public.project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,convertion_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)",[projid,value,employeeloc,projman,padate,employeebillable,pedate,rcreuserid,rcretime,lchguserid,lchgtime,'N',ftxt1,ftxt2,ftxt3,perremalloc,noofdays,empreservedsal,empreservedperdium,projcurr,convRate],function(err,result){
                    if(err) throw err;
                        pdbconnect.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3",[projman,projid,value],function(err,done){
                        if(err) throw err;
                         });   
                    });
                }   

            }); 
            }
            else
            {
                pdbconnect.query("INSERT INTO public.project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,convertion_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)",[projid,value,employeeloc,projman,padate,employeebillable,pedate,rcreuserid,rcretime,lchguserid,lchgtime,'N',ftxt1,ftxt2,ftxt3,peralloc,noofdays,empreservedsal,empreservedperdium,projcurr,convRate],function(err,result){
                if(err) throw err;
                       pdbconnect.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3",[projman,projid,value],function(err,done){
                        if(err) throw err;
                         });   
                });

            }
                req.flash('success',"Employees Allocated to " + projid +" successfully")
                res.redirect(req.get('referer'));
            });
        }
        else
        {
            console.log("already allocated");
           
        }

        });
    });/*salary query*/

    });

    }  /*else end For OFFSHORE Location*/
    arraycnt =-1;
    }/*if for arrcnt and err_flg*/
    }); /*emp sal query*/
    }); /* first sal for loop */
    });/*reserved salary query*/
    });/*usable salary query*/

    });
  });
});
});
}//close of sow 
});
};
/* Code for project modificaion */
router.get('/projectModification',function(req,res)
{

var project_id="";
var cid="";
var project_loc="";
var payment_type="";
var customer_class="";
var team_size="";
var project_mgr="";
var delivery_mgr="";
var project_type="";
var project_curr="";
var project_budget="";
var target_margin="";
var tot_budget="";
var salary="";
var perdium="";
var other_exp="";
var tnm_po_value="";
var tnm_num_ppl="";
var fl_modules_included="";
var fl_num_users="";
var fl_num_of_branches="";
var fl_exp_date="";
var start_date="";
var closure_date="";
var milestone="";
var milestone_count="";
var comm_code_desc="";
var comm_code_desc_count="";
var comm_code_id="";
var comm_code_id_count="";
var customer_name="";
var customerall_id="";
var customerall_name="";
var customerall_count="";
var customer_id="";
var comm_paymentype="";
var comm_paymentype_count="";
var comm_paymentdesc="";
var comm_customerdesc="";
var comm_cusclass="";
var comm_cusclass_count="";
var proj_name="";
var proj_name_count="";
var empname="";
var empid_count="";
var employee="";
var delid="";
var delid_count="";
var delname="";
var delprojname="";
var delname_count="";
var comm_code_pty="";
var comm_code_pty_count="";
var comm_code_desc="";
var comm_code_pcr="";
var comm_code_pcr_count="";
var travel="";
var comm_code_tnu="";
var comm_code_tnu_count="";
var comm_code_desc_tnu="";
var closure_flg="";
var closure_date="";
var end_date="";
var rate="";
var po_number="";
var remarks="";
var bill_addrline1="";
var bill_addrline2="";
var bill_country="";
var bill_city="";
var bill_pin_code="";
var salarycurr="";
var perdiumcurr="";
var travelcurr="";
var other_expcurr="";
var perdium_amount_per_day="";
var perdium_curr_per_day="";
var milestonemark="";
var milestonemark_count="";
var ErrFlg="N";
var alloccount="";
var client_closure_date="";
var  salary_rate="";
var  perdiem_rate="";
var  travel_rate="";
var  other_rate="";
var  salary_converted_amt="";
var  travel_converted_amt="";
var  perdiem_converted_amt="";
var  other_converted_amt="";
	var datetime = new Date();
	console.log("sysdate",datetime);

	pdbconnect.query("SELECT project_id from project_master_tbl where closure_flg='N'  order by project_id asc",function(err,result){
	if(err) throw err;
	projectid=result.rows;
	projectid_count=result.rowCount;
	console.log("projectid:::",projectid);
	console.log("projectid_count:::",projectid_count);



        pdbconnect.query("SELECT customer_id from customer_master_tbl order by customer_id asc",function(err,result){
        customer_id=result.rows;
        customer_count=result.rowCount;
        console.log("cid:::",customer_id);
        console.log("cid_count:::",customer_count);

        pdbconnect.query("SELECT customer_name from customer_master_tbl order by customer_id asc",function(err,result){
        customer_name=result.rows;
        customername_count=result.rowCount;
        console.log("cname:::",customer_name);
        console.log("cidname_count:::",customername_count);

        pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'CUS' order by comm_code_id asc",function(err,result){
        comm_code_id=result.rows;
        comm_code_id_count=result.rowCount;
        console.log("classid:::",comm_code_id);
        console.log("classid_count:::",comm_code_id_count);

        pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id = 'CUS'  order by comm_code_id asc",function(err,result){
        comm_code_desc=result.rows;
        comm_code_desc_count=result.rowCount;
        console.log("classdesc::",comm_code_desc);
        console.log("classdesc_count:::",comm_code_desc_count);

        var empId = req.user.rows['0'].user_id;
        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        emp_access=result.rows['0'].user_type;
	//var emp_access=req.user.rows['0'].user_type;
        //console.log("empaccess",emp_access);

        if(emp_access != "L1" && emp_access != "L2")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {





res.render('projectModule/projectModification',{
employee:employee,
empid_count:empid_count,
ename:req.user.rows['0'].user_name,
eid:req.user.rows['0'].user_id,
empname:empname,
customer_id:customer_id,
customer_count:customer_count,
customer_name:customer_name,
comm_code_id:comm_code_id,
comm_code_id_count:comm_code_id_count,
comm_code_desc:comm_code_desc,
comm_code_pcr:comm_code_pcr,
comm_code_pcr_count:comm_code_pcr_count,
comm_code_pty:comm_code_pty,
comm_code_pty_count:comm_code_pty_count,
comm_code_tnu:comm_code_tnu,
comm_code_tnu_count:comm_code_tnu_count,
delname_count:delname_count,
delid:delid,
delid_count:delid_count,
 project_id:project_id,
 cid:cid,
 project_loc:project_loc,
 payment_type:payment_type,
 customer_class:customer_class,
 team_size:team_size,
 project_mgr:project_mgr,
 delivery_mgr:delivery_mgr,
 project_type:project_type,
 project_curr:project_curr,
 project_budget:project_budget,
 target_margin:target_margin,
 tot_budget:tot_budget,
 salary:salary,
 perdium:perdium,
 other_exp:other_exp,
 tnm_po_value:tnm_po_value,
 tnm_num_ppl:tnm_num_ppl,
 fl_modules_included:fl_modules_included,
 fl_num_users:fl_num_users,
 fl_num_of_branches:fl_num_of_branches,
 fl_exp_date:fl_exp_date,
 start_date:start_date,
 closure_date:closure_date,
 milestone:milestone,
 milestone_count:milestone_count,
 comm_code_desc:comm_code_desc,
 comm_code_desc_count:comm_code_desc_count,
 comm_code_id:comm_code_id,
 comm_code_id_count:comm_code_id_count,
 customer_name:customer_name,
customerall_id:customerall_id,
customerall_name:customerall_name,
customerall_count:customerall_count,
customer_id:customer_id,
comm_paymentype:comm_paymentype,
comm_paymentype_count:comm_paymentype_count,
comm_paymentdesc:comm_paymentdesc,
comm_customerdesc:comm_customerdesc,
comm_cusclass:comm_cusclass,
comm_cusclass_count:comm_cusclass_count,
proj_name:proj_name,
proj_name_count:proj_name_count,
empname:empname,
employee:employee,
empid_count:empid_count,
delid:delid,
delid_count:delid_count,
delname:delname,
delprojname:delprojname,
comm_code_pty:comm_code_pty,
comm_code_pty_count:comm_code_pty_count,
comm_code_desc:comm_code_desc,
comm_code_pcr:comm_code_pcr,
comm_code_pcr_count:comm_code_pcr_count,
travel:travel,
comm_code_tnu:comm_code_tnu,
comm_code_tnu_count:comm_code_tnu_count,
comm_code_desc_tnu:comm_code_desc_tnu,
closure_flg:closure_flg,
closure_date:closure_flg,
end_date:end_date,
emp_access:emp_access,
rate:rate,
po_number:po_number,
remarks:remarks,
bill_addrline1:bill_addrline1,
bill_addrline2:bill_addrline2,
bill_country:bill_country,
bill_city:bill_city,
bill_pin_code:bill_pin_code,
salarycurr:salarycurr,
perdiumcurr:perdiumcurr,
travelcurr:travelcurr,
other_expcurr:other_expcurr,
perdium_amount_per_day:perdium_amount_per_day,
perdium_curr_per_day:perdium_curr_per_day,
milestonemark:milestonemark,
milestonemark_count:milestonemark_count,
ErrFlg:ErrFlg,
alloccount:alloccount,
client_closure_date:client_closure_date,
 salary_rate:salary_rate,
 perdiem_rate:perdiem_rate,
 travel_rate:travel_rate,
 other_rate:other_rate,
 salary_converted_amt:salary_converted_amt,
 travel_converted_amt:travel_converted_amt,
 perdiem_converted_amt:perdiem_converted_amt,
 other_converted_amt:other_converted_amt

});
}
});
});
});
});
});
});
});

router.post('/ModProjDetails',ModProjDetails);

function ModProjDetails(req , res)
{

console.log("inside 1");
var projectid=req.body.projectid;
console.log("project_id",projectid);


pdbconnect.query("SELECT project_id,cid,project_loc,payment_type,customer_class,team_size,project_mgr,delivery_mgr,project_type,project_curr,project_budget,closure_flg,closure_date,rate,po_number,remarks,bill_addrline1,bill_addrline2,bill_country,bill_city,bill_pin_code,target_margin,tot_budget,salary,salarycurr,perdium,perdiumcurr,travel,travelcurr,other_exp,other_expcurr,fl_modules_included,fl_num_users,fl_num_of_branches,start_date,end_date,perdium_amount_per_day,perdium_curr_per_day,client_closure_date,salary_rate,perdiem_rate,travel_rate,other_rate,salary_converted_amt,travel_converted_amt,perdiem_converted_amt,other_converted_amt from project_master_tbl where LOWER(project_id)=LOWER($1)",[projectid],function(err,resultset){
if (err) throw err;
var project_id=resultset.rows['0'].project_id;
var cid=resultset.rows['0'].cid;
var bill_pin_code=resultset.rows['0'].bill_pin_code;
var project_loc=resultset.rows['0'].project_loc;
var payment_type=resultset.rows['0'].payment_type;
var customer_class=resultset.rows['0'].customer_class;
var team_size=resultset.rows['0'].team_size;
var project_mgr=resultset.rows['0'].project_mgr;
var delivery_mgr=resultset.rows['0'].delivery_mgr;
var project_type=resultset.rows['0'].project_type;
var project_curr=resultset.rows['0'].project_curr;
var project_budget=resultset.rows['0'].project_budget;
var target_margin=resultset.rows['0'].target_margin;
var tot_budget=resultset.rows['0'].tot_budget;
var salary=resultset.rows['0'].salary;
var perdium=resultset.rows['0'].perdium;
var travel=resultset.rows['0'].travel;
var other_exp=resultset.rows['0'].other_exp;
var tnm_po_value=resultset.rows['0'].tnm_po_value;
var tnm_num_ppl=resultset.rows['0'].tnm_num_ppl;
var fl_modules_included=resultset.rows['0'].fl_modules_included;
var fl_num_users=resultset.rows['0'].fl_num_users;
var fl_num_of_branches=resultset.rows['0'].fl_num_of_branches;
var start_date=resultset.rows['0'].start_date;
var end_date=resultset.rows['0'].end_date;
var closure_flg=resultset.rows['0'].closure_flg;
var closure_date=resultset.rows['0'].closure_date;
var rate=resultset.rows['0'].rate;
var po_number=resultset.rows['0'].po_number;
var remarks=resultset.rows['0'].remarks;
var bill_addrline1=resultset.rows['0'].bill_addrline1;
var bill_addrline2=resultset.rows['0'].bill_addrline2;
var bill_country=resultset.rows['0'].bill_country;
var bill_city=resultset.rows['0'].bill_city;
var bill_pin_code=resultset.rows['0'].bill_pin_code;
var salarycurr=resultset.rows['0'].salarycurr;
var perdiumcurr=resultset.rows['0'].perdiumcurr;
var travelcurr=resultset.rows['0'].travelcurr;
var other_expcurr=resultset.rows['0'].other_expcurr;
var perdium_amount_per_day=resultset.rows['0'].perdium_amount_per_day;
var perdium_curr_per_day=resultset.rows['0'].perdium_curr_per_day;
var client_closure_date=null;
var client_closure_date1=resultset.rows['0'].client_closure_date;
var salary_rate=resultset.rows['0'].salary_rate;
var perdiem_rate=resultset.rows['0'].perdiem_rate;
var travel_rate=resultset.rows['0'].travel_rate;
var other_rate=resultset.rows['0'].other_rate;
var salary_converted_amt=resultset.rows['0'].salary_converted_amt;
var travel_converted_amt=resultset.rows['0'].travel_converted_amt;
var perdiem_converted_amt=resultset.rows['0'].perdiem_converted_amt;
var other_converted_amt=resultset.rows['0'].other_converted_amt;
var comm_code_desc_tnu="";
var ErrFlg="N";
console.log("project_id",project_id);
console.log("cid_id",cid);
console.log("delivery_mgr",delivery_mgr);
console.log("project_type",project_type);
console.log("tot_budget",tot_budget);
console.log("salary",salary);
console.log("team_size",team_size);
console.log("vartenure",tenure);
console.log("varother_expcurr",other_expcurr);
console.log("client closure date1",client_closure_date1);
console.log("salary_rate",salary_rate);
console.log("perdiem_rate",perdiem_rate);
console.log("travel_rate",travel_rate);
console.log("other_rate",other_rate);
if(tenure=="")
{
 var	tenure=null;
}
var start_date1=dateFormat(start_date, "yyyy-mm-dd");
var end_date1=dateFormat(end_date, "yyyy-mm-dd");
if(client_closure_date1 != null)
{
var client_closure_date=dateFormat(client_closure_date1, "yyyy-mm-dd");
}
console.log("tenure1",tenure);
	pdbconnect.query("SELECT milestone_name,capture_per,direct_amount,milestone_exp_date from milestone_proj_tbl  where LOWER(project_id)=LOWER($1) and confirm_flg='N' and paid_flg='N' order by serial_number",[projectid],function(err,resultset){
	 milestone=resultset.rows;
	 milestone_count=resultset.rowCount;

	console.log("milestone",milestone);
	console.log("milstone_count",milestone_count);

        pdbconnect.query("SELECT milestone_name,capture_per,direct_amount,milestone_exp_date from milestone_proj_tbl  where LOWER(project_id)=LOWER($1) and confirm_flg='Y'",[projectid],function(err,resultset){
         milestonemark=resultset.rows;
         milestonemark_count=resultset.rowCount;

        console.log("mark milestone",milestone);
        console.log("mark milstone_count",milestone_count);



        pdbconnect.query("SELECT customer_id from customer_master_tbl order by customer_id asc",function(err,result){
        customerall_id=result.rows;
        customerall_count=result.rowCount;

        pdbconnect.query("SELECT customer_name from customer_master_tbl order by customer_id asc",function(err,result){
        customerall_name=result.rows;
        customernameall_count=result.rowCount;


	 pdbconnect.query("SELECT customer_name from customer_master_tbl where customer_id=$1",[cid],function(err,resultset){
	customer_name=resultset.rows['0'].customer_name;
	customer_name_count=result.rowCount;
	console.log("customername:::",customer_name);

	 pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='PAT' and comm_code_id=$1",[payment_type],function(err,resultset){
	comm_paymentdesc=resultset.rows['0'].comm_code_desc;
	console.log("paymenttype:::",comm_paymentdesc);

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PAT' order by comm_code_id asc",function(err,result){
        comm_paymentype=result.rows;
        comm_paymentype_count=result.rowCount;
        console.log("classpayment:::",comm_paymentype);
        console.log("classpayment_count:::",comm_paymentype_count);

	 pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='CUS' and comm_code_id=$1",[customer_class],function(err,resultset){
	comm_customerdesc=resultset.rows['0'].comm_code_desc;
	console.log("customerdesc:::",comm_customerdesc);

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'CUS' order by comm_code_id asc",function(err,result){
        comm_cusclass=result.rows;
        comm_cusclass_count=result.rowCount;
        console.log("classpayment:::",comm_cusclass);
        console.log("classpayment_count:::",comm_cusclass_count);

        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id = $1 ",[project_mgr],function(err,result){
        proj_name=result.rows['0'].emp_name;
        proj_name_count=result.rowCount;
        console.log("project name:::",proj_name);

	pdbconnect.query("SELECT emp_id from emp_master_tbl order by emp_id asc",function(err,result){
	employee=result.rows;
	empid_count=result.rowCount;
	console.log("empid:::",employee);
	console.log("empid_count:::",empid_count);

	pdbconnect.query("SELECT emp_name from emp_master_tbl order by emp_id asc",function(err,result){
	empname=result.rows;
	empname_count=result.rowCount;
	console.log("empname:::",empname);
	console.log("empname_count:::",empname_count);

	pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_access in ('L1','L2') order by emp_id asc",function(err,result){
	delname=result.rows;
	delname_count=result.rowCount;
	console.log("delname:::",delname);
	console.log("delname_count:::",delname_count);

	pdbconnect.query("SELECT emp_id from emp_master_tbl where emp_access in ('L1','L2') order by emp_id asc",function(err,result){
	delid=result.rows;
	delid_count=result.rowCount;
	console.log("delid:::",delid);
	console.log("delid_count:::",delid_count);

	pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id=$1 ",[delivery_mgr],function(err,result){
	delprojname=result.rows['0'].emp_name;
	console.log("delname:::",delprojname);

      	pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PTY'  order by comm_code_id asc",function(err,result){
        comm_code_pty=result.rows;
        comm_code_pty_count=result.rowCount;
        console.log("classdesc::",comm_code_pty);
        console.log("classdesc_count:::",comm_code_pty_count);

      	pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id = 'PTY'  and comm_code_id=$1",[project_type],function(err,result){
        comm_code_desc=result.rows['0'].comm_code_desc;
        console.log("classdesc::",comm_code_desc);

	pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'PCR'  order by comm_code_id asc",function(err,result){
        comm_code_pcr=result.rows;
        comm_code_pcr_count=result.rowCount;
        console.log("classdesc::",comm_code_pcr);
        console.log("classdesc_count:::",comm_code_pcr_count);

	pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TNU'  order by comm_code_id asc",function(err,result){
        comm_code_tnu=result.rows;
        comm_code_tnu_count=result.rowCount;
        console.log("classdesc::",comm_code_tnu);
        console.log("classdesc_count:::",comm_code_tnu_count);

	pdbconnect.query("SELECT * from project_alloc_tbl where project_id=$1 and del_flg='N' ",[projectid],function(err,result){
	alloccount=result.rowCount;


        pdbconnect.query("SELECT paid_flg from milestone_proj_tbl where project_id=$1 ",[projectid],function(err,result){
        paid=result.rows;
        paidcount=result.rowCount;
        console.log("paidflg:::",paid);
        console.log("paidcount",paidcount);


    for(k=0;k<paidcount;k++)
    {
        var paid1 = result.rows[k].paid_flg;
        console.log("paid1",paid1);
        if(paid1 == "N")
        {
            ErrFlg="Y";
            console.log("inside loop for error flag");
        }
    }	


        var empId = req.user.rows['0'].user_id;
        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        emp_access=result.rows['0'].user_type;

console.log("milestone after",milestone);
console.log("milstone_count after",milestone_count);
console.log("remmarks",remarks);

res.render('projectModule/projectModification',{

 project_id:project_id,
 cid:cid,
ename:req.user.rows['0'].user_name,
eid:req.user.rows['0'].user_id,
 project_loc:project_loc,
 payment_type:payment_type,
 customer_class:customer_class,
 team_size:team_size,
 project_mgr:project_mgr,
 delivery_mgr:delivery_mgr,
 project_type:project_type,
 project_curr:project_curr,
 project_budget:project_budget,
 target_margin:target_margin,
 tot_budget:tot_budget,
 salary:salary,
 perdium:perdium,
 travel:travel,
 other_exp:other_exp,
 tnm_po_value:tnm_po_value,
 tnm_num_ppl:tnm_num_ppl,
 fl_modules_included:fl_modules_included,
 fl_num_users:fl_num_users,
 fl_num_of_branches:fl_num_of_branches,
 start_date:start_date1,
 end_date:end_date1,
milestone:milestone,
milestone_count:milestone_count,
customer_name:customer_name,
customerall_id:customerall_id,
customerall_name:customerall_name,
customerall_count:customerall_count,
comm_paymentype:comm_paymentype,
comm_paymentype_count:comm_paymentype_count,
comm_paymentdesc:comm_paymentdesc,
comm_customerdesc:comm_customerdesc,
comm_cusclass:comm_cusclass,
comm_cusclass_count:comm_cusclass_count,
proj_name:proj_name,
employee:employee,
empname:empname,
empid_count:empid_count,
delname:delname,
delid:delid,
delid_count:delid_count,
delprojname:delprojname,
comm_code_pty:comm_code_pty,
comm_code_pty_count:comm_code_pty_count,
comm_code_desc:comm_code_desc,
comm_code_pcr:comm_code_pcr,
comm_code_pcr_count:comm_code_pcr_count,
comm_code_tnu:comm_code_tnu,
comm_code_tnu_count:comm_code_tnu_count,
comm_code_desc_tnu:comm_code_desc_tnu,
closure_flg:closure_flg,
closure_date:closure_date,
emp_access:emp_access,
rate:rate,
po_number:po_number,
remarks:remarks,
bill_addrline1:bill_addrline1,
bill_addrline2:bill_addrline2,
bill_country:bill_country,
bill_city:bill_city,
bill_pin_code:bill_pin_code,
salarycurr:salarycurr,
perdiumcurr:perdiumcurr,
travelcurr:travelcurr,
other_expcurr:other_expcurr,
perdium_amount_per_day:perdium_amount_per_day,
perdium_curr_per_day:perdium_curr_per_day,
milestonemark:milestonemark,
milestonemark_count:milestonemark_count,
ErrFlg:ErrFlg,
alloccount:alloccount,
client_closure_date:client_closure_date,
 salary_rate:salary_rate,
 perdiem_rate:perdiem_rate,
 travel_rate:travel_rate,
 other_rate:other_rate,
 salary_converted_amt:salary_converted_amt,
 travel_converted_amt:travel_converted_amt,
 perdiem_converted_amt:perdiem_converted_amt,
 other_converted_amt:other_converted_amt

});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
};

router.post('/projectModDetails',projectmod);

 function projectmod(req , res)
{

   var empId = req.user.rows['0'].user_id;
   var eid = req.user.rows['0'].user_id;
   var now = new Date();
   var lchguserid=empId;
   var lchgtime=now;
   var cid=req.body.cid; 
   var proid=req.body.proid; 
   var paymenttype=req.body.paymenttype; 
   var classid=req.body.classid;
   var cusclassid=req.body.cusclassid;
   var Cusclassdesc=req.body.Cusclassdesc 
   var projectsize=req.body.projectsize; 
   var projectmgr=req.body.projmgr; 
   var projtype=req.body.projtype;
   var projcur=req.body.projcur;
   var projsdate=req.body.projsdate;
   var projcdate=req.body.projcdate;
   var Projbud=req.body.Projbud;
   var targmar=req.body.targmar;
   var Totalbud=req.body.Totalbud;
   var salary=req.body.salary;
   var perdium=req.body.perdium;
   var travel=req.body.travel;
   var other=req.body.other;
   var module=req.body.module;
   var nousers=req.body.nousers;
   var nobranch=req.body.nobranch;
   var fpexpdate=req.body.fpexpdate;
   var millength=req.body.millength;
   var delmgr=req.body.delmgr;
   var closureflg=req.body.closureflg;
   var projclosuredate=req.body.projclosuredate;
if(projclosuredate=="")
{
	projclosuredate=null;
}
   var tenure=req.body.tenure;
   var subper=req.body.subper;
   var subamt=req.body.subamt;
   var povalue=req.body.povalue;
   var Noofppl=req.body.Noofppl;
   var povalue=req.body.povalue;
   var Noofppl=req.body.Noofppl;
   var perloc=req.body.perloc;
   var perdiumamt=req.body.perdiumamt;
   var percur=req.body.percur;
   var rateamt=req.body.rateamt;
   var ponumber=req.body.ponumber;
   var rmks=req.body.rmks;
   var clientaddr1=req.body.clientaddr1;
   var clientaddr2=req.body.clientaddr2;
   var countryId=req.body.countryId;
   var cityId=req.body.cityId;
   var pincode=req.body.pincode;
   var perloc=req.body.perloc;
   var perdiumamt=req.body.perdiumamt;
   var perprocurr=req.body.perprocurr;
   var salarycurr=req.body.salarycurr;
   var perdiemamtcurr=req.body.perdiemamtcurr;
   var travelamtcurr=req.body.travelamtcurr;
   var otheramtcurr=req.body.otheramtcurr;
   var clientaddr1=req.body.clientaddr1;
   var clientaddr2=req.body.clientaddr2;
   var countryId=req.body.countryId;
   var cityId=req.body.cityId;
   var pincode=req.body.pincode;
   var clientclosuredate=req.body.clientclosuredate;
   var homecur=req.body.homecur;
   var projectid=0;
   var milcount=0;
   var salrate=req.body.salrate;
   var perrate=req.body.perrate;
   var travelrate=req.body.travelrate;
   var otherrate=req.body.otherrate;
   var salconamt=req.body.salconamt;
   var perconamt=req.body.perconamt;
   var traconamt=req.body.traconamt;
   var othconamt=req.body.othconamt;

if(clientclosuredate=="")
{
        clientclosuredate = null
}

	var datetime = new Date();
	console.log("projcdate",projcdate);	
	console.log("Projbud",Projbud);	
	console.log("targmar",targmar);	
	console.log("Totalbud",Totalbud);	
	console.log("salary",salary);	
	console.log("perdium",perdium);	
	console.log("travel",travel);	
	console.log("other",other);	
	console.log("module",module);	
	console.log("nousers",nousers);	
	console.log("nobranch",nobranch);	
	console.log("delmgr",delmgr);	
	console.log("proid",proid);	
	console.log("lchgtime",lchgtime);	
	console.log("clientclosuredate",clientclosuredate);	
	console.log("millength",millength);	
		var milname_arr = [];
                var caper_arr = [];
                var diramt_arr = [];
                var milDate_arr = [];

		  pdbconnect.query("select sow_upld,chld_cnt,chld_flg,chld_parent_prj from project_master_tbl where project_id=$1",[proid],function(err,result){
                var sow_upld=result.rows['0'].sow_upld;
                var chld_cnt=result.rows['0'].chld_cnt;
                var chld_flg=result.rows['0'].chld_flg;
                var chld_parent_prj=result.rows['0'].chld_parent_prj;


		pdbconnect.query("select rcre_user_id,rcre_time from project_master_tbl where project_id=$1",[proid],function(err,result){
                 var  rcreuserid=result.rows['0'].rcre_user_id;
                 var  rcretime=result.rows['0'].rcre_time;
		
		pdbconnect.query("insert into project_master_tbl_hist select * from project_master_tbl where project_id=$1 ",[proid],function(err,result){


                pdbconnect.query("delete from project_master_tbl where project_id=$1 ",[proid],function(err,result){

                pdbconnect.query("insert into milestone_proj_tbl_hist  select * from milestone_proj_tbl LOWER(project_id)=LOWER($1) and confirm_flg='N' and paid_flg='N' and status_flg='N'",[proid],function(err,result){
                pdbconnect.query("delete from  milestone_proj_tbl where LOWER(project_id)=LOWER($1) and confirm_flg='N' and paid_flg='N' ",[proid],function(err,result){

                pdbconnect.query("INSERT INTO project_master_tbl(project_id,cid,project_loc,payment_type,customer_class,team_size,project_mgr,delivery_mgr,project_type,project_curr,project_budget,target_margin,tot_budget,salary,salarycurr,perdium,perdiumcurr,travel,travelcurr,other_exp,other_expcurr,fl_modules_included,fl_num_users,fl_num_of_branches,start_date,end_date,rcre_user_id,rcre_time,lchg_user_id,lchg_time,del_flg,perdium_amount_per_day,perdium_curr_per_day,bill_addrline1,bill_addrline2,bill_country,bill_city,bill_pin_code,rate,po_number,remarks,closure_flg,closure_date,client_closure_date,salary_rate,perdiem_rate,travel_rate,other_rate,salary_converted_amt,travel_converted_amt,perdiem_converted_amt,other_converted_amt) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52)",[proid,cid,perloc,paymenttype,classid,projectsize,projectmgr,delmgr,projtype,projcur,Projbud,targmar,Totalbud,salary,salarycurr,perdium,perdiemamtcurr,travel,travelamtcurr,other,otheramtcurr,module,nousers,nobranch,projsdate,projcdate,rcreuserid,rcretime,lchguserid,lchgtime,'N',perdiumamt,perprocurr,clientaddr1,clientaddr2,countryId,cityId,pincode,rateamt,ponumber,rmks,closureflg,projclosuredate,clientclosuredate,salrate,perrate,travelrate,otherrate,salconamt,perconamt,traconamt,othconamt],function(err,done){
                if(err) throw err;


		});/* rcrce time selection */
            var j = null;
       	    var  rcreuserid=empId;
            var  rcretime=now;

                pdbconnect.query("update project_master_tbl set sow_upld=$2,chld_cnt=$3,chld_flg=$4,chld_parent_prj=$5 where project_id=$1",[proid,sow_upld,chld_cnt,chld_flg,chld_parent_prj],function(err,result){

		for(i=0;i<millength;i++)
                {
                j = (i - 0) + (1 - 0);  
                var milname=req.body["milname_" + i];
                var caper=req.body["caper_" + i];
                var diramt=req.body["diramt_" + i];
                var milDate=req.body["milDate_" + i];
                console.log("name",milname);
                console.log("caper",caper);
                console.log("diramt",diramt);
                console.log("milDate",milDate);
                console.log("j value",j);

                if(typeof milname === 'undefined')
                {
                    console.log("skip record");
                }/*if undefined */
                else
                {

                milname_arr.push(milname);
                caper_arr.push(caper);
                diramt_arr.push(diramt);
                milDate_arr.push(milDate);
                milcount = (milcount - 0) + (1 - 0);

                     pdbconnect.query("INSERT INTO milestone_proj_tbl(project_id,serial_number,milestone_name,capture_per,direct_amount,milestone_exp_date,del_flg,rcre_user_id,lchg_user_id,rcre_time,lchg_time,confirm_flg,paid_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)",[proid,j,milname,caper,diramt,milDate,'N',rcreuserid,lchguserid,rcretime,lchgtime,'N','N'],function(err,done){
                     if(err) throw err;

                                });
                }/* else */
            }/* for loop */

        pdbconnect.query("SELECT milestone_name,capture_per,direct_amount,milestone_exp_date from milestone_proj_tbl  where LOWER(project_id)=LOWER($1) and confirm_flg='Y'",[proid],function(err,resultset){
         milestonemark=resultset.rows;
         milestonemark_count=resultset.rowCount;

	 var message="Project Details Modified Successfully:  " + proid ;
	res.render('projectModule/projectmodificationView.ejs',{
        ename:req.user.rows['0'].user_name,
        eid:req.user.rows['0'].user_id,
	projectid:proid,
	cid:cid,
	perloc:perloc,
	paymenttype:paymenttype,
	classid:classid,
	projectsize:projectsize,
	projectmgr:projectmgr,
	delmgr:delmgr,
	projtype:projtype,
	projcur:projcur,
	Projbud:Projbud,
	targmar:targmar,
	Totalbud:Totalbud,
	salary:salary,
	salarycurr:salarycurr,
	perdium:perdium,
	perdiemamtcurr:perdiemamtcurr,
	travel:travel,
	travelamtcurr:travelamtcurr,
	other:other,
	otheramtcurr:otheramtcurr,
	module:module,
	nousers:nousers,
	nobranch:nobranch,
	projsdate:projsdate,
	projcdate:projcdate,
	perdiumamt:perdiumamt,
	perprocurr:perprocurr,
	clientaddr1:clientaddr1,
	clientaddr2:clientaddr2,
	countryId:countryId,
	cityId:cityId,
	pincode:pincode,
	rateamt:rateamt,
	ponumber:ponumber,
	rmks:rmks,
	message:message,
	milname_arr:milname_arr,
	caper_arr:caper_arr,
	milDate_arr:milDate_arr,
	diramt_arr:diramt_arr,
	milcount:milcount,
	milestonemark:milestonemark,
	milestonemark_count:milestonemark_count,
	clientclosuredate:clientclosuredate,
	projclosuredate:projclosuredate,
	closureflg:closureflg,
        salrate:salrate,
        perrate:perrate,
        travelrate:travelrate,
        otherrate:otherrate,
        salconamt:salconamt,
        perconamt:perconamt,
        traconamt:traconamt,
        othconamt:othconamt

	});
	});
                });
                });
                     });
                });
                });
                });
                });


};/*main func*/

router.post('/projectmodView',projectmodView);
function projectmodView(req, res)
{
var project_id="";
var cid="";
var project_loc="";
var payment_type="";
var customer_class="";
var team_size="";
var project_mgr="";
var delivery_mgr="";
var project_type="";
var project_curr="";
var project_budget="";
var target_margin="";
var tot_budget="";
var salary="";
var perdium="";
var other_exp="";
var tnm_po_value="";
var tnm_num_ppl="";
var fl_modules_included="";
var fl_num_users="";
var fl_num_of_branches="";
var fl_exp_date="";
var start_date="";
var closure_date="";
var milestone="";
var milestone_count="";
var comm_code_desc="";
var comm_code_desc_count="";
var comm_code_id="";
var comm_code_id_count="";
var customer_name="";
var customerall_id="";
var customerall_name="";
var customerall_count="";
var customer_id="";
var comm_paymentype="";
var comm_paymentype_count="";
var comm_paymentdesc="";
var comm_customerdesc="";
var comm_cusclass="";
var comm_cusclass_count="";
var proj_name="";
var proj_name_count="";
var empname="";
var empid_count="";
var employee="";
var delid="";
var delid_count="";
var delname="";
var delprojname="";
var delname_count="";
var comm_code_pty="";
var comm_code_pty_count="";
var comm_code_desc="";
var comm_code_pcr="";
var comm_code_pcr_count="";
var travel="";
var comm_code_tnu="";
var comm_code_tnu_count="";
var comm_code_desc_tnu="";
var closure_flg="";
var closure_date="";
var end_date="";
var rate="";
var po_number="";
var remarks="";
var bill_addrline1="";
var bill_addrline2="";
var bill_country="";
var bill_city="";
var bill_pin_code="";
var salarycurr="";
var perdiumcurr="";
var travelcurr="";
var other_expcurr="";
var perdium_amount_per_day="";
var perdium_curr_per_day="";
var milestonemark="";
var milestonemark_count="";
var ErrFlg="N";
var alloccount="";
var client_closure_date ="";
	var datetime = new Date();
	console.log("sysdate",datetime);

	pdbconnect.query("SELECT project_id from project_master_tbl where closure_flg='N'  order by project_id asc",function(err,result){
	if(err) throw err;
	projectid=result.rows;
	projectid_count=result.rowCount;
	console.log("projectid:::",projectid);
	console.log("projectid_count:::",projectid_count);



        pdbconnect.query("SELECT customer_id from customer_master_tbl order by customer_id asc",function(err,result){
        customer_id=result.rows;
        customer_count=result.rowCount;
        console.log("cid:::",customer_id);
        console.log("cid_count:::",customer_count);

        pdbconnect.query("SELECT customer_name from customer_master_tbl order by customer_id asc",function(err,result){
        customer_name=result.rows;
        customername_count=result.rowCount;
        console.log("cname:::",customer_name);
        console.log("cidname_count:::",customername_count);

        pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'CUS' order by comm_code_id asc",function(err,result){
        comm_code_id=result.rows;
        comm_code_id_count=result.rowCount;
        console.log("classid:::",comm_code_id);
        console.log("classid_count:::",comm_code_id_count);

        pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id = 'CUS'  order by comm_code_id asc",function(err,result){
        comm_code_desc=result.rows;
        comm_code_desc_count=result.rowCount;
        console.log("classdesc::",comm_code_desc);
        console.log("classdesc_count:::",comm_code_desc_count);

        var empId = req.user.rows['0'].user_id;
        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        emp_access=result.rows['0'].user_type;




res.render('projectModule/projectModification',{
employee:employee,
empid_count:empid_count,
empname:empname,
customer_id:customer_id,
customer_count:customer_count,
customer_name:customer_name,
comm_code_id:comm_code_id,
comm_code_id_count:comm_code_id_count,
comm_code_desc:comm_code_desc,
comm_code_pcr:comm_code_pcr,
comm_code_pcr_count:comm_code_pcr_count,
comm_code_pty:comm_code_pty,
comm_code_pty_count:comm_code_pty_count,
comm_code_tnu:comm_code_tnu,
comm_code_tnu_count:comm_code_tnu_count,
delname_count:delname_count,
delid:delid,
delid_count:delid_count,
 project_id:project_id,
 cid:cid,
 project_loc:project_loc,
 payment_type:payment_type,
 customer_class:customer_class,
 team_size:team_size,
 project_mgr:project_mgr,
 delivery_mgr:delivery_mgr,
 project_type:project_type,
 project_curr:project_curr,
 project_budget:project_budget,
 target_margin:target_margin,
 tot_budget:tot_budget,
 salary:salary,
 perdium:perdium,
 other_exp:other_exp,
 tnm_po_value:tnm_po_value,
 tnm_num_ppl:tnm_num_ppl,
 fl_modules_included:fl_modules_included,
 fl_num_users:fl_num_users,
 fl_num_of_branches:fl_num_of_branches,
 fl_exp_date:fl_exp_date,
 start_date:start_date,
 closure_date:closure_date,
 milestone:milestone,
 milestone_count:milestone_count,
 comm_code_desc:comm_code_desc,
 comm_code_desc_count:comm_code_desc_count,
 comm_code_id:comm_code_id,
 comm_code_id_count:comm_code_id_count,
 customer_name:customer_name,
customerall_id:customerall_id,
customerall_name:customerall_name,
customerall_count:customerall_count,
customer_id:customer_id,
comm_paymentype:comm_paymentype,
comm_paymentype_count:comm_paymentype_count,
comm_paymentdesc:comm_paymentdesc,
comm_customerdesc:comm_customerdesc,
comm_cusclass:comm_cusclass,
comm_cusclass_count:comm_cusclass_count,
proj_name:proj_name,
proj_name_count:proj_name_count,
empname:empname,
employee:employee,
empid_count:empid_count,
delid:delid,
delid_count:delid_count,
delname:delname,
delprojname:delprojname,
comm_code_pty:comm_code_pty,
comm_code_pty_count:comm_code_pty_count,
comm_code_desc:comm_code_desc,
comm_code_pcr:comm_code_pcr,
comm_code_pcr_count:comm_code_pcr_count,
travel:travel,
comm_code_tnu:comm_code_tnu,
comm_code_tnu_count:comm_code_tnu_count,
comm_code_desc_tnu:comm_code_desc_tnu,
closure_flg:closure_flg,
closure_date:closure_flg,
end_date:end_date,
emp_access:emp_access,
rate:rate,
po_number:po_number,
remarks:remarks,
bill_addrline1:bill_addrline1,
bill_addrline2:bill_addrline2,
bill_country:bill_country,
bill_city:bill_city,
bill_pin_code:bill_pin_code,
salarycurr:salarycurr,
perdiumcurr:perdiumcurr,
travelcurr:travelcurr,
other_expcurr:other_expcurr,
perdium_amount_per_day:perdium_amount_per_day,
perdium_curr_per_day:perdium_curr_per_day,
milestonemark:milestonemark,
milestonemark_count:milestonemark_count,
ErrFlg:ErrFlg,
alloccount:alloccount,
client_closure_date:client_closure_date 
});
});
});
});
});
});
});


}
/* Code for project Modify Ends */


/* Code for project Copy */
router.get('/projectCopy',function(req,res)
{

var project_id="";
var cid="";
var project_loc="";
var payment_type="";
var customer_class="";
var team_size="";
var project_mgr="";
var delivery_mgr="";
var project_type="";
var project_curr="";
var project_budget="";
var target_margin="";
var tot_budget="";
var salary="";
var perdium="";
var other_exp="";
var tnm_po_value="";
var tnm_num_ppl="";
var fl_modules_included="";
var fl_num_users="";
var fl_num_of_branches="";
var fl_exp_date="";
var start_date="";
var closure_date="";
var milestone="";
var milestone_count="";
var comm_code_desc="";
var comm_code_desc_count="";
var comm_code_id="";
var comm_code_id_count="";
var customer_name="";
var customerall_id="";
var customerall_name="";
var customerall_count="";
var customer_id="";
var comm_paymentype="";
var comm_paymentype_count="";
var comm_paymentdesc="";
var comm_customerdesc="";
var comm_cusclass="";
var comm_cusclass_count="";
var proj_name="";
var proj_name_count="";
var empname="";
var empid_count="";
var employee="";
var delid="";
var delid_count="";
var delname="";
var delprojname="";
var delname_count="";
var comm_code_pty="";
var comm_code_pty_count="";
var comm_code_desc="";
var comm_code_pcr="";
var comm_code_pcr_count="";
var travel="";
var comm_code_tnu="";
var comm_code_tnu_count="";
var comm_code_desc_tnu="";
var closure_flg="";
var closure_date="";
var end_date="";
var rate="";
var po_number="";
var remarks="";
var bill_addrline1="";
var bill_addrline2="";
var bill_country="";
var bill_pin_code="";
var bill_city="";
var salarycurr="";
var perdiumcurr="";
var travelcurr="";
var other_expcurr="";
var perdium_amount_per_day="";
var perdium_curr_per_day="";
var  salary_rate="";
var  perdiem_rate="";
var  travel_rate="";
var  other_rate="";
var  salary_converted_amt="";
var  travel_converted_amt="";
var  perdiem_converted_amt="";
var  other_converted_amt="";

	var datetime = new Date();
	console.log("sysdate",datetime);

	pdbconnect.query("SELECT project_id from project_master_tbl where closure_flg='N' and chld_flg='N' order by project_id asc",function(err,result){
	if(err) throw err;
	projectid=result.rows;
	projectid_count=result.rowCount;
	console.log("projectid:::",projectid);
	console.log("projectid_count:::",projectid_count);



        pdbconnect.query("SELECT customer_id from customer_master_tbl order by customer_id asc",function(err,result){
        customer_id=result.rows;
        customer_count=result.rowCount;
        console.log("cid:::",customer_id);
        console.log("cid_count:::",customer_count);

        pdbconnect.query("SELECT customer_name from customer_master_tbl order by customer_id asc",function(err,result){
        customer_name=result.rows;
        customername_count=result.rowCount;
        console.log("cname:::",customer_name);
        console.log("cidname_count:::",customername_count);

        pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'CUS' order by comm_code_id asc",function(err,result){
        comm_code_id=result.rows;
        comm_code_id_count=result.rowCount;
        console.log("classid:::",comm_code_id);
        console.log("classid_count:::",comm_code_id_count);

        pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id = 'CUS'  order by comm_code_id asc",function(err,result){
        comm_code_desc=result.rows;
        comm_code_desc_count=result.rowCount;
        console.log("classdesc::",comm_code_desc);
        console.log("classdesc_count:::",comm_code_desc_count);

        var empId = req.user.rows['0'].user_id;
        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        emp_access=result.rows['0'].user_type;

	 if(emp_access != "L1" && emp_access != "L2")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {



res.render('projectModule/projectCopy',{
employee:employee,
empid_count:empid_count,
empname:empname,
ename:req.user.rows['0'].user_name,
eid:req.user.rows['0'].user_id,
customer_id:customer_id,
customer_count:customer_count,
customer_name:customer_name,
comm_code_id:comm_code_id,
comm_code_id_count:comm_code_id_count,
comm_code_desc:comm_code_desc,
comm_code_pcr:comm_code_pcr,
comm_code_pcr_count:comm_code_pcr_count,
comm_code_pty:comm_code_pty,
comm_code_pty_count:comm_code_pty_count,
comm_code_tnu:comm_code_tnu,
comm_code_tnu_count:comm_code_tnu_count,
delname_count:delname_count,
delid:delid,
delid_count:delid_count,
 project_id:project_id,
 cid:cid,
 project_loc:project_loc,
 payment_type:payment_type,
 customer_class:customer_class,
 team_size:team_size,
 project_mgr:project_mgr,
 delivery_mgr:delivery_mgr,
 project_type:project_type,
 project_curr:project_curr,
 project_budget:project_budget,
 target_margin:target_margin,
 tot_budget:tot_budget,
 salary:salary,
 perdium:perdium,
 other_exp:other_exp,
 tnm_po_value:tnm_po_value,
 tnm_num_ppl:tnm_num_ppl,
 fl_modules_included:fl_modules_included,
 fl_num_users:fl_num_users,
 fl_num_of_branches:fl_num_of_branches,
 fl_exp_date:fl_exp_date,
 start_date:start_date,
 closure_date:closure_date,
 milestone:milestone,
 milestone_count:milestone_count,
 comm_code_desc:comm_code_desc,
 comm_code_desc_count:comm_code_desc_count,
 comm_code_id:comm_code_id,
 comm_code_id_count:comm_code_id_count,
 customer_name:customer_name,
customerall_id:customerall_id,
customerall_name:customerall_name,
customerall_count:customerall_count,
customer_id:customer_id,
comm_paymentype:comm_paymentype,
comm_paymentype_count:comm_paymentype_count,
comm_paymentdesc:comm_paymentdesc,
comm_customerdesc:comm_customerdesc,
comm_cusclass:comm_cusclass,
comm_cusclass_count:comm_cusclass_count,
proj_name:proj_name,
proj_name_count:proj_name_count,
empname:empname,
employee:employee,
empid_count:empid_count,
delid:delid,
delid_count:delid_count,
delname:delname,
delprojname:delprojname,
comm_code_pty:comm_code_pty,
comm_code_pty_count:comm_code_pty_count,
comm_code_desc:comm_code_desc,
comm_code_pcr:comm_code_pcr,
comm_code_pcr_count:comm_code_pcr_count,
travel:travel,
comm_code_tnu:comm_code_tnu,
comm_code_tnu_count:comm_code_tnu_count,
comm_code_desc_tnu:comm_code_desc_tnu,
closure_flg:closure_flg,
closure_date:closure_flg,
end_date:end_date,
emp_access:emp_access,
rate:rate,
po_number:po_number,
remarks:remarks,
bill_addrline1:bill_addrline1,
bill_addrline2:bill_addrline2,
bill_country:bill_country,
bill_city:bill_city,
bill_pin_code:bill_pin_code,
salarycurr:salarycurr,
perdiumcurr:perdiumcurr,
travelcurr:travelcurr,
other_expcurr:other_expcurr,
perdium_amount_per_day:perdium_amount_per_day,
perdium_curr_per_day:perdium_curr_per_day,
 salary_rate:salary_rate,
 perdiem_rate:perdiem_rate,
 travel_rate:travel_rate,
 other_rate:other_rate,
 salary_converted_amt:salary_converted_amt,
 travel_converted_amt:travel_converted_amt,
 perdiem_converted_amt:perdiem_converted_amt,
 other_converted_amt:other_converted_amt


});
}
});
});
});
});
});
});
});

router.post('/CopyProjDetails',CopyProjDetails);

function CopyProjDetails(req , res)
{
console.log("inside 1");
var projectid=req.body.projectid;
console.log("project_id",projectid);


pdbconnect.query("SELECT project_id,cid,project_loc,payment_type,customer_class,team_size,project_mgr,delivery_mgr,project_type,project_curr,project_budget,closure_flg,closure_date,rate,po_number,remarks,bill_addrline1,bill_addrline2,bill_country,bill_city,bill_pin_code,target_margin,tot_budget,salary,salarycurr,perdium,perdiumcurr,travel,travelcurr,other_exp,other_expcurr,fl_modules_included,fl_num_users,fl_num_of_branches,start_date,end_date,perdium_amount_per_day,perdium_curr_per_day,salary_rate,perdiem_rate,travel_rate,other_rate,salary_converted_amt,travel_converted_amt,perdiem_converted_amt,other_converted_amt from project_master_tbl where LOWER(project_id)=LOWER($1)",[projectid],function(err,resultset){
if (err) throw err;
var project_id=resultset.rows['0'].project_id;
var cid=resultset.rows['0'].cid;
var bill_pin_code=resultset.rows['0'].bill_pin_code;
var project_loc=resultset.rows['0'].project_loc;
var payment_type=resultset.rows['0'].payment_type;
var customer_class=resultset.rows['0'].customer_class;
var team_size=resultset.rows['0'].team_size;
var project_mgr=resultset.rows['0'].project_mgr;
var delivery_mgr=resultset.rows['0'].delivery_mgr;
var project_type=resultset.rows['0'].project_type;
var project_curr=resultset.rows['0'].project_curr;
var project_budget=resultset.rows['0'].project_budget;
var target_margin=resultset.rows['0'].target_margin;
var tot_budget=resultset.rows['0'].tot_budget;
var salary=resultset.rows['0'].salary;
var perdium=resultset.rows['0'].perdium;
var travel=resultset.rows['0'].travel;
var other_exp=resultset.rows['0'].other_exp;
var tnm_po_value=resultset.rows['0'].tnm_po_value;
var tnm_num_ppl=resultset.rows['0'].tnm_num_ppl;
var fl_modules_included=resultset.rows['0'].fl_modules_included;
var fl_num_users=resultset.rows['0'].fl_num_users;
var fl_num_of_branches=resultset.rows['0'].fl_num_of_branches;
var start_date=resultset.rows['0'].start_date;
var end_date=resultset.rows['0'].end_date;
var closure_flg=resultset.rows['0'].closure_flg;
var closure_date=resultset.rows['0'].closure_date;
var rate=resultset.rows['0'].rate;
var po_number=resultset.rows['0'].po_number;
var remarks=resultset.rows['0'].remarks;
var bill_addrline1=resultset.rows['0'].bill_addrline1;
var bill_addrline2=resultset.rows['0'].bill_addrline2;
var bill_country=resultset.rows['0'].bill_country;
var bill_city=resultset.rows['0'].bill_city;
var salarycurr=resultset.rows['0'].salarycurr;
var perdiumcurr=resultset.rows['0'].perdiumcurr;
var travelcurr=resultset.rows['0'].travelcurr;
var other_expcurr=resultset.rows['0'].other_expcurr;
var perdium_amount_per_day=resultset.rows['0'].perdium_amount_per_day;
var perdium_curr_per_day=resultset.rows['0'].perdium_curr_per_day;
var salary_rate=resultset.rows['0'].salary_rate;
var perdiem_rate=resultset.rows['0'].perdiem_rate;
var travel_rate=resultset.rows['0'].travel_rate;
var other_rate=resultset.rows['0'].other_rate;
var salary_converted_amt=resultset.rows['0'].salary_converted_amt;
var travel_converted_amt=resultset.rows['0'].travel_converted_amt;
var perdiem_converted_amt=resultset.rows['0'].perdiem_converted_amt;
var other_converted_amt=resultset.rows['0'].other_converted_amt;
var comm_code_desc_tnu="";
console.log("project_id",project_id);
console.log("cid_id",cid);
console.log("delivery_mgr",delivery_mgr);
console.log("project_type",project_type);
console.log("tot_budget",tot_budget);
console.log("salary",salary);
console.log("team_size",team_size);
console.log("vartenure",tenure);
console.log("varother_expcurr",other_expcurr);
if(tenure=="")
{
 var	tenure=null;
}
var start_date1=dateFormat(start_date, "yyyy-mm-dd");
var end_date1=dateFormat(end_date, "yyyy-mm-dd");
console.log("tenure1",tenure);
pdbconnect.query("SELECT milestone_name,capture_per,direct_amount,milestone_exp_date from milestone_proj_tbl  where LOWER(project_id)=LOWER($1)",[projectid],function(err,resultset){
 milestone=resultset.rows;
 milestone_count=resultset.rowCount;

console.log("milestone",milestone);
console.log("milstone_count",milestone_count);


        pdbconnect.query("SELECT customer_id from customer_master_tbl order by customer_id asc",function(err,result){
        customerall_id=result.rows;
        customerall_count=result.rowCount;

        pdbconnect.query("SELECT customer_name from customer_master_tbl order by customer_id asc",function(err,result){
        customerall_name=result.rows;
        customernameall_count=result.rowCount;


	 pdbconnect.query("SELECT customer_name from customer_master_tbl where customer_id=$1",[cid],function(err,resultset){
	customer_name=resultset.rows['0'].customer_name;
	customer_name_count=result.rowCount;
	console.log("customername:::",customer_name);

	 pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='PAT' and comm_code_id=$1",[payment_type],function(err,resultset){
	comm_paymentdesc=resultset.rows['0'].comm_code_desc;
	console.log("paymenttype:::",comm_paymentdesc);

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PAT' order by comm_code_id asc",function(err,result){
        comm_paymentype=result.rows;
        comm_paymentype_count=result.rowCount;
        console.log("classpayment:::",comm_paymentype);
        console.log("classpayment_count:::",comm_paymentype_count);

	 pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='CUS' and comm_code_id=$1",[customer_class],function(err,resultset){
	comm_customerdesc=resultset.rows['0'].comm_code_desc;
	console.log("customerdesc:::",comm_customerdesc);

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'CUS' order by comm_code_id asc",function(err,result){
        comm_cusclass=result.rows;
        comm_cusclass_count=result.rowCount;
        console.log("classpayment:::",comm_cusclass);
        console.log("classpayment_count:::",comm_cusclass_count);

        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id = $1 ",[project_mgr],function(err,result){
        proj_name=result.rows['0'].emp_name;
        proj_name_count=result.rowCount;
        console.log("project name:::",proj_name);

	pdbconnect.query("SELECT emp_id from emp_master_tbl order by emp_id asc",function(err,result){
	employee=result.rows;
	empid_count=result.rowCount;
	console.log("empid:::",employee);
	console.log("empid_count:::",empid_count);

	pdbconnect.query("SELECT emp_name from emp_master_tbl order by emp_id asc",function(err,result){
	empname=result.rows;
	empname_count=result.rowCount;
	console.log("empname:::",empname);
	console.log("empname_count:::",empname_count);

	pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_access='L1' order by emp_id asc",function(err,result){
	delname=result.rows;
	delname_count=result.rowCount;
	console.log("delname:::",delname);
	console.log("delname_count:::",delname_count);

	pdbconnect.query("SELECT emp_id from emp_master_tbl where emp_access='L1' order by emp_id asc",function(err,result){
	delid=result.rows;
	delid_count=result.rowCount;
	console.log("delid:::",delid);
	console.log("delid_count:::",delid_count);

	pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id=$1 ",[delivery_mgr],function(err,result){
	delprojname=result.rows['0'].emp_name;
	console.log("delname:::",delprojname);

      	pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PTY'  order by comm_code_id asc",function(err,result){
        comm_code_pty=result.rows;
        comm_code_pty_count=result.rowCount;
        console.log("classdesc::",comm_code_pty);
        console.log("classdesc_count:::",comm_code_pty_count);

      	pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id = 'PTY'  and comm_code_id=$1",[project_type],function(err,result){
        comm_code_desc=result.rows['0'].comm_code_desc;
        console.log("classdesc::",comm_code_desc);

	pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'PCR'  order by comm_code_id asc",function(err,result){
        comm_code_pcr=result.rows;
        comm_code_pcr_count=result.rowCount;
        console.log("classdesc::",comm_code_pcr);
        console.log("classdesc_count:::",comm_code_pcr_count);

	pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TNU'  order by comm_code_id asc",function(err,result){
        comm_code_tnu=result.rows;
        comm_code_tnu_count=result.rowCount;
        console.log("classdesc::",comm_code_tnu);
        console.log("classdesc_count:::",comm_code_tnu_count);

        var empId = req.user.rows['0'].user_id;
        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        emp_access=result.rows['0'].user_type;

console.log("milestone after",milestone);
console.log("milstone_count after",milestone_count);
console.log("remmarks",remarks);

res.render('projectModule/projectCopy',{

 project_id:project_id,
 cid:cid,
ename:req.user.rows['0'].user_name,
eid:req.user.rows['0'].user_id,
 project_loc:project_loc,
 payment_type:payment_type,
 customer_class:customer_class,
 team_size:team_size,
 project_mgr:project_mgr,
 delivery_mgr:delivery_mgr,
 project_type:project_type,
 project_curr:project_curr,
 project_budget:project_budget,
 target_margin:target_margin,
 tot_budget:tot_budget,
 salary:salary,
 perdium:perdium,
 travel:travel,
 other_exp:other_exp,
 tnm_po_value:tnm_po_value,
 tnm_num_ppl:tnm_num_ppl,
 fl_modules_included:fl_modules_included,
 fl_num_users:fl_num_users,
 fl_num_of_branches:fl_num_of_branches,
 start_date:start_date1,
 end_date:end_date1,
milestone:milestone,
milestone_count:milestone_count,
customer_name:customer_name,
customerall_id:customerall_id,
customerall_name:customerall_name,
customerall_count:customerall_count,
comm_paymentype:comm_paymentype,
comm_paymentype_count:comm_paymentype_count,
comm_paymentdesc:comm_paymentdesc,
comm_customerdesc:comm_customerdesc,
comm_cusclass:comm_cusclass,
comm_cusclass_count:comm_cusclass_count,
proj_name:proj_name,
employee:employee,
empname:empname,
empid_count:empid_count,
delname:delname,
delid:delid,
delid_count:delid_count,
delprojname:delprojname,
comm_code_pty:comm_code_pty,
comm_code_pty_count:comm_code_pty_count,
comm_code_desc:comm_code_desc,
comm_code_pcr:comm_code_pcr,
comm_code_pcr_count:comm_code_pcr_count,
comm_code_tnu:comm_code_tnu,
comm_code_tnu_count:comm_code_tnu_count,
comm_code_desc_tnu:comm_code_desc_tnu,
closure_flg:closure_flg,
closure_date:closure_date,
emp_access:emp_access,
rate:rate,
po_number:po_number,
remarks:remarks,
bill_addrline1:bill_addrline1,
bill_addrline2:bill_addrline2,
bill_country:bill_country,
bill_city:bill_city,
bill_pin_code:bill_pin_code,
salarycurr:salarycurr,
perdiumcurr:perdiumcurr,
travelcurr:travelcurr,
other_expcurr:other_expcurr,
perdium_amount_per_day:perdium_amount_per_day,
perdium_curr_per_day:perdium_curr_per_day,
 salary_rate:salary_rate,
 perdiem_rate:perdiem_rate,
 travel_rate:travel_rate,
 other_rate:other_rate,
 salary_converted_amt:salary_converted_amt,
 travel_converted_amt:travel_converted_amt,
 perdiem_converted_amt:perdiem_converted_amt,
 other_converted_amt:other_converted_amt


});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});
};

router.post('/Copyproject',projectcopy);

function projectcopy(req , res)
{
        var empId = req.user.rows['0'].user_id;
        var eid = req.user.rows['0'].user_id;

	console.log("111");	
   var now = new Date();
   var rcreuserid=empId;
   var rcretime=now;
   var lchguserid=empId;
   var lchgtime=now;
   var cid=req.body.cid; 
   var paymenttype=req.body.paymenttype; 
   var classid=req.body.classid;
   var projectsize=req.body.projectsize; 
   var projectmgr=req.body.projmgr; 
   var projtype=req.body.projtype;
   var projcur=req.body.projcur;
   var projsdate=req.body.projsdate;
   var projcdate=req.body.projcdate;
   var Projbud=req.body.Projbud;
   var targmar=req.body.targmar;
   var Totalbud=req.body.Totalbud;
   var salary=req.body.salary;
   var perdium=req.body.perdium;
   var travel=req.body.travel;
   var other=req.body.other;
   var module=req.body.module;
   var nousers=req.body.nousers;
   var nobranch=req.body.nobranch;
   var fpexpdate=req.body.fpexpdate;
   var millength=req.body.millength;
   var delmgr=req.body.delmgr;
if(fpexpdate == "")
{
	fpexpdate=null;
}
   var tenure=req.body.tenure;
   var projexpdate=req.body.projexpdate;
 if(projexpdate == "")
{
	projexpdate=null;
}  
   var subper=req.body.subper;
   var subamt=req.body.subamt;
   var povalue=req.body.povalue;
   var Noofppl=req.body.Noofppl;
   var perloc=req.body.perloc;
   var perdiumamt=req.body.perdiumamt;
   var percur=req.body.percur;
   var rateamt=req.body.rateamt;
   var ponumber=req.body.ponumber;
   var rmks=req.body.rmks;
   var clientaddr1=req.body.clientaddr1;
   var clientaddr2=req.body.clientaddr2;
   var countryId=req.body.countryId;
   var cityId=req.body.cityId;
   var pincode=req.body.pincode;
   var perloc=req.body.perloc;
   var perdiumamt=req.body.perdiumamt;
   var perprocurr=req.body.perprocurr;
   var salarycurr=req.body.salarycurr;
   var perdiemamtcurr=req.body.perdiemamtcurr;
   var travelamtcurr=req.body.travelamtcurr;
   var otheramtcurr=req.body.otheramtcurr;
   var clientaddr1=req.body.clientaddr1;
   var clientaddr2=req.body.clientaddr2;
   var countryId=req.body.countryId;
   var cityId=req.body.cityId;
   var pincode=req.body.pincode;
   var projectid=0;
   var milcount=0;
   var salrate=req.body.salrate;
   var perrate=req.body.perrate;
   var travelrate=req.body.travelrate;
   var otherrate=req.body.otherrate;
   var salconamt=req.body.salconamt;
   var perconamt=req.body.perconamt;
   var traconamt=req.body.traconamt;
   var othconamt=req.body.othconamt;
   var projectid=0;
   var milcount=0;

	var datetime = new Date();
	console.log("sysdate",datetime);
	console.log("111");	

	console.log("userid",rcreuserid);	
	console.log("millength",millength);	
	console.log("rtime",rcretime);	
	console.log("luserid",lchguserid);	
	console.log("ltime",lchgtime);	
	console.log("cid",cid);	
	console.log("paymenttype",paymenttype);	
	console.log("classid",classid);	
	console.log("projectsize",projectsize);	
	console.log("projectmgr",projectmgr);	
	console.log("projtype",projtype);	
	console.log("projcur",projcur);	
	console.log("projsdate",projsdate);	
	console.log("projcdate",projcdate);	
	console.log("Projbud",Projbud);	
	console.log("targmar",targmar);	
	console.log("Totalbud",Totalbud);	
	console.log("salary",salary);	
	console.log("perdium",perdium);	
	console.log("travel",travel);	
	console.log("other",other);	
	console.log("module",module);	
	console.log("nousers",nousers);	
	console.log("nobranch",nobranch);	
	console.log("delmgr",delmgr);	
	console.log("perloc",perloc);	
	console.log("perdiumamt",perdiumamt);	
	console.log("perprocurr",perprocurr);	

	pdbconnect.query("SELECT count(*) as cnt from project_master_tbl where LOWER(cid)= LOWER($1) ",[cid],function(err,result){
         if(err) throw err;
	var proj_count = result.rows[0].cnt;
        console.log("rcount",proj_count);

if(proj_count == 0) 
{
	proj_count = 1;
}
else
{
	proj_count = (proj_count - 0) + (1 - 0);
}

	console.log("classcount count",proj_count);

	projectid = classid +"-"+ cid +"-" +projtype +"-"+ proj_count;
	console.log("project id",projectid);


        pdbconnect.query("SELECT  * from project_master_tbl  where LOWER(project_id) = LOWER($1)",
                      [projectid],function(err,resultset){
                if(err) throw err;
var rcount = resultset.rowCount;
console.log("rcount",rcount);
if(rcount == 0)
{
                var milname_arr = [];
                var caper_arr = [];
                var diramt_arr = [];
                var milDate_arr = [];

                 pdbconnect.query("INSERT INTO project_master_tbl(project_id,cid,project_loc,payment_type,customer_class,team_size,project_mgr,delivery_mgr,project_type,project_curr,project_budget,target_margin,tot_budget,salary,salarycurr,perdium,perdiumcurr,travel,travelcurr,other_exp,other_expcurr,fl_modules_included,fl_num_users,fl_num_of_branches,start_date,end_date,rcre_user_id,rcre_time,lchg_user_id,lchg_time,del_flg,perdium_amount_per_day,perdium_curr_per_day,bill_addrline1,bill_addrline2,bill_country,bill_city,bill_pin_code,po_number,remarks,closure_flg,sow_upld,chld_cnt,chld_flg,salary_rate,perdiem_rate,travel_rate,other_rate,salary_converted_amt,travel_converted_amt,perdiem_converted_amt,other_converted_amt) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52)",[projectid,cid,perloc,paymenttype,classid,projectsize,projectmgr,delmgr,projtype,projcur,Projbud,targmar,Totalbud,salary,salarycurr,perdium,perdiemamtcurr,travel,travelamtcurr,other,otheramtcurr,module,nousers,nobranch,projsdate,projcdate,rcreuserid,rcretime,lchguserid,lchgtime,'N',perdiumamt,perprocurr,clientaddr1,clientaddr2,countryId,cityId,pincode,ponumber,rmks,'N','N','0','N',salrate,perrate,travelrate,otherrate,salconamt,perconamt,traconamt,othconamt],function(err,done){

                if(err) throw err;
	//var millength1 = (millength - 0) - (1 - 0);	
	for(i=0;i<millength;i++)
	{
		var milname=req.body["milname_" + i];
		var caper=req.body["caper_" + i];
		var diramt=req.body["diramt_" + i];
		var milDate=req.body["milDate_" + i];
		console.log("name",milname);
		console.log("caper",caper);
		console.log("diramt",diramt);
		console.log("milDate",milDate);


                        if(typeof milname === 'undefined')
{


}
else
{
                milname_arr.push(milname);
                caper_arr.push(caper);
                diramt_arr.push(diramt);
                milDate_arr.push(milDate);
                milcount = (milcount - 0) + (1 - 0);

                 pdbconnect.query("INSERT INTO milestone_proj_tbl(project_id,serial_number,milestone_name,capture_per,direct_amount,milestone_exp_date,del_flg,rcre_user_id,lchg_user_id,rcre_time,lchg_time,confirm_flg,paid_flg,status_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)",[projectid,i,milname,caper,diramt,milDate,'N',rcreuserid,lchguserid,rcretime,lchgtime,'N','N','N'],function(err,done){
                if(err) throw err;
});
	}

}


        pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[projectmgr],function(err,result){
        projmgrname=result.rows['0'].emp_name;
        console.log("project manager name:::",projmgrname);

        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id=$1 ",[rcreuserid],function(err,result){
        createdgrname=result.rows['0'].emp_name;
        console.log("created user name:::",createdgrname);

        pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='MAIL' and comm_code_id='PROJ' ",function(err,result){
        maillist=result.rows['0'].comm_code_desc;
        console.log("mail list:::",maillist);

	pdbconnect.query("select project_mgr,delivery_mgr from project_master_tbl where project_id=$1",[projectid],function(err,result){
	projectmgr  = result.rows['0'].project_mgr;
	deliverymgr = result.rows['0'].delivery_mgr;
	console.log("projectmgr!!!",projectmgr);
	console.log("deliverymgr!!",deliverymgr); 	


	pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[deliverymgr],function(err,result){
        delname=result.rows['0'].emp_name;
        console.log("delname:::",delname);

	
	pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id =$1",[projectmgr],function(err,result){
	projectmgremail  = result.rows['0'].emp_email;
	console.log("projectmgremail--",projectmgremail);
	
	pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id =$1",[deliverymgr],function(err,result){
	deliverymgremail = result.rows['0'].emp_email;
	console.log("deliverymgremail--",deliverymgremail);
 
	pdbconnect.query("SELECT reporting_mgr from emp_master_tbl where emp_id=$1",[delmgr],function(err,result){
	delrpt=result.rows['0'].reporting_mgr;
	console.log("delivery manager's manager");
	
	pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id=$1",[delrpt],function(err,result){
	delrptmail=result.rows['0'].emp_email;
	console.log("delivery manager's manager email");

	 pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='FIN'",function(err,result){
	 finemail = result.rows['0'].comm_code_desc;
	 console.log("finance mail",finemail);	

	var mailids = projectmgremail +","+ deliverymgremail ;
	console.log("mailids",mailids); 		

	var cclist = finemail +","+ delrptmail;
	console.log("cclist",cclist); 


            var smtpTransport = nodemailer.createTransport('SMTP',{
               service: 'gmail',
               auth:
            {
                user: 'amber@nurture.co.in',
                pass: 'nurture@123'
            }
            });


    var mailOptions = {
                to: mailids,
		cc: cclist,
                from: 'amber@nurture.co.in',
                subject: 'Project Creation Notification ',
                text: 'Dear Team,\n\n' + 
		'Project Creation Details.\n\n' + 
		'Project ID:  ' + projectid + '\n' +  
		'Delivery manager:  ' + deliverymgr + '-' + delname + '\n' +
		'Project manager:   ' + projectmgr + '-' + projmgrname + '\n' +  
                'Project was created by ' + rcreuserid + '-' + createdgrname + '.\n\n\n\n' +
		'- Regards,\nAmber' 
               };

               smtpTransport.sendMail(mailOptions, function(err) {
               });

});
});
});
});
});
});
});
});
});
});



	var message="Project Details Added Successfully:  " + projectid ;
	res.render('projectModule/projectcreationcopyView',{
	projectid:projectid,
	cid:cid,
	perloc:perloc,
	ename:req.user.rows['0'].user_name,
	eid:req.user.rows['0'].user_id,
	paymenttype:paymenttype,
	classid:classid,
	projectsize:projectsize,
	projectmgr:projectmgr,
	delmgr:delmgr,
	projtype:projtype,
	projcur:projcur,
	Projbud:Projbud,
	targmar:targmar,
	Totalbud:Totalbud,
	salary:salary,
	salarycurr:salarycurr,
	perdium:perdium,
	perdiemamtcurr:perdiemamtcurr,
	travel:travel,
	travelamtcurr:travelamtcurr,
	other:other,
	otheramtcurr:otheramtcurr,
	module:module,
	nousers:nousers,
	nobranch:nobranch,
	projsdate:projsdate,
	projcdate:projcdate,
	perdiumamt:perdiumamt,
	perprocurr:perprocurr,
	clientaddr1:clientaddr1,
	clientaddr2:clientaddr2,
	countryId:countryId,
	cityId:cityId,
	pincode:pincode,
	rateamt:rateamt,
	ponumber:ponumber,
	rmks:rmks,
	message:message,
	milname_arr:milname_arr,
	caper_arr:caper_arr,
	milDate_arr:milDate_arr,
	diramt_arr:diramt_arr,
	milcount:milcount,
        salrate:salrate,
        perrate:perrate,
        travelrate:travelrate,
        otherrate:otherrate,
        salconamt:salconamt,
        perconamt:perconamt,
        traconamt:traconamt,
        othconamt:othconamt

	});

});
}
else
{
          req.flash('error',"Project Details Already Added")
          res.redirect('/projectModule/projectDetails/projectCopy');
}
	
});
});


};
/* Code for redirecting projection creation page from project view */
router.post('/projectcrecopyView',projectcrecopyView);
function projectcrecopyView(req, res)
{
var project_id="";
var cid="";
var project_loc="";
var payment_type="";
var customer_class="";
var team_size="";
var project_mgr="";
var delivery_mgr="";
var project_type="";
var project_curr="";
var project_budget="";
var target_margin="";
var tot_budget="";
var salary="";
var perdium="";
var other_exp="";
var tnm_po_value="";
var tnm_num_ppl="";
var fl_modules_included="";
var fl_num_users="";
var fl_num_of_branches="";
var fl_exp_date="";
var start_date="";
var closure_date="";
var milestone="";
var milestone_count="";
var comm_code_desc="";
var comm_code_desc_count="";
var comm_code_id="";
var comm_code_id_count="";
var customer_name="";
var customerall_id="";
var customerall_name="";
var customerall_count="";
var customer_id="";
var comm_paymentype="";
var comm_paymentype_count="";
var comm_paymentdesc="";
var comm_customerdesc="";
var comm_cusclass="";
var comm_cusclass_count="";
var proj_name="";
var proj_name_count="";
var empname="";
var empid_count="";
var employee="";
var delid="";
var delid_count="";
var delname="";
var delprojname="";
var delname_count="";
var comm_code_pty="";
var comm_code_pty_count="";
var comm_code_desc="";
var comm_code_pcr="";
var comm_code_pcr_count="";
var travel="";
var comm_code_tnu="";
var comm_code_tnu_count="";
var comm_code_desc_tnu="";
var closure_flg="";
var closure_date="";
var end_date="";
var rate="";
var po_number="";
var remarks="";
var bill_addrline1="";
var bill_addrline2="";
var bill_country="";
var bill_city="";
var salarycurr="";
var perdiumcurr="";
var travelcurr="";
var other_expcurr="";
var perdium_amount_per_day="";
var perdium_curr_per_day="";
	var datetime = new Date();
	console.log("sysdate",datetime);

	pdbconnect.query("SELECT project_id from project_master_tbl where closure_flg='N'  order by project_id asc",function(err,result){
	if(err) throw err;
	projectid=result.rows;
	projectid_count=result.rowCount;
	console.log("projectid:::",projectid);
	console.log("projectid_count:::",projectid_count);



        pdbconnect.query("SELECT customer_id from customer_master_tbl order by customer_id asc",function(err,result){
        customer_id=result.rows;
        customer_count=result.rowCount;
        console.log("cid:::",customer_id);
        console.log("cid_count:::",customer_count);

        pdbconnect.query("SELECT customer_name from customer_master_tbl order by customer_id asc",function(err,result){
        customer_name=result.rows;
        customername_count=result.rowCount;
        console.log("cname:::",customer_name);
        console.log("cidname_count:::",customername_count);

        pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'CUS' order by comm_code_id asc",function(err,result){
        comm_code_id=result.rows;
        comm_code_id_count=result.rowCount;
        console.log("classid:::",comm_code_id);
        console.log("classid_count:::",comm_code_id_count);

        pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id = 'CUS'  order by comm_code_id asc",function(err,result){
        comm_code_desc=result.rows;
        comm_code_desc_count=result.rowCount;
        console.log("classdesc::",comm_code_desc);
        console.log("classdesc_count:::",comm_code_desc_count);

        var empId = req.user.rows['0'].user_id;
        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        emp_access=result.rows['0'].user_type;




res.render('projectModule/projectCopy',{
employee:employee,
empid_count:empid_count,
ename:req.user.rows['0'].user_name,
eid:req.user.rows['0'].user_id,
empname:empname,
customer_id:customer_id,
customer_count:customer_count,
customer_name:customer_name,
comm_code_id:comm_code_id,
comm_code_id_count:comm_code_id_count,
comm_code_desc:comm_code_desc,
comm_code_pcr:comm_code_pcr,
comm_code_pcr_count:comm_code_pcr_count,
comm_code_pty:comm_code_pty,
comm_code_pty_count:comm_code_pty_count,
comm_code_tnu:comm_code_tnu,
comm_code_tnu_count:comm_code_tnu_count,
delname_count:delname_count,
delid:delid,
delid_count:delid_count,
 project_id:project_id,
 cid:cid,
 project_loc:project_loc,
 payment_type:payment_type,
 customer_class:customer_class,
 team_size:team_size,
 project_mgr:project_mgr,
 delivery_mgr:delivery_mgr,
 project_type:project_type,
 project_curr:project_curr,
 project_budget:project_budget,
 target_margin:target_margin,
 tot_budget:tot_budget,
 salary:salary,
 perdium:perdium,
 other_exp:other_exp,
 tnm_po_value:tnm_po_value,
 tnm_num_ppl:tnm_num_ppl,
 fl_modules_included:fl_modules_included,
 fl_num_users:fl_num_users,
 fl_num_of_branches:fl_num_of_branches,
 fl_exp_date:fl_exp_date,
 start_date:start_date,
 closure_date:closure_date,
 milestone:milestone,
 milestone_count:milestone_count,
 comm_code_desc:comm_code_desc,
 comm_code_desc_count:comm_code_desc_count,
 comm_code_id:comm_code_id,
 comm_code_id_count:comm_code_id_count,
 customer_name:customer_name,
customerall_id:customerall_id,
customerall_name:customerall_name,
customerall_count:customerall_count,
customer_id:customer_id,
comm_paymentype:comm_paymentype,
comm_paymentype_count:comm_paymentype_count,
comm_paymentdesc:comm_paymentdesc,
comm_customerdesc:comm_customerdesc,
comm_cusclass:comm_cusclass,
comm_cusclass_count:comm_cusclass_count,
proj_name:proj_name,
proj_name_count:proj_name_count,
empname:empname,
employee:employee,
empid_count:empid_count,
delid:delid,
delid_count:delid_count,
delname:delname,
delprojname:delprojname,
comm_code_pty:comm_code_pty,
comm_code_pty_count:comm_code_pty_count,
comm_code_desc:comm_code_desc,
comm_code_pcr:comm_code_pcr,
comm_code_pcr_count:comm_code_pcr_count,
travel:travel,
comm_code_tnu:comm_code_tnu,
comm_code_tnu_count:comm_code_tnu_count,
comm_code_desc_tnu:comm_code_desc_tnu,
closure_flg:closure_flg,
closure_date:closure_flg,
end_date:end_date,
emp_access:emp_access,
rate:rate,
po_number:po_number,
remarks:remarks,
bill_addrline1:bill_addrline1,
bill_addrline2:bill_addrline2,
bill_country:bill_country,
bill_city:bill_city,
salarycurr:salarycurr,
perdiumcurr:perdiumcurr,
travelcurr:travelcurr,
other_expcurr:other_expcurr,
perdium_amount_per_day:perdium_amount_per_day,
perdium_curr_per_day:perdium_curr_per_day

});
});
});
});
});
});
});

}


/* Code for Project Copy Ends */
router.get('/projectDetails',function(req,res)
{
        pdbconnect.query("SELECT emp_id from emp_master_tbl order by emp_id asc",function(err,result){
        employee=result.rows;
        empid_count=result.rowCount;
        console.log("empid:::",employee);
        console.log("empid_count:::",empid_count);

        pdbconnect.query("SELECT emp_name from emp_master_tbl order by emp_id asc",function(err,result){
        empname=result.rows;
        empname_count=result.rowCount;
        console.log("empname:::",empname);
        console.log("empname_count:::",empname_count);


        pdbconnect.query("SELECT customer_id from customer_master_tbl order by customer_id asc",function(err,result){
        customer_id=result.rows;
        customer_count=result.rowCount;
        console.log("cid:::",customer_id);
        console.log("cid_count:::",customer_count);

        pdbconnect.query("SELECT customer_name from customer_master_tbl order by customer_id asc",function(err,result){
        customer_name=result.rows;
        customername_count=result.rowCount;
        console.log("cname:::",customer_name);
        console.log("cidname_count:::",customername_count);

        pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'CUS' order by comm_code_id asc",function(err,result){
        comm_code_id=result.rows;
        comm_code_id_count=result.rowCount;
        console.log("classid:::",comm_code_id);
        console.log("classid_count:::",comm_code_id_count);

        pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id = 'CUS'  order by comm_code_id asc",function(err,result){
        comm_code_desc=result.rows;
        comm_code_desc_count=result.rowCount;
        console.log("classdesc::",comm_code_desc);
        console.log("classdesc_count:::",comm_code_desc_count);

        pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'PCR'  order by comm_code_id asc",function(err,result){
        comm_code_pcr=result.rows;
        comm_code_pcr_count=result.rowCount;
        console.log("classdesc::",comm_code_pcr);
        console.log("classdesc_count:::",comm_code_pcr_count);

        pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'HCUR'  order by comm_code_id asc",function(err,result){
        home_cur=result.rows['0'].comm_code_id;
        home_cur_count=result.rowCount;
        console.log("home currency is",home_cur);
        console.log("home currency count :::",home_cur_count);


      	pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PTY'  order by comm_code_id asc",function(err,result){
        comm_code_pty=result.rows;
        comm_code_pty_count=result.rowCount;
        console.log("classdesc::",comm_code_pty);
        console.log("classdesc_count:::",comm_code_pty_count);

	pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TNU'  order by comm_code_id asc",function(err,result){
        comm_code_tnu=result.rows;
        comm_code_tnu_count=result.rowCount;
        console.log("classdesc::",comm_code_tnu);
        console.log("classdesc_count:::",comm_code_tnu_count);

	pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_access in ('L1','L2') order by emp_id asc",function(err,result){
	delname=result.rows;
	delname_count=result.rowCount;
	console.log("delname:::",delname);
	console.log("delname_count:::",delname_count);

	pdbconnect.query("SELECT emp_id from emp_master_tbl where emp_access in ('L1','L2') order by emp_id asc",function(err,result){
	delid=result.rows;
	delid_count=result.rowCount;
	console.log("delid:::",delid);
	console.log("delid_count:::",delid_count);

        var empId = req.user.rows['0'].user_id;
        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        emp_access=result.rows['0'].user_type;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PAT' order by comm_code_id asc",function(err,result){
        comm_paymentype=result.rows;
        comm_paymentype_count=result.rowCount;
        console.log("classpayment:::",comm_paymentype);
        console.log("classpayment_count:::",comm_paymentype_count);
	if(emp_access != "L1" && emp_access != "L2")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {


res.render('projectModule/projectDetails',{
employee:employee,
empid_count:empid_count,
empname:empname,
ename:req.user.rows['0'].user_name,
eid:req.user.rows['0'].user_id,
customer_id:customer_id,
customer_count:customer_count,
customer_name:customer_name,
comm_code_id:comm_code_id,
comm_code_id_count:comm_code_id_count,
comm_code_desc:comm_code_desc,
comm_code_pcr:comm_code_pcr,
comm_code_pcr_count:comm_code_pcr_count,
comm_code_pty:comm_code_pty,
comm_code_pty_count:comm_code_pty_count,
comm_code_tnu:comm_code_tnu,
comm_code_tnu_count:comm_code_tnu_count,
delname_count:delname_count,
delid:delid,
delid_count:delid_count,
emp_access:emp_access,
home_cur:home_cur
});
}
});
});
});
});
});
});
});
});
});
});
});
});
});
});
});

/* Code for redirecting projection creation page from project view */
router.post('/projectcreView',projectcreView);
function projectcreView(req, res)
{
        pdbconnect.query("SELECT emp_id from emp_master_tbl order by emp_id asc",function(err,result){
        employee=result.rows;
        empid_count=result.rowCount;
        console.log("empid:::",employee);
        console.log("empid_count:::",empid_count);

        pdbconnect.query("SELECT emp_name from emp_master_tbl order by emp_id asc",function(err,result){
        empname=result.rows;
        empname_count=result.rowCount;
        console.log("empname:::",empname);
        console.log("empname_count:::",empname_count);


        pdbconnect.query("SELECT customer_id from customer_master_tbl order by customer_id asc",function(err,result){
        customer_id=result.rows;
        customer_count=result.rowCount;
        console.log("cid:::",customer_id);
        console.log("cid_count:::",customer_count);

        pdbconnect.query("SELECT customer_name from customer_master_tbl order by customer_id asc",function(err,result){
        customer_name=result.rows;
        customername_count=result.rowCount;
        console.log("cname:::",customer_name);
        console.log("cidname_count:::",customername_count);

        pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'CUS' order by comm_code_id asc",function(err,result){
        comm_code_id=result.rows;
        comm_code_id_count=result.rowCount;
        console.log("classid:::",comm_code_id);
        console.log("classid_count:::",comm_code_id_count);

        pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id = 'CUS'  order by comm_code_id asc",function(err,result){
        comm_code_desc=result.rows;
        comm_code_desc_count=result.rowCount;
        console.log("classdesc::",comm_code_desc);
        console.log("classdesc_count:::",comm_code_desc_count);

        pdbconnect.query("SELECT comm_code_id from common_code_tbl where code_id = 'PCR'  order by comm_code_id asc",function(err,result){
        comm_code_pcr=result.rows;
        comm_code_pcr_count=result.rowCount;
        console.log("classdesc::",comm_code_pcr);
        console.log("classdesc_count:::",comm_code_pcr_count);

      	pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PTY'  order by comm_code_id asc",function(err,result){
        comm_code_pty=result.rows;
        comm_code_pty_count=result.rowCount;
        console.log("classdesc::",comm_code_pty);
        console.log("classdesc_count:::",comm_code_pty_count);

	pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TNU'  order by comm_code_id asc",function(err,result){
        comm_code_tnu=result.rows;
        comm_code_tnu_count=result.rowCount;
        console.log("classdesc::",comm_code_tnu);
        console.log("classdesc_count:::",comm_code_tnu_count);

	pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_access in ('L1','L2') order by emp_id asc",function(err,result){
	delname=result.rows;
	delname_count=result.rowCount;
	console.log("delname:::",delname);
	console.log("delname_count:::",delname_count);

	pdbconnect.query("SELECT emp_id from emp_master_tbl where emp_access in ('L1','L2') order by emp_id asc",function(err,result){
	delid=result.rows;
	delid_count=result.rowCount;
	console.log("delid:::",delid);
	console.log("delid_count:::",delid_count);

        var empId = req.user.rows['0'].user_id;
        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        emp_access=result.rows['0'].user_type;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PAT' order by comm_code_id asc",function(err,result){
        comm_paymentype=result.rows;
        comm_paymentype_count=result.rowCount;
        console.log("classpayment:::",comm_paymentype);
        console.log("classpayment_count:::",comm_paymentype_count);


res.render('projectModule/projectDetails',{
employee:employee,
empid_count:empid_count,
empname:empname,
customer_id:customer_id,
customer_count:customer_count,
customer_name:customer_name,
comm_code_id:comm_code_id,
comm_code_id_count:comm_code_id_count,
comm_code_desc:comm_code_desc,
comm_code_pcr:comm_code_pcr,
comm_code_pcr_count:comm_code_pcr_count,
comm_code_pty:comm_code_pty,
comm_code_pty_count:comm_code_pty_count,
comm_code_tnu:comm_code_tnu,
comm_code_tnu_count:comm_code_tnu_count,
delname_count:delname_count,
delid:delid,
delid_count:delid_count,
emp_access:emp_access
});
});
});
});
});
});
});
});
});
});
});
});
});
});
}
router.get('/customercreation',function(req,res)
{
	var empId = req.user.rows['0'].user_id;
	var eid = req.user.rows['0'].user_id;
        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        emp_access=result.rows['0'].user_type;
	if(emp_access != "L1" && emp_access != "L2")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {
	

res.render('projectModule/customercreation',{
emp_access:emp_access,
ename:req.user.rows['0'].user_name,
eid:req.user.rows['0'].user_id
});
}
});
});

router.get('/customermodification',function(req,res)
{
	var empId = req.user.rows['0'].user_id;
	var eid = req.user.rows['0'].user_id;
var customer_name="";
var customer_id="";
var customer_addr1="";
var customer_country="";
var customer_city="";
var client_name1="";
var client_email1="";
var client_contact1="";
var client_name2="";
var client_email2="";
var client_contact2="";
var remarks="";
var gstno="";
var pannum="";
var customer_addr2="";
        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        emp_access=result.rows['0'].user_type;
	
	if(emp_access != "L1" && emp_access != "L2")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {

	

	pdbconnect.query("select * from customer_master_tbl where del_flg='N'",function(err,result){
	customer=result.rows;
	customer_count=result.rowCount;
	console.log("customer details",customer);
	console.log("customer details count",customer_count);


res.render('projectModule/customermodification',{
emp_access:emp_access,
ename:req.user.rows['0'].user_name,
eid:req.user.rows['0'].user_id,
customer:customer,
customer_count:customer_count,
customer_name:customer_name,
customer_id:customer_id,
customer_addr1:customer_addr1,
customer_country:customer_country,
customer_city:customer_city,
client_name1:client_name1,
client_email1:client_email1,
client_contact1:client_contact1,
client_name2:client_name2,
client_email2:client_email2,
client_contact2:client_contact2,
remarks:remarks,
gstno:gstno,
pannum:pannum,
customer_addr2:customer_addr2

});
});
}
});
});

router.post('/ModcustDetails',ModcustDetails);

function ModcustDetails(req, res)
{


        var empId = req.user.rows['0'].user_id;
        var eid = req.user.rows['0'].user_id;
	var cid = req.body.customerid;
	console.log("customer id",cid);

	pdbconnect.query("select customer_name,customer_id,customer_addr1,customer_country,customer_city,client_name1,client_email1,client_contact1,client_name2,client_email2,client_contact2,remarks,gstno,pannum,customer_addr2 from customer_master_tbl where del_flg='N' and customer_id=$1",[cid],function(err,resultset){
	if (err) throw err;
	var customer_name=resultset.rows['0'].customer_name;    
	var customer_id=resultset.rows['0'].customer_id;    
	var customer_addr1=resultset.rows['0'].customer_addr1;    
	var customer_country=resultset.rows['0'].customer_country;   
	var customer_city=resultset.rows['0'].customer_city;   
	var client_name1=resultset.rows['0'].client_name1;   
	var client_email1=resultset.rows['0'].client_email1;   
	var client_contact1=resultset.rows['0'].client_contact1;   
	var client_name2=resultset.rows['0'].client_name2;   
	var client_email2=resultset.rows['0'].client_email2;   
	var client_contact2=resultset.rows['0'].client_contact2;   
	var remarks=resultset.rows['0'].remarks;   
	var gstno=resultset.rows['0'].gstno;   
	var pannum=resultset.rows['0'].pannum;   
	var customer_addr2=resultset.rows['0'].customer_addr2;   
	 



res.render('projectModule/customermodification',{
emp_access:emp_access,
ename:req.user.rows['0'].user_name,
eid:req.user.rows['0'].user_id,
customer:customer,
customer_count:customer_count,
customer_name:customer_name,
customer_id:customer_id,
customer_addr1:customer_addr1,
customer_country:customer_country,
customer_city:customer_city,
client_name1:client_name1,
client_email1:client_email1,
client_contact1:client_contact1,
client_name2:client_name2,
client_email2:client_email2,
client_contact2:client_contact2,
remarks:remarks,
gstno:gstno,
pannum:pannum,
customer_addr2:customer_addr2
 
});
});
};


router.post('/customerModification',customermod);

function customermod(req , res)
{

        console.log("111");
   var now = new Date();
   var rcreuserid=req.user.rows['0'].user_id;
   var rcretime=now;
   var lchguserid=req.user.rows['0'].user_id;
   var lchgtime=now;

var cname=req.body.cname;
var cid=req.body.cid;
var clientaddr1=req.body.clientaddr1;
var clientaddr2=req.body.clientaddr2;
var clientname1=req.body.clientname1;
var clientname2=req.body.clientname2;
var cemail1=req.body.cemail1;
var cemail2=req.body.cemail2;
var clientph1=req.body.clientph1;
var clientph2=req.body.clientph2;
   var gstno=req.body.gstno;
   var pannum=req.body.pannum;
   var countryId=req.body.countryId;
   var cityId=req.body.cityId;
   var rmks=req.body.rmks;

        console.log("userid",rcreuserid);
        console.log("rtime",rcretime);
        console.log("luserid",lchguserid);
        console.log("ltime",lchgtime);
        console.log("cname",cname);
        console.log("cid",cid);
        console.log("gstno",gstno);
        console.log("pannum",pannum);
        console.log("countryId",countryId);
        console.log("cityId",cityId);
        console.log("clientname1",clientname1);
        console.log("cemail1",cemail1);
        console.log("clientph1",clientph1);
     	console.log("clientname2",clientname2);
        console.log("cemail2",cemail2);
        console.log("clientph2",clientph2);
        console.log("rmks",rmks);
        console.log("clientaddr1",clientaddr1);
        console.log("clientaddr2",clientaddr2);


		pdbconnect.query("select * from customer_master_tbl_hist where customer_id=$1 ",[cid],function(err,result){
		var hiscount = result.rowCount;

		if(hiscount == "0")
		{

                	pdbconnect.query("insert into customer_master_tbl_hist select * from customer_master_tbl where customer_id=$1 ",[cid],function(err,result){
                	});

                	pdbconnect.query("delete from customer_master_tbl where customer_id=$1 ",[cid],function(err,result){
                	});

		}
		else
		{
			pdbconnect.query("delete from customer_master_tbl_hist where customer_id=$1 ",[cid],function(err,result){
			});

			pdbconnect.query("insert into customer_master_tbl_hist select * from customer_master_tbl where customer_id=$1 ",[cid],function(err,result){
			});

			pdbconnect.query("delete from customer_master_tbl where customer_id=$1 ",[cid],function(err,result){
			});

		}
		

 		pdbconnect.query("INSERT INTO customer_master_tbl(customer_name,customer_id,customer_addr1,customer_addr2,client_name1,client_email1,client_contact1,client_name2,client_email2,client_contact2,rcre_user_id,rcre_time,lchg_user_id,lchg_time,del_flg,gstno,pannum,customer_country,customer_city,remarks) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)",[cname,cid,clientaddr1,clientaddr2,clientname1,cemail1,clientph1,clientname2,cemail2,clientph2,rcreuserid,rcretime,lchguserid,lchgtime,'N',gstno,pannum,countryId,cityId,rmks],function(err,done){
             

	if(err) throw err;
        var message="Customer Details " + cname + " Modified Successfully"

        res.render('projectModule/customermodview',{
        emp_access:emp_access,
        ename:req.user.rows['0'].user_name,
        eid:req.user.rows['0'].user_id,
        cname:cname,
        cid:cid,
        clientaddr1:clientaddr1,
        countryId:countryId,
        cityId:cityId,
        clientname1:clientname1,
        cemail1:cemail1,
        clientph1:clientph1,
        clientname2:clientname2,
        cemail2:cemail2,
        clientph2:clientph2,
        rmks:rmks,
        gstno:gstno,
        pannum:pannum,
        clientaddr2:clientaddr2,
        message:message
});
});
});
}

router.post('/customermodview',customermodview);
function customermodview(req,res)
{

        var empId = req.user.rows['0'].user_id;
        var eid = req.user.rows['0'].user_id;
var customer_name="";
var customer_id="";
var customer_addr1="";
var customer_country="";
var customer_city="";
var client_name1="";
var client_email1="";
var client_contact1="";
var client_name2="";
var client_email2="";
var client_contact2="";
var remarks="";
var gstno="";
var pannum="";
var customer_addr2="";
        pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
        emp_access=result.rows['0'].user_type;

        pdbconnect.query("select * from customer_master_tbl where del_flg='N'",function(err,result){
        customer=result.rows;
        customer_count=result.rowCount;
        console.log("customer details",customer);
        console.log("customer details count",customer_count);


res.render('projectModule/customermodification',{
emp_access:emp_access,
ename:req.user.rows['0'].user_name,
eid:req.user.rows['0'].user_id,
customer:customer,
customer_count:customer_count,
customer_name:customer_name,
customer_id:customer_id,
customer_addr1:customer_addr1,
customer_country:customer_country,
customer_city:customer_city,
client_name1:client_name1,
client_email1:client_email1,
client_contact1:client_contact1,
client_name2:client_name2,
client_email2:client_email2,
client_contact2:client_contact2,
remarks:remarks,
gstno:gstno,
pannum:pannum,
customer_addr2:customer_addr2

});
});
});
}



router.post('/projectDetails',projectadd);

function projectadd(req , res)
{

	   var empId = req.user.rows['0'].user_id;
	   var eid = req.user.rows['0'].user_id;
	   console.log("111");	
	   var now = new Date();
	   var rcreuserid=empId;
	   var rcretime=now;
	   var lchguserid=empId;
	   var lchgtime=now;
	   var cid=req.body.cid; 
	   var paymenttype=req.body.paymenttype; 
	   var classid=req.body.classid;
	   var projectsize=req.body.projectsize; 
	   var projectmgr=req.body.projmgr; 
	   var projtype=req.body.projtype;
	   var projcur=req.body.projcur;
	   var projsdate=req.body.projsdate;
	   var projcdate=req.body.projcdate;
	   var Projbud=req.body.Projbud;
	   var targmar=req.body.targmar;
	   var Totalbud=req.body.Totalbud;
	   var salary=req.body.salary;
	   var perdium=req.body.perdium;
	   var travel=req.body.travel;
	   var other=req.body.other;
	   var module=req.body.module;
	   var nousers=req.body.nousers;
	   var nobranch=req.body.nobranch;
	   var fpexpdate=req.body.fpexpdate;
	   var millength=req.body.millength;
	   var delmgr=req.body.delmgr;
if(fpexpdate == "")
{
	fpexpdate=null;
}
   var tenure=req.body.tenure;
   var projexpdate=req.body.projexpdate;
 if(projexpdate == "")
{
	projexpdate=null;
}  
   var subper=req.body.subper;
   var subamt=req.body.subamt;
   var povalue=req.body.povalue;
   var Noofppl=req.body.Noofppl;
   var perloc=req.body.perloc;
   var perdiumamt=req.body.perdiumamt;
   var percur=req.body.percur;
   var rateamt=req.body.rateamt;
   var ponumber=req.body.ponumber;
   var rmks=req.body.rmks;
   var clientaddr1=req.body.clientaddr1;
   var clientaddr2=req.body.clientaddr2;
   var countryId=req.body.countryId;
   var cityId=req.body.cityId;
   var pincode=req.body.pincode;
   var perloc=req.body.perloc;
   var perdiumamt=req.body.perdiumamt;
   var perprocurr=req.body.perprocurr;
   var salarycurr=req.body.salarycurr;
   var perdiemamtcurr=req.body.perdiemamtcurr;
   var travelamtcurr=req.body.travelamtcurr;
   var otheramtcurr=req.body.otheramtcurr;
   var clientaddr1=req.body.clientaddr1;
   var clientaddr2=req.body.clientaddr2;
   var countryId=req.body.countryId;
   var cityId=req.body.cityId;
   var pincode=req.body.pincode;
   var salrate=req.body.salrate;
   var perrate=req.body.perrate;
   var travelrate=req.body.travelrate;
   var otherrate=req.body.otherrate;
   var salconamt=req.body.salconamt;
   var perconamt=req.body.perconamt;
   var traconamt=req.body.traconamt;
   var othconamt=req.body.othconamt;
   var projectid=0;
   var milcount=0;
	var datetime = new Date();
	console.log("sysdate",datetime);
	console.log("111");	

	console.log("userid",rcreuserid);	
	console.log("millength",millength);	
	console.log("rtime",rcretime);	
	console.log("luserid",lchguserid);	
	console.log("ltime",lchgtime);	
	console.log("cid",cid);	
	console.log("paymenttype",paymenttype);	
	console.log("classid",classid);	
	console.log("projectsize",projectsize);	
	console.log("projectmgr",projectmgr);	
	console.log("projtype",projtype);	
	console.log("projcur",projcur);	
	console.log("projsdate",projsdate);	
	console.log("projcdate",projcdate);	
	console.log("Projbud",Projbud);	
	console.log("targmar",targmar);	
	console.log("Totalbud",Totalbud);	
	console.log("salary",salary);	
	console.log("perdium",perdium);	
	console.log("travel",travel);	
	console.log("other",other);	
	console.log("module",module);	
	console.log("nousers",nousers);	
	console.log("nobranch",nobranch);	
	console.log("delmgr",delmgr);	
	console.log("perloc",perloc);	
	console.log("perdiumamt",perdiumamt);	
	console.log("perprocurr",perprocurr);	
	console.log("salconamt",salconamt);	
	console.log("perconamt",perconamt);	
	console.log("traconamt",traconamt);	
	console.log("othconamt",othconamt);	

	pdbconnect.query("SELECT count(*) as cnt from project_master_tbl where LOWER(cid)= LOWER($1) ",[cid],function(err,result){
         if(err) throw err;
	var proj_count = result.rows[0].cnt;
        console.log("rcount",proj_count);

if(proj_count == 0) 
{
	proj_count = 1;
}
else
{
	proj_count = (proj_count - 0) + (1 - 0);
}

	console.log("classcount count",proj_count);

	classid = classid.replace(/\s/g,'');
	cid = cid.replace(/\s/g,'');
	projtype = projtype.replace(/\s/g,'');

	projectid = classid +"-"+ cid +"-" +projtype +"-"+ proj_count;
	console.log("project id",projectid);


        pdbconnect.query("SELECT  * from project_master_tbl  where LOWER(project_id) = LOWER($1)",
                      [projectid],function(err,resultset){
                if(err) throw err;
var rcount = resultset.rowCount;
console.log("rcount",rcount);
if(rcount == 0)
{
		var milname_arr = [];
		var caper_arr = [];
		var diramt_arr = [];
		var milDate_arr = [];
		 pdbconnect.query("INSERT INTO project_master_tbl(project_id,cid,project_loc,payment_type,customer_class,team_size,project_mgr,delivery_mgr,project_type,project_curr,project_budget,target_margin,tot_budget,salary,salarycurr,perdium,perdiumcurr,travel,travelcurr,other_exp,other_expcurr,fl_modules_included,fl_num_users,fl_num_of_branches,start_date,end_date,rcre_user_id,rcre_time,lchg_user_id,lchg_time,del_flg,perdium_amount_per_day,perdium_curr_per_day,bill_addrline1,bill_addrline2,bill_country,bill_city,bill_pin_code,po_number,remarks,closure_flg,sow_upld,chld_cnt,chld_flg,salary_rate,perdiem_rate,travel_rate,other_rate,salary_converted_amt,travel_converted_amt,perdiem_converted_amt,other_converted_amt) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52)",[projectid,cid,perloc,paymenttype,classid,projectsize,projectmgr,delmgr,projtype,projcur,Projbud,targmar,Totalbud,salary,salarycurr,perdium,perdiemamtcurr,travel,travelamtcurr,other,otheramtcurr,module,nousers,nobranch,projsdate,projcdate,rcreuserid,rcretime,lchguserid,lchgtime,'N',perdiumamt,perprocurr,clientaddr1,clientaddr2,countryId,cityId,pincode,ponumber,rmks,'N','N','0','N',salrate,perrate,travelrate,otherrate,salconamt,perconamt,traconamt,othconamt],function(err,done){

                if(err) throw err;
	//var millength1 = (millength - 0) - (1 - 0);	
	for(i=0;i<millength;i++)
	{
		var milname=req.body["milname_" + i];
		var caper=req.body["caper_" + i];
		var diramt=req.body["diramt_" + i];
		var milDate=req.body["milDate_" + i];
		console.log("name",milname);
		console.log("caper",caper);
		console.log("diramt",diramt);
		console.log("milDate",milDate);
		
			
	                if(typeof milname === 'undefined')
{


}
else
{
		milname_arr.push(milname);
		caper_arr.push(caper);
		diramt_arr.push(diramt);
		milDate_arr.push(milDate);
		milcount = (milcount - 0) + (1 - 0);
                 pdbconnect.query("INSERT INTO milestone_proj_tbl(project_id,serial_number,milestone_name,capture_per,direct_amount,milestone_exp_date,del_flg,rcre_user_id,lchg_user_id,rcre_time,lchg_time,confirm_flg,paid_flg,status_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)",[projectid,i,milname,caper,diramt,milDate,'N',rcreuserid,lchguserid,rcretime,lchgtime,'N','N','N'],function(err,done){
                if(err) throw err;
});

}
	}



	pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[delmgr],function(err,result){
        delname=result.rows['0'].emp_name;
        console.log("delname:::",delname);

	pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[projectmgr],function(err,result){
        projmgrname=result.rows['0'].emp_name;
        console.log("project manager name:::",projmgrname);
	
	pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[rcreuserid],function(err,result){
        createdgrname=result.rows['0'].emp_name;
        console.log("created user name:::",createdgrname);

	pdbconnect.query("select project_mgr,delivery_mgr from project_master_tbl where project_id=$1",[projectid],function(err,result){
        projectmgr  = result.rows['0'].project_mgr;
        deliverymgr = result.rows['0'].delivery_mgr;
        console.log("projectmgr!!!",projectmgr);
        console.log("deliverymgr!!",deliverymgr);

	pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id =$1",[projectmgr],function(err,result){
        projectmgremail  = result.rows['0'].emp_email;
        console.log("projectmgremail--",projectmgremail);

	pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id =$1",[deliverymgr],function(err,result){
        deliverymgremail = result.rows['0'].emp_email;
        console.log("deliverymgremail--",deliverymgremail);

	pdbconnect.query("SELECT reporting_mgr from emp_master_tbl where emp_id=$1",[delmgr],function(err,result){
        delrpt=result.rows['0'].reporting_mgr;
        console.log("delivery manager's manager");

	pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id=$1",[delrpt],function(err,result){
        delrptmail=result.rows['0'].emp_email;
        console.log("delivery manager's manager email");


	 pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='FIN'",function(err,result){
         finemail = result.rows['0'].comm_code_desc;
         console.log("finance mail",finemail);

	 var mailids = projectmgremail +","+ deliverymgremail ;
        console.log("mailids",mailids);

        var cclist = finemail +","+ delrptmail;
        console.log("cclist",cclist);
	

            var smtpTransport = nodemailer.createTransport('SMTP',{
               service: 'gmail',
               auth:
            {
                user: 'amber@nurture.co.in',
                pass: 'nurture@123'
            }
            });


    var mailOptions = {
                to: mailids,
		cc: cclist,
                from: 'amber@nurture.co.in',
                subject: 'Project Creation Notification ',
                text: 'Dear Team,\n\n' +
                'Project creation Details.\n\n' +
                'Project ID:  ' + projectid + ' has been created.\n' +
                'Delivery manager:  ' + delmgr + '-' + delname + '\n' +
                'Project manager:   ' + projectmgr + '-' + projmgrname + '\n' +
                'Project was created by ' + rcreuserid + '-' + createdgrname + '.\n\n\n\n' +
		'- Regards,\nAmber'
               };


               smtpTransport.sendMail(mailOptions, function(err) {
               });

	console.log("mil name ",milname_arr);
	console.log("capture percentage",caper_arr);
	console.log("mil date",milDate_arr);
	console.log("mil count",milcount);
	console.log("direct amount",diramt_arr);

	 var message="Project Details Added Successfully:  " + projectid ;
	res.render('projectModule/projectcreationView',{
	ename:req.user.rows['0'].user_name,
        eid:req.user.rows['0'].user_id,
	projectid:projectid,
	cid:cid,
	perloc:perloc,
	paymenttype:paymenttype,
	classid:classid,
	projectsize:projectsize,
	projectmgr:projectmgr,
	delmgr:delmgr,
	projtype:projtype,
	projcur:projcur,
	Projbud:Projbud,
	targmar:targmar,
	Totalbud:Totalbud,
	salary:salary,
	salarycurr:salarycurr,
	perdium:perdium,
	perdiemamtcurr:perdiemamtcurr,
	travel:travel,
	travelamtcurr:travelamtcurr,
	other:other,
	otheramtcurr:otheramtcurr,
	module:module,
	nousers:nousers,
	nobranch:nobranch,
	projsdate:projsdate,
	projcdate:projcdate,
	perdiumamt:perdiumamt,
	perprocurr:perprocurr,
	clientaddr1:clientaddr1,
	clientaddr2:clientaddr2,
	countryId:countryId,
	cityId:cityId,
	pincode:pincode,
	rateamt:rateamt,
	ponumber:ponumber,
	rmks:rmks,
	message:message,
	milname_arr:milname_arr,
	caper_arr:caper_arr,
	milDate_arr:milDate_arr,
	diramt_arr:diramt_arr,
	milcount:milcount,
	salrate:salrate,
	perrate:perrate,
	travelrate:travelrate,
	otherrate:otherrate,
	salconamt:salconamt,
	perconamt:perconamt,
	traconamt:traconamt,
	othconamt:othconamt
	});

});
});
});
});
});
});
});
});
});
});
		
}
else
{
          req.flash('error',"Project Details Already Added")
          res.redirect(req.get('referer'));
}


	
});
});
};


router.post('/customerview',customerview);
function customerview(req,res)
{

var empId = req.user.rows['0'].user_id;
var eid = req.user.rows['0'].user_id;
pdbconnect.query("SELECT user_type from users where user_id = $1",[empId],function(err,result){
emp_access=result.rows['0'].user_type;

res.render('projectModule/customercreation',{
emp_access:emp_access,
ename:req.user.rows['0'].user_name,
eid:req.user.rows['0'].user_id
});
});



}
router.post('/customercreation',customercre);

function customercre(req,res)
{
        console.log("111");
   var now = new Date();
   var rcreuserid=req.user.rows['0'].user_id;
   var rcretime=now;
   var lchguserid=req.user.rows['0'].user_id;
   var lchgtime=now;

var cname=req.body.cname;
var cid=req.body.cid;
var clientaddr1=req.body.clientaddr1;
var clientaddr2=req.body.clientaddr2;
var clientname1=req.body.clientname1;
var clientname2=req.body.clientname2;
var cemail1=req.body.cemail1;
var cemail2=req.body.cemail2;
var clientph1=req.body.clientph1;
var clientph2=req.body.clientph2;
   var gstno=req.body.gstno; 
   var pannum=req.body.pannum; 
   var countryId=req.body.countryId; 
   var cityId=req.body.cityId; 
   var rmks=req.body.rmks; 

	console.log("userid",rcreuserid);
	console.log("rtime",rcretime);
        console.log("luserid",lchguserid);
        console.log("ltime",lchgtime);
	console.log("cname",cname);
	console.log("cid",cid);
	console.log("gstno",gstno);	
	console.log("pannum",pannum);	
	console.log("countryId",countryId);	
	console.log("cityId",cityId);	
        console.log("clientname1",clientname1);
        console.log("cemail1",cemail1);
        console.log("clientph1",clientph1);
     console.log("clientname2",clientname2);
        console.log("cemail2",cemail2);
        console.log("clientph2",clientph2);
        console.log("rmks",rmks);
        console.log("clientaddr1",clientaddr1);
        console.log("clientaddr2",clientaddr2);


pdbconnect.query("SELECT  * from customer_master_tbl  where LOWER(customer_id) = LOWER($1)",
                      [cid],function(err,resultset){
		if(err) throw err;
var rcount = resultset.rowCount;
console.log("rcount",rcount);


if(rcount == 0)
{

 pdbconnect.query("INSERT INTO customer_master_tbl(customer_name,customer_id,customer_addr1,customer_addr2,client_name1,client_email1,client_contact1,client_name2,client_email2,client_contact2,rcre_user_id,rcre_time,lchg_user_id,lchg_time,del_flg,gstno,pannum,customer_country,customer_city,remarks) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)",[cname,cid,clientaddr1,clientaddr2,clientname1,cemail1,clientph1,clientname2,cemail2,clientph2,rcreuserid,rcretime,lchguserid,lchgtime,'N',gstno,pannum,countryId,cityId,rmks],function(err,done){
             if(err) throw err;
	
	var message="Customer Details  Added Successfully: " + cid;
	res.render('projectModule/customerview',{
	emp_access:emp_access,
	ename:req.user.rows['0'].user_name,
	eid:req.user.rows['0'].user_id,
	cname:cname,
	cid:cid,
	clientaddr1:clientaddr1,
	countryId:countryId,
	cityId:cityId,
	clientname1:clientname1,
	cemail1:cemail1,
	clientph1:clientph1,
	clientname2:clientname2,
	cemail2:cemail2,
	clientph2:clientph2,
	rmks:rmks,
	gstno:gstno,
	pannum:pannum,
	clientaddr2:clientaddr2,
	message:message
});
});
}
else
{
          req.flash('error',"Customer Details Already Added")
          res.redirect(req.get('referer'));
}


});

};

/* code for milestone marking */
router.get('/milestoneMarking',function(req,res)
{

var parse ="";
var parse_count ="";
        pdbconnect.query("SELECT project_id from project_master_tbl where closure_flg='N' and del_flg='N'  order by project_id asc",function(err,result){
        if(err) throw err;
        projectid=result.rows;
        projectid_count=result.rowCount;
        console.log("projectid:::",projectid);
        console.log("projectid_count:::",projectid_count);
	var emp_access=req.user.rows['0'].user_type;
        console.log("empaccess",emp_access);

        if(emp_access != "L1" && emp_access != "L2")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {


res.render('projectModule/milestoneMarking',{
ename:req.user.rows['0'].user_name,
eid:req.user.rows['0'].user_id,

projectid:projectid,
projectid_count:projectid_count,
parse_count:parse_count,
parse:parse

});
}
});
});

router.post('/milestoneMarking',milestoneMarking);

function milestoneMarking(req , res)
{
var project_id=req.body.projectid;
console.log("project_id from crit page ",project_id);
        pdbconnect.query("SELECT project_id from project_master_tbl where closure_flg='N'  order by project_id asc",function(err,result){
        if(err) throw err;
        projectid=result.rows;
        projectid_count=result.rowCount;
        console.log("projectid:::",projectid);
        console.log("projectid_count:::",projectid_count);


        pdbconnect.query("SELECT * from milestone_proj_tbl where project_id=$1 and confirm_flg='N' and paid_flg='N' and del_flg='N' order by milestone_exp_date ",[project_id],function(err,result){
        parse=result.rows;
        parse_count=result.rowCount;
        console.log("milestone data:::",parse);
        console.log("milestone count:::",parse_count);


res.render('projectModule/milestoneMarking',{
project_id:project_id,
ename:req.user.rows['0'].user_name,
eid:req.user.rows['0'].user_id,
projectid_count:projectid_count,
parse_count:parse_count,
parse:parse
});
});
});
};

router.post('/milestoneMarkpost',milestoneMarkpos);
function milestoneMarkpos(req , res)
{
 
	console.log(" inside miletsone post function");
       var array = req.body.button;
       var milestonedata = req.body.milestonedata;
	console.log(" project_id",milestonedata);
        var empId = req.user.rows['0'].user_id;
        var eid = req.user.rows['0'].user_id;

        console.log("111");
   var now = new Date();
   var rcreuserid=empId;
   var rcretime=now;
   var lchguserid=empId;
   var lchgtime=now;
   var confirmed_date=now;

        pdbconnect.query("SELECT project_mgr from project_master_tbl  where project_id=$1 ",[milestonedata],function(err,result){
        projmgr=result.rows['0'].project_mgr;
        console.log("Project manager name:::",projmgr);
        console.log("Employee iD name:::",projmgr);
		
if(projmgr == empId)
{ 

	pdbconnect.query("select project_id,serial_number,milestone_name,direct_amount from milestone_proj_tbl where project_id=$1 and  confirm_flg='N' and paid_flg='N' and del_flg='N' order by milestone_exp_date ",[milestonedata],function(err,result){
        pid=result.rows[array].project_id;
        milestoneName=result.rows[array].milestone_name;
        serial_number=result.rows[array].serial_number;
        direct_amount=result.rows[array].direct_amount;
	confirm_amt=req.body["confirm_amt_" + array];
	console.log("pid",pid);
	console.log("confirm_amt",confirm_amt);
	console.log("milestoneName",milestoneName);
	console.log("serial_number",serial_number);


	pdbconnect.query("insert into milestone_proj_tbl_hist select * from milestone_proj_tbl where project_id=$1 ",[milestonedata],function(err,result){
                if(err) throw err;
});

	pdbconnect.query("update milestone_proj_tbl  set confirm_flg=$1,lchg_user_id=$2,lchg_time=$3,confirmed_date=$4,status_flg=$8,confirm_amount=$9  where project_id=$5 and milestone_name=$6 and serial_number=$7  ",['Y',lchguserid,lchgtime,confirmed_date,milestonedata,milestoneName,serial_number,'Y',confirm_amt],function(err,done)
        {
                if(err) throw err;

});

            var smtpTransport = nodemailer.createTransport('SMTP',{
               service: 'gmail',
               auth:
            {
                user: 'amber@nurture.co.in',
                pass: 'nurture@123'
            }
            });
	


        pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[rcreuserid],function(err,result){
        createdgrname=result.rows['0'].emp_name;
        console.log("created user name:::",createdgrname);

        pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='MAIL' and comm_code_id='PROJ' ",function(err,result){
        maillist=result.rows['0'].comm_code_desc;
        console.log("mail list:::",maillist);

        pdbconnect.query("select project_mgr,delivery_mgr from project_master_tbl where project_id=$1",[pid],function(err,result){
        var projectmgr = result.rows['0'].project_mgr;
        console.log("projectmgr!!!",projectmgr);
        var deliverymgr = result.rows['0'].delivery_mgr;
        console.log("deliverymgr!!",deliverymgr);


	pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[deliverymgr],function(err,result){
        delname=result.rows['0'].emp_name;
        console.log("delname:::",delname);


        pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[projectmgr],function(err,result){
        projmgrname=result.rows['0'].emp_name;
        console.log("project manager name:::",projmgrname);

        pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id =$1",[projectmgr],function(err,result){
        projectmgremail  = result.rows['0'].emp_email;
        console.log("projectmgremail--",projectmgremail);

        pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id =$1",[deliverymgr],function(err,result){
        deliverymgremail = result.rows['0'].emp_email;
        console.log("deliverymgremail--",deliverymgremail);

        pdbconnect.query("SELECT reporting_mgr from emp_master_tbl where emp_id=$1",[deliverymgr],function(err,result){
        delrpt=result.rows['0'].reporting_mgr;
        console.log("delivery manager's manager");

        pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id=$1",[delrpt],function(err,result){
        delrptmail=result.rows['0'].emp_email;
        console.log("delivery manager's manager email");

         pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='FIN'",function(err,result){
         finemail = result.rows['0'].comm_code_desc;
         console.log("finance mail",finemail);

		 
	var mailids = projectmgremail +","+ deliverymgremail ;
        console.log("mailids",mailids);

        var cclist = finemail +","+ delrptmail;
        console.log("cclist",cclist);	

	    var mailOptions = {
                to: mailids,
		cc: cclist,
                from: 'nurtureportal@gmail.com',
                subject: 'Milestone Confirmation Notification ',
                text: 'Hi Team,\n\n' +
		'Milestone has been marked as confirmed for the following Project\n\n' +
		'Project ID:     ' + milestonedata + '\n' +
		'Milestone Name: ' + milestoneName + '\n' +
		'Milestone Amount: ' + direct_amount + '\n' +
		'Confirmed Amount: ' + confirm_amt + '\n' +
		'Finance Team can further proceed to raise the invoice \n' +
                'Milestone was marked by ' + rcreuserid + '-' + createdgrname +'.\n\n\n\n' +
		'- Regards,\nAmber'
               };


               smtpTransport.sendMail(mailOptions, function(err) {
               });




  		console.log("success message", milestonedata);
  		console.log("success message", milestoneName);
                req.flash('success',"Milestone " + milestoneName + " for the Project Id " + milestonedata + "  has been successfully Marked As Confirmed.")
                res.redirect('/projectModule/projectDetails/milestoneMarking');

});
});
});
});
});
});
});
});
});
});
});
}
else
{
	req.flash('error',"Project manager can only mark the milestone as confirmed")
	res.redirect('/projectModule/projectDetails/milestoneMarking');
}

});
};

/*Milestone recall function */
router.get('/recallmilestonemrak',function(req,res)
{

var parse ="";
var parse_count ="";
        pdbconnect.query("select distinct p.project_id from project_master_tbl p,milestone_proj_tbl m where p.project_id = m.project_id and m.confirm_flg='Y' and m.paid_flg='N' and m.status_flg='Y' and m.del_flg='N' and p.del_flg='N' ",function(err,result){
        if(err) throw err;
        projectid=result.rows;
        projectid_count=result.rowCount;
        console.log("projectid:::",projectid);
        console.log("projectid_count:::",projectid_count);
	var emp_access=req.user.rows['0'].user_type;
        console.log("empaccess",emp_access);

        if(emp_access != "L1" && emp_access != "L2")
        {
                      res.redirect('/admin-dashboard/adminDashboard/admindashboard');
        }
        else
        {


res.render('projectModule/recallmilestonemrak',{
ename:req.user.rows['0'].user_name,
eid:req.user.rows['0'].user_id,

projectid:projectid,
projectid_count:projectid_count,
parse_count:parse_count,
parse:parse

});
}
});
});

router.post('/RecallMilestone',RecallMilestoneMar);

function RecallMilestoneMar(req , res)
{
var project_id=req.body.projectid;
console.log("project_id from crit page ",project_id);
        pdbconnect.query("SELECT project_id from project_master_tbl where closure_flg='N'  order by project_id asc",function(err,result){
        if(err) throw err;
        projectid=result.rows;
        projectid_count=result.rowCount;
        console.log("projectid:::",projectid);
        console.log("projectid_count:::",projectid_count);


        pdbconnect.query("select * from project_master_tbl p,milestone_proj_tbl m where p.project_id = m.project_id and m.confirm_flg='Y' and m.paid_flg='N' and m.status_flg='Y' and m.del_flg='N' and p.del_flg='N' and m.project_id=$1 order by m.milestone_exp_date asc",[project_id],function(err,result){
        parse=result.rows;
        parse_count=result.rowCount;
        console.log("milestone data:::",parse);
        console.log("milestone count:::",parse_count);


res.render('projectModule/recallmilestonemrak',{
project_id:project_id,
ename:req.user.rows['0'].user_name,
eid:req.user.rows['0'].user_id,
projectid_count:projectid_count,
parse_count:parse_count,
parse:parse
});
});
});
};

router.post('/Recallmilstone',Recallmilstone);
function Recallmilstone(req , res)
{
 
	console.log(" inside miletsone post function");
       var array = req.body.button;
       var milestonedata = req.body.milestonedata;
	console.log(" project_id",milestonedata);
        var empId = req.user.rows['0'].user_id;
        var eid = req.user.rows['0'].user_id;

        console.log("111");
   var now = new Date();
   var rcreuserid=empId;
   var rcretime=now;
   var lchguserid=empId;
   var lchgtime=now;
   var confirmed_date=now;

        pdbconnect.query("SELECT project_mgr from project_master_tbl  where project_id=$1 ",[milestonedata],function(err,result){
        projmgr=result.rows['0'].project_mgr;
        console.log("Project manager name:::",projmgr);
        console.log("Employee iD name:::",projmgr);
		
if(projmgr == empId)
{ 

	pdbconnect.query("select m.project_id,m.serial_number,m.milestone_name from project_master_tbl p,milestone_proj_tbl m where p.project_id = m.project_id and m.confirm_flg='Y' and m.paid_flg='N' and m.status_flg='Y' and m.del_flg='N' and p.del_flg='N' and m.project_id=$1 order by m.milestone_exp_date asc",[milestonedata],function(err,result){
        pid=result.rows[array].project_id;
        milestoneName=result.rows[array].milestone_name;
        serial_number=result.rows[array].serial_number;
	confirm_amt=req.body["confirm_amt_" + array];
	console.log("pid",pid);
	console.log("confirm_amt",confirm_amt);
	console.log("milestoneName",milestoneName);
	console.log("serial_number",serial_number);


	pdbconnect.query("insert into milestone_proj_tbl_hist select * from milestone_proj_tbl where project_id=$1 and serial_number=$2 ",[milestonedata,serial_number],function(err,result){
                if(err) throw err;
});

	pdbconnect.query("update milestone_proj_tbl  set confirm_flg=$1,lchg_user_id=$2,lchg_time=$3,confirmed_date=$4,status_flg=$8,confirm_amount=$9  where project_id=$5 and milestone_name=$6 and serial_number=$7  ",['N',lchguserid,lchgtime,null,milestonedata,milestoneName,serial_number,'N','0'],function(err,done)
        {
                if(err) throw err;

});

            var smtpTransport = nodemailer.createTransport('SMTP',{
               service: 'gmail',
               auth:
            {
                user: 'amber@nurture.co.in',
                pass: 'nurture@123'
            }
            });
	


        pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[rcreuserid],function(err,result){
        createdgrname=result.rows['0'].emp_name;
        console.log("created user name:::",createdgrname);

        pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='MAIL' and comm_code_id='PROJ' ",function(err,result){
        maillist=result.rows['0'].comm_code_desc;
        console.log("mail list:::",maillist);

        pdbconnect.query("select project_mgr,delivery_mgr from project_master_tbl where project_id=$1",[pid],function(err,result){
        var projectmgr = result.rows['0'].project_mgr;
        console.log("projectmgr!!!",projectmgr);
        var deliverymgr = result.rows['0'].delivery_mgr;
        console.log("deliverymgr!!",deliverymgr);


	pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[deliverymgr],function(err,result){
        delname=result.rows['0'].emp_name;
        console.log("delname:::",delname);


        pdbconnect.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ",[projectmgr],function(err,result){
        projmgrname=result.rows['0'].emp_name;
        console.log("project manager name:::",projmgrname);

        pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id =$1",[projectmgr],function(err,result){
        projectmgremail  = result.rows['0'].emp_email;
        console.log("projectmgremail--",projectmgremail);

        pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id =$1",[deliverymgr],function(err,result){
        deliverymgremail = result.rows['0'].emp_email;
        console.log("deliverymgremail--",deliverymgremail);

        pdbconnect.query("SELECT reporting_mgr from emp_master_tbl where emp_id=$1",[deliverymgr],function(err,result){
        delrpt=result.rows['0'].reporting_mgr;
        console.log("delivery manager's manager");

        pdbconnect.query("SELECT emp_email from emp_master_tbl where emp_id=$1",[delrpt],function(err,result){
        delrptmail=result.rows['0'].emp_email;
        console.log("delivery manager's manager email");

         pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='FIN'",function(err,result){
         finemail = result.rows['0'].comm_code_desc;
         console.log("finance mail",finemail);

		 
	var mailids = projectmgremail +","+ deliverymgremail ;
        console.log("mailids",mailids);

        var cclist = finemail +","+ delrptmail;
        console.log("cclist",cclist);	

	    var mailOptions = {
                to: mailids,
		cc: cclist,
                from: 'nurtureportal@gmail.com',
                subject: 'Milestone Recall Notification ',
                text: 'Hi Team,\n\n' +
		'Milestone has been recalled for the following Project\n\n' +
		'Project ID:     ' + milestonedata + '\n' +
		'Milestone Name: ' + milestoneName + '\n' +
		'Project Manager can further proceed to mark the milestone again \n' +
                'Milestone was recalled by ' + rcreuserid + '-' + createdgrname +'.\n\n\n\n' +
		'- Regards,\nAmber'
               };


               smtpTransport.sendMail(mailOptions, function(err) {
               });




  		console.log("success message", milestonedata);
  		console.log("success message", milestoneName);
                req.flash('success',"Milestone " + milestoneName + " for the Project Id " + milestonedata + "  has been successfully  recalled.")
                res.redirect('/projectModule/projectDetails/recallmilestonemrak');

});
});
});
});
});
});
});
});
});
});
});
}
else
{
	req.flash('error',"Project manager can only mark the milestone as confirmed")
	res.redirect('/projectModule/projectDetails/milestoneMarking');
}

});
};




function projectDocUpload (req,res)
{ 
	var eid =req.user.rows[0].user_id;
        var ename = req.user.rows[0].user_name;
	var emp_access=req.user.rows['0'].user_type;
	pdbconnect.query("SELECT project_id,cid from project_master_tbl order by project_id asc",function(err,result){
        project=result.rows;
        projid_count=result.rowCount;
	console.log(project);
        res.render('projectModule/projectDocuments',{projid_count:projid_count,project:project,eid:eid,ename:ename,emp_access:emp_access});
	});
}


function projectDocumentView(req,res)
{
        var eid =req.user.rows[0].user_id;
        var ename = req.user.rows[0].user_name;
	var emp_access=req.user.rows['0'].user_type;
        pdbconnect.query("SELECT project_id,cid from project_master_tbl order by project_id asc",function(err,result){
        project=result.rows;
        projid_count=result.rowCount;
        console.log(project);
        res.render('projectModule/projectDocumentsView',{projid_count:projid_count,project:project,eid:eid,ename:ename,emp_access:emp_access});
        });
}


function projectDocUpl(req,res)
{
	console.log(project);	
	console.log(projectname);	
	// var eid =req.user.rows[0].user_id;
        doc = "";
        var form = new formidable.IncomingForm();
        form.parse(req,
                function (err, fields, files)
                {
                        var projId = fields["projectId"];
			var docType = fields["docType"];
			var projectTag = fields["projectTag"];
			projectTag = projectTag.replace(/ /g,'_').toUpperCase();
			var d = new Date();
			//var n = (d.toDateString()+d.getTime());
			//n = n.replace(/ /g,'_');
			var n = moment(d).format('YYYYMMDD:hhmmss:a');
			n = n.replace(/:/g,'_').toUpperCase();
			
			if(docType == "1")
			{
				doc = "SOW_"+projectTag+"_"+n;
			}
			if(docType == "2")
			{
				doc = "PO_"+projectTag+"_"+n;
			}
			if(docType == "3")
			{
				doc = "MileStone_"+projectTag+"_"+n;
			}
			if(docType == "4")
			{
				doc = "Closure_"+projectTag+"_"+n;
			}
			if(docType == "5")
			{
				doc = "FeedBack_"+projectTag+"_"+n;
			}
			if(docType == "6")
			{
				doc = "Attendance_"+projectTag+"_"+n;
			}
			var dir2 = './data/CMS/project/projDocs/'+projId+"/";
                        if (!fs.existsSync(dir2))
                        {
                                fs.mkdirSync(dir2);
                        }
			var newName = projId+"_"+doc+".pdf";
			var newPath = dir2 + newName;
                        console.log(newPath);

                        fs.rename(oldPath, newPath,
			function (err)
			{
				if (err) throw err;
		
				if(docType == "1")
                        	{
					pdbconnect.query("update project_master_tbl set sow_upld='Y' where project_id=$1",[projId],function(err,done){
					if(err) throw err;
					});
                        	}

				req.flash('success',"Document Uploaded Successfully")
				res.redirect(req.get('referer'));
			});
		});
			var oldName = "doc.pdf"
			var dirOld = './data/CMS/project/temp/';
			var oldPath = dirOld + oldName;
			if (!fs.existsSync(dirOld))
			{
				fs.mkdirSync(dirOld);
			}
			console.log(oldPath);

			var storage = multer.diskStorage({
                	destination: function(req, file, callback) 
			{
                        	console.log(file);
                        	callback(null, dirOld)
                	},
                
			filename: function(req, file, callback) 
			{
                        	callback(null,oldName)
                	}
        })
	
			var upload = multer({storage: storage}).single('uploadDoc')
        		upload(req, res, function(err) {
                	if (err) 
			{
                                return res.end("Something went wrong!");
                	}
                	});

}


function projectDocsView(req,res)
{
	sowLen = 0,poLen = 0,mileLen = 0 ,cloLen = 0 ,fbLen = 0,aLen = 0;
	var eid =req.user.rows[0].user_id;
	var ename = req.user.rows[0].user_name;
	var emp_access=req.user.rows['0'].user_type;
	var projId = req.body.projId;
	var docType = req.body.docType;
	console.log(projId);
	console.log("docType : ",docType);
	var testFolder = './data/CMS/project/projDocs/'+projId+"/";
        if (!fs.existsSync(testFolder))
        {
                req.flash('error',"No details found for this project")
                res.redirect(req.get('referer'));
        }
	else
        {
                pdbconnect.query("SELECT cid,project_id from project_master_tbl where project_id =$1 ",[projId],
		function(err,result){
		project=result.rows;
		console.log(project);
		projid_count=result.rowCount;
		fs.readdirSync(testFolder).forEach(
		function (name)
		{
			resValue1 = name.search("SOW");
			if(resValue1 != -1)
			{
				sowDocs[sowLen] = name;
				sowLen = sowLen + 1;
			}
			resValue1 = name.search("PO");
			if(resValue1 != -1)
			{
				poDocs[poLen] = name;
				poLen = poLen + 1;
			}
			resValue1 = name.search("MileStone");
			if(resValue1 != -1)
			{
				mileDocs[mileLen] = name;
				mileLen = mileLen + 1;
			}
			resValue1 = name.search("Closure");
			if(resValue1 != -1)
			{
				cloDocs[cloLen] = name;
				cloLen = cloLen + 1;
			}
			resValue1 = name.search("FeedBack");
			if(resValue1 != -1)
			{
				fbDocs[fbLen] = name;
				fbLen = fbLen + 1;
			}
			resValue1 = name.search("Attendance");
			if(resValue1 != -1)
			{
				aDocs[aLen] = name;
				aLen = aLen + 1;
			}
		});
		if(sowLen == 0 && poLen == 0 && mileLen == 0 && cloLen == 0 && fbLen == 0 && aLen == 0)
		{
			req.flash('error',"No details found for this project")
			res.redirect(req.get('referer'));
		}
		else
		{
			res.render('projectModule/projectDocView',{
			sowDocs:sowDocs,sowLen:sowLen,
			poDocs:poDocs,poLen:poLen,
			mileDocs:mileDocs,mileLen:mileLen,
			cloDocs:cloDocs,cloLen:cloLen,
			fbDocs:fbDocs,fbLen:fbLen,
			aDocs:aDocs,aLen:aLen,
			project:project,
			docType:docType,
			projid_count:projid_count,
			eid:eid,
			projId:projId,
			ename:ename,
			emp_access:emp_access
			});
		}
		});
	}
}


function viewAndDownload(req,res)
{
	var id = req.query.id;
	var projId = req.query.projId;
	var testFolder = './data/CMS/project/projDocs/'+projId+"/";
        console.log(testFolder);
        var file1 = testFolder +id;
        fs.readFile(file1,
        
	function(err, file)
        {
		res.writeHead(200, {"Content-Type" : "application/pdf" });
                res.write(file, "binary");
                res.end();
        });
	
    	return;
}

function showConvRate(req,res)
{
	var emp = req.query.emp;
	var projId = req.query.projId;
	console.log('emp',emp);
	console.log(projId);
	pdbconnect.query("Select project_curr from project_master_tbl where project_id=$1",[projId],function(err,result){
	var projCurr = result.rows[0].project_curr;
	var projCurrCnt=result.rowCount;
	
	pdbconnect.query("Select salary_curr from emp_master_tbl where emp_id=$1",[emp],function(err,result){
	var salCurr = result.rows[0].salary_curr;
	var salCurrCnt=result.rowCount;
		
	console.log(projCurr);
	console.log(salCurr);
	
	res.json({key:projCurr,key1:salCurr});	
	});
	});
}

////////////////////////////////////////////// End of Logic //////////////////////////////////
module.exports = router;
