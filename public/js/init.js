(function($){
  $(function(){

    $('.button-collapse').sideNav();

  }); // end of document ready
})(jQuery); // end of jQuery name space


$(document).ready(function() {
    $('select').material_select();
  });
   
   $(document).ready(function() {  
     jQuery('.collapsible-header').click(function(){
jQuery('html,body').animate({ scrollTop: 9999 }, 'fast');
});
	 });
	 $('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 15, // Creates a dropdown of 15 years to control year
	 format: 'dd-mm-yyyy' 
  });
  
   $(document).ready(function() {
 $('#ImageModal').modal();
 
   });
  
   $(document).ready(function() {
 $('#chart').modal();
 
   });
   

  function paramedit(){

var parid=$("input[name='paramid']:checked").val();
//window.alert(parid);
var parname=document.getElementById('paramname'+parid).value;
var pardesc=document.getElementById('paramdesc'+parid).value;
var parvalue=document.getElementById('paramvalue'+parid).value;

/*window.alert(parname)
window.alert(pardesc)
window.alert(parvalue);
*/ document.getElementById("newparamid").value = parid;
   document.getElementById("newparamname1").value = parname;
   document.getElementById("newparamdesc1").value = pardesc;
   document.getElementById("newparamvalue1").value = parvalue;
  

  }

  function paramreportedit(){

var parid=$("input[name='paramid1']:checked").val();
var parname=document.getElementById('paramname1'+parid).value;
var pardesc=document.getElementById('paramdesc1'+parid).value;
var parvalue=document.getElementById('paramvalue1'+parid).value;


 document.getElementById("newparamid1").value = parid;
   document.getElementById("newparamname11").value = parname;
   document.getElementById("newparamdesc11").value = pardesc;
   document.getElementById("newparamvalue11").value = parvalue;
  

  }
  
function myFunction() {
   
 var userid = $("input[name='userid']:checked").val();
    
    var username = document.getElementById('username'+userid).value;
    var usertype = document.getElementById('type'+userid).value;
    var expiry = document.getElementById('expiry'+userid).value;
    var role = document.getElementById('role'+userid).value;
    var branch = document.getElementById('branch'+userid).value;
    var emailid = document.getElementById('emailid'+userid).value;
    var branchreport = document.getElementById('otherbranchreports'+userid).value;
    var grouprep = document.getElementById('grouprep'+userid).value;
    var banklevel = document.getElementById('banklevel'+userid).value;
    var repviaemail = document.getElementById('emailcheck'+userid).value;

//window.alert(branchreport)
if(usertype=="AU"){
  usertype='Admin User';
}
if(usertype=="HU"){
  usertype='Hybrid User';
}
if(usertype=="RU"){
  usertype='Report User';
}
if(branchreport=="unchecked"){
branchreport='Disabled';
}

if(branchreport=="checked"){  
branchreport='Enabled';
}

if(grouprep=='checked') {

    grouprep='Enabled';
}
if(grouprep=='unchecked') {
    grouprep='Disabled';
}

if(banklevel=='checked') {
    banklevel='Enabled';
}
if(banklevel=='unchecked') {
    banklevel='Disabled';
}

if(repviaemail=='checked') {
    repviaemail='Enabled';
}
if(repviaemail=='unchecked') {
    repviaemail='Disabled';
}

   document.getElementById("userid1").value = userid;
   document.getElementById("username1").value = username;
   document.getElementById("email1").value = emailid;
   document.getElementById("expiry1").value = expiry;
   document.getElementById("role1").value = role;
   document.getElementById("branch1").value = branch;
   document.getElementById("type1").value = usertype;
   document.getElementById("otherbranchrep").value = branchreport;
   document.getElementById("group1").value = grouprep;
   document.getElementById("bank1").value = banklevel;
   document.getElementById("repemail1").value = repviaemail;
   
}

