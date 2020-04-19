var express = require('express');
var router = express.Router();
var pdbconnect = require('../../routes/database/psqldbconnect');
var app = express();
var moment=require('moment');
var nodemailer = require('nodemailer');
var proj = "";
router.post('/formSubmitOnProjectChange', formSubmitOnProjectChange);
var pid = "";
var pid_count = "";
var newError = "";

 
function formSubmitOnProjectChange(req, res) {
    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;

   // var id = req.query.id;
    var project_id = req.body.passedPid;
    var Manager_name="";
    var defProjectId="";
   console.log('project_id',project_id);
      

    console.log("emp_id", emp_id);
    console.log("emp_access", emp_access);
     var newArray = [];

  pdbconnect.query("SELECT project_id from project_master_tbl where closure_flg=$1", ['N'], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
            var pid = result2.rows;
            console.log("pid", pid);
            var pid_count = result2.rowCount;
            console.log("pid_count", pid_count);
        }
       pdbconnect.query("SELECT project_id from project_alloc_tbl where emp_id=$1 order by percentage_alloc desc", [emp_id], function(err, projectList) {
        if (err) {
            console.error('Error with table query', err);
        } else {
             
            console.log("projectList", projectList);
            if(projectList.rowCount!=0)
            {
             defProjectId = project_id;
            console.log("defProjectId", defProjectId);
            var pLst_count = projectList.rowCount;
            console.log("pLst_count", pLst_count);
           }
        }
        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where project_id=$1 and emp_id=$2)", [defProjectId,emp_id], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
           // var empName = result2.rows;
           if(result2.rowCount!=0)
            {
             Manager_name=result2.rows['0'].emp_name;
            console.log("Manager_name", Manager_name);
        }

        }

         // for Fetching the from location and to location
          pdbconnect.query("SELECT project_loc from project_master_tbl where project_id in ($1)", [defProjectId], function(err, locresult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            
            var project_loc=locresult.rows['0'].project_loc;
            console.log("project_loc", project_loc);
          }

         pdbconnect.query("SELECT start_date,end_date from project_master_tbl where project_id in ($1)", [defProjectId], function(err, locresult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            
            var start_date=locresult.rows['0'].start_date;
            var end_date=locresult.rows['0'].end_date;
            //var  resultList = locresult.rows;
            console.log("start_date", start_date);
            console.log("end_date", end_date);
          }
          pdbconnect.query("SELECT project_allocation_date,emp_project_relieving_date from project_alloc_tbl where project_id=$1 and emp_id=$2", [defProjectId,emp_id], function(err, locresult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            
            var project_allocation_date=locresult.rows['0'].project_allocation_date;
            var relieving_date=locresult.rows['0'].emp_project_relieving_date;
            var  resultList = locresult.rows;
            console.log("project_allocation_date", project_allocation_date);
            console.log("relieving_date", relieving_date);
          }
        //res.json({key:Manager_name,anotherkey:project_loc});
      
        
        //newArray.push(pLst);
        //newArray.push(pid);
        //var projectList = JSON.stringify(newArray);
       // console.log("projectList",projectList);
        //console.log("Values in to array",newArray);
           res.render('travelModule/travel', {

                emp_id: emp_id,
                emp_name: emp_name,
                emp_access: emp_access,
                //empName: empName,
                //projectList:projectList,
               // pLst:pLst,
               Manager_name:Manager_name,
                pid: pid,
                project_id:project_id,
                newArray:newArray,
                pid_count: pid_count,
                project_loc:project_loc,
                defProjectId:defProjectId,
                resultList:resultList,
                newError:newError
            });
            });
        });
       });
       });
     
    });
   });
};

router.get('/travel', travel);
var pid = "";
var pid_count = "";

 
function travel(req, res) {
    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;
	console.log("emp acces in gett::",emp_access);
if(emp_access=='L3'||emp_access=='L2')
{
console.log("emp acces in gett::if::",emp_access);
    var id = req.query.id;
    var project_id = req.query.project_id;
	  var Manager_name="";
    var defProjectId="";
	

      pdbconnect.query("SELECT project_id from project_alloc_tbl where emp_id=$1 order by percentage_alloc desc", [emp_id], function(err, projectList) {
        if (err) {
            console.error('Error with table query', err);
        } else {
             
            console.log("projectList", projectList);
            if(projectList.rowCount!=0)
            {
             projectListAlloc=projectList.rows 
             defProjectId = projectList.rows[0].project_id;
            console.log("defProjectId", defProjectId);
            var pLst_count = projectList.rowCount;
            console.log("pLst_count", pLst_count);
           }
        }
        if(projectList.rowCount==0)
        {
          res.render('travelModule/travelNotification', {
                emp_id: emp_id,
                emp_name: emp_name,
                emp_access: emp_access,
                newError:newError
               

          });

        }else
        {
    console.log('id',id);
    console.log('id',project_id);
    if(project_id!=null)
    {
    console.log('id length',project_id.length);
    }
     

    console.log("emp_id", emp_id);
    console.log("emp_access", emp_access);
     var newArray = [];
	 
    pdbconnect.query("SELECT project_id from project_master_tbl where closure_flg=$1", ['N'], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
            var pid = result2.rows;
            console.log("pid", pid);
            var pid_count = result2.rowCount;
            console.log("pid_count", pid_count);
        }
        var emp_id = req.user.rows[0].user_id;
        console.log("emp_id of the employee",emp_id);
       pdbconnect.query("SELECT project_id from project_alloc_tbl where emp_id=$1 order by percentage_alloc desc", [emp_id], function(err, projectList) {
        if (err) {
            console.error('Error with table query', err);
        } else {
             
            console.log("projectList", projectList);
            if(projectList.rowCount!=0)
            {
             projectListAlloc=projectList.rows 
             defProjectId = projectList.rows[0].project_id;
            console.log("defProjectId", defProjectId);
            var pLst_count = projectList.rowCount;
            console.log("pLst_count", pLst_count);
           }
        }
        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where project_id=$1 and emp_id=$2)", [defProjectId,emp_id], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
           // var empName = result2.rows;
           if(result2.rowCount!=0)
            {
             Manager_name=result2.rows['0'].emp_name;
            console.log("Manager_name", Manager_name);
        }

        }
         console.log("defProjectId",defProjectId);
         // for Fetching the from location and to location
          pdbconnect.query("SELECT project_loc from project_master_tbl where project_id in ($1)", [defProjectId], function(err, locresult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
             if (locresult.rowCount != 0){
            var project_loc=locresult.rows['0'].project_loc;
            console.log("project_loc", project_loc);
			 }else{
				 project_loc='';
			 }
          }

          pdbconnect.query("SELECT project_allocation_date,emp_project_relieving_date from project_alloc_tbl where project_id=$1 and emp_id=$2", [defProjectId,emp_id], function(err, locresult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            
            var project_allocation_date=locresult.rows['0'].project_allocation_date;
            var relieving_date=locresult.rows['0'].emp_project_relieving_date;
            var  resultList = locresult.rows;
            console.log("project_allocation_date", project_allocation_date);
            console.log("relieving_date", relieving_date);
          }
        //res.json({key:Manager_name,anotherkey:project_loc});
      
        
        //newArray.push(pLst);
        //newArray.push(pid);
        //var projectList = JSON.stringify(newArray);
       // console.log("projectList",projectList);
        //console.log("Values in to array",newArray);
           res.render('travelModule/travel', {

                emp_id: emp_id,
                emp_name: emp_name,
                emp_access: emp_access,
                empName: empName,
                //projectList:projectList,
               // pLst:pLst,
               projectListAlloc:projectListAlloc,
               Manager_name:Manager_name,
                pid: pid,
                project_id:project_id,
                newArray:newArray,
                pid_count: pid_count,
                project_loc:project_loc,
                defProjectId:defProjectId,
                resultList:resultList,
                newError:newError
            });
            });
        });
       });
       
     });
    });
}
   });
}
else if(emp_access=='L1')
{
	console.log("emp acces in gett::else if::",emp_access);
 pdbconnect.query("SELECT project_id from project_master_tbl where closure_flg=$1", ['N'], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
            var pid = result2.rows;
            console.log("pid", pid);
            var pid_count = result2.rowCount;
            console.log("pid_count", pid_count);
        }


 res.render('travelModule/travelOHDetails', {

                emp_id: emp_id,
                emp_name: emp_name,
                emp_access: emp_access,
                empName: empName,
                pid: pid,
                project_id:project_id,
                pid_count: pid_count,
                
            });
            
        });
}else{
	console.log("emp acces in gett::else",emp_access);
	res.redirect('/admin-dashboard/adminDashboard/admindashboard');
}
}

router.post('/fetchMgrName',fetchMgrName);

var empName="";
function fetchMgrName(req,res)
{

var emp_id=req.body.empId;
var project_id=req.body.projectId;

 pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where project_id=$1 and emp_id=$2)", [project_id,emp_id], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
           // var empName = result2.rows;
             
              var count = result2.rowCount;
              if(count!=0)
              {
              empName=result2.rows['0'].emp_name;
              }
              else
              {
                empName="";
              }
            console.log("empName", empName);

        }
      // for Fetching the from location and to location
          pdbconnect.query("SELECT project_loc from project_master_tbl where project_id in ($1)", [project_id], function(err, locresult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
              if (locresult.rowCount != 0){
            var project_loc=locresult.rows['0'].project_loc;
            console.log("project_loc", project_loc);
			  }else{
				  project_loc='';
			  }
          }
          

        
           pdbconnect.query("SELECT project_allocation_date,emp_project_relieving_date from project_alloc_tbl where project_id=$1 and emp_id=$2", [project_id,emp_id], function(err, locresult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            
            //var project_allocation_date=locresult.rows['0'].project_allocation_date;
            //var relieving_date=locresult.rows['0'].emp_project_relieving_date;
            var  result = locresult.rows;
            //console.log("project_allocation_date", project_allocation_date);
            //console.log("relieving_date", relieving_date);
          }

        res.json({key:empName,anotherkey:project_loc,key1:result}); 
        });
   
        });
       });
};

