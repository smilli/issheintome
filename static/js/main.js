$(document).ready(function(){
  // using jQuery
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

  // images
  $authImg = $("#auth-img");
  $findFriendImg = $("#find-friend-img");
  $shareImg = $('#share-img');

  $message = $('#message');

  // friend selector code (and basically everything else in the callbacks)
  romanceSelector = TDFriendSelector.newInstance({
      maxSelection: 1,
      callbackSubmit: function(selectedFriendIds) {
          // hide choose-friend img to show checkmark bg
          $findFriendImg.animate({opacity: 0});
          $("#percentage").removeClass('black');

          // get name of romantic interest and create dict romInterest w/ id & name
          FB.api('/'+selectedFriendIds[0], function(response){
            romInterest = {'id': selectedFriendIds[0], 'name': response.name};
          });

          // get conversation data of selectedfriend
          FB.api('/me/inbox', {limit:20}, function(response){
            getConversationText(response.data, function(data){
              console.log(data);
              if(data.status=='failure'){
                $message.innerHTML = "You haven't even talked to " + data.name + " in forever!";
              } else{
                // ajax to get sentiment value of text
                $.ajax({
                  type: "POST", 
                  url: "/sentiment/",
                  data: data,
                  success: function(data) {
                    // animate sentiment percentage update
                    data = $.parseJSON(data);
                    var $sentiment = $('#sentiment');
                    var currentVal = $sentiment.text();
                    var endVal = data.sentiment;
                    var updatePercentage = setInterval(function(){
                      if(currentVal == endVal){
                        clearInterval(updatePercentage);
                        $('#share').removeClass('black');

                        $shareImg.click(function(e){ 
                          FB.ui({
                            method: 'feed',
                            link: 'http://issheintome.herokuapp.com/',
                            caption: data.name + ' has a ' + endVal + '% romantic interest in me!',
                          }, function(response){
                            if (response && response.post_id) {
                              $shareImg.animate({opacity: 0});
                              $("#share").removeClass('black');
                            }
                          });
                        })
                      } else{
                        currentVal++;
                        $sentiment.text(currentVal);
                      }
                    }, 100);
                  }
                });
              }
            });

            function getConversationText(convos, cb){
              for (var i = 0; i < convos.length; i++){
                // if there are only two people in this conversation
                if (convos[i].to.data.length == 2){
                  // if the romantic interest is in the conversation
                  if (convos[i].to.data[0].id==romInterest.id || convos[i].to.data[1].id==romInterest.id){
                    // change this to only return data from 
                    var messages = convos[i].comments.data;

                    // concatenate all messages from romantic interest into big blob of text
                    var text = '';
                    for (var i = 0; i < messages.length; i++){
                      if (messages[i].from.id==romInterest.id){
                        text += ' ' + messages[i].message;
                      }
                    }

                    // call callback with text as parameter
                    cb({text: text, status: 'success', name: romInterest.name});
                    return;
                  }
                }
              }
              cb({status:'failure', name: romInterest.name});
            }
          });
      }
  });

  window.fbAsyncInit = function() {
    FB.init({ appId: '618524414871055', 
          status: true, 
          cookie: true,
          xfbml: true,
          oauth: true});

    function updateButton(response) {
      var button = document.getElementById('auth-img');
          
      if (response.authResponse) {
        // hide auth img to show checkmark bg
        $authImg.animate({opacity: 0});
        $("#find-friend").removeClass('black');

        $findFriendImg.click(function (e) {
            e.preventDefault();
            romanceSelector.showFriendSelector();
        });

      } else {
        //user is not connected to your app or logged out
        button.innerHTML = 'Login';
        button.onclick = function() {
          FB.login(function(response) {
            if (response.authResponse) {
                // hide choose-friend img to show checkmark bg
                $authImg.animate({opacity: 0});
                $("#find-friend").removeClass('black');

                $findFriendImg.click(function (e) {
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

});





