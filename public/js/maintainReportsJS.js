// Report Maintenance
function reportview() {
   

       var reportid112 = $("input[name='reportid']:checked").val();
       var reportname112 = document.getElementById('reportname'+reportid112).value;
       
       var modulename112 = document.getElementById('modulename'+reportid112).value;
       var reportdesc112 = document.getElementById('reportdesc'+reportid112).value;
       var jrxmlrep112 = document.getElementById('jrxmlreports'+reportid112).value;
       var parameter = document.getElementById('parameters'+reportid112).value;
        var availformats_pdf = document.getElementById('availrep_pdf'+reportid112).value;
       var availformats_xls = document.getElementById('availrep_xls'+reportid112).value;
       var availformats_doc = document.getElementById('availrep_doc'+reportid112).value;

       inputs3 = document.getElementById('inputs1'+reportid112).value;
       inputs4 = document.getElementById('inputs2'+reportid112).value;
       

       if(availformats_pdf=='Y'){
        document.getElementById('PDF').checked=true;
       }
       if(availformats_xls=='Y'){
        document.getElementById('XLS').checked=true;
       }
       if(availformats_doc=='Y'){
        document.getElementById('DOC').checked=true;
       }

       document.getElementById("rep_id1").value=reportid112;
       document.getElementById("rep_name1").value = reportname112;
       document.getElementById("rep_descd1").value = reportdesc112;
       document.getElementById("jrxml1").value = jrxmlrep112;
       document.getElementById("iparam1").value = parameter;//parameter

      
      jQuery('#moduledropdown').val(modulename112);
      jQuery('#moduledropdown').material_select();

      if(inputs3!='' || inputs4!=''){
      var inputslength=document.getElementById('inputslen'+reportid112).value;

       inputs2 = document.getElementById('inputs'+reportid112).value;
       
       //var inputs2 = document.getElementById('inputs'+reportid112).value;


    

       

//var table=document.getElementById("table2");
 //var table_len=(table.rows.length)-1;
//table.insertRow(table_len).outerHTML="<tr><th>Label</th><th>Type</th><th>Mandatory</th></tr>";
 $('#table2').find('tbody').empty(); 
for(i=0;i<inputslength;i++){
  var inputs_array = new Array();

  inputs_array= inputs4.split(",");
  inputsvalue=inputs_array[i];

  type_array= inputs3.split(",");
  typevalue=type_array[i];

  /*if(typevalue=='bdd'){
    typevalue="Branch drop down"  
  }
  if(typevalue=='date'){
    typevalue="Date Picker"  
  }
*/
  mandatory_array=inputs2.split(",");
  mandatoryvalue=mandatory_array[i];

  if(typevalue=='bdd'){
    typevalue="Branch Drop Down"  
  }
  if(typevalue=='date'){
    typevalue="Date Picker"  
  }

  if(typevalue=='ddd'){
    typevalue="Detailed Drop Down"  
  }

  


var label="label"+i;

var type="type"+i;//hidden
var type1="type1"+i;//disabled

var mandatory="mandatory"+i;
var mandatory1="mandatory1"+i;

    if(mandatoryvalue=='Y'){
      var c="checked";
     }

  if(mandatoryvalue=='N'){
      var c="unchecked";
   }

    //table.insertRow(table_len).outerHTML="<tr id='row[i]"+table_len+"'><td id='name_row"+inputsvalue+"'><input disabled required id='label' name='label' type='text' value='"+inputsvalue+"'></td><td id='name_row"+typevalue+"'><input hidden id='type' name='type' type='text' value='"+typevalue+"'><input disabled id='type1' name='type1' type='text' value='"+typevalue+"'></td><td><input type='checkbox' id='mandatory1' name='mandatory1' value='"+mandatoryvalue+"' "+c+" disabled><label for='mandatory'></label><input hidden type='checkbox' id='mandatory' name='mandatory' value='"+mandatoryvalue+"' "+c+"></td></tr>";
tr = $('<tr/>'); 
    tr.append("<td id='name_row"+inputsvalue+"'><input disabled required id='label' name='label' type='text' value='"+inputsvalue+"'></td><td id='name_row"+typevalue+"'><input hidden id='type' name='type' type='text' value='"+typevalue+"'><input disabled id='type1' name='type1' type='text' value='"+typevalue+"'></td><td><input type='checkbox' id='mandatory1' name='mandatory1' value='"+mandatoryvalue+"' "+c+" disabled><label for='mandatory'></label><input hidden type='checkbox' id='mandatory' name='mandatory' value='"+mandatoryvalue+"' "+c+"></td>");
 
   $('#table2').find('tbody').append(tr);

}
}

if(parameter=='')
{
 document.getElementById("iparam1").value = 'NA';
}
else{
 document.getElementById("iparam1").value = parameter;
}

}


var inputs2='';
var inputs3='';
var inputs4='';
var availreports112=[];

var inputs_array=[];
var type_array=[];
var mandatory_array=[];