router.post('/travelReq', travelReq);
var req_id = "";
var emp_id = "";
var from_date = "";
// var empName  ="";
 var success ="";
 var error ="";
  var approverid ="";
  var rcount ="";
  var code1="";
   var finMgr_email="";
  
 function travelReq(req, res) {
	 var test = req.body.test;
     var test1 = req.body.test1;
	  var test2 = req.body.test2;
	   var test3 = req.body.test3;
	    var test4 = req.body.test4;
		 var test5 = req.body.test5;
		  var pnr_number="";
 var ticket_number="";
 var free_text_1="";
 var hr_remarks="";
    console.log("test1::::",test1);

   if (test == "Submit") {
        var travelDate = req.body.travelDate;
        var tenDate = req.body.tenDate;
		 var emp_id = req.user.rows[0].user_id;
        var empname = req.user.rows[0].user_name;
        var empaccess = req.user.rows[0].user_type;
        var now = new Date();
        var rcreuserid = emp_id;
        var rcretime = now;
        var lchguserid = emp_id;
        var lchgtime = now;
       
        var pid = req.body.pid;
        var travelDate = req.body.travelDate;
        var tenDate = req.body.tenDate;
        var fromLoc = req.body.fromLoc;
        var toLoc = req.body.toLoc;
        var rmks = req.body.rmks;
        var free_text_1=req.body.free_text_1;
        var emp_access = req.user.rows[0].user_type;
        var emp_Name=empName;
		var val_from_date="";
		var val_from_location="";
		var valFlag="";
		var masterTblFlag="";
		var checkFlag="";
		 var success = "";
        console.log('emp_Name::emp_access', emp_access);
        console.log('emp_id', emp_id.length);
        console.log('travelDate', travelDate);
        console.log('pid', pid);
		
		pdbconnect.query("SELECT * from travel_master_tbl_temp where emp_id=$1 and project_id=$2 and del_flg=$3", [emp_id,pid,'N'], function(err, valDateLoc) {
        if (err) {
            console.error('Error with table query', err);
        } else {
			console.log("valDateLoc.rowCount::",valDateLoc.rowCount);
           // console.log("result::", valDateLoc);
		}
		
		pdbconnect.query("SELECT * from travel_master_tbl where emp_id=$1 and project_id=$2 and del_flg=$3 and request_status not in($4,$5,$6,$7,$8,$9)", [emp_id,pid,'N','CAN','RJF','RJD','RJM','CPF','CAF'], function(err, masterTblcheck) {
        if (err) {
            console.error('Error with table query', err);
        } else {
			console.log("masterTblcheck.rowCount::",masterTblcheck.rowCount);
           // console.log("result:masterTblcheck:::", masterTblcheck);
		}
		if (valDateLoc.rowCount != 0||masterTblcheck.rowCount != 0){
			   console.log(":either of  rowcount !==0::::::"); 
		 if (valDateLoc.rowCount != 0){
			     console.log(":if valDateLoc.rowCount !==0::::::"); 
			   for (i=0 ; i<valDateLoc.rowCount; i++){
				   
			   console.log("inside valDateLoc validation for loop:::");
		    val_from_date=valDateLoc.rows[i].from_date;
            console.log("from_date", val_from_date);
             val_from_location=valDateLoc.rows[i].from_location;
			 
            console.log("from_location ::val_from_location:", val_from_location);
			 var duration = moment.duration(moment(travelDate).diff(moment(val_from_date)));
			    var days = duration.asDays();
				console.log("days ::val_from_location:", days);
			//	if ( travelDate == val_from_date && fromLoc ==  val_from_location){
						 if(days==0 && fromLoc ==  val_from_location){
						 console.log("***********INSIDE VAL IF*************");
						req.flash('error',"Travel request  with  same travel date for the same location has been raised already");
						 error = "Travel request  with the same travel date for the same location has been raised already.";
				           valFlag=true;
						   
						 }
						else{
							valFlag=false; 
							 if (masterTblcheck.rowCount == 0){
								 masterTblFlag=false; 
							 }
						 }
						 console.log("11111111::valFlag:::",valFlag);
						 if (valFlag == true){
							 console.log("::::@@@@@@@@:::");
							 break;
						 }
			     }						 
			   } 
			   if (masterTblcheck.rowCount != 0){
			     console.log(":if masterTblcheck.rowCount !==0::::::"); 
			   for (i=0 ; i<masterTblcheck.rowCount; i++){
				   
			   console.log("inside masterTblcheck validation for loop:::");
		    val_from_date=masterTblcheck.rows[i].from_date;
            console.log("from_date::masterTblcheck::", val_from_date);
             val_from_location=masterTblcheck.rows[i].from_location;
			 
            console.log("from_location ::masterTblcheck:", val_from_location);
			 var duration1 = moment.duration(moment(travelDate).diff(moment(val_from_date)));
			    var days1 = duration1.asDays();
				console.log("days ::masterTblcheck:", days);
			//	if ( travelDate == val_from_date && fromLoc ==  val_from_location){
						 if(days1<=0 && fromLoc ==  val_from_location){
						 console.log("***********INSIDE masterTblcheck IF*************");
						req.flash('error',"Travel request  with  same travel date for the same location has been raised already");
						 error = "Travel request  with the same travel date for the same location has been raised already.";
				     masterTblFlag=true;
						 }
						 else{
							masterTblFlag=false; 
							if (valDateLoc.rowCount == 0){
								valFlag=false; 
							}
						 }	
						 console.log("11111111::masterTblFlag:::",masterTblFlag);
						  if (masterTblFlag == true){
							 console.log("::::@@@@masterTblFlag@@@@:::");
							 break;
						 }
						  }
			}	console.log("22222222::valFlag:::",valFlag);
				console.log("22222222::masterTblFlag:::",masterTblFlag);
			   if(valFlag == true && masterTblFlag == true) 
			    {
				  checkFlag=true; 
			    }
				 if(valFlag == true && masterTblFlag == false)
				   {
					   checkFlag=true;
				   }
			   if(valFlag == false && masterTblFlag == true) {
				   checkFlag=true;
				    console.log("inside flag if condition check OR::::",checkFlag);
			   }
			   if(valFlag == false && masterTblFlag == false){
				   
				   checkFlag=false;
				    console.log("inside flag else condition check::::",checkFlag);
			    }
			    }
				if (valDateLoc.rowCount == 0 && masterTblcheck.rowCount == 0){
					checkFlag=false;
				}
				console.log("11111111::checkFlag:::",checkFlag);
			if(checkFlag == true){	  
    console.log("checkFlag::::truetruetruetrue");
    if(project_id!=null)
    {
    console.log('id length',project_id.length);
    }
     
	 var emp_access = req.user.rows[0].user_type;
    console.log("emp_id", emp_id);
    console.log("emp_access", emp_access);
     var newArray = [];
	 
    pdbconnect.query("SELECT project_id from project_master_tbl where closure_flg=$1", ['N'], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
            var pid = result2.rows;
            console.log("pid", pid);
            var pid_count = result2.rowCount;
            console.log("pid_count", pid_count);
        }
        var emp_id = req.user.rows[0].user_id;
        console.log("emp_id of the employee",emp_id);
       pdbconnect.query("SELECT project_id from project_alloc_tbl where emp_id=$1 order by percentage_alloc desc", [emp_id], function(err, projectList) {
        if (err) {
            console.error('Error with table query', err);
        } else {
             
            console.log("projectList", projectList);
            if(projectList.rowCount!=0)
            {
             projectListAlloc=projectList.rows 
             defProjectId = projectList.rows[0].project_id;
            console.log("defProjectId", defProjectId);
            var pLst_count = projectList.rowCount;
            console.log("pLst_count", pLst_count);
           }
        }
        pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where project_id=$1 and emp_id=$2)", [defProjectId,emp_id], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
           // var empName = result2.rows;
           if(result2.rowCount!=0)
            {
             Manager_name=result2.rows['0'].emp_name;
            console.log("Manager_name", Manager_name);
        }

        }
         console.log("defProjectId",defProjectId);
         // for Fetching the from location and to location
          pdbconnect.query("SELECT project_loc from project_master_tbl where project_id in ($1)", [defProjectId], function(err, locresult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            
            var project_loc=locresult.rows['0'].project_loc;
            console.log("project_loc", project_loc);
          }

         pdbconnect.query("SELECT start_date,end_date from project_master_tbl where project_id in ($1)", [defProjectId], function(err, locresult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            
            var start_date=locresult.rows['0'].start_date;
            var end_date=locresult.rows['0'].end_date;
            //var  resultList = locresult.rows;
            console.log("start_date", start_date);
            console.log("end_date", end_date);
          }
          pdbconnect.query("SELECT project_allocation_date,emp_project_relieving_date from project_alloc_tbl where project_id=$1 and emp_id=$2", [defProjectId,emp_id], function(err, locresult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            
            var project_allocation_date=locresult.rows['0'].project_allocation_date;
            var relieving_date=locresult.rows['0'].emp_project_relieving_date;
            var  resultList = locresult.rows;
            console.log("project_allocation_date", project_allocation_date);
            console.log("relieving_date", relieving_date);
          }
        //res.json({key:Manager_name,anotherkey:project_loc});
      
        
        //newArray.push(pLst);
        //newArray.push(pid);
        //var projectList = JSON.stringify(newArray);
       // console.log("projectList",projectList);
        //console.log("Values in to array",newArray);
           res.render('travelModule/travel', {

                emp_id: emp_id,
                emp_name: empname,
                emp_access: emp_access,
                empName: empName,
                //projectList:projectList,
               // pLst:pLst,
               projectListAlloc:projectListAlloc,
               Manager_name:Manager_name,
                pid: pid,
                project_id:project_id,
                newArray:newArray,
                pid_count: pid_count,
                project_loc:project_loc,
                defProjectId:defProjectId,
                resultList:resultList,
                error:error,
                newError:newError
				
            });
            });
        });
       });
       });
     });
	   
    });
		}
		else if(checkFlag == false){
			
			console.log("checkFlag::::falsefalsefalsefalsefalse");
		pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id,pid], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
           // var empName = result2.rows;
		    empName=result2.rows['0'].emp_name;
            console.log("empName", empName);
             approverid=result2.rows['0'].emp_id;
            console.log("approverid ::HII:", approverid);

        }

          

            pdbconnect.query("SELECT * from travel_master_tbl_temp", function(err, resultset) {
                if (err) throw err;
                 rcount = resultset.rowCount;
                console.log("rcount", rcount);
               var seq = "travelreq";

               
                        pdbconnect.query("select nextval($1)::text code1",[seq],function(err,result){
                           if(err) throw err;
                           code1 = result.rows['0'].code1; 
                           console.log("select done");
                           console.log("code1",code1);
    

                           console.log("code1",code1);
                           req_id = code1;
   
                
                          
                    
                        

                    console.log("req_id after generating", req_id);
                    console.log("approverid after generating", approverid);
                    console.log("tenDate",tenDate);
                    console.log("tenDate.length",tenDate.length);
                    //tenDate=tenDate.toString();
                    console.log("tenDate.length",tenDate.length);
                   
                    if(tenDate.length!= "0")
                    {
                          console.log("tenDate",tenDate);
                    pdbconnect.query("INSERT INTO travel_master_tbl_temp(req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,modify_flg,request_status) values($1,$2,$3,$4,$5,$6,$7,upper($8),upper($9),upper($10),$11,$12,$13,$14,$15,$16,$17,$18)", [req_id, emp_id, empname, empaccess, pid, travelDate, tenDate, fromLoc, toLoc, rmks, approverid, 'N', rcreuserid, rcretime, lchguserid, lchgtime,'N','SUB'], function(err, done) {
                        if (err) throw err;
                     //  req.flash('success',"Travel request has been submitted successfully with Request Id:"+ req_id +".");
                        // res.redirect('/travelModule/travelCyber');
                        //res.redirect(req.get('referer'));
                        //  res.redirect('/travelModule/travel/travel');
                            
					   pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl_temp where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
						 success = "Travel request has been initiated successfully with Request Id:" + req_id + ".";
                                req.flash('success',"Travel request has been initiated Successfully with request_id:"+ req_id +".") ; 

                    console.log("emp_id",emp_id);
                      console.log("req_id inside loop1",req_id);
                        pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number from travel_master_tbl_temp where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                            if (err) throw err;
                            //var emp_id=resultValue.rows;  
                            var rcount = resultValue.rowCount;
                            console.log("Inside count",rcount);
                            //console.log("emp_id",emp_id);

                            var emp_id = resultValue.rows['0'].emp_id;
                            var emp_name = resultValue.rows['0'].emp_name;
                            var emp_access = resultValue.rows['0'].emp_access;
                            var project_id = resultValue.rows['0'].project_id;
                            var from_date = resultValue.rows['0'].from_date;
                            var to_date = resultValue.rows['0'].to_date;
                            var from_location = resultValue.rows['0'].from_location;
                            var to_location = resultValue.rows['0'].to_location;
                            var remarks = resultValue.rows['0'].remarks;
							var pnr_number = resultValue.rows['0'].pnr_number;
							var free_text_1 = resultValue.rows['0'].free_text_1;
							var ticket_number = resultValue.rows['0'].ticket_number;
                           
                              pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id,pid], function(err, result) {
                                if (err) {
                                    console.error('Error with table query1', err);
                                } else {
                                 //   var empName = result.rows['0'].emp_name;
										  empName=result.rows['0'].emp_name;
									console.log("empName", empName);
								   approverid=result.rows['0'].emp_id;
                                    console.log('hii APPVER', approverid);
                                }
                                
                          
                              //  from_date = from_date.toDateString();
                              //  to_date = to_date.toDateString();
								
								  pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl_temp where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
									 console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
                                            var mailOptions = {
                                                to: approver_email,
                                                
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                 text: 'Travel Request ' + req_id + ' has been raised for your approval with' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').\n' + '.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
												
                                res.render('travelModule/travelCyber', {

                                    emp_id: emp_id,
                                    emp_name: empname,
                                    empName: empName,
                                    project_id: project_id,
                                    emp_access: emp_access,
                                    from_date: from_date,
                                    to_date: to_date,
                                    from_location: from_location,
                                    to_location: to_location,
                                    remarks: remarks,
                                    success: success,
									approverid:approverid,
									pnr_number:pnr_number,
									free_text_1:free_text_1,
                                    ticket_number:ticket_number,
                                    newError:newError
                                });

                            });
                          });
					   });
                            });
                                 });
								 }
                     
                         

                
                 console.log("req_id",req_id);
                  
                    if(tenDate.length== "0")
                    {
                          console.log("inside else tenDate",tenDate);
                              pdbconnect.query("INSERT INTO travel_master_tbl_temp(req_id,emp_id,emp_name,emp_access,project_id,from_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,modify_flg,request_status) values($1,$2,$3,$4,$5,$6,$7,upper($8),upper($9),upper($10),$11,$12,$13,$14,$15,$16,$17)", [req_id, emp_id, empname, empaccess, pid, travelDate, fromLoc, toLoc, rmks, approverid, 'N', rcreuserid, rcretime, lchguserid, lchgtime,'N','SUB'], function(err, done) {
                        if (err) throw err;
                        else {
                                    
                                }
                        //req.flash('success',"Travel request has been rised Successfully with request_id:"+ req_id +".");
                        // res.redirect('/travelModule/travelCyber');
                        //res.redirect(req.get('referer'));
                        //  res.redirect('/travelModule/travel/travel');
								   pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl_temp where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
                    
                      console.log("emp_id",emp_id);
                      console.log("req_id",req_id);
                        pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number from travel_master_tbl_temp where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                            if (err) throw err;
                            //var emp_id=resultValue.rows;
                            var rcount = resultValue.rowCount;
                            console.log("Inside count",rcount);
                            //console.log("emp_id",emp_id);
                     
            
                            var emp_id = resultValue.rows['0'].emp_id;
                            var emp_name = resultValue.rows['0'].emp_name;
                            var emp_access = resultValue.rows['0'].emp_access;
                            var project_id = resultValue.rows['0'].project_id;
                            var from_date = resultValue.rows['0'].from_date;
                            var to_date = resultValue.rows['0'].to_date;
                            var from_location = resultValue.rows['0'].from_location;
                            var to_location = resultValue.rows['0'].to_location;
                            var remarks = resultValue.rows['0'].remarks;
								var pnr_number = resultValue.rows['0'].pnr_number;
							var free_text_1 = resultValue.rows['0'].free_text_1;
							var ticket_number = resultValue.rows['0'].ticket_number;
                           
                              pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id,pid], function(err, result) {
                                if (err) {
                                    console.error('Error with table query1', err);
                                } else {
									empName=result.rows['0'].emp_name;
									console.log("empName", empName);
                                     approverid = result.rows['0'].emp_id;
                                    console.log('hii', approverid);
                                }
                                 success = "Travel request has been initiated successfully with Request Id:" + req_id + ".";
                                req.flash('success',"Travel request has been initiated Successfully with request_id:"+ req_id +".") ; 
                          
                               // from_date = from_date.toDateString();
                                 
                                     pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl_temp where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
									 console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
                                            var mailOptions = {
                                                to: approver_email,
                                                
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been raised for your approval with' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').\n' + '.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
                                             // from_date= from_date.toDateString();
											   //to_date= to_date.toDateString();
                                res.render('travelModule/travelCyber', {

                                    emp_id: emp_id,
                                    emp_name: empname,
				                    approverid:approverid,
                                    empName: empName,
                                    project_id: project_id,
                                    emp_access: emp_access,
                                    from_date: from_date,
                                    to_date:to_date,
                                    from_location: from_location,
                                    to_location: to_location,
                                    remarks: remarks,
                                    success: success,
									pnr_number:pnr_number,
									free_text_1:free_text_1,
                                    ticket_number:ticket_number,
                                    newError:newError
                                });
                                           }); 
                                });

								   });});
                            });

                        };
                        });
                            });
                        
                         });
	
	
		}
		
			});
                        
                         });
			
   }
