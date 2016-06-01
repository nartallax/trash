aPackage('nart.html.tag', () => {

	var tag = (name, attrs) => {
		attrs = attrs || {};
		var result = document.createElement(name);
		
		if('class' in attrs) {
			result.className = attrs['class'];
			delete attrs['class'];
		}
		
		if('style' in attrs) {
			result.style.cssText = attrs['style'];
			delete attrs['style'];
		}
		
		if('text' in attrs){
			result.textContent = attrs.text;
			delete attrs.text;
		}
		
		if('children' in attrs){
			attrs.children.forEach(ch => result.appendChild(typeof(ch) === 'string'? tag('span', {text: ch}): ch))
			delete attrs.children;
		}
		
		for(var i in attrs) {
			if(i.startsWith('on')){
				result[i] = attrs[i] // directly assigned event listeners
			} else {
				result.setAttribute(i, attrs[i]);
			}
		}
		return result;
	}
	
	return tag;

})