var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();
var nodemailer = require('nodemailer');
var dateFormat = require('dateformat');




router.get('/applyLeave',applyLeave);
router.get('/markLeave',markLeave);
router.get('/calculateLeaves1',calculateLeaves1);
router.get('/calculateDays',calculateDays);
router.get('/calculateLeaves',calculateLeaves);
router.get('/markLeavesGet',markLeavesGet);
router.get('/adminmark',adminmark);
router.get('/unmarkLeave',unmarkLeave);
router.get('/viewEmpLeave',viewEmpLeave);
router.get('/unmarkLeavePage',unmarkLeavePage);
router.post('/requestLeave',requestLeave);
router.post('/markpostLeave',markpostLeave);
router.post('/unmarkLeavePost',unmarkLeavePost);

router.get('/empspecficLeaveBalance',empspecficLeaveBalance);
function empspecficLeaveBalance(req,res)
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

                res.render('requestModule/empspecficLeaveBalance',{
                eid:eid,
                emp_access:emp_access,
                ename:ename,
                current_date:current_date,
                leaveConfigData:leaveConfigData
                                                        });

        });
}

router.get('/leaveFetchBal',leaveFetchBal);
function leaveFetchBal(req,res)
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


router.get('/EmployeeLeaveBalance',EmployeeLeaveBalance);
function EmployeeLeaveBalance(req,res)
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

        pdbconnect.query("SELECT * from emp_master_tbl where del_flg = $1 order by emp_id asc",['N'],function(err,resultset)
        {
                    if (err)
                    {
                                console.error('Error with table query', err);
                    }
                    else
                    {
                                var emp_data = resultset.rows;
                                var emp_data_count = resultset.rowCount;
                    }


                res.render('requestModule/EmployeeLeaveBalance',{
                eid:eid,
                emp_access:emp_access,
                ename:ename,
                current_date:current_date,
                emp_data:emp_data,
                emp_data_count:emp_data_count,
                leaveConfigData:leaveConfigData
                                                        });

        });
        });
}

router.get('/fetchBulk',fetchBulk);
function fetchBulk(req,res)
{
    var noOfLeaves = 0;
    var temp = 0;

    var leave_id = req.query.leave_id;
    var emp_id = req.query.emp_id;
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


            pdbconnect.query("SELECT quaterly_leave from leave_master where leave_type = $1 and del_flg = $2 and year=$3 and emp_id=$4",[leave_id,'N',year,emp_id],function(err,noOfLeavesList)
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



function calculateLeaves(req,res)
{
    var emp_id =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var emp_name =req.user.rows[0].user_name;
    var noOfLeaves = 0;
    var temp = 0;
    var leave_id = req.query.leave_id;
    var now = new Date();
    var year= now.getFullYear();
   
    console.log('leave_id value',leave_id);

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

		leavesCount = parseFloat(leavesCountValue) +  parseFloat(leaveDataCarry) -  parseFloat(leaveDataAvailed);
   		res.json({key:leavesCount,key1:quarter,key2:leavesCountValue});
  	   });
           });
}


function calculateLeaves1(req,res)
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

			leavesCount = parseFloat(leavesCountValue) +  parseFloat(leaveDataCarry) -  parseFloat(leaveDataAvailed);
			console.log("availleaves",leavesCount);
			res.json(leavesCount);

  	     });
             });
}



function calculateDays(req,res)
{
	    var emp_id =req.user.rows[0].user_id;
	    var emp_access =req.user.rows[0].user_type;
	    var emp_name =req.user.rows[0].user_name;
	    var fromDate = req.query.fromDate;
	    var toDate = req.query.toDate;
	    console.log('fromDate value',fromDate);
	    console.log('toDate value',toDate);
    
   
            pdbconnect.query("SELECT * from holidays where sel_date between($1) and ($2) and del_flg = $3",[fromDate,toDate,'N'],function(err,noOfDaysList)
	    {
			if (err) 
			{
				console.error('Error with table query', err);
			} 
			else 
			{
				daysCount = noOfDaysList.rowCount;
			}
			res.json(daysCount);
  	   });
}

function applyLeave(req,res)
{
	    var emp_id = req.user.rows[0].user_id;
	    var emp_access =req.user.rows[0].user_type;
	    var emp_name =req.user.rows[0].user_name;
	    var current_date = new Date();
	    var current_year = current_date.getFullYear();
	    console.log("current_year",current_year);


            pdbconnect.query("SELECT gender,martial_status from emp_info_tbl where emp_id = $1 and del_flg = $2",[emp_id,'N'],function(err,result)
	    {
            	var genCount=result.rowCount;
		console.log("GENCOUNT",genCount);

		if(genCount == 1)
		{
            		var gender=result.rows['0'].gender;
			console.log("GENDER",gender);
            		var martial_status=result.rows['0'].martial_status;
			console.log("MAR STATUS",martial_status);
		}
		else
		{
            		var gender="NF";
			console.log("GENDER",gender);
            		var martial_status="NF";
			console.log("MAR STATUS",martial_status);
		}

		if(genCount == 1)
		{

		if((gender == "M")&&(martial_status == "MA"))
		{
		    pdbconnect.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2",[emp_id,'N'],function(err,done)
		    {
				if (err) 
				{
					console.error('Error with table query', err);
				} 
				else 
				{
					rowData = done.rows;
				
					if(rowData.length !=0) 
					{ 
						no_of_leaves=done.rows['0'].no_of_leaves;
					}
					else
					{
						no_of_leaves =0;
					}
				}

		    pdbconnect.query("SELECT * from holidays where del_flg =$1",['N'],function(err,holidayList)
		    {
			    if (err) 
			    {
					console.error('Error with table query', err);
			    } 
			    else 
			    {
					holidayData = holidayList.rows;
			    }

		   pdbconnect.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)",[emp_id],function(err,emp_data)
		   {
			    if (err) 
			    {
				console.error('Error with table query', err);
			    } 
			    else 
			    {
				emp_data_app = emp_data.rows;
			    }    

		   pdbconnect.query("SELECT * from leave_config where year=$1 and del_flg = 'N' and leave_type!='ML'",[current_year],function(err,leaveConfigList)
		   {
			    if (err) 
			    {
					console.error('Error with table query', err);
			    } 
			    else 
			    {
					leaveConfigData = leaveConfigList.rows;
			    }      

		  pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function(err, holidayList)
		  {
			    if (err)
			    {
				console.error('Error with table query', err);
			    }
			    else
			    {
			      var holiday_list = holidayList.rows;
			      var holiday_count = holidayList.rowCount;
			    }

		  pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('W','O') order by current_date", function(err,openList)
		  {
			    if (err)
			    {
				console.error('Error with table query', err);
			    }
			    else
			    {
			      var open_list = openList.rows;
			      var open_count = openList.rowCount;
			    }


			    res.render('requestModule/applyLeave',{
			    eid:req.user.rows[0].user_id, 
			    ename:req.user.rows[0].user_name,
			    emp_access:emp_access,
			    no_of_leaves:no_of_leaves,
			    emp_data_app:emp_data_app,
			    holidayData:holidayData,
			    leaveConfigData:leaveConfigData,
			    holiday_list:holiday_list,
			    holiday_count:holiday_count,
			    open_list:open_list,
			    open_count:open_count
							});
						});
					});
				
			});
			});
		});
		});

	}	

                if((gender == "F")&&(martial_status == "MA"))
                {
                    pdbconnect.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2",[emp_id,'N'],function(err,done)
                    {
                                if (err)
                                {
                                        console.error('Error with table query', err);
                                }
                                else
                                {
                                        rowData = done.rows;

                                        if(rowData.length !=0)
                                        {
                                                no_of_leaves=done.rows['0'].no_of_leaves;
                                        }
                                        else
                                        {
                                                no_of_leaves =0;
                                        }
                                }

                    pdbconnect.query("SELECT * from holidays where del_flg =$1",['N'],function(err,holidayList)
                    {
                            if (err)
                            {
                                        console.error('Error with table query', err);
                            }
                            else
                            {
                                        holidayData = holidayList.rows;
                            }

                   pdbconnect.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)",[emp_id],function(err,emp_data)
                   {
                            if (err)
                            {
                                console.error('Error with table query', err);
                            }
                            else
                            {
                                emp_data_app = emp_data.rows;
                            }

                   pdbconnect.query("SELECT * from leave_config where year=$1 and del_flg = 'N' and leave_type!='PL'",[current_year],function(err,leaveConfigList)
                   {
                            if (err)
                            {
                                        console.error('Error with table query', err);
                            }
                            else
                            {
                                        leaveConfigData = leaveConfigList.rows;
                            }

                  pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function(err, holidayList)
                  {
                            if (err)
                            {
                                console.error('Error with table query', err);
                            }
                            else
                            {
                              var holiday_list = holidayList.rows;
                              var holiday_count = holidayList.rowCount;
                            }

                  pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('W','O') order by current_date", function(err,openList)
                  {
                            if (err)
                            {
                                console.error('Error with table query', err);
                            }
                            else
                            {
                              var open_list = openList.rows;
                              var open_count = openList.rowCount;
                            }
                            res.render('requestModule/applyLeave',{
                            eid:req.user.rows[0].user_id,
                            ename:req.user.rows[0].user_name,
                            emp_access:emp_access,
                            no_of_leaves:no_of_leaves,
                            emp_data_app:emp_data_app,
                            holidayData:holidayData,
                            leaveConfigData:leaveConfigData,
                            holiday_list:holiday_list,
                            holiday_count:holiday_count,
                            open_list:open_list,
                            open_count:open_count
                                                        });
                                                });
                                        });

                        });
                        });
                });
                });

        }

                if((gender == "M"||gender == "F")&&(martial_status == "B"||martial_status == "DI"))
                {
                    pdbconnect.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2",[emp_id,'N'],function(err,done)
                    {
                                if (err)
                                {
                                        console.error('Error with table query', err);
                                }
                                else
                                {
                                        rowData = done.rows;

                                        if(rowData.length !=0)
                                        {
                                                no_of_leaves=done.rows['0'].no_of_leaves;
                                        }
                                        else
                                        {
                                                no_of_leaves =0;
                                        }
                                }

                    pdbconnect.query("SELECT * from holidays where del_flg =$1",['N'],function(err,holidayList)
                    {
                            if (err)
                            {
                                        console.error('Error with table query', err);
                            }
                            else
                            {
                                        holidayData = holidayList.rows;
                            }

                   pdbconnect.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)",[emp_id],function(err,emp_data)
                   {
                            if (err)
                            {
                                console.error('Error with table query', err);
                            }
                            else
                            {
                                emp_data_app = emp_data.rows;
                            }

                   pdbconnect.query("SELECT * from leave_config where year=$1 and del_flg = 'N' and leave_type!='ML' and leave_type!='PL'",[current_year],function(err,leaveConfigList)
                   {
                            if (err)
                            {
                                        console.error('Error with table query', err);
                            }
                            else
                            {
                                        leaveConfigData = leaveConfigList.rows;
                            }

                  pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function(err, holidayList)
                  {
                            if (err)
                            {
                                console.error('Error with table query', err);
                            }
                            else
                            {
                              var holiday_list = holidayList.rows;
                              var holiday_count = holidayList.rowCount;
                            }

                  pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('W','O') order by current_date", function(err,openList)
                  {
                            if (err)
                            {
                                console.error('Error with table query', err);
                            }
                            else
                            {
                              var open_list = openList.rows;
                              var open_count = openList.rowCount;
                            }
                            res.render('requestModule/applyLeave',{
                            eid:req.user.rows[0].user_id,
                            ename:req.user.rows[0].user_name,
                            emp_access:emp_access,
                            no_of_leaves:no_of_leaves,
                            emp_data_app:emp_data_app,
                            holidayData:holidayData,
                            leaveConfigData:leaveConfigData,
                            holiday_list:holiday_list,
                            holiday_count:holiday_count,
                            open_list:open_list,
                            open_count:open_count
                                                        });
                                                });
                                        });

                        });
                        });
                });
                });
        }

	}
	else
	{
                if((gender == "NF") && (martial_status == "NF"))
                {
                    pdbconnect.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2",[emp_id,'N'],function(err,done)
                    {
                                if (err)
                                {
                                        console.error('Error with table query', err);
                                }
                                else
                                {
                                        rowData = done.rows;

                                        if(rowData.length !=0)
                                        {
                                                no_of_leaves=done.rows['0'].no_of_leaves;
                                        }
                                        else
                                        {
                                                no_of_leaves =0;
                                        }
                                }

                    pdbconnect.query("SELECT * from holidays where del_flg =$1",['N'],function(err,holidayList)
                    {
                            if (err)
                            {
                                        console.error('Error with table query', err);
                            }
                            else
                            {
                                        holidayData = holidayList.rows;
                            }

                   pdbconnect.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)",[emp_id],function(err,emp_data)
                   {
                            if (err)
                            {
                                console.error('Error with table query', err);
                            }
                            else
                            {
                                emp_data_app = emp_data.rows;
                            }

                   pdbconnect.query("SELECT * from leave_config where year=$1 and del_flg = 'N'",[current_year],function(err,leaveConfigList)
                   {
                            if (err)
                            {
                                        console.error('Error with table query', err);
                            }
                            else
                            {
                                        leaveConfigData = leaveConfigList.rows;
                            }

                  pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function(err, holidayList)
                  {
                            if (err)
                            {
                                console.error('Error with table query', err);
                            }
                            else
                            {
                              var holiday_list = holidayList.rows;
                              var holiday_count = holidayList.rowCount;
                            }

                  pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('W','O') order by current_date", function(err,openList)
                  {
                            if (err)
                            {
                                console.error('Error with table query', err);
                            }
                            else
                            {
                              var open_list = openList.rows;
                              var open_count = openList.rowCount;
                            }
                            res.render('requestModule/applyLeave',{
                            eid:req.user.rows[0].user_id,
                            ename:req.user.rows[0].user_name,
                            emp_access:emp_access,
                            no_of_leaves:no_of_leaves,
                            emp_data_app:emp_data_app,
                            holidayData:holidayData,
                            leaveConfigData:leaveConfigData,
                            holiday_list:holiday_list,
                            holiday_count:holiday_count,
                            open_list:open_list,
                            open_count:open_count
                                                        });
                                                });
                                        });

                        });
                        });
                });
                });


		}

	}

	});
};


