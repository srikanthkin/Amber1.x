var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');
var dateFormat = require('dateformat');
console.log('vanthuten applyLeave');


router.get('/approveLeaves',approveLeaves);
router.post('/rejectLeaves',rejectLeaves);
router.get('/rejectLeavesPage',rejectLeavesPage);
router.get('/approveAppliedLeavesPage',approveAppliedLeavesPage);
router.get('/approveAppliedLeaves',approveAppliedLeaves);





function approveLeaves(req,res){
    var eid =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var ename =req.user.rows[0].user_name;

    
  

            pdbconnect.query("SELECT  comm_code_desc cocd ,emp_name emp,* from leaves l, emp_master_tbl emp, common_code_tbl cocd  where l.del_flg= 'N' and l.approver_id =$1 and l.app_flg = 'N' and l.emp_id = emp.emp_id and rej_flg = 'N' and cocd.del_flg ='N' and emp.del_flg ='N' and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP'",[eid],function(err,leavesList){
             if (err) {
                console.error('Error with table query', err);
            } else {
                leaveData = leavesList.rows;
                //console.log('rowData value',rowData);
                //console.log('leaveData value1',leaveData);
             
           
            }

    
  res.render('requestModule/approveLeaves',{
    
   eid:eid, 
    ename:ename,
    emp_access:emp_access,
   leaveData:leaveData

  });
  });

    
}

function approveAppliedLeavesPage(req,res){
    var eid =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var ename =req.user.rows[0].user_name;
var leave_id = req.query.id;
var leaves = req.query.leaves;
    
  

            pdbconnect.query("SELECT comm_code_desc cocd,emp_name emp,* from leaves l ,emp_master_tbl emp,common_code_tbl cocd where l.del_flg= 'N' and l.leave_id = $1 and l.app_flg = 'N' and l.emp_id = emp.emp_id and rej_flg = 'N' and cocd.del_flg ='N' and emp.del_flg ='N' and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP'",[leave_id],function(err,leavesList){
             if (err) {
                console.error('Error with table query', err);
            } else {
                leaveData = leavesList.rows;
                //console.log('rowData value',rowData);
                //console.log('leaveData value1',leaveData);
             
           
            }

    
  res.render('requestModule/approveLeavesPage',{
   eid:eid, 
    ename:ename,
    emp_access:emp_access,
    leave_id:leave_id,
    leaves:leaves,
   leaveData:leaveData

  });
  });

    
}

function approveAppliedLeaves(req,res){
    var eid =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var ename =req.user.rows[0].user_name;
var leave_id = req.query.id;
var leaves = req.query.leaves;
var emp_id = req.query.emp_id;
var tempList = '';
 var now = new Date();
var lchgtime=now;

        pdbconnect.query("select from_date,to_date from leaves where emp_id=$1 and leave_id=$2 and del_flg='N'",[emp_id,leave_id],function(err,done)
        {
                var from_date = done.rows['0'].from_date;
                var from_date = dateFormat(from_date,"yyyy-mm-dd");
                console.log("from_date",from_date);
                var to_date = done.rows['0'].to_date;
                var to_date = dateFormat(to_date,"yyyy-mm-dd");
                console.log("to_date",to_date);


    
     pdbconnect.query("UPDATE  leaves set app_flg = $1, lchg_user_id = $2 , lchg_time = $3 where  leave_id = $4 ",['Y',emp_id,lchgtime , leave_id],function(err,done){
              if (err) {
                console.error('Error with table query', err);
            } else {
//               console.log('111111111111111111111111111');
              
              }

            pdbconnect.query("SELECT  comm_code_desc cocd ,emp_name emp,* from leaves l, emp_master_tbl emp, common_code_tbl cocd  where l.del_flg= 'N' and l.approver_id =$1 and l.app_flg = 'N' and l.emp_id = emp.emp_id and rej_flg = 'N' and cocd.del_flg ='N' and emp.del_flg ='N' and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP'",[eid],function(err,leavesList){
             if (err) {
                console.error('Error with table query', err);
            } else {
                leaveData = leavesList.rows;
            }


             pdbconnect.query("SELECT * FROM leaves where leave_id =$1  ",[leave_id], function(err, leaveDataID) {
            if (err) {
                console.error('Error with table query', err);
            } else {
             
                rowData2 = leaveDataID.rows;
                  managerID = rowData2[0].approver_id;
                 employee_id = rowData2[0].emp_id;
                  availed_leaves = rowData2[0].availed_leaves;
                  var leave_type = rowData2[0].leave_type;
                //  reason = rowData2[0].reason;
                  console.log('managerID',managerID);
                  console.log('employee_id',employee_id);

            }



             pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[employee_id], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
             employee_email=empResult.rows['0'].emp_email;
             
              
              console.log('employee_email' ,employee_email);
            } 


                pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[managerID], function(err, managerMail) {
            if (err) {
                console.error('Error with table query', err);
            } else {
             
                rowData1 = managerMail.rows;
                  managerMailId = rowData1[0].emp_email;
                
                  console.log('managerMailId',managerMailId);

            }

              pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_access =$1  ",['A1'], function(err, hrMailList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
             
                rowData = hrMailList.rows;
               
                  for(var i=0;i<rowData.length;i++){
              //  console.log("Hr email id",rowData[i].emp_email);
                      emailIdList = rowData[i].emp_email;
                      if(i){
                      tempList = tempList + ',' + emailIdList;  
                      }else
                      {
                        tempList = tempList  + emailIdList;  
                      }
                      
                     
                  }
                    tempList = tempList + ',' + managerMailId;  
                  console.log('tempList',tempList);

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
						to: employee_email,
						cc: tempList,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Leave Approval notification',
                                                html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR83_eDMGIsgkz4JLMxwqzPqWqSyEa5awPs7bJmiyrMbkeoy35X" height="85"><br><br>' +
                                                '<h3>Your Leave has been Approved for the following<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                                '<th style="border: 10px solid black;">' + leave_type + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> From Date </td> ' +
                                                                '<th style="border: 10px solid black;">' + from_date + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">To Date</th> ' +
                                                                '<th style="border: 10px solid black;">' + to_date + '</th>' +

                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Number of days </td> ' +
                                                                '<th style="border: 10px solid black;">' + availed_leaves + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
                                         };



               smtpTransport.sendMail(mailOptions, function(err) {
              });

 });

    success ='Leave request approved successfully' ;
  res.render('requestModule/approveLeaves',{
    
   eid:eid, 
    ename:ename,
    emp_access:emp_access,
   leaveData:leaveData,
   success:success

  });
  });

});
             });
             });
            });
            });
}