if (test1 == "Submit") {
     console.log("Inside test1::::test1::::::::",test1);
     var travelDate = req.body.travelDate;
     var tenDate = req.body.tenDate;
	 var fromLoc = req.body.from_location;
	 var toLoc = req.body.to_location;
	 var remarks = req.body.remarks;
     var now = new Date();
	  var emp_id = req.user.rows[0].user_id;
     var rcreuserid = emp_id;
     var rcretime = now;
     var lchguserid = emp_id;
     var lchgtime = now;
     var req_id = req.body.req_id;
	 var success = "";
    
      var free_text_1=req.body.free_text_1;
        var empname = req.user.rows[0].user_name;
        var empaccess = req.user.rows[0].user_type;
        var pid = req.body.projectId;
     console.log('emp_id', emp_id);
     console.log('pid', pid);
     console.log('travelDate', travelDate);
     
                 console.log("req_id after generating", req_id);
                 //console.log("approverid after generating", approverid);
                 console.log("tenDate", tenDate);
                 //console.log("tenDate.length", tenDate.length);
                 if (tenDate != undefined) {
                     console.log("tenDate", tenDate);
                     pdbconnect.query("Update travel_master_tbl set from_date=$1,to_date=$2,request_status=$3,lchg_user_id=$4,lchg_time=$5,modify_flg=$6, from_location=upper($7), to_location=upper($8), remarks=upper($9) where req_id=$10", [travelDate, tenDate, 'MOD', lchguserid, lchgtime,'Y',fromLoc,toLoc,remarks,req_id], function(err, done) {
                         if (err) throw err;
                        
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
                     


						 success = "Travel request has been modified successfully with Request Id:" + req_id + ".";
                         req.flash('success', "Travel request has been modified successfully with Request Id:" + req_id + ".");
                         console.log("emp_id", emp_id);
                         console.log("req_id inside loop1", req_id);
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number,hr_remarks from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;  
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                             var emp_id = resultValue.rows['0'].emp_id;
                             var emp_name = resultValue.rows['0'].emp_name;
                             var emp_access = resultValue.rows['0'].emp_access;
                             var project_id = resultValue.rows['0' ].project_id;
                             var from_date = resultValue.rows['0'].from_date;
                             var to_date = resultValue.rows['0'].to_date;
                             var from_location = resultValue.rows['0'].from_location;
                             var to_location = resultValue.rows['0'].to_location;
                             var remarks = resultValue.rows['0'].remarks;
                             var approverid = resultValue.rows['0'].approver_id;
							 	var pnr_number = resultValue.rows['0'].pnr_number;
							var free_text_1 = resultValue.rows['0'].free_text_1;
							var ticket_number = resultValue.rows['0'].ticket_number;
                             var hr_remarks = resultValue.rows['0'].hr_remarks;
                                
                                 //from_date = from_date.toDateString();
                                // to_date = to_date.toDateString();
								 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1)", ['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                finMgr_name = empResult.rows['0'].emp_name;
                                                finMgr_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', finMgr_name);
                                                console.log('manager id ', finMgr_email);
                                            }
									 console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
                                            var mailOptions = {
                                                to: finMgr_email,
                                                
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been modified with' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').Kindly approve the same\n' + '.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
                                 res.render('travelModule/travelCyber', {
                                     emp_id: emp_id,
                                     emp_name: empname,
                                     empName: empName,
                                     project_id: project_id,
                                     emp_access: emp_access,
                                     from_date: from_date,
                                     to_date: to_date,
                                     from_location: from_location,
                                     to_location: to_location,
                                     remarks: remarks,
                                     success: success,
                                     approverid: approverid,
									 pnr_number:pnr_number,
									free_text_1:free_text_1,
                                    ticket_number:ticket_number,
                                    newError:newError,
									hr_remarks:hr_remarks
                                 });
                               });
                             });
                         });
                             
					 });
                        
                 }
                 console.log("req_id", req_id);
                 if (tenDate == undefined) {
                     console.log("inside else tenDate", tenDate);
                     console.log("inside else travelDate", travelDate);

                     //travelDate=new Date()
                   //travelDate= moment(travelDate).format('YYYY-MM-DD');
                       
                     console.log("inside else after formatting travelDate", travelDate);
                     pdbconnect.query("Update travel_master_tbl set from_date=$1,request_status=$2,lchg_user_id=$3,lchg_time=$4,modify_flg=$5, from_location=upper($6), to_location=upper($7), remarks=upper($8) where req_id=$9", [travelDate, 'MOD', lchguserid, lchgtime,'Y',fromLoc,toLoc,remarks,req_id], function(err, done) {
                         if (err) throw err;
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist")
                         }
                              
    
                         console.log("emp_id", emp_id);
                         console.log("req_id", req_id);
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number,hr_remarks from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                             var emp_id = resultValue.rows['0'].emp_id;
                             var emp_name = resultValue.rows['0'].emp_name;
                             var emp_access = resultValue.rows['0'].emp_access;
                             var project_id = resultValue.rows['0'].project_id;
                             var from_date = resultValue.rows['0'].from_date;
                             var to_date = resultValue.rows['0'].to_date;
                             var from_location = resultValue.rows['0'].from_location;
                             var to_location = resultValue.rows['0'].to_location;
                             var remarks = resultValue.rows['0'].remarks;
                             var approverid = resultValue.rows['0'].approver_id;
							 var pnr_number = resultValue.rows['0'].pnr_number;
							var free_text_1 = resultValue.rows['0'].free_text_1;
							var ticket_number = resultValue.rows['0'].ticket_number;
							var hr_remarks = resultValue.rows['0'].hr_remarks;
                             
                                  success = "Travel request has been modified successfully with Request Id:" + req_id + ".";
                                 req.flash('success',"Travel request has been modified Successfully with request_id:"+ req_id +".") ; 
                                // from_date = from_date.toDateString();
								 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1)", ['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                finMgr_name = empResult.rows['0'].emp_name;
                                                finMgr_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', finMgr_name);
                                                console.log('manager id ', finMgr_email);
                                            }
									 console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
                                            var mailOptions = {
                                                to: finMgr_email,
                                                
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been modified with' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').Kindly approve the same\n' + '.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
                                 res.render('travelModule/travelCyber', {
                                     emp_id: emp_id,
                                     emp_name: empname,
                                     approverid: approverid,
                                     empName: empName,
                                     project_id: project_id,
                                     emp_access: emp_access,
                                     from_date: from_date,
                                     to_date: to_date,
                                     from_location: from_location,
                                     to_location: to_location,
                                     remarks: remarks,
                                     success: success,
									 pnr_number:pnr_number,
									free_text_1:free_text_1,
                                    ticket_number:ticket_number,
                                    newError:newError,
									hr_remarks:hr_remarks
                                 });
                               });
                           });
                       });
					 });      

                 };
                        
                            
 
               }
			   if (test1 == "Submit for Cancellation") {
     console.log("Inside test1::::test1::::::::",test1);
     var travelDate = req.body.travelDate;
     var tenDate = req.body.tenDate;
	 var fromLoc = req.body.from_location;
	 var toLoc = req.body.to_location;
	 var remarks = req.body.remarks;
     var now = new Date();
	 var emp_id = req.user.rows[0].user_id;
     var rcreuserid = emp_id;
     var rcretime = now;
     var lchguserid = emp_id;
     var lchgtime = now;
     var req_id = req.body.req_id;
	 var to_date="";
	 var maxCount="";
				var from_date="";
				var from_location="";
				var to_location="";
				var success="";
     
      var free_text_1=req.body.free_text_1;
        var empname = req.user.rows[0].user_name;
        var empaccess = req.user.rows[0].user_type;
        var pid = req.body.projectId;
     console.log('emp_id', emp_id);
     console.log('pid', pid);
     console.log('travelDate', travelDate);
     
                 console.log("req_id after generating", req_id);
                 //console.log("approverid after generating", approverid);
                 console.log("tenDate", tenDate);
                 //console.log("tenDate.length", tenDate.length);
                 if (tenDate != undefined) {
                     console.log("tenDate", tenDate);
                     pdbconnect.query("Update travel_master_tbl set request_status=$1,lchg_user_id=$2,lchg_time=$3,modify_flg=$4, remarks=upper($5) where req_id=$6", [ 'CAN', lchguserid, lchgtime,'Y',remarks,req_id], function(err, done) {
                         if (err) throw err;
                        
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
                     


						success = "Travel request has been cancelled with Request Id:" + req_id + ".";
                         req.flash('success', "Travel request has been cancelled with Request Id:" + req_id + ".");
                         console.log("emp_id", emp_id);
                         console.log("req_id inside loop1", req_id);
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;  
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                            
                                  
                               //  from_date = from_date.toDateString();
                                // to_date = to_date.toDateString();
								var travelStatus =req.body.travelStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var paramString = "";
    console.log("inside viewTravelReqApplyStatus emp_id ::  ",emp_id);
    console.log("viewTravelReqApplyStatus travelStatus ::  ",travelStatus);


    if(travelStatus == null || travelStatus=="All"){
        queryStringTemp= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id];
    }
    else{
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id,travelStatus];
    }
    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('Error with table query', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("travelReqList :: ",travelReqList);
        }
        var recordCount="";
        recordCount=trvReqTempResult.rowCount;
        console.log('temp recordCount ::: ',recordCount);

        pdbconnect.query(queryStringMain,paramString, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('Error with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("travelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    console.log('recordCount ::: ',recordCountMain);
        var totalRecordCount= recordCountMain+recordCount;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TST' order by comm_code_id asc",function(err,result){
            cocd_travelStatus=result.rows;
            cocd_travelStatus_count=result.rowCount;

            
            console.log('cocd_travelStatus_count ::: ',cocd_travelStatus_count);  
 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1", ['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                finMgr_name = empResult.rows['0'].emp_name;
                                                finMgr_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', finMgr_name);
                                                console.log('manager id ', finMgr_email);
                                            }
									 console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
                                            var mailOptions = {
                                                to: finMgr_email,
                                                
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been cancelled with' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').Kindly approve the same\n' + '.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});

        res.render('travelModule/viewTravelReq',{
            
            cocd_travelStatus:cocd_travelStatus,
            cocd_travelStatus_count:cocd_travelStatus_count,
            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,

            emp_id:emp_id,
            emp_name:empname,
            req_id:req_id,
            emp_access:emp_access,
            project_id:project_id,
            approver_id:approver_id,
            from_date:from_date,
            to_date:to_date,
            from_location:from_location,
            to_location:to_location,
            request_status:request_status,
            remarks:remarks,
            free_text_1:free_text_1,
            free_text_2:free_text_2,
            free_text_3:free_text_3,
            recordCount:recordCount,
            recordCountMain:recordCountMain,
            travelStatus:travelStatus,
            totalRecordCount:totalRecordCount,
			success:success
        });
    });
    });
	});});
					 });
					 });
					 });   
                   
                        
                 }
                 console.log("req_id", req_id);
                 if (tenDate == undefined) {
                     console.log("inside else tenDate", tenDate);
                     console.log("inside else travelDate", travelDate);

                     //travelDate=new Date()
                   //travelDate= moment(travelDate).format('YYYY-MM-DD');
                       
                     console.log("inside else after formatting travelDate", travelDate);
                     pdbconnect.query("Update travel_master_tbl set request_status=$1,lchg_user_id=$2,lchg_time=$3,modify_flg=$4,  remarks=upper($5) where req_id=$6", [ 'CAN', lchguserid, lchgtime,'Y',remarks,req_id], function(err, done) {
                         if (err) throw err;
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist")
                         }
                              
    
                         console.log("emp_id", emp_id);
                         console.log("req_id", req_id);
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                           
                             
                                  success = "Travel request has been cancelled with Request Id:" + req_id + ".";
                                 req.flash('success',"Travel request has been cancelled with request_id:"+ req_id +".") ; 
                                //from_date = from_date.toDateString();
								var travelStatus =req.body.travelStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var paramString = "";
    console.log("inside viewTravelReqApplyStatus emp_id ::  ",emp_id);
    console.log("viewTravelReqApplyStatus travelStatus ::  ",travelStatus);


    if(travelStatus == null || travelStatus=="All"){
        queryStringTemp= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id];
    }
    else{
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id,travelStatus];
    }
    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('Error with table query', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("travelReqList :: ",travelReqList);
        }
        var recordCount="";
        recordCount=trvReqTempResult.rowCount;
        console.log('temp recordCount ::: ',recordCount);

        pdbconnect.query(queryStringMain,paramString, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('Error with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("travelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    console.log('recordCount ::: ',recordCountMain);
        var totalRecordCount= recordCountMain+recordCount;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TST' order by comm_code_id asc",function(err,result){
            cocd_travelStatus=result.rows;
            cocd_travelStatus_count=result.rowCount;

            
            console.log('cocd_travelStatus_count ::: ',cocd_travelStatus_count);  
 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1", ['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                finMgr_name = empResult.rows['0'].emp_name;
                                                finMgr_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', finMgr_name);
                                                console.log('manager id ', finMgr_email);
                                            }
									 console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
                                            var mailOptions = {
                                                to: finMgr_email,
                                                
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been cancelled with' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').Kindly approve the same\n' + '.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});

        res.render('travelModule/viewTravelReq',{
            
            cocd_travelStatus:cocd_travelStatus,
            cocd_travelStatus_count:cocd_travelStatus_count,
            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,

            emp_id:emp_id,
            emp_name:empname,
            req_id:req_id,
            emp_access:emp_access,
            project_id:project_id,
            approver_id:approver_id,
            from_date:from_date,
            to_date:to_date,
            from_location:from_location,
            to_location:to_location,
            request_status:request_status,
            remarks:remarks,
            free_text_1:free_text_1,
            free_text_2:free_text_2,
            free_text_3:free_text_3,
            recordCount:recordCount,
            recordCountMain:recordCountMain,
            travelStatus:travelStatus,
            totalRecordCount:totalRecordCount,
			success:success
        });
		});});
    });
});
                             
					 });});});
                 };
                        
                            
 
               }
 if (test2 == "Submit") {
     console.log("Inside test2::::test2",test2);
     var travelDate = req.body.travelDate;
     var tenDate = req.body.tenDate;
	 var fromLoc = req.body.from_location;
	 var toLoc = req.body.to_location;
	 var remarks = req.body.remarks;
     var now = new Date();
	  var emp_id = req.user.rows[0].user_id;
     var rcreuserid = emp_id;
     var rcretime = now;
     var lchguserid = emp_id;
     var lchgtime = now;
     var req_id = req.body.req_id;
	 var success="";
    
        var empname = req.user.rows[0].user_name;
        var empaccess = req.user.rows[0].user_type;
        var pid = req.body.projectId;
     console.log('emp_id', emp_id);
     console.log('pid', pid);
     console.log('travelDate', travelDate);
     
                 console.log("req_id after generating", req_id);
                 //console.log("approverid after generating", approverid);
                 console.log("tenDate", tenDate);
                 //console.log("tenDate.length", tenDate.length);
                 if (tenDate != undefined) {
                     console.log("tenDate", tenDate);
                     pdbconnect.query("Update travel_master_tbl set from_date=$1,to_date=$2,request_status=$3,lchg_user_id=$4,lchg_time=$5,modify_flg=$6, from_location=upper($7), to_location=upper($8), remarks=upper($9) where req_id=$10", [travelDate, tenDate, 'MOD', lchguserid, lchgtime,'Y',fromLoc,toLoc,remarks,req_id], function(err, done) {
                         if (err) 
                         {
                                 throw err;
                         }else
                         {
                           console.log("updated in the travel_master_tbl")
                         }
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist")
                         }
                     
							  success = "Travel request has been modified successfully with Request Id:" + req_id + "and forwarded for further approval.";
                         req.flash('success', "Travel request has been modified successfully with Request Id:" + req_id + "and forwarded for further approval.");
                         console.log("emp_id", emp_id);
                         console.log("req_id inside loop1", req_id);
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number,hr_remarks from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;  
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                             var emp_id = resultValue.rows['0'].emp_id;
                             var emp_name = resultValue.rows['0'].emp_name;
                             var emp_access = resultValue.rows['0'].emp_access;
                             var project_id = resultValue.rows['0' ].project_id;
                             var from_date = resultValue.rows['0'].from_date;
                             var to_date = resultValue.rows['0'].to_date;
                             var from_location = resultValue.rows['0'].from_location;
                             var to_location = resultValue.rows['0'].to_location;
                             var remarks = resultValue.rows['0'].remarks;
                             var approverid = resultValue.rows['0'].approver_id;
							  var pnr_number = resultValue.rows['0'].pnr_number;
							var free_text_1 = resultValue.rows['0'].free_text_1;
							var ticket_number = resultValue.rows['0'].ticket_number;
                             var hr_remarks = resultValue.rows['0'].hr_remarks;
                                
                                 //from_date = from_date.toDateString();
                                // to_date = to_date.toDateString();
								 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1", ['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                finMgr_name = empResult.rows['0'].emp_name;
                                                finMgr_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', finMgr_name);
                                                console.log('manager id ', finMgr_email);
                                            }
									 console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
                                            var mailOptions = {
                                                to: finMgr_email,
                                                
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been modoified with' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').Kindly approve the same\n' + '.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
                                 res.render('travelModule/travelCyber', {
                                     emp_id: emp_id,
                                     emp_name: empname,
                                     empName: empName,
                                     project_id: project_id,
                                     emp_access: emp_access,
                                     from_date: from_date,
                                     to_date: to_date,
                                     from_location: from_location,
                                     to_location: to_location,
                                     remarks: remarks,
                                     success: success,
                                     approverid: approverid,
									  pnr_number:pnr_number,
									free_text_1:free_text_1,
                                    ticket_number:ticket_number,
                                    newError:newError,
									hr_remarks:hr_remarks
                                 });
                               });
						 });
                         });
                     });
                 }
                 console.log("req_id", req_id);
                 if (tenDate == undefined) {
                     console.log("inside else tenDate", tenDate);
                     console.log("inside else travelDate", travelDate);

                     //travelDate=new Date()
                   //travelDate= moment(travelDate).format('YYYY-MM-DD');
                       
                     console.log("inside else after formatting travelDate", travelDate);
                       pdbconnect.query("Update travel_master_tbl set from_date=$1,request_status=$2,lchg_user_id=$3,lchg_time=$4,modify_flg=$5, from_location=upper($6), to_location=upper($7), remarks=upper($8) where req_id=$9", [travelDate, 'MOD', lchguserid, lchgtime,'Y',fromLoc,toLoc,remarks,req_id], function(err, done) {
                         if (err) 
                         {
                                 throw err;
                         }else
                         {
                           console.log("updated in the travel_master_tbl")
                         }
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist")
                         }
                        
                     
                         console.log("emp_id", emp_id);
                         console.log("req_id", req_id);
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number,hr_remarks from travel_master_tbl_temp where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                             var emp_id = resultValue.rows['0'].emp_id;
                             var emp_name = resultValue.rows['0'].emp_name;
                             var emp_access = resultValue.rows['0'].emp_access;
                             var project_id = resultValue.rows['0'].project_id;
                             var from_date = resultValue.rows['0'].from_date;
                             var to_date = resultValue.rows['0'].to_date;
                             var from_location = resultValue.rows['0'].from_location;
                             var to_location = resultValue.rows['0'].to_location;
                             var remarks = resultValue.rows['0'].remarks;
                             var approverid = resultValue.rows['0'].approver_id;
							  var pnr_number = resultValue.rows['0'].pnr_number;
							var free_text_1 = resultValue.rows['0'].free_text_1;
							var ticket_number = resultValue.rows['0'].ticket_number;
							var hr_remarks = resultValue.rows['0'].hr_remarks;
                             
                                 var success = "Travel request has been modified successfully with Request Id:" + req_id + "and forwarded for further approval.";
                                 req.flash('success',"Travel request has been modified Successfully with request_id:"+ req_id +"and forwarded for further approval.") ; 
                               //  from_date = from_date.toDateString();
							    pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1", ['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                finMgr_name = empResult.rows['0'].emp_name;
                                                finMgr_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', finMgr_name);
                                                console.log('manager id ', finMgr_email);
                                            }
									 console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
                                            var mailOptions = {
                                                to: finMgr_email,
                                                
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been modoified with' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').Kindly approve the same\n' + '.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
                                 res.render('travelModule/travelCyber', {
                                     emp_id: emp_id,
                                     emp_name: empname,
                                     approverid: approverid,
                                     empName: empName,
                                     project_id: project_id,
                                     emp_access: emp_access,
                                     from_date: from_date,
                                     to_date: to_date,
                                     from_location: from_location,
                                     to_location: to_location,
                                     remarks: remarks,
                                     success: success,
									  pnr_number:pnr_number,
									free_text_1:free_text_1,
                                    ticket_number:ticket_number,
                                    newError:newError,
									hr_remarks:hr_remarks
                                 });
                               });
                           });
                       });
					   });        
                 };
                        
                            
 
               }
			   if (test2 == "Submit for Cancellation") {
     console.log("Inside test2::::test2",test2);
     var travelDate = req.body.travelDate;
     var tenDate = req.body.tenDate;
	 var fromLoc = req.body.from_location;
	 var toLoc = req.body.to_location;
	 var remarks = req.body.remarks;
     var now = new Date();
	 var emp_id = req.user.rows[0].user_id;
     var rcreuserid = emp_id;
     var rcretime = now;
     var lchguserid = emp_id;
     var lchgtime = now;
     var req_id = req.body.req_id;
	 var maxCount="";
	 var to_date="";
				var from_date="";
				var from_location="";
				var to_location="";
     
        var empname = req.user.rows[0].user_name;
        var empaccess = req.user.rows[0].user_type;
        var pid = req.body.projectId;
     console.log('emp_id', emp_id);
     console.log('pid', pid);
     console.log('travelDate', travelDate);
	 var success="";
     
                 console.log("req_id after generating", req_id);
                 //console.log("approverid after generating", approverid);
                 console.log("tenDate", tenDate);
                 //console.log("tenDate.length", tenDate.length);
                 if (tenDate != undefined) {
                     console.log("tenDate", tenDate);
                     pdbconnect.query("Update travel_master_tbl set request_status=$1,lchg_user_id=$2,lchg_time=$3,modify_flg=$4,  remarks=upper($5),free_text_1=$6 where req_id=$7", [ 'CPF', lchguserid, lchgtime,'Y',remarks,'',req_id], function(err, done) {
                         if (err) 
                         {
                                 throw err;
                         }else
                         {
                           console.log("updated in the travel_master_tbl")
                         }
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist")
                         }
                     
						success = "Travel request has been cancelled with Request Id:" + req_id + " and forwarded for further approval.";
                         req.flash('success', "Travel request has been cancelled with Request Id:" + req_id + " and forwarded for further approval.");
                         console.log("emp_id", emp_id);
                         console.log("req_id inside loop1", req_id);
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;  
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                            
                             
                                  
                                 
								var travelStatus =req.body.travelStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var paramString = "";
    console.log("inside viewTravelReqApplyStatus emp_id ::  ",emp_id);
    console.log("viewTravelReqApplyStatus travelStatus ::  ",travelStatus);


    if(travelStatus == null || travelStatus=="All"){
        queryStringTemp= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id];
    }
    else{
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id,travelStatus];
    }
    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('Error with table query', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("travelReqList :: ",travelReqList);
        }
        var recordCount="";
        recordCount=trvReqTempResult.rowCount;
        console.log('temp recordCount ::: ',recordCount);

        pdbconnect.query(queryStringMain,paramString, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('Error with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("travelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    console.log('recordCount ::: ',recordCountMain);
        var totalRecordCount= recordCountMain+recordCount;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TST' order by comm_code_id asc",function(err,result){
            cocd_travelStatus=result.rows;
            cocd_travelStatus_count=result.rowCount;

            
            console.log('cocd_travelStatus_count ::: ',cocd_travelStatus_count);  
	 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1", ['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                finMgr_name = empResult.rows['0'].emp_name;
                                                finMgr_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', finMgr_name);
                                                console.log('manager id ', finMgr_email);
                                            }
									 console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
                                            var mailOptions = {
                                                to: finMgr_email,
                                                
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been cancelled with' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').Kindly approve the same\n' + '.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});

        res.render('travelModule/viewTravelReq',{
            
            cocd_travelStatus:cocd_travelStatus,
            cocd_travelStatus_count:cocd_travelStatus_count,
            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,

            emp_id:emp_id,
            emp_name:empname,
            req_id:req_id,
            emp_access:emp_access,
            project_id:project_id,
            approver_id:approver_id,
            from_date:from_date,
            to_date:to_date,
            from_location:from_location,
            to_location:to_location,
            request_status:request_status,
            remarks:remarks,
            free_text_1:free_text_1,
            free_text_2:free_text_2,
            free_text_3:free_text_3,
            recordCount:recordCount,
            recordCountMain:recordCountMain,
            travelStatus:travelStatus,
            totalRecordCount:totalRecordCount,
			success:success
        });
    });
    });
		});
});
						 });
                         });
                     });
                 }
                 console.log("req_id", req_id);
                 if (tenDate == undefined) {
                     console.log("inside else tenDate", tenDate);
                     console.log("inside else travelDate", travelDate);

                     //travelDate=new Date()
                   //travelDate= moment(travelDate).format('YYYY-MM-DD');
                       
                     console.log("inside else after formatting travelDate", travelDate);
                       pdbconnect.query("Update travel_master_tbl set request_status=$1,lchg_user_id=$2,lchg_time=$3,modify_flg=$4, remarks=upper($5),free_text_1=$6 where req_id=$7", [ 'CPF', lchguserid, lchgtime,'Y',remarks,'',req_id], function(err, done) {
                         if (err) 
                         {
                                 throw err;
                         }else
                         {
                           console.log("updated in the travel_master_tbl")
                         }
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist")
                         }
                        
                     
                         console.log("emp_id", emp_id);
                         console.log("req_id", req_id);
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number from travel_master_tbl_temp where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                            
                             
                                  success = "Travel request has been cancelled with Request Id:" + req_id + " and forwarded for further approval.";
                                  req.flash('success',"Travel request has been cancelled with request_id:"+ req_id +"and forwarded for further approval.") ; 
                               //  from_date = from_date.toDateString();
								var travelStatus =req.body.travelStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var paramString = "";
    console.log("inside viewTravelReqApplyStatus emp_id ::  ",emp_id);
    console.log("viewTravelReqApplyStatus travelStatus ::  ",travelStatus);


    if(travelStatus == null || travelStatus=="All"){
        queryStringTemp= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id];
    }
    else{
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id,travelStatus];
    }
    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('Error with table query', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("travelReqList :: ",travelReqList);
        }
        var recordCount="";
        recordCount=trvReqTempResult.rowCount;
        console.log('temp recordCount ::: ',recordCount);

        pdbconnect.query(queryStringMain,paramString, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('Error with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("travelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    console.log('recordCount ::: ',recordCountMain);
        var totalRecordCount= recordCountMain+recordCount;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TST' order by comm_code_id asc",function(err,result){
            cocd_travelStatus=result.rows;
            cocd_travelStatus_count=result.rowCount;

            
            console.log('cocd_travelStatus_count ::: ',cocd_travelStatus_count);  
	 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1", ['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                finMgr_name = empResult.rows['0'].emp_name;
                                                finMgr_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', finMgr_name);
                                                console.log('manager id ', finMgr_email);
                                            }
									 console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
                                            var mailOptions = {
                                                to: finMgr_email,
                                                
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been modoified with' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').Kindly approve the same\n' + '.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});

        res.render('travelModule/viewTravelReq',{
            
            cocd_travelStatus:cocd_travelStatus,
            cocd_travelStatus_count:cocd_travelStatus_count,
            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,

            emp_id:emp_id,
            emp_name:empname,
            req_id:req_id,
            emp_access:emp_access,
            project_id:project_id,
            approver_id:approver_id,
            from_date:from_date,
            to_date:to_date,
            from_location:from_location,
            to_location:to_location,
            request_status:request_status,
            remarks:remarks,
            free_text_1:free_text_1,
            free_text_2:free_text_2,
            free_text_3:free_text_3,
            recordCount:recordCount,
            recordCountMain:recordCountMain,
            travelStatus:travelStatus,
            totalRecordCount:totalRecordCount,
			success:success
        });
    });
    });
	});});
					   });});});    
                 };
                        
                            
 
               }
