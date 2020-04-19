var express = require('express');
var router = express.Router();
var pdbconnect = require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');
var fs =require('fs');
var multer=require('multer');

console.log('reimbursement');
router.get('/initiateRem', initiateRem);
router.post('/dropzoneUpload', dropzoneUpload);
router.post('/dropzoneRemove', dropzoneRemove);
router.post('/reuploadBills', reuploadBills);

router.post('/shadow',function(req,res)
{
    console.log('shadow',req.path);
    res.send("message to be routed to bluetooth");
});

var pid = "";
var pid_count = "";
var empName = "";
var amt_payable = "";
var remarks = "";
var recCount = "";
var user_remarks = "";
var Manager_name ="";
var Manager_id="";

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

  pdbconnect.query("SELECT project_id from project_master_tbl",function(err, result2) {
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
            if(locresult.rowCount!=0)
            {
            var  resultList = locresult.rows;
           }
           else
           {
            var  resultList = "";
           }
            console.log("project_allocation_date", project_allocation_date);
            console.log("relieving_date", relieving_date);
          }
        pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_access in ($1)", ['F1'], function(err, result4) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    console.log("result in remb", result4);
                    var hraccess = result4.rows;
                    console.log("access in remb", hraccess);
                    var hraccess_count = result4.rowCount;
                    console.log("hraccess_count in remb", hraccess_count);
                    var hrId = result4.emp_id;
                    var hrName = result4.emp_name;
                    console.log("hrId in remb", hrId);
                    console.log("hrName in remb", hrName);
                }
                pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TOB'  order by comm_code_id asc", function(err, result) {
                    comm_code_tnu = result.rows;
                    comm_code_tnu_count = result.rowCount;
                    console.log("classdesc::", comm_code_tnu);
                    console.log("classdesc_count:::", comm_code_tnu_count);
                    res.render('reimbursementModule/initiateRem', {
                        emp_id: emp_id,
                        emp_name: emp_name,
                        emp_access: emp_access,
                        pid: pid,
                        project_id: project_id,
                        pid_count: pid_count,
                        empName: empName,
                        hraccess: hraccess,
                        hraccess_count: hraccess_count,
                        hrId: hrId,
                        hrName: hrName,
                        amt_payable: amt_payable,
                        remarks: remarks,
                        user_remarks: user_remarks,
                        recCount: recCount,
                        comm_code_tnu_count: comm_code_tnu_count,
                        comm_code_tnu: comm_code_tnu,
                        Manager_name:Manager_name,
                        Manager_id:Manager_id,
                        defProjectId:defProjectId,
                        resultList:resultList
                    });
                });
           
            });
        });
       });
       
     });
    });
   });
};