function rejectLeavesPage(req,res){
    var eid =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var ename =req.user.rows[0].user_name;
var leave_id = req.query.id;
var leaves = req.query.leaves;
    
  
            pdbconnect.query("SELECT comm_code_desc cocd,emp_name emp,* from leaves l ,emp_master_tbl emp,common_code_tbl cocd where l.del_flg= 'N' and l.leave_id = $1 and l.app_flg = 'N' and l.emp_id = emp.emp_id and rej_flg = 'N' and cocd.del_flg ='N' and emp.del_flg ='N' and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP'",[leave_id],function(err,leavesList){
             if (err) {
                console.error('Error with table query', err);
            } else {
                leaveData = leavesList.rows;
            }

  res.render('requestModule/rejectLeavesPage',{
   eid:eid, 
    ename:ename,
    emp_access:emp_access,
    leave_id:leave_id,
    leaves:leaves,
   leaveData:leaveData

  });
  });

    
}


function rejectLeaves(req,res){
    var eid =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var ename =req.user.rows[0].user_name;
var leave_id = req.body.leave_id;
var emp_id = req.body.emp_id;
var emp_name = req.body.emp_name;
var leaves = req.body.leaves;
var reason = req.body.desc;
var leave_type = req.body.leave_type;
console.log('leave_type' ,leave_type);
//var emp = req.query.emp;
var tempList = '';

 var now = new Date();
 var year = now.getFullYear();
var lchgtime=now;
               console.log('reject leave_id',leave_id);    
               console.log('reject leaves',leaves);    
               console.log('reject reason',reason);    

        pdbconnect.query("select from_date,to_date from leaves where emp_id=$1 and leave_id=$2 and del_flg='N'",[emp_id,leave_id],function(err,done)
        {
                var from_date = done.rows['0'].from_date;
                var from_date = dateFormat(from_date,"yyyy-mm-dd");
                console.log("from_date",from_date);
                var to_date = done.rows['0'].to_date;
                var to_date = dateFormat(to_date,"yyyy-mm-dd");
                console.log("to_date",to_date);


     pdbconnect.query("UPDATE  leaves set   rej_flg = $1, lchg_user_id = $2 , lchg_time = $3 , rej_reason = $4 where  leave_id = $5 ",['Y',emp_id,lchgtime ,reason, leave_id],function(err,done){
              if (err) {
                console.error('Error with table query', err);
            } else {
//               console.log('111111111111111111111111111');
              
              }


      pdbconnect.query("SELECT * from LEAVES where leave_id = $1",[leave_id],function(err,done1){
             if (err) {
                console.error('Error with table query', err);
            } else {
                rowData = done1.rows;
                //console.log('rowData value',rowData);
              //  console.log('rowData value1',done.rows['0']);
             emp=done1.rows['0'].emp_id;
           
            }    


             pdbconnect.query("SELECT * from leave_master where emp_id =$1 and del_flg=$2 and leave_type = $3 and year = $4",[emp,'N',leave_type,year],function(err,done){
             if (err) {
                console.error('Error with table query', err);
            } else {
               
                no_of_leaves=done.rows['0'].availed_leaves;
		var quater_leave = done.rows['0'].quaterly_leave;
               
           
            }    

            rest_leaves = parseFloat( no_of_leaves ) - parseFloat(leaves);


            if(parseFloat(quater_leave) < 0)
            {

                var quater_leave = parseFloat(quater_leave) + parseFloat(leaves);
                console.log("less than 0",quater_leave);

            }
            else
            {
                var quater_leave = parseFloat(quater_leave) + parseFloat(leaves);
                console.log("greater than 0",quater_leave);
            }


         pdbconnect.query("UPDATE leave_master set availed_leaves = $1,quaterly_leave=$5  where  emp_id = $2 and leave_type = $3 and year = $4",[rest_leaves,emp,leave_type,year,quater_leave],function(err,done){
              if (err) {
                console.error('Error with table query', err);
            } else {
//               console.log('111111111111111111111111111');
              
              }
            });      

  
            pdbconnect.query("SELECT  comm_code_desc cocd ,emp_name emp,* from leaves l, emp_master_tbl emp, common_code_tbl cocd  where l.del_flg= 'N' and l.approver_id =$1 and l.app_flg = 'N' and l.emp_id = emp.emp_id and rej_flg = 'N' and cocd.del_flg ='N' and emp.del_flg ='N' and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP'",[eid],function(err,leavesList){
             if (err) {
                console.error('Error with table query', err);
            } else {
                leaveData = leavesList.rows;
            }

             pdbconnect.query("SELECT * FROM leaves where leave_id =$1  ",[leave_id], function(err, leaveDataID) {
            if (err) {
                console.error('Error with table query', err);
            } else {
             
                rowData2 = leaveDataID.rows;
                  managerID = rowData2[0].approver_id;
                 employee_id = rowData2[0].emp_id;
                  availed_leaves = rowData2[0].availed_leaves;
		  var leave_type = rowData2[0].leave_type;
                //  reason = rowData2[0].reason;
                  console.log('managerID',managerID);
                  console.log('employee_id',employee_id);

            }



             pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[employee_id], function(err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
             employee_email=empResult.rows['0'].emp_email;
             
              
              console.log('employee_email' ,employee_email);
            } 


                pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[managerID], function(err, managerMail) {
            if (err) {
                console.error('Error with table query', err);
            } else {
             
                rowData1 = managerMail.rows;
                  managerMailId = rowData1[0].emp_email;
                
                  console.log('managerMailId',managerMailId);

            }

              pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_access =$1  ",['A1'], function(err, hrMailList) {
            if (err) {
                console.error('Error with table query', err);
            } else {
             
                rowData = hrMailList.rows;
               
                  for(var i=0;i<rowData.length;i++){
              //  console.log("Hr email id",rowData[i].emp_email);
                      emailIdList = rowData[i].emp_email;
                      if(i){
                      tempList = tempList + ',' + emailIdList;  
                      }else
                      {
                        tempList = tempList  + emailIdList;  
                      }
                      
                     
                  }
                    tempList = tempList + ',' + managerMailId;  
                  console.log('tempList',tempList);

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
                                                to: employee_email,
                                                cc: tempList,
                                                from: 'amber@nurture.co.in',
                				subject: 'Leave Reject notification ',
                                                html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF3AN6vk9aZnh5KQ_KPzHWYwlVWNNCxzAFK-994yO9WY6UwfiSIA" height="85"><br><br>' +
                                                '<h3>Your leave application has been rejected for following<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                                '<th style="border: 10px solid black;">' + leave_type + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Employee Id</th> ' +
                                                                '<th style="border: 10px solid black;">' + emp_id + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                                '<th style="border: 10px solid black;">' + emp_name + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> From Date </td> ' +
                                                                '<th style="border: 10px solid black;">' + from_date + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">To Date</th> ' +
                                                                '<th style="border: 10px solid black;">' + to_date + '</th>' +

                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Number of days </td> ' +
                                                                '<th style="border: 10px solid black;">' + availed_leaves + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
                                         };



               smtpTransport.sendMail(mailOptions, function(err) {
              });

    success ='Leave request rejected successfully' ;
  res.render('requestModule/approveLeaves',{
    
   eid:eid, 
    ename:ename,
    emp_access:emp_access,
   leaveData:leaveData,
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

            
}

module.exports = router;
