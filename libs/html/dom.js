aPackage('nart.html.dom', () => {

	var parser = aRequire.node("cheerio");
	
	return (html, cb) => {
		
		cb(null, parser.load(html))
		
		/*
		var handler = new parser.DomHandler(cb);
		var p = new parser.Parser(handler);
		p.write(html);
		p.done();
		*/
	}

});