function myFunction1() {
    

     var userid2 = $("input[name='userid']:checked").val();

    var username2 = document.getElementById('username'+userid2).value;
    var usertype2 = document.getElementById('type'+userid2).value;
    var expiry2 = document.getElementById('expiry'+userid2).value;
    var role2 = document.getElementById('role'+userid2).value;
    var branch2 = document.getElementById('branch'+userid2).value;
    var emailid2 = document.getElementById('emailid'+userid2).value;
    var branchreport2 = document.getElementById('otherbranchreports'+userid2).value;
    var grouprep2 = document.getElementById('grouprep'+userid2).value;
    var banklevel2 = document.getElementById('banklevel'+userid2).value;
    var repviaemail2 = document.getElementById('emailcheck'+userid2).value;
    var logged = document.getElementById('loginallow'+userid2).value;
    
    var loginset1 = document.getElementById('logincheck'+userid2).value;    

if(loginset1=='Y'){
  loginset1=true
}

if(loginset1=='N'){
  loginset1=false
}

if(branchreport2=='checked') {
    branchreport2=true;
}
if(branchreport2=='unchecked'){
    branchreport2=false;
}
if(grouprep2=='checked'){
    grouprep2=true
}

if(grouprep2=='unchecked'){
    grouprep2=false
}

if(banklevel2=='checked') {
    banklevel2=true;
}


if(banklevel2=='unchecked') {
    banklevel2=false;
}

if(repviaemail2=='checked'){
repviaemail2=true;
}
 

if(repviaemail2=='unchecked'){
repviaemail2=false;
}

if(logged=='checked')
 {
    logged=true;
 }
  
if(logged=='unchecked')
 {
    logged=false;
 }


  // document.getElementById("role2").value = role2;
   //document.getElementById("abc").innerHTML=role2;
   //$("#role2 option[value=Option 1]").attr("selected","selected");
   //window.alert(role2)


jQuery('#role2').val(role2);
jQuery('#role2').material_select();



jQuery('#branch2').val(branch2);
jQuery('#branch2').material_select();


jQuery('#type2').val(usertype2);
jQuery('#type2').material_select();

   document.getElementById("userid12").value=userid2;
   document.getElementById("userid2").value = userid2;
   document.getElementById("username22").value = username2;
   
   document.getElementById("email22").value = emailid2;
   document.getElementById("expiry2").value = expiry2;




   document.getElementById("type2").value = usertype2;
  document.getElementById("otherbranchrep2").checked = branchreport2;
   document.getElementById("group2").checked = grouprep2;
   document.getElementById("bank2").checked = banklevel2;
   document.getElementById("repemail2").checked = repviaemail2;
  document.getElementById('loginallowed').checked=logged;
  document.getElementById('loginset').checked=loginset1;
    

}

function myFunction2() {

    var userid3 = $("input[name='userid']:checked").val();
    var username3 = document.getElementById('username'+userid3).value;
    var branch3 = document.getElementById('branch'+userid3).value;

   document.getElementById("userid3").value = userid3;
   /*  document.getElementById("username3").value = username3;
     document.getElementById("branch3").value = branch3;
  */

var content="<br>A User with User Id <b>'"+userid3+"'</b> named <b>'"+username3 +"'</b> under branch <b>'"+branch3+"'</b> is about to be removed from Mis Magic."
document.getElementById('content').innerHTML=content;
//window.alert(content)

   }


function myFunction3() {

var smtp = document.getElementById('smtp').value;
     var userid4 = $("input[name='userid']:checked").val();
    var emailid4 = document.getElementById('emailid'+userid4).value;
//window.alert(userid4)
console.log("smtp",smtp);
var setcontent
if(smtp=='N') {
setcontent = 'Enter Passcode* <input type="password" name="setnewpassword" id="setnewpassword" value="" required style="width:90% !important;"> ';
}
else  {
 setcontent="<br>Passcode is being reset for the user'<b>"+userid4+"'</b>.<br><br>MiS Magic will send a system generated passcode to user's email- '<b>" +emailid4+ "</b>'.<br><br> <b>'"+userid4+"</b>' will be forced to change the passcode during first login.<br><br><br>"

}
      document.getElementById("userid4").value = userid4;
      document.getElementById("email4").value = emailid4;

document.getElementById('setcontent').innerHTML=setcontent;


}



function myFunction5() {

    var paramid = $("input[name='paramid']:checked").val();
    var paramname = document.getElementById('paramname'+paramid).value;
    var paramdesc = document.getElementById('paramdesc'+paramid).value;
    var paramvalue = document.getElementById('paramvalue'+paramid).value;
    
   document.getElementById('par').value=paramid;
    document.getElementById("paramname1").value = paramname;
    document.getElementById("paramdesc1").value = paramdesc;
    document.getElementById("paramvalue1").value = paramvalue;

}



$(document).ready(function(){
    $("a").click(function(){
        $("myDIV").toggle();
    });
});


function refresh(){
  location.reload();
}

function regen1(){

var genid=$("input[name='rbutton']:checked").val();
var repname=document.getElementById("repname").value;
var repfmt=document.getElementById("repformat").value;
$('#regen_id').val(genid);
$('#repname1').val(repname);
$('#repformat1').val(repfmt);

//window.alert(ids)
console.log("mod",genid);
document.getElementById("regen").submit();
}


