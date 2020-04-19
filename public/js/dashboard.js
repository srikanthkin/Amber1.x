function dashboard() {
    var ajaxdata = "data";
    var jsonResponse1 = "";

    $.ajax({
        type: 'post',
        url: '/mis-login/login/dashboard',
        data: {
            data: ajaxdata,
        },
        success: function(response, data) {
            if (data == "success") {
                jsonResponse = response;
                google.charts.load('current', {
                    'packages': ['corechart', 'bar', 'line']
                });
            }
            depositorChart();
          
        }
    });
}

function depositorChart() {
 
    var finalArrayForCharts = [
        []
    ];
    var array = [];
    google.charts.setOnLoadCallback(depositorsPieChart);

    function depositorsPieChart() {
        for (var q = 0; q < jsonResponse.length; q++) {
            array.push(String(jsonResponse[q].ACCT_NAME));
            array.push(Number(jsonResponse[q].BALANCE));

            finalArrayForCharts[q] = array;
            console.log("q" + q)
            array = [];
        }
        data = new google.visualization.DataTable();
        data.addColumn('string', 'Depositors');
        data.addColumn('number', 'Deposit Amount');
        data.addRows(finalArrayForCharts);
      
        var options = {
            title: ''
        };
        var chart = new google.visualization.PieChart(document.getElementById('depositorPieChart'));
        chart.draw(data, options);

    }
}




function depositorsBarChart() {
    var finalArrayForCharts = [
        []
    ];
    var array = [];

    for (var q = 0; q < jsonResponse.length; q++) {
        array.push(String(jsonResponse[q].ACCT_NAME));
        array.push(Number(jsonResponse[q].BALANCE));

        finalArrayForCharts[q] = array;
        console.log("q" + q)
        array = [];
    }
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Depositors');
    data.addColumn('number', 'Deposit Amount');
    data.addRows(finalArrayForCharts);
    var options = {
        title: 'Depositors',
        width: 500,
        height: 350,
        legend: {
            position: 'none'
        },
        bars: 'horizontal', // Required for Material Bar Charts.
        axes: {
            x: {
                0: {
                    side: 'top',
                    label: 'Value in Indian Rupees'
                } // Top x-axis.
            }
        },
        bar: {
            groupWidth: "10%"
        }
    };
    if (document.getElementById('depositorPieChart')) {

        if (document.getElementById('depositorPieChart').style.display == 'none') {
            document.getElementById('depositorPieChart').style.display = 'block';
            document.getElementById('depositorBarChart').style.display = 'none';
        } else {
            document.getElementById('depositorPieChart').style.display = 'none';
            document.getElementById('depositorBarChart').style.display = 'block';
        }
    }


    var changetext = document.getElementById("depositorButton");
    if (changetext.innerHTML == "View as Bar Chart") {
        changetext.innerHTML = "View as Pie Chart";
    } else {
        changetext.innerHTML = "View as Bar Chart";
    }


    var barvar = new google.charts.Bar(document.getElementById('depositorBarChart'));
    barvar.draw(data, options);

};




function borrowersAjax() {


    var ajaxdata = "data";

    $.ajax({
        type: 'post',
        url: '/mis-login/login/bdashboard',
        data: {
            data: ajaxdata,
        },
        success: function(response, data) {
            if (data == "success") {
                jsonResponse1 = response;
                google.charts.load('current', {
                    'packages': ['corechart', 'bar', 'line']
                });
            }


            borrowerChart();

        }
    });
}

function borrowerChart() {

    var finalBArrayForCharts = [
        []
    ];
    var barray = [];
    google.charts.setOnLoadCallback(borrowersPieChart);


    function borrowersPieChart() {


        for (var q = 0; q < jsonResponse1.length; q++) {
            barray.push(String(jsonResponse1[q].ACCT_NAME));
            barray.push(Number(Math.abs(jsonResponse1[q].BALANCE)));

            finalBArrayForCharts[q] = barray;
            console.log("q" + q)
            console.log("positiveeee", Math.abs(jsonResponse1[q].BALANCE))
            barray = [];
        }
        var bdata = new google.visualization.DataTable();
        bdata.addColumn('string', 'Account Name');
        bdata.addColumn('number', 'Borrowed Amount');
        bdata.addRows(finalBArrayForCharts);
        var options = {
            title: ''
        };
        var chart = new google.visualization.PieChart(document.getElementById('borrowerPieChart'));
        chart.draw(bdata, options);
    }

}

