
exports.escape = function(str){
    str = str.replace(/&/g,'&amp;');

    str = str.replace(/</g,'&lt;');
    str = str.replace(/>/g,'&gt;');
    return str;
};

exports.parse = function(str){
    var lines = str.split('\n');
    var r='';
    for(var i=0;i<lines.length;i++){
	var words = lines[i].split(' ');
	for(var j=0;j<words.length;j++){
	    var word = words[j];
	    word = word.replace(/\n/g,'').replace(/\r/g,'');
	    if(word=='')
		continue;
	    if(inArray(word,tags)){
		while(stack[0] && stack[0].indent >= j){
		    var end = stack.shift();
		    r += '</'+end.tag+'>';
		}
		r += '<'+word+'>';
		stack.unshift({indent:j,tag:word});
		words[j] = '';
		continue;
	    }
	    break;
	}
	lines[i] = words.join(' ');
	r += lines[i];
    }
    while(stack[0]){
	var end = stack.shift();
	r += '</'+end.tag+'>';
    }
    return r;
};

var tags = ['p','div','span','h2','h3','h4','h5','h6'];
var stack=[];

function inArray(v,arr){
    for(var i=0;i<arr.length;i++){
	if(arr[i]==v)
	    return true;
    }
    return false;
}