function delgen1(){

var genid=$("input[name='rbutton']:checked").val();
//window.alert(genid);
$('#regen_id1').val(genid);
console.log("mod",genid);
document.getElementById("delgen").submit();

}

function viewPdf(id) { 

var genid=$("input[name='rbutton']:checked").val();
console.log(genid);
$('#gen_id').val(genid);
document.getElementById("view_pdf").submit();
}

//edit role drag and drop

 function allowDrop(ev) {
    ev.preventDefault();


  }

  function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
  }

  function drop(ev) {
    //window.alert(ev);
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
    var a = "reports"+data;

  var check = document.getElementById(a);
  //window.alert(check.checked);
    if(check.checked==true){
      document.getElementById(a).checked = false;
    }
    else{ 
      document.getElementById(a).checked = true;
     }

    
}

//Distribute groups
 function view_distgroup_submit()
  {
      var group_id=document.querySelector('input[name=groupid]:checked').value;
      var group_desc=document.getElementById('groupdesc'+group_id).value;
	  //window.alert(group_id);
	  //window.alert(group_desc);
      $('#d_group_idv').val(group_id);
      $('#d_group_descv').val(group_desc);
      document.getElementById("view_distgroupform_submit").submit();
  }
  
  function remove_distgroup()
  {
      var group_id=document.querySelector('input[name=groupid]:checked').value;
      var group_desc=document.getElementById('groupdesc'+group_id).value;
	 // window.alert(group_id);
	 // window.alert(group_desc);
      $('#d_group_idr').val(group_id);
      $('#d_group_descr').val(group_desc);
      document.getElementById("remove_distgroupform_submit").submit();
  }

   function edit_distgroup_submit(event)
  {
    //window.alert('entered');
      var group_id=document.querySelector('input[name=groupid]:checked').value;
      var group_desc=document.getElementById('groupdesc'+group_id).value;
     
      $('#d_group_ide').val(group_id);
      $('#d_group_desce').val(group_desc);
      document.getElementById("edit_distgroupform_submit").submit();

  }

//Maintain Roles

//view linkage form submit
   function view_linkage_submit()
  {
      var role_id_table=document.querySelector('input[name=roleid]:checked').value;
      var role_desc_table=document.getElementById('roledesc'+role_id_table).value;
      $('#h_role_idv').val(role_id_table);
      $('#h_role_descv').val(role_desc_table);
      document.getElementById("view_form_submit").submit();
  }

//edit linkage form submit
   function edit_linkage_submit(event)
  {
    //window.alert('entered');
      var role_id_table=document.querySelector('input[name=roleid]:checked').value;
      var role_desc_table=document.getElementById('roledesc'+role_id_table).value;
     
      $('#h_role_ide').val(role_id_table);
      $('#h_role_desce').val(role_desc_table);
      document.getElementById("edit_form_submit").submit();

  }
//view linked reports-parameter match
  function parameter_linkedreports(event)
  {
      var param_id=document.querySelector('input[name=paramid1]:checked').value;

      var param_name=document.getElementById('paramname1'+param_id).value;

      $('#paraid').val(param_id);
      $('#paraname').val(param_name);
      document.getElementById("view_linked_rep").submit();

  }



//remove role form submit
   function remove_role_submit()
  {
      var role_id_table=document.querySelector('input[name=roleid]:checked').value;
      var role_desc_table=document.getElementById('roledesc'+role_id_table).value;
      $('#h_role_idr').val(role_id_table);
      $('#h_role_descr').val(role_desc_table);
      document.getElementById("remove_role_submit").submit();
  }



function myFun(id) { 

var a="id"+id;
var ids = document.getElementById(a).value;
$('#module_identifier').val(ids);
//window.alert(ids)
console.log("mod",ids);
document.getElementById("module_level").submit();
}


function pick(name){
console.log("picked: ",name);
$('#report_identifier').val(name);
document.getElementById("pick_report").submit();
}



      function valid()
    {
  
    var x=document.getElementById('From Date').value;
    var y=document.getElementById('To Date').value;

    if(y<x)
    {
    document.getElementById("demo").innerHTML="To Date must be greater than From Date";
  
     document.getElementById("btn").disabled = true;
    }
    else
    {
     document.getElementById("btn").disabled = false;
    }
    
}


