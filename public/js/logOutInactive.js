$(function () {
            $("body").on('click keypress', function () {
                ResetThisSession();
            });
        });

//var session = document.getElementById("session").value;
//window.alert("session");
    //var paramtime=document.getElementById('timeout').value;
    //window.alert(paramtime)
    var timeInSecondsAfterSessionOut = 1000; // change this to change session time out (in seconds).
   // window.alert(timeInSecondsAfterSessionOut)
        var secondTick = 0;

        function ResetThisSession() {
            secondTick = 0;
        }

        function StartThisSessionTimer() {
            secondTick++;
            var timeLeft = ((timeInSecondsAfterSessionOut - secondTick) / 60).toFixed(0); // in minutes
        timeLeft = timeInSecondsAfterSessionOut - secondTick; // override, we have 30 secs only 

            $("#spanTimeLeft").html(timeLeft);
                 
                 if(timeLeft==5){
                        window.alert("Session will expire if you are inactive")

                        } 

             if (secondTick > timeInSecondsAfterSessionOut) {
               clearTimeout(tick);
                window.location = "/mis-logout/logout/mislogout";
                return;
            }
            tick = setTimeout("StartThisSessionTimer()", 1000);
        }

        StartThisSessionTimer();
    