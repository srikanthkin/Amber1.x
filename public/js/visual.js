var div="";
function changeVisual()
{
 div=document.getElementById('ddl').value;
 if(div=="select"){

  document.getElementById('Top_Depositors').style.display = "none";
  document.getElementById('Top_Borrowers').style.display = "none";
   document.getElementById('Borrowing_Trend').style.display = "none";
  document.getElementById('EOD_SOL').style.display = "none";
   document.getElementById('Account_open').style.display = "none";
}
if(div=="Top_Depositors"){
 
  ajaxcall();
  document.getElementById('Top_Depositors').style.display = "block";
  document.getElementById('Top_Borrowers').style.display = "none";
   document.getElementById('Borrowing_Trend').style.display = "none";
  document.getElementById('EOD_SOL').style.display = "none";
   document.getElementById('Account_open').style.display = "none";
}
else if(div=="Top_Borrowers"){
ajaxcall();
    document.getElementById('Top_Depositors').style.display = "none";
  document.getElementById('Top_Borrowers').style.display = "block";
  document.getElementById('Borrowing_Trend').style.display = "none";
  document.getElementById('EOD_SOL').style.display = "none";
   document.getElementById('Account_open').style.display = "none";
}
else if(div=="Borrowing_Trend"){


  ajaxcall();
  document.getElementById('Top_Depositors').style.display = "none";
  document.getElementById('Top_Borrowers').style.display = "none";
  document.getElementById('Borrowing_Trend').style.display = "block";
  document.getElementById('EOD_SOL').style.display = "none";
   document.getElementById('Account_open').style.display = "none";

}
else if(div=="EOD_SOL"){

  ajaxcall();
  document.getElementById('Top_Depositors').style.display = "none";
  document.getElementById('Top_Borrowers').style.display = "none";
  document.getElementById('Borrowing_Trend').style.display = "none";
  document.getElementById('EOD_SOL').style.display = "block";
   document.getElementById('Account_open').style.display = "none";
}

else if(div=="Account_open"){

  ajaxcall();
  document.getElementById('Top_Depositors').style.display = "none";
  document.getElementById('Top_Borrowers').style.display = "none";
  document.getElementById('Borrowing_Trend').style.display = "none";
  document.getElementById('EOD_SOL').style.display = "none";
  document.getElementById('Account_open').style.display = "block";
}
}


var jsonResponse;

var data="";

function ajaxcall(){

 var count =document.getElementById("dropdowncount").value;

var borrowcount =document.getElementById("borrowdropdowncount").value;


 var visual =document.getElementById("ddl").value;

$.ajax
 ({
  type:'post',
  url:'/dashboard-visualisation/dashboardVisual/count',
  data:{
   dropdowncount:count,
   visual:visual,
   borrowcount:borrowcount
 },success:function(response,data) {

   if(data=="success")
   {
   jsonResponse=response;
  
  google.charts.load('current', {
  'packages': ['corechart','bar','line']
    });

   }

 chart();

 
  }
 });
  }





function chart(){
 
    var finalArrayForCharts = [[]];
    var array=[];
google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
    for(var q=0;q<jsonResponse.length;q++){
    array.push(String(jsonResponse[q].ACCT_NAME));
    array.push(Number(Math.abs(jsonResponse[q].BALANCE)));

    finalArrayForCharts[q]=array;
    console.log("q"+q)
    array=[];
    }
    data = new google.visualization.DataTable();
   data.addColumn('string', ' Name');
   data.addColumn('number', ' Amount');
   data.addRows(finalArrayForCharts);

  if(div=="Top_Depositors"){ 
depositor();
}
else if(div=="Top_Borrowers"){
borrowercharttype();
}
else if(div=="Borrowing_Trend"){
borrower_trend();
}
else if(div=="EOD_SOL"){
edo_chart();
}
else if(div=="Account_open"){
Account_open();
}
}
}


