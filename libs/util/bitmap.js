aPackage('nart.util.bitmap', () => {
	
	var esize = 48; // на самом деле, JS гарантирует несколько больше бит без потери точности, ну да ладно
	
	var Bitmap = function(w, h){
		if(!(this instanceof Bitmap)) return new Bitmap(w, h);
		this.arr = [];
		this.elCount = Math.ceil((w * h) / this.esize);
		this.w = w;
		this.h = h;
	}
	
	var shifted = n => {
		var x = 1;
		while(n-->0) x <<= 1;
		return x;
	}
	
	var setAt = (n, o) => (n | shifted(o))
	var getAt = (n, o) => ((n & shifted(o))? 1: 0)
	var count = n => {
		var c = 0, x = 1, l = esize;
		while(l-->=0) (((n & x) && c++), x <<= 1)
		return c;
	}
	
	Bitmap.prototype = {
		resetAll: function(){
			this.arr = [];
			var i = this.elCount;
		
			while(i-->0) this.arr.push(0);
		},
		coord2num: function(x, y){ return (y * this.w) + x }, 
		num2coord: function(n){ return {x: n % this.w, y: Math.floor(n / this.w)} },
		set: function(x, y){
			var n = this.coord2num(x, y),
				i = Math.floor(n / esize);
				
			this.arr[i] = setAt(i, n % esize);
		},
		get: function(x, y){
			var n = this.coord2num(x, y),
				i = Math.floor(n / esize);
				
			return getAt(this.arr[i], n % esize);
		},
		// обходит по горизонтали, зацикливается
		// если вернулся в точку старта - null
		findUnset: function(x, y, skip){
			skip = skip || 0;
			var n = this.coord2num(x, y), i = Math.floor(n / esize);
			
			STOP 
			THIS CLASS IS NOT FULLY IMPLEMENTED
			
			
		}
	}
	
	
	
	return Bitmap;

})