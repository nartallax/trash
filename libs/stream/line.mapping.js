aPackage('nart.stream.line.mapping', () => {

	var ReadableStream = aRequire.node('stream').Readable,
		protoOf = aRequire('nart.util.class').proto,
		Readline = aRequire.node('readline');

	var LineMappingStream = function(sourceStream, mapper){
		ReadableStream.call(this);
		this._read = () => {};
		
		var reader = Readline.createInterface({ input: sourceStream }),
			firstLine = true;
		
		reader.on('line', line => {
			firstLine? (firstLine = false): this.push('\n');
			var mapped = mapper(line);
			if(mapped !== null && mapped !== undefined) this.push(mapped);
		});
		
		sourceStream.on('end', () => {
			this.push(null);
		});
	}
	
	LineMappingStream.prototype = protoOf(ReadableStream);
	
	return LineMappingStream;

});