function Account_open(){
    var finalArrayForCharts = [[]];
    var array=[];
google.charts.setOnLoadCallback(accountopen);
    function accountopen() {
      console.log(jsonResponse)
    for(var q=0;q<jsonResponse.length;q++){
    array.push(String(jsonResponse[q].SCHM_DESC));
    array.push(Number(jsonResponse[q].COUNT));

    finalArrayForCharts[q]=array;
    console.log("q"+q)
    array=[];
    }
    data = new google.visualization.DataTable();
   data.addColumn('string', 'Count');
   data.addColumn('number', 'Scheme ');
   data.addRows(finalArrayForCharts);
account_open_charttype();
}
}



function edo_chart(){
    var finalArrayForCharts = [[]];
    var array=[];
google.charts.setOnLoadCallback(edoChart);
    function edoChart() {
      console.log(jsonResponse)
    for(var q=0;q<jsonResponse.length;q++){
    array.push(String(jsonResponse[q].PRCS));
    array.push(Number(jsonResponse[q].CNT));

    finalArrayForCharts[q]=array;
    console.log("q"+q)
    array=[];
    }
    data = new google.visualization.DataTable();
   data.addColumn('string', 'SOL Status');
   data.addColumn('number', 'Count Of SOLs');
   data.addRows(finalArrayForCharts);
eod_sol_charttype();

}
}


function depositor(){
  var dropdownselect = document.getElementById("depositorChartType").value;
  



 if(dropdownselect=="piechart"){
 var options = {
  title: ''
   };
   var chart = new google.visualization.PieChart(document.getElementById('depositorChart'));
      chart.draw(data, options);
  }
  else if(dropdownselect=="piechart_3d"){

      var options = {
          title: '',
          is3D: true,
        };
        var chart = new google.visualization.PieChart(document.getElementById('depositorChart'));
      chart.draw(data, options);
      }
 else if(dropdownselect=="donutchart"){ 
   var options = {
         title: '',
         pieHole: 0.4,
        };
        var chart = new google.visualization.PieChart(document.getElementById('depositorChart'));
      chart.draw(data, options);
      }

else if(dropdownselect=="rotatingchart"){
       var options = {
        legend: 'text',
       // pieSliceText: 'label',
        title: ' (100 degree rotation)',
        pieStartAngle: 100,
      };
       var chart = new google.visualization.PieChart(document.getElementById('depositorChart'));
      chart.draw(data, options);
    
    }
else if(dropdownselect=="exploding"){
          var options = {
          title: ' ',
          legend: 'text',
          //pieSliceText: 'none',
          slices: {  4: {offset: 0.2},
                    12: {offset: 0.3},
                    14: {offset: 0.4},
                    15: {offset: 0.5},
          },
        };
         var chart = new google.visualization.PieChart(document.getElementById('depositorChart'));
      chart.draw(data, options);
}
else if(dropdownselect=="coolingbars"){

      var options = {
        title: '',
        chartArea: {width: '50%'},
        hAxis: {
          title: 'Value in Indian Rupees',
          minValue: 0
        },
        vAxis: {
          title: 'Depositors'
        }
      };
      var chart = new google.visualization.BarChart(document.getElementById('depositorChart'));

     chart.draw(data, options);

}
else if(dropdownselect=="histogram"){
 var options = {
          title: '',
          hAxis: {
          title: 'Depositors',
          minValue: 0
        },
          vAxis: {title: 'Value in Indian Rupees'},
          isStacked: true
        };

var chart = new google.visualization.SteppedAreaChart(document.getElementById('depositorChart'));
chart.draw(data, options);
}
else if(dropdownselect=="coloredchart"){
       var options = {
          title: '',
          hAxis: {
          title: 'Value in Indian Rupees',
          minValue: 0
        },
          vAxis: {title: 'Depositors'},
          isStacked: true
        };

        var chart = new google.visualization.Histogram(document.getElementById('depositorChart'));
        chart.draw(data, options);
      }
    
 
}

