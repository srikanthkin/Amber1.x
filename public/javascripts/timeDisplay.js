 /*three functions*/
       function startTime() {
       var today = new Date();
       var o=today.getDate();
       var h = today.getHours();
       var m = today.getMinutes();
       var s = today.getSeconds();
       logged=   h + ":" + m+":"+s;
       m=  document.getElementById('txt').innerHTML =logged;
      return o ;
      };
    var t = setTimeout(startTime); 
 
 
    function runTime() {
    var current = new Date();
    var n=current.getDate();
    var h = current.getHours();
    var m = current.getMinutes();
    var s = current.getSeconds();
    log=   h + ":" + m+":"+s;
    var t = setTimeout(runTime, 5)
    return n; 
    };
   var t = setTimeout(runTime, 5); 

    function Time() {
    var date=startTime();
    loggeddate=date;
    var current=runTime();
    currentdate=current;
    
   if(loggeddate==currentdate)
      {
        document.getElementById('string').innerHTML ="today";
      }
   else
      {
         document.getElementById('string').innerHTML ="yesterday";
      }
     };
    var t = setTimeout(Time, 5);
    /*--*/