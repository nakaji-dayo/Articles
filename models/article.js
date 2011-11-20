var mongoose = require('mongoose');
var parser = require('../modules/parser.js');
mongoose.connect('mongodb://localhost/article');

var Article = new mongoose.Schema({
	title : {type:String, required:true},
	url : {type:String, unique:true, required:true},
	contents : String,
	code : String,
	tags : [String],

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