function borrowercharttype(){
var dropdownselect = document.getElementById("bpieChart").value;

 if(dropdownselect=="piechart"){
 var options = {
  title: ''
   };
   var chart = new google.visualization.PieChart(document.getElementById('borrowerChart'));
      chart.draw(data, options);
  }
  else if(dropdownselect=="piechart_3d"){

      var options = {
          title: '',
          is3D: true,
        };
        var chart = new google.visualization.PieChart(document.getElementById('borrowerChart'));
      chart.draw(data, options);
      }
 else if(dropdownselect=="donutchart"){ 
   var options = {
         title: '',
         pieHole: 0.4,
        };
        var chart = new google.visualization.PieChart(document.getElementById('borrowerChart'));
      chart.draw(data, options);
      }

else if(dropdownselect=="rotatingchart"){
       var options = {
        legend: 'text',
        //pieSliceText: 'label',
        title: ' (100 degree rotation)',
        pieStartAngle: 100,
      };
       var chart = new google.visualization.PieChart(document.getElementById('borrowerChart'));
      chart.draw(data, options);
    
    }
else if(dropdownselect=="exploding"){
          var options = {
          title: ' ',
          legend: 'text',
          //pieSliceText: 'label',
          slices: {  4: {offset: 0.2},
                    12: {offset: 0.3},
                    14: {offset: 0.4},
                    15: {offset: 0.5},
          },
        };
         var chart = new google.visualization.PieChart(document.getElementById('borrowerChart'));
      chart.draw(data, options);
}
else if(dropdownselect=="coolingbars"){

      var options = {
        title: '',
        chartArea: {width: '50%'},
        hAxis: {
          title: 'Value in Indian Rupees',
          minValue: 0
        },
        vAxis: {
          title: 'Borrowers'
        }
      };
      var chart = new google.visualization.BarChart(document.getElementById('borrowerChart'));

     chart.draw(data, options);

}
else if(dropdownselect=="histogram"){
 var options = {
          title: '',
          hAxis: {
          title: 'Borrowers',
          minValue: 0
        },
          vAxis: {title: 'Value in Indian Rupees'},
          isStacked: true
        };

var chart = new google.visualization.SteppedAreaChart(document.getElementById('borrowerChart'));
chart.draw(data, options);
}
else if(dropdownselect=="coloredchart"){
        
       var options = {
          title: '',
          hAxis: {
          title: 'Value in Indian Rupees',
          minValue: 0
        },
          vAxis: {title: 'Borrowers'},
          isStacked: true
        };
        var chart = new google.visualization.Histogram(document.getElementById('borrowerChart'));
        chart.draw(data, options);
      }
    
 
}
function borrower_trend(){

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

      var linevar = new google.charts.Line(document.getElementById('borrow_trend_pie'));

      linevar.draw(data, options);
    }
}


