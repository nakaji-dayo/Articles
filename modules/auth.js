var oauth;
var users = [];
exports.init = function(key,secret,url,user_settings){
    oauth = new (require('oauth').OAuth)(
					     'https://api.twitter.com/oauth/request_token',
					     'https://api.twitter.com/oauth/access_token',
					     key,
					     secret,
					     '1.0',
					     url,
					     'HMAC-SHA1'
					     );
    users = user_settings;
    return this;
}


exports.get = function(req, res) {
    var oauth_token    = req.query.oauth_token;
    var oauth_verifier = req.query.oauth_verifier;
    if (oauth_token && oauth_verifier && req.session.oauth) {
	oauth.getOAuthAccessToken(
				  oauth_token, null, oauth_verifier,
				  function(error, oauth_access_token, oauth_access_token_secret, results) {
				      if (error) {
					  res.send(error, 500);
				      } else {
					  req.session.user = results.screen_name;
					  res.redirect('/');
				      }
				  }
				  );
    } else {
	oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
		if (error) {
		    res.send(error, 500);
		} else {
		    req.session.oauth = {
			oauth_token: oauth_token,
			oauth_token_secret: oauth_token_secret,
			request_token_results: results
		    };
		    res.redirect('https://api.twitter.com/oauth/authorize?oauth_token=' + oauth_token);
		}
	    });
    }
};

exports.auth = function(groups){
    if(!(groups instanceof Array)){
	var group = groups;
	groups = new Array();
	groups[0] = group;
    }
    return function(req, res, next){
	if(req.session.user){
	    var user = null;
	    for(var i=0;i<users.length;i++){
		if(users[i].name === req.session.user){
		    user = users[i];
		    break;
		}
	    }
	    if(user){
		for(var i=0;i<groups.length;i++){
		    if(user.group === groups[i]){
			return next();
		    }
		}
	    }
	}
	res.send('Unauthorized',401)
    };
}
