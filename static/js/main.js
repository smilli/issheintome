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

  // images
  $authImg = $("#auth-img");
  $findFriendImg = $("#find-friend-img");
  $shareImg = $('#share-img');

  $message = $('#message');

  // load fb
  (function() {
    var e = document.createElement('script'); e.async = true;
    e.src = document.location.protocol 
      + '//connect.facebook.net/en_US/all.js';
    document.getElementById('fb-root').appendChild(e);
  }());

  window.fbAsyncInit = function() {
    FB.init({ appId: '1400427420196243', 
          status: true, 
          cookie: true,
          xfbml: true,
          oauth: true});

    function updateButton(response) {
      // user is already connected
      if (response.authResponse) {
        authenticateUser(response.authResponse.accessToken);
      } else {
      // user is not connected to your app or logged out
       $authImg.click(function(e) {
          FB.login(function(response) {
            if (response.authResponse) {
                authenticateUser(response.authResponse.accessToken);
            } else {
              //user cancelled login or did not grant authorization
            }
          }, {scope:'read_mailbox'});    
        });

      }
    }

    // hide auth image & allow friend selection
    function authenticateUser(accessToken){
      // hide choose-friend img to show checkmark bg
      $authImg.animate({opacity: 0});
      $authImg.css({
        visibility: 'hidden',
        cursor: 'default'
      });
      $("#find-friend").removeClass('black');

      // remove handler for logging in
      $authImg.off();

      activateFriendSelector(accessToken);
    }

    // run once with current status and whenever the status changes
    FB.getLoginStatus(updateButton);
    FB.Event.subscribe('auth.statusChange', updateButton);    
  };

  function activateFriendSelector(accessToken){
    $findFriendImg.fSelector({
      onSubmit: function(selectedFriendIds){
        if(selectedFriendIds.length > 0){
          // get name of romantic interest and create dict romInterest w/ id & name
          FB.api('/'+selectedFriendIds[0], function(response){
            romInterest = {'id': selectedFriendIds[0], 'name': response.name};

            data = {accessToken: accessToken, romInterest: romInterest};

            $.ajax({
              type: "POST", 
              url: "/sentiment/",
              data: data,
              success: function(response){
                response = $.parseJSON

                if(response.error){
                  $message.html(response.error)      
                } else {
                  // remove handler on find-friend
                  $findFriendImg.off();

                  // hide choose-friend img to show & show pct
                  $findFriendImg.animate({opacity: 0});
                  $findFriendImg.css({
                    visibility: 'hidden',
                    cursor: 'default'
                  });
                  $("#percentage").removeClass('black');

                  var $sentiment = $('#sentiment');
                  var currentVal = $sentiment.text();
                  var endVal = response.sentiment;
                  var updatePercentage = setInterval(function(){
                    if(currentVal == endVal){
                      clearInterval(updatePercentage);
                      enableShareButton();
                      $message.html(response.message);
                    } else{
                        currentVal++;
                        $sentiment.text(currentVal);
                    }
                  }, 100);
                }
              }
            });
          });

        } else{
          $message.html('Please select someone!')
        }
      },
      facebookInvite: false,
      closeOnSubmit: true,
      max: 1,
      showButtonSelectAll: false,
      showSelectedCount: true,
      lang: {
        title: "Select a friend",
        buttonSubmit: "OK"
      } 
    });
  }

function enableShareButton(){
  $('#share').removeClass('black');

  var imgUrl = 'http://' + window.location.hostname + '/static/img/logo.png'

  $shareImg.click(function(e){ 
    FB.ui({
      method: 'feed',
      link: 'http://issheintome.herokuapp.com/',
      name: response.name + ' has a ' + endVal + '% romantic interest in me!',
      caption: response.message,
      picture: imgUrl,
      description: 'Ever wondered how your romantic interest feels about you?  Is She Into Me runs sentiment analysis on your conversations with a friend to give you an interest score.'
    }, function(response){
      if (response && response.post_id) {
        $shareImg.animate({opacity: 0});
        $shareImg.css({
          visibility: 'hidden',
          cursor: 'default'
        });
        $("#share").removeClass('black');
        $shareImg.off();
      }
    });
  });
}

/*function handleConversations(msgs){
  if(msgs.length==0){

    $message.html(romInterest.name + " hasn't talked to you in forever!  Maybe you should do something about that.  Try picking someone else.");
  
  } else{

    var text = concatenateMessages(msgs);

    // remove handler on find-friend
    $findFriendImg.off();

    // hide choose-friend img to show checkmark bg
    $findFriendImg.animate({opacity: 0});
    $findFriendImg.css({
      visibility: 'hidden',
      cursor: 'default'
    });
    $("#percentage").removeClass('black');

    // add user name to data
    data = {text: text, name: romInterest.name};
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

            var imgUrl = 'http://' + window.location.hostname + '/static/img/logo.png'

            $shareImg.click(function(e){ 
              FB.ui({
                method: 'feed',
                link: 'http://issheintome.herokuapp.com/',
                name: data.name + ' has a ' + endVal + '% romantic interest in me!',
                caption: data.message,
                picture: imgUrl,
                description: 'Ever wondered how your romantic interest feels about you?  Is She Into Me runs sentiment analysis on your conversations with a friend to give you an interest score.'
              }, function(response){
                if (response && response.post_id) {
                  $shareImg.animate({opacity: 0});
                  $shareImg.css({
                    visibility: 'hidden',
                    cursor: 'default'
                  });
                  $("#share").removeClass('black');
                  $shareImg.off();
                }
              });
            });

            $message.html(data.message);
          } else{
            currentVal++;
            $sentiment.text(currentVal);
          }
        }, 100);
      }
    });
  }
}*/


});
