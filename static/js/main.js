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

              // ID of romantic interest
              var romIntID;

              // friend selector code
              TDFriendSelector.init({debug: true});
              romanceSelector = TDFriendSelector.newInstance({
                  maxSelection: 1,
                  callbackSubmit: function(selectedFriendIds) {
                      romIntID = selectedFriendIds[0]
                      console.log(selectedFriendIds);
                      console.log("The following friends were selected: " + selectedFriendIds.join(", "));
                  }
              });

              $("#choose-friend").click(function (e) {
                  e.preventDefault();
                  romanceSelector.showFriendSelector();
              });

              // look up conversations with romantic interest
              accessToken = response.authResponse.accessToken;
              var userID;
              FB.api('/me/inbox', {limit:800}, function(response){
                for (var i = 0; i < response.length; i++){
                  // if there are only two people in this conversation
                  if (response[i].to.data.length == 2){
                    if (response[i].to.data[0]==romIntID || response[i].to.data[1]==romIntID){
                      // change this to only return data from 
                      console.log(response[i].comments.data)
                    }
                  }
                }
              })
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