function initiateRem(req, res) {
     
    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;
    if(emp_access=='L3'||emp_access=='L2'||emp_access=='L1')
    {
    var remb_id = req.query.remb_id;
    var project_id = req.query.project_id;
    console.log('emp_id in remb', emp_id);
    console.log('emp_access in remb', emp_access);
    console.log('emp_name in remb', emp_name);
    console.log('remb_id', remb_id);
    console.log('project_id', project_id);
    var empL1 = "L1";
    var empL2 = "L2";
    pdbconnect.query("SELECT project_id from project_alloc_tbl where emp_id = LOWER($1)", [emp_id], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result in remb", result2);
            var pid = result2.rows;
            console.log("pid in remb", pid);
            var pid_count = result2.rowCount;
            console.log("pid_count in remb", pid_count);
        }
         pdbconnect.query("SELECT project_id from project_alloc_tbl where emp_id=$1 order by percentage_alloc desc", [emp_id], function(err, projectList) {
        if (err) {
            console.error('Error with table query', err);
        } else {
             
            console.log("projectList", projectList);
            if(projectList.rowCount!=0)
            {
            var defProjectId = projectList.rows[0].project_id;
            console.log("defProjectId", defProjectId);
            var pLst_count = projectList.rowCount;
            console.log("pLst_count", pLst_count);
           }
        }
        pdbconnect.query("SELECT emp_name,emp_id from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where project_id=$1 and emp_id=$2)", [defProjectId,emp_id], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
           // var empName = result2.rows;
           if(result2.rowCount!=0)
            {
             Manager_name=result2.rows['0'].emp_name;
             Manager_id=result2.rows['0'].emp_id
            console.log("Manager_name", Manager_name);
        }
        else{
            Manager_name="";
             Manager_id="";
        }

        }
        pdbconnect.query("SELECT project_allocation_date,emp_project_relieving_date from project_alloc_tbl where project_id=$1 and emp_id=$2", [defProjectId,emp_id], function(err, locresult) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            if(locresult.rowCount!=0)
            {
            var project_allocation_date=locresult.rows['0'].project_allocation_date;
            var relieving_date=locresult.rows['0'].emp_project_relieving_date;
           }else
           {
            var project_allocation_date="";
            var relieving_date="";
           }
            var  resultList = locresult.rows;
            console.log("project_allocation_date", project_allocation_date);
            console.log("relieving_date", relieving_date);
          }
         // for Fetching the from location and to location
        //   pdbconnect.query("SELECT project_loc from project_master_tbl where project_id in ($1,$2)", [defProjectId], function(err, result2) {
        // if (err) {
        //     console.error('Error with table query', err);
        // } else {
        //     console.log("result", result2);
        // }
        // pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_access in ($1,$2)", [empL1, empL2], function(err, result3) {
        //     if (err) {
        //         console.error('Error with table query', err);
        //     } else {
        //         console.log("result in remb", result3);
        //         var access = result3.rows;
        //         console.log("access in remb", access);
        //         var access_count = result3.rowCount;
        //         console.log("access_count in remb", access_count);
        //         var reprtMgrId = result3.emp_id;
        //         var reportingMgr = result3.emp_name;
        //         console.log("reprtMgrId in remb", reprtMgrId);
        //         console.log("reportingMgr in remb", reportingMgr);
        //     }
            pdbconnect.query("SELECT emp_id, emp_name from emp_master_tbl where emp_access in ($1)", ['F1'], function(err, result4) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    console.log("result in remb", result4);
                    var hraccess = result4.rows;
                    console.log("access in remb", hraccess);
                    var hraccess_count = result4.rowCount;
                    console.log("hraccess_count in remb", hraccess_count);
                    var hrId = result4.emp_id;
                    var hrName = result4.emp_name;
                    console.log("hrId in remb", hrId);
                    console.log("hrName in remb", hrName);
                }
                pdbconnect.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TOB'  order by comm_code_id asc", function(err, result) {
                    comm_code_tnu = result.rows;
                    comm_code_tnu_count = result.rowCount;
                    console.log("classdesc::", comm_code_tnu);
                    console.log("classdesc_count:::", comm_code_tnu_count);
                    res.render('reimbursementModule/initiateRem', {
                        emp_id: emp_id,
                        emp_name: emp_name,
                        emp_access: emp_access,
                        pid: pid,
                        project_id: project_id,
                        pid_count: pid_count,
                        empName: empName,
                        hraccess: hraccess,
                        hraccess_count: hraccess_count,
                        hrId: hrId,
                        hrName: hrName,
                        amt_payable: amt_payable,
                        remarks: remarks,
                        user_remarks: user_remarks,
                        recCount: recCount,
                        comm_code_tnu_count: comm_code_tnu_count,
                        comm_code_tnu: comm_code_tnu,
                        Manager_name:Manager_name,
                        Manager_id:Manager_id,
                        defProjectId:defProjectId,
                        resultList:resultList
                    });
                });
                });
                });
            });
                });
            });
        //});
    //});
 }else
   {
    res.redirect('/admin-dashboard/adminDashboard/admindashboard');
   }
}
router.post('/fetchMgrName',fetchMgrName);

var empName="";
function fetchMgrName(req,res)
{

var emp_id=req.body.empId;
var project_id=req.body.projectId;

 pdbconnect.query("SELECT emp_name,emp_id from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where project_id=$1 and emp_id=$2)", [project_id,emp_id], function(err, result2) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            console.log("result", result2);
           // var empName = result2.rows;
             
              var count = result2.rowCount;
              if(count!=0)
              {
              empName=result2.rows['0'].emp_name;
               employee_id=result2.rows['0'].emp_id;
              }
              else
              {
                empName="";
              }
              var repmgrName =employee_id+'-'+empName
            console.log("empName", repmgrName);
           
        }
        res.json({key:repmgrName});
       });
};
router.post('/rembReq', rembReq);
var remb_id = "";
console.log(" rembReq");

