tinyMCEPopup.requireLangPack();

var AddMergeFieldDialog = {
        init : function(ed) {
        	var t = this;
        	
        	var select = document.getElementById('mergefield_list');
        
        	
        	var node = ed.selection.getNode();
        	if(node.nodeName === 'SPAN' && ed.dom.hasClass(node, 'mceKronosMergeField')){
        		t.current_field_node = node;
        		t.current_field_id = node.getAttribute('kronos_field_id');
        	}
        	
        	var list = tinyMCE.activeEditor.getParam('kronos_mergefield_list');
        	if(list){
				for(var i=0;i<list.length;i++){
					var field = list[i];
					var opt = document.createElement('option');
        			opt.value = field.id;
        			opt.appendChild(window.document.createTextNode(field.label));
        			select.appendChild(opt);
				}
        		
        		if(t.current_field_id){
        			select.value = t.current_field_id;
        		}
        	}
				
            tinyMCEPopup.resizeToInnerSize();
        },

        insert : function(file, title) {
            var t = this;    
        	var ed = tinyMCEPopup.editor, dom = ed.dom;

            var select = document.getElementById('mergefield_list');
                
            var value = select.value;
            var label = select.options[select.selectedIndex].text;
                
            var str = '<span class="mceKronosMergeField" kronos_field_id="' + value + '">{'  + label + '}</span>';
            
            if(t.current_field_node){
       			ed.selection.select(t.current_field_node);
       			ed.selection.setContent(str);
            }
            else {
            	tinyMCEPopup.execCommand('mceInsertContent', false, ' ' + str + ' ');
            }

            tinyMCEPopup.close();
        }
};

tinyMCEPopup.onInit.add(AddMergeFieldDialog.init, AddMergeFieldDialog);
