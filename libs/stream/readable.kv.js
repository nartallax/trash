aPackage('nart.stream.readable.kv', () => {

	var ReadableStream = aRequire.node('stream').Readable,
		protoOf = aRequire('nart.util.class').proto;

	var ReadableKv = function(allowDuplicate){
		//if(!(this instanceof ReadableKv)) return new ReadableKv();
		ReadableStream.call(this);
		//this._read = () => {};
		this.writtenKeys = {};
		this.valuePreprocessors = [];
		this.keyPreprocessors = [];
		this.allowDuplicate = allowDuplicate;
	}
	
	ReadableKv.prototype = protoOf(ReadableStream, {
		writeKeyValue: function(k, v, cb){
			this.keyPreprocessors.forEach(p => k = p(k, v));
			
			if(!this.allowDuplicate){
				if(k in this.writtenKeys) return cb(new Error('Could not write to readable kv stream: duplicate key "' + k + '"'))
				this.writtenKeys[k] = true;
			}
			
			this.valuePreprocessors.forEach(p => v = p(v, k))
			
			this._writeKeyValue(k, v, cb);
		},
		addKeyPreprocessor: function(f){
			if(typeof(f) !== 'function') throw new Error('Could add non-callable value "' + f + '" as preprocessor.');
			this.keyPreprocessors.push(f);
			return this;
		},
		addValuePreprocessor: function(f){
			if(typeof(f) !== 'function') throw new Error('Could add non-callable value "' + f + '" as preprocessor.');
			this.valuePreprocessors.push(f);
			return this;
		},
		_writeKeyValue: function(k, v, cb){
			throw new Error('Method "_writeKeyValue" of ReadableKeyValueStream is not implemented.');
		},
		finish: function(cb){
			this.end();
			cb();
		}
	});
	
	return ReadableKv;

})