function requestLeave(req,res)
{
	var emp_id = req.user.rows[0].user_id;
	var emp_access =req.user.rows[0].user_type;
	var emp_name =req.user.rows[0].user_name;
	var leave_type = req.body.leave_type;
	var from_date = req.body.fromDate;
	var to_date = req.body.toDate;
	var approver_id = req.body.apply_to;
	var availed_leaves = req.body.availed_leaves;
	var available_leaves = req.body.available_leaves;
	var quater_leaves = req.body.quater_leaves;
	console.log("quater_leaves",quater_leaves);
	var borr_leaves = req.body.borr_leaves;
	console.log("borr_leaves",borr_leaves);
	var session = req.body.session;
	var sessiontime = req.body.sessiontime;
	var reason = req.body.desc;
	var tempList='';
	var carry_forwarded = '';
        var now = new Date();
        var rcretime=now;
        var year = now.getFullYear();


        if(leave_type == "EL")
        {
	    console.log("el");

		if(borr_leaves == "0")
		{
			var borr_leaves = parseFloat(quater_leaves) - parseFloat(availed_leaves);
			console.log("borr_leaves",borr_leaves);
		}
		else
		{
			var borr_leaves = borr_leaves * -1 ;
			console.log("borr_leaves",borr_leaves);
		}

            pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function(err, holidayList)
            {
                        if (err)
                        {
                                console.error('Error with table query', err);
                        }
                        else
                        {
                                var holiday_list = holidayList.rows;
                                var holiday_count = holidayList.rowCount;
                        }

             pdbconnect.query("SELECT * from leaves ",function(err,done){
             if (err)
             {
                console.error('Error with table query', err);
             }
             else
             {
                leave_id_value = done.rowCount;
                console.log('leave_id_value',leave_id_value);
                leave_id_value = leave_id_value +100;
                console.log('leave_id_value',leave_id_value);
                leave_id = leave_id_value+1;
                console.log('leave_id',leave_id);
             }


             var rest_leaves = parseFloat(available_leaves) - parseFloat(availed_leaves);
             console.log('rest_leaves',rest_leaves);
             var now = new Date();
             var rcretime=now;
             var year = now.getFullYear();

             pdbconnect.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year=$6",['N' , emp_id, from_date,to_date,'N',year],function(err,leaveOverlapList)
             {
             if (err)
             {
                console.error('Error with table query', err);
             }
             else
             {
                leaveOverlapList_count = leaveOverlapList.rowCount;
                console.log('leaveOverlapList_count value',leaveOverlapList_count);
             }

             if(leaveOverlapList_count == 0)
             {

                        pdbconnect.query("INSERT INTO leaves(leave_type, from_date,to_date, del_flg,availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id,emp_id,app_flg,rej_flg,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)",  [leave_type,from_date,to_date,'N',availed_leaves,emp_id,rcretime,emp_id,rcretime,reason,approver_id,leave_id,emp_id,'N','N',year],function(err,done){
                        if(err) throw err;
                        });


                        pdbconnect.query("select * from leave_master where del_flg = $1 and emp_id =$2  and leave_type = $3 and year = $4 ",['N' , emp_id, leave_type,year],function(err,leaveMasterList)
                        {
                        if (err)
                        {
                                console.error('Error with table query', err);
                        }
                        else
                        {
                                leaveMasterList_count = leaveMasterList.rowCount;
                                if(leaveMasterList_count!=0)
                                {
                                        availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
                                }
                                else
                                {
                                        availed_leaves_master =0;
                                }

                                console.log('leaveMasterList_count value',leaveMasterList_count);
                                console.log('availed_leaves_master value',availed_leaves_master);
                        }

              if(leaveMasterList_count == 0)
              {

                  pdbconnect.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2",[emp_id,'N'],function(err,done)
                  {
                          if (err)
                          {
                                console.error('Error with table query', err);
                          }
                          else
                          {
                                carry_forwarded =0;
                          }

                          console.log('carry_forwarded value',carry_forwarded);

                          pdbconnect.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3",['N' ,leave_type,year],function(err,leaveConfigList){
                          if (err)
                          {
                                console.error('Error with table query', err);
                          }
                          else
                          {
                                credited_leaves = leaveConfigList.rows[0].allocated_leaves;
                                console.log('credited_leaves value',credited_leaves);
                          }

                                  pdbconnect.query("INSERT INTO leave_master(emp_id, leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, year, quaterly_leave) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",  [emp_id, leave_type,'N',availed_leaves,carry_forwarded,credited_leaves,emp_id,rcretime,emp_id,rcretime,year,borr_leaves],function(err,done)
                                  {
                                        if(err) throw err;
                                  });
                          });

                  });
                }
                else
                {

                        console.log('please do it');
                        total_leaves = parseFloat(availed_leaves_master) + parseFloat(availed_leaves) ;
                        console.log('total_leaves value',total_leaves);

                        pdbconnect.query("update leave_master set availed_leaves = $1 , lchg_user_id = $2, lchg_time =$3 ,quaterly_leave =$6 where year = $4 and emp_id = $5 and leave_type = $7 ",  [total_leaves,emp_id,rcretime,year,emp_id,borr_leaves,leave_type],function(err,done)
                        {
                                if(err) throw err;
                        });
                }

            pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
            if (err)
            {
                console.error('Error with table query', err);
            }
            else
            {
                 employee_email=empResult.rows['0'].emp_email;
                 console.log('employee_email' ,employee_email);
            }

            pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'",function(err, hrMailList) {
            if (err)
            {
                console.error('Error with table query', err);
            }
            else
            {
                  var hrEmail = hrMailList.rows['0'].comm_code_desc;

                  tempList = hrEmail + ',' + employee_email;
                  console.log('tempList',tempList);
            }


            pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[approver_id], function(err, managerMail) {
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

            var smtpTransport = nodemailer.createTransport('SMTP',{
            service: 'gmail',
            auth:
            {
                user: 'amber@nurture.co.in',
                pass: 'nurture@123'
            }
            });

        	var session = req.body.session;
        	var sessiontime = req.body.sessiontime;
        	var leave_type = req.body.leave_type;

	    if(session == "FD")
	    {
		var session = "FULL DAY";
		var sessiontime = "Session 1 - Session 2";
	    }
	    else
	    {
		var session = "HALF DAY";
		
		if(sessiontime == "S1S2")
		{
			var sessiontime = "Session 1";
		}
		else
		{
			var sessiontime = "Session 2";
		}
	    }

                        var mailOptions = {
						to: managerMailId,
						cc: tempList,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Leave Requested',
                                                html: '<img src="https://www.theplanner.co.uk/sites/default/files/Web_Submitted_shutterstock_434614015.jpg" height="85"><br><br>' +
                                                '<h3> Submitted Leave Application Details for Managers Approval<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                                '<th style="border: 10px solid black;">' + leave_type + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Employee Name </td> ' +
                                                                '<th style="border: 10px solid black;">' + emp_name + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Employee ID</th> ' +
                                                                '<th style="border: 10px solid black;">' + emp_id + '</th>' +

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

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Reason </td> ' +
                                                                '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Session Type </td> ' +
                                                                '<th style="border: 10px solid black;">' + session + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Session Time </td> ' +
                                                                '<th style="border: 10px solid black;">' + sessiontime + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br><br>' +
					        '- Regards,<br><br>Amber</h3>'	
                                         };


            smtpTransport.sendMail(mailOptions, function(err) {
            });

        });

                        pdbconnect.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)",[emp_id],function(err,emp_data){
                                if (err)
                                {
                                        console.error('Error with table query', err);
                                }
                                else
                                {
                                        emp_data_app = emp_data.rows;
                                }


                                pdbconnect.query("SELECT * from holidays where del_flg =$1",['N'],function(err,holidayList)
                                {
                                        if (err)
                                        {
                                                console.error('Error with table query', err);
                                        }
                                        else
                                        {
                                                holidayData = holidayList.rows;
                                        }
                                });
                        });

                });
          });
     });


                        success ='Leave request submitted successfully' ;
                        res.render('requestModule/applyLeave',{
                        emp_id:emp_id,
                        emp_name:emp_name,
                        emp_access:emp_access,
                        no_of_leaves:rest_leaves,
                        emp_data_app:emp_data_app,
                        holidayData:holidayData,
                        holiday_list:holiday_list,
                        holiday_count:holiday_count,
                        success:success
                                                             });
                }
                else
                {
                        req.flash('error',"Leave dates overlap please recheck")
                        res.redirect(req.get('referer'));
                }
                });
                });
                });
        }


	if((leave_type != "EL")&&(leave_type != "RL"))
	{
	    console.log("is not el and not rl");
	    pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function(err, holidayList)
	    {
			if (err)
			{
				console.error('Error with table query', err);
			}
			else
			{
				var holiday_list = holidayList.rows;
				var holiday_count = holidayList.rowCount;
			}

	     pdbconnect.query("SELECT * from leaves ",function(err,done){
             if (err) 
	     {
                console.error('Error with table query', err);
             } 
             else 
	     {
               	leave_id_value = done.rowCount;
              	console.log('leave_id_value',leave_id_value);
               	leave_id_value = leave_id_value +100;
               	console.log('leave_id_value',leave_id_value);
              	leave_id = leave_id_value+1;
              	console.log('leave_id',leave_id);
             }

   
	     var rest_leaves = parseFloat(available_leaves) - parseFloat(availed_leaves);
	     console.log('rest_leaves',rest_leaves);
 	     var now = new Date();
   	     var rcretime=now;
   	     var year = now.getFullYear();
    
   	     pdbconnect.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year=$6",['N' , emp_id, from_date,to_date,'N',year],function(err,leaveOverlapList)
	     {
             if (err) 
	     {
                console.error('Error with table query', err);
             } 
	     else 
	     {
                leaveOverlapList_count = leaveOverlapList.rowCount;
                console.log('leaveOverlapList_count value',leaveOverlapList_count);
             }   

     	     if(leaveOverlapList_count == 0)
	     {       

 			pdbconnect.query("INSERT INTO leaves(leave_type, from_date,to_date, del_flg,availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id,emp_id,app_flg,rej_flg,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)",  [leave_type,from_date,to_date,'N',availed_leaves,emp_id,rcretime,emp_id,rcretime,reason,approver_id,leave_id,emp_id,'N','N',year],function(err,done){
             		if(err) throw err;
              		});


 			pdbconnect.query("select * from leave_master where del_flg = $1 and emp_id =$2  and leave_type = $3 and year = $4 ",['N' , emp_id, leave_type,year],function(err,leaveMasterList)
			{
             		if (err) 
			{
                		console.error('Error with table query', err);
            		} 
			else 
			{
                		leaveMasterList_count = leaveMasterList.rowCount;
                		if(leaveMasterList_count!=0)
				{
                  			availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
                		}
				else
				{
                  			availed_leaves_master =0;
                		}
                
                		console.log('leaveMasterList_count value',leaveMasterList_count);
                		console.log('availed_leaves_master value',availed_leaves_master);
            		}
	
              if(leaveMasterList_count == 0)
	      {

                  pdbconnect.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2",[emp_id,'N'],function(err,done)
		  {
			  if (err) 
			  {
				console.error('Error with table query', err);
			  } 
			  else 
			  {
				carry_forwarded =0;
			  }

			  console.log('carry_forwarded value',carry_forwarded);
	 
			  pdbconnect.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3",['N' ,leave_type,year],function(err,leaveConfigList){
			  if (err) 
			  {
				console.error('Error with table query', err);
			  } 
			  else 
			  {
				credited_leaves = leaveConfigList.rows[0].allocated_leaves;
				console.log('credited_leaves value',credited_leaves);
			  }

				  pdbconnect.query("INSERT INTO leave_master(emp_id, leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",  [emp_id, leave_type,'N',availed_leaves,carry_forwarded,credited_leaves,emp_id,rcretime,emp_id,rcretime,year],function(err,done)
				  {
					if(err) throw err;
				  });
			  });

                  });
            	}   
		else 
		{

               		console.log('please do it');
                	total_leaves = parseFloat(availed_leaves_master) + parseFloat(availed_leaves) ; 
			console.log('total_leaves value',total_leaves);

               		pdbconnect.query("update leave_master set availed_leaves = $1 , lchg_user_id = $2, lchg_time =$3 where year = $4 and emp_id = $5 and leave_type = $6 ",  [total_leaves,emp_id,rcretime,year,emp_id,leave_type],function(err,done)
			{
             			if(err) throw err;
              		});
          	}
           
   	    pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
            if (err) 
	    {
                console.error('Error with table query', err);
            } 
	    else 
	    {
            	 employee_email=empResult.rows['0'].emp_email;
                 console.log('employee_email' ,employee_email);
            }  

     	    pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'",function(err, hrMailList) {
            if (err) 
	    {
                console.error('Error with table query', err);
            } 
	    else 
	    {
                  var hrEmail = hrMailList.rows['0'].comm_code_desc;
               
                  tempList = hrEmail + ',' + employee_email;  
                  console.log('tempList',tempList);
            }


            pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[approver_id], function(err, managerMail) {
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
      
            var smtpTransport = nodemailer.createTransport('SMTP',{
            service: 'gmail',
            auth: 
            {
                user: 'amber@nurture.co.in',
                pass: 'nurture@123'
            }
            });
           
	var session = req.body.session;
	var sessiontime = req.body.sessiontime;

        var leave_type = req.body.leave_type;

            if(session == "FD")
            {
                var session = "FULL DAY";
                var sessiontime = "Session 1 - Session 2";
            }
            else
            {
                var session = "HALF DAY";

                if(sessiontime == "S1S2")
                {
                        var sessiontime = "Session 1";
                }
                else
                {
                        var sessiontime = "Session 2";
                }
            }


                        var mailOptions = {
                                                to: managerMailId,
                                                cc: tempList,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Leave Requested',
                                                html: '<img src="https://www.theplanner.co.uk/sites/default/files/Web_Submitted_shutterstock_434614015.jpg" height="85"><br><br>' +
                                                '<h3> Submitted Leave Application Details for Managers Approval<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                                '<th style="border: 10px solid black;">' + leave_type + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Employee Name </td> ' +
                                                                '<th style="border: 10px solid black;">' + emp_name + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Employee ID</th> ' +
                                                                '<th style="border: 10px solid black;">' + emp_id + '</th>' +

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

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Reason </td> ' +
                                                                '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Session Type </td> ' +
                                                                '<th style="border: 10px solid black;">' + session + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Session Time </td> ' +
                                                                '<th style="border: 10px solid black;">' + sessiontime + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
                                         };


            smtpTransport.sendMail(mailOptions, function(err) {
            });

 	});

     			pdbconnect.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)",[emp_id],function(err,emp_data){
        			if (err) 
				{
                			console.error('Error with table query', err);
            			} 
				else 
				{
                			emp_data_app = emp_data.rows;
            			}  


				pdbconnect.query("SELECT * from holidays where del_flg =$1",['N'],function(err,holidayList)
				{
					if (err) 
					{
						console.error('Error with table query', err);
					} 
					else 
					{
						holidayData = holidayList.rows;
					}	  
				});
     			});

     		});
     	  });
     });


			success ='Leave request submitted successfully' ;
			res.render('requestModule/applyLeave',{
			emp_id:emp_id, 
			emp_name:emp_name,
			emp_access:emp_access,
			no_of_leaves:rest_leaves,
			emp_data_app:emp_data_app,
			holidayData:holidayData,
			holiday_list:holiday_list,
			holiday_count:holiday_count,
			success:success
							     });
		}
		else
		{
			req.flash('error',"Leave dates overlap please recheck")
			res.redirect(req.get('referer')); 
		}            
		});
		});
		});
	}
	
	if(leave_type == "RL")
	{
	    	console.log("is rl");
		var leave_type1 = req.body.leave_type1;
		console.log("leave_type1",leave_type1);

		var res_leave = req.body.res_leave;
		console.log("res_leave",res_leave);

		var apply_to1 = req.body.apply_to1;
		console.log("apply_to1",apply_to1);

		var availed_leaves1 = req.body.availed_leaves1;
		console.log("availed_leaves1",availed_leaves1);

		var desc1 = req.body.desc1;
		console.log("desc1",desc1);

		var available_leaves1 = req.body.available_leaves1;
		console.log("available_leaves1",available_leaves1);


		if(res_leave != "B")
		{
			console.log("not birthday");

			var res_leave = req.body.res_leave;
			console.log("res_leave",res_leave);
			var res_leave = dateFormat(res_leave,"yyyy-mm-dd");
			console.log("res_leave",res_leave);

		     	// bcs restricted leave is only one day

		     	var from_date = res_leave;
		     	var to_date = res_leave;


                        pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function(err, holidayList)
                        {
                                if (err)
                                {
                                        console.error('Error with table query', err);
                                }
                                else
                                {
                                        var holiday_list = holidayList.rows;
                                        var holiday_count = holidayList.rowCount;
                                }

                               pdbconnect.query("SELECT * from leaves ",function(err,done){
                               if (err)
                               {
                                        console.error('Error with table query', err);
                               }
                               else
                               {
                                        leave_id_value = done.rowCount;
                                        console.log('leave_id_value',leave_id_value);
                                        leave_id_value = leave_id_value +100;
                                        console.log('leave_id_value',leave_id_value);
                                        leave_id = leave_id_value+1;
                                        console.log('leave_id',leave_id);
                               }

			
		     ////////////////////////////////////////


                     pdbconnect.query("select * from leaves where leave_type='RL' and emp_id =$1 and del_flg ='N' and year=$2",[emp_id,year],function(err, result)
		     {
			var rcount = result.rowCount;
			console.log("rcountrl",rcount);

		     if(rcount < 2)
		     {
			     var rest_leaves = parseFloat(available_leaves1) - parseFloat(availed_leaves1);
			     console.log('rest_leaves',rest_leaves);
			     var now = new Date();
			     var rcretime=now;
			     var year= now.getFullYear();

			     pdbconnect.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year=$6",['N' , emp_id, from_date,to_date,'N',year],function(err,leaveOverlapList)
			     {
			     if (err)
			     {
				console.error('Error with table query', err);
			     }
			     else
			     {
				leaveOverlapList_count = leaveOverlapList.rowCount;
				console.log('leaveOverlapList_count value',leaveOverlapList_count);
			     }

			     if(leaveOverlapList_count == 0)
			     {

					pdbconnect.query("INSERT INTO leaves(leave_type, from_date,to_date, del_flg,availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id,emp_id,app_flg,rej_flg,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)",  [leave_type1,from_date,to_date,'N',availed_leaves1,emp_id,rcretime,emp_id,rcretime,desc1,apply_to1,leave_id,emp_id,'N','N',year],function(err,done){
					if(err) throw err;
					});


					pdbconnect.query("select * from leave_master where del_flg = $1 and emp_id =$2  and leave_type = $3 and year = $4 ",['N' , emp_id, leave_type1,year],function(err,leaveMasterList)
					{
					if (err)
					{
						console.error('Error with table query', err);
					}
					else
					{
						leaveMasterList_count = leaveMasterList.rowCount;
						if(leaveMasterList_count!=0)
						{
							availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
						}
						else
						{
							availed_leaves_master =0;
						}

						console.log('leaveMasterList_count value',leaveMasterList_count);
						console.log('availed_leaves_master value',availed_leaves_master);
					}

			      if(leaveMasterList_count == 0)
			      {

				  pdbconnect.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2",[emp_id,'N'],function(err,done)
				  {
					  if (err)
					  {
						console.error('Error with table query', err);
					  }
					  else
					  {
						carry_forwarded =0;
					  }

					  console.log('carry_forwarded value',carry_forwarded);

					  pdbconnect.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3",['N',leave_type1,year],function(err,leaveConfigList){
					  if (err)
					  {
						console.error('Error with table query', err);
					  }
					  else
					  {
						credited_leaves = leaveConfigList.rows[0].allocated_leaves;
						console.log('credited_leaves value',credited_leaves);
					  }

						  pdbconnect.query("INSERT INTO leave_master(emp_id, leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",  [emp_id, leave_type1,'N',availed_leaves1,carry_forwarded,credited_leaves,emp_id,rcretime,emp_id,rcretime,year],function(err,done)
						  {
							if(err) throw err;
						  });
					  });

				  });
				}
				else
				{

					console.log('please do it');
					total_leaves = parseFloat(availed_leaves_master) + parseFloat(availed_leaves) ;
					console.log('total_leaves value',total_leaves);

					pdbconnect.query("update leave_master set availed_leaves = $1 ,lchg_user_id = $2, lchg_time =$3 where year = $4 and emp_id = $5 and leave_type = $6 ",  [total_leaves, emp_id,rcretime,year,emp_id,leave_type1],function(err,done)
					{
						if(err) throw err;
					});
				}

			    pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
			    if (err)
			    {
				console.error('Error with table query', err);
			    }
			    else
			    {
				 employee_email=empResult.rows['0'].emp_email;
				 console.log('employee_email' ,employee_email);
			    }


			    pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'",function(err, hrMailList) {
			    if (err)
			    {
				console.error('Error with table query', err);
			    }
			    else
			    {
				  var hrEmail = hrMailList.rows['0'].comm_code_desc;

				  tempList = hrEmail + ',' + employee_email;
				  console.log('tempList',tempList);
			    }


			    pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[apply_to1], function(err, managerMail) {
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

			    var smtpTransport = nodemailer.createTransport('SMTP',{
			    service: 'gmail',
			    auth:
			    {
				user: 'amber@nurture.co.in',
				pass: 'nurture@123'
			    }
			    });


			    var session="FD";
			    if(session == "FD")
			    {
				var session = "FULL DAY";
				var sessiontime = "Session 1 - Session 2";
			    }


                        var mailOptions = {
                                                to: managerMailId,
                                                cc: tempList,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Leave Requested',
                                                html: '<img src="https://www.theplanner.co.uk/sites/default/files/Web_Submitted_shutterstock_434614015.jpg" height="85"><br><br>' +
                                                '<h3> Submitted Leave Application Details for Managers Approval<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                                '<th style="border: 10px solid black;">' + leave_type1 + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Employee Name </td> ' +
                                                                '<th style="border: 10px solid black;">' + emp_name + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Employee ID</th> ' +
                                                                '<th style="border: 10px solid black;">' + emp_id + '</th>' +

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
                                                                '<th style="border: 10px solid black;">' + availed_leaves1 + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Reason </td> ' +
                                                                '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Session Type </td> ' +
                                                                '<th style="border: 10px solid black;">' + session + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Session Time </td> ' +
                                                                '<th style="border: 10px solid black;">' + sessiontime + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
                                         };



			    smtpTransport.sendMail(mailOptions, function(err) {
			    });

			});

					pdbconnect.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)",[emp_id],function(err,emp_data){
						if (err)
						{
							console.error('Error with table query', err);
						}
						else
						{
							emp_data_app = emp_data.rows;
						}


						pdbconnect.query("SELECT * from holidays where del_flg =$1",['N'],function(err,holidayList)
						{
							if (err)
							{
								console.error('Error with table query', err);
							}
							else
							{
								holidayData = holidayList.rows;
							}
						});
					});
				});
			  });
		     });

					success ='Leave request submitted successfully' ;
					res.render('requestModule/applyLeave',{
					emp_id:emp_id,
					emp_name:emp_name,
					emp_access:emp_access,
					no_of_leaves:rest_leaves,
					emp_data_app:emp_data_app,
					holidayData:holidayData,
					holiday_list:holiday_list,
					holiday_count:holiday_count,
					success:success
									     });
				}
				else
				{
					req.flash('error',"Leave dates overlap please recheck")
					res.redirect('/requestModule/applyLeave/applyLeave');
				}
				});
			}
			else
			{
					req.flash('error',"Restricted Leave Type already utilised for 2 days")
					res.redirect('/requestModule/applyLeave/applyLeave');
			}
			});
			});
			});
		}
		else
		{
			console.log("Birthday");

			var leave_type1 = req.body.leave_type1;
			console.log("leave_type1",leave_type1);

			var res_leave = req.body.res_leave;
			console.log("res_leave",res_leave);

			var apply_to1 = req.body.apply_to1;
			console.log("apply_to1",apply_to1);

			var availed_leaves1 = req.body.availed_leaves1;
			console.log("availed_leaves1",availed_leaves1);

			var desc1 = req.body.desc1;
			console.log("desc1",desc1);

			var available_leaves1 = req.body.available_leaves1;
			console.log("available_leaves1",available_leaves1);


                        pdbconnect.query("SELECT * from emp_info_tbl where emp_id = $1",[emp_id],function(err,result)
                        {
                                var mcount = result.rowCount;

                                if(mcount == "0")
                                {
                                        req.flash('error',"Birthday data not available or Verification pending by the Admin")
                                        res.redirect(req.get('referer'));
                                }
                                else
                                {
                                     console.log("Success Birthday");
				     pdbconnect.query("SELECT dob, emp_name, cast(dob + ((extract(year from age(dob)) + 1) * interval '1' year) as date) as next_birthday from emp_info_tbl where emp_id = $1 and del_flg = 'N' ",[emp_id],function(err,result)
                        	     {
                                	
					var res_leave = result.rows['0'].next_birthday;
					var res_leave = dateFormat(res_leave,"yyyy-mm-dd");
					console.log("res_leave",res_leave);

					// bcs restricted leave is only one day

					var from_date = res_leave;
					var to_date = res_leave;


					pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function(err, holidayList)
					{
						if (err)
						{
							console.error('Error with table query', err);
						}
						else
						{
							var holiday_list = holidayList.rows;
							var holiday_count = holidayList.rowCount;
						}

					       pdbconnect.query("SELECT * from leaves ",function(err,done){
					       if (err)
					       {
							console.error('Error with table query', err);
					       }
					       else
					       {
							leave_id_value = done.rowCount;
							console.log('leave_id_value',leave_id_value);
							leave_id_value = leave_id_value +100;
							console.log('leave_id_value',leave_id_value);
							leave_id = leave_id_value+1;
							console.log('leave_id',leave_id);
					       }


				     ////////////////////////////////////////


                     		     pdbconnect.query("select * from leaves where leave_type='RL' and emp_id=$1 and del_flg ='N' and year =$2",[emp_id,year], function(err, result)
                     		     {
                        		var rcount = result.rowCount;
                     			if(rcount < 2)
                     			{
				     	     var rest_leaves = parseFloat(available_leaves1) - parseFloat(availed_leaves1);
				     	     console.log('rest_leaves',rest_leaves);
					     var now = new Date();
					     var rcretime=now;
					     var year= now.getFullYear();

					     pdbconnect.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year = $6",['N' , emp_id, from_date,to_date,'N',year],function(err,leaveOverlapList)
					     {
					     if (err)
					     {
						console.error('Error with table query', err);
					     }
					     else
					     {
						leaveOverlapList_count = leaveOverlapList.rowCount;
						console.log('leaveOverlapList_count value',leaveOverlapList_count);
					     }

					     if(leaveOverlapList_count == 0)
					     {

							pdbconnect.query("INSERT INTO leaves(leave_type, from_date,to_date, del_flg,availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id,emp_id,app_flg,rej_flg,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)",  [leave_type1,from_date,to_date,'N',availed_leaves1,emp_id,rcretime,emp_id,rcretime,desc1,apply_to1,leave_id,emp_id,'N','N',year],function(err,done){
							if(err) throw err;
							});


							pdbconnect.query("select * from leave_master where del_flg = $1 and emp_id =$2  and leave_type = $3 and year = $4 ",['N' , emp_id, leave_type1,year],function(err,leaveMasterList)
							{
							if (err)
							{
								console.error('Error with table query', err);
							}
							else
							{
								leaveMasterList_count = leaveMasterList.rowCount;
								if(leaveMasterList_count!=0)
								{
									availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
								}
								else
								{
									availed_leaves_master =0;
								}

								console.log('leaveMasterList_count value',leaveMasterList_count);
								console.log('availed_leaves_master value',availed_leaves_master);
							}

					      if(leaveMasterList_count == 0)
					      {

						  pdbconnect.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2",[emp_id,'N'],function(err,done)
						  {
							  if (err)
							  {
								console.error('Error with table query', err);
							  }
							  else
							  {
								carry_forwarded =0;
							  }

							  console.log('carry_forwarded value',carry_forwarded);

							  pdbconnect.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3",['N' , leave_type1,year],function(err,leaveConfigList){
							  if (err)
							  {
								console.error('Error with table query', err);
							  }
							  else
							  {
								credited_leaves = leaveConfigList.rows[0].allocated_leaves;
								console.log('credited_leaves value',credited_leaves);
							  }

								  pdbconnect.query("INSERT INTO leave_master(emp_id, leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",  [emp_id, leave_type1,'N',availed_leaves1,carry_forwarded,credited_leaves,emp_id,rcretime,emp_id,rcretime,year],function(err,done)
								  {
									if(err) throw err;
								  });
							  });
						  });
						}
						else
						{

							console.log('please do it');
							total_leaves = parseFloat(availed_leaves_master) + parseFloat(availed_leaves) ;
							console.log('total_leaves value',total_leaves);

							pdbconnect.query("update  leave_master set availed_leaves = $1 , lchg_user_id = $2, lchg_time =$3 where year = $4 and emp_id = $5 and leave_type = $6 ",  [total_leaves, emp_id,rcretime,year,emp_id,leave_type1],function(err,done)
							{
								if(err) throw err;
							});
						}

					    pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
					    if (err)
					    {
						console.error('Error with table query', err);
					    }
					    else
					    {
						 employee_email=empResult.rows['0'].emp_email;
						 console.log('employee_email' ,employee_email);
					    }

					    pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'",function(err, hrMailList) {
					    if (err)
					    {
						console.error('Error with table query', err);
					    }
					    else
					    {
						  var hrEmail = hrMailList.rows['0'].comm_code_desc;

						  tempList = hrEmail + ',' + employee_email;
						  console.log('tempList',tempList);
					    }

					    pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[apply_to1], function(err, managerMail) {
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

					    var smtpTransport = nodemailer.createTransport('SMTP',{
					    service: 'gmail',
					    auth:
					    {
						user: 'amber@nurture.co.in',
						pass: 'nurture@123'
					    }
					    });

					    var session="FD";
					    if(session == "FD")
					    {
						var session = "FULL DAY";
						var sessiontime = "Session 1 - Session 2";
					    }


                        			var mailOptions = {
                                                to: managerMailId,
                                                cc: tempList,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Leave Requested',
                                                html: '<img src="https://www.theplanner.co.uk/sites/default/files/Web_Submitted_shutterstock_434614015.jpg" height="85"><br><br>' +
                                                '<h3> Submitted Leave Application Details for Managers Approval<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                                '<th style="border: 10px solid black;">' + leave_type1 + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Employee Name </td> ' +
                                                                '<th style="border: 10px solid black;">' + emp_name + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Employee ID</th> ' +
                                                                '<th style="border: 10px solid black;">' + emp_id + '</th>' +

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
                                                                '<th style="border: 10px solid black;">' + availed_leaves1 + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Reason </td> ' +
                                                                '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Session Type </td> ' +
                                                                '<th style="border: 10px solid black;">' + session + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Session Time </td> ' +
                                                                '<th style="border: 10px solid black;">' + sessiontime + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
                                         };

					    smtpTransport.sendMail(mailOptions, function(err) {
					    });

					});

							pdbconnect.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)",[emp_id],function(err,emp_data){
								if (err)
								{
									console.error('Error with table query', err);
								}
								else
								{
									emp_data_app = emp_data.rows;
								}


								pdbconnect.query("SELECT * from holidays where del_flg =$1",['N'],function(err,holidayList)
								{
									if (err)
									{
										console.error('Error with table query', err);
									}
									else
									{
										holidayData = holidayList.rows;
									}
								});
							});
						});
					  });
				     });

							success ='Leave request submitted successfully' ;
							res.render('requestModule/applyLeave',{
							emp_id:emp_id,
							emp_name:emp_name,
							emp_access:emp_access,
							no_of_leaves:rest_leaves,
							emp_data_app:emp_data_app,
							holidayData:holidayData,
							holiday_list:holiday_list,
							holiday_count:holiday_count,
							success:success
											     });
						}
						else
						{
							req.flash('error',"Leave dates overlap please recheck")
							res.redirect('/requestModule/applyLeave/applyLeave');
						}
						});
					}
					else
					{
						req.flash('error',"Restricted Leave Type already utilised for 2 days")
						res.redirect('/requestModule/applyLeave/applyLeave');
					}
					});
					});
					});
					});
                                }

			});
		}
	}
};


