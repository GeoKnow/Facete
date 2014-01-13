var acToken;
var tokenType;
var expiresIn;
var user;
var loggedIn = false;
// var REDIRECT = 'http://127.0.0.1:8020/verilinks-server/oauth.html';
var REDIRECT = 'http://verilinks.aksw.org/oauth.html';
var VALIDURL;
// Google
var login_google = {
	'oauthUrl' : 'https://accounts.google.com/o/oauth2/auth?',
	'validUrl' : 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=',
	// 'clientId' : '23285137063-h9ddnqshh1924a3808n78sgkdvfskjme.apps.googleusercontent.com',
	'clientId' : '23285137063-mtsfum2dvllv8vet4cbrm45r4bdfoaa4.apps.googleusercontent.com',
	'logout' : 'http://accounts.google.com/Logout',
	'scope' : 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
	'type' : 'token'
};
// facebook
var login_facebook = {
	oauthUrl : 'https://www.facebook.com/dialog/oauth?',
	validUrl : 'https://graph.facebook.com/me?access_token=',
	// clientId : '468976209814720',
	clientId : '469580306410500',
	logout : 'https://www.facebook.com/logout.php?next=' + REDIRECT + '&access_token=',
	scope : 'email',
	type : 'token'
};

function getLogin() {
	var login = $("#login").val();
	var url;
	if (login == 'facebook') {
		url = login_facebook.oauthUrl + 'scope=' + login_facebook.scope + '&client_id=' + login_facebook.clientId + '&redirect_uri=' + REDIRECT + '&response_type=' + login_facebook.type
		VALIDURL = login_facebook.validUrl;
	} else {
		url = login_google.oauthUrl + 'scope=' + login_google.scope + '&client_id=' + login_google.clientId + '&redirect_uri=' + REDIRECT + '&response_type=' + login_google.type
		VALIDURL = login_google.validUrl;
	}
	return url;
}

function login() {
	var url = getLogin();
	var win = window.open(url, "windowname1", 'width=800, height=600');

	var pollTimer = window.setInterval(function() {
		try {
			console.log(win);
			console.log(win.document);
			console.log(win.document.URL);
			if (win.document.URL.indexOf(REDIRECT) != -1) {
				window.clearInterval(pollTimer);
				var url = win.document.URL;
				acToken = gup(url, 'access_token');
				tokenType = gup(url, 'token_type');
				expiresIn = gup(url, 'expires_in');
				win.close();

				validateToken(acToken);
			}
		} catch(ex) {
		}
	}, 500);
}

function validateToken(token) {
	$.ajax({
		url : VALIDURL + token,
		data : null,
		success : function(responseText) {
			getUserInfo(responseText);
			loggedIn = true;
			showUser();
			showAdmin();
		},
		dataType : "jsonp"
	});
}

function getUserInfo(response) {
	if (response == null) {
		alert("Login error!");
		return;
	}
	// facebook
	if ($("#login").val() == 'facebook') {
		// name
		$('#userName').text('Name: ' + response.name);
		// mail
		$('#userMail').text('Mail: ' + response.email);
		// profile picture
		$.ajax({
			url : 'http://graph.facebook.com/' + response.username + '/picture',
			data : null,
			success : function(pic) {
				$('#userPicture').attr('src', pic.data.url);
			},
			dataType : "jsonp"
		});
	} else// google
		$.ajax({
			url : 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + acToken,
			data : null,
			success : function(resp) {
				// name
				$('#userName').text('Name: ' + resp.name);
				// mail
				$('#userMail').text('Mail: ' + resp.email);
			},
			dataType : "jsonp"
		});
}

//credits: http://www.netlobo.com/url_query_string_javascript.html
function gup(url, name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\#&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(url);
	if (results == null)
		return "";
	else
		return results[1];
}

function startLogoutPolling() {
	loggedIn = false;
	$('#userPanel').hide();
	// enable
	$('#loginPanel :input').removeAttr('disabled');
	// change text
	$(".button-big").text('Login');
	$(".button-big").removeAttr('onCLick');
	setTimeout('$(".button-big").click(function() {login();})', 2000);

}

function showUser() {
	$('#userPanel').show();
	// disable
	$('#loginPanel :input').attr('disabled', true);

	// logout
	$(".button-big").text('Logout');
	$(".button-big").removeAttr('onCLick');
	$(".button-big").click(function() {
		if ($('#login').val() == 'google')
			myIFrame.location = login_google.logout;
		else
			myIFrame.location = login_facebook.logout + acToken;
		startLogoutPolling();
		return false;
	});
}

function showAdmin() {

}
