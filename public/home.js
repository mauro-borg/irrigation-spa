$(function() {

  var roomId;

  $.ajax({
    type: "GET",
    url: "/api/rooms",
    success: function(rooms) {
      roomId = rooms[0].id;
      getMessages();
      $.each(rooms, function(key, room) {
        var a = '<a href="#" data-room-id="' + room.id + '" class="room list-group-item">' + room.name + '</a>';
        $("#rooms").append(a);
      });
    }
  });

  $("#btnradio1").click(function() {
    $.ajax({
      type: "GET",
      url: "/api/pump_control_auto",
      contentType: "application/json",
      success: function(data) {
      }
    });
  });

  $("#btnradio2").click(function() {
    $.ajax({
      type: "GET",
      url: "/api/pump_control_manual",
      contentType: "application/json",
      success: function(data) {
      }
    });
  });

  $("#toggle-r2").click(function() {
    toggleRelayClick(2);
  });
  $("#toggle-r3").click(function() {
    toggleRelayClick(3);
  });
  $("#toggle-r4").click(function() {
    toggleRelayClick(4);
  });
  $("#toggle-r5").click(function() {
    toggleRelayClick(5);
  });
  $("#toggle-r6").click(function() {
    toggleRelayClick(6);
  });
  $("#toggle-r7").click(function() {
    toggleRelayClick(7);
  });
  $("#toggle-r8").click(function() {
    toggleRelayClick(8);
  });

  function toggleRelayClick(rnum) {
    let targetstatus = "off";
    if ($("#flexsw-r" + rnum.toString()).prop('checked') == false) {
      targetstatus = "on";
    }
    $.ajax({
      type: "GET",
      url: "/api/relay/" + rnum.toString() + "/" + targetstatus,
      contentType: "application/json",
      success: function(data) {
      }
    });
    setTimeout(getStatus, 1000);
    setTimeout(getMessages, 3000);
  }

  $("#getPressure").click(function() {
    // var message = {text: $("#message").val()};
    $.ajax({
      type: "GET",
      url: "/api/pressure",
      contentType: "application/json",
      success: function(data) {
        $("#pressure-display").val(data.pressure.toString());
      }
    });
  });

  $("#getStatus").click(function() {
    getStatus();
  });

  $("#getMessages").click(function() {
    getMessages();
  });

  $("#post").click(function() {
    var message = {text: $("#message").val()};
    $.ajax({
      type: "POST",
      url: "/api/rooms/" + roomId + "/messages",
      data: JSON.stringify(message),
      contentType: "application/json",
      success: function() {
        $("#message").val("");
        getMessages();
      }
    });
  });

  $('body').on('click', 'a.room', function(event) {
    roomId = $(event.target).attr("data-room-id");
    getMessages();
  });

  function getStatus() {
    $.ajax({
      type: "GET",
      url: "/api/status",
      contentType: "application/json",
      success: function(data) {
        $("#status-display").val(data.status.toString());
      }
    });
  }

  function getMessages() {
    $.ajax({
      type: "GET",
      url: "/api/messages",
      success: function(data) {
        var messages = "";
        var last_p_msg = "";
        var last_s_msg = "";
        $.each(data.msglist, function(key, message) {
          messages += message + "\r";
          if (message.startsWith('Pressure [mbar]')) {
            last_p_msg = message;
          }
          if (message.match(/2:(off|on),3:(off|on),4:(off|on),5:(off|on),6:(off|on),7:(off|on),8:(off|on),9:(off|on)/)) {
            last_s_msg = message;
          }
          // use "pump_control_auto on|off" return messages?
        });
        $("#messages").val(messages);
        if (last_p_msg != "") {
          const pval = parseInt(last_p_msg.split(":")[1]);
          $("#pressure-display").val(pval.toString());
        }
        if (last_s_msg != "") {
          $("#status-display").val(last_s_msg);
          res = last_s_msg.match(/2:(off|on),3:(off|on),4:(off|on),5:(off|on),6:(off|on),7:(off|on),8:(off|on),9:(off|on)/);
           // res[i] is either 'on' or 'off'
          for (i=1; i<9; i++) {
            // todo
            if (res[i] === 'on') {
              $("#flexsw-r"+i.toString()).prop('checked', true);
            } else if (res[i] === 'off') {
              $("#flexsw-r"+i.toString()).prop('checked', false);
            }
          }
        }
      }
    });
  }

  var intervalId = setInterval(getMessages, 5000);
  $("#updsw").prop('checked', true);

  $("#updsw").click(function() {
    clearInterval(intervalId);
    if ($("#updsw").is(':checked')) {
      intervalId = setInterval(getMessages, 5000);
    }
  });

  $("#delete").click(function() {
    $.ajax({
      type: "DELETE",
      url: "/api/rooms/" + roomId + "/messages",
      success: function() {
        $("#messages").val("");
      }
    });
  });

});
