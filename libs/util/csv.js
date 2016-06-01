aPackage('nart.util.csv', () => {

	var Writer = function(){
		this.headers = [];
		this.presentHeaders = {}; // to make search faster
		this.autoHeaders = true;
		this.lines = [];
	}
	
	Writer.prototype = {
		quote: c => '"' + (c + '').replace(/"/g, '""') + '"',
		arrayToLine: arr => arr.map(Writer.prototype.quote).join(','),
		objectToLine: function(obj){
			return this.arrayToLine(this.extractUpdateHeaders(obj).map(h => h in obj? obj[h]: ''));
		},
		extractUpdateHeaders: function(obj){
			if(this.autoHeaders){
				for(var i in obj) {
					if(!(i in this.presentHeaders)) {
						this.headers.push(i);
						this.presentHeaders[i] = true;
					}
				}
			}
			
			return this.headers;
		},
		setHeaders: function(arr){
			this.autoHeaders = false;
			this.headers = arr;
			return this;
		},
		append: function(smth){
			switch(typeof(smth)){
				case 'object':
					if(smth === null) {
						this.append('null');
					} else if(Array.isArray(smth)) {
						this.lines.push(this.arrayToLine(smth));
					} else {
						this.lines.push(this.objectToLine(smth));
					}
					break;
				default: 
					this.lines.push(this.quote(smth));
					break;
			}
			return this;
		},
		appendAll: function(arr){
			arr.forEach(l => this.append(l))
			return this;
		},
		toString: function(){ return this.getResult() },
		getResult: function(){ return this.arrayToLine(this.headers) + '\n' + this.lines.join('\n\r') }
	}

	return Writer;
	
});