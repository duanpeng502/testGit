define(function(require,exports,module){
	// var backbone = require('backbone');
	// (function($){
		// 创建一个World对象，拥有name属性
		World = Backbone.Model.extend({
			name : null
		});

		var Man = Backbone.Model.extend({
			initialize : function(){
				// alert('message');
				this.bind('change:name',function(){
					var name = this.get('name');
					// alert('你改变了name属性为：'+name);
				});

				this.bind('invalid',function(model,error){
					console.log(model);
					console.log(error);
				});
			},

			defaults : {
				name : 'duanpeng',
				age : "24"
			},

			validate : function(attributes){
				if(attributes.name == ''){
					return 'name不能为空!'
				}
				console.log('validate')
			},


			aboutMe : function(){
				return '我的名字叫'+this.get('name');
			}
		});

		Worlds = Backbone.Collection.extend({
			// world对象的集合

			initialize : function (models,options){
				this.bind('add',options.view.addOneWorld);
				console.log(options,'this')
			},

		});

		AppView = Backbone.View.extend({
			el: $('body'),
			initialize : function(){
				// 构造函数,实例化一个world集合类，并且以字典方式传入AppView的对象
				this.worlds = new Worlds(null,{view:this});
			},

			events : {
				'click #check' : 'checkin',//事件绑定,绑定DOM中Id为check的元素 
			},

			checkin : function (){
				var world_name = prompt("where are U from?");
				if(world_name == '') world_name = '未知';
				var world = new World({name:world_name});
				this.worlds.add(world);
				console.log(this.worlds,'worlds');
				
			},

			addOneWorld : function(model){
				$("#world-list").append("<li>这是来自"+model.get('name')+"星球的问候:hello world</li>");

			}

		});
		//实例化AppView
		var appview = new AppView;
		var world = new World;
		var man = new Man;
		console.log('hello world');
		man.set({name:''});
		man.save();
	// })(jQuery);

	module.exports = man;
});