function eod_sol_charttype(){
var dropdownselect = document.getElementById("eod_chart_type").value;
 if(dropdownselect=="piechart"){
 var options = {
  title: ''
   };
   var chart = new google.visualization.PieChart(document.getElementById('eod_pie'));
      chart.draw(data, options);
       google.visualization.events.addListener(chart,'select',selectHandler);

 function selectHandler() {
      $('#chart').modal('open');
  var selection = chart.getSelection();

  var message = '';
  for (var i = 0; i < selection.length; i++) {
    var item = selection[i];
    if (item.row != null && item.column != null) {
      var str = data.getFormattedValue(item.row, item.column);

      message += '{row:' + item.row + ',column:' + item.column + '} = ' + str + '\n';
    } else if (item.row != null) {
      var str = data.getFormattedValue(item.row, 0);
      message += '{row:' + item.row + ', column:none}; value (col 0) = ' + str + '\n';
    } else if (item.column != null) {
      var str = data.getFormattedValue(0, item.column);
      message += '{row:none, column:' + item.column + '}; value (row 0) = ' + str + '\n';
    }
  }
  if (message == '') {
    message = 'nothing';
  }
 $.ajax
 ({
  type:'post',
  url:'/dashboard-visualisation/dashboardVisual/drilldown',
  data:{
   drilldownvalue:str,
  
 },success:function(response,data) {

   if(data=="success")
   {
   jsonResponse=response;
   }

 drillchart();
  }
  });
 }
}
  else if(dropdownselect=="piechart_3d"){

      var options = {
          title: '',
          is3D: true,
        };
        var chart = new google.visualization.PieChart(document.getElementById('eod_pie'));
      chart.draw(data, options);
       google.visualization.events.addListener(chart,'select',selectHandler);


       function selectHandler() {
        $('#chart').modal('open');
  var selection = chart.getSelection();
  var message = '';
  for (var i = 0; i < selection.length; i++) {
    var item = selection[i];
    if (item.row != null && item.column != null) {
      var str = data.getFormattedValue(item.row, item.column);
      message += '{row:' + item.row + ',column:' + item.column + '} = ' + str + '\n';
    } else if (item.row != null) {
      var str = data.getFormattedValue(item.row, 0);
      message += '{row:' + item.row + ', column:none}; value (col 0) = ' + str + '\n';
    } else if (item.column != null) {
      var str = data.getFormattedValue(0, item.column);
      message += '{row:none, column:' + item.column + '}; value (row 0) = ' + str + '\n';
    }
  }
  if (message == '') {
    message = 'nothing';
  }
 $.ajax
 ({
  type:'post',
  url:'/dashboard-visualisation/dashboardVisual/drilldown',
  data:{
   drilldownvalue:str,
  
 },success:function(response,data) {

   if(data=="success")
   {
   jsonResponse=response;
   }

 drillchart();
  }
  });
 }
 }
 else if(dropdownselect=="donutchart"){ 
   var options = {
         title: '',
         pieHole: 0.4,
        };
        var chart = new google.visualization.PieChart(document.getElementById('eod_pie'));
      chart.draw(data, options);
       google.visualization.events.addListener(chart,'select',selectHandler);

       function selectHandler() {
        $('#chart').modal('open');
  var selection = chart.getSelection();
  var message = '';
  for (var i = 0; i < selection.length; i++) {
    var item = selection[i];
    if (item.row != null && item.column != null) {
      var str = data.getFormattedValue(item.row, item.column);
      message += '{row:' + item.row + ',column:' + item.column + '} = ' + str + '\n';
    } else if (item.row != null) {
      var str = data.getFormattedValue(item.row, 0);
      message += '{row:' + item.row + ', column:none}; value (col 0) = ' + str + '\n';
    } else if (item.column != null) {
      var str = data.getFormattedValue(0, item.column);
      message += '{row:none, column:' + item.column + '}; value (row 0) = ' + str + '\n';
    }
  }
  if (message == '') {
    message = 'nothing';
  }
 
 $.ajax
 ({
  type:'post',
  url:'/dashboard-visualisation/dashboardVisual/drilldown',
  data:{
   drilldownvalue:str,
  
 },success:function(response,data) {

   if(data=="success")
   {
   jsonResponse=response;
  
   }

 drillchart();
  }
  });
}
      }

else if(dropdownselect=="rotatingchart"){
       var options = {
        legend: 'text',
        pieSliceText: '',
        title: ' (100 degree rotation)',
        pieStartAngle: 100,
      };
       var chart = new google.visualization.PieChart(document.getElementById('eod_pie'));
      chart.draw(data, options);
       google.visualization.events.addListener(chart,'select',selectHandler);

       function selectHandler() {
        $('#chart').modal('open');
  var selection = chart.getSelection();
  var message = '';
  for (var i = 0; i < selection.length; i++) {
    var item = selection[i];
    if (item.row != null && item.column != null) {
      var str = data.getFormattedValue(item.row, item.column);
      message += '{row:' + item.row + ',column:' + item.column + '} = ' + str + '\n';
    } else if (item.row != null) {
      var str = data.getFormattedValue(item.row, 0);
      message += '{row:' + item.row + ', column:none}; value (col 0) = ' + str + '\n';
    } else if (item.column != null) {
      var str = data.getFormattedValue(0, item.column);
      message += '{row:none, column:' + item.column + '}; value (row 0) = ' + str + '\n';
    }
  }
  if (message == '') {
    message = 'nothing';
  }
  $.ajax
 ({
  type:'post',
  url:'/dashboard-visualisation/dashboardVisual/drilldown',
  data:{
   drilldownvalue:str,
  
 },success:function(response,data) {

   if(data=="success")
   {
   jsonResponse=response;
   }

 drillchart();
  }
  });
}
    
    }
else if(dropdownselect=="exploding"){
          var options = {
          title: ' ',
          legend: 'text',
          pieSliceText: '',
          slices: {  4: {offset: 0.2},
                    12: {offset: 0.3},
                    14: {offset: 0.4},
                    15: {offset: 0.5},
          },
        };
         var chart = new google.visualization.PieChart(document.getElementById('eod_pie'));
      chart.draw(data, options);
       google.visualization.events.addListener(chart,'select',selectHandler);
         function selectHandler() {
          $('#chart').modal('open');
  var selection = chart.getSelection();
  var message = '';
  for (var i = 0; i < selection.length; i++) {
    var item = selection[i];
    if (item.row != null && item.column != null) {
      var str = data.getFormattedValue(item.row, item.column);
      message += '{row:' + item.row + ',column:' + item.column + '} = ' + str + '\n';
    } else if (item.row != null) {
      var str = data.getFormattedValue(item.row, 0);
      message += '{row:' + item.row + ', column:none}; value (col 0) = ' + str + '\n';
    } else if (item.column != null) {
      var str = data.getFormattedValue(0, item.column);
      message += '{row:none, column:' + item.column + '}; value (row 0) = ' + str + '\n';
    }
  }
  if (message == '') {
    message = 'nothing';
  }
 $.ajax
 ({
  type:'post',
  url:'/dashboard-visualisation/dashboardVisual/drilldown',
  data:{
   drilldownvalue:str,
  
 },success:function(response,data) {

   if(data=="success")
   {
   jsonResponse=response;
   }

 drillchart();
  }
  });
}

}
else if(dropdownselect=="coolingbars"){

      var options = {
        title: '',
        chartArea: {width: '50%'},
        hAxis: {
          title: 'Count of SOLs',
          minValue: 0,
          ticks: [0, 2, 5, 7, 10]
        },
        vAxis: {
          title: 'Status'
        }
      };
      var chart = new google.visualization.BarChart(document.getElementById('eod_pie'));

     chart.draw(data, options);
      google.visualization.events.addListener(chart,'select',selectHandler);
        
 function selectHandler() {
    
    $('#chart').modal('open');
  var selection = chart.getSelection();
  var message = '';
  var messagestr='';
  for (var i = 0; i < selection.length; i++) {
    var item = selection[i];
    if (item.row != null && item.column != null) {
      var str = data.getFormattedValue(item.row, item.column);
      message +=  item.row + ',' + item.column ;
      if(message=="5,1"){
       messagestr="EOD Not Initiated ";
      }
      else if(message=="1,1"){
       messagestr ="Branch EOD Initiation Completed   ";
      }
      else if(message=="0,1"){
        messagestr="Branch EOD Completed    "
      }
      else if(message=="7,1"){
        messagestr="Total Branches remaining for EOD Completion "
      }
    } else if (item.row != null) {
      var str = data.getFormattedValue(item.row, 0);
      message += '{row:' + item.row + ', column:none}; value (col 0)' ;
    } else if (item.column != null) {
      var str = data.getFormattedValue(0, item.column);
      message += '{row:none, column:' + item.column + '}; value (row 0) ';
    }
  }
  if (message == '') {
    message = 'nothing';
  }

  $.ajax
 ({
  type:'post',
  url:'/dashboard-visualisation/dashboardVisual/drilldown',
  data:{
   drilldownvalue:messagestr,
  
 },success:function(response,data) {

   if(data=="success")
   {
   jsonResponse=response;
  
   }

 drillchart();
  }
  });
}
}
else if(dropdownselect=="histogram"){
 var options = {
          title: '',
           hAxis: {
          title: 'Count of SOLs',
          
          

        },
          vAxis: {title: 'Status'},
          minValue: 0,
          isStacked: true,
           ticks: [0, 2, 5, 7, 10]

        };

var chart = new google.visualization.SteppedAreaChart(document.getElementById('eod_pie'));
chart.draw(data, options);
 google.visualization.events.addListener(chart,'select',selectHandler);

  function selectHandler() {
    
    $('#chart').modal('open');
  var selection = chart.getSelection();
  var message = '';
  var messagestr='';
  for (var i = 0; i < selection.length; i++) {
    var item = selection[i];
    if (item.row != null && item.column != null) {
      var str = data.getFormattedValue(item.row, item.column);
      message +=  item.row + ',' + item.column ;
      if(message=="5,1"){
       messagestr="EOD Not Initiated ";
      }
      else if(message=="1,1"){
       messagestr ="Branch EOD Initiation Completed   ";
      }
      else if(message=="0,1"){
        messagestr="Branch EOD Completed    "
      }
      else if(message=="7,1"){
        messagestr="Total Branches remaining for EOD Completion "
      }
    } else if (item.row != null) {
      var str = data.getFormattedValue(item.row, 0);
      message += '{row:' + item.row + ', column:none}; value (col 0)' ;
    } else if (item.column != null) {
      var str = data.getFormattedValue(0, item.column);
      message += '{row:none, column:' + item.column + '}; value (row 0) ';
    }
  }
  if (message == '') {
    message = 'nothing';
  }

  $.ajax
 ({
  type:'post',
  url:'/dashboard-visualisation/dashboardVisual/drilldown',
  data:{
   drilldownvalue:messagestr,
  
 },success:function(response,data) {

   if(data=="success")
   {
   jsonResponse=response;
  
   }

 drillchart();
  }
  });
}
}
else if(dropdownselect=="coloredchart"){
        
       var options = {
          title: '',
           hAxis: {
          title: 'Count of SOLs',
          minValue: 0
        },
          vAxis: {title: 'Status'},
          isStacked: true
        };

        var chart = new google.visualization.Histogram(document.getElementById('eod_pie'));
        chart.draw(data, options);
         google.visualization.events.addListener(chart,'select',selectHandler);

          
    function selectHandler() {
    
    $('#chart').modal('open');
  var selection = chart.getSelection();
  var message = '';
  var messagestr='';
  for (var i = 0; i < selection.length; i++) {
    var item = selection[i];
    if (item.row != null && item.column != null) {
      var str = data.getFormattedValue(item.row, item.column);
      message +=  item.row + ',' + item.column ;
      if(message=="5,1"){
       messagestr="EOD Not Initiated ";
      }
      else if(message=="1,1"){
       messagestr ="Branch EOD Initiation Completed   ";
      }
      else if(message=="0,1"){
        messagestr="Branch EOD Completed    "
      }
      else if(message=="7,1"){
        messagestr="Total Branches remaining for EOD Completion "
      }
    } else if (item.row != null) {
      var str = data.getFormattedValue(item.row, 0);
      message += '{row:' + item.row + ', column:none}; value (col 0)' ;
    } else if (item.column != null) {
      var str = data.getFormattedValue(0, item.column);
      message += '{row:none, column:' + item.column + '}; value (row 0) ';
    }
  }
  if (message == '') {
    message = 'nothing';
  }

  $.ajax
 ({
  type:'post',
  url:'/dashboard-visualisation/dashboardVisual/drilldown',
  data:{
   drilldownvalue:messagestr,
  
 },success:function(response,data) {

   if(data=="success")
   {
   jsonResponse=response;
  
   }

 drillchart();
  }
  });
}
}

}