function markLeave(req,res)
{
            var eid =req.user.rows[0].user_id;
            var emp_access = req.user.rows[0].user_type;
            var ename =req.user.rows[0].user_name;
            var current_date = new Date();
            var current_year = current_date.getFullYear();
            console.log("current_year",current_year);


            pdbconnect.query("SELECT * from emp_master_tbl where del_flg='N' order by emp_id asc",function(err,done)
            {
                        if (err)
                        {
                                console.error('Error with table query', err);
                        }
                        else
                        {
                                var emp_details_count = done.rowCount;
                                var emp_details = done.rows;
                        }


            pdbconnect.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2",[eid,'N'],function(err,done)
            {
                        if (err)
                        {
                                console.error('Error with table query', err);
                        }
                        else
                        {
                                rowData = done.rows;

                                if(rowData.length !=0)
                                {
                                        no_of_leaves=done.rows['0'].no_of_leaves;
                                }
                                else
                                {
                                        no_of_leaves =0;
                                }
                        }

            pdbconnect.query("SELECT * from holidays where del_flg =$1",['N'],function(err,holidayList)
            {
                    if (err)
                    {
                                console.error('Error with table query', err);
                    }
                    else
                    {
                                holidayData = holidayList.rows;
                    }
           pdbconnect.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)",[eid],function(err,emp_data)
           {
                    if (err)
                    {
                        console.error('Error with table query', err);
                    }
                    else
                    {
                        emp_data_app = emp_data.rows;
                    }

           pdbconnect.query("SELECT * from leave_config where year=$1 and del_flg = 'N'",[current_year],function(err,leaveConfigList)
           {
                    if (err)
                    {
                                console.error('Error with table query', err);
                    }
                    else
                    {
                                leaveConfigData = leaveConfigList.rows;
                    }

          pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function(err, holidayList)
          {
                    if (err)
                    {
                        console.error('Error with table query', err);
                    }
                    else
                    {
                      var holiday_list = holidayList.rows;
                      var holiday_count = holidayList.rowCount;
                    }


                    res.render('requestModule/markLeave',{
                    eid:eid,
                    ename:ename,
                    emp_access:emp_access,
		    emp_details:emp_details,
		    emp_details_count:emp_details_count,
                    no_of_leaves:no_of_leaves,
                    emp_data_app:emp_data_app,
                    holidayData:holidayData,
                    leaveConfigData:leaveConfigData,
                    holiday_list:holiday_list,
                    holiday_count:holiday_count
                                                });
                                        });
                                });
                        });
                });
        });
    });
}