function borrowersBarChart() {
    var finalBArrayForCharts = [
        []
    ];
    var barray = [];


    for (var q = 0; q < jsonResponse1.length; q++) {
        barray.push(String(jsonResponse1[q].ACCT_NAME));
        barray.push(Number(Math.abs(jsonResponse1[q].BALANCE)));

        finalBArrayForCharts[q] = barray;
        console.log("q" + q)
        barray = [];
    }
    var bdata = new google.visualization.DataTable();
    bdata.addColumn('string', 'Borrowers');
    bdata.addColumn('number', 'Borrowed Amount');
    bdata.addRows(finalBArrayForCharts);
    var options = {
        title: '',
        width: 500,
        height: 350,
        legend: {
            position: 'none'
        },
        bars: 'horizontal', // Required for Material Bar Charts.
        axes: {
            x: {
                0: {
                    side: 'top',
                    label: 'Value in Indian Rupees'
                } // Top x-axis.
            }
        },
        bar: {
            groupWidth: "10%"
        }
    };
    if (document.getElementById('borrowerPieChart')) {

        if (document.getElementById('borrowerPieChart').style.display == 'none') {
            document.getElementById('borrowerPieChart').style.display = 'block';
            document.getElementById('borrowerBarChart').style.display = 'none';
        } else {
            document.getElementById('borrowerPieChart').style.display = 'none';
            document.getElementById('borrowerBarChart').style.display = 'block';
        }
    }


    var changetext = document.getElementById("borrowerButton");
    if (changetext.innerHTML == "View as Pie Chart") {
        changetext.innerHTML = "View as Bar Chart";
    } else {
        changetext.innerHTML = "View as Pie Chart";
    }


    var barvar = new google.charts.Bar(document.getElementById('borrowerBarChart'));
    barvar.draw(bdata, options);

};

function borrowing_trend(){
   google.charts.setOnLoadCallback(drawLine);

function drawLine() {

      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Month');
      data.addColumn('number', 'Sundaram Finance');
      data.addColumn('number', 'Spotlight Tech');
      data.addColumn('number', 'Neutron Industries');
      data.addColumn('number', 'Stapple Food Inc');
      data.addColumn('number', 'Elastic Search');

      data.addRows([
        ["August 2016",   8.8, 13.6,  7.7, 15.7,10.3],
        ["September 2016",  11.9, 17.6, 10.4, 8.8, 50.8],
        ["October 2016",  11.7, 18.8, 10.5, 44.4, 55.5],
        ["November 2016",  25.4,   57, 25.7, 30, 80],
        ["December 2016",  30.9, 69.5, 32.4, 25.8, 65.7],
        ["January 2017",  37.8, 80.8, 41.8, 20.6, 77.5],
      ]);

      var options = {
        chart: {
          title: 'Borrowing Trend of Top 5 Borrowers (Last 6 Months)',
          subtitle: 'in million rupees (INR)'
        },
        width: 900,
        height: 430,
        axes: {
          x: {
            0: {side: 'bottom'}
          }
        }
      };
    var linevar = new google.charts.Line(document.getElementById('myLineChart'));
    linevar.draw(data, options);
    }
}


function profilepicedit() {
 
var profileusername = document.getElementById('username').value;
document.getElementById("profileusername").value = profileusername;
    var profileemail = document.getElementById('emailid').value;
    document.getElementById("profileemail").value = profileemail;
   
   
    $('#profileusername').removeClass('invalid');
    $('#profileemail').removeClass('invalid');
   //$('#updatingprogress').removeClass('progress');
     //document.getElementById("updatingprogress").style.display="none";
    }


