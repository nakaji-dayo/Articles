var oauth = new (require('oauth').OAuth)(
					 'https://api.twitter.com/oauth/request_token',
					 'https://api.twitter.com/oauth/access_token',
					 'ccS7TKr24KagpezVoKhWYA', // consumer key
					 'jSw4as7zeGLWZgFwO8M1RMTt23b5Z1JtmTdJyrSZIg', // consumer secret
					 '1.0',
					 process.env.NODE_ENV === 'production'?
					 'http://articles.nakaji.me/login/twitter':
					 'http://127.0.0.1:54134/login/twitter', // callback URL
					 'HMAC-SHA1'
					 );

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

var users = [
	     {name:'nakaji_dayo', group:'root'}
];