function markpostLeave(req,res)
{

        var eid = req.user.rows[0].user_id;
        var emp_access =req.user.rows[0].user_type;
        var ename =req.user.rows[0].user_name;
        var leave_type = req.body.leave_type;
        var from_date = req.body.fromDate;
        var to_date = req.body.toDate;
        var approver_id = req.body.apply_to;
        var availed_leaves = req.body.availed_leaves;
        var available_leaves = req.body.available_leaves;
        var quater_leaves = req.body.quater_leaves;
        var borr_leaves = req.body.borr_leaves;
        var session = req.body.session;
        var sessiontime = req.body.sessiontime;
        var reason = req.body.desc;
        var tempList='';
        var carry_forwarded = '';
        var now = new Date();
        var rcretime=now;
        var year = now.getFullYear();

        if(leave_type == "EL")
        {
            	console.log("el");

        	var emp_id = req.body.emp_id;
		console.log("emp_id",emp_id);

		pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id = $1 and del_flg ='N'",[emp_id],function(err,result){
		if (err)
		{
			console.error('Error with table query', err);
		}
		else
		{
			var emp_name = result.rows[0].emp_name;
			console.log("emp_name",emp_name);
		}

		var borr_leaves = req.body.borr_leaves;
		console.log("before if borr_leaves",borr_leaves);

                if(borr_leaves == 0)
                {
                        var borr_leaves = parseFloat(quater_leaves) - parseFloat(availed_leaves);
                        console.log("borr_leaves0",borr_leaves);
                }
                else
                {
                        var borr_leaves = borr_leaves * -1 ;
                        console.log("borr_leaves1",borr_leaves);
                }


            pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function(err, holidayList)
            {
                        if (err)
                        {
                                console.error('Error with table query', err);
                        }
                        else
                        {
                                var holiday_list = holidayList.rows;
                                var holiday_count = holidayList.rowCount;
                        }

             pdbconnect.query("SELECT * from leaves ",function(err,done){
             if (err)
             {
                console.error('Error with table query', err);
             }
             else
             {
                leave_id_value = done.rowCount;
                console.log('leave_id_value',leave_id_value);
                leave_id_value = leave_id_value +100;
                console.log('leave_id_value',leave_id_value);
                leave_id = leave_id_value+1;
                console.log('leave_id',leave_id);
             }
             var rest_leaves = parseFloat(available_leaves) - parseFloat(availed_leaves);
             console.log('rest_leaves',rest_leaves);
             var now = new Date();
             var rcretime=now;
             var year = now.getFullYear();

             pdbconnect.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year=$6",['N',emp_id,from_date,to_date,'N',year],function(err,leaveOverlapList)
             {
             if (err)
             {
                console.error('Error with table query', err);
             }
             else
             {
                leaveOverlapList_count = leaveOverlapList.rowCount;
                console.log('leaveOverlapList_count value',leaveOverlapList_count);
             }

             if(leaveOverlapList_count == 0)
             {

                        pdbconnect.query("INSERT INTO leaves(leave_type, from_date,to_date, del_flg,availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id,emp_id,app_flg,rej_flg,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)",  [leave_type,from_date,to_date,'N',availed_leaves,eid,rcretime,eid,rcretime,reason,approver_id,leave_id,emp_id,'Y','N',year],function(err,done){
                        if(err) throw err;
                        });


                        pdbconnect.query("select * from leave_master where del_flg = $1 and emp_id =$2 and leave_type = $3 and year = $4 ",['N' ,emp_id,leave_type,year],function(err,leaveMasterList)
                        {
                        if (err)
                        {
                                console.error('Error with table query', err);
                        }
                        else
                        {
                                leaveMasterList_count = leaveMasterList.rowCount;
                                if(leaveMasterList_count!=0)
                                {
                                        availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
                                }
                                else
                                {
                                        availed_leaves_master =0;
                                }

                                console.log('leaveMasterList_count value',leaveMasterList_count);
                                console.log('availed_leaves_master value',availed_leaves_master);
                        }

              if(leaveMasterList_count == 0)
              {

                  pdbconnect.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2",[emp_id,'N'],function(err,done)
                  {
                          if (err)
                          {
                                console.error('Error with table query', err);
                          }
                          else
                          {
                                carry_forwarded =0;
                          }

                          console.log('carry_forwarded value',carry_forwarded);

                          pdbconnect.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3",['N' ,leave_type,year],function(err,leaveConfigList){
                          if (err)
                          {
                                console.error('Error with table query', err);
                          }
                          else
                          {
                                credited_leaves = leaveConfigList.rows[0].allocated_leaves;
                                console.log('credited_leaves value',credited_leaves);
                          }
                                  pdbconnect.query("INSERT INTO leave_master(emp_id, leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, year, quaterly_leave) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",[emp_id,leave_type,'N',availed_leaves,carry_forwarded,credited_leaves,eid,rcretime,eid,rcretime,year,borr_leaves],function(err,done)
                                  {
                                        if(err) throw err;
                                  });
                          });

                  });
                }
                else
                {

                        console.log('please do it');
                        total_leaves = parseFloat(availed_leaves_master) + parseFloat(availed_leaves) ;
                        console.log('total_leaves value',total_leaves);

                        pdbconnect.query("update leave_master set availed_leaves = $1,lchg_user_id = $2,lchg_time =$3,quaterly_leave =$6 where year = $4 and emp_id = $5 and leave_type = $7 ",  [total_leaves,eid,rcretime,year,emp_id,borr_leaves,leave_type],function(err,done)
                        {
                                if(err) throw err;
                        });
                }

            pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[emp_id], function(err, empResult) {
            if (err)
            {
                console.error('Error with table query', err);
            }
            else
            {
                 employee_email=empResult.rows['0'].emp_email;
                 console.log('employee_email' ,employee_email);
            }

            pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'",function(err, hrMailList) {
            if (err)
            {
                console.error('Error with table query', err);
            }
            else
            {
                  var hrEmail = hrMailList.rows['0'].comm_code_desc;

                  tempList = hrEmail + ',' + employee_email;
                  console.log('tempList',tempList);
            }


            pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[approver_id], function(err, managerMail) {
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

            var smtpTransport = nodemailer.createTransport('SMTP',{
            service: 'gmail',
            auth:
            {
                user: 'amber@nurture.co.in',
                pass: 'nurture@123'
            }
            });

	    var session = req.body.session;
	    var sessiontime = req.body.sessiontime;

            if(session == "FD")
            {
                var session = "FULL DAY";
                var sessiontime = "Session 1 - Session 2";
            }
            else
            {
                var session = "HALF DAY";

                if(sessiontime == "S1S2")
                {
                        var sessiontime = "Session 1";
                }
                else
                {
                        var sessiontime = "Session 2";
                }
            }


                        var mailOptions = {
                                                to: managerMailId,
                                                cc: tempList,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Marked Leave Notification',
                                                html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQri5Z0Jek6mmeJGUIXq9IgTcdMWcDdcY1iJvswJx2GdSd64-lN" height="85"><br><br>' +
                                                '<h3>Marked Leave Application Details by HR<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                                '<th style="border: 10px solid black;">' + leave_type + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Employee Name </td> ' +
                                                                '<th style="border: 10px solid black;">' + emp_name + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Employee ID</th> ' +
                                                                '<th style="border: 10px solid black;">' + emp_id + '</th>' +

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

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Reason </td> ' +
                                                                '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Session Type </td> ' +
                                                                '<th style="border: 10px solid black;">' + session + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Session Time </td> ' +
                                                                '<th style="border: 10px solid black;">' + sessiontime + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br>' +
                                                'This Leave has been approved by HR , In case of clarification/concern please contact HR(Usha) for more Info.<br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
                                         };

            smtpTransport.sendMail(mailOptions, function(err) {
            });

        });

                        pdbconnect.query("select emp_id,emp_name from emp_master_tbl where emp_id in(SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)",[emp_id],function(err,emp_data){
                                if (err)
                                {
                                        console.error('Error with table query', err);
                                }
                                else
                                {
                                        emp_data_app = emp_data.rows;
                                }


                                pdbconnect.query("SELECT * from holidays where del_flg =$1",['N'],function(err,holidayList)
                                {
                                        if (err)
                                        {
                                                console.error('Error with table query', err);
                                        }
                                        else
                                        {
                                                holidayData = holidayList.rows;
                                        }
                                });
                        });

                });
          });
     });
                        req.flash('success',"Leave request submitted successfully")
                        res.redirect(req.get('referer'));
                }
                else
                {
                        req.flash('error',"Leave dates overlap please recheck")
                        res.redirect(req.get('referer'));
                }
                });
                });
                });
                });
        }


        if((leave_type != "EL")&&(leave_type != "RL"))
        {
            	var emp_id = req.body.emp_id;

                pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id = $1 and del_flg ='N'",[emp_id],function(err,result){
                if (err)
                {
                        console.error('Error with table query', err);
                }
                else
                {
                        var emp_name = result.rows[0].emp_name;
                }



            console.log("is not el and not rl");
            pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function(err, holidayList)
            {
                        if (err)
                        {
                                console.error('Error with table query', err);
                        }
                        else
                        {
                                var holiday_list = holidayList.rows;
                                var holiday_count = holidayList.rowCount;
                        }

             pdbconnect.query("SELECT * from leaves ",function(err,done){
             if (err)
             {
                console.error('Error with table query', err);
             }
             else
             {
                leave_id_value = done.rowCount;
                console.log('leave_id_value',leave_id_value);
                leave_id_value = leave_id_value +100;
                console.log('leave_id_value',leave_id_value);
                leave_id = leave_id_value+1;
                console.log('leave_id',leave_id);
             }


             var rest_leaves = parseFloat(available_leaves) - parseFloat(availed_leaves);
             console.log('rest_leaves',rest_leaves);
             var now = new Date();
             var rcretime=now;
             var year = now.getFullYear();

             pdbconnect.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year=$6",['N',emp_id,from_date,to_date,'N',year],function(err,leaveOverlapList)
             {
             if (err)
             {
                console.error('Error with table query', err);
             }
             else
             {
                leaveOverlapList_count = leaveOverlapList.rowCount;
                console.log('leaveOverlapList_count value',leaveOverlapList_count);
             }

             if(leaveOverlapList_count == 0)
             {

                        pdbconnect.query("INSERT INTO leaves(leave_type, from_date,to_date, del_flg,availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id,emp_id,app_flg,rej_flg,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)",[leave_type,from_date,to_date,'N',availed_leaves,eid,rcretime,eid,rcretime,reason,approver_id,leave_id,emp_id,'Y','N',year],function(err,done){
                        if(err) throw err;
                        });
                        pdbconnect.query("select * from leave_master where del_flg = $1 and emp_id =$2 and leave_type = $3 and year = $4 ",['N',emp_id,leave_type,year],function(err,leaveMasterList)
                        {
                        if (err)
                        {
                                console.error('Error with table query', err);
                        }
                        else
                        {
                                leaveMasterList_count = leaveMasterList.rowCount;
                                if(leaveMasterList_count!=0)
                                {
                                        availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
                                }
                                else
                                {
                                        availed_leaves_master =0;
                                }

                                console.log('leaveMasterList_count value',leaveMasterList_count);
                                console.log('availed_leaves_master value',availed_leaves_master);
                        }

              if(leaveMasterList_count == 0)
              {

                  pdbconnect.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2",[emp_id,'N'],function(err,done)
                  {
                          if (err)
                          {
                                console.error('Error with table query', err);
                          }
                          else
                          {
                                carry_forwarded =0;
                          }

                          console.log('carry_forwarded value',carry_forwarded);
                          pdbconnect.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3",['N',leave_type,year],function(err,leaveConfigList){
                          if (err)
                          {
                                console.error('Error with table query', err);
                          }
                          else
                          {
                                credited_leaves = leaveConfigList.rows[0].allocated_leaves;
                                console.log('credited_leaves value',credited_leaves);
                          }

                                  pdbconnect.query("INSERT INTO leave_master(emp_id,leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves, rcre_user_id, rcre_time,lchg_user_id,lchg_time,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",  [emp_id, leave_type,'N',availed_leaves,carry_forwarded,credited_leaves,eid,rcretime,eid,rcretime,year],function(err,done)
                                  {
                                        if(err) throw err;
                                  });
                          });

                  });
                }
                else
                {

                        console.log('please do it');
                        total_leaves = parseFloat(availed_leaves_master) + parseFloat(availed_leaves) ;
                        console.log('total_leaves value',total_leaves);

                        pdbconnect.query("update leave_master set availed_leaves = $1 , lchg_user_id = $2, lchg_time =$3 where year = $4 and emp_id = $5 and leave_type = $6 ",  [total_leaves,eid,rcretime,year,emp_id,leave_type],function(err,done)
                        {
                                if(err) throw err;
                        });
                }

            pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1",[emp_id], function(err, empResult) {
            if (err)
            {
                console.error('Error with table query', err);
            }
            else
            {
                 employee_email=empResult.rows['0'].emp_email;
                 console.log('employee_email' ,employee_email);
            }

            pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'",function(err, hrMailList) {
            if (err)
            {
                console.error('Error with table query', err);
            }
            else
            {
                  var hrEmail = hrMailList.rows['0'].comm_code_desc;

                  tempList = hrEmail + ',' + employee_email;
                  console.log('tempList',tempList);
            }


            pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ",[approver_id], function(err, managerMail) {
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

            var smtpTransport = nodemailer.createTransport('SMTP',{
            service: 'gmail',
            auth:
            {
                user: 'amber@nurture.co.in',
                pass: 'nurture@123'
            }
            });

	    var session = req.body.session;
	    var sessiontime = req.body.sessiontime;

            if(session == "FD")
            {
                var session = "FULL DAY";
                var sessiontime = "Session 1 - Session 2";
            }
            else
            {
                var session = "HALF DAY";

                if(sessiontime == "S1S2")
                {
                        var sessiontime = "Session 1";
                }
                else
                {
                        var sessiontime = "Session 2";
                }
            }


                        var mailOptions = {
                                                to: managerMailId,
                                                cc: tempList,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Marked Leave Notification',
                                                html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQri5Z0Jek6mmeJGUIXq9IgTcdMWcDdcY1iJvswJx2GdSd64-lN" height="85"><br><br>' +
                                                '<h3>Marked Leave Application Details by HR<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                                '<th style="border: 10px solid black;">' + leave_type + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Employee Name </td> ' +
                                                                '<th style="border: 10px solid black;">' + emp_name + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Employee ID</th> ' +
                                                                '<th style="border: 10px solid black;">' + emp_id + '</th>' +

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

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Reason </td> ' +
                                                                '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Session Type </td> ' +
                                                                '<th style="border: 10px solid black;">' + session + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Session Time </td> ' +
                                                                '<th style="border: 10px solid black;">' + sessiontime + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br>' +
	    					'This Leave has been approved by HR , In case of clarification/concern please contact HR(Usha) for more Info.<br><br><br>' + 
						'- Regards,<br><br>Amber</h3>'
                                         };


            smtpTransport.sendMail(mailOptions, function(err) {
            });

        });

                        pdbconnect.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)",[emp_id],function(err,emp_data){
                                if (err)
                                {
                                        console.error('Error with table query', err);
                                }
                                else
                                {
                                        emp_data_app = emp_data.rows;
                                }


                                pdbconnect.query("SELECT * from holidays where del_flg =$1",['N'],function(err,holidayList)
                                {
                                        if (err)
                                        {
                                                console.error('Error with table query', err);
                                        }
                                        else
                                        {
                                                holidayData = holidayList.rows;
                                        }
                                });
                        });

                });
          });
     });


                        req.flash('success',"Leave request submitted successfully")
                        res.redirect(req.get('referer'));
                }
                else
                {
                        req.flash('error',"Leave dates overlap please recheck")
                        res.redirect(req.get('referer'));
                }
                });
                });
                });
                });
        }

        if(leave_type == "RL")
        {
                console.log("is rl");
                var leave_type1 = req.body.leave_type1;
                console.log("leave_type1",leave_type1);

                var res_leave = req.body.res_leave;
                console.log("res_leave",res_leave);

                var apply_to1 = req.body.apply_to1;
                console.log("apply_to1",apply_to1);
                var availed_leaves1 = req.body.availed_leaves1;
                console.log("availed_leaves1",availed_leaves1);

                var desc1 = req.body.desc1;
                console.log("desc1",desc1);

                var available_leaves1 = req.body.available_leaves1;
                console.log("available_leaves1",available_leaves1);


                if(res_leave != "B")
                {
                        console.log("not birthday");
                
			var emp_id1 = req.body.emp_id1;
                        console.log("emp_id1",emp_id1);

			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id = $1 and del_flg ='N'",[emp_id1],function(err,result){
			if (err)
			{
				console.error('Error with table query', err);
			}
			else
			{
				var emp_name = result.rows[0].emp_name;
			}


			var res_leave = req.body.res_leave;
			console.log("res_leave",res_leave);
                        var res_leave = dateFormat(res_leave,"yyyy-mm-dd");
                        console.log("res_leave",res_leave);

                        // bcs restricted leave is only one day

                        var from_date = res_leave;
                        var to_date = res_leave;


                        pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function(err, holidayList)
                        {
                                if (err)
                                {
                                        console.error('Error with table query', err);
                                }
                                else
                                {
                                        var holiday_list = holidayList.rows;
                                        var holiday_count = holidayList.rowCount;
                                }

                               pdbconnect.query("SELECT * from leaves ",function(err,done){
                               if (err)
                               {
                                        console.error('Error with table query', err);
                               }
                               else
                               {
                                        leave_id_value = done.rowCount;
                                        console.log('leave_id_value',leave_id_value);
                                        leave_id_value = leave_id_value +100;
                                        console.log('leave_id_value',leave_id_value);
                                        leave_id = leave_id_value+1;
                                        console.log('leave_id',leave_id);
                               }


                     ////////////////////////////////////////


                     pdbconnect.query("select * from leaves where leave_type='RL' and emp_id =$1 and del_flg ='N' and year=$2",[emp_id1,year],function(err, result)
                     {
                        var rcount = result.rowCount;

                     if(rcount < 2)
                     {
                             var rest_leaves = parseFloat(available_leaves1) - parseFloat(availed_leaves1);
                             console.log('rest_leaves',rest_leaves);
                             var now = new Date();
                             var rcretime=now;
                             var year= now.getFullYear();

                             pdbconnect.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year=$6",['N', emp_id1,from_date,to_date,'N',year],function(err,leaveOverlapList)
                             {
                             if (err)
                             {
                                console.error('Error with table query', err);
                             }
                             else
                             {
                                leaveOverlapList_count = leaveOverlapList.rowCount;
                                console.log('leaveOverlapList_count value',leaveOverlapList_count);
                             }

                             if(leaveOverlapList_count == 0)
                             {
                                        pdbconnect.query("INSERT INTO leaves(leave_type, from_date,to_date, del_flg,availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id,emp_id,app_flg,rej_flg,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)",[leave_type1,from_date,to_date,'N',availed_leaves1,eid,rcretime,eid,rcretime,desc1,apply_to1,leave_id,emp_id1,'Y','N',year],function(err,done){
                                        if(err) throw err;
                                        });


                                        pdbconnect.query("select * from leave_master where del_flg = $1 and emp_id =$2  and leave_type = $3 and year = $4 ",['N',emp_id1,leave_type1,year],function(err,leaveMasterList)
                                        {
                                        if (err)
                                        {
                                                console.error('Error with table query', err);
                                        }
                                        else
                                        {
                                                leaveMasterList_count = leaveMasterList.rowCount;
                                                if(leaveMasterList_count!=0)
                                                {
                                                        availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
                                                }
                                                else
                                                {
                                                        availed_leaves_master =0;
                                                }

                                                console.log('leaveMasterList_count value',leaveMasterList_count);
                                                console.log('availed_leaves_master value',availed_leaves_master);
                                        }

                              if(leaveMasterList_count == 0)
                              {

                                  pdbconnect.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2",[emp_id1,'N'],function(err,done)
                                  {
                                          if (err)
                                          {
                                                console.error('Error with table query', err);
                                          }
                                          else
                                          {
                                                carry_forwarded =0;
                                          }

                                          console.log('carry_forwarded value',carry_forwarded);

                                          pdbconnect.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3",['N',leave_type1,year],function(err,leaveConfigList){
                                          if (err)
                                          {
                                                console.error('Error with table query', err);
                                          }
                                          else
                                          {
                                                credited_leaves = leaveConfigList.rows[0].allocated_leaves;
                                                console.log('credited_leaves value',credited_leaves);
                                          }

                                                  pdbconnect.query("INSERT INTO leave_master(emp_id, leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves, rcre_user_id,rcre_time,lchg_user_id, lchg_time,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",  [emp_id1, leave_type1,'N',availed_leaves1,carry_forwarded,credited_leaves,eid,rcretime,eid,rcretime,year],function(err,done)
                                                  {
                                                        if(err) throw err;
                                                  });
                                          });

                                  });
                                }
                                else
                                {

                                        console.log('please do it');
                                        total_leaves = parseFloat(availed_leaves_master) + parseFloat(availed_leaves) ;
                                        console.log('total_leaves value',total_leaves);

                                        pdbconnect.query("update leave_master set availed_leaves = $1 ,lchg_user_id = $2, lchg_time =$3 where year = $4 and emp_id = $5 and leave_type = $6 ",  [total_leaves,eid,rcretime,year,emp_id1,leave_type1],function(err,done)
                                        {
                                                if(err) throw err;
                                        });
                                }

                            pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1",[emp_id1],function(err, empResult) {
                            if (err)
                            {
                                console.error('Error with table query', err);
                            }
                            else
                            {
                                 employee_email=empResult.rows['0'].emp_email;
                                 console.log('employee_email' ,employee_email);
                            }


                            pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'",function(err, hrMailList) {
                            if (err)
                            {
                                console.error('Error with table query', err);
                            }
                            else
                            {
                                  var hrEmail = hrMailList.rows['0'].comm_code_desc;

                                  tempList = hrEmail + ',' + employee_email;
                                  console.log('tempList',tempList);
                            }


                            pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1",[apply_to1], function(err, managerMail) {
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

                            var smtpTransport = nodemailer.createTransport('SMTP',{
                            service: 'gmail',
                            auth:
                            {
                                user: 'amber@nurture.co.in',
                                pass: 'nurture@123'
                            }
                            });

                        var mailOptions = {
                                                to: managerMailId,
                                                cc: tempList,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Marked Leave Notification',
                                                html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQri5Z0Jek6mmeJGUIXq9IgTcdMWcDdcY1iJvswJx2GdSd64-lN" height="85"><br><br>' +
                                                '<h3>Marked Leave Application Details by HR<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                                '<th style="border: 10px solid black;">' + leave_type1 + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Employee Name </td> ' +
                                                                '<th style="border: 10px solid black;">' + emp_name + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Employee ID</th> ' +
                                                                '<th style="border: 10px solid black;">' + emp_id1 + '</th>' +

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
                                                                '<th style="border: 10px solid black;">' + availed_leaves1 + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Reason </td> ' +
                                                                '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br>' +
                                                'This Leave has been approved by HR , In case of clarification/concern please contact HR(Usha) for more Info.<br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
                                         };


                            smtpTransport.sendMail(mailOptions, function(err) {
                            });

                        });

                                        pdbconnect.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)",[emp_id1],function(err,emp_data){
                                                if (err)
                                                {
                                                        console.error('Error with table query', err);
                                                }
                                                else
                                                {
                                                        emp_data_app = emp_data.rows;
                                                }


                                                pdbconnect.query("SELECT * from holidays where del_flg =$1",['N'],function(err,holidayList)
                                                {
                                                        if (err)
                                                        {
                                                                console.error('Error with table query', err);
                                                        }
                                                        else
                                                        {
                                                                holidayData = holidayList.rows;
                                                        }
                                                });
                                        });
                                });
                          });
                     });

					req.flash('success',"Leave request submitted successfully")
					res.redirect(req.get('referer'));
                                }
                                else
                                {
                                        req.flash('error',"Leave dates overlap please recheck")
					res.redirect(req.get('referer'));
                                }
                                });
                        }
                        else
                        {
                                        req.flash('error',"Restricted Leave Type already utilised for 2 days")
					res.redirect(req.get('referer'));
                        }
                        });
                        });
                        });
                        });
                }
                else
                {
                        console.log("Birthday");
                        var leave_type1 = req.body.leave_type1;
                        console.log("leave_type1",leave_type1);

                        var res_leave = req.body.res_leave;
                        console.log("res_leave",res_leave);

                        var apply_to1 = req.body.apply_to1;
                        console.log("apply_to1",apply_to1);

                        var availed_leaves1 = req.body.availed_leaves1;
                        console.log("availed_leaves1",availed_leaves1);

                        var desc1 = req.body.desc1;
                        console.log("desc1",desc1);

                        var available_leaves1 = req.body.available_leaves1;
                        console.log("available_leaves1",available_leaves1);
                        
			var emp_id1 = req.body.emp_id1;
                        console.log("emp_id1",emp_id1);


			pdbconnect.query("SELECT emp_name from emp_master_tbl where emp_id = $1 and del_flg ='N'",[emp_id1],function(err,result){
			if (err)
			{
				console.error('Error with table query', err);
			}
			else
			{
				var emp_name = result.rows[0].emp_name;
			}


                        pdbconnect.query("SELECT * from emp_info_tbl where emp_id = $1",[emp_id1],function(err,result)
                        {
                                var mcount = result.rowCount;

                                if(mcount == "0")
                                {
                                        req.flash('error',"Birthday data not available or Verification pending by the Admin")
                                        res.redirect(req.get('referer'));
                                }
                                else
                                {
                                     console.log("Success Birthday");
                                     pdbconnect.query("SELECT dob, emp_name, cast(dob + ((extract(year from age(dob)) + 1) * interval '1' year) as date) as next_birthday from emp_info_tbl where emp_id = $1 and del_flg = 'N'",[emp_id1],function(err,result)
                                     {

                                        var res_leave = result.rows['0'].next_birthday;
                                        var res_leave = dateFormat(res_leave,"yyyy-mm-dd");
                                        console.log("res_leave",res_leave);

                                        // bcs restricted leave is only one day
                                        var from_date = res_leave;
                                        var to_date = res_leave;


                                        pdbconnect.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function(err, holidayList)
                                        {
                                                if (err)
                                                {
                                                        console.error('Error with table query', err);
                                                }
                                                else
                                                {
                                                        var holiday_list = holidayList.rows;
                                                        var holiday_count = holidayList.rowCount;
                                                }

                                               pdbconnect.query("SELECT * from leaves ",function(err,done){
                                               if (err)
                                               {
                                                        console.error('Error with table query', err);
                                               }
                                               else
                                               {
                                                        leave_id_value = done.rowCount;
                                                        console.log('leave_id_value',leave_id_value);
                                                        leave_id_value = leave_id_value +100;
                                                        console.log('leave_id_value',leave_id_value);
                                                        leave_id = leave_id_value+1;
                                                        console.log('leave_id',leave_id);
                                               }


                                     ////////////////////////////////////////


                                     pdbconnect.query("select * from leaves where leave_type='RL' and del_flg ='N' and emp_id =$1 and year =$2",[emp_id1,year], function(err, result)
                                     {
                                        var rcount = result.rowCount;
                                        if(rcount < 2)
                                        {
                                             var rest_leaves = parseFloat(available_leaves1) - parseFloat(availed_leaves1);
                                             console.log('rest_leaves',rest_leaves);
                                             var now = new Date();
                                             var rcretime=now;
                                             var year= now.getFullYear();

                                             pdbconnect.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year = $6",['N',emp_id1,from_date,to_date,'N',year],function(err,leaveOverlapList)
                                             {
                                             if (err)
                                             {
                                                console.error('Error with table query', err);
                                             }
                                             else
                                             {
                                                leaveOverlapList_count = leaveOverlapList.rowCount;
                                                console.log('leaveOverlapList_count value',leaveOverlapList_count);
                                             }

                                             if(leaveOverlapList_count == 0)
                                             {

                                                        pdbconnect.query("INSERT INTO leaves(leave_type, from_date,to_date, del_flg,availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id,emp_id,app_flg,rej_flg,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)",[leave_type1,from_date,to_date,'N',availed_leaves1,eid,rcretime,eid,rcretime,desc1,apply_to1,leave_id,emp_id1,'Y','N',year],function(err,done){
                                                        if(err) throw err;
                                                        });


                                                        pdbconnect.query("select * from leave_master where del_flg = $1 and emp_id =$2  and leave_type = $3 and year = $4 ",['N',emp_id1,leave_type1,year],function(err,leaveMasterList)
                                                        {
                                                        if (err)
                                                        {
                                                                console.error('Error with table query', err);
                                                        }
                                                        else
                                                        {
                                                                leaveMasterList_count = leaveMasterList.rowCount;
                                                                if(leaveMasterList_count!=0)
                                                                {
                                                                        availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
                                                                }
                                                                else
                                                                {
                                                                        availed_leaves_master =0;
                                                                }

                                                                console.log('leaveMasterList_count value',leaveMasterList_count);
                                                                console.log('availed_leaves_master value',availed_leaves_master);
                                                        }

                                              if(leaveMasterList_count == 0)
                                              {

                                                  pdbconnect.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2",[emp_id1,'N'],function(err,done)
                                                  {
                                                          if (err)
                                                          {
                                                                console.error('Error with table query', err);
                                                          }
                                                          else
                                                          {
                                                                carry_forwarded =0;
                                                          }

                                                          console.log('carry_forwarded value',carry_forwarded);

                                                          pdbconnect.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3",['N',leave_type1,year],function(err,leaveConfigList){
                                                          if (err)
                                                          {
                                                                console.error('Error with table query', err);
                                                          }
                                                          else
                                                          {
                                                                credited_leaves = leaveConfigList.rows[0].allocated_leaves;
                                                                console.log('credited_leaves value',credited_leaves);
                                                          }

                                                                  pdbconnect.query("INSERT INTO leave_master(emp_id, leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves,rcre_user_id,rcre_time,lchg_user_id,lchg_time,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",  [emp_id1,leave_type1,'N',availed_leaves1,carry_forwarded,credited_leaves,eid,rcretime,eid,rcretime,year],function(err,done)
                                                                  {
                                                                        if(err) throw err;
                                                                  });
                                                          });
                                                  });
                                                }
                                                else
                                                {

                                                        console.log('please do it');
                                                        total_leaves = parseFloat(availed_leaves_master) + parseFloat(availed_leaves) ;
                                                        console.log('total_leaves value',total_leaves);

                                                        pdbconnect.query("update  leave_master set availed_leaves = $1 , lchg_user_id = $2, lchg_time =$3 where year = $4 and emp_id = $5 and leave_type = $6 ",  [total_leaves,eid,rcretime,year,emp_id1,leave_type1],function(err,done)
                                                        {
                                                                if(err) throw err;
                                                        });
                                                }

                                            pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1",[emp_id1], function(err, empResult) {
                                            if (err)
                                            {
                                                console.error('Error with table query', err);
                                            }
                                            else
                                            {
                                                 employee_email=empResult.rows['0'].emp_email;
                                                 console.log('employee_email' ,employee_email);
                                            }

                                            pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'",function(err, hrMailList) {
                                            if (err)
                                            {
                                                console.error('Error with table query', err);
                                            }
                                            else
                                            {
                                                  var hrEmail = hrMailList.rows['0'].comm_code_desc;

                                                  tempList = hrEmail + ',' + employee_email;
                                                  console.log('tempList',tempList);
                                            }
                                            pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1",[apply_to1], function(err, managerMail) {
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

                                            var smtpTransport = nodemailer.createTransport('SMTP',{
                                            service: 'gmail',
                                            auth:
                                            {
                                                user: 'amber@nurture.co.in',
                                                pass: 'nurture@123'
                                            }
                                            });
                                            

                        var mailOptions = {
                                                to: managerMailId,
                                                cc: tempList,
                                                from: 'amber@nurture.co.in',
                                                subject: 'Marked Leave Notification',
                                                html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQri5Z0Jek6mmeJGUIXq9IgTcdMWcDdcY1iJvswJx2GdSd64-lN" height="85"><br><br>' +
                                                '<h3>Marked Leave Application Details by HR<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                                '<th style="border: 10px solid black;">' + leave_type1 + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Employee Name </td> ' +
                                                                '<th style="border: 10px solid black;">' + emp_name + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Employee ID</th> ' +
                                                                '<th style="border: 10px solid black;">' + emp_id1 + '</th>' +

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
                                                                '<th style="border: 10px solid black;">' + availed_leaves1 + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Reason </td> ' +
                                                                '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                        '</tr>' +
                                                '</table> ' +
                                                '<br><br>' +
                                                'URL: http://amber.nurture.co.in <br><br>' +
                                                'This Leave has been approved by HR , In case of clarification/concern please contact HR(Usha) for more Info.<br><br><br>' +
						'- Regards,<br><br>Amber</h3>'
                                         };

                                            smtpTransport.sendMail(mailOptions, function(err) {
                                            });

                                        });
                                                        pdbconnect.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)",[emp_id1],function(err,emp_data){
                                                                if (err)
                                                                {
                                                                        console.error('Error with table query', err);
                                                                }
                                                                else
                                                                {
                                                                        emp_data_app = emp_data.rows;
                                                                }


                                                                pdbconnect.query("SELECT * from holidays where del_flg =$1",['N'],function(err,holidayList)
                                                                {
                                                                        if (err)
                                                                        {
                                                                                console.error('Error with table query', err);
                                                                        }
                                                                        else
                                                                        {
                                                                                holidayData = holidayList.rows;
                                                                        }
                                                                });
                                                        });
                                                });
                                          });
                                     });

                                                        req.flash('success',"Leave request submitted successfully")
                        				res.redirect(req.get('referer'));
                                                }
                                                else
                                                {
                                                        req.flash('error',"Leave dates overlap please recheck")
                        				res.redirect(req.get('referer'));
                                                }
                                                });
                                        }
                                        else
                                        {
                                                req.flash('error',"Restricted Leave Type already utilised for 2 days")
                        			res.redirect(req.get('referer'));
                                        }
                                        });
                                        });
                                        });
                                        });
                                }

                        });
                        });
                }
        }
};


