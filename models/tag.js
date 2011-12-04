var mongoose = require('mongoose');
var config = require('config');

mongoose.connect(config.db.connection);

var Tag = new mongoose.Schema({
	_id : {type:String, required:true},
	value : Number
    });

mongoose.model('Tag', Tag);


module.exports = mongoose.model('Tag');
module.exports.countingTags = function(){
	cmd = {
	    "mapreduce" : "articles",
	    "map" : function() {
		if (!this.tags) {
		    return;
		}
		for (index in this.tags) {
		    emit(this.tags[index], 1);
		}
	    },
	    "reduce" : function(previous, current) {
		var count = 0;
		for (index in current) {
		    count += current[index];
		}
		return count;
	    },
	    "out" : "tags"};
	mongoose.connection.db.executeDbCommand(cmd, function(err,dbres){
		console.log(err);
		console.log(dbres);
	    });
};
