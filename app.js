var express = require('express'),
    app = express.createServer();
var Article = require('./models/article.js');
var Tag = require('./models/tag.js');

app.configure(function(){
	var oneYear = 31557600000;
	app.use(express.static(__dirname + '/public',{maxAge: oneYear}));
	app.use(express.errorHandler());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	//app.use(side());
    });

function layout(req, res, next){
    Article.find({},['title','url']).sort('update_date','desc').run(function(err, docs){
	    Tag.find(function(tag_err, tags){
		    console.log(tag_err);
		    app.set('view options', {
			    updates: docs,
				tags: tags
				});
		    next();
		});
	});
}

app.get('/', layout, function(req, res){
	Article.find({}).sort('reg_date','desc').run(function(err, docs){
		docs.forEach(function(doc){
			doc.
		    });
		res.render('index.jade',{docs:docs});
		});
    });

app.get('/new', layout,  function(req, res){
	res.render('new.jade');
    });
app.get('/edit/:url', layout, function(req, res){
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


app.get('/:url', layout, function(req,res){
	Article.findOne({url:req.params.url}, function(err, doc){
		if(err || !doc){
		    res.end('article not found');
		}else{
		    res.render('view.jade',{doc:doc});
		    console.log();
		}
	    });
    });

app.post('/', layout, function(req, res){
	var article = new Article();
	article.title = req.body.title;
	article.url = req.body.url;
	article.code = req.body.code;
	article.tags = req.body.tags.split(',');
	article.save(function(err){
		Tag.countingTags();
		res.render('posted.jade',{doc:article, err:err});
	    });
    });

app.put('/:url', layout, function(req, res){
	Article.findOne({url:req.params.url},function(err, doc){
		doc.title = req.body.title;
		doc.code = req.body.code;
		doc.tags = req.body.tags.split(',');
		doc.save(function(err){
			Tag.countingTags();
			res.render('posted.jade',{doc:doc, err:err});
		    });
	    });
    });

app.listen(54134);
console.log('listen 54134');
