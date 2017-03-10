/**
* Qti-Html编辑器
*/
function htmlEditor(p){
    this.opts = p.opts;
	this.qtype = p.qtype;//试题类型
	this.events = typeof  p.events[this.qtype]  == 'undefined' ? {} : p.events[this.qtype];//自定义事件
	this.onCreateEvents = typeof  p.onCreateEvents[this.qtype]  == 'undefined' ? {} : p.onCreateEvents[this.qtype];//创建前执行事件
	this.afterLoadEvents = typeof  p.afterLoadEvents[this.qtype]  == 'undefined' ? {} : p.afterLoadEvents[this.qtype];//创建后执行事件
	this.custommemus = typeof  p.custommemus[this.qtype]  == 'undefined' ? {} : p.custommemus[this.qtype];//自定义菜单
	this.pluginMethods = typeof  p.pluginMethods[this.qtype]  == 'undefined' ? {} : p.pluginMethods[this.qtype];//自定义插件事件
	this.editorPlugins = typeof  p.editorPlugins[this.qtype]  == 'undefined' ? {} : p.editorPlugins[this.qtype];//自定义插件
	this.afterFormat = typeof  p.afterFormatMethods[this.qtype]  == 'undefined' ? function(data){return data;} : p.afterFormatMethods[this.qtype];
	this.formatDataMethod = {};
	this.validMethods = p.validMethods;
	this.doc = null;
	this.inited = false;
	this.parent = p;
	var id = '';//编辑器ID

	//启动编辑器
	this.run = function(){
		this.create();
	}
	
	//创建编辑器
	this.create = function(){
	    this.initParam();
	    this.createTextarea();
		this.initCustomPlugin();
	    this.initMenu();
		this.initPlugin();
		this.show();
	};
	
	this.initParam = function(){
	    KE.parent = this;
	}
	
	//销毁编辑器(销毁编辑器可移除KE的事件,或者会报错)
	this.destroy = function(){
	    KE.remove(id);
	}
	
	//创建输入框 
	this.createTextarea = function(){
	    //生成ID
		id = 'html-editor-' + p.qtiBox.attr('index');
		$('<textarea id='+id+' class="templete">').appendTo(p.qtiBox).height(p.qtiBox.height());
	}
	
	//调整编辑器
	this.resize = function(css){
	     var t = $(KE.g[id].iframe);
		 if(t.length){
		    KE.util.resize(id , css.width + 'px' , p.qtiBox.height() - 20 + 'px');
			$.extend(css , {'borderTopWidth': '0' , 'borderBottomWidth': '0' , 'height' : parseInt(KE.g[id].height) - p.plug.getToolbarHeight()});
			t.css(css);
		 }
	}
	
    //配置菜单
	this.initMenu = function(){
	    KE.setting.toolbarLineHeight = 38;
	    KE.lang['preview'] = '预览';
		KE.lang['save'] = '保存当前修改';
		KE.lang['submit'] = '提交';
		KE.lang['addQti'] = '新增试题';
		KE.lang['insert_selcel_pos'] = '插入答案显示点';
		KE.lang['insert_tk_space'] = '插入填空点';
		KE.lang['fmath_formula'] = '公式';
		KE.lang['audio'] = '音频';
		KE.lang['video'] = '视频';
		KE.lang['cutover'] = '切换题型';
		KE.lang['specialchar'] = '特殊字符';
		KE.lang['numberedlist'] = '编号列表';
		KE.lang['bulletedlist'] = '项目列表';
		KE.lang['material'] = '插入图片';
		KE.lang['imagenone'] = '默认';
		KE.lang['imageleft'] = '左环绕';
		KE.lang['imageright'] = '右环绕';
		KE.lang['imagecenter'] = '居中';
		KE.lang['pinyin'] = '汉字转拼音';
		KE.lang['myfontsize'] = '汉字转拼音';
		KE.lang['shape'] = '插入形状';
		KE.lang['bfill'] = '填充形状颜色';
		KE.lang['bcolor'] = '设置边框颜色';
		
		/*
	    KE.setting.items = [
			'image','|', 'justifyleft', 'justifycenter','sindent', 'soutdent', 'subscript','superscript','fmath_formula','title', 'fontname', 'fontsize', '|', 'textcolor', 'bgcolor', 'bold',
		    'italic', 'underline', 'strikethrough','advtable','link', 'unlink', 'wordpaste','removeformat','-','undo', 'redo'
		];
		*/
		KE.setting.items = [['undo', 'redo','-','cut','copy'] , ['|'] , ['plainpaste'] , ['myfontsize','bold','italic', 'underline', '-' , 'strikethrough','subscript','superscript','removeformat','textcolor', 'bgcolor'],['numberedlist','bulletedlist','soutdent','sindent','-','justifyleft', 'justifycenter', 'justifyright', 'justifyfull'],['imagenone','imageleft','-','imageright','imagecenter'],['image','audio','video'],['shape'],['|'],['bfill','-','bcolor'],['advtable','link','specialchar','formula','pinyin'] ];
		
		KE.buttons = [];
		KE.buttons['preview'] = '预览';
		KE.buttons['submit'] = '提交';
		KE.buttons['fontname'] = '<span class="ke-v v">微软雅黑</span><span class="ke-more"></span>';
		KE.buttons['fontsize'] = '<span class="ke-v v">14px</span><span class="ke-more"></span>';
		KE.buttons['myfontsize'] = '<span class="ke-v v">字号(小)</span><span class="ke-more"></span>';
		KE.buttons['specialchar'] = true;
		KE.buttons['shape'] = true;
		
		KE.buttons['image'] = '<span class="icon"></span><span class="text">图片</span>';
		KE.buttons['audio'] = '<span class="icon"></span><span class="text">音频</span>';
		KE.buttons['video'] = '<span class="icon"></span><span class="text">视频</span>';
		KE.buttons['advtable'] = '<span class="icon"></span><span class="text">表格</span>';
		KE.buttons['link'] = '<span class="icon"></span><span class="text">超链接</span>';
		KE.buttons['formula'] = '<span class="icon"></span><span class="text">公式编辑器</span>';
		//KE.buttons['wordpaste'] = '<span class="icon"></span><span class="text">粘贴</span>';
		KE.buttons['plainpaste'] = '<span class="icon"></span><span class="text">粘贴</span>';
		KE.buttons['pinyin'] = '<span class="icon"></span><span class="text">汉字转拼音</span>';
		
		KE.classNames = [];
		KE.classNames['preview'] = 'preview';
		KE.classNames['submit'] = 'submit';
		
		
        if(this.custommemus.length > 0){
		    $.each(this.custommemus , function(i , v){
			    //KE.setting.items.push(v);
			});
		}
		
		//if(!p.mode)KE.setting.items.push('cutover');
		$.each(p.menubar , function(i , name){
		   // KE.setting.items.push(name);
		});
		
	    $.extend(KE.setting , this.opts.setting);
	}
	
	//显示编辑器
	this.show = function(){
	    var _self = this;
	    KE.show({
			id : id,
			width: '100%',
			skinsPath:_self.opts.basePath+'/site/js/qti/rmaker/kindeditor/skins/',
			pluginsPath:_self.opts.basePath+'/site/js/qti/rmaker/kindeditor/plugins/',
			afterCreate: function(id) {
				_self.afterCreate(id);
			}
		});
	}
	
	//实例化自定义插件
	this.initPlugin = function(){
	     $.each(this.plugin , function(name , f){
		     if(typeof KE.plugin[name] == 'undefined'){
			     KE.plugin[name] = f;
			 }else{
		         $.extend(KE.plugin[name] , f);
			 }
		 });
	}
	
	//UI初始化
	this.initUi = function(){
	   KE.loadEditorStyle(id, this.opts.basePath + '/site/css/qti/rmaker/kindeditor-content.css');
	   KE.util.loadStyle(this.opts.basePath + '/site/css/qti/rmaker/kindeditor-new.css');
	   
	   //设置编辑风格
	   if(p.showNavor == 0){
	       $(".ke-container").addClass('edit');
	   }
	}
	
	//创建编辑器执行事件
	this.afterCreate = function(id){
	    this.initUi();
		var _self = this;
		setTimeout(function(){
		    KE.readonly(id, true);
		
			_self.doc = KE.g[id].iframeDoc;

			p.onplugresize();
			//$(KE.g[id].iframeDoc.body).css('fontFamily', "宋体");
			//$(KE.g[id].iframe).css({'borderTopWidth': '0' , 'borderBottomWidth': '0' , 'height' : parseInt(KE.g[id].height) - $(KE.g[id].iframe).offset().top + 8 + p.getEditorMarginTop()});

			//加载模板
			_self.loadQtiTemplete();

			//初始化编辑器事件
			_self.initEvents();

			//执行自定义创建事件
			_self.doCreatesEvents();

			
			//初始化自定义验证方法
			_self.initValidMethod();
			
			//初始化自定义插件方法
			_self.initPluginMethod();

			//加载当前编辑数据
			_self.loadQdata();
			
			//执行自定义加载后的事件
			_self.doAfterLoadEvents();
			
			//if(p.mode){
				//缓存一次QTI数据以便比较
				p.catchQtiData();
			//}
			
			//执行插件初始化事件
			$.each(_self.plugin , function(name , plug){
				 if(typeof plug.ok !='undefined'){
					 plug.ok(id);
				 }
			});
			
			//初始化时先禁用所有功能
			KE.toolbar.disable(id , []);
			
			//新建模式时，自动聚焦到第一个输入框
			if(!p.mode){
			     _self.focusInput();
			}
		} , 100);
	}
	
	//初始化编辑器事件
	this.initEvents = function(){
	     this._bindEvents();
		 this.autoSavePic.init();//初始化自动保存图片事件
		 this.initCustomEvents();//自定义事件
	}
	
	this._bindEvents = function(){
	     var _self = this;
		 var body = $('body' , this.doc);

		 //显示提示信息
		 var _prev = null;
		 var item = null;
	     $(".editable-area" , this.doc).live('mousedown' , function(){
			 if(_prev)_self.setTip(_prev , true);
			 item = $(this);
			 _prev = item;
		     return _self.setTip(item);
		 });
		 
		 //设置前一编辑区域的提示信息
		 $(this.doc).live('mousedown' , function(){
		      if(_prev && _self.setTip(_prev , true) == false)_prev = null;
		 });
		 
		 if(typeof p.bindClickEvent !='undefined'){
			 p.bindClickEvent('closetip' , function(){
				 if(_prev && _self.setTip(_prev , true) == false)_prev = null; 
				 
				 body.hideResizer();//隐藏形状变化选择器
			 });
		 }
		 

		 //粘贴事件
		 $("[contenteditable=true]" , this.doc).live('keyup', function(e){
		    if(e.keyCode == 86 && e.ctrlKey){
			   return false;
		    }
		 }).live('paste' , function(){
			 var $this =  $(this);
			 var result = false;
			 var g = KE.g[id];
			 var blank = g.iframeDoc.createTextNode('');
			 var imgStr = '<img id="__ke_temp_tag__" width="0" height="0" />';
			 
			 KE.util.setSelection(id);
			 KE.util.pasteHtml(id , imgStr);

			 var node = KE.$('__ke_temp_tag__', g.iframeDoc);
			 node.parentNode.replaceChild(blank, node);
			 $(blank).wrap('<div id="__ke_temp_div__"><p>');
			 node = KE.$('__ke_temp_div__', g.iframeDoc);
			 g.keRange.selectNode(blank);
			 g.keSel.addRange(g.keRange);
			 
			 KE.toPaste(id , function(param){
			     if(param == false){
				    result = true;
					setTimeout(function(){
					   KE.history.removeStachData(id);
					   var _r = _self.cleanWordChr($(node) , $this.attr('intype') , $this.attr("disbr"));
					   blank = g.iframeDoc.createTextNode('');
					   node.parentNode.replaceChild(blank, node);
					   g.keRange.selectNode(blank);
					   g.keSel.addRange(g.keRange);
					   
					   _self.autoSavePic.toReplace(_r.html , function(content){
					        if(_r.isBr){
							    KE.util.insertHtml(id, content);
							}else{
							    KE.util.pasteHtml(id,content);
							}
							KE.util.setSelection(id);
						    //KE.util.insertHtml(id, content);
						    KE.focus(id);
					   });
					} , 100);
				 }
			 });
			 return result;
		});


		$("[filed][contenteditable=true]" , this.doc).live('mousedown' , function(){
		    _self.activedEditArea($(this));
			//return false;
		});
        
		/*
		KE.event.input(_self.doc , function(event){
		*/
		
		//KE.event.add(_self.doc , 'keydown' , function(event){
		$(_self.doc).bind('keydown' , function(event){
		    if(event.keyCode == 8){
				var g = KE.g[id];
				var startNode = g.keRange.startNode;
				if(g.keRange.startPos == 0){
				     var node = startNode.previousSibling;
					 if(!node && startNode.parentNode.tagName.toLowerCase() == 'span')node = startNode.parentNode.previousSibling;
					 if(!!node){
						 var  tag = !node.tagName ? false :  node.tagName.toLowerCase();
						 if(tag == 'pos'){
						     if(g.keRange.startPos == g.keRange.endPos){
							     //删除插入点
								 _self.plugin.insert_tk_space.remove($(node));
								 KE.util.setSelection(id);
								 return false;
							 }
						 }else if(tag == 'data' || tag == 'tab'){
						     $(node).remove();
						     KE.util.setSelection(id);
							 return false;
						 }else if(tag == 'span' && node.className.indexOf('pinyin') >= 0){
						     $(node).remove();
						     KE.util.setSelection(id);
							 return false;
						 }else if(tag == 'svg'){
							 $(node).remove();
						     KE.util.setSelection(id);
							 return false;
						 }
					 }else{
					     var p = $(startNode).parent();
						 if(p.get(0).tagName.toLowerCase() == 'p')KE.plugin.soutdent.click(id);
					 }
				}
				KE.util.setSelection(id);
			}else if(event.keyCode == 46){//delete删除，当选择形状时需自定义删除方法
				var svg = $('svg[actived=true]' , _self.doc);
				if(svg.length){
					body.hideResizer();
					svg.remove();
					KE.util.setSelection(id);
					return false;
				}
			}else{
				//若有公式则不允许输入其它字符
				if(_self.getInStatusForGs(id) == false){
					return false;
				}
			}
			
			if(event.keyCode == 8 || event.keyCode == 46){
				if(_self.getInStatusForGs(id) == false){
					//有公式时删除后需格式化当前内容(暂不实现)
				}
			}
			return true;
		});
		
		KE.event.input(_self.doc , function(event){
		    if(!!soundPlayer)soundPlayer.stop();
		}, id);

		//滚动事件
		$(this.doc).scroll(function(){
		     p.onScroll($(this).scrollTop());
		});
		
		//工具栏状态更新事件/*
		KE.event.add(_self.doc , 'mouseup' , function(event){
			KE.toolbar.disable(id , ['undo', 'redo']);
		} , id);

		$("[contenteditable=true][intype!=text]" , this.doc).live('mouseup' , function(){
		     var disTool = $(this).attr('disTool');
			 if(!disTool){
			     disTool = ['undo', 'redo','bfill','bcolor'];
			 }else{
			     disTool = ('undo,redo,bfill,bcolor' + disTool).split(',');
			 }
		     KE.toolbar.able(id , disTool);
			 return true;
		});
		
		$("[contenteditable=true][intype=text]" , this.doc).live('mouseup' , function(){
		     var enableTool = $(this).attr('enableTool');
			 if(!enableTool){
			     enableTool = ['undo', 'redo','cut','copy','plainpaste'];
			 }else{
			     enableTool = ('undo,redo,cut,copy,plainpaste,' + enableTool).split(',');
			 }
		     KE.toolbar.able(id , ['undo', 'redo','bfill','bcolor']);
			 KE.toolbar.disable(id , enableTool);
			 return true;
		});
		
		$("[contenteditable=true][disbr]" , this.doc).live('keydown' , function(e){
		     if(e.keyCode == 13)return false;
		});
		
		this.doc.ondragstart = function(e){KE.event.preventDefault(e);return false;}//禁止拖动
	    
		
		//文件名提示
		$('data [type=title]' , this.doc).live('mouseover' , function(){
		     _self.showDataTitle($(this));
		}).live('mouseout' , function(){
		     _self.hideDataTitle($(this));
		});
		
		//执行命令
		$("[cmd]" , this.doc).live('click' , function(){
			 var t = $(this) , cmd = t.attr('cmd');
			 if(typeof _self[cmd] != 'undefined'){
				 _self[cmd](t);
			 }else if(typeof p[cmd] != 'undefined'){
				 p[cmd](t);
			 }
		});
		
		//难易度选择
		var dradios = $('[filed=difficulty] input[type=radio]' , this.doc).live('change' ,function(){
			 var t = $(this);
			 dradios.attr('checked' , false);
			 t.attr('checked' , true);
			 p.Container.find('[name=difficulty]').val(t.val());
		});
		
		//实例化svg resize事件
		body.resizer({
			body : body.get(0),
			type : 1,
			onShow : function(dom){
				KE.toolbar.disable(id , ['shape']);
				KE.toolbar.ableCmd(id , 'bfill');
				KE.toolbar.ableCmd(id , 'bcolor');
				dom.attr('actived' , true);
			},
			onHide : function(dom){
				KE.toolbar.able(id , ['bfill','bcolor']);
				KE.toolbar.disableCmd(id , 'bfill');
				KE.toolbar.disableCmd(id , 'bcolor');
				dom.removeAttr('actived');
			},
			callback : function(dom , size){
				KE.plugin.shape.scaleShape(dom , size);
			}
		});
	}
	
	//过滤html
	this.cleanWordChr = function(t , type , disbr){
	    var isBr = false;
	    if(!!type&& type == 'text'){
		   var text = t.text();
		   if(text.indexOf("\n") >=0){
		        text = text.replace(new RegExp('^(\\r\\n|\\r|\\n){1,}' , 'gim') , '');
				text = text.replace(new RegExp('(\\r\\n|\\r|\\n){1,}$' , 'gim') , '');
				text = text.replace(new RegExp('(\\r\\n|\\r|\\n)' , 'gim') , !disbr ? '<br>' : '');
				text = text.replace(new RegExp('(　)' , 'gim') , '&nbsp;&nbsp;&nbsp;&nbsp;');//将全角空格替换为普通空格
		   }
		   return {isBr : isBr , html : text};//文本格式，直接返回
		}
	    var html = t.html();
		html = html.replace(new RegExp('<img[^>]*\\s+src=\\"file:\\/\\/\\/[^\\"]*\\"[^>]*>' , 'gim') , '');//去除本地图片
		//html = html.replace(new RegExp('<(img[^>]*)>' , 'gim') , '{##@@$1@@##}');
		html = html.replace(new RegExp('<(img[^>]*data\\-mathml\\-txt[^>]*)>' , 'gim') , '{##@@$1@@##}');
		html = this.dofilterWordTag(html);
		html = html.replace(/<(?!img|embed).*?>/ig, '');
		$t = $('<textarea class="KE-TEMP-AREA">').appendTo($('body' , this.doc)).val(html);
		//html = $t.val().replace(new RegExp('(\\r\\n|\\r|\\n)' , 'gim') , '<br>');
		//html = html.replace(new RegExp('^(<br>){1,}' , 'gim') , '');

		html = html.replace(new RegExp('^(\\r\\n|\\r|\\n){1,}' , 'gim') , '');
        html = html.replace(new RegExp('\\s*(\\r\\n|\\r|\\n){1,}$' , 'gim') , '');
		html = $.trim(html);

		$t.remove();
		//html = html.replace(new RegExp('{##@@([^@]*)@@##}' , 'gim') , '<$1>');

		//去除图片的多余格式
		html = html.replace(new RegExp('<img([^>]*)\\s+src=\\"([^\\"]*)\\"([^>]*)>' , 'gim') , '<img src="$2" $1 $3>');
		html = html.replace(new RegExp('<(img\\s+src=\\"[^\\"]*\\")([^>]*)width=\\"([^>]*)\\"([^>]*)>' , 'gim') , '<$1 width="$3" $2 $4>');
		html = html.replace(new RegExp('<(img[^>]*width=\\"[^\\"]*\\")[^>]*height=\\"([^>]*)\\"[^>]*>' , 'gim') , '<$1 height="$2">');
        
		html = html.replace(new RegExp('{##@@([^@]*)@@##}' , 'gim') , '<$1 data_type="mathml-img">');

		//有无换行
		if(html.indexOf("\n") >=0){
		    html = html.replace(new RegExp('(\\r\\n|\\r|\\n)' , 'gim') , '</p><p>');
			//html = '<p>' + html + '</p>';
			isBr = true;
		}

		return {isBr : isBr , html : html};
	}
	
	//过滤word标签
	this.dofilterWordTag = function(str){
	    str = str.replace(/<meta(\n|.)*?>/ig, "");
		str = str.replace(/<!(\n|.)*?>/ig, "");
		str = str.replace(/<style[^>]*>(\n|.)*?<\/style>/ig, "");
		str = str.replace(/<script[^>]*>(\n|.)*?<\/script>/ig, "");
		str = str.replace(/<w:[^>]+>(\n|.)*?<\/w:[^>]+>/ig, "");
		str = str.replace(/<xml>(\n|.)*?<\/xml>/ig, "");
		str = str.replace(new RegExp('(\\r\\n|\\r|\\n){1,}' , 'gim') , ' ');
		str = $.trim(str);
		str = KE.util.execGetHtmlHooks(id, str);
		str = KE.format.getHtml(str, KE.g[id].htmlTags, KE.g[id].urlType);
		return str;
	}
	
	//公式插入时执行事件
	this.beforeMathInsert = function(id , img , tex , mode){
		if(mode == 'new'){
			var earea = this.getActiveArea();
			if(earea.length && typeof earea.attr('gsclear') != 'undefined'){
				var html = earea.html();
				earea.html('');
				/*暂不实现
				if(html){
					var imgs = html.match(new RegExp('<img[^>]*>' , 'gim'));
					html = imgs && imgs.length ? imgs.join('|') + '|' : '';
					earea.focus();
					KE.focus(id);
					KE.util.insertHtml(id, html);
				}
				*/
				KE.util.setSelection(id);
			}
		}
	};
	
	//获取当前输入区域当有公式时是否允许插入其它字符的状态
	this.getInStatusForGs = function(id){
		var status = true;
		
		var g = KE.g[id];
		var startNode = g.keRange.startNode;
		var pnode = $(startNode).closest("[contenteditable='true']");
		if(pnode.length && typeof pnode.attr('gsclear') != 'undefined' && pnode.find("[data-mathml-txt]").length){
			status =  false;
		}
		return status;
	};
	
	this.activedEditArea = function(t){
	    if(t.hasClass('actived'))return;
		$(".actived[contenteditable=true]" , this.doc).removeClass('actived');
		t.addClass('actived');
	}
	
	//获取当前激活的编辑对象
	this.getActiveArea = function(){
	    return $(".actived[contenteditable=true]" , this.doc);
	}
	
	
	//初始化自定事件
	this.initCustomEvents = function(events , pobject){
	    var _self = this;
		pobject = pobject || _self.doc;
	    $.each(events || this.events , function(i , event){
		    $(pobject).delegate(event.object , event.name , function(e){
			    event.callback(pobject , $(this) , _self , e);
			});
		});
	}
	
	//执行自定义创建事件
	this.doCreatesEvents = function(onCreateEvents , pobject , qData){
	    var _self = this;
	    $.each(onCreateEvents||this.onCreateEvents , function(i ,callback){
		    callback(pobject || _self.doc , _self , qData);
		});
	};
	
	//执行自定义加载后的事件
	this.doAfterLoadEvents = function(afterLoadEvents , pobject){
	    var _self = this;
	    $.each(afterLoadEvents||this.afterLoadEvents , function(i ,callback){
		    callback(pobject || _self.doc , _self);
		});
	};
	
	//初始化自定义验证方法
	this.initValidMethod = function(validMethods){
	    var _self = this;
	    $.each(validMethods || this.validMethods , function(name , fun){
		     _self.validQtiData[name] = fun;
		});
	}
	
	//初始化自定义插件
	this.initCustomPlugin = function(editorPlugins){
	    var _self = this;
	    $.each(editorPlugins||this.editorPlugins , function(name , fun){
		    _self.plugin[name] = fun(_self);
		});
	}
	
	//初始化自定义插件方法
	this.initPluginMethod = function(pluginMethods){
	    var _self = this;
		$.each(pluginMethods||this.pluginMethods , function(i , v){
		     _self.plugin[v.plugin][v.method] = v.fun;
			 KE.plugin[v.plugin][v.method] = v.fun;
		});
	}
	
	//初始化自定义格式化数据
	this.initFormatDataMethod = function(qtype , fun , object){
		if(fun && typeof this.formatDataMethod[qtype] == 'undefined'){
			this.formatDataMethod[qtype] = {
				'object' : object,
				'event' : fun
			};
		}
	}
	
	this.initChildQti = function(qtype , pobject , qData , callback){
		var _self = this;
		if(typeof this.initedchildQti == 'undefined')this.initedchildQti = {};
		p.loadpath(qtype , function(){
			//初始化自定义事件
			_self.initCustomEvents(p.events[qtype] || {} , pobject);
			
			_self.initFormatDataMethod(qtype , p.afterFormatMethods[qtype] || null , pobject);

			//执行自定义创建事件
			_self.doCreatesEvents(p.onCreateEvents[qtype] || {}, pobject , qData);
			if(typeof _self.initedchildQti[qtype] == 'undefined'){
				//初始化自定义验证方法
				_self.initValidMethod(p.validMethods || {});

				//初始化自定义插件
				_self.initCustomPlugin(p.editorPlugins[qtype] || {});
				
				//初始化自定义插件方法
				_self.initPluginMethod(p.pluginMethods[qtype] || {});
			}
            
			//$.extend(_self.afterLoadEvents , p.afterLoadEvents[qtype]);
			//_self.doAfterLoadEvents(p.afterLoadEvents[qtype] || {}, pobject);
			_self.initedchildQti[qtype] = true;
			if(typeof callback !='undefined')callback();
		});
	}
	
	this.doChildAfterLoadEvent = function(qtype , t , callback){
	    this.doAfterLoadEvents(p.afterLoadEvents[qtype] || {}, t);
		if(typeof callback !='undefined')callback();
	}
	
	//获取编辑器的顶部工具条高度
	this.getToolbarHeight = function(){
	    return p.qtiBox.find(".ke-toolbar-outer").outerHeight(true);
	}
	
	//获取可编辑区域的可视高度
	this.getEnableAreaHeight = function(){
	    return  parseInt(KE.g[id].iframe.style.height);
	}
	
	//获取编辑模式
	this.getEditMode = function(){
	    return p.mode;
	}
	
	//获取待编辑的数据
	this.getEditQdata = function(){
	    return p.getCurrQdata();
	}
	
	//获取编辑器API地址
	this.getApiUrl = function(){
	    return p.opts.apiUrl;
	}
	
	//获取编辑器的JS路径
	this.getEditorPath = function(){
	    return p.opts.basePath + '/site/js/qti/rmaker';
	}
	
	this.getParent = function(){
	    return p;
	}
	
	this.backTop = function(){
	    $(this.doc).scrollTop(0);
	}
	
	this.showDataTitle = function(t){
	    var tipid = 'data-title-tip',
		    box = $("#" + tipid);
		if(box.length == 0)box = $('<div id="'+tipid+'">').appendTo($('body'));
		box.html(t.html()).show().css({left: t.offset().left, top : t.offset().top + p.getEditorMarginTop() + this.getToolbarHeight() + t.height() + 5 - $('body' , this.doc).scrollTop()});
	}
	
	this.hideDataTitle = function(){
	    var tipid = 'data-title-tip',
		    box = $("#" + tipid);
		if(box.length)box.hide();
	}
	
	//首输入框自动聚焦
	this.focusInput = function(){
	    var _self = this;
		setTimeout(function(){
		    var t = $("[infoucs]:first" , _self.doc);
			if(!t.length)t = $("[contenteditable=true]:first" , _self.doc);
		    t.trigger('mousedown').trigger('mouseup').trigger('foucs');
		} , 500);
	}
	
	//设置提示信息
	this.setTip = function(t , reload){
	     var tip = t.attr('tip');
		 var isInput = t.get(0).tagName.toUpperCase() == 'INPUT' ? true : false;
		 var html = isInput ? t.val() : t.html();
		 html = html.replace(new RegExp('(\\r\\n|\\r|\\n)' , 'gim') , '');
		 if(typeof reload == 'undefined'){
			 if(html == tip|| html == '' || html.replace(new RegExp('^\\s*<[^>]{0,2}br[^>]{0,2}>\\s*$|^\\s*<p>(<[^>]*br>){0,1}<\\/p>\\s*$' , 'im') , '') == ''){
				 if(isInput){
				     t.val('').removeClass('tip');
					 t.focus();
				 }else{
				     var type = t.attr('intype');
					 if(!!type && type == 'text'){
					     t.html("").removeClass('tip');
						 t.focus();
					 }else{
						 t.html('').removeClass('tip');
						 t.focus();
						 KE.focus(id);
						 KE.util.setSelection(id);
						 KE.util.insertHtml(id, '<p></p>');
						 KE.history.removeStachData(id);
					 }
				 }
				 return false;
			 }
		 }else{
		     if(t.hasClass('tip') == false && (html == '' || html.replace(new RegExp('^\\s*<[^>]{0,2}br[^>]{0,2}>\\s*$|^\\s*<p>(<[^>]*br>){0,1}<\\/p>\\s*$' , 'im') , '') == '')){
				if(isInput){
				   t.val(tip).addClass('tip');
				}else{
				   t.html(tip).addClass('tip');
				}
				return false;
			 }
		 }
		 
		 return true;
	}
	
	//获取当前编辑器ID
	this.getId = function(){
	    return id;
	}

	//设置特殊字符显示
	this.changSpChar = function(type){
	    KE.plugin.specialchar.choiceType(type , id);
	}
	
	//加载试题模板
	this.loadQtiTemplete = function(qtype){
	    var templete = p.getQtiTemplete({qid : 0 , qtype : qtype || this.qtype  , needProp : 1});
	    KE.html(id , templete);
	}
	
	//加载题项模板
	this.getQtiItemTemplete = function(name){
	    if(typeof name == 'undefined')name = this.qtype;
	    return p.getQtiItemTemplete(name);
	}
	
	//加载js脚本
	this.loadScript = function(urls , callback){
	    var baseUrl = this.getEditorPath();
	    $.each(urls , function(i , v){
		    urls[i] = baseUrl + v;
		});
	    Nlsp.loadScript(urls , callback);
	}
	
	//获取当前编辑器的QTI数据
	this.getQtiData = function(isChecked){
		var qtiData = this.formatQtiData();
		qtiData = this.afterFormat(qtiData , this);//格式化大题数据
		//qtiData = this.toFormatChildDataMethod(qtiData);
		if(typeof isChecked != 'undefined' && isChecked){
			if(qtiData === false)return false;
			if(this.validQtiData.run(qtiData) == false)return false;
		}
		return qtiData;
	}
	
	//格式化子题数据
	this.toFormatChildDataMethod = function(children , pObject){
		if(typeof children !='undefined'){
			if(typeof children.qtype!= 'undefined' &&  typeof this.formatDataMethod[children.qtype] != 'undefined'){
				children = this.formatDataMethod[children.qtype].event(children , this , pObject);
			}
		}
		return children;
	}
	
	//加载QData
	this.loadQdata = function(){
	    var qData = this.getEditQdata();
		if(qData){
		    var items = $('.qti .qti' , this.doc);
			if(items.length){
			    var _self = this;
				this._doLoadData(qData , $("[filed]" , this.doc).not(items.find("[filed]")) , this.doc);
				items.each(function(i){
					 _self._doLoadData(qData['children'][i] , $("[filed]" , this) , this);
				});
			}else{
				result = this._doLoadData(qData , $("[filed]" , this.doc) , this.doc);
			}
		}
	}
	
	this._doLoadData = function(qData , items , pobject){
	    var item = null;
		var content = '';
		var filed = '';
		var isMulti = false;
		var _self = this;
		var level = 0;
		var mItems = $("div .multi:first >ul .multi" , pobject);
		items.each(function(){
			 item = $(this);
			 filed = item.attr('filed');
			 if(typeof qData[filed] == 'undefined')return;
			 isMulti = item.attr('isMulti');
			 if(typeof isMulti == 'undefined')isMulti = false;
			 if(isMulti){
				 var _ps = item.parents('.multi').not('.main');
				 var _p = _ps.first();
				 var index = $("[filed="+filed+"]" , _p).index(item);
				 level = _ps.length;
				 if(level > 1){
					 level = mItems.index(_p);
					 _self.setQfiledValue(item , qData[filed][level][index]);
				 }else{
					 _self.setQfiledValue(item , qData[filed][index]);			 
				 }
			 }else{
				 _self.setQfiledValue(item , qData[filed]);
			 }
		});
	}
	
	//设置各字段的值
	this.setQfiledValue = function(t , v){
	    if(typeof v == 'undefined' || v === null)return;
		var intype = t.attr('intype');
	    if(t.attr("contentEditable") == 'true'){
			 v = v.toString();
			 if(v){
				 v = v.replace(new RegExp('(<pos[^>]*>.*<\/pos>)\s*$' , 'gi') , '$1&nbsp;');
				 v = v.replace(new RegExp('<[^>]+>' , 'gim') , function($0){
				     return '##@@'+encodeURI($0)+'@@##';
				 });
				 //v = v.replace(new RegExp('\\s' , 'gim') , '&nbsp;');//当css设置为white-space: pre-wrap;空格已不再生成 &nbsp;
				 if(t.attr("intype") == "text" && typeof t.attr("disbr") == "undefined")v = v.replace(new RegExp('\\s' , 'gim') , '&nbsp;');
				 v = v.replace(new RegExp('##@@(.+?)@@##' , 'gim') , function($0 , $1){
				     return decodeURI($1);
				 });
				 t.html(v).removeClass('tip');
			 }
		}else if(t.hasClass('editable-area') && t.get(0).tagName=='INPUT'){
		      intype = t.attr('type');
			  if(intype == 'checkbox'){
			      t.attr('checked' , v ? true : false);
			  }else{
				  if(v != null){
					  v = v.toString();
					  if(v)t.val(v).removeClass('tip');
				  }
			  }
		}else{
			  if(t[0].tagName.toLocaleLowerCase() == 'select'){
				  t.find("option[value="+v+"]").attr('selected' , true);
			  }else{
				  if(typeof intype !='undefined'){
				     if(v){
					      if(intype == 'checkbox'){
							  for(var i = 0; i< v.length;i++){
								  t.find('input[value='+v[i]+']').attr('checked' , true);
							  }
						  }else if(intype == 'select'){
						      for(var i = 0; i< v.length;i++){
								  t.find('select').eq(i).find('option[value='+v[i]+']').attr('selected' , true);
							  }
						  }else if(intype=='radio'){
							  t.find("[type=radio]").attr('checked' , false);
						      t.find('[type=radio][value='+v+']').attr('checked' , true);
						  }else if(intype == 'html'){
						      t.html(v);
						  }else if(intype=="text"){
							  t.html(v);
						  }
					 }
				  }else{
				     t.val(v);
				  }
			  }
		}
	}
	
	//格式化QTI数据
	this.formatQtiData = function(){
	    var result = {};
	    var items = $('.qti .qti' , this.doc);
		var _self = this;
		if(items.length){
		    result = this._doformat($("[filed]" , this.doc).not(items.find("[filed]")) , this.doc);
			result.children = [];
			var childern = null;
			items.each(function(){
				 childern = _self._doformat($("[filed]" , this) , this);
				 childern = _self.toFormatChildDataMethod(childern , this);
			     if(childern != null)result.children.push(childern);
			});
		}else{
		    result = this._doformat($("[filed]" , this.doc) , this.doc);
		}
		return result;
	};
	
	this._doformat = function(items , pobject){
	    var result = {};
	    var _html = '';
		var filed = '';
		var isMulti = false;
		var level = 0;
		var item = null;
		var _self = this;
		var mItems = $("div .multi:first >ul .multi" , pobject);
		items.each(function(){
			 item = $(this);
			 filed = item.attr('filed');
			 isMulti = item.attr('isMulti');
			 if(typeof isMulti == 'undefined')isMulti = false;
			 _html = '';
			 var intype = item.attr('intype');
			 
			 if(item.attr('contentEditable') == "true"){
			     if(!!intype && intype == 'text'){
				     var reType = item.attr('reType');
					 if((!!reType && reType == 'html') || (typeof item.attr('gsclear') != 'undefined' && item.find('img[data-mathml-txt]').length)){
					     _html = item.html(); 
						 _html = _html.replace(new RegExp('^\\s*<[^>]{0,2}br[^>]{0,2}>\\s*$|^\\s*<p>(<[^>]*br>){0,1}<\\/p>\\s*$' , 'im') , '');
					     _html = _html.replace(new RegExp('<([^>]*)\\s+contenteditable=\\"false\\"([^>]*)>' , 'gim') , '<$1$2>');//去除自定义属性
					 }else{
				         _html = item.text();
					 }
					 _html = _html.replace(new RegExp('&nbsp;' , 'gim') , ' ');
					 _html = _html.replace(new RegExp('(\\r\\n|\\r|\\n)' , 'gim') , '');
				 }else{
				     _html = item.html();
					 //对html的处理
					 if(_html){
						_html = _html.replace(new RegExp('^\\s*<[^>]{0,2}br[^>]{0,2}>\\s*$|^\\s*<p>(<[^>]*br>){0,1}<\\/p>\\s*$' , 'im') , '');
						_html = _html.replace(new RegExp('&nbsp;' , 'gim') , ' ');
						while(_html.match(new RegExp('<br[^>]*>$' , 'gi'))){
						   _html = _html.replace(new RegExp('<br[^>]*>$' , 'gi') , '');
						}
					 }
					 
					 _html = _html.replace(new RegExp('<([^>]*)\\s+contenteditable=\\"false\\"([^>]*)>' , 'gim') , '<$1$2>');//去除自定义属性
				 }
				 if(_html == item.attr('tip'))_html = '';
			 }else if(item.hasClass('editable-area') && item.get(0).tagName=='INPUT'){
			      intype = item.attr('type');
				  if(intype == 'checkbox'){
					  _html = item.attr('checked') ? 1 : 0;
				  }else{
					  _html = $.trim(item.val());
					  if(_html == item.attr('tip'))_html = '';
				  }
			 }else{
			     //其他类型的处理
				 if(typeof intype !='undefined'){
				     if(intype=='radio'){
					     _html = item.find('input[type=radio]:checked').val();
					 }else if(intype=="html"){
					     _html = $.trim(item.html());
					 }else if(intype=="text"){
					     _html = item.text();
						 _html = _html.replace(new RegExp('(\\r\\n|\\r|\\n)' , 'gim') , '');
					 }else{
						 var _items = {};
						 if(intype=='checkbox'){
							 _items = item.find('input[type=checkbox]:checked');
						 }else if(intype=='select'){
							 _items = item.find('select');
						 }
						 $.each(_items , function(){
							 _html += $(this).val();
						 });
					 }
				 }else{
				    _html = item.val();
				 }
			 }
			 
			 if(isMulti){
			     //对于多题的处理
			     if(typeof result[filed] == 'undefined')result[filed] = [];
			     var _ps = item.parents('.multi').not('.main');
			     level = _ps.length;
				 if(level > 1){
				     level = mItems.index(_ps.first());
					 if(typeof result[filed][level] == 'undefined')result[filed][level] = [];
				     result[filed][level].push(_html);
				 }else{
				     result[filed].push(_html);
				 }
			 }else{
			     result[filed] = _html;
			 }
		});
		
		return result;
	}
	
	//校验QTI数据
	this.validQtiData = new (function(_p){
	    this.run = function(qtiData){
			return this._validData(qtiData , _p.doc , _p.doc, typeof qtiData.children =='undefined' ? false : true);
		};
		
		this._validData = function(qtiData , pobject , doc , isMix){
		    var _self = this;
			var _r = true;
			var _t = null;
			$.each(qtiData , function(name , v){
			     if(name == 'children'){
				     var items = $(".qti .qti" , pobject);
				     $.each(v , function(i , v){
					      _r = _self._validData(v , items.get(i) , doc, isMix);
						  if(!_r)return false;
					 })
				 }else{
					 _t = $("[filed="+name+"]" , pobject);
					 if(_t.length){
						 if(typeof v == 'object'){
							 var index = 0;
							 $.each(v , function(i , cv){
								 if(typeof cv == 'object'){
									 $.each(cv , function(j , sv){
										 _r = _self.doCheck(_t.eq(index) , sv , pobject , doc, isMix);
										 index++;
										 if(!_r)return false;
									 });
								 }else{
									 _r = _self.doCheck(_t.eq(index) , cv , pobject ,doc, isMix);
									 index++;
								 }
								 if(!_r)return false;
							 });
						 }else{
							 _r = _self.doCheck(_t.eq(0) , v , pobject ,doc, isMix);
						 }
					 }
				 }
				 if(!_r)return false;
			});
			return _r;
		}
		
		this.doCheck = function(_t , v , pobject ,doc, isMix){
			var _f = null , top = 0 , gc = $(doc) , item = null;
			_f = $.trim(_t.attr('valid'));
			if(typeof _f != 'undefined' && _f){
				var _fmatch = _f.split('|');
				for(var i=0;i<_fmatch.length;i++){
					if(this[_fmatch[i]](v , pobject , _t) == false){
					   var _tip = _t.attr(_fmatch[i]+"_tip");
					   if(typeof _tip !='undefined'){
						   alert(_tip , {afterClose : function(){
						        if(isMix){//定位
								    item = _t.closest(".qti").parent();
								    if(item.hasClass("fold"))item.find(".g_title").trigger('click');
								    top = _t.offset().top;
									gc.scrollTop(top - (_t.parent().get(0).tagName.toLowerCase() == "fieldset" ? 30 : 5));
								}
								if(_t.hasClass('editable-area')){
									  _t.trigger('mousedown');
									  _t.focus();
								}
						   }});
					   }
					   return false;
					}
				}
			}
			return true;
		};
		
		this.required  =  function(value){
		    if(typeof value == 'undefined' || value == '')return false;
		    value = value.replace(new RegExp('<p>\\s*[\\r\\n]*\\s*(<[^>]{0,2}br[^>]{0,2}>){0,1}\\s*[\\r\\n]*\\s*<\\/p>' , 'gim') , '');
			return $.trim(value) ? true : false;
		};
		
		this.mcAnser = function(value){
		   value = value.replace(new RegExp('<[^>]+>' , 'gim') , '');
		   var len = value.length;
		   if(len < 2)return false;
		   for(var i = 0 ; i< len ; i++){
			   var code = value[i].charCodeAt();
			   if(code <65 || code > 90)return false;
		   }
		   return true;
		}
		
		this.ocAnser = function(value){
		   value = value.replace(new RegExp('<[^>]+>' , 'gim') , '');
		   var len = value.length;
		   if(len < 1)return false;
		   for(var i = 0 ; i< len ; i++){
			   var code = value[i].charCodeAt();
			   if(code <65 || code > 90)return false;
		   }
		   return true;
		}
			
		return this;
	})(this);
	
	
	/****自动保存图片****/
	this.autoSavePic = new (function(_p){
	    this.engine = null;
	    this.init = function(){
		     this.engine = new autoSavePictrue({api : p.opts.apiUrl , fileUploadRoot : p.opts.fileUploadRoot});
		}
		
		this.run = function(obj , gTime){
		    var _self = this;
		    setTimeout(function(){
				_self.engine.run(obj.html() , function(result , content , hasUpFileIds){
				   if(result){
					   obj.html('');
					   KE.focus(id);
					   obj.focus();
					   KE.util.insertHtml(id, content);
					   KE.focus(id);
				   }
				});
		   },gTime);
		}
		
		/*
		 *直接替换
		 * isforce 是否强制将同主机的文件转换为本地文件
		 */
		this.toReplace = function(html , callback , isforce){
		    var isforce = !_p.getActiveArea().attr('downAllImg') ? false : true;
			
		    this.engine.run(html , function(result , content , hasUpFileIds){
			   if(result){
				   callback(content);
			   }else{
			       callback(html);
			   }
			}, isforce);
		}
		
		return this;
	})(this);
	
	
	/******自定义插件*******/
	this.plugin = new (function(_p){
	     //保存
	     this.save = {
		     click : function(id){
				 p.saveQti(false , function(result){
				     if(result){
						 p.onSave();
					 }else{
					     alert('未成功保存！');
					 }
				 });
			 }
		 };	
		 
		 //提交
		 this.submit = {
		     click : function(id){
				 p.saveQti(true , function(result){
				     if(result){
						 p.onSave();
					 }else{
					     alert('未成功提交！');
					 }
				 });
			 }
		 }
		 
		 //切换题型
		 this.cutover = {
		      click : function(id){
			      p.changeQtiType();
			  }
		 }
		 
		 //预览试题
		 this.preview = {
		      click : function(id){
			      p.saveQti(false , function(result){
				     if(result){
						 p.preview();
					 }else{
					     alert('未成功保存！');
					 }
				 });
			  }
		 }
		 
		 //插入填空点
		 this.insert_tk_space = {
		     posHtml : '&nbsp;<pos class="curr" contenteditable="false"></pos>&nbsp;',
			 enableFocus : true,
			 ok : function(id) {
				this.events(id);
			 },
			 click : function(id , doc , type) {
			    doc = doc || KE.g[id].iframeDoc;
				var c_editer = $("[contenteditable=true][in_pos=true]", doc);
				if(!c_editer.length){
					alert('无法插入!');
					return false;
				}
				
				if(c_editer.html() == c_editer.attr('tip')){
				    c_editer.html('').removeClass('tip');
				}

				if(c_editer.hasClass('actived')){
				     c_editer.focus();
				     KE.focus(id);
					 KE.util.insertHtml(id, this.posHtml);
				}else{
				     var _html = c_editer.html();
					 if(_html)_html = _html.replace(new RegExp('<[^>]*br[^>]*>$' , 'im') , '');
					 c_editer.html('');
					 c_editer.focus();
				     KE.focus(id);
					 KE.util.setSelection(id);
					 if(_html){
					    var _pos = _html.lastIndexOf('</p>');
					    if(_pos > -1){
						     KE.util.insertHtml(id, _html.substring(0 , _pos).replace(new RegExp('<[^>]*br>$') , '') + this.posHtml + '</p>');
						}else{
					         KE.util.insertHtml(id, _html + this.posHtml);
						}
					 }else{
					    KE.util.insertHtml(id, '<p>' + this.posHtml + '</p>');
					 }
					 _p.activedEditArea(c_editer);
				}
				c_editer.focus();
				KE.focus(id);
				KE.util.setSelection(id);
		        
				KE.history.removeStachData(id);

				//获取当前插入点的索引
				var c_pos = c_editer.find(".curr").removeClass('curr');
				var pos = c_editer.find("pos");
				var index = pos.index(c_pos);
				if(type == 'ztiankong'){
					this.onZtInsert(index ,  c_editer.closest('.qti') , _p);
				}else{
				    this.onInsert(index ,  c_editer.closest('.qti') , _p);
				}
				
				if(c_editer.attr("intype") == "text"){
				     KE.toolbar.able(id , ['undo', 'redo']);
				     var enableTool = c_editer.attr('enableTool');
					 if(!enableTool){
						 enableTool = ['undo', 'redo','cut','copy','plainpaste'];
					 }else{
						 enableTool = ('undo,redo,cut,copy,plainpaste,' + enableTool).split(',');
					 }
					 KE.toolbar.disable(id , enableTool);
				}else{
				     var disTool = c_editer.attr('disTool');
					 if(!disTool){
						 disTool = ['undo', 'redo'];
					 }else{
						 disTool = ('undo,redo,' + disTool).split(',');
					 }
					 KE.toolbar.able(id , disTool);
				}
			 },
			 events : function(id) {
				var _self = this;	
				$(_p.doc).undelegate('pos' ,'click').delegate('pos' ,'click', function(){
				    var t = $(this) , _doc = t.closest('.qti'),opts = $("pos" , _doc);
					opts.not(t).removeClass('checked');
				    if(t.hasClass("checked")){
					    t.removeClass("checked");
					}else{
					    t.addClass('checked')
					}
					if(!!_self.focusToEditArea){
					    _self.focusToEditArea(opts.index(t) , _doc , _p);
					}
					return false;
				});
				
				if(this.enableFocus == false){
				     $(_p.doc).undelegate('pos' ,'mousedown').delegate('pos' ,'mousedown', function(){
					       return false;
					 });
				}
				
				$(_p.doc).mouseup(function(){
				    $("pos" , this).removeClass('checked');
				});
			 },
			 remove : function(t){
			     var editor = t.closest('.qti');
				 var _sel = editor.find('pos');
				 var index = _sel.index(t);
				 if(this.onRemove(index , editor , _p) == false){
					   return false;
				 }
				 t.remove();
				 KE.util.setSelection(id);
				 this.afterRemove(index , editor , _p);
			 },
			 countPos : function(editor){
				return $("pos", editor).length;
			 },
			 onRemove : function(index , editor , object){return true;},
			 afterRemove : function(index , editor , object){return true;},
			 onInsert : function(index , editor , object){},
			 onZtInsert : function(index , editor , object){}
		}

		this.audio = KE.plugin.audio;
		this.video = KE.plugin.video;
		this.image = KE.plugin.image;
		this.pinyin = KE.plugin.pinyin;
		this.image.afterInserImg = function(html , callback){
		     _p.autoSavePic.toReplace(html , callback);
		}
		
		this.undo = KE.plugin.undo;
		this.undo.afterClick = function(id){
		     if(!!soundPlayer)soundPlayer.stop();
			 $(".ke-undo-icon").focus();
		}
		
		//表格删除事件
		this.advtable = KE.plugin.advtable;
		this.advtable.advtableRowHeight = 23;
		this.advtable.onTableDelete = function(o){
		     $("pos" , o).each(function(){
			      _p.plugin.insert_tk_space.remove($(this));
			 });
		}
		
		this.redo = KE.plugin.redo;
		this.redo.afterClick = function(id){
		     $('data.actived' , _p.doc).removeClass('actived');
		}
		
		 return this;
	})(this);
	
	return this;
}