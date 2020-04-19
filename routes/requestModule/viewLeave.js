var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');
var dateFormat = require('dateformat');
console.log('vanthuten applyLeave');


router.get('/viewLeave',viewLeave);
router.get('/cancelLeave',cancelLeave);
router.get('/cancelLeavePage',cancelLeavePage);
router.get('/getLeaveInfo',getLeaveInfo);
router.get('/getLeaveBalance',getLeaveBalance);
router.get('/getLeaveInfoprev',getLeaveInfoprev);

function viewLeave(req,res)
{
    var emp_id =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var emp_name =req.user.rows[0].user_name;

    pdbconnect.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg =$2",[emp_id,'N'],function(err,done){
             if (err) {
                console.error('Error with table query', err);
            } else {
                rowData = done.rows;
                //console.log('rowData value',rowData);
              //  console.log('rowData value1',done.rows['0']);
              if(rowData.length !=0) { 
                no_of_leaves=done.rows['0'].no_of_leaves;
               }
              else{
                no_of_leaves =0;
              }
           
            }

            pdbconnect.query("SELECT comm_code_desc cocd ,emp_name emp, * from leaves l,common_code_tbl cocd , emp_master_tbl emp where  emp.del_flg ='N' and  l.del_flg='N' and l.emp_id =$1 and l.approver_id = emp.emp_id and  cocd.del_flg ='N'and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP'",[emp_id],function(err,leavesList){
             if (err) {
                console.error('Error with table query', err);
            } else {
                leaveData = leavesList.rows;
                console.log('leaveData value',leaveData);
              //  console.log('rowData value1',done.rows['0']);
             
           
            }

    
  res.render('requestModule/viewLeave',{
    
   emp_id:emp_id, 
    emp_name:emp_name,
    emp_access:emp_access,
   leaveData:leaveData

  });
  });

});
    
}