function rembReq(req, res) {
     var test = req.body.test;

     if (test == "Submit") {
       

         var emp_id = req.body.emp_id;
        var emp_name = req.body.emp_name;
    var emp_access = req.user.rows[0].user_type;
    
    
        var project_id = req.body.pid;
        console.log("repMgr_id repMgr_id project_id::", project_id);
        //var repMgrid = req.body.access;
                
                    var repMgr_id = "";
                    var Mgrid = req.body.access;
                    var urlValue1 = Mgrid.split("-");
                    repMgrid = urlValue1[0].trim();
                    repMgr_id = urlValue1[1].trim();
                    console.log("repMgr_id repMgrid repMgrid::", repMgrid);
                    console.log("repMgr_id repMgr_id repMgr_id::", repMgr_id);
                    var hr_id = "";
                    var hrvalue = req.body.hraccess;
                    var urlValue2 = hrvalue.split(":");
                    hrid = urlValue2[0].trim();
                    hr_id = urlValue2[1].trim();
                    console.log("repMgr_id hrid hrid::", hrid);
                    console.log("repMgr_id hr_id hr_id::", hr_id);
                    // var repMgr_id = req.body.access.emp_id;
                    console.log("repMgr_id repMgr_id repMgr_id::", repMgr_id);
                    //   var hr_id =req.body.hraccess.emp_id;
                    console.log("hr_id hr_id hr_id::", hr_id);
                    var adv_amt = req.body.AdvPaid;
                    var now = new Date();
                    var lodge_date = now;
                    var doc_date = now;
                    var rcre_user_id = req.body.emp_id;
                    var rcre_time = now;
                    var lchg_user_id = req.body.emp_id;
                    var lchg_time = now;
                   // var adv_amt = req.body.AdvPaid;
                    var free_text_1 = req.body.free_text_1;
                    var free_text_2 = req.body.free_text_2;
                    var free_text_3 = req.body.free_text_3;
                    var del_flg = "N";
                    var status = "pending";
                    var user_remarks=req.body.user_remarks;;
                    //  var amt_payable = req.body.amt_payable;
                    var net_amt_payable = "";
         var billList=req.body.millength;
                    console.log("emp_id in rembReq::", emp_id);
                    console.log("emp_name in rembReq::", emp_name);
                    console.log("project_id in rembReq::", project_id);
                    console.log("repMgr_id in rembReq::", repMgr_id);
                    console.log("hr_id in rembReq::", hr_id);
                    console.log("adv_amt in rembReq::", adv_amt);
                    //  console.log("remarks in rembReq::", remarks);
                    pdbconnect.query("SELECT * from reimbursement_master_tbl", function(err, resultset) {
                        if (err) throw err;
                        rcount = resultset.rowCount;
                        console.log("rcount resultset", rcount);
                        var seq = "riembreq";
                        pdbconnect.query("select nextval($1)::text code1", [seq], function(err, result) {
                            if (err) throw err;
                            code1 = result.rows['0'].code1;
                            console.log("select done");
                            console.log("code1", code1);
                            console.log("code1", code1);
                            remb_id = code1;
                            console.log("remb_id after creating sequence::", remb_id);
                            console.log("billList in rembReq::", billList);
                             //var billListSize = (billList - 0) - (1 - 0);
                            //console.log("billListSize  :::  ", billListSize);
                            for (i = 0; i < billList; i++) {
                            
                                var billDate = req.body["travelDate_" + i]
                                var travelDesc = req.body["travelDesc_" + i]
                                var travelAmt = req.body["travelAmt_" + i]
                                var ticktno = req.body["ticktno_" + i];
                                var remarks = req.body["travelExp_" + i];
                                
                                console.log("ticktno in rembReq::", ticktno);
                                console.log("billDate in rembReq::", billDate);
                                console.log("travelDesc in rembReq::", travelDesc);
                                console.log("travelAmt in rembReq::", travelAmt);
                                console.log("nature_of_expenses description in rembReq::", remarks);
                                
                                /*if (billDate == undefined) {
                                     console.log("inside billDate for undefined");  
                                     billList++; 
                                    break;
                                }*/
                                if(typeof billDate === 'undefined')
                                 {
                                 console.log("otside billDate for undefined");
                                 }
                                 else
                                 {
                                pdbconnect.query("INSERT INTO reimbursement_details_tbl(remb_id, bill_id, bill_date, nature_of_expenses, ticket_amt, remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)", [remb_id, ticktno, billDate, travelDesc, travelAmt, remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3], function(err, result) {
                                    if (err) throw err;
                                    else {
                                        console.log("result inserting into details table");
                                        console.log("result", result);
                                    }
                                });
                            }
                            }
                            // var totAmt=travelAmt + travelAmt;
                              var totAmt=req.body.amt_payable;
                            console.log("totAmt in rembReq::", totAmt);
                            //var remarks=req.body.remarks;
                            // console.log("remarks in rembReq::", remarks);
                            var hrRemarks = "";
                            var mgrRemarks = "";
                            var hr_status="pending";
                            var settlement_paid_flg="N";
                            net_amt_payable = totAmt - adv_amt;
                            console.log("net_amt_payable in rembReq::", net_amt_payable);
                            console.log("repMgr_id:::::::::", repMgrid);
                            console.log("hr_id::::::::", hrid);
                            console.log("user_remarks :::in rembReq::", user_remarks);
                            pdbconnect.query("INSERT INTO reimbursement_master_tbl(remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, status, lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3,hr_status,settlement_paid_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)", [remb_id, emp_id, emp_name, repMgrid, project_id, hr_id, totAmt, net_amt_payable, adv_amt, del_flg, status, lodge_date, doc_date, user_remarks, mgrRemarks, hrRemarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3,hr_status,settlement_paid_flg], function(err, result6) {
                                if (err) throw err;
                                else {
                                    var success = "Request has been submitted successfully with  Id:" + remb_id + ".";
                                    console.log("sUCCES INSIDE  Insert", success);
                                }
                                pdbconnect.query("INSERT INTO reimbursement_master_tbl_hist(remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, status, lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3,hr_status,settlement_paid_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)", [remb_id, emp_id, emp_name, repMgrid, project_id, hr_id, totAmt, net_amt_payable, adv_amt, del_flg, status, lodge_date, doc_date, user_remarks, mgrRemarks, hrRemarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3,hr_status,settlement_paid_flg], function(err, result7) {
                                    if (err) throw err;
                                   
                                pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function(err, empResult) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        } else {
                                            employee_name = empResult.rows['0'].emp_name;
                                            employee_email = empResult.rows['0'].emp_email;
                                            console.log('employee name ', employee_name);
                                            console.log('employee id ', employee_email);
                                        }
                                        pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select repmgr_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                approver_name = empResult.rows['0'].emp_name;
                                                approver_email = empResult.rows['0'].emp_email;
                                                console.log('manager name ', approver_name);
                                                console.log('manager id ', approver_email);
                                            }
                                            
                                            pdbconnect.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id=$1)", [repMgrid], function(err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            } else {
                                                if(empResult.rowCount!=0)
                                                {
                                                var deliverymgr_name = empResult.rows['0'].emp_name;
                                                var deliverymgr_email = empResult.rows['0'].emp_email;
                                                console.log('deliverymgr_name name ', deliverymgr_name);
                                                console.log('manager id ', deliverymgr_email);
                                            }
                                            }

                                            var smtpTransport = nodemailer.createTransport('SMTP', {
                                                service: 'gmail',
                                                auth: {
                                                    user: 'amber@nurture.co.in',
                                                    pass: 'nurture@123'
                                                }
                                            });


                        			var mailOptions = {
                                                to: approver_email,
                                                cc: employee_email,deliverymgr_email,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Reimbursement Request notification',
                                                html:'<h3>Reimbursement Request has been initiated by the employee for following Details<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Reimbursement Id</th> ' +
                                                                '<th style="border: 10px solid black;">' + remb_id + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Project Id </td> ' +
                                                                '<th style="border: 10px solid black;">' + project_id + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Employee Id </th> ' +
                                                                '<th style="border: 10px solid black;">' + emp_id + '</th>' +

                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Employee Name</td> ' +
                                                                '<th style="border: 10px solid black;">' + emp_name + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
						'Kindly proceed further<br><br>'+
                                                'URL: http://amber.nurture.co.in <br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
                                         };

                                            console.log('mailOptions', mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(err) {});

                                    res.render('reimbursementModule/reimburseViewDetails', {
                                        remb_id: remb_id,
                                        emp_id: emp_id,
                                        emp_name: emp_name,
                                        emp_access: emp_access,
                                        pid: pid,
                                        project_id: project_id,
                                        pid_count: pid_count,
                                        repMgrid: repMgrid,
                                        hr_id: hr_id,
                                        adv_amt: adv_amt,
                                        hrid: hrid,
                                        user_remarks: user_remarks,
                                        net_amt_payable: net_amt_payable,
                                        totAmt: totAmt,
                                        hrRemarks: hrRemarks,
                                        mgrRemarks: mgrRemarks,
                                        net_amt_payable: net_amt_payable,
                                        free_text_1: free_text_1,
                                        free_text_2: free_text_2,
                                        free_text_3: free_text_3,
                                        success: success
                                        });
                                        });
                                        });
                                    });
                                });
                            });
                        });
                    });
           
	        }
           
  
}

