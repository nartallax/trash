aPackage('nart.stream.readable.kv.zip', () => {

	var ReadableKv = aRequire('nart.stream.readable.kv'),
		protoOf = aRequire('nart.util.class').proto,
		Packer = aRequire.node('zip-stream');
		
	var ZipStream = function(){
		if(!(this instanceof ZipStream)) return new ZipStream();
		
		ReadableKv.call(this);
		Packer.call(this);
	}
	
	ZipStream.prototype = protoOf(Packer, {
		_writeKeyValue: function(k, v, cb){
			Packer.prototype.entry.call(this, v, { name: k }, cb);
		},
		finish: function(cb){
			Packer.prototype.finish.call(this);
			this.end();
			cb && cb();
		}
	})
	
	Object.keys(ReadableKv.prototype).forEach(k => 
		(!(k.charAt(0) === '_') && !(k in ZipStream.prototype)) && 
		(ZipStream.prototype[k] = ReadableKv.prototype[k]));
	
	return ZipStream;


});