if (test4 == "Submit") {
     console.log("Inside test4:::test4:::",test4);
     var travelDate = req.body.travelDate;
     var tenDate = req.body.tenDate;
	 var fromLoc = req.body.from_location;
	 var toLoc = req.body.to_location;
	 var remarks = req.body.remarks;
     var now = new Date();
	  var emp_id = req.user.rows[0].user_id;
     var rcreuserid = emp_id;
     var rcretime = now;
     var lchguserid = emp_id;
     var lchgtime = now;
     var req_id = req.body.req_id;
	 //var comCode = req.body.comCode;
    
      var free_text_1=req.body.free_text_1;
        var empname = req.user.rows[0].user_name;
        var empaccess = req.user.rows[0].user_type;
        var pid = req.body.projectId;
     console.log('emp_id', emp_id);
     console.log('pid', pid);
     console.log('travelDate', travelDate);
	// console.log('comCode', comCode);
	var  success = "";
	 
     pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result2) {
                 if (err) {
                     console.error('Error with table query', err);
                 } else {
                     console.log("result", result2);
                     empName = result2.rows['0'].emp_name;
                     console.log("empName", empName);
                     approverid = result2.rows['0'].emp_id;
                     console.log("approverid ::HII:", approverid);
                 }
                 console.log("req_id after generating", req_id);
                 console.log("approverid after generating", approverid);
                 console.log("tenDate", tenDate);
                 //console.log("tenDate.length", tenDate.length);
                 if (tenDate != undefined) {
                     console.log("tenDate", tenDate);
                     pdbconnect.query("Update travel_master_tbl set from_date=$1,to_date=$2,request_status=$3,lchg_user_id=$4,lchg_time=$5,modify_flg=$6, from_location=upper($7), to_location=upper($8), remarks=upper($9) where req_id=$10", [travelDate, tenDate, 'MOD', lchguserid, lchgtime,'Y',fromLoc,toLoc,remarks,req_id], function(err, done) {
                         if (err) throw err;
                     pdbconnect.query("INSERT INTO travel_master_tbl_temp (select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
                       pdbconnect.query("Update travel_master_tbl_temp set modify_flg=$1 where req_id=$2",['Y',req_id],function(err,done){
                        if (err) throw err;    
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
                     pdbconnect.query("delete from travel_master_tbl where req_id=$1",[req_id],function(err,done){    
                          if (err) throw err;  


						 success = "Travel request has been modified successfully with Request Id:" + req_id + ".";
                         req.flash('success', "Travel request has been modified successfully with Request Id:" + req_id + ".");
                         console.log("emp_id", emp_id);
                         console.log("req_id inside loop1", req_id);
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number,hr_remarks from travel_master_tbl_temp where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;  
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                             var emp_id = resultValue.rows['0'].emp_id;
                             var emp_name = resultValue.rows['0'].emp_name;
                             var emp_access = resultValue.rows['0'].emp_access;
                             var project_id = resultValue.rows['0' ].project_id;
                             var from_date = resultValue.rows['0'].from_date;
                             var to_date = resultValue.rows['0'].to_date;
                             var from_location = resultValue.rows['0'].from_location;
                             var to_location = resultValue.rows['0'].to_location;
                             var remarks = resultValue.rows['0'].remarks;
							  var pnr_number = resultValue.rows['0'].pnr_number;
							var free_text_1 = resultValue.rows['0'].free_text_1;
							var ticket_number = resultValue.rows['0'].ticket_number;
							var hr_remarks = resultValue.rows['0'].hr_remarks;
                             pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result) {
                                 if (err) {
                                     console.error('Error with table query1', err);
                                 } else {
                                     empName = result.rows['0'].emp_name;
                                     console.log("empName", empName);
                                     approverid = result.rows['0'].emp_id;
                                     console.log('hii APPVER', approverid);
                                 }
								  pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl_temp where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
											pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1",['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                financemgr_name = empResult.rows['0'].emp_name;
                                                financemgr_email = empResult.rows['0'].emp_email;
                                                console.log('financemgr_name  ', financemgr_name);
                                                console.log('financemgr_email ', financemgr_email);
                                            }
											var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											 var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: approver_email,
												cc: financemgr_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been modified for' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + travelDate + ' for employee ' + empname + '(' + emp_id + ').\n' + ' \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
												
                                 
                                 //from_date = from_date.toDateString();
                                 //to_date = to_date.toDateString();
                                 res.render('travelModule/travelCyber', {
                                     emp_id: emp_id,
                                     emp_name: empname,
                                     empName: empName,
                                     project_id: project_id,
                                     emp_access: emp_access,
                                     from_date: from_date,
                                     to_date: to_date,
                                     from_location: from_location,
                                     to_location: to_location,
                                     remarks: remarks,
                                     success: success,
                                     approverid: approverid,
									   pnr_number:pnr_number,
									free_text_1:free_text_1,
                                    ticket_number:ticket_number,
                                    newError:newError,
									hr_remarks:hr_remarks
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
                 console.log("req_id", req_id);
                 if (tenDate == undefined) {
                     console.log("inside else tenDate", tenDate);
                     console.log("inside else travelDate", travelDate);

                     //travelDate=new Date()
                   //travelDate= moment(travelDate).format('YYYY-MM-DD');
                       
                     console.log("inside else after formatting travelDate", travelDate);
                     pdbconnect.query("Update travel_master_tbl set from_date=(to_date($1, 'YYYY-MM-DD')),request_status=$2,lchg_user_id=$3,lchg_time=$4,modify_flg=$5,from_location=upper($6), to_location=upper($7), remarks=upper($8) where  req_id=$9", [travelDate, 'MOD', lchguserid, lchgtime,'Y',fromLoc,toLoc,remarks,req_id], function(err, done) {
                         if (err) 
                         {
                                 throw err;
                         }else
                         {
                           console.log("updated in the travel_master_tbl")
                         }
                        
                     pdbconnect.query("INSERT INTO travel_master_tbl_temp (select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) 
                         {
                             throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_temp")
                         }
                         pdbconnect.query("Update travel_master_tbl_temp set modify_flg=$1 where req_id=$2",['Y',req_id],function(err,done){
                        if (err) throw err;
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist")
                         }
                     pdbconnect.query("delete from travel_master_tbl where req_id=$1",[req_id],function(err,done){    
                          if (err) throw err;          
    
                         console.log("emp_id", emp_id);
                         console.log("req_id", req_id);
						 
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number,hr_remarks from travel_master_tbl_temp where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                             var emp_id = resultValue.rows['0'].emp_id;
                             var emp_name = resultValue.rows['0'].emp_name;
                             var emp_access = resultValue.rows['0'].emp_access;
                             var project_id = resultValue.rows['0'].project_id;
                             var from_date = resultValue.rows['0'].from_date;
                             var to_date = resultValue.rows['0'].to_date;
                             var from_location = resultValue.rows['0'].from_location;
                             var to_location = resultValue.rows['0'].to_location;
                             var remarks = resultValue.rows['0'].remarks;
							  var pnr_number = resultValue.rows['0'].pnr_number;
							var free_text_1 = resultValue.rows['0'].free_text_1;
							var ticket_number = resultValue.rows['0'].ticket_number;
							var hr_remarks = resultValue.rows['0'].hr_remarks;
                             pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result) {
                                 if (err) {
                                     console.error('Error with table query1', err);
                                 } else {
                                     empName = result.rows['0'].emp_name;
                                     console.log("empName", empName);
                                     approverid = result.rows['0'].emp_id;
                                     console.log('hii', approverid);
                                 } pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl_temp where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
											pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1",['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                financemgr_name = empResult.rows['0'].emp_name;
                                                financemgr_email = empResult.rows['0'].emp_email;
                                                console.log('financemgr_name  ', financemgr_name);
                                                console.log('financemgr_email ', financemgr_email);
                                            }
											var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											 var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: approver_email,
												cc: financemgr_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been modified for' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + travelDate + ' for employee ' + empname + '(' + emp_id + ').\n' + ' \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
												
                                  success = "Travel request has been modified successfully with Request Id:" + req_id + ".";
                                req.flash('success',"Travel request has been modified successfully with Request Id:"+ req_id +".") ; 
                                // from_date = from_date.toDateString();
                                 res.render('travelModule/travelCyber', {
                                     emp_id: emp_id,
                                     emp_name: empname,
                                     approverid: approverid,
                                     empName: empName,
                                     project_id: project_id,
                                     emp_access: emp_access,
                                     from_date: from_date,
                                     to_date: to_date,
                                     from_location: from_location,
                                     to_location: to_location,
                                     remarks: remarks,
                                     success: success,
									   pnr_number:pnr_number,
									free_text_1:free_text_1,
                                    ticket_number:ticket_number,
                                    newError:newError,
									hr_remarks:hr_remarks
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
							 });
	 
	  }
	 
 
              
			   if (test4 == "Submit for Cancellation") {
				    console.log("Inside test4:::test4:::",test4);
     var travelDate = req.body.travelDate;
     var tenDate = req.body.tenDate;
	 var fromLoc = req.body.from_location;
	 var toLoc = req.body.to_location;
	 var remarks = req.body.remarks;
	 var maxCount="";
     var now = new Date();
	 var emp_id = req.user.rows[0].user_id;
     var rcreuserid = emp_id;
     var rcretime = now;
     var lchguserid = emp_id;
     var lchgtime = now;
	 var to_date="";
	 var success="";
				var from_date="";
				var from_location="";
				var to_location="";
     var req_id = req.body.req_id;
	 //var comCode = req.body.comCode;
     
      var free_text_1=req.body.free_text_1;
        var empname = req.user.rows[0].user_name;
        var empaccess = req.user.rows[0].user_type;
        var pid = req.body.projectId;
     console.log('emp_id', emp_id);
     console.log('pid', pid);
     console.log('travelDate', travelDate);
	// console.log('comCode', comCode);
				    pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result2) {
                 if (err) {
                     console.error('Error with table query', err);
                 } else {
                     console.log("result", result2);
                     empName = result2.rows['0'].emp_name;
                     console.log("empName", empName);
                     approverid = result2.rows['0'].emp_id;
                     console.log("approverid ::HII:", approverid);
                 }
                 console.log("req_id after generating", req_id);
                 console.log("approverid after generating", approverid);
                 console.log("tenDate", tenDate);
                 //console.log("tenDate.length", tenDate.length);
                 if (tenDate != undefined) {
                     console.log("tenDate", tenDate);
                      pdbconnect.query("Update travel_master_tbl set request_status=$1,lchg_user_id=$2,lchg_time=$3,modify_flg=$4,  remarks=upper($5) where req_id=$6", ['CAN', lchguserid, lchgtime,'Y',remarks,req_id], function(err, done) {
                         if (err) throw err;
                       
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
                     


						  success = "Travel request has been cancelled  with Request Id:" + req_id + ".";
                         req.flash('success', "Travel request has been cancelled  with Request Id:" + req_id + ".");
                         console.log("emp_id", emp_id);
                         console.log("req_id inside loop1", req_id);
						 
						 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
											pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1",['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                financemgr_name = empResult.rows['0'].emp_name;
                                                financemgr_email = empResult.rows['0'].emp_email;
                                                console.log('financemgr_name  ', financemgr_name);
                                                console.log('financemgr_email ', financemgr_email);
                                            }
											var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											 var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: approver_email,
												cc: financemgr_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been cancelled for' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + travelDate + ' for employee ' + empname + '(' + emp_id + ').\n' + ' \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
												
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;  
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                            
                             pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result) {
                                 if (err) {
                                     console.error('Error with table query1', err);
                                 } else {
                                     empName = result.rows['0'].emp_name;
                                     console.log("empName", empName);
                                     approverid = result.rows['0'].emp_id;
                                     console.log('hii APPVER', approverid);
                                 }
                                
                                 //from_date = from_date.toDateString();
                                // to_date = to_date.toDateString();
								 var travelStatus =req.body.travelStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var paramString = "";
    console.log("inside viewTravelReqApplyStatus emp_id ::  ",emp_id);
    console.log("viewTravelReqApplyStatus travelStatus ::  ",travelStatus);


    if(travelStatus == null || travelStatus=="All"){
        queryStringTemp= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id];
    }
    else{
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id,travelStatus];
    }
    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('Error with table query', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("travelReqList :: ",travelReqList);
        }
        var recordCount="";
        recordCount=trvReqTempResult.rowCount;
        console.log('temp recordCount ::: ',recordCount);

        pdbconnect.query(queryStringMain,paramString, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('Error with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("travelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    console.log('recordCount ::: ',recordCountMain);
        var totalRecordCount= recordCountMain+recordCount;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TST' order by comm_code_id asc",function(err,result){
            cocd_travelStatus=result.rows;
            cocd_travelStatus_count=result.rowCount;

            
            console.log('cocd_travelStatus_count ::: ',cocd_travelStatus_count);  


        res.render('travelModule/viewTravelReq',{
            
            cocd_travelStatus:cocd_travelStatus,
            cocd_travelStatus_count:cocd_travelStatus_count,
            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,

            emp_id:emp_id,
            emp_name:empname,
            req_id:req_id,
            emp_access:emp_access,
            project_id:project_id,
            approver_id:approver_id,
            from_date:from_date,
            to_date:to_date,
            from_location:from_location,
            to_location:to_location,
            request_status:request_status,
            remarks:remarks,
            free_text_1:free_text_1,
            free_text_2:free_text_2,
            free_text_3:free_text_3,
            recordCount:recordCount,
            recordCountMain:recordCountMain,
            travelStatus:travelStatus,
            totalRecordCount:totalRecordCount,
			success:success
        });
    });
    });
});
							 });
                             });
							 });
					  });});});
                         
                     
                 }
                 console.log("req_id", req_id);
                 if (tenDate == undefined) {
                     console.log("inside else tenDate", tenDate);
                     console.log("inside else travelDate", travelDate);

                     //travelDate=new Date()
                   //travelDate= moment(travelDate).format('YYYY-MM-DD');
                       
                     console.log("inside else after formatting travelDate", travelDate);
                     pdbconnect.query("Update travel_master_tbl set request_status=$1,lchg_user_id=$2,lchg_time=$3,modify_flg=$4,  remarks=upper($5) where req_id=$6", [ 'CAN', lchguserid, lchgtime,'Y',remarks,req_id], function(err, done) {
                         if (err) 
                         {
                                 throw err;
                         }else
                         {
                           console.log("updated in the travel_master_tbl")
                         }
                        
                     
                      
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist")
                         }
                    
					
    
                         console.log("emp_id", emp_id);
                         console.log("req_id", req_id);
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,ticket_number,pnr_number from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                            
                             pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result) {
                                 if (err) {
                                     console.error('Error with table query1', err);
                                 } else {
                                     empName = result.rows['0'].emp_name;
                                     console.log("empName", empName);
                                     approverid = result.rows['0'].emp_id;
                                     console.log('hii', approverid);
                                 }
                                  success = "Travel request has been cancelled with Request Id:" + req_id + ".";
                                  req.flash('success',"Travel request has been cancelled with request_id:"+ req_id +".") ; 
								  pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
											pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1",['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                financemgr_name = empResult.rows['0'].emp_name;
                                                financemgr_email = empResult.rows['0'].emp_email;
                                                console.log('financemgr_name  ', financemgr_name);
                                                console.log('financemgr_email ', financemgr_email);
                                            }
											var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											 var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: approver_email,
												cc: financemgr_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been cancelled for' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + travelDate + ' for employee ' + empname + '(' + emp_id + ').\n' + ' \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
                               //  from_date = from_date.toDateString();
								 var travelStatus =req.body.travelStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var paramString = "";
    console.log("inside viewTravelReqApplyStatus emp_id ::  ",emp_id);
    console.log("viewTravelReqApplyStatus travelStatus ::  ",travelStatus);


    if(travelStatus == null || travelStatus=="All"){
        queryStringTemp= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id];
    }
    else{
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id,travelStatus];
    }
    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('Error with table query', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("travelReqList :: ",travelReqList);
        }
        var recordCount="";
        recordCount=trvReqTempResult.rowCount;
        console.log('temp recordCount ::: ',recordCount);

        pdbconnect.query(queryStringMain,paramString, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('Error with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("travelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    console.log('recordCount ::: ',recordCountMain);
        var totalRecordCount= recordCountMain+recordCount;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TST' order by comm_code_id asc",function(err,result){
            cocd_travelStatus=result.rows;
            cocd_travelStatus_count=result.rowCount;

            
            console.log('cocd_travelStatus_count ::: ',cocd_travelStatus_count);  


        res.render('travelModule/viewTravelReq',{
            
            cocd_travelStatus:cocd_travelStatus,
            cocd_travelStatus_count:cocd_travelStatus_count,
            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,

            emp_id:emp_id,
            emp_name:empname,
            req_id:req_id,
            emp_access:emp_access,
            project_id:project_id,
            approver_id:approver_id,
            from_date:from_date,
            to_date:to_date,
            from_location:from_location,
            to_location:to_location,
            request_status:request_status,
            remarks:remarks,
            free_text_1:free_text_1,
            free_text_2:free_text_2,
            free_text_3:free_text_3,
            recordCount:recordCount,
            recordCountMain:recordCountMain,
            travelStatus:travelStatus,
            totalRecordCount:totalRecordCount,
			success:success
        });
    });
    });
});
                          });     
});
							 });
					 });});});
                    
                 };
                        
                            });
			   }
    
               if (test5 == "Submit") {
     console.log("Inside test5::test5::",test5)
     var travelDate = req.body.travelDate;
     var tenDate = req.body.tenDate;
	 var fromLoc = req.body.from_location;
	 var toLoc = req.body.to_location;
	 var remarks = req.body.remarks;
     var now = new Date();
	  //var comCode = req.body.comCode;
	  var emp_id = req.user.rows[0].user_id;
     var rcreuserid = emp_id;
     var rcretime = now;
     var lchguserid = emp_id;
     var lchgtime = now;
     var req_id = req.body.req_id;
     var success ="";
        var empname = req.user.rows[0].user_name;
        var empaccess = req.user.rows[0].user_type;
        var pid = req.body.projectId;
     console.log('emp_id', emp_id);
     console.log('pid', pid);
     console.log('travelDate', travelDate);
	//  console.log('comCode', comCode);
	
     pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result2) {
                 if (err) {
                     console.error('Error with table query', err);
                 } else {
                     console.log("result", result2);
                     empName = result2.rows['0'].emp_name;
                     console.log("empName", empName);
                     approverid = result2.rows['0'].emp_id;
                     console.log("approverid ::HII:", approverid);
                 }
                 console.log("req_id after generating", req_id);
                 console.log("approverid after generating", approverid);
                 console.log("tenDate", tenDate);
                 //console.log("tenDate.length", tenDate.length);
                 if (tenDate != undefined) {
                     console.log("tenDate", tenDate);
                     pdbconnect.query("Update travel_master_tbl_temp set from_date=$1,to_date=$2,request_status=$3,lchg_user_id=$4,lchg_time=$5,modify_flg=$6,from_location=upper($7), to_location=upper($8), remarks=upper($9) where req_id=$10", [travelDate, tenDate, 'MOD', lchguserid, lchgtime,'Y',fromLoc,toLoc,remarks,req_id], function(err, done) {
                         if (err) throw err;
                     
						 success = "Travel request has been modified successfully with Request Id:" + req_id + ".";
                         req.flash('success', "Travel request has been modify successfully with Request Id:" + req_id + ".");
                         console.log("emp_id", emp_id);
                         console.log("req_id inside loop1", req_id);
						 
						  pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl_temp where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist:::test555:::");
                         }
						 
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number from travel_master_tbl_temp where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;  
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                             var emp_id = resultValue.rows['0'].emp_id;
                             var emp_name = resultValue.rows['0'].emp_name;
                             var emp_access = resultValue.rows['0'].emp_access;
                             var project_id = resultValue.rows['0' ].project_id;
                             var from_date = resultValue.rows['0'].from_date;
                             var to_date = resultValue.rows['0'].to_date;
                             var from_location = resultValue.rows['0'].from_location;
                             var to_location = resultValue.rows['0'].to_location;
                             var remarks = resultValue.rows['0'].remarks;
							   var pnr_number = resultValue.rows['0'].pnr_number;
							var free_text_1 = resultValue.rows['0'].free_text_1;
							var ticket_number = resultValue.rows['0'].ticket_number;
                             pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result) {
                                 if (err) {
                                     console.error('Error with table query1', err);
                                 } else {
                                     empName = result.rows['0'].emp_name;
                                     console.log("empName", empName);
                                     approverid = result.rows['0'].emp_id;
                                     console.log('hii APPVER', approverid);
                                 }
                                
								  pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl_temp where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
									 console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											 var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: approver_email,
                                                
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been modified with' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').\n' + '.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
								 
                                 //from_date = from_date.toDateString();
                                // to_date = to_date.toDateString();
                                 res.render('travelModule/travelCyber', {
                                     emp_id: emp_id,
                                     emp_name: empname,
                                     empName: empName,
                                     project_id: project_id,
                                     emp_access: emp_access,
                                     from_date: from_date,
                                     to_date: to_date,
                                     from_location: from_location,
                                     to_location: to_location,
                                     remarks: remarks,
                                     success: success,
                                     approverid: approverid,
									  pnr_number:pnr_number,
									free_text_1:free_text_1,
                                    ticket_number:ticket_number,
                                    newError:newError
                                 });
                               });
                            });
                         });
						  });
                     });
                 }
                 console.log("req_id", req_id);
                 if (tenDate == undefined) {
                     console.log("inside else tenDate", tenDate);
                     console.log("inside else travelDate", travelDate);

                     //travelDate=new Date()
                   //travelDate= moment(travelDate).format('YYYY-MM-DD');
                       
                     console.log("inside else after formatting travelDate", travelDate);
                     pdbconnect.query("Update travel_master_tbl_temp set from_date=(to_date($1, 'YYYY-MM-DD')),request_status=$2,lchg_user_id=$3,lchg_time=$4,modify_flg=$5,from_location=upper($6), to_location=upper($7), remarks=upper($8)  where req_id=$9", [travelDate, 'MOD', lchguserid, lchgtime,'Y',fromLoc,toLoc,remarks,req_id], function(err, done) {
                         if (err) 
                         {
                                 throw err;
                         }else
                         {
                           console.log("updated in the travel_master_tbl_temp")
                         }
                        
                     
                         console.log("emp_id", emp_id);
                         console.log("req_id", req_id);
						 
						  pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl_temp where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist:::test555:::")
                         }
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number from travel_master_tbl_temp where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                             var emp_id = resultValue.rows['0'].emp_id;
                             var emp_name = resultValue.rows['0'].emp_name;
                             var emp_access = resultValue.rows['0'].emp_access;
                             var project_id = resultValue.rows['0'].project_id;
                             var from_date = resultValue.rows['0'].from_date;
                             var to_date = resultValue.rows['0'].to_date;
                             var from_location = resultValue.rows['0'].from_location;
                             var to_location = resultValue.rows['0'].to_location;
                             var remarks = resultValue.rows['0'].remarks;
							   var pnr_number = resultValue.rows['0'].pnr_number;
							var free_text_1 = resultValue.rows['0'].free_text_1;
							var ticket_number = resultValue.rows['0'].ticket_number;
                             pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result) {
                                 if (err) {
                                     console.error('Error with table query1', err);
                                 } else {
                                     empName = result.rows['0'].emp_name;
                                     console.log("empName", empName);
                                     approverid = result.rows['0'].emp_id;
                                     console.log('hii', approverid);
                                 }
                                  success = "Travel request has been modified successfully with Request Id:" + req_id + ".";
                                  req.flash('success',"Travel request has been modified Successfully with request_id:"+ req_id +".") ; 
								  pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl_temp where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
									 console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											 var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: approver_email,
                                                
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been modified with' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').\n' + '.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
                                 //from_date = from_date.toDateString();
                                 res.render('travelModule/travelCyber', {
                                     emp_id: emp_id,
                                     emp_name: empname,
                                     approverid: approverid,
                                     empName: empName,
                                     project_id: project_id,
                                     emp_access: emp_access,
                                     from_date: from_date,
                                     to_date: to_date,
                                     from_location: from_location,
                                     to_location: to_location,
                                     remarks: remarks,
                                     success: success,
									  pnr_number:pnr_number,
									free_text_1:free_text_1,
                                    ticket_number:ticket_number,
                                    newError:newError
                                 });
                               });
                           });
						     });
                       });
					   
					 });
                 };
				             });
                        
                        
			   }
 
              
			   if(test5 == 'Submit for Cancellation'){
				        console.log("Inside test5::test5::",test5)
				var travelDate = req.body.travelDate;
				var tenDate = req.body.tenDate;
				var fromLoc = req.body.from_location;
				var toLoc = req.body.to_location;
				var remarks = req.body.remarks;
				var now = new Date();
				//var comCode = req.body.comCode;
				var emp_id = req.user.rows[0].user_id;
				var rcreuserid = emp_id;
				var rcretime = now;
				var lchguserid = emp_id;
				var lchgtime = now;
				var to_date="";
				var from_date="";
				var from_location="";
				var to_location="";
				var maxCount="";
				var req_id = req.body.req_id;
				 var success ="";
				
        var empname = req.user.rows[0].user_name;
        var empaccess = req.user.rows[0].user_type;
        var pid = req.body.projectId;
     console.log('emp_id', emp_id);
     console.log('pid', pid);
     console.log('travelDate', travelDate);
				   pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result2) {
                 if (err) {
                     console.error('Error with table query', err);
                 } else {
                     console.log("result", result2);
                     empName = result2.rows['0'].emp_name;
                     console.log("empName", empName);
                     approverid = result2.rows['0'].emp_id;
                     console.log("approverid ::HII:", approverid);
                 }
                 console.log("req_id after generating", req_id);
                 console.log("approverid after generating", approverid);
                 console.log("tenDate", tenDate);
                 //console.log("tenDate.length", tenDate.length);
                 if (tenDate != undefined) {
                     console.log("tenDate", tenDate);
                     pdbconnect.query("Update travel_master_tbl_temp set request_status=$1,lchg_user_id=$2,lchg_time=$3,modify_flg=$4 , remarks=upper($5) where req_id=$6", ['CAN', lchguserid, lchgtime,'Y',remarks,req_id], function(err, done) {
                         if (err) throw err;
                      pdbconnect.query("INSERT INTO travel_master_tbl(select *  from travel_master_tbl_temp where req_id=$1)",[req_id],function(err,done){    
                
                          if (err) throw err;
						 success = "Travel request has been cancelled with Request Id:" + req_id + ".";
                         req.flash('success', "Travel request has been cancelled with Request Id:" + req_id + ".");
                         console.log("emp_id", emp_id);
                         console.log("req_id inside loop1", req_id);
						 
						  pdbconnect.query("INSERT INTO travel_master_tbl_hist(select *  from travel_master_tbl_temp where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist:::test555:::");
                         }
						pdbconnect.query("delete from travel_master_tbl_temp where req_id=$1",[req_id],function(err,done){    
                          if (err) throw err;  
						 
						 
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time ,free_text_1,ticket_number,pnr_number from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;  
							 else{
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                              
                             pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result) {
                                 if (err) {
                                     console.error('Error with table query1', err);
                                 } else {
                                     empName = result.rows['0'].emp_name;
                                     console.log("empName", empName);
                                     approverid = result.rows['0'].emp_id;
                                     console.log('hii APPVER', approverid);
                                 }
                                 
                                // from_date = from_date.toDateString();
                                 //to_date = to_date.toDateString();
								var travelStatus =req.body.travelStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var paramString = "";
    console.log("inside viewTravelReqApplyStatus emp_id ::  ",emp_id);
    console.log("viewTravelReqApplyStatus travelStatus ::  ",travelStatus);


    if(travelStatus == null || travelStatus=="All"){
        queryStringTemp= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id];
    }
    else{
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id,travelStatus];
    }
    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('Error with table query', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("travelReqList :: ",travelReqList);
        }
        var recordCount="";
        recordCount=trvReqTempResult.rowCount;
        console.log('temp recordCount ::: ',recordCount);

        pdbconnect.query(queryStringMain,paramString, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('Error with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("travelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    console.log('recordCount ::: ',recordCountMain);
        var totalRecordCount= recordCountMain+recordCount;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TST' order by comm_code_id asc",function(err,result){
            cocd_travelStatus=result.rows;
            cocd_travelStatus_count=result.rowCount;

            
            console.log('cocd_travelStatus_count ::: ',cocd_travelStatus_count);  
			 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
									 console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											 var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: approver_email,
                                                
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been cancelled with' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').\n' + '.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});


        res.render('travelModule/viewTravelReq',{
            
            cocd_travelStatus:cocd_travelStatus,
            cocd_travelStatus_count:cocd_travelStatus_count,
            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,

            emp_id:emp_id,
            emp_name:empname,
            req_id:req_id,
            emp_access:emp_access,
            project_id:project_id,
            approver_id:approver_id,
            from_date:from_date,
            to_date:to_date,
            from_location:from_location,
            to_location:to_location,
            request_status:request_status,
            remarks:remarks,
            free_text_1:free_text_1,
            free_text_2:free_text_2,
            free_text_3:free_text_3,
            recordCount:recordCount,
            recordCountMain:recordCountMain,
            travelStatus:travelStatus,
            totalRecordCount:totalRecordCount,
			success:success
        });
		
			 
    });
    });
});
	});          });
							 }
                            });
						});
                         });
                     });
					 });
                 }
                 console.log("req_id", req_id);
                 if (tenDate == undefined) {
                     console.log("inside else tenDate", tenDate);
                     console.log("inside else travelDate", travelDate);

                     //travelDate=new Date()
                   //travelDate= moment(travelDate).format('YYYY-MM-DD');
                       
                     console.log("inside else after formatting travelDate", travelDate);
                     pdbconnect.query("Update travel_master_tbl_temp set request_status=$1,lchg_user_id=$2,lchg_time=$3,modify_flg=$4 , remarks=upper($5) where req_id=$6", [ 'CAN', lchguserid, lchgtime,'Y',remarks,req_id], function(err, done) {
                         if (err) 
                         {
                                 throw err;
                         }else
                         {
                           console.log("updated in the travel_master_tbl_temp")
                         }
							  pdbconnect.query("INSERT INTO travel_master_tbl(select * from travel_master_tbl_temp where req_id=$1)",[req_id],function(err,done){    
                
                          if (err) throw err;
                     
                         console.log("emp_id", emp_id);
                         console.log("req_id", req_id);
						 
						  pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl_temp where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist:::test555:::")
                         }
						 pdbconnect.query("delete from travel_master_tbl_temp where req_id=$1",[req_id],function(err,done){    
                          if (err) throw err;  
						 
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                            
                             pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result) {
                                 if (err) {
                                     console.error('Error with table query1', err);
                                 } else {
                                     empName = result.rows['0'].emp_name;
                                     console.log("empName", empName);
                                     approverid = result.rows['0'].emp_id;
                                     console.log('hii', approverid);
                                 }
                                  success = "Travel request has been cancelled  with Request Id:" + req_id + ".";
                                  req.flash('success',"Travel request has been cancelled with request_id:"+ req_id +".") ; 
                                 //from_date = from_date.toDateString();
								var travelStatus =req.body.travelStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var paramString = "";
    console.log("inside viewTravelReqApplyStatus emp_id ::  ",emp_id);
    console.log("viewTravelReqApplyStatus travelStatus ::  ",travelStatus);


    if(travelStatus == null || travelStatus=="All"){
        queryStringTemp= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id];
    }
    else{
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id,travelStatus];
    }
    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('Error with table query', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("travelReqList :: ",travelReqList);
        }
        var recordCount="";
        recordCount=trvReqTempResult.rowCount;
        console.log('temp recordCount ::: ',recordCount);

        pdbconnect.query(queryStringMain,paramString, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('Error with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("travelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    console.log('recordCount ::: ',recordCountMain);
        var totalRecordCount= recordCountMain+recordCount;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TST' order by comm_code_id asc",function(err,result){
            cocd_travelStatus=result.rows;
            cocd_travelStatus_count=result.rowCount;

            
            console.log('cocd_travelStatus_count ::: ',cocd_travelStatus_count);  
			 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl_temp where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
									 console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											 var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: approver_email,
                                                
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been cancelled with' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc+ ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').\n' + '.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});


        res.render('travelModule/viewTravelReq',{
            
            cocd_travelStatus:cocd_travelStatus,
            cocd_travelStatus_count:cocd_travelStatus_count,
            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,

            emp_id:emp_id,
            emp_name:empname,
            req_id:req_id,
            emp_access:emp_access,
            project_id:project_id,
            approver_id:approver_id,
            from_date:from_date,
            to_date:to_date,
            from_location:from_location,
            to_location:to_location,
            request_status:request_status,
            remarks:remarks,
            free_text_1:free_text_1,
            free_text_2:free_text_2,
            free_text_3:free_text_3,
            recordCount:recordCount,
            recordCountMain:recordCountMain,
            travelStatus:travelStatus,
            totalRecordCount:totalRecordCount,
			success:success
        });
    });
    });
});
	});
                       });
					 });});});
							  });
					 });					 
                 };
                        
                            });
			   }
        if (test3 == "Submit") {
     console.log("Inside test3:::test3:::",test3);
     var travelDate = req.body.travelDate;
     var tenDate = req.body.tenDate;
	  var fromLoc = req.body.from_location;
	 var toLoc = req.body.to_location;
	 var remarks = req.body.remarks;
	 var pnr_number = req.body.pnr_number;
	 var ticket_number = req.body.ticket_number;
	 var free_text_1 = req.body.free_text_1;
	  // var comCode = req.body.comCode;
	  var emp_id = req.user.rows[0].user_id;
     var now = new Date();
     var rcreuserid = emp_id;
     var rcretime = now;
     var lchguserid = emp_id;
     var lchgtime = now;
     var req_id = req.body.req_id;
     var success = "";
        var empname = req.user.rows[0].user_name;
        var empaccess = req.user.rows[0].user_type;
        var pid = req.body.projectId;
     console.log('emp_id', emp_id);
     console.log('pid', pid);
     console.log('travelDate', travelDate);
	  
     pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result2) {
                 if (err) {
                     console.error('Error with table query', err);
                 } else {
                     console.log("result", result2);
                     empName = result2.rows['0'].emp_name;
                     console.log("empName", empName);
                     approverid = result2.rows['0'].emp_id;
                     console.log("approverid ::HII:", approverid);
                 }
                 console.log("req_id after generating", req_id);
                 console.log("approverid after generating", approverid);
                 console.log("tenDate", tenDate);
                 //console.log("tenDate.length", tenDate.length);
                 if (tenDate != undefined) {
                     console.log("tenDate", tenDate);
                     pdbconnect.query("Update travel_master_tbl set from_date=$1,to_date=$2,request_status=$3,lchg_user_id=$4,lchg_time=$5,modify_flg=$6,from_location=upper($7), to_location=upper($8), remarks=upper($9)  where req_id=$10", [travelDate, tenDate, 'MOD', lchguserid, lchgtime,'Y',fromLoc,toLoc,remarks,req_id], function(err, done) {
                         if (err) throw err;
                     pdbconnect.query("INSERT INTO travel_master_tbl_temp(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
                     pdbconnect.query("Update travel_master_tbl_temp set modify_flg=$1 where req_id=$2",['Y',req_id],function(err,done){
                        if (err) throw err;     
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
                     pdbconnect.query("delete from travel_master_tbl where req_id=$1",[req_id],function(err,done){    
                          if (err) throw err;  


						success="Travel request has been modified successfully with Request Id:" + req_id + ".";
                         req.flash('success', "Travel request has been modified successfully with Request Id:" + req_id + ".");
						  
                         console.log("emp_id", emp_id);
                         console.log("req_id inside loop1", req_id);
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,pnr_number,ticket_number,free_text_1,hr_remarks from travel_master_tbl_temp where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;  
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                             var emp_id = resultValue.rows['0'].emp_id;
                             var emp_name = resultValue.rows['0'].emp_name;
                             var emp_access = resultValue.rows['0'].emp_access;
                             var project_id = resultValue.rows['0' ].project_id;
                             var from_date = resultValue.rows['0'].from_date;
                             var to_date = resultValue.rows['0'].to_date;
                             var from_location = resultValue.rows['0'].from_location;
                             var to_location = resultValue.rows['0'].to_location;
                             var remarks = resultValue.rows['0'].remarks;
							 
							 var pnr_number = resultValue.rows['0'].pnr_number;
                             var ticket_number = resultValue.rows['0'].ticket_number;
                             var free_text_1 = resultValue.rows['0'].free_text_1;
							   var hr_remarks = resultValue.rows['0'].hr_remarks;
                             
                             pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result) {
                                 if (err) {
                                     console.error('Error with table query1', err);
                                 } else {
                                     empName = result.rows['0'].emp_name;
                                     console.log("empName", empName);
                                     approverid = result.rows['0'].emp_id;
                                     console.log('hii APPVER', approverid);
                                 }
                                // var success = "Travel request has been modified successfully with Request Id:" + req_id + ".";
								 
								 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from travel_master_tbl_temp where req_id=$1)", [req_id], function(err, empResult) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        } else {
                                            employee_name = empResult.rows['0'].emp_name;
                                            employee_email = empResult.rows['0'].emp_email;
                                            console.log('employee name ', employee_name);
                                            console.log('employee id ', employee_email);
                                        }
                                        pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl_temp where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
											
											
											pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1",['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                financemgr_name = empResult.rows['0'].emp_name;
                                                financemgr_email = empResult.rows['0'].emp_email;
                                                console.log('financemgr_name  ', financemgr_name);
                                                console.log('financemgr_email ', financemgr_email);
                                            }
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											 var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: approver_email,
                                                cc: financemgr_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been modified for' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').\n' + 'Kindly approve the same.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
								 
                                // from_date = from_date.toDateString();
                               //  to_date = to_date.toDateString();
                                 res.render('travelModule/travelCyber', {
                                     emp_id: emp_id,
                                     emp_name: empname,
                                     empName: empName,
                                     project_id: project_id,
                                     emp_access: emp_access,
                                     from_date: from_date,
									 
                                     to_date: to_date,
                                     from_location: from_location,
                                     to_location: to_location,
                                     remarks: remarks,
                                     success: success,
                                     approverid: approverid,
									  pnr_number:pnr_number,
									 ticket_number:ticket_number,
                                     free_text_1:free_text_1,
                                     newError:newError,
									 hr_remarks:hr_remarks
									 
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
                 console.log("req_id", req_id);
                 if (tenDate == undefined) {
                     console.log("inside else tenDate", tenDate);
                     console.log("inside else travelDate", travelDate);

                     //travelDate=new Date()
                   //travelDate= moment(travelDate).format('YYYY-MM-DD');
                       
                     console.log("inside else after formatting travelDate", travelDate);
                     pdbconnect.query("Update travel_master_tbl set from_date=(to_date($1, 'YYYY-MM-DD')),request_status=$2,lchg_user_id=$3,lchg_time=$4,modify_flg=$5,from_location=upper($6), to_location=upper($7), remarks=upper($8)  where req_id=$9", [travelDate, 'MOD',  lchguserid, lchgtime,'N',fromLoc,toLoc,remarks,req_id], function(err, done) {
                         if (err) 
                         {
                                 throw err;
                         }else
                         {
                           console.log("updated in the travel_master_tbl")
                         }
                        
                     pdbconnect.query("INSERT INTO travel_master_tbl_temp (select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) 
                         {
                             throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_temp")
                         }
                         pdbconnect.query("Update travel_master_tbl_temp set modify_flg=$1 where req_id=$2",['Y',req_id],function(err,done){
                        if (err) throw err;
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist")
                         }
                     pdbconnect.query("delete from travel_master_tbl where req_id=$1",[req_id],function(err,done){    
                          if (err) throw err;          
    
                         console.log("emp_id", emp_id);
                         console.log("req_id", req_id);
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number from travel_master_tbl_temp where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                             var emp_id = resultValue.rows['0'].emp_id;
                             var emp_name = resultValue.rows['0'].emp_name;
                             var emp_access = resultValue.rows['0'].emp_access;
                             var project_id = resultValue.rows['0'].project_id;
                             var from_date = resultValue.rows['0'].from_date;
                             var to_date = resultValue.rows['0'].to_date;
                             var from_location = resultValue.rows['0'].from_location;
                             var to_location = resultValue.rows['0'].to_location;
                             var remarks = resultValue.rows['0'].remarks;
							   var free_text_1 = resultValue.rows['0'].free_text_1;
                             var pnr_number = resultValue.rows['0'].pnr_number;
                             var ticket_number = resultValue.rows['0'].ticket_number;
                             pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result) {
                                 if (err) {
                                     console.error('Error with table query1', err);
                                 } else {
                                     empName = result.rows['0'].emp_name;
                                     console.log("empName", empName);
                                     approverid = result.rows['0'].emp_id;
                                     console.log('hii', approverid);
                                 }
                                  success = "Travel request has been modified successfully with Request Id:" + req_id + ".";
                                  req.flash('success',"Travel request has been modified Successfully with request_id:"+ req_id +".") ; 
								 
								 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from travel_master_tbl_temp where req_id=$1)", [req_id], function(err, empResult) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        } else {
                                            employee_name = empResult.rows['0'].emp_name;
                                            employee_email = empResult.rows['0'].emp_email;
                                            console.log('employee name ', employee_name);
                                            console.log('employee id ', employee_email);
                                        }
                                        pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl_temp where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
											
											
											pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1",['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                financemgr_name = empResult.rows['0'].emp_name;
                                                financemgr_email = empResult.rows['0'].emp_email;
                                                console.log('financemgr_name  ', financemgr_name);
                                                console.log('financemgr_email ', financemgr_email);
                                            }
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											 var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: approver_email,
                                                cc: financemgr_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been modified for' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').\n' + 'Kindly approve.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
                                // from_date = from_date.toDateString();
                                 res.render('travelModule/travelCyber', {
                                     emp_id: emp_id,
                                     emp_name: empname,
                                     approverid: approverid,
                                     empName: empName,
                                     project_id: project_id,
                                     emp_access: emp_access,
                                     from_date: from_date,
                                     to_date: to_date,
                                     from_location: from_location,
                                     to_location: to_location,
                                     remarks: remarks,
                                     success: success,
									  pnr_number:pnr_number,
									 ticket_number:ticket_number,
                                     free_text_1:free_text_1,
                                     newError:newError
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
                        
                            });
		
 
               }
			     if (test3 == "Submit for Cancellation") {
					  console.log("Inside test3:::test3:::",test3);
     var travelDate = req.body.travelDate;
     var tenDate = req.body.tenDate;
	  var fromLoc = req.body.from_location;
	 var toLoc = req.body.to_location;
	 var remarks = req.body.remarks;
	 var pnr_number = "";
	 var ticket_number = "";
	 var free_text_1 = "";
	  // var comCode = req.body.comCode;
	  var emp_id = req.user.rows[0].user_id;
     var now = new Date();
     var rcreuserid = emp_id;
     var rcretime = now;
     var lchguserid = emp_id;
     var lchgtime = now;
     var req_id = req.body.req_id;
	 var to_date="";
	 var maxCount="";
	 var success="";
				var from_date="";
				var from_location="";
				var to_location="";
     
        var empname = req.user.rows[0].user_name;
        var empaccess = req.user.rows[0].user_type;
        var pid = req.body.projectId;
     console.log('emp_id', emp_id);
     console.log('pid', pid);
     console.log('travelDate', travelDate);
	  console.log('tenDate', tenDate);
					 console.log("Cancel Request:::test3 ::test3:");
     pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result2) {
                 if (err) {
                     console.error('Error with table query', err);
                 } else {
                     console.log("result", result2);
                     empName = result2.rows['0'].emp_name;
                     console.log("empName", empName);
                     approverid = result2.rows['0'].emp_id;
                     console.log("approverid ::HII:", approverid);
                 }
                 console.log("req_id after generating", req_id);
                 console.log("approverid after generating", approverid);
                 console.log("tenDate", tenDate);
                 //console.log("tenDate.length", tenDate.length);
                 if (tenDate != undefined) {
                     console.log("tenDate", tenDate);
                     pdbconnect.query("Update travel_master_tbl set request_status=$1,lchg_user_id=$2,lchg_time=$3,modify_flg=$4, remarks=upper($5)  where req_id=$6", [ 'CPF', lchguserid, lchgtime,'Y',remarks,req_id], function(err, done) {
                         if (err) throw err;
                    
                        if (err) throw err;     
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                          if (err) throw err;
                    

						 success= "Travel request has been cancelled with Request Id:" + req_id + "and forwarded for further approval.";
                         req.flash('success', "Travel request has been cancelled with Request Id:" + req_id + "and forwarded for further approval.");
                         console.log("emp_id", emp_id);
                         console.log("req_id inside loop1", req_id);
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,pnr_number,ticket_number,free_text_1 from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;  
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                             
                             pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result) {
                                 if (err) {
                                     console.error('Error with table query1', err);
                                 } else {
                                     empName = result.rows['0'].emp_name;
                                     console.log("empName", empName);
                                     approverid = result.rows['0'].emp_id;
                                     console.log('hii APPVER', approverid);
                                 }
								var travelStatus =req.body.travelStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var paramString = "";
    console.log("inside viewTravelReqApplyStatus emp_id ::  ",emp_id);
    console.log("viewTravelReqApplyStatus travelStatus ::  ",travelStatus);


    if(travelStatus == null || travelStatus=="All"){
        queryStringTemp= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id];
    }
    else{
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id,travelStatus];
    }
    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('Error with table query', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("travelReqList :: ",travelReqList);
        }
        var recordCount="";
        recordCount=trvReqTempResult.rowCount;
        console.log('temp recordCount ::: ',recordCount);

        pdbconnect.query(queryStringMain,paramString, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('Error with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("travelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    console.log('recordCount ::: ',recordCountMain);
        var totalRecordCount= recordCountMain+recordCount;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TST' order by comm_code_id asc",function(err,result){
            cocd_travelStatus=result.rows;
            cocd_travelStatus_count=result.rowCount;

            
            console.log('cocd_travelStatus_count ::: ',cocd_travelStatus_count); 
					 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        } else {
                                            employee_name = empResult.rows['0'].emp_name;
                                            employee_email = empResult.rows['0'].emp_email;
                                            console.log('employee name ', employee_name);
                                            console.log('employee id ', employee_email);
                                        }
                                        pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
											
											
											pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1",['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                financemgr_name = empResult.rows['0'].emp_name;
                                                financemgr_email = empResult.rows['0'].emp_email;
                                                console.log('financemgr_name  ', financemgr_name);
                                                console.log('financemgr_email ', financemgr_email);
                                            }
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: financemgr_email,
                                                cc: approver_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been cancelled for' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').\n' + 'Kindly approve.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});


        res.render('travelModule/viewTravelReq',{
            
            cocd_travelStatus:cocd_travelStatus,
            cocd_travelStatus_count:cocd_travelStatus_count,
            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,

            emp_id:emp_id,
            emp_name:empname,
            req_id:req_id,
            emp_access:emp_access,
            project_id:project_id,
            approver_id:approver_id,
            from_date:from_date,
            to_date:to_date,
            from_location:from_location,
            to_location:to_location,
            request_status:request_status,
            remarks:remarks,
            free_text_1:free_text_1,
            free_text_2:free_text_2,
            free_text_3:free_text_3,
            recordCount:recordCount,
            recordCountMain:recordCountMain,
            travelStatus:travelStatus,
            totalRecordCount:totalRecordCount,
			success:success
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
                 console.log("req_id", req_id);
                 if (tenDate == undefined) {
                     console.log("inside else tenDate", tenDate);
                     console.log("inside else travelDate", travelDate);

                     //travelDate=new Date()
                   //travelDate= moment(travelDate).format('YYYY-MM-DD');
                       
                     console.log("inside else after formatting travelDate", travelDate);
                     pdbconnect.query("Update travel_master_tbl set request_status=$1,lchg_user_id=$2,lchg_time=$3,modify_flg=$4, remarks=upper($5)  where req_id=$6", ['CPF',  lchguserid, lchgtime,'Y',remarks,req_id], function(err, done) {
                         if (err) 
                         {
                                 throw err;
                         }else
                         {
                           console.log("updated in the travel_master_tbl")
                         }
                        
                 
                     pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist")
                         }
                        
    
                         console.log("emp_id", emp_id);
                         console.log("req_id", req_id);
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,pnr_number,ticket_number,free_text_1 from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                             if (err) throw err;
                             //var emp_id=resultValue.rows;
                             var rcount = resultValue.rowCount;
                             console.log("Inside count", rcount);
                             //console.log("emp_id",emp_id);
                           
                             pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function(err, result) {
                                 if (err) {
                                     console.error('Error with table query1', err);
                                 } else {
                                     empName = result.rows['0'].emp_name;
                                     console.log("empName", empName);
                                     approverid = result.rows['0'].emp_id;
                                     console.log('hii', approverid);
                                 }
                                  success = "Travel request has been cancelled with Request Id:" + req_id + "and forwarded for furthure approval.";
                                 req.flash('success',"Travel request has been rised Successfully with request_id:"+ req_id +".") ; 
								var travelStatus =req.body.travelStatus;
    var queryStringTemp = "";
    var queryStringMain = "";
    var paramString = "";
    console.log("inside viewTravelReqApplyStatus emp_id ::  ",emp_id);
    console.log("viewTravelReqApplyStatus travelStatus ::  ",travelStatus);


    if(travelStatus == null || travelStatus=="All"){
        queryStringTemp= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain= "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id];
    }
    else{
        queryStringTemp = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl_temp t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        queryStringMain = "SELECT t1.req_id,t1.emp_id,t1.emp_name,t1.emp_access,t1.approver_id,t1.project_id,t1.from_date ,t1.to_date, t1.from_location, t1.to_location ,t1.remarks,t1.request_status ,t1.free_text_1,t1.free_text_2,t1.free_text_3 , t2.comm_code_desc FROM travel_master_tbl t1, common_code_tbl t2 where t1.emp_id=$1 AND t1.request_status=$2 and t1.del_flg='N' and t2.comm_code_id=t1.request_status and t2.code_id = 'TST' and t2.del_flg='N' order by t1.req_id::integer desc";

        paramString = [emp_id,travelStatus];
    }
    pdbconnect.query(queryStringTemp,paramString, function(err, trvReqTempResult) {

        if(err){
            console.error('Error with table query', err);
        } 
        else{
            var travelReqList = trvReqTempResult.rows;
            console.log("travelReqList :: ",travelReqList);
        }
        var recordCount="";
        recordCount=trvReqTempResult.rowCount;
        console.log('temp recordCount ::: ',recordCount);

        pdbconnect.query(queryStringMain,paramString, function(err, trvReqMainResult) {
            
                    if(err){
                        console.error('Error with table query', err);
                    } 
                    else{
                        var travelReqMainList = trvReqMainResult.rows;
                        console.log("travelReqMainList :: ",travelReqMainList);
                    }
                    var recordCountMain="";
                    recordCountMain=trvReqMainResult.rowCount;
                    console.log('recordCount ::: ',recordCountMain);
        var totalRecordCount= recordCountMain+recordCount;

        pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TST' order by comm_code_id asc",function(err,result){
            cocd_travelStatus=result.rows;
            cocd_travelStatus_count=result.rowCount;

            
            console.log('cocd_travelStatus_count ::: ',cocd_travelStatus_count);  
			 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        } else {
                                            employee_name = empResult.rows['0'].emp_name;
                                            employee_email = empResult.rows['0'].emp_email;
                                            console.log('employee name ', employee_name);
                                            console.log('employee id ', employee_email);
                                        }
                                        pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl where req_id=$1)", [req_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
											
											
											pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1",['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                financemgr_name = empResult.rows['0'].emp_name;
                                                financemgr_email = empResult.rows['0'].emp_email;
                                                console.log('financemgr_name  ', financemgr_name);
                                                console.log('financemgr_email ', financemgr_email);
                                            }
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: financemgr_email,
                                                cc: approver_email,
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been modified for' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').\n' + 'Kindly approve.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});

        res.render('travelModule/viewTravelReq',{
            
            cocd_travelStatus:cocd_travelStatus,
            cocd_travelStatus_count:cocd_travelStatus_count,
            travelReqList:travelReqList,
            travelReqMainList:travelReqMainList,

            emp_id:emp_id,
            emp_name:empname,
            req_id:req_id,
            emp_access:emp_access,
            project_id:project_id,
            approver_id:approver_id,
            from_date:from_date,
            to_date:to_date,
            from_location:from_location,
            to_location:to_location,
            request_status:request_status,
            remarks:remarks,
            free_text_1:free_text_1,
            free_text_2:free_text_2,
            free_text_3:free_text_3,
            recordCount:recordCount,
            recordCountMain:recordCountMain,
            travelStatus:travelStatus,
            totalRecordCount:totalRecordCount,
			success:success
        });
    });
    });
});
		});
		});
	});
                             });
					 });});});
                 };
                        
                            });
				 }
      			   
 }
