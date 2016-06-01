aPackage('nart.util.fskv', () => {
	"use strict";
	
	var locks = aRequire('nart.util.locks'),
		log = aRequire('nart.util.log'),
		Event = aRequire('nart.util.event'),
		fs = aRequire.node('fs'),
		putFile = aRequire('nart.util.fs').putFile;
	
	var id = 0;
	
	// ends with path separator
	var FSKV = function(dir){
		if(!(this instanceof FSKV)) return new FSKV(dir);
		
		try {
			fs.mkdirSync(dir);
		} catch(e) {}
		
		this.dir = dir
		this.id = id++;
	}
	
	FSKV.prototype = {	
		lockItem: function(name, cb){ return locks.with('fskw_file_' + name + '_' + this.id, cb), this },
		
		filename: function(name){ return this.dir + name + '.json' },
		
		setWithoutLock: function(name, data, after){
			putFile(this.filename(name), JSON.stringify(data), after);
		},
		
		set: function(name, data, after){
			return this.lockItem(name, free => {
				this.setWithoutLock(name, data, () => {
					free();
					after();
				})
			})
		},
		
		getWithoutLock: function(name, after){
			fs.readFile(this.filename(name), 'utf8', (e, data) => {
				e && log(e);
				after((data && JSON.parse(data || 'null')))
			})
		},
		
		get: function(name, after){
			return this.lockItem(name, free => {
				this.getWithoutLock(name, d => {
					free();
					after(d)
				})
			})
		},
		
		// returns boolean. true = new record created, false = record exists
		create: function(name, data, after){
			return this.lockItem(name, free => {
				fs.stat(this.filename(name), answer => {
					if(!answer) return free(), after(false);
					this.setWithoutLock(name, data, () => { free(), after(true) });
				})
			})
		},
		
		keys: function(after){
			fs.readdir(this.dir, (e, list) => {
				e && log(e);
				return after((list || []).map(i => i.replace(/\.json$/, '')))
			})
			return this;
		},
		
		alter: function(name, body, after){
			return this.lockItem(name, free => {
				this.getWithoutLock(name, source => {
					body(source, (result, noWrite) => {
						var afterWrite = () => { free(), after() }
						
						noWrite? afterWrite(): this.setWithoutLock(name, result, afterWrite)
					})
				})
			})
		}
	};
	
	return FSKV;
	
})