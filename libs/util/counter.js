aPackage('nart.util.counter', () => {

	var fs = aRequire.node('fs'),
		locks = aRequire('nart.util.locks'),
		log = aRequire('nart.util.log'),
		putFile = aRequire('nart.util.fs').putFile,
		reverse = aRequire('nart.util.collections').reverse;

	var generateArray = ab => ab.split('');
	var generateMap = arr => {
		var res = {};
		for(var i = 0; i < arr.length; i++) res[arr[i]] = i;
		return res;
	}
		
	var exists = f => {
		try {
			fs.statSync(f)
			return true
		} catch (e){ 
			return false
		}
	}
		
	var Counter = function(storageFile, startValue, alphabet, newDigitOffset){
		if(!(this instanceof Counter)) return new Counter(alphabet);
		
		this.arr = generateArray(alphabet || '0123456789');
		this.map = generateMap(this.arr);
		var initVal = exists(storageFile)? fs.readFileSync(storageFile, 'utf8'): arguments.length > 1? startValue: '';
		this.now = reverse(initVal.split(''))
		this.off = arguments.length > 3? newDigitOffset: 1;
		this.storage = storageFile;
	};
	
	Counter.prototype = {
		next: function(cb){ 
			locks.with('idgen_' + this.storage, free => {
				this.now = this.showNextInner();
				var result = reverse(this.now).join('')
				putFile(this.storage, result, () => {
					free();
					cb(result);
				})
			});
		},	
		showNextInner: function(){
			var i = -1, res = [], now = this.now, last = this.arr[this.arr.length - 1];
			while((++i) < now.length){
				if(now[i] === last){
					res.push(this.arr[0]);
					if(i === now.length - 1) { // новый разряд
						res.push(this.arr[this.off]);
					}
				} else {
					res.push(this.arr[this.map[now[i]] + 1])
					break;
				}
			}
			
			while((++i) < now.length) res[i] = now[i];
			
			return res;
		},
		showNext: function(){ return reverse(this.showNextInner()).join('') }
	}
	
	return Counter;
	
}); 