function cancelLeave(req,res)
{
	var emp_id =req.user.rows[0].user_id;
	var emp_access =req.user.rows[0].user_type;
	var emp_name =req.user.rows[0].user_name;
	var leave_id = req.query.id;
	var leaves = req.query.leaves;
	var remarks = req.body.desc;
	var leave_type = req.query.leave_type;
	var now = new Date();
	var year = now.getFullYear();
	var lchgtime=now;
	var tempList='';
	var tempList1='';
	var repMgr_id ='';
	var repMgrEmail_id ='';
	var current_date = now;
	var current_date = dateFormat(current_date,"yyyy-mm-dd");
	

	pdbconnect.query("select from_date,to_date from leaves where emp_id=$1 and leave_id=$2 and del_flg='N'",[emp_id,leave_id],function(err,done)
        {
                var from_date = done.rows['0'].from_date;
                var from_date = dateFormat(from_date,"yyyy-mm-dd");
		console.log("from_date",from_date);
                var to_date = done.rows['0'].to_date;
                var to_date = dateFormat(to_date,"yyyy-mm-dd");
		console.log("to_date",to_date);
	
		

	if(to_date < current_date)
	{
		        req.flash('error',"Applied Leave cannot be cancelled since it has passed the Leave Date.")
                        res.redirect('/requestModule/viewLeave/viewLeave');
	}
	else
	{
	     pdbconnect.query("UPDATE leaves set del_flg = $1, lchg_user_id = $2 , lchg_time = $3 where leave_id = $4 ",['Y',emp_id,lchgtime,leave_id],function(err,done)
	     {
		      if (err) 
		      {
				console.error('Error with table query', err);
		      } 

	     pdbconnect.query("SELECT * from leave_master where emp_id =$1 and del_flg=$2 and leave_type = $3 and year = $4",[emp_id,'N',leave_type,year],function(err,done)
	     {
			if (err) 
			{
				console.error('Error with table query', err);
			} 
			else 
			{
				no_of_leaves=done.rows['0'].availed_leaves;
				var quater_leave = done.rows['0'].quaterly_leave;
			}
	     
	     rest_leaves = parseFloat(no_of_leaves)  - parseFloat(leaves) ; 

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
		    
		    
	     pdbconnect.query("UPDATE leave_master set availed_leaves = $1,quaterly_leave=$5 where emp_id = $2 and leave_type = $3 and year = $4",[rest_leaves,emp_id,leave_type,year,quater_leave],function(err,done)
	    {
			if (err) 
			{
				console.error('Error with table query', err);
			} 
			else 
			{
				//               console.log('111111111111111111111111111');
			}

	     pdbconnect.query("SELECT  comm_code_desc cocd ,emp_name emp,* from leaves l, emp_master_tbl emp,  common_code_tbl cocd  where l.del_flg= 'N' and l.emp_id =$1 and l.approver_id = emp.emp_id and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP' and cocd.del_flg ='N'",[emp_id],function(err,leavesList)
	     {
			if (err) 
			{
				console.error('Error with table query', err);
			} 
			else 
			{
				leaveData = leavesList.rows;
				//console.log('rowData value',rowData);
				//console.log('rowData value1',done.rows['0']);
			}

		pdbconnect.query("SELECT * FROM leaves where leave_id =$1",[leave_id], function(err, leaveDataID) 
		{
			if (err) 
			{
				console.error('Error with table query', err);
			} 
			else 
			{
				rowData2 = leaveDataID.rows;
				managerID = rowData2['0'].approver_id;
				availed_leaves = rowData2['0'].availed_leaves;
				accepted_flg = rowData2['0'].app_flg;
				var leave_type = rowData2['0'].leave_type;

			  if(accepted_flg == 'Y')
			  {
				pdbconnect.query("SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1  ",[managerID], function(err, repMgr) 
				{
					if (err) 
					{
						console.error('Error with table query', err);
					} 
					else 
					{
						repMgr_id=repMgr.rows['0'].reporting_mgr;
						console.log('repMgr_id' ,repMgr_id);
					} 
		
					pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[repMgr_id], function(err, repMgrEmail) 
					{
						if (err) 
						{
							console.error('Error with table query', err);
						}
						else 
						{
							repMgrEmail_id=repMgrEmail.rows['0'].emp_email;
							console.log('repMgrEmail_id' ,repMgrEmail_id);
						} 
					});      
				});
			  }
		    }


		    console.log('repMgrEmail_id' ,repMgrEmail_id);

		    pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) 
		    {
			if (err) 
			{
				console.error('Error with table query', err);
			} 
			else 
			{
				employee_email=empResult.rows['0'].emp_email;
				console.log('employee_email' ,employee_email);
			} 

		    pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[managerID], function(err, managerMail) 
		    {
			if (err) 
			{
				console.error('Error with table query', err);
			} 
			else 
			{
				rowData1 = managerMail.rows;
				managerMailId = rowData1[0].emp_email;
				console.log('managerMailId',managerMailId);
			}


		    pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_access =$1  ",['A1'], function(err, hrMailList) 
		    {
			if (err) 
			{
				console.error('Error with table query', err);
			} 
			else 
			{
				rowData = hrMailList.rows;
				for(var i=0;i<rowData.length;i++)
				{
					console.log("Hr email id",rowData[i].emp_email);
					emailIdList = rowData[i].emp_email;
					if(i)
					{
						tempList = tempList + ',' + emailIdList;  
					}
					else
					{
						tempList = tempList  + emailIdList;  
					}
				}

				tempList = tempList + ',' + employee_email;  
				console.log('tempList',tempList);
			}

			tempList1 = managerMailId;
			tempList1 = tempList1 + ',' + repMgrEmail_id;
			console.log('tempList1 value',tempList1);
			var smtpTransport = nodemailer.createTransport('SMTP',{
			service: 'gmail',
			auth: 
			{
				user: 'amber@nurture.co.in',
				pass: 'nurture@123'
			}
			});

                        var mailOptions = {
						to: tempList1,
						cc: tempList,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Leave cancel notification',
                                                html: '<img src="https://freepresskashmir.com/wp-content/uploads/2017/05/Cancelled_stamp_cropped_B383BBCE28349.jpg" height="85"><br><br>' +
                                                '<h3>You have Cancelled your Leave for the following <br><br>' +
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
                                                                '<th style="border: 10px solid black;">Employee Name</th> ' +
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
		});

				success ='Leave request cancelled successfully' ;
				res.render('requestModule/viewLeave',{
				emp_id:emp_id, 
				emp_name:emp_name,
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
	}
	});
}


function cancelLeavePage(req,res){
    var emp_id =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var emp_name =req.user.rows[0].user_name;
    var leave_id = req.query.id;
    var leaves = req.query.leaves;

    
     pdbconnect.query("SELECT description leave_config,  * from leaves l,leave_config lconfig  where   l.del_flg =$1 and l.leave_id= $2 and  lconfig.leave_type = l.leave_type", ['N',leave_id],function(err,done){
             if (err) {
                console.error('Error with table query', err);
            } else {
                rowData = done.rows;
                approver_id = rowData[0].approver_id;
             console.log('rowData value',rowData);
              //  console.log('rowData value1',done.rows['0']);
             
           
            }


            pdbconnect.query("SELECT emp_name from emp_master_tbl where   del_flg =$1 and emp_id= $2", ['N',approver_id],function(err,done1){
             if (err) {
                console.error('Error with table query', err);
            } else {
                rowData1 = done1.rows;
                approver_name = rowData1[0].emp_name;
             console.log('rowData value',rowData1);
              //  console.log('rowData value1',done.rows['0']);
             
           
            }

           
    
  res.render('requestModule/cancelLeavePage',{
    
   emp_id:emp_id, 
    emp_name:emp_name,
    emp_access:emp_access,
   approver_name:approver_name,
   leave_id:leave_id,
   leaves:leaves,
   rowData:rowData

  });
  });
            });


    
}
//////////////////////////////////////////////////////


function getLeaveInfo(req,res)
{

	var eid =req.user.rows[0].user_id;
	var emp_access =req.user.rows[0].user_type;
	var ename =req.user.rows[0].user_name;
	var current_date = new Date();
	var current_year = current_date.getFullYear();


        pdbconnect.query("SELECT * from leave_config where year=$1 and del_flg = $2",[current_year,'N'],function(err,result){
        if (err) 
	{
                console.error('Error with table query', err);
        } 
	else 
	{
                var leave_types_count = result.rowCount;
		console.log("leave_types_count",leave_types_count);
                var leave_types = result.rows;
        }



        pdbconnect.query("SELECT * from leaves where emp_id = $1 and del_flg='N' and year=$2 order by current_date",[eid,current_year],function(err,result){
        if (err)
        {
                console.error('Error with table query', err);
        }
        else
        {
                var leave_data_count = result.rowCount;
		console.log("leave_data_count1",leave_data_count);
                var leave_data = result.rows;
        }


	res.render('requestModule/getLeaveInfo',{
	eid:eid,
	emp_access:emp_access,
	ename:ename,
	current_date:current_date,
	leave_types_count:leave_types_count,
	leave_types:leave_types,
	leave_data_count:leave_data_count,
	leave_data:leave_data
						});
						
	});
	});



}

function getLeaveBalance(req,res)
{
        var eid =req.user.rows[0].user_id;
        var emp_access =req.user.rows[0].user_type;
        var ename =req.user.rows[0].user_name;
        var current_date = new Date();
        var current_year = current_date.getFullYear();


        pdbconnect.query("SELECT * from leave_config where year=$1 and del_flg = 'N'",[current_year],function(err,leaveConfigList)
        {
                    if (err)
                    {
                                console.error('Error with table query', err);
                    }
                    else
                    {
                                var leaveConfigData = leaveConfigList.rows;
                    }

		res.render('requestModule/getLeaveBalance',{
		eid:eid,
		emp_access:emp_access,
		ename:ename,
		current_date:current_date,
		leaveConfigData:leaveConfigData
							});

        });
}


router.get('/fetchLeave',fetchLeave);
function fetchLeave(req,res)
{
    var emp_id =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var emp_name =req.user.rows[0].user_name;
    var noOfLeaves = 0;
    var temp = 0;
    var leave_id = req.query.leave_id;
    var now = new Date();
    var year= now.getFullYear();

    pdbconnect.query("SELECT * from leave_master where leave_type = $1 and del_flg = $2 and emp_id = $3 and year = $4",[leave_id,'N',emp_id,year],function(err,availedList)
    {
             if (err)
             {
                        console.error('Error with table query', err);
             }
             else
             {

                        rowData = availedList.rows;
                        if(rowData.length !=0)
                        {
                                leaveDataAvailed = availedList.rows[0].availed_leaves;
                                leaveDataCarry  = availedList.rows[0].carry_forwarded;
                                var quarter  = availedList.rows[0].quaterly_leave;
                        }
                        else
                        {
                                leaveDataAvailed = 0;
                                leaveDataCarry = 0;
                        }
             }

            pdbconnect.query("SELECT * from leave_config where leave_type = $1 and del_flg = $2 and year=$3",[leave_id,'N',year],function(err,noOfLeavesList)
            {
                if (err)
                {
                        console.error('Error with table query', err);
                }
                else
                {
                        leavesCountValue = noOfLeavesList.rows[0].allocated_leaves;
                        console.log('leavesCountValue value',leavesCountValue);
                }


            pdbconnect.query("SELECT * from leave_master where leave_type = $1 and del_flg = $2 and year=$3 and emp_id=$4",[leave_id,'N',year,emp_id],function(err,noOfLeavesList)
            {
                if (err)
                {
                        console.error('Error with table query', err);
                }
                else
                {
			
                        var quaterly_count = noOfLeavesList.rowCount;

			if(quaterly_count != "0")
			{
                        	var quaterly = noOfLeavesList.rows[0].quaterly_leave;
				
				if(quaterly == "")
				{
					var quaterly = "0";	
				}

                        	console.log('quaterly',quaterly);
			}
			else
			{
                        	var quaterly = "0"; 

			}
                }

		
                leavesCount = parseFloat(leavesCountValue) +  parseFloat(leaveDataCarry) -  parseFloat(leaveDataAvailed);
                res.json({key:leavesCount,key1:quaterly});
           });
           });
           });
}


function getLeaveInfoprev(req,res)
{

        var eid =req.user.rows[0].user_id;
        var emp_access =req.user.rows[0].user_type;
        var ename =req.user.rows[0].user_name;
        var current_date = new Date();
        var prev_year = current_date.getFullYear() - 1;
	console.log("prev_year",prev_year);


        pdbconnect.query("SELECT * from leave_config where year=$1 and del_flg = $2",[prev_year,'N'],function(err,result){
        if (err)
        {
                console.error('Error with table query', err);
        }
        else
        {
                var leave_types_count = result.rowCount;
                var leave_types = result.rows;
        }


        pdbconnect.query("SELECT * from leaves where emp_id = $1 and del_flg='N' and year=$2 order by from_date",[eid,prev_year],function(err,result){
        if (err)
        {
                console.error('Error with table query', err);
        }
        else
        {
                var leave_data_count = result.rowCount;
                console.log("leave_data_count1",leave_data_count);
                var leave_data = result.rows;
        }


        res.render('requestModule/getLeaveInfoprev',{
        eid:eid,
        emp_access:emp_access,
        ename:ename,
        current_date:current_date,
        leave_types_count:leave_types_count,
        leave_types:leave_types,
        leave_data_count:leave_data_count,
        leave_data:leave_data
                                                });

        });
        });



}


//////////////////////////////////////////////////////
module.exports = router;
