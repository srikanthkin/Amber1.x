$(document).ready(function() {
 $('#modal30').modal();
 
   });

$(document).ready(function() {
 $('#modal31').modal();
 
   });
$(document).ready(function() {
 $('#modal32').modal();
 
 });
$(document).ready(function() {
 $('#modal33').modal();
 
 });

function scheduleinputs() {

var scheduleid = $("input[name='reportid']:checked").val();
//window.alert(scheduleid);

var res="reportinput"+scheduleid;
//window.alert(res);
var id = document.getElementById(res).value;
//window.alert(id);
$('#report_inputs').val(id);
$('#sc_id').val(scheduleid);
document.getElementById("schedulesubmit").submit();

}
function able_disable() {
	var reportid = $("input[name='reportid']:checked").val();

    var status= document.getElementById('status'+reportid).value;


    if(status=='active'){
          document.getElementById("stopbutton").disabled = false;

        }
        else{
          document.getElementById("stopbutton").disabled = true;

        }
}

function scheduleview() {
	       var reportid = $("input[name='reportid']:checked").val();
	        var seqid= document.getElementById('s_id'+reportid).value;

	        var reportname= document.getElementById('reportname'+reportid).value;
	        var frequency= document.getElementById('frequency'+reportid).value;
	        var startdate= document.getElementById('startdate'+reportid).value;

	        var enddate= document.getElementById('enddate'+reportid).value;
	        var status= document.getElementById('status'+reportid).value;
	        var eod=document.getElementById('eod'+reportid).value;
	        var holiday=document.getElementById('holiday'+reportid).value;
	        var distribute=document.getElementById('distribution'+reportid).value;
			
	        document.getElementById("rep_id1").value=reportid;
	        document.getElementById("rep_name1").value=reportname;
	        document.getElementById("sc_fromdate").value=startdate;
	        document.getElementById("sc_enddate").value=enddate;
	        document.getElementById("sc_status").value=status;
	        jQuery('#frequency_dropdown11').val(frequency);
            jQuery('#frequency_dropdown11').material_select();

            jQuery('#eod_dropdown11').val(eod);
            jQuery('#eod_dropdown11').material_select();

            jQuery('#holiday_dropdown11').val(holiday);
            jQuery('#holiday_dropdown11').material_select();

            document.getElementById('distribute_gr').value=distribute;


}

function scheduleedit() {
	       var reportid = $("input[name='reportid']:checked").val();
	      
	       var seqid= document.getElementById('s_id'+reportid).value;


	        var reportname= document.getElementById('reportname'+reportid).value;
	        var frequency= document.getElementById('frequency'+reportid).value;
	        var startdate= document.getElementById('startdate'+reportid).value;

	        var enddate= document.getElementById('enddate'+reportid).value;
	        var status= document.getElementById('status'+reportid).value;

	        var eod=document.getElementById('eod'+reportid).value;
	        var holiday=document.getElementById('holiday'+reportid).value;

	        var distribute=document.getElementById('distribution'+reportid).value;
			
	        
	        document.getElementById("rep_id11").value=reportid;
	        document.getElementById("rep_id111").value=reportid;

	        document.getElementById("sch_id111").value=seqid;

	        document.getElementById("rep_name11").value=reportname;
	        document.getElementById("sc_fromdate11").value=startdate;
	        document.getElementById("sc_enddate11").value=enddate;
	        document.getElementById("sc_status11").value=status;
	        jQuery('#frequency_dropdown').val(frequency);
            jQuery('#frequency_dropdown').material_select();

            jQuery('#eodedit_dropdown11').val(eod);
            jQuery('#eodedit_dropdown11').material_select();

            jQuery('#holidayedit_dropdown11').val(holiday);
            jQuery('#holidayedit_dropdown11').material_select();

            jQuery('#scheduleedit_distributeuser').val(distribute);
            jQuery('#scheduleedit_distributeuser').material_select();


}

function stop_schedule()
  {

  	       var reportid = $("input[name='reportid']:checked").val();
	      
	       var seqid= document.getElementById('s_id'+reportid).value;
		   var reportname= document.getElementById('reportname'+reportid).value;
	       var status= document.getElementById('status'+reportid).value;


	        document.getElementById("reportname11").value=reportname;
	        document.getElementById("sid11").value=seqid;
	        document.getElementById("status11").value=status;
			document.getElementById("reportid111").value=reportid;
	        document.getElementById("reportname111").value=reportname;
	        document.getElementById("sid111").value=seqid;
	        document.getElementById("status111").value=status;



}