router.get('/modifytravelDetailsQueue', modifytravelDetailsQueue);


var req_id="";
var empname="";
var empid="";
var project_id="";
var from_date="";
var to_date="";
var from_location="";
var to_location="";
var approver_id="";
var request_status="";
var remarks="";
var free_text_1="";
var free_text_3="";
var free_text_2="";
function modifytravelDetailsQueue(req, res) {
    var emp_id =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var emp_name =req.user.rows[0].user_name;

  if(emp_access == 'L3'||emp_access == 'L2'){
  pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3 FROM travel_master_tbl_temp where emp_id=$1 and request_status in($2,$3)  order by req_id::integer desc",[emp_id,'SUB','MOD'], function(err, pendingResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
        
        
              var pendingStatusData = pendingResult.rows;
              console.log("row",pendingStatusData);

    }
          

          pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks FROM travel_master_tbl where emp_id=$1 and request_status=$2 and del_flg=$3 order by from_date  desc",[emp_id,'APM','N'], function(err, approvedResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              var approvedData = approvedResult.rows;
              console.log("approvedData",approvedData);
              if(typeof approvedResult.rowCount!= 'undefined')
              {
              if(approvedResult.rowCount>10)
              {
                approvedResult.rowCount=10;
				
              }
              else
              {
                approvedResult.rowCount=approvedResult.rowCount;
				
              }
            }
            }
    
   

           

           pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks FROM travel_master_tbl where emp_id=$1 and request_status=$2 and del_flg=$3 order by req_id::integer desc",[emp_id,'APF','N'], function(err, confirmResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              var confirmData = confirmResult.rows;
              console.log("confirmData",confirmData);
              if(typeof confirmResult.rowCount!= 'undefined')
              {
              if(confirmResult.rowCount>10)
              {
                confirmResult.rowCount=10;
              }
              else
              {
                confirmResult.rowCount=confirmResult.rowCount;
              }
            }
            }

    
  var maxCount="";
    
     if((pendingResult.rowCount>=approvedResult.rowCount) && (pendingResult.rowCount>=confirmResult.rowCount))
      {
        maxCount=pendingResult.rowCount;
        console.log('maxCount AFTER LOOP11:::',maxCount);
      }
      else if((approvedResult.rowCount>=pendingResult.rowCount) && (approvedResult.rowCount>=confirmResult.rowCount)) 
      {
        maxCount=approvedResult.rowCount;
        console.log('maxCount AFTER22 LOOP:::',maxCount);
      }
     
      else 
      {
        maxCount=confirmResult.rowCount;
        console.log('maxCount AFTER44 LOOP:::',maxCount);
 
      }
    console.log('maxCount AFTER LOOP66:::',maxCount);

  res.render('travelModule/modifyTravelQueue',{
  
      approvedData:approvedData,
      pendingStatusData:pendingStatusData,
      confirmData:confirmData,
      emp_id:empid,
      emp_name:emp_name,
      req_id:req_id,
      emp_access:emp_access,
      project_id:project_id,
      approver_id:approver_id,
      from_date:from_date,
      to_date:to_date,
      from_location:from_location,
      to_location:to_location,
      request_status:request_status,
      remarks:remarks,
      free_text_1:free_text_1,
      free_text_3:free_text_3,
      free_text_2:free_text_2,
      maxCount:maxCount
    });

    });
    });
    });
}else{
	res.redirect('/admin-dashboard/adminDashboard/admindashboard');
}

};
router.get('/canceltravelDetailsQueue', canceltravelDetailsQueue);