function ValidateFileUpload(event) {
 if(document.getElementById("update_button").style.display="none"){
      document.getElementById("update_button").style.display="block";
       document.getElementById("remove_button").style.display="none";
    }
   
  
    var fuData = document.getElementById('myfileinput');
    var FileUploadPath = fuData.value;

    if (FileUploadPath == '') {
        
        } 
        else {
        var Extension = FileUploadPath.substring(FileUploadPath.lastIndexOf('.') + 1).toLowerCase();
        if (Extension == "gif" || Extension == "png" || Extension == "bmp" || Extension == "jpeg" || Extension == "jpg") {
            if (fuData.files && fuData.files[0]) {
                var size = fuData.files[0].size;
                if (size > 500000) {
            document.getElementById("sizeerror").innerHTML= '<b> Maximum image size can be 500Kb </b>'
            
            return;
                } else {
                  document.getElementById('sizeerror').style.display = 'none';
               var selectedFile = event.target.files[0];
               var reader = new FileReader();
               var imgtag = document.getElementById("photoload");
               imgtag.title = selectedFile.name;
               reader.onload = function(event) {
                imgtag.src = event.target.result;
                if (document.getElementById('photoload')) {
                        if (
                            document.getElementById('photoload').style.display == 'none') {
                            document.getElementById('photoload').style.display = 'block';
                            document.getElementById('modalphoto').style.display = 'none';
                         
                        } else {
                            document.getElementById('photoload').style.display = 'block';
                            document.getElementById('modalphoto').style.display = 'none';
                           
                        }
                    }

            };
                reader.readAsDataURL(selectedFile);
             
            }
        }
    }
     else {
            
            document.getElementById("sizeerror").innerHTML = '<b> Only GIF, PNG, JPG, JPEG and BMP images are allowed. </b>'
              return;
        }
    }
}

var image="";
function profilepic() {
  
   jQuery('.progress').show();
    var res;
    var usernameupdate = document.getElementById("profileusername").value;
    var emailidupdate = document.getElementById("profileemail").value;
    
    var fileInput = document.getElementById("myfileinput");
    var files = fileInput.files;
    var accept = {
        binary: ["image/png", "image/jpeg"],
        text: ["text/plain", "text/css", "application/xml", "text/html"]
    };
    var file;
   
    if(files.length==0){
        
        deatilsedit();
    }
    for (var i = 0; i < files.length; i++) {
        file = files[i];
        if (file !== null) {
            if (accept.binary.indexOf(file.type) > -1) {
                var reader = new FileReader();
                reader.onload = function(e) {
                   
                    var res = this.result;
                    $.ajax({
                        type: 'post',
                        url: '/mis-login/login/photoupload',
                        data: {
                            pho: res,
                           
                        },
                        success: function(response, data) {
                            if (data == "success") {
                                image=response;
                              
                               
                                deatilsedit();
                                 }
                        }
                        });
                            }
                reader.readAsDataURL(file);
            } 
            else if (accept.text.indexOf(file.type) > -1) {
            var data = file.getAsText();
            }
        }
    }


    function deatilsedit(){
    var usernameupdate = document.getElementById("profileusername").value;
    var emailidupdate = document.getElementById("profileemail").value;
                $.ajax({
                        type: 'post',
                        url: '/mis-login/login/noimage',
                        data: {
                            name: usernameupdate,
                            mail: emailidupdate,
                        },
                        success: function(response, data) {
                            if (data == "success") {
                              
                                if(image !=0){
                                  
                            $('.profileupload').html('<img   src="' + image + '"class="circle" />');
                                document.getElementById("Name").innerHTML = response[0];
                                document.getElementById("useremail").innerHTML = response[1];
                                 jQuery('.progress').hide();
                                $('#ImageModal').modal('close');

                                // $('#update').removeClass('progress');
                                //document.getElementById("update").style.display="none";

                               

                            $('.uploading').html('<img   src="' + image + '"class="circle" />');
                                 document.getElementById("username").value = response[0];
                                 document.getElementById("emailid").value = response[1];
                                

                             if (document.getElementById('photo')) {
                        if (
                            document.getElementById('photo').style.display == 'none') {
                            document.getElementById('photo').style.display = 'block';
                            document.getElementById('defaultimage').style.display = 'none';
                         
                        } else {
                            document.getElementById('defaultimage').style.display = 'none';
                            document.getElementById('photo').style.display = 'block';
                           
                        }
                    }
                    if (document.getElementById('modalphoto')) {
                        if (
                            document.getElementById('modalphoto').style.display == 'none') {
                            document.getElementById('modalphoto').style.display = 'block';
                            document.getElementById('photoload').style.display = 'none';
                         
                        } else {
                            document.getElementById('defaultimage').style.display = 'none';
                            document.getElementById('photoload').style.display = 'none';
                           
                        }
                    }
                   
                               
                        }
                    else  if(image==0){
                    document.getElementById("Name").innerHTML = response[0];
                    document.getElementById("useremail").innerHTML = response[1];
                      jQuery('.progress').hide();
                    $('#ImageModal').modal('close');

                    //$('#update').removeClass('progress');
                    document.getElementById("username").value = response[0];
                    document.getElementById("emailid").value = response[1];
                               
                               }
                           
                            }
                        }
                    });
                    
                }

}


