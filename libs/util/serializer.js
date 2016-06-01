// эти функции сериализуют/десериализуют данные в некоторый простой формат
aPackage('nart.util.serializer', () => {
	var Serializer = {
		stringify: (() => {
			
			var stringify = smth => {
				switch(typeof(smth)){
					case 'boolean': 	return smth? 't': 'f';
					case 'number':	return 'd' + smth.toString(10);
					case 'string': 	return 's' + smth.length + '|' + smth;
					
					case 'undefined':
					case 'function':	return 'n';
					
					case 'object':
						if(smth === null) return 'n';
						
						if(Array.isArray(smth)){
							return 'a' + smth.length + '|' + smth.map(stringify).join('');
						} else {
							var keys = Object.keys(smth);
							return 'o' + keys.length + '|' + keys.map(k => stringify(k) + stringify(smth[k])).join('');
						}
						
					default: throw new Error('Unknown value type: "' + typeof(obj) + '"');
				}
			}
			
			return stringify
			
		})(),
		
		parse: (() => {
			
			var numDelimiter = '|';
			var digs = (() => {
				var arr = '0123456789-.'.split(''), res = {};
				arr.forEach(dig => res[dig] = true);
				return res;
			})()
			
			var numStrAt = (str, pos) => {
				var numStr = '';
				while(digs[str.charAt(pos)]){
					numStr += str.charAt(pos);
					pos++;
				}
				return numStr;
			}
			
			var Parser = function(str){ this.str = typeof(str) === 'string'? str: (str || '') + ''; this.pos = 0 };
			
			Parser.prototype = {
				get: function(n){ return this.str.substr(this.pos, typeof(n) === 'number'? n: 1) },
				inc: function(n){ return this.pos += (typeof(n) === 'number'? n: 1) },
				gin: function(n){ 
					var res = this.get(n);
					this.inc(n);
					return res;
				},
				num: function(delimiterLength){
					var numStr = numStrAt(this.str, this.pos);
					this.pos += numStr.length + (typeof(delimiterLength) === 'number'? delimiterLength: 1);
					return parseFloat(numStr);
				}
			}
			
			var parseInner = p => {
				var identifier = p.gin();
				if(identifier === ''){
					return undefined;
				}
				
				switch(identifier){
					case 't': return true;
					case 'f': return false;
					case 'n': return null;
					case 'd': return p.num(0);
					case 's': return p.gin(p.num());
					case 'a':
						var len = p.num(), result = [];
						while(len-->0) result.push(parseInner(p));
						return result;
					case 'o':
						var len = p.num(), result = {};
						while(len-->0) {
							var key = parseInner(p);
							var value = parseInner(p)
							result[key] = value;
						}
						return result;
					default: throw 'Malformed sequence: unknown identifier "' + identifier + '"';
				}
			}
			
			var parse = str => parseInner(new Parser(str))
			
			return parse;
			
		})()
	}
	
	return Serializer;
})