function schedulerDateValidation()
    {
  
    var startDate=document.getElementById('start_date').value;
    var endDate=document.getElementById('end_date').value;

    if(endDate<startDate)
    {
    document.getElementById("scheduler_demo").innerHTML="End Date must be greater than Start Date";
  
     document.getElementById("scheduler_submit").disabled = true;
    }
    else
    {
     document.getElementById("scheduler_submit").disabled = false;
    }
    
}

  $(document).ready(function() {

           $("#toggle").click(function(){
              $(".target").toggle( 'slow', function(){
              });
           });
        });

  /*$(document).ready(function() {

           $("#toggle1").click(function(){
              $(".target").toggle( 'slow', function(){
              });
           });
        });*/
 $(document).ready(function() {

          $("#toggle3").click(function(){
             $(".target1").toggle( 'slow', function(){
             });
          });
       });


    $(document).ready(function() {
      $('#modal1').modal();
    });

 $(document).ready(function() {
  $('#modal3').modal();
  
    });
  $(document).ready(function() {
  $('#modal4').modal();
  
    });
  $(document).ready(function() {
  $('#modal5').modal();
  
    });
  $(document).ready(function() {
  $('#modal6').modal();
  
    });
 $(document).ready(function() {
  $('#modal7').modal();
  
    });
 $(document).ready(function() {
  $('#dist').modal();
  
    });

  $(document).ready(function() {
  $('#modal12').modal();
  
    });
  $(document).ready(function() {
  $('#modal13').modal();
  
    });

  $(document).ready(function() {
  $('#modal19').modal();
  
    });
  
    $(document).ready(function() {
  $('#modal21').modal();
  
    });
      $(document).ready(function() {
  $('#modal22').modal();
  
    });
     $(document).ready(function() {
  $('#modal23').modal();
  
    });
  
  
  
      $(document).ready(function() {
    $('select').material_select();
  });



//Distributed

function distdelgen()
{
var distgenid=$("input[name='rbutton1']:checked").val();
var deltouse=document.getElementById('tou').value;
$('#delgen_id').val(distgenid);
$('#distdeluser_id').val(deltouse);
document.getElementById("distdelgenid").submit();
}

function distviewPdf() { 
var distgenid=$("input[name='rbutton1']:checked").val();
var touse=document.getElementById('tou').value;
$('#distgen_id').val(distgenid);
$('#distuser_id').val(touse);
document.getElementById("distview_pdf").submit();
}

function dis()
{
var order = "";
var emailuser="";
  if (document.getElementById('user1').checked == true && document.getElementById('email').checked == true) {
	 // window.alert('both entered');
    order = document.getElementById('test').value;
	emailuser=document.getElementById('test').value;
	var gennnid=$("input[name='rbutton']:checked").val();
	$('#id').val(order);
	$('#dgen_id').val(gennnid);
	$('#emailuserid').val(emailuser);
	document.getElementById("d").submit();
  }
 else if(document.getElementById('role1').checked == true) { 
    order = document.getElementById('test').value;
	var groupgennnid=$("input[name='rbutton']:checked").val();
	$('#grouporder').val(order);
	$('#groupgen_id').val(groupgennnid);
	document.getElementById("gd").submit();
  }
  else if(document.getElementById('user1').checked == true) {
	 // window.alert('user entered');
    order = document.getElementById('test').value;
	var gennnid=$("input[name='rbutton']:checked").val();
	$('#id').val(order);
	$('#dgen_id').val(gennnid);
	document.getElementById("d").submit();
  }
  else if(document.getElementById('role1').checked == true && document.getElementById('email').checked == true) { 
 // window.alert('group both entered');
    order = document.getElementById('test').value;
	emailuser=document.getElementById('test').value;
	var groupgennnid=$("input[name='rbutton']:checked").val();
	$('#grouporder').val(order);
	$('#groupgen_id').val(groupgennnid);
	$('#groupemailuserid').val(emailuser);
	document.getElementById("gd").submit();
  }
  
  /*else if(document.getElementById('role1').checked == true) { 
  //window.alert('group single entered');
    order = document.getElementById('test').value;
	var groupgennnid=$("input[name='rbutton']:checked").val();
	$('#grouporder').val(order);
	$('#groupgen_id').val(groupgennnid);
	document.getElementById("gd").submit();
  }
*/

}



function distributed()
{
document.getElementById("de").submit();
}


function ModifyPlaceHolder1() {
    var input = document.getElementById("test");
    input.placeholder = "Start typing the user..";
   input.name = "user1";
   
}

function ModifyPlaceHolder2() {
    var input = document.getElementById("test");
    input.placeholder = "Start typing the List..";
  input.name = "role1";
}
 