var inputsvalue='';
var typevalue='';
var mandatoryvalue='';
var table='';
var table_len='';

//ids
var label='';
var type='';
var type1='';
var mandatory='';
var mandatory1='';

var c='';
var d='';
function reportedit1(){

       var reportid112 = $("input[name='reportid']:checked").val();
       var paramid112 = $("input[name='paramid44']:checked").val();
      

       var reportname112 = document.getElementById('reportname'+reportid112).value;
       var modulename112 = document.getElementById('modulename'+reportid112).value;
       var availformats_pdf = document.getElementById('availrep_pdf'+reportid112).value;
       var availformats_xls = document.getElementById('availrep_xls'+reportid112).value;
       var availformats_doc = document.getElementById('availrep_doc'+reportid112).value;
       

       var reportdesc112 = document.getElementById('reportdesc'+reportid112).value;
       var jrxmlrep112 = document.getElementById('jrxmlreports'+reportid112).value;
       var parameter = document.getElementById('parameters'+reportid112).value;
      
      if(availformats_pdf=='Y'){
        document.getElementById('P').checked=true;
       }
       if(availformats_xls=='Y'){
        document.getElementById('X').checked=true;
       }
       if(availformats_doc=='Y'){
        document.getElementById('D').checked=true;
       }

       inputs3 = document.getElementById('inputs1'+reportid112).value;
       inputs4 = document.getElementById('inputs2'+reportid112).value;
       
      if(inputs3!='' || inputs4!=''){
       var inputslength=document.getElementById('inputslen'+reportid112).value;
       inputs2 = document.getElementById('inputs'+reportid112).value;

 //table=document.getElementById("table1");
 //table_len=(table.rows.length)-1;
 $('#table1').find('tbody').empty(); 
//table.insertRow(table_len).outerHTML="<tr><th>Label</th><th>Type</th><th>Mandatory</th></tr>";


for(i=0;i<inputslength;i++){

  inputs_array= inputs4.split(",");
   inputsvalue=inputs_array[i];

  type_array= inputs3.split(",");
   typevalue=type_array[i];

  mandatory_array=inputs2.split(",");
   mandatoryvalue=mandatory_array[i];

  if(typevalue=='bdd'){
    typevalue="Branch Drop Down"  
  }
  if(typevalue=='date'){
    typevalue="Date Picker"  
  }

  if(typevalue=='ddd'){
    typevalue="Detailed Drop Down"  
  }

 label="label"+i;

 type="type"+i;//hidden
 type1="type1"+i;//disablled

  mandatory="mandatory"+i;
  mandatory1="mandatory1"+i;

    if(mandatoryvalue=='Y'){
       c="checked";
     }

  if(mandatoryvalue=='N'){
       c="unchecked";
   }

if(mandatoryvalue=='Y'){
       d="checked";
     }

  if(mandatoryvalue=='N'){
       d="checked";
   }

  //table.insertRow(table_len).outerHTML="<tr id='row[i]"+table_len+"'><td id='name_row"+inputsvalue+"'><input  required id='label' name='label' type='text' value='"+inputsvalue+"'></td><td id='name_row"+typevalue+"'><input hidden id='type' name='type' type='text' value='"+typevalue+"'><input disabled id='type1' name='type1' type='text' value='"+typevalue+"'></td><td><input type='checkbox' id='mandatory1' name='mandatory1' value='"+mandatoryvalue+"' "+c+" disabled><label for='mandatory'></label><input hidden type='checkbox' id='mandatory' name='mandatory' value='"+mandatoryvalue+"' "+d+"></td></tr>";
   tr = $('<tr/>'); 
    tr.append("<td id='name_row"+inputsvalue+"'><input  required id='label' name='label' type='text' value='"+inputsvalue+"'></td><td id='name_row"+typevalue+"'><input hidden id='type' name='type' type='text' value='"+typevalue+"'><input disabled id='type1' name='type1' type='text' value='"+typevalue+"'></td><td><input type='checkbox' id='mandatory1' name='mandatory1' value='"+mandatoryvalue+"' "+c+" disabled><label for='mandatory'></label><input hidden type='checkbox' id='mandatory' name='mandatory' value='"+mandatoryvalue+"' "+d+"></td>");
 
   $('#table1').find('tbody').append(tr);
    }

}

if(parameter=='')
{
  document.getElementById("iparam").value = 'NA';
}
else{
  document.getElementById("iparam").value = parameter;
}

       document.getElementById("rep_id12").value=reportid112;
       document.getElementById("rep_id13").value=reportid112;// for update-to get reportid value

       document.getElementById("rep_name2").value = reportname112;
       document.getElementById("rep_descd2").value = reportdesc112;
       document.getElementById("jrxml").value = jrxmlrep112;
	   document.getElementById("len").value= inputslength;
       jQuery('#moduledropdown_edit').val(modulename112);
       jQuery('#moduledropdown_edit').material_select();
}