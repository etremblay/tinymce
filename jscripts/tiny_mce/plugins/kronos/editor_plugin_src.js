
(function() {
	
	tinymce.PluginManager.requireLangPack('kronos.kronos');
		
	tinymce.create('tinymce.plugins.Kronos', {
		init : function(ed, url) {
			var t = this;
			t.editor = ed;
			
			t.theme_enabled = tinyMCE.activeEditor.getParam('kronos_theme_enabled');
			t.default_theme = tinyMCE.activeEditor.getParam('kronos_default_theme');
			
			if(t.theme_enabled){
				ed.kronos_theme_def = {};
				ed.kronos_theme_def[0] = {label:ed.getLang('kronos.default_theme'), css_text:'body{} p{margin:0px; padding:0px;}'};
				
				var theme_list = tinyMCE.activeEditor.getParam('kronos_theme_list');
				if(theme_list){
					for(var theme_id in theme_list){
						ed.kronos_theme_def[theme_id] = theme_list[theme_id];
					}
				}
				
				ed.onBeforeSetContent.add(t._setContent, t);
				ed.onPostProcess.add(t._postProcess, t);
				ed.onGetContent.add(t._getContent, t);
				ed.onInit.add(t._setDefaultTheme, t);
			
			}
			
			ed.addCommand('mceKronosMergeField', function() {
				ed.windowManager.open({
					file : url + '/mergefield.html',
					width : 300 + ed.getLang('example.delta_width', 0),
					height : 100 + ed.getLang('example.delta_height', 0),
					inline : 1
				}, {
					plugin_url : url, // Plugin absolute URL
					some_custom_arg : 'custom arg' // Custom argument
				});
			});
			
			ed.addCommand('mceKronosTypeTextPlaceholder', function() {
				ed.execCommand('mceInsertContent', false, '&lt;!-- ' + ed.getLang('kronos.placeholder_text') + '  --&gt;');
			});
			
			ed.addCommand('mceSelectTheme', function(u, v) {
				t._selectTheme(v);
			});
			
			ed.addCommand('mceKronosMergePreview', function() {
				Mail.ShowMergePreview(ed.getContent());
			});
			
			ed.addButton('kronos_mergefield', {
				title : 'kronos.mergefield_desc', 
				cmd : 'mceKronosMergeField',
				image : 'media/default/icons/mergefield.png'
			});
			
			ed.addButton('kronos_mergepreview', {
				title : 'kronos.mergepreview_desc', 
				cmd : 'mceKronosMergePreview',
				image : 'media/default/icons/merge_preview.png'
			});
			
			ed.addButton('kronos_type_text_placeholder', {
				title : 'kronos.typetextplaceholder_desc', 
				cmd : 'mceKronosTypeTextPlaceholder',
				image : 'media/default/icons/insert_type_text.png'
			});
			
			ed.onInit.add(function() {
				ed.dom.loadCSS(url + "/css/content.css");
				
				if (ed.theme.onResolveName) {
					ed.theme.onResolveName.add(function(th, o) {
						if (o.node.nodeName == 'SPAN' && ed.dom.hasClass(o.node, 'mceKronosMergeField'))
							o.name = 'kronos_mergefield';
					});
				}
			});
			
			ed.onNodeChange.add(function(ed, cm, n) {
				if(n.nodeName === 'SPAN' && ed.dom.hasClass(n, 'mceKronosMergeField')){
					cm.setActive('kronos_mergefield', true);
				}
				else {
					cm.setActive('kronos_mergefield', false);
				}
			});

			
			ed.onClick.add(function(ed, e) {
				e = e.target;

				if (e.nodeName === 'SPAN' && ed.dom.hasClass(e, 'mceKronosMergeField')){
					ed.selection.select(e);
				}
			});
				
			
			ed.onKeyDown.add(function(ed, e) {
				var node = ed.selection.getNode();
				var previous_node = false;
				var next_node = false;
				
				if(!IE){ //IE Have a poor rage support.
					var rng = ed.selection.getRng();
					var start = rng.startContainer;
					if(start && (start.nodeType != 3 || (start.nodeType == 3 && rng.startOffset == 0))){
						var n = start;
						while(n != null && n.previousSibling == null){
							n = n.parentNode;
						}
						
						if(n != null){
							previous_node = n.previousSibling;
						}
					}
		
					var end = rng.startContainer;
					if(end && (end.nodeType != 3 || (end.nodeType == 3 && rng.endOffset == start.nodeValue.length))){
						var n = end;
						while(n != null && n.nextSibling == null){
							n = n.parentNode;
						}
						
						if(n != null){
							next_node = n.nextSibling;
						}
					}
				}
				
				
				var a = (node.nodeName === 'SPAN' && ed.dom.hasClass(node, 'mceKronosMergeField'));
				if(!IE){
					var b = (previous_node && previous_node.nodeName === 'SPAN' && ed.dom.hasClass(previous_node, 'mceKronosMergeField'));
					var c = (next_node && next_node.nodeName === 'SPAN' && ed.dom.hasClass(next_node, 'mceKronosMergeField'));
				}
				
				switch(e.keyCode){
					case 8: // Backspace
						if(IE && a){
							node.parentNode.removeChild(node);
						}
						else if(a && previous_node == false){
							node.parentNode.removeChild(node);
						}
						else if(b){
							previous_node.parentNode.removeChild(previous_node);
						}
						break;
					case 46: // Delete
						if(IE && a){
							node.parentNode.removeChild(node);
						}
						else if(a && next_node == false){
							node.parentNode.removeChild(node);
						}
						else if(c){
							next_node.parentNode.removeChild(next_node);
						}
						break;	
				}

			});
			
			ed.onKeyPress.add(function(ed, e) {
				var node = ed.selection.getNode();

				if(node.nodeName === 'SPAN' && ed.dom.hasClass(node, 'mceKronosMergeField')){
					switch(e.keyCode){
						case 8: case 46:case 37: case 38: case 39:case 40:
							return true;
					}

					if(!IE){ //IE Have a poor rage support.
						
						//Left boundary
						var rng = ed.selection.getRng();
						var start = rng.startContainer;
						if(start && (start.nodeType != 3 || (start.nodeType == 3 && rng.startOffset == 0))){
							var n = start;
							while(n != null && n.previousSibling == null){
								n = n.parentNode;
							}
							
							if(n != null){
								previous_node = n.previousSibling;
								if(previous_node){
									ed.selection.select(previous_node);
									ed.selection.getSel().collapseToEnd();
									ed.controlManager.setActive('kronos_mergefield', false);
								}
							}
							
							return true;
						}
						
						//Right boundary
						var end = rng.startContainer;
						if(end && (end.nodeType != 3 || (end.nodeType == 3 && rng.endOffset == start.nodeValue.length))){
							var n = end;
							while(n != null && n.nextSibling == null){
								n = n.parentNode;
							}
							
							if(n != null){
								next_node = n.nextSibling;
								if(next_node){
									if(WebKit) next_node.parentNode.insertBefore(document.createTextNode(' '), next_node); //Webkit selection bug
									ed.selection.select(next_node);
									ed.selection.getSel().collapseToStart();
									ed.controlManager.setActive('kronos_mergefield', false);
								}
							}
							
							return true;
						}
					}
					
					
					
					if(IE){
						e.returnValue = false;
						e.cancelBubble = true;
					}
					else {
						e.preventDefault();
						e.stopPropagation();
					}

					return false;
					
				}

			});
		},
		
		getInfo : function() {
			return {
				longname : 'Integration with Kronos Web',
				author : 'Kronostechnologies inc.',
				authorurl : 'http://kronos-web.com',
				infourl : 'http://kronos-web.com',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		},


		/**
		 * Creates control instances based in the incomming name. This method is normally not
		 * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
		 * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
		 * method can be used to create those.
		 *
		 * @param {String} n Name of the control to create.
		 * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
		 * @return {tinymce.ui.Control} New control instance or null if no control was created.
		 */ 
		createControl : function(n, cm) {
			switch(n){
				case 'themeselect':

				var mflb = cm.createListBox('themeselect',
				{
					title : 'kronos.themeselect_desc',
					onselect : function(v){
						tinyMCE.activeEditor.execCommand('mceSelectTheme', false, v);
					}
				});
				
				var theme_list = tinyMCE.activeEditor.kronos_theme_def;
				if(theme_list){
					for(var theme_id in theme_list){
						mflb.add(theme_list[theme_id]['label'], theme_id);
					}
				}
				
				return mflb;
			}

			return null;
		},

		_postProcess : function(ed, o) {
			//Fix comments in sctyle content
			var t = this, c = o.content;
			c = c.replace(/<style>\s*&lt;!--/, '<style>\n<!--');
			o.content = c.replace(/--&gt;\s*<\/style>/, '-->\n</style>');
		},

		_setContent : function(ed, o) {
			var t = this, c = o.content;
			this.doc_header = '';
			this.head = '';
			this.body_header = '';
			this.doc_footer = '';
			
			// Parse out head, body and footer
			var start_body = c.indexOf('<body');
			if (start_body == -1)
				start_body = c.indexOf('<BODY');

			if (start_body != -1) {
				end_body = c.indexOf('>', start_body);
				
				var start_head = c.indexOf('<head');
				if (start_head == -1)
					start_head = c.indexOf('<HEAD');
				
				if(start_head != -1){
					var end_head = c.indexOf('</head>');
					if (end_head == -1)
						end_head = c.indexOf('</HEAD>');
				}
					
				
				if(start_head != -1 && end_head != -1){
					this.doc_header = c.substring(0, start_head);
					this.head = c.substring(start_head, end_head+7);
					this.body_header = c.substring(end_head+7, end_body+1);
				}
				
				else {
					this.doc_header = c.substring(0, start_body);
					this.head = '<head></head>';
					this.body_header = c.substring(start_body, end_body+1);
				}
					
				

				ep = c.indexOf('</body', end_body);
				if (ep == -1)
					ep = c.indexOf('</body', ep);

				o.content = c.substring(end_body + 1, ep);
				t.doc_footer = c.substring(ep);
			} else {
				this.doc_header = '<html>';
				this.head = '<head></head>';
				this.body_header = '<body>';
				this.doc_footer = '</body></html>';
			}
			
			if(this.head  != '' && this.head != '<head></head>'){
				//Try to find theme
				var matches = this.head.match(new RegExp("<style id=\"kronos_theme\" name=\"([^\"]*?)\""));
				if(matches){
					t.theme_name = matches[1];
				}
			}

		},

		_getContent : function(ed, o) {
			var t = this;
			o.content = tinymce.trim(t.doc_header) + tinymce.trim(t.head) + tinymce.trim(t.body_header) + '\n' + tinymce.trim(o.content) + '\n' + tinymce.trim(t.doc_footer);
			
		},
		
		_setDefaultTheme : function(ed, o) {
			var t = this;
			
			if(!t.theme_name && t.default_theme){
				t.theme_name = t.default_theme;
			}
			
			if(!t.theme_name){
				t._selectTheme(0);
				return;
			}
			
			var list = ed.controlManager.get('themeselect');
			list.select(t.theme_name);
			
			t._selectTheme(t.theme_name);
		},
		

		_selectTheme : function(v) {
			var t = this;
			var ed = t.editor;
			var doc = ed.dom.doc;

			if(IE){
				//I HATE IE
				for ( i = 0; i < doc.styleSheets.length; i++ ) {
					if(doc.styleSheets(i).title == 'kronos_theme'){
						var ss = doc.styleSheets(i);
						break;
					}
				}

				if(!ss){
					var ss = doc.createStyleSheet();
				}
				ss.cssText = ed.kronos_theme_def[v]['css_text'];
				ss.title = 'kronos_theme';
			}
			else {
				var style = doc.getElementById('kronos_theme');
				if(!style){
					var node_list = doc.getElementsByTagName('head');
					var head = node_list[0];
					var style = doc.createElement('style');
					style.setAttribute('type', 'text/css');
					style.setAttribute('id', 'kronos_theme');
					head.appendChild(style);
				}

				style.innerHTML = ed.kronos_theme_def[v]['css_text'];
			}

			var bg = ed.kronos_theme_def[v]['bg'];
			if(bg){
				doc.body.background = bg;
				doc.body.style.background = 'url(' + bg + ')';

				var bg_pos = t.body_header.indexOf('background');
				if(bg_pos != -1){
					t.body_header =	t.body_header.replace(new RegExp("background=\"[^\"]*?\""), 'background="' + bg + '"');
				}
				else {
					t.body_header =	t.body_header.replace(/>/, ' background="' + bg + '">');
				}

			}
			else {
				doc.body.background = '';
				doc.body.style.background = '';

				var bg_pos = t.body_header.indexOf('background');
				if(bg_pos != -1){
					t.body_header =	t.body_header.replace(new RegExp("background=\"[^\"]*?\""), '');
				}
			}

			t.head = '<head><style id="kronos_theme" name="' + v + '" type="text/css">' + ed.kronos_theme_def[v]['css_text'] + '</style></head>';
		},
	
		_createMergeFieldSelect : function() {
			var c, t = this;
            c = t.editor.controlManager.createListBox('mergefieldselect', {title : 'mergefield_select', cmd : 'FormatBlock'});

            return c;
      	}
      	
	});

	// Register plugin
	tinymce.PluginManager.add('kronos', tinymce.plugins.Kronos);

})();

