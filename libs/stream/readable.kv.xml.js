aPackage('nart.stream.readable.kv.xml', () => {

	var ReadableKv = aRequire('nart.stream.readable.kv'),
		protoOf = aRequire('nart.util.class').proto,
		XmlWriter = aRequire('nart.util.xml.writer');
		
	var XmlKvStream = function(rootTagName, rootTagAttrs){
		if(!(this instanceof XmlKvStream)) return new XmlKvStream(rootTagName, rootTagAttrs);
		ReadableKv.call(this, true);
		this._read = () => {}
		this.isFirstKv = true;
		this.w = new XmlWriter();
		
		this.rootTagName = rootTagName;
		this.rootTagAttrs = rootTagAttrs || {};
	}
	
	XmlKvStream.prototype = protoOf(ReadableKv, {
		_writeKeyValue: function(k, v, cb){
			if(this.isFirstKv){
				this.isFirstKv = false;
				this.push(this.w.header() + '\n\r' + this.w.openTag(this.rootTagName, this.rootTagAttrs, 0))
			}
			this.push('\n\r' + this.w.objectToXml(k, v, 1));
			cb();
		},
		finish: function(cb){
			this.push('\n\r' + this.w.closeTag(this.rootTagName, 0))
			this.push(null);
			cb && cb();
		}
	})
	
	return XmlKvStream;

})