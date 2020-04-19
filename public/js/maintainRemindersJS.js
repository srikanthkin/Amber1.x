function delete_upcoming_events() {
  var reminder_id = $("input[name='reminderid11']:checked").val();
  //window.alert(reminder_id);
  //var  reminder_status= document.getElementById('rem_status11'+reminder_id).value;
  //window.alert(reminder_status);

 $('#reminderid_cancel').val(reminder_id);
document.getElementById("upcoming_events").submit();
}

function delete_upcoming_events1() {
  var reminder_id = $("input[name='reminderid22']:checked").val();
 // window.alert(reminder_id);
  //var  reminder_status= document.getElementById('rem_status11'+reminder_id).value;
  //window.alert(reminder_status);

 $('#reminderid_cancel1').val(reminder_id);

document.getElementById("upcoming_events1").submit();
}