function markLeavesGet(req,res)
{
	    console.log("markLeavesGet");
	    var eid = req.user.rows[0].user_id;
	    var emp_access =req.user.rows[0].user_type;
	    var ename =req.user.rows[0].user_name;
            var noOfLeaves = 0;
            var temp = 0;
	    var leave_id = req.query.leave_id;
	    console.log("leave_id",leave_id);
	    var emp_id = req.query.emp_id;
	    console.log("emp_id",emp_id);
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


             pdbconnect.query("SELECT * from emp_master_tbl where emp_id = $1 and entity_cre_flg = 'Y' and del_flg = 'N'",[emp_id],function(err,result)
             {
                        if (err)
                        {
                                console.error('Error with table query', err);
                        }
                        else
                        {
                                var rpt_mgr = result.rows[0].reporting_mgr;
                                console.log("rpt_man",rpt_mgr);
                        }


                        leavesCount = parseFloat(leavesCountValue) +  parseFloat(leaveDataCarry) -  parseFloat(leaveDataAvailed);
                        console.log("availleaves",leavesCount);
                        res.json({key:leavesCount,key1:rpt_mgr});

             });
             });
             });
}

function unmarkLeave(req,res)
{
            var eid =req.user.rows[0].user_id;
            var emp_access =req.user.rows[0].user_type;
            var ename =req.user.rows[0].user_name;

            pdbconnect.query("SELECT comm_code_desc cocd ,emp_name emp,* from leaves l, emp_master_tbl emp, common_code_tbl cocd  where l.del_flg= 'N' and l.app_flg != '' and l.emp_id = emp.emp_id and rej_flg = 'N' and cocd.del_flg ='N' and emp.del_flg ='N' and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP'",function(err,leavesList)
            {
                if (err)
                {
                        console.error('Error with table query', err);
                }
                else
                {
                        var leaveData = leavesList.rows;
                }

                        res.render('requestModule/unmarkLeave',{
                        eid:eid,
                        ename:ename,
                        emp_access:emp_access,
                        leaveData:leaveData
                });
           });
}


