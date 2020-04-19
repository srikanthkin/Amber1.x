
function invalidFunc(req, res) 
{
	var eid = req.user.rows[0].user_id;
        var ename = req.user.rows[0].user_name;
        var emp_access = req.user.rows[0].user_type;
	res.render('common/invalidAccess',{ename:ename,eid:eid,emp_access:emp_access});
}

module.exports = invalidFunc;