function reuploadBills(req,res) {

    var emp_id = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var emp_name = req.user.rows[0].user_name;
                                 var remb_id = req.body.remb_id;
                                console.log("reupload bills for "+remb_id);
                                    res.render('reimbursementModule/rembReqDetails', {
                                        remb_id: remb_id,
                                        emp_id: emp_id,
                                        emp_name: emp_name,
                                        emp_access: emp_access,                                        
                                    });

}

function dropzoneUpload(req, res,third){

            var eid =req.user.rows[0].user_id;
            console.log("emp_id"+eid);
            var emp_access =req.user.rows[0].user_type;
            var reimb_id=req.query.reimb_id;
            var employee_id="";
            console.log("emp_access:::::"+emp_access);
             console.log("reimb_id::::::"+reimb_id);
            
             pdbconnect.query("SELECT emp_id from reimbursement_master_tbl where remb_id=$1",[reimb_id],function(err, resultset) {
                        if (err){ throw err;
                        }else{
                            employee_id=resultset.rows['0'].emp_id;
                            console.log("employee_id:::::::::",employee_id);
                            
                        }

             
             if(emp_access=='F1')
            {
             var targetDir = './data/CMS/bills/'+employee_id+"/";
            }else{
                var targetDir = './data/CMS/bills/'+eid+"/";
            }
            

           
            if (!fs.existsSync(targetDir))
            {
                fs.mkdirSync(targetDir);
            }

          var finaltargetDir=targetDir+reimb_id+"/"
                if (!fs.existsSync(finaltargetDir))
            {
                fs.mkdirSync(finaltargetDir);
            }

                var storage = multer.diskStorage({
                  destination: function(req, file, callback) {
                    callback(null, finaltargetDir)
                  },
                  filename: function(req, file, callback) {
                    callback(null,file.originalname)
                  }
                })

                var upload = multer({
                    storage: storage
                  }).single('file')
                  upload(req, res, function(err) {
                    if(err)console.log(err);
                    res.end('File is uploaded')
                  })
                    });
                  

}



function dropzoneRemove(req, res){
               
               var eid =req.user.rows[0].user_id;
            console.log("emp_id"+eid);
           var rembIdJSON=req.body.remId;
              var remId = JSON.parse(rembIdJSON)
              console.log("req remId"+remId);

            var targetDir = './data/CMS/bills/'+eid+"/"+remId+"/";
              var remFileJSON=req.body.remFile;
              var remFile = JSON.parse(remFileJSON)
              console.log("req remFile"+remFile);

              var filePath = targetDir+"/"+remFile; 
              fs.unlinkSync(filePath);

              console.log("bill is removed from server"+remFile);
              res.end('bill is removed from server'+remFile);


}







module.exports = router;
