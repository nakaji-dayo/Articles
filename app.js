var express = require('express'),
    app = express.createServer();
var Article = require('./models/article.js');

app.configure(function(){
	var oneYear = 31557600000;
	app.use(express.static(__dirname + '/public',{maxAge: oneYear}));
	app.use(express.errorHandler());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
    });


app.get('/', function(req, res){
	Article.find({}).sort('reg_date','desc').run(function(err, docs){
		res.render('index.jade',{docs:docs});
		});

    });

app.get('/new', function(req, res){
	res.render('new.jade');
    });
app.get('/edit/:url', function(req, res){
	Article.findOne({url:req.params.url},function(err, doc){
		res.render('edit.jade',{doc:doc});
	    });
    });

app.get('/:url', function(req,res){
	Article.findOne({url:req.params.url}, function(err, doc){
		if(err || !doc)
		    res.end('article not found');
		else
		    res.render('view.jade',{doc:doc});
	    });
    });
app.post('/', function(req, res){
	var article = new Article();
	article.title = req.body.title;
	article.url = req.body.url;
	article.code = req.body.code;

	article.save(function(err){
		res.render('posted.jade',{doc:article, err:err});
	    });
    });
app.put('/:url', function(req, res){
	Article.findOne({url:req.params.url},function(err, doc){
		doc.code = req.body.code;
		doc.save(function(err){
			res.render('posted.jade',{doc:doc, err:err});
		    });
	    });
    });

app.listen(54134);
console.log('listen 54134');