var req_id="";
var empname="";
var empid="";
var project_id="";
var from_date="";
var to_date="";
var from_location="";
var to_location="";
var approver_id="";
var request_status="";
var remarks="";
var free_text_1="";
var free_text_3="";
var free_text_2="";
function canceltravelDetailsQueue(req, res) {
    var emp_id =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var emp_name =req.user.rows[0].user_name;

  if(emp_access=='L3'||emp_access=='L2'){
  pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,from_date ,to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3 FROM travel_master_tbl_temp where emp_id=$1 and request_status in($2,$3)  order by req_id::integer desc",[emp_id,'SUB','MOD'], function(err, pendingResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
        
        
              var pendingStatusData = pendingResult.rows;
              console.log("row",pendingStatusData);

    }
          

          pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks FROM travel_master_tbl where emp_id=$1 and request_status=$2 and del_flg=$3 order by from_date  desc",[emp_id,'APM','N'], function(err, approvedResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              var approvedData = approvedResult.rows;
              console.log("approvedData",approvedData);
              if(typeof approvedResult.rowCount!= 'undefined')
              {
              if(approvedResult.rowCount>10)
              {
                approvedResult.rowCount=10;
				
              }
              else
              {
                approvedResult.rowCount=approvedResult.rowCount;
				
              }
            }
            }
    
   

           

           pdbconnect.query("SELECT req_id,emp_id,emp_name,project_id,from_date ,to_date, from_location, to_location ,remarks FROM travel_master_tbl where emp_id=$1 and request_status=$2 and del_flg=$3 order by req_id::integer desc",[emp_id,'APF','N'], function(err, confirmResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
              var confirmData = confirmResult.rows;
              console.log("confirmData",confirmData);
              if(typeof confirmResult.rowCount!= 'undefined')
              {
              if(confirmResult.rowCount>10)
              {
                confirmResult.rowCount=10;
              }
              else
              {
                confirmResult.rowCount=confirmResult.rowCount;
              }
            }
            }

    
  var maxCount="";
    
     if((pendingResult.rowCount>=approvedResult.rowCount) && (pendingResult.rowCount>=confirmResult.rowCount))
      {
        maxCount=pendingResult.rowCount;
        console.log('maxCount AFTER LOOP11:::',maxCount);
      }
      else if((approvedResult.rowCount>=pendingResult.rowCount) && (approvedResult.rowCount>=confirmResult.rowCount)) 
      {
        maxCount=approvedResult.rowCount;
        console.log('maxCount AFTER22 LOOP:::',maxCount);
      }
     
      else 
      {
        maxCount=confirmResult.rowCount;
        console.log('maxCount AFTER44 LOOP:::',maxCount);
 
      }
    console.log('maxCount AFTER LOOP66:::',maxCount);

  res.render('travelModule/cancelTravelQueue',{
  
      approvedData:approvedData,
      pendingStatusData:pendingStatusData,
      confirmData:confirmData,
      emp_id:empid,
      emp_name:emp_name,
      req_id:req_id,
      emp_access:emp_access,
      project_id:project_id,
      approver_id:approver_id,
      from_date:from_date,
      to_date:to_date,
      from_location:from_location,
      to_location:to_location,
      request_status:request_status,
      remarks:remarks,
      free_text_1:free_text_1,
      free_text_3:free_text_3,
      free_text_2:free_text_2,
      maxCount:maxCount
	 
    });

    });
    });
    });
    }else{
	res.redirect('/admin-dashboard/adminDashboard/admindashboard');
}


};
router.post('/travelOHReq', travelOHReq);