function unmarkLeavePage(req,res)
{
	    var eid =req.user.rows[0].user_id;
	    var emp_access =req.user.rows[0].user_type;
	    var ename =req.user.rows[0].user_name;
	    var leave_id = req.query.id;
	    var leaves = req.query.leaves;
	    var employee_id = req.query.employee_id;
	    var employee_name = req.query.employee_name;

            pdbconnect.query("SELECT comm_code_desc cocd, * from leaves l ,common_code_tbl cocd  where l.del_flg= 'N' and l.leave_id = $1 and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP' and  cocd.del_flg= 'N'",[leave_id],function(err,leavesList)
	    {
			if (err) 
			{
				console.error('Error with table query', err);
			} 
			else 
			{
				leaveData = leavesList.rows;
			}

			res.render('requestModule/unmarkLeavePage',{
			eid:eid,
			ename:ename,
			emp_access:emp_access,
			leave_id:leave_id,
			leaves:leaves,
			leaveData:leaveData,
			employee_id:employee_id,
			employee_name:employee_name
								   });
  	   });
}


function unmarkLeavePost(req,res)
{
	    var eid = req.user.rows[0].user_id;
	    var emp_access =req.user.rows[0].user_type;
	    var ename =req.user.rows[0].user_name;
	    var emp_id = req.body.employee_id;
	    var emp_name = req.body.empName;
	    var leave_id = req.body.leave_id;
	    var leaves = req.body.leaves;
	    var reason = req.body.desc;
	    var leave_type = req.body.leave_type;
	    var tempList = '';
	    var now = new Date();
	    var year = now.getFullYear();
	    var lchgtime=now;

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
                                managerID = leaveDataID.rows[0].approver_id;
                                from_date = leaveDataID.rows[0].from_date;
				var from_date = dateFormat(from_date,"yyyy-mm-dd");
                                to_date = leaveDataID.rows[0].to_date;
				var to_date = dateFormat(to_date,"yyyy-mm-dd");
                                availed_leaves = leaveDataID.rows[0].availed_leaves;
                                accepted_flg = leaveDataID.rows[0].app_flg;
                                console.log('managerID',managerID);
                                console.log('accepted_flg',accepted_flg);

                          if(accepted_flg == 'Y')
                          {
                                pdbconnect.query("SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1",[emp_id], function(err, repMgr)
                                {
                                        if (err)
                                        {
                                                console.error('Error with table query', err);
                                        }
                                        else
                                        {
                                                var repMgr_id=repMgr.rows['0'].reporting_mgr;
                                                console.log('repMgr_id' ,repMgr_id);
                                        }

                                        pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1",[repMgr_id], function(err, repMgrEmail)
                                        {
                                                if (err)
                                                {
                                                        console.error('Error with table query', err);
                                                }
                                                else
                                                {
                                                        var repMgrEmail_id=repMgrEmail.rows['0'].emp_email;
                                                        console.log('repMgrEmail_id' ,repMgrEmail_id);
                                                }
                                        });
                                });
                          }
                    }

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


                    pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'",function(err, hrMailList)
                    {
                        if (err)
                        {
                                console.error('Error with table query', err);
                        }
                        else
                        {
                                var hrMailList = hrMailList.rows[0].comm_code_desc;
                        }

                        tempList1 = employee_email;
                        tempList2 = hrMailList + ',' + managerMailId;
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
						cc: tempList2,
                                                from: 'amber@nurture.co.in',
                        			subject: 'Leave cancel notification',
                                                html: '<img src="http://econitynepal.com/wp-content/uploads/2016/04/cancellation-of-registration.jpg" height="85"><br><br>' +
                                                '<h3>HR has cancelled the Leave for following<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                                '<th style="border: 10px solid black;">' + leave_type + '</th>' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Employee Name </td> ' +
                                                                '<th style="border: 10px solid black;">' + emp_name + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Employee ID</th> ' +
                                                                '<th style="border: 10px solid black;">' + emp_id + '</th>' +

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
                                                'URL: http://amber.nurture.co.in <br><br>' +
						'You are marked in CC because you are the Reporting Manager for the Employee <br><br><br>' + 
						'- Regards,<br><br>Amber</h3>'
                                         };


                       smtpTransport.sendMail(mailOptions, function(err) {
                       });
                });
				req.flash('success',"Leave cancelled for the Employee Id :" + emp_id + " with Employee Name :" + emp_name + ".")
				res.redirect('/requestModule/applyLeave/unmarkLeave');

                                                                });
                                                        });
                                                });
                                        });
                                });
                        });
                });
}

