var mongoose = require('mongoose');
var parser = require('../modules/parser.js');
var config = require('config');

mongoose.connect(config.db.connection);

var Trackback = new mongoose.Schema({
	title:String,
	excerpt:String,
	url:String,
	blog_name:String
    });

var Article = new mongoose.Schema({
	title : {type:String, required:true},
	url : {type:String, unique:true, required:true},
	contents : String,
	code : String,
	tags : [String],
	trackbacks : [Trackback],
	draft : Boolean,

	reg_date : {type:Date, default: Date.now},
	update_date : Date
    });

Article.pre('save', function(next){
	this.code = parser.escape(this.code);
	this.contents = parser.parse(this.code);
	this.update_date = Date.now();
	next();
    });
mongoose.model('Article', Article);


module.exports = mongoose.model('Article');
