/*function edit_row(no)
{
 document.getElementById("edit_button"+no).style.display="none";
 document.getElementById("save_button"+no).style.display="block";
  window.alert(no);
 var userid=document.getElementById("userid"+no);
 
 var username=document.getElementById("username"+no);
 var branch=document.getElementById("branch"+no);
 var role=document.getElementById("role"+no);
 var emailid=document.getElementById("emailid"+no);
 var usertype=document.getElementById("usertype"+no);
  
 var userid_data=userid.innerHTML;
 var username_data=username.innerHTML;
 var branch_data=branch.innerHTML;
 var role_data=role.innerHTML;
 var emailid_data = emailid.innerHTML;
 var usertype_data = usertype.innerHTML;

 userid.innerHTML="<input type='text' id='userid_text"+no+"' value='"+userid_data+"'>";
 username.innerHTML="<input type='text' id='username_text"+no+"' value='"+username_data+"'>";
 branch.innerHTML="<input type='text' id='branch_text"+no+"' value='"+branch_data+"'>";
 role.innerHTML="<input type='text' id='role_text"+no+"' value='"+role_data+"'>";
 emailid.innerHTML="<input type='text' id='emailid_text"+no+"' value='"+emailid_data+"'>";
 usertype.innerHTML="<input type='text' id='usertype_text"+no+"' value='"+usertype_data+"'>";
}
*/
//report user
function myFunction(id) {
  window.alert(id);

var module=$("input[name='radios']:checked").val();

  $.ajax
 ({
  type:'post',
  url:'/reportuser/module',
  data:{
   module:module,
 },
   success:function(ret) {
   document.write(ret);
  // document.location.href='/modulesdisplay/module/table'
   }
  });
} 
//end for report user
function editparam(){

  var id =document.querySelector('input[name=paramid]:checked').value
  window.alert(id);

$.ajax
 ({
  type:'post',
  url:'/users/editparam',
  data:{
   paramid:id
 },success:function(ret) {
    document.write(ret);
},
error: function(err){
        document.write(err.responseText);
    }

});
}


function setpasscode(){
  var id=document.querySelector('input[name=userid]:checked').value;
  var email=document.getElementById("emailid"+id).value;
  window.alert(email);
  $.ajax
  ({
type:'post',
url:'/users/setpasscode',
data:{
  userid:id,
  email:email
},success:function(ret){
  document.write(ret);
},error:function(err){
  document.write(err.responseText);
}
 });
}

function view() {
  var id = document.querySelector('input[name=userid]:checked').value

 $.ajax
 ({
  type:'post',
  url:'/users/viewusers',
  data:{
   userid:id
 },success:function(ret) {
    document.write(ret);
},
error: function(err){
        document.write(err.responseText);
    }

});

  
}
function remove(){

  var id = document.querySelector('input[name=userid]:checked').value
  window.alert(id);

$.ajax
 ({
  type:'post',
  url:'/users/removeusers',
  data:{
   userid:id
 },success:function(ret) {
    document.write(ret);
},
error: function(err){
        document.write(err.responseText);
    }

});
}

function confirmaddition(){

var id=document.getElementById("editid").value;
var username=document.getElementById("username").value;
var usertype=document.getElementById("usertype").value;
var expirydate=document.getElementById("date").value;
var role=document.getElementById("role").value;
var branch=document.getElementById("branch").value;
var emailid=document.getElementById("email").value;

var branch = document.querySelector('input[name="access1"]:checked').value;
var group = document.querySelector('input[name="access2"]:checked').value;
var bank = document.querySelector('input[name="access3"]:checked').value;
var email = document.querySelector('input[name="access4"]:checked').value;
var login = document.querySelector('input[name="access5"]:checked').value;

window.alert(branch);
window.alert(group);
window.alert(bank);
window.alert(email);
window.alert(login);



/*
var all_location_id = document.querySelectorAll('input[name="access"]:checked');
var aIds = [];
for(var x = 0, l = all_location_id.length; x < l;  x++)
{
    aIds.push(all_location_id[x].value);
}
var str = aIds.join(', ');
var a=JSON.stringify(aIds);*/
//window.alert(aIds);

$.ajax
 ({
  type:'post',
  url:'/users/confirmedit',
  data:{
   userid:id,
   username:username,
   usertype:usertype,
   expirydate:expirydate,
   role:role,
   branch:branch,
   emailid:emailid,
   reports:aIds,
   b:a
 },success:function(ret) {
    document.write(ret);
},
error: function(err){
        document.write(err.responseText);
    }

});


}




function edit(){

  var id =document.querySelector('input[name=userid]:checked').value
  window.alert(id);

$.ajax
 ({
  type:'post',
  url:'/users/useredit',
  data:{
   userid:id
 },success:function(ret) {
    document.write(ret);
},
error: function(err){
        document.write(err.responseText);
    }

});
}


function edit_row(no)
{
//window.alert(no);
var userid = document.querySelector('input[name=userid]:checked').value
window.alert(userid);

$.ajax
 ({
  type:'post',
  url:'/users/useredit',
  data:{
   userid:userid
  },success:function(response,data) {
    if(data=="success"){
window.alert("success");
}
}
});
}

function save_row(no)
{
 var userid_val=document.getElementById("userid_text"+no).value;
 var username_val=document.getElementById("username_text"+no).value;
 var branch_val=document.getElementById("branch_text"+no).value;
var role_val=document.getElementById("role_text"+no).value;
var emailid_val=document.getElementById("emailid_text"+no).value;
var usertype_val=document.getElementById("usertype_text"+no).value;


//window.alert(usertype_val);

$.ajax
 ({
  type:'post',
  url:'/users/update',
  data:{
   userid:userid_val,
   username:username_val,
   branch:branch_val,
   role:role_val,
   email:emailid_val,
   usertype:usertype_val
  },success:function(response,data) {
  	if(data=="success"){
  	//window.alert('success');
     document.getElementById("userid"+no).innerHTML=userid_val;
 document.getElementById("username"+no).innerHTML=username_val;
 document.getElementById("branch"+no).innerHTML=branch_val;
 document.getElementById("role"+no).innerHTML=role_val;
 document.getElementById("emailid"+no).innerHTML=emailid_val;
 document.getElementById("usertype"+no).innerHTML=usertype_val;

 document.getElementById("edit_button"+no).style.display="block";
 document.getElementById("save_button"+no).style.display="none";

}
else {
  window.alert('Enter all the required fields')
}
}
});

}

function delete_row(no)
{
  window.alert(no);
  $.ajax
 ({
  type:'post',
  url:'/users/delete',
  data:{
   userid:no,
   },
   success:function(response,data) {
   if(data=="success")
   {
    var row=document.getElementById(no);
    row.parentNode.removeChild(row);
   }
  }
});
  //location.reload();
 //document.getElementById("row"+no+"").outerHTML="";
}


function pick(){

var type=;
var branch=;


}