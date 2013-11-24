window.fbAsyncInit = function() {
  FB.init({ appId: '618524414871055', 
        status: true, 
        cookie: true,
        xfbml: true,
        oauth: true});

  function updateButton(response) {
    var button = document.getElementById('fb-auth');
        
    if (response.authResponse) {
      //user is already logged in and connected
      var userInfo = document.getElementById('user-info');
      FB.api('/me', function(response) {
        userInfo.innerHTML = '<img src="https://graph.facebook.com/' 
      + response.id + '/picture">' + response.name;
        button.innerHTML = 'Logout';
      });
      button.onclick = function() {
        FB.logout(function(response) {
          // put stuff to do after user is logged out
    });
      };
    } else {
      //user is not connected to your app or logged out
      button.innerHTML = 'Login';
      button.onclick = function() {
        FB.login(function(response) {
          if (response.authResponse) {
              $("#authentication").fadeOut(3000);
              accessToken = response.authResponse.accessToken;
              var userID;
              FB.api('/me', function(response) {
                userID = response.id
              });    
              FB.api('/me/inbox', {limit:800}, function(response){
                for (var i = 0; i < response.length; i++){
                  // if there are only two people in this conversation
                  if (response[i].to.data.length == 2){
                    if (response[i].to.data[0]==romIntID or response[i].to.data[1]==romIntID){
                      // change this to only return data from 
                      return response[i].comments.data
                    }
                  }
                }
              })
              FB.api('/me/friends', function(response){
                console.log(response);
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






