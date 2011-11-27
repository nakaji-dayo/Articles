
exports.escape = function(str){
    str = str.replace(/&/g,'&amp;');

    str = str.replace(/</g,'&lt;');
    str = str.replace(/>/g,'&gt;');
    return str;
};

exports.parse = function(str){
    for(var k in phrases){
	str = str.replace(new RegExp(k,'g'),phrases[k]);
    }
    var lines = str.split('\n');
    var r='';
    for(var i=0;i<lines.length;i++){
	var line = lines[i];
	line = line.replace(/\n/g,'').replace(/\r/g,'');
	if(line=='')
	    continue;
	if(inArray(line.replace(/\(.*\)/,'').replace(/^ */,''),tags)){
	    var result = line.match(/(.*)\((.*)\)/,'');
	    indent = line.match(/(^ *)/,'');
	    if(indent){
		indent = indent[1].length;
	    }else{
		indent = 0;
	    }
	    if(!result){
		result=[];
		result[1] = line;
	    }
	    result[1] = result[1].replace(/^ */,'');
	    while(stack[0] && stack[0].indent >= indent){
		var end = stack.shift();
		r += '</'+end.tag+'>';
	    }
	    r += '<' + result[1] + (result[2] ? ' '+result[2]:'') + '>';
	    stack.unshift({indent:indent,tag:result[1]});
	    lines[i] = '';
	}
	if(line.replace(/\(.*\)/,'').replace(/^ */,'') == '##'){
	    indent = line.match(/(^ *)/,'');
	    if(indent){
		indent = indent[1].length;
	    }else{
		indent = 0;
	    }
	    while(stack[0] && stack[0].indent >= indent){
		var end = stack.shift();
		r += '</'+end.tag+'>';
		lines[i] = '';
	    }
	}
	r += lines[i];
    }
    while(stack[0]){
	var end = stack.shift();
	r += '</'+end.tag+'>';
    }
    return r;
};

var tags = ['h3','h4','h5','h6',
	    'p','b','small',
	    'div','span',
	    'table','tr','th','td',
	    'ul','ol','li',
	    'dl','dt','dd',
	    'code','pre','q',
	    'a','img','br'];
var phrases = {
    '##{code:(.*)}':'pre(class="brush:$1")'
};

var stack=[];

function inArray(v,arr){
    for(var i=0;i<arr.length;i++){
	if(arr[i]==v)
	    return true;
    }
    return false;
}