var removeimage;
function remove() {

   document.getElementById('remove_button').style.display="block"
   document.getElementById('update_button').style.display="none";

var fileInput = document.getElementById("myfileinput");

         
var res="res"
            $.ajax({
                    type: 'post',
                    url: '/mis-login/login/removeimage',
                    data: {
                        pho: res,
                           
                        },
                        success: function(response, data) {
                            if (data == "success") {
                              var  removeimage=response;

                            
                         }
                      }
                   });


           $('.uploading').html('<img   src="/images/download.png" class="circle"/>' );
          
           if (document.getElementById('photoload')) {
                        if (
                            document.getElementById('photoload').style.display == 'none') {
                            document.getElementById('photoload').style.display = 'none';
                            document.getElementById('modalphoto').style.display = 'block';
                         
                        } else {
                            document.getElementById('photoload').style.display = 'block';
                            document.getElementById('modalphoto').style.display = 'none';
                           
                        }
                    }


           if (document.getElementById('modalphoto')) {
                        if (
                            document.getElementById('modalphoto').style.display == 'none') {
                            document.getElementById('modalphoto').style.display = 'block';
                            document.getElementById('photoload').style.display = 'none';
                         
                        } else {
                            document.getElementById('modalphoto').style.display = 'block';
                            document.getElementById('photoload').style.display = 'none';
                           
                        }
                    }
                    
            }

function removeimg(){
    var usernameupdate = document.getElementById("profileusername").value;
    var emailidupdate = document.getElementById("profileemail").value;

valid();

function valid(){
var name=document.myform.profileusername.value;  
var email=document.myform.profileemail.value; 
var atpos = email.indexOf("@");
var dotpos = email.lastIndexOf("."); 
//var regex = /^[a-zA-Z]*$/; 
var regex = /^[a-zA-Z\s]*$/; 

if(name!="" && email!=""){
    
    if (atpos<1 || dotpos<atpos+2 || dotpos+2>=email.length) {
    $('#profileemail').addClass('invalid');
    document.getElementById("error_email").innerHTML = "Email id must contain @ .characters";
    document.getElementById("error_username").innerHTML = "No special characters allowed";
}
if (regex.test(document.myform.profileusername.value)) {
  if ((atpos<1 || dotpos<atpos+2 || dotpos+2>=email.length))
    {
    }
    else{
        removeicon();
    }
}
   else {
    $('#profileusername').addClass('invalid');
 document.getElementById("error_uname").innerHTML = "No special characters allowed";
    }  
  }

     

if (name==""&& email==""){
    $('#profileusername').addClass('invalid');
    document.getElementById("error_uname").innerHTML = "Username Cannot be empty";

    $('#profileemail').addClass('invalid');
   document.getElementById("error_email").innerHTML = "Email Id Cannot be empty";
    }
    if(name==""){
    $('#profileusername').addClass('invalid');
    document.getElementById("error_uname").innerHTML = "Username Cannot be empty";
    return false;
    }
    if(email==""){
    $('#profileemail').addClass('invalid');
    document.getElementById("error_email").innerHTML = "Email Id Cannot be empty";
    }
}

}

