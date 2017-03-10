//init
define(function(require,exports,module){
	//import library
	// var $ = require('./jquery-1.12.4.min.js');
	var data = require('./data');
	var css = require('css');
	var under = require('underscore');
	// var tpl = require('mytpl')
	var sText = require('seajs-text');
	var backbone = require('backbone');
	var kindeitor =require('kindeitor');
	// var news = require('./new')

	$('.nav').append('<span>'+data.author+'</span>');
	$('.nav').append('<span>'+data.age+'</span>');
	console.log(data,'x');

	
	var duanpeng = {
		name :'duanpeng',
		hello : function(){
			console.log('x')
		},
	}

	require.async('./newindex.html',function(tpl){

		var dp ='ss';

		var html = _.template(tpl,{"dp":dp});
		$('.test').html(html)
	})



	module.exports = duanpeng;
});