var req_id = "";
var emp_id = "";
var from_date = "";
// var empName  ="";
 var success ="";
  var approverid ="";
  var rcount ="";
  var code1="";
function travelOHReq(req, res) {


    var test = req.body.test;

    if (test == "Submit") {
        var travelDate = req.body.travelDate;
        var tenDate = req.body.tenDate;
        var now = new Date();
		 var emp_id = req.user.rows[0].user_id;
        var rcreuserid = emp_id;
        var rcretime = now;
        var lchguserid = emp_id;
        var lchgtime = now;
       
        var empname = req.user.rows[0].user_name;
        var empaccess = req.user.rows[0].user_type;
        var pid = req.body.pid;
        var travelDate = req.body.travelDate;
        var tenDate = req.body.tenDate;
        var fromLoc = req.body.fromLoc;
        var toLoc = req.body.toLoc;
        var rmks = req.body.rmks;
        var free_text_1=req.body.free_text_1;
        var emp_access = req.body.emp_access;
        var emp_Name="";
		var valFlag="";
        console.log('emp_Name', emp_Name);
        console.log('emp_id', emp_id.length);
        console.log('travelDate', travelDate);
        console.log('pid', pid);
		
       pdbconnect.query("SELECT * from travel_master_tbl_temp where emp_id=$1 and project_id=$2 and del_flg=$3", [emp_id,pid,'N'], function(err, valDateLoc) {
        if (err) {
            console.error('Error with table query', err);
        } else {
			console.log("valDateLoc.rowCount::",valDateLoc.rowCount);
            console.log("result::", valDateLoc);
		}
		
		pdbconnect.query("SELECT * from travel_master_tbl where emp_id=$1 and project_id=$2 and del_flg=$3 and request_status not in($4,$5,$6,$7,$8,$9)", [emp_id,pid,'N','CAN','RJF','RJD','RJM','CAF','CPF'], function(err, masterTblcheck) {
        if (err) {
            console.error('Error with table query', err);
        } else {
			console.log("valDateLoc.rowCount::",masterTblcheck.rowCount);
            console.log("result::", masterTblcheck);
		}
	   
			/* if (valDateLoc.rowCount != 0){
				 
				for (i=0 ; i<valDateLoc.rowCount; i++){
				   
			   console.log("inside validation for loop:::");
		    val_from_date=valDateLoc.rows[i].from_date.toDateString();
            console.log("from_date", val_from_date);
             val_from_location=valDateLoc.rows[i].from_location;
			 
            console.log("from_location ::HII:", val_from_location);
			 var duration = moment.duration(moment(travelDate).diff(moment(val_from_date)));
			    var days = duration.asDays();
				console.log("days ::HII:", days);
			//	if ( travelDate == val_from_date && fromLoc ==  val_from_location){
						 if(days<=0 && fromLoc ==  val_from_location){
						 console.log("***********INSIDE VAL IF*************");
						req.flash('error',"Travel request  with  same travel date for the same location has been raised already");
						var error = "Travel request  with the same travel date for the same location has been raised already.";
				valFlag=true;
						 }
						 else{
							valFlag=false; 
						 }
						}
				 }*/
				 
				 console.log("masterTblcheck.rowCount:::OHOH::", masterTblcheck.rowCount);
if (masterTblcheck.rowCount != 0){
			    
			   for (i=0 ; i<masterTblcheck.rowCount; i++){
				   
			   console.log("inside validation for loop:::");
		    val_from_date=masterTblcheck.rows[i].from_date.toDateString();
            console.log("from_date", val_from_date);
             val_from_location=masterTblcheck.rows[i].from_location;
			 
            console.log("from_location ::HII:", val_from_location);
			 var duration = moment.duration(moment(travelDate).diff(moment(val_from_date)));
			    var days = duration.asDays();
				console.log("days ::HII:", days);
			//	if ( travelDate == val_from_date && fromLoc ==  val_from_location){
						 if(days==0 && fromLoc ==  val_from_location){
						 console.log("***********INSIDE VAL IF*************");
						req.flash('error',"Travel request  with  same travel date for the same location has been raised already");
						var error = "Travel request  with the same travel date for the same location has been raised already.";
				     valFlag=true;
						 }
						 else{
							valFlag=false; 
						 }	
						 
						  }
			}				 
		if(valFlag == true){

			pdbconnect.query("SELECT project_id from project_master_tbl where closure_flg=$1", ['N'], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
            var pid = result2.rows;
            console.log("pid", pid);
            var pid_count = result2.rowCount;
            console.log("pid_count", pid_count);
        }


		res.render('travelModule/travelOHDetails', {

                emp_id: emp_id,
                emp_name: empname,
                emp_access: emp_access,
                empName: empName,
                pid: pid,
                project_id:project_id,
                pid_count: pid_count,
				error:error
                
            });
            
        });
				 
			 }else if(valFlag == false){
				 var pnr_number="";
				 var ticket_number="";
				 var free_text_1="";
				  pdbconnect.query("SELECT * from travel_master_tbl_temp", function(err, resultset) {
                if (err) throw err;
                 rcount = resultset.rowCount;
                console.log("rcount", rcount);
               var seq = "travelreq";

               
                        pdbconnect.query("select nextval($1)::text code1",[seq],function(err,result){
                           if(err) throw err;
                           code1 = result.rows['0'].code1; 
                           console.log("select done");
                           console.log("code1",code1);
    

                           console.log("code1",code1);
                           req_id = code1;
   
                
                          
                    
                        

                    console.log("req_id after generating", req_id);
                    //console.log("approverid after generating", approverid);
                    console.log("tenDate",tenDate);
                    console.log("tenDate.length",tenDate.length);
                    //tenDate=tenDate.toString();
                    console.log("tenDate.length",tenDate.length);
                   
                    if(tenDate.length!= "0")
                    {
                          console.log("tenDate",tenDate);
                    pdbconnect.query("INSERT INTO travel_master_tbl(req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,request_status,del_flg,lchg_user_id,lchg_time,budgetovershoot_flg,modify_flg,rcre_time,rcre_user_id) values($1,$2,$3,$4,$5,$6,$7,upper($8),upper($9),upper($10),$11,$12,$13,$14,$15,$16,$17,$18,$19)", [req_id, emp_id, empname, empaccess, pid, travelDate, tenDate, fromLoc, toLoc, rmks, 'NA', 'APM','N',lchguserid, lchgtime,'N','N',rcretime,rcreuserid], function(err, done) {
                        if (err) throw err;
                       //req.flash('success',"Travel request has been initiated successfully with Request Id:"+ req_id +".");
                        // res.redirect('/travelModule/travelCyber');
                        //res.redirect(req.get('referer'));
                        //  res.redirect('/travelModule/travel/travel');
                         pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist")
                         }    


                    console.log("emp_id",emp_id);
                      console.log("req_id inside loop1",req_id);
                        pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,request_status,rcre_user_id,rcre_time,lchg_user_id,lchg_time from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                            if (err) throw err;
                            //var emp_id=resultValue.rows;  
                            var rcount = resultValue.rowCount;
                            console.log("Inside count",rcount);
                            //console.log("emp_id",emp_id);

                            var emp_id = resultValue.rows['0'].emp_id;
                            var emp_name = resultValue.rows['0'].emp_name;
                            var emp_access = resultValue.rows['0'].emp_access;
                            var project_id = resultValue.rows['0'].project_id;
                            var from_date = resultValue.rows['0'].from_date;
                            var to_date = resultValue.rows['0'].to_date;
                            var from_location = resultValue.rows['0'].from_location;
                            var to_location = resultValue.rows['0'].to_location;
                            var remarks = resultValue.rows['0'].remarks;
                             var approverid = resultValue.rows['0'].approver_id;

                                 success = "Travel request has been initiated successfully with Request Id:" + req_id + ".";
                                 req.flash('success',"Travel request has been initiated Successfully with request_id:"+ req_id +".") ; 
                          
                             //   from_date = from_date.toDateString();
                               // to_date = to_date.toDateString();
									pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1",['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                financemgr_name = empResult.rows['0'].emp_name;
                                                financemgr_email = empResult.rows['0'].emp_email;
                                                console.log('financemgr_name  ', financemgr_name);
                                                console.log('financemgr_email ', financemgr_email);
                                            }
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: financemgr_email,
                                              
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been initiated for' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').\n' + 'Kindly approve.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
                                res.render('travelModule/travelCyber', {

                                    emp_id: emp_id,
                                    emp_name: empname,
                                    project_id: project_id,
                                    emp_access: emp_access,
                                    from_date: from_date,
                                    to_date: to_date,
                                    from_location: from_location,
                                    to_location: to_location,
                                    remarks: remarks,
                                    success: success,
									pnr_number:pnr_number,
									ticket_number:ticket_number,
									free_text_1:free_text_1,
                                   approverid:approverid,
                                   newError:newError
                                });
									});
                            });
                          });
					});

                } 
                 console.log("req_id",req_id);
                  
                    if(tenDate.length== "0")
                    {
                          console.log("inside else tenDate",tenDate);
                              pdbconnect.query("INSERT INTO travel_master_tbl(req_id,emp_id,emp_name,emp_access,project_id,from_date,from_location,to_location,remarks,approver_id,request_status,del_flg,lchg_user_id,lchg_time,budgetovershoot_flg,modify_flg,rcre_time,rcre_user_id) values($1,$2,$3,$4,$5,$6,$7,upper($8),upper($9),upper($10),$11,$12,$13,$14,$15,$16,$17,$18)", [req_id, emp_id, empname, empaccess, pid, travelDate, fromLoc, toLoc, rmks, 'NA', 'APM','N',lchguserid, lchgtime,'N','N',rcretime,rcreuserid], function(err, done) {
                        if (err) throw err;
                        else {
                                    
                                }
                        //req.flash('success',"Travel request has been rised Successfully with request_id:"+ req_id +".");
                        // res.redirect('/travelModule/travelCyber');
                        //res.redirect(req.get('referer'));
                        //  res.redirect('/travelModule/travel/travel');
                   pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist")
                         }
                    
                      console.log("emp_id",emp_id);
                      console.log("req_id",req_id);
                        pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,request_status,rcre_user_id,rcre_time,lchg_user_id,lchg_time from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                            if (err) throw err;
                            //var emp_id=resultValue.rows;
                            var rcount = resultValue.rowCount;
                            console.log("Inside count",rcount);
                            //console.log("emp_id",emp_id);
                     
            
                            var emp_id = resultValue.rows['0'].emp_id;
                            var emp_name = resultValue.rows['0'].emp_name;
                            var emp_access = resultValue.rows['0'].emp_access;
                            var project_id = resultValue.rows['0'].project_id;
                            var from_date = resultValue.rows['0'].from_date;
                            var to_date = resultValue.rows['0'].to_date;
                            var from_location = resultValue.rows['0'].from_location;
                            var to_location = resultValue.rows['0'].to_location;
                            var remarks = resultValue.rows['0'].remarks;
                            var approverid=resultValue.rows['0'].approver_id;

                           
                              
                                 success = "Travel request has been initiated successfully with Request Id:" + req_id + ".";
                               req.flash('success',"Travel request has been initiated Successfully with request_id:"+ req_id +".") ; 
                          
                               // from_date = from_date.toDateString();
                                 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1",['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                financemgr_name = empResult.rows['0'].emp_name;
                                                financemgr_email = empResult.rows['0'].emp_email;
                                                console.log('financemgr_name  ', financemgr_name);
                                                console.log('financemgr_email ', financemgr_email);
                                            }
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: financemgr_email,
                                              
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been initiated for' + project_id + ' to travel from  ' + fromLoc + '  to ' + toLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').\n' + 'Kindly approve.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
                                    
                                              
                                res.render('travelModule/travelCyber', {

                                    emp_id: emp_id,
                                    emp_name: empname,
                                    approverid:approverid,
                                    empName: empName,
                                    project_id: project_id,
                                    emp_access: emp_access,
                                    from_date: from_date,
                                    to_date:to_date,
                                    from_location: from_location,
                                    to_location: to_location,
                                    remarks: remarks,
									pnr_number:pnr_number,
									ticket_number:ticket_number,
									free_text_1:free_text_1,
                                    success: success,
                                    newError:newError
                                });
                                           }); 
                                });
							  });
							  });
                        };
                        
                            });
                        
                         });
				 
			 }
		else if(masterTblcheck.rowCount==0){
        pdbconnect.query("SELECT * from travel_master_tbl_temp", function(err, resultset) {
                if (err) throw err;
                 rcount = resultset.rowCount;
                console.log("rcount", rcount);
               var seq = "travelreq";

               
                        pdbconnect.query("select nextval($1)::text code1",[seq],function(err,result){
                           if(err) throw err;
                           code1 = result.rows['0'].code1; 
                           console.log("select done");
                           console.log("code1",code1);
    

                           console.log("code1",code1);
                           req_id = code1;
   
                
                          
                    
                        

                    console.log("req_id after generating", req_id);
                    //console.log("approverid after generating", approverid);
                    console.log("tenDate",tenDate);
                    console.log("tenDate.length",tenDate.length);
                    //tenDate=tenDate.toString();
                    console.log("tenDate.length",tenDate.length);
                   
                    if(tenDate.length!= "0")
                    {
                          console.log("tenDate",tenDate);
                    pdbconnect.query("INSERT INTO travel_master_tbl(req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,request_status,del_flg,lchg_user_id,lchg_time,budgetovershoot_flg,modify_flg,rcre_time,rcre_user_id) values($1,$2,$3,$4,$5,$6,$7,upper($8),upper($9),upper($10),$11,$12,$13,$14,$15,$16,$17,$18,$19)", [req_id, emp_id, empname, empaccess, pid, travelDate, tenDate, fromLoc, toLoc, rmks, 'NA', 'APM',lchguserid, lchgtime,'N','N',,rcretime,rcreuserid], function(err, done) {
                        if (err) throw err;
                      // req.flash('success',"Travel request has been submitted successfully with Request Id:"+ req_id +".");
                        // res.redirect('/travelModule/travelCyber');
                        //res.redirect(req.get('referer'));
                        //  res.redirect('/travelModule/travel/travel');
                            
						 pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist")
                         }

                    console.log("emp_id",emp_id);
                      console.log("req_id inside loop1",req_id);
                        pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,request_status,rcre_user_id,rcre_time,lchg_user_id,lchg_time from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                            if (err) throw err;
                            //var emp_id=resultValue.rows;  
                            var rcount = resultValue.rowCount;
                            console.log("Inside count",rcount);
                            //console.log("emp_id",emp_id);

                            var emp_id = resultValue.rows['0'].emp_id;
                            var emp_name = resultValue.rows['0'].emp_name;
                            var emp_access = resultValue.rows['0'].emp_access;
                            var project_id = resultValue.rows['0'].project_id;
                            var from_date = resultValue.rows['0'].from_date;
                            var to_date = resultValue.rows['0'].to_date;
                            var from_location = resultValue.rows['0'].from_location;
                            var to_location = resultValue.rows['0'].to_location;
                            var remarks = resultValue.rows['0'].remarks;
                             var approverid = resultValue.rows['0'].approver_id;

                                 success = "Travel request has been initiated successfully with Request Id:" + req_id + ".";
                                 req.flash('success',"Travel request has been initiated Successfully with request_id:"+ req_id +".") ; 
                          
                              //  from_date = from_date.toDateString();
                              //  to_date = to_date.toDateString();
							  pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1",['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                financemgr_name = empResult.rows['0'].emp_name;
                                                financemgr_email = empResult.rows['0'].emp_email;
                                                console.log('financemgr_name  ', financemgr_name);
                                                console.log('financemgr_email ', financemgr_email);
                                            }
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: financemgr_email,
                                              
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been initiated for' + project_id + ' to travel from  ' + fromLoc + '  to ' + fromLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').\n' + 'Kindly approve.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
                                    

                                res.render('travelModule/travelCyber', {

                                    emp_id: emp_id,
                                    emp_name: empname,
                                    project_id: project_id,
                                    emp_access: emp_access,
                                    from_date: from_date,
                                    to_date: to_date,
                                    from_location: from_location,
                                    to_location: to_location,
                                    remarks: remarks,
                                    success: success,
									pnr_number:pnr_number,
									ticket_number:ticket_number,
									free_text_1:free_text_1,
                                   approverid:approverid,
                                   newError:newError
                                });
							  });
                            });
                          });
					});

                } 
                 console.log("req_id",req_id);
                  
                    if(tenDate.length== "0")
                    {
                          console.log("inside else tenDate",tenDate);
                              pdbconnect.query("INSERT INTO travel_master_tbl(req_id,emp_id,emp_name,emp_access,project_id,from_date,from_location,to_location,remarks,approver_id,request_status,del_flg,lchg_user_id,lchg_time,budgetovershoot_flg,modify_flg,rcre_time,rcre_user_id) values($1,$2,$3,$4,$5,$6,$7,upper($8),upper($9),upper($10),$11,$12,$13,$14,$15,$16,$17,$18)", [req_id, emp_id, empname, empaccess, pid, travelDate, fromLoc, toLoc, rmks, 'NA', 'APM',lchguserid, lchgtime,'N','N',rcretime,rcreuserid], function(err, done) {
                        if (err) throw err;
                        else {
                                    
                                }
                        //req.flash('success',"Travel request has been rised Successfully with request_id:"+ req_id +".");
                        // res.redirect('/travelModule/travelCyber');
                        //res.redirect(req.get('referer'));
                        //  res.redirect('/travelModule/travel/travel');
                   pdbconnect.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl where req_id=$1)",[req_id],function(err,done){    
                
                          if (err)
                         {
                                  throw err;
                         }else
                         {
                           console.log("inserted in the travel_master_tbl_hist")
                         }
                    
                      console.log("emp_id",emp_id);
                      console.log("req_id",req_id);
                         pdbconnect.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,request_status,rcre_user_id,rcre_time,lchg_user_id,lchg_time from travel_master_tbl where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function(err, resultValue) {
                            if (err) throw err;
                            //var emp_id=resultValue.rows;
                            var rcount = resultValue.rowCount;
                            console.log("Inside count",rcount);
                            //console.log("emp_id",emp_id);
                     
            
                            var emp_id = resultValue.rows['0'].emp_id;
                            var emp_name = resultValue.rows['0'].emp_name;
                            var emp_access = resultValue.rows['0'].emp_access;
                            var project_id = resultValue.rows['0'].project_id;
                            var from_date = resultValue.rows['0'].from_date;
                            var to_date = resultValue.rows['0'].to_date;
                            var from_location = resultValue.rows['0'].from_location;
                            var to_location = resultValue.rows['0'].to_location;
                            var remarks = resultValue.rows['0'].remarks;
                            var approverid=resultValue.rows['0'].approver_id;

                           
                              
                                success = "Travel request has been initiated successfully with Request Id:" + req_id + ".";
                               req.flash('success',"Travel request has been initiated Successfully with request_id:"+ req_id +".") ; 
                          
                              //  from_date = from_date.toDateString();
                                 pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_access=$1",['F1'], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                financemgr_name = empResult.rows['0'].emp_name;
                                                financemgr_email = empResult.rows['0'].emp_email;
                                                console.log('financemgr_name  ', financemgr_name);
                                                console.log('financemgr_email ', financemgr_email);
                                            }
                                            console.log('smtpTransport call ');
                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user:  'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });
											var emp_id = req.user.rows[0].user_id;
                                            var mailOptions = {
                                                to: financemgr_email,
                                              
                                                from:  'amber@nurture.co.in',
                                                subject: 'Travel Request notification',
                                                text: 'Travel Request ' + req_id + ' has been initiated for' + project_id + ' to travel from  ' + fromLoc + '  to ' + fromLoc + ' on ' + from_date + ' for employee ' + empname + '(' + emp_id + ').\n' + 'Kindly approve.  \n' + '\n' + '\n' + '\n' + '\n' + ' - Travel Request System'
                                            };
                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});
                                    
                                    
                                              
                                res.render('travelModule/travelCyber', {

                                    emp_id: emp_id,
                                    emp_name: empname,
                                    approverid:approverid,
                                    empName: empName,
                                    project_id: project_id,
                                    emp_access: emp_access,
                                    from_date: from_date,
                                    to_date:to_date,
                                    from_location: from_location,
                                    to_location: to_location,
                                    remarks: remarks,
									pnr_number:pnr_number,
									ticket_number:ticket_number,
									free_text_1:free_text_1,
                                    success: success,
                                    newError:newError
                                });
						 });
						 }); 
                                });
							  });
                        };
                        
                            });
                        
                         });
		}
			 });

		
 });	
	   }; 
	   	}
     	     


 
module.exports = router;