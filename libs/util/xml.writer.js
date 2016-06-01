// простейший наколенный конвертер объектов в xml
aPackage('nart.util.xml.writer', () => {

	var Writer = function(letterRegexGroupContentString, charset){
		if(!(this instanceof Writer)) return new Writer();
		this.nonNameChars = new RegExp('[^' + (letterRegexGroupContentString || 'a-zA-Z') + '\\d\\-_:]', 'g');
		this.charset = charset || 'UTF-8';
	}
	
	Writer.prototype = {
		header: function(){ return '<?xml version="1.0" encoding="' + this.content(this.charset) + '"?>' },
		
		objectToXml: function(tagName, o, tabs){
			tabs = tabs || 0;
			switch(typeof(o)){
				
				case 'function':
				case 'undefined': return '';
				
				case 'string':
				case 'number':
				case 'boolean': return this.tag(tagName, {}, this.tabs(tabs + 1) + this.content(o + ''), tabs);
				
				case 'object':
					if(o === null) return '';
					if(Array.isArray(o)){
						return o.map(i => this.objectToXml(tagName, i, tabs)).filter(i => i).join('\n');
					} else {
						var content = Object.keys(o).map(n => this.objectToXml(n, o[n], tabs + 1)).filter(i => i).join('\n')
						return this.tag(tagName, {}, content, tabs)
					}
				
				default: throw 'Could not convert object to XML: unknown type "' + typeof(o) + '"';
			}
		},
		
		name: function(raw){ return (raw + '').replace(this.nonNameChars, '') },
		content: function(raw){ 
			return (raw + '')
				.replace(/&/g, '&amp;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&apos;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');
		},
		
		// TODO: optimize here
		tabs: function(count){ return new Array((count || 0) + 1).join('\t') },
		
		openTag: function(name, attrs, tabs){
			var ident = this.tabs(tabs);
			name = this.name(name);
			
			attrs = (typeof(attrs) === 'object' && attrs !== null)? 
				Object.keys(attrs).map(name => this.name(name) + '="' + this.content(attrs[name]) + '"').join(' '):
				'';
			
			return ident + '<' + name + (attrs? ' ' + attrs: '') + '>';
		},
		
		closeTag: function(name, tabs){
			return this.tabs(tabs) + '</' + this.name(name) + '>'
		},
		
		tag: function(name, attrs, inner, tabs){
			var ident = this.tabs(tabs);
			name = this.name(name);
			return this.openTag(name, attrs, tabs) + '\n' + inner + '\n' + this.closeTag(name, tabs);
		}
	};
	
	return Writer;
	
})