function tabs(selectedtab) {  
  // contents
  var s_tab_content = "tab_content_" + selectedtab; 
  var contents = document.getElementsByTagName("div");
  for(var x=0; x<contents.length; x++) {
    name = contents[x].getAttribute("name");
    if (name == 'tab_content') {
      if (contents[x].id == s_tab_content) {
      contents[x].style.display = "block";            
      } else {
      contents[x].style.display = "none";
      }
    }
  } 
  // tabs
  var s_tab = "tab_" + selectedtab;   
  var tabs = document.getElementsByTagName("a");
  for(var x=0; x<tabs.length; x++) {
    name = tabs[x].getAttribute("name");
    if (name == 'tab') {
      if (tabs[x].id == s_tab) {
      tabs[x].className = "active";           
      } else {
      tabs[x].className = "";
      }
    }
  }   
}



    
    
    
    function add_row(tableRow) {

      var table = document.getElementById(tableRow);

      var rowCount = table.rows.length;
      var row = table.insertRow(rowCount);

      var colCount = table.rows[0].cells.length;

      for(var i=0; i<colCount; i++) {

        var newcell = row.insertCell(i);

        newcell.innerHTML = table.rows[1].cells[i].innerHTML;
        //alert(newcell.childNodes);
        switch(newcell.childNodes[0].type) {
          case "text":
              newcell.childNodes[0].value = "";
              break;
          case "checkbox":
              newcell.childNodes[0].checked = false;
              break;
          case "select-one":
              newcell.childNodes[0].selectedIndex = 0;
              break;
        }
      }
    }

// Groups


    function remove_group_submit()
  {
      var group_id_table=document.querySelector('input[name=groupid]:checked').value;
      var group_desc_table=document.getElementById('groupdesc'+group_id_table).value;
      $('#h_group_idr').val(group_id_table);
      $('#h_group_descr').val(group_desc_table);
      document.getElementById("remove_group_submit").submit();
  }
   function edit_linkage1_submit(event)
  {
    //window.alert('entered');
      var group_id_table=document.querySelector('input[name=groupid]:checked').value;
      var group_desc_table=document.getElementById('groupdesc'+group_id_table).value;
     
      $('#h_group_ide').val(group_id_table);
      $('#h_group_desce').val(group_desc_table);
      document.getElementById("edit_form_submit").submit();

  }

     function view_linkage1_submit()
  {
      var group_id_table=document.querySelector('input[name=groupid]:checked').value;
      var group_desc_table=document.getElementById('groupdesc'+group_id_table).value;
      $('#h_group_idv').val(group_id_table);
      $('#h_group_descv').val(group_desc_table);
      document.getElementById("view_form_submit").submit();
  }


  // Distribution remove function

function myFunction22() {

    var id = $("input[name='groupid']:checked").val();
    var a="groupid"+id;
    var grpid = document.getElementById(a).value;

var content="<br>Distribution List <b>'"+grpid+"'</b>  is about to be removed from Mis Magic."
document.getElementById('setcontent').innerHTML=content;
//window.alert(content)

   }

//role remove function
function myFunction21() {

    var id = $("input[name='roleid']:checked").val();
    var a="roleid"+id;
    var rid = document.getElementById(a).value;

var content="<br>Role <b>'"+rid+"'</b>  is about to be removed from Mis Magic."
document.getElementById('setcontentrole').innerHTML=content;
//window.alert(content)

   }
function myFunction23() {

    var id = $("input[name='groupid']:checked").val();
    var a="groupid"+id;
    var gid = document.getElementById(a).value;

var content="<br>Group  <b>'"+gid+"'</b>  is about to be removed from Mis Magic."
document.getElementById('setcontentgroup').innerHTML=content;
//window.alert(content)

   }

   // Buttons disable in Generation Queue

   function reportstatus(){

var statusgenid=$("input[name='rbutton']:checked").val();
var status_of_report =document.getElementById("repstatus"+statusgenid).value ;
//window.alert(status_of_report)
//window.alert(status_of_report.length)
//window.alert(status_of_report=="Report Generated Sucessfully")
if(status_of_report=="Report Generated Successfully"){
 $('#reportview').attr('disabled',false)
 $('#reportprint').attr("disabled",false);
$('#downloadreport').attr("disabled",false);
$('#distributereport').attr("disabled",false);


}

else {
$('#reportview').attr("disabled","disabled");
$('#reportprint').attr("disabled","disabled");
$('#downloadreport').attr("disabled","disabled");
$('#distributereport').attr("disabled","disabled");
}

}