function validateuname(){

var name=document.myform.profileusername.value;  
var email=document.myform.profileemail.value; 
var atpos = email.indexOf("@");
var dotpos = email.lastIndexOf("."); 
//var regex = /^[a-zA-Z]*$/; 
var regex = /^[a-zA-Z\s]*$/; 

if(name!="" && email!=""){
    
    if (atpos<1 || dotpos<atpos+2 || dotpos+2>=email.length) {
    $('#profileemail').addClass('invalid');
    document.getElementById("error_email").innerHTML = "Email id must contain @ .characters";
    document.getElementById("error_username").innerHTML = "Only Alphabets are allowed";
}
if (regex.test(document.myform.profileusername.value)) {
  if ((atpos<1 || dotpos<atpos+2 || dotpos+2>=email.length))
    {
    }
    else{
        profilepic();
    }
}
   else {
    $('#profileusername').addClass('invalid');
 document.getElementById("error_uname").innerHTML = "Only Alphabets are allowed";
    }  
  }

     

if (name==""&& email==""){
    $('#profileusername').addClass('invalid');
    document.getElementById("error_uname").innerHTML = "Username Cannot be empty";

    $('#profileemail').addClass('invalid');
   document.getElementById("error_email").innerHTML = "Email Id Cannot be empty";
    }
    if(name==""){
    $('#profileusername').addClass('invalid');
    document.getElementById("error_uname").innerHTML = "Username Cannot be empty";
    return false;
    }
    if(email==""){
    $('#profileemail').addClass('invalid');
    document.getElementById("error_email").innerHTML = "Email Id Cannot be empty";
    }
}

 function removeicon(){ 
  var usernameupdate = document.getElementById("profileusername").value;
    var emailidupdate = document.getElementById("profileemail").value;            
      $.ajax({
                        type: 'post',
                        url: '/mis-login/login/noimage',
                        data: {
                            name: usernameupdate,
                            mail: emailidupdate,
                        },
                        success: function(response, data) {
                            if (data == "success") {
                               
   $('#ImageModal').modal('close');

    $('.profileupload').html('<img   src="/images/download.png" class="circle"/>' );
   
  
    document.getElementById("remove_button").style.display="none";
    document.getElementById("update_button").style.display="block";
        if (document.getElementById('photo')) {
                        if (
                            document.getElementById('photo').style.display == 'none') {
                            document.getElementById('photo').style.display = 'block';
                            document.getElementById('defaultimage').style.display = 'none';
                        } 
                        else {
                            document.getElementById('photo').style.display = 'block';
                            document.getElementById('defaultimage').style.display = 'none';
                           
                        }
                    }
                      if (document.getElementById('defaultimage')) {
                        if (
                            document.getElementById('defaultimage').style.display == 'none') {
                            document.getElementById('defaultimage').style.display = 'none';
                            document.getElementById('photo').style.display = 'block';
                         
                        } else {
                            document.getElementById('defaultimage').style.display = 'block';
                            document.getElementById('photo').style.display = 'none';
                           
                        }
                    }
                    document.getElementById("Name").innerHTML = response[0];
                    document.getElementById("useremail").innerHTML = response[1];
                    $('#ImageModal').modal('close');
                    $('#updatingprogress').removeClass('progress');
                    document.getElementById("username").value = response[0];
                    document.getElementById("emailid").value = response[1];
                }
            }
        });
     }