define(function(require, exports, module){
	
	var model = {};
	
	var content = Backbone.Model.extend({
		'url': '/apiv5/index.php?r=resource/resourceFolder/Content'
	    //'url': '/dev-yii/www/api-new/index.php?r=ebag/user/getInfo'
	});
	module.exports = new content();
});