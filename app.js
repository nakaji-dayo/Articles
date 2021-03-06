var express = require('express'),
    app = express.createServer();
var config = require('config');
var Article = require('./models/article.js');
var Tag = require('./models/tag.js');
var Auth = require('./modules/auth.js').
    init(config.oauth.key,config.oauth.secret,config.blog.base_url+'/login/twitter',config.blog.users);

app.configure(function(){
	var oneYear = 31557600000;
	app.use(express.static(__dirname + '/public',{maxAge: oneYear}));
	app.use(express.errorHandler());
	app.use(express.bodyParser());
	app.use(express.methodOverride());

	app.use(express.cookieParser());
	var mongoStore = require('connect-mongodb');
	app.use(express.session({secret:config.session.secret,
			store: new mongoStore({url:config.db.connection}),
			cookie:{maxAge:config.session.age} }));
    });

function layout(req, res, next){
    Article.find({draft:{$ne:true}},['title','url']).
	sort('update_date','desc').limit(config.blog.show_updates).run(function(err, docs){
		Tag.find(function(tag_err, tags){
			app.set('view options', {
				config:config,
				title:config.blog.title,
				    updates: docs,
				    tags: tags,
				    user: req.session.user
				    });
			next();
		    });
	    });
}

app.get('/', layout, function(req, res){
	Article.find({draft:{$ne:true}}).
	    sort('reg_date','desc').limit(config.blog.show_index).run(function(err, docs){
		    res.render('index.jade',{docs:docs});
		});
    });

app.get('/new', Auth.auth('root'), layout,  function(req, res){
	res.render('new.jade');
    });
app.get('/edit/:url', Auth.auth('root'), layout, function(req, res){
	Article.findOne({url:req.params.url},function(err, doc){
		res.render('edit.jade',{doc:doc});
	    });
    });
app.get('/search', layout, function(req, res){
	var tag = req.query.tag;
	if(tag){
	    Article.find({tags : tag}).sort('reg_date','desc').run(function(err, docs){
		    res.render('index.jade',{docs:docs});
		});
	}else{
	    res.redirect('/');
	}
    });

app.get('/login/twitter', Auth.get);

app.get('/:url', layout, function(req,res){
	Article.findOne({url:req.params.url}, function(err, doc){
		if(err || !doc){
		    res.end('article not found');
		}else{
		    res.render('view.jade',{doc:doc,url:req.params.url,
				title:doc.title + ' - ' + config.blog.title,
				trackback:config.blog.base_url+'/trackback/'+req.params.url});
		}
	    });
    });

app.post('/', Auth.auth('root'), layout, function(req, res){
	var article = new Article();
	article.title = req.body.title;
	article.url = req.body.url;
	article.code = req.body.code;
	article.tags = req.body.tags.split(',');
	article.draft = !!req.body.draft;
	article.save(function(err){
		Tag.countingTags();
		res.render('posted.jade',{doc:article, err:err});
	    });
    });

app.put('/:url', Auth.auth('root'), layout, function(req, res){
	Article.findOne({url:req.params.url},function(err, doc){
		doc.title = req.body.title;
		doc.code = req.body.code;
		doc.tags = req.body.tags.split(',');
		doc.draft = !!req.body.draft;
		doc.save(function(err){
			Tag.countingTags();
			res.render('posted.jade',{doc:doc, err:err});
		    });
	    });
    });

app.post('/trackback/:url',function(req,res){
	console.log('posted trackback');
	var t = {};
	t.title = req.body.title;
	t.excerpt = req.body.excerpt;
	t.url = req.body.url;
	t.blog_name = req.body.blog_name;
	if(!(t.title && t.url && t.blog_name)){
	    res.render('trackback/error.jade',{layout:null, message:'title,url,blog_name is required'});
	    return;
	}
	t.title = t.title.substring(0, 30);
	t.excerpt = t.excerpt ? t.excerpt.substring(0, 200):'';
	t.url = t.url.substring(0, 100);
	t.blog_name = t.blog_name.substring(0, 30);
	Article.update({url:req.params.url},{$push:{trackbacks:t}},
		       {upsert:false,multi:false},function(err){
			   if(err){
			       res.render('trackback/error.jade',{layout:null, message:'server error'});
			       return;
			   }
			   res.render('trackback/success.jade',{layout:null});
		       });
    });

app.listen(config.port);
console.log('listen '+config.port);
