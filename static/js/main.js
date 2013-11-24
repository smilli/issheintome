// django csrf token setup for ajax requests
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');

// set csrf token as a header in ajax request
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    crossDomain: false, // obviates need for sameOrigin test
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

// Initialize friend selector
TDFriendSelector.init({debug: true});

window.fbAsyncInit = function() {
  FB.init({ appId: '618524414871055', 
        status: true, 
        cookie: true,
        xfbml: true,
        oauth: true});

  function updateButton(response) {
    var button = document.getElementById('fb-auth');
        
    if (response.authResponse) {
      // put stuff to automatically show choose friends here
    } else {
      //user is not connected to your app or logged out
      button.innerHTML = 'Login';
      button.onclick = function() {
        FB.login(function(response) {
          if (response.authResponse) {
              // fade out the authentication
              $("#authentication").fadeOut(3000);

              // text of conversation
              var conversationData;

              // friend selector code
              romanceSelector = TDFriendSelector.newInstance({
                  maxSelection: 1,
                  callbackSubmit: function(selectedFriendIds) {
                      // facebook user ID of friend (romantic interest) selected
                      var romIntID = selectedFriendIds[0]
                      console.log(selectedFriendIds);
                      console.log("The following friends were selected: " + selectedFriendIds.join(", "));

                      // get conversation data of selectedfriend
                      FB.api('/me/inbox', {limit:800}, function(response){
                        console.log(response);
                        getConversationText(response.data, function(text){
                          if(status=='failure'){
                            // some response displayed to user like 'no messages available for selected friend'
                          } else{
                            // ajax to get sentiment value of text
                            $.ajax({
                              type: "POST",
                              url: "/sentiment/",
                              data: text,
                              success: function(data) {
                                console.log(data)
                              }
                            });
                          }
                        });

                        function getConversationText(convos, cb){
                          for (var i = 0; i < convos.length; i++){
                            // if there are only two people in this conversation
                            if (convos[i].to.data.length == 2){
                              // if the romantic interest is in the conversation
                              if (convos[i].to.data[0].id==romIntID || convos[i].to.data[1].id==romIntID){
                                // change this to only return data from 
                                var messages = convos[i].comments.data;

                                // concatenate all messages from romantic interest into big blob of text
                                var text = '';
                                for (var i = 0; i < messages.length; i++){
                                  if (messages[i].from.id==romIntID){
                                    text += ' ' + messages[i].message;
                                  }
                                }

                                // call callback with text as parameter
                                cb({text: text, status: 'success'});
                                return;
                              }
                            }
                          }
                          cb({status:'failure'});
                        }
                      });
                  }
              });

              $("#choose-friend").click(function (e) {
                  e.preventDefault();
                  romanceSelector.showFriendSelector();
              });
          } else {
            //user cancelled login or did not grant authorization
          }
        }, {scope:'read_mailbox'});    
      }
    }
  }

  // run once with current status and whenever the status changes
  FB.getLoginStatus(updateButton);
  FB.Event.subscribe('auth.statusChange', updateButton);    
};
    
(function() {
  var e = document.createElement('script'); e.async = true;
  e.src = document.location.protocol 
    + '//connect.facebook.net/en_US/all.js';
  document.getElementById('fb-root').appendChild(e);
}());






