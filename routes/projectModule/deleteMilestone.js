var express = require('express');
var router = express.Router();
var pdbconnect=require('../../routes/database/psqldbconnect');
var app = express();

router.get('/milestoneDelete',milestoneDelete);


function milestoneDelete(req,res)
{
var array = req.query.id;

pdbconnect.query("SELECT project_id,milestone_name,serial_number from milestone_proj_tbl  where confirm_flg='Y'",function(err,result){ 

	var pid=result.rows[array].project_id;
	var milestoneName=result.rows[array].milestone_name;
	var slno = result.rows[array].serial_number;


         pdbconnect.query("UPDATE milestone_proj_tbl set confirm_flg ='N' where project_id=$1 and serial_number=$2 and milestone_name=$3",[pid,slno,milestoneName],function(err,result)
	{
		if(err)
		{
			console.error('Error with table query update', err);
		}
		else
		{
			 pdbconnect.query("insert into  milestone_proj_tbl_hist select * from milestone_proj_tbl where project_id=$1 and serial_number=$2 and milestone_name=$3",[pid,slno,milestoneName],function(err,result)
			{
				if(err)
				{
					console.error('Error with table query insert', err);
				}
				else
				{
					 pdbconnect.query("delete from milestone_proj_tbl where project_id=$1 and serial_number=$2 and milestone_name=$3",[pid,slno,milestoneName],function(err,result)
					{
						if(err)
						{
							console.error('Error with table query delete', err);
						}
					}); 
				}
			});

		}	
		        req.flash('success',"Project Id: " + pid + " with Milestone Name: " + milestoneName + " has been successfully Deleted.")
                        res.redirect('/projectModule/projectDetails/projectModification');



	});
    
	});
}



module.exports = router;