function drillchart(){


    var finalArrayForCharts = [[]];
    var array=[];

    var myJSON = JSON.stringify(jsonResponse);
    console.log("myJSON",myJSON)
  $('#myTablevisual').find('tbody').empty();  
    for(var q=0;q<jsonResponse.length;q++){
    array.push(String(jsonResponse[q].SOL_DESC));
    finalArrayForCharts[q]=array;
   
    console.log("q"+q)
 
  array=[];
  
  tr = $('<tr/>'); 
    tr.append("<td><h3>"  + "</h3><p><strong>" + finalArrayForCharts[q]+ "</strong></p><div>" +  "</div></td>");
 
   $('#myTablevisual').find('tbody').append(tr);
    }
    }
  



function account_open_charttype(){
var dropdownselect = document.getElementById("accountopen_chart_type").value;

 if(dropdownselect=="piechart"){
 var options = {
  title: ''
   };
   var chart = new google.visualization.PieChart(document.getElementById('accountopen_pie'));
      chart.draw(data, options);
  }
  else if(dropdownselect=="piechart_3d"){

      var options = {
          title: '',
          is3D: true,
        };
        var chart = new google.visualization.PieChart(document.getElementById('accountopen_pie'));
      chart.draw(data, options);
      }
 else if(dropdownselect=="donutchart"){ 
   var options = {
         title: '',
         pieHole: 0.4,
        };
        var chart = new google.visualization.PieChart(document.getElementById('accountopen_pie'));
      chart.draw(data, options);
      }

else if(dropdownselect=="rotatingchart"){
       var options = {
        legend: 'text',
        pieSliceText: '',
        title: ' (100 degree rotation)',
        pieStartAngle: 100,
      };
       var chart = new google.visualization.PieChart(document.getElementById('accountopen_pie'));
      chart.draw(data, options);
    
    }
else if(dropdownselect=="exploding"){
          var options = {
          title: ' ',
          legend: 'text',
          pieSliceText: '',
          slices: {  4: {offset: 0.2},
                    12: {offset: 0.3},
                    14: {offset: 0.4},
                    15: {offset: 0.5},
          },
        };
         var chart = new google.visualization.PieChart(document.getElementById('accountopen_pie'));
         chart.draw(data, options);
}
else if(dropdownselect=="coolingbars"){

      var options = {
        title: '',
        chartArea: {width: '50%'},
        hAxis: {
          title: 'Count',
          minValue: 0,
           ticks: [0, 2, 5, 7, 10]
        },
        vAxis: {
          title: 'Scheme '
        }
      };
      var chart = new google.visualization.BarChart(document.getElementById('accountopen_pie'));

     chart.draw(data, options);

}
else if(dropdownselect=="histogram"){
 var options = {
          title: '',
           hAxis: {
          title: 'Scheme  ',
          minValue: 0,

          
        },
          vAxis: {title: 'Count'},
          isStacked: true,
        };

var chart = new google.visualization.SteppedAreaChart(document.getElementById('accountopen_pie'));
chart.draw(data, options);
}
else if(dropdownselect=="coloredchart"){
        
       var options = {
          title: '',
           hAxis: {
          title: 'Count ',
          minValue: 0,
          ticks: [1, 5, 10, 15, 20]
        },
          vAxis: {title: 'Scheme '},
          isStacked: true
        };
         

        var chart = new google.visualization.Histogram(document.getElementById('accountopen_pie'));
        chart.draw(data, options);
      }
  }





