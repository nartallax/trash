aPackage('nart.stream.readable.kv.json.object', () => {

	var ReadableKv = aRequire('nart.stream.readable.kv'),
		protoOf = aRequire('nart.util.class').proto;
		
	var JsonObjectStream = function(){
		if(!(this instanceof JsonObjectStream)) return new JsonObjectStream();
		ReadableKv.call(this);
		this._read = () => {}
		this.isFirstKv = true;
	}
	
	JsonObjectStream.prototype = protoOf(ReadableKv, {
		_writeKeyValue: function(k, v, cb){
			if(this.isFirstKv){
				this.isFirstKv = false;
				this.push('{');
			} else this.push(',');
			
			this.push(JSON.stringify(k) + ':' + JSON.stringify(v));
			cb();
		},
		finish: function(cb){
			this.push('}');
			this.push(null);
			cb && cb();
		}
	})
	
	return JsonObjectStream;

})