function adminmark(req,res)
{
    var eid =req.user.rows[0].user_id;
    var emp_access =req.user.rows[0].user_type;
    var ename =req.user.rows[0].user_name;
    var noOfLeaves = 0;
    var temp = 0;
    var leave_id = req.query.leave_id;
    var emp_id = req.query.emp_id;
    var now = new Date();
    var year= now.getFullYear();

    console.log('leave_id value',leave_id);

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

                leavesCount = parseFloat(leavesCountValue) +  parseFloat(leaveDataCarry) -  parseFloat(leaveDataAvailed);
                res.json({key:leavesCount,key1:quarter,key2:leavesCountValue});
           });
           });
}



function viewEmpLeave(req,res)
{

            var eid =req.user.rows[0].user_id;
            var emp_access =req.user.rows[0].user_type;
            var ename =req.user.rows[0].user_name;

            pdbconnect.query("SELECT comm_code_desc cocd ,emp_name emp,* from leaves l, emp_master_tbl emp, common_code_tbl cocd  where l.del_flg= 'N' and l.emp_id = emp.emp_id and cocd.del_flg ='N' and emp.del_flg ='N' and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP'",function(err,leavesList)
            {
                if (err)
                {
                        console.error('Error with table query', err);
                }
                else
                {
                        var leaveData = leavesList.rows;
                }

                        res.render('requestModule/viewEmpLeave',{
                        eid:eid,
                        ename:ename,
                        emp_access:emp_access,
                        leaveData:leaveData
                });
           });


}

router.get('/reportingListBalance',reportingListBalance);
function reportingListBalance(req,res)
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

        pdbconnect.query("SELECT * from emp_master_tbl where reporting_mgr=$1 and del_flg = $2 order by emp_id asc",[eid,'N'],function(err,resultset)
        {
                    if (err)
                    {
                                console.error('Error with table query', err);
                    }
                    else
                    {
                                var emp_data = resultset.rows;
                                var emp_data_count = resultset.rowCount;
                    }


                res.render('requestModule/reportingListBalance',{
                eid:eid,
                emp_access:emp_access,
                ename:ename,
                current_date:current_date,
                emp_data:emp_data,
                emp_data_count:emp_data_count,
                leaveConfigData:leaveConfigData
                                                        });

        });
        });
}


///////////////////////////////////////////////////////////////////////////////
module.exports = router;
