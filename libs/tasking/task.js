aPackage('nart.tasking.task', () => {
	
	var maxProgress = 1 << 53;
	
	var putFile = aRequire('nart.util.fs').putFile,
		appendFile = aRequire('nart.util.fs').appendFile,
		fs = aRequire.node('fs'),
		locks = aRequire('nart.util.locks'),
		log = aRequire('nart.util.log'),
		Event = aRequire('nart.util.event'),
		unixtime = aRequire('nart.util.time').unixtime,
		tempIdCounter = 0,
		eachAsync = aRequire('nart.util.collections').eachAsync;
	
	var Task = function(desc, descFile, resultFile){
		this.descFile = descFile;
		this.desc = desc;
		this.resultFile = resultFile;
		this.flushCallbacks = [];
		this.flushWaitTimeout = desc.flushWaitTimeout || 1000;
		
		if(!('paused' in this.desc)) this.desc.paused = true;
		if(!('progress' in this.desc)) this.desc.progress = 0;
		if(!('progressLimit' in this.desc)) this.desc.progressLimit = null;
		if(!('work' in this.desc)) this.desc.work = [];
		
		this.tempId = ++tempIdCounter; // for locks; matters only in one run session
		
		this.onStart = new Event(); // started from scratch as well as resumed from pause
		this.onPause = new Event();
		this.onFinish = new Event();
		
		this.onStart(() => {
			this.desc.paused = false;
			setTimeout(() => this.flush())
		})
		
		this.onPause(() => {
			this.desc.paused = true;
			setTimeout(() => this.flush());
		})
		
		if(!this.desc.paused){
			setTimeout(() => {
				this.desc.paused = true;
				this.start();
			}, 1)
		} else {
			setTimeout(() => {
				this.desc.paused = false;
				this.pause();
			}, 1)
		}
		
		if(!this.desc.startedAt){
			this.desc.startedAt = unixtime();
		}
		
		log('Task ' + this.desc.id + ' created.')
		this.flush();
	};
	
	Task.descriptionFromFile = function(file, cb){ 
		fs.readFile(file, 'utf8', (e, data) => {
			e && log(e);
			try {
				data = JSON.parse(data)
			} catch(e){
				log(e);
				data = null;
			}
			cb(data);
		})
	}
	
	Task.tasksInDir = (dirPath, taskFromDesc, cb) => {
		var result = {};
		
		eachAsync(fs.readdirSync(dirPath), (f, cb) => {
			Task.descriptionFromFile(dirPath + '/' + f, desc => {
				try {
					result[desc.id] = taskFromDesc(desc);
				} catch(e){
					log("Failed to load task " + f.replace(/\.json$/, '') + ":")
					log(e);
				}
				
				cb();
			})
		}, () => cb && cb(result))
	}
	
	Task.prototype = {
		getProgress: function(){ return this.desc.progress / this.getProgressLimit() },
		getProgressLimit: function(){ return typeof(this.desc.progressLimit) === 'number'? this.desc.progressLimit: 1 },
		incProgress: function(c){ return (this.desc.progress += (arguments.length > 0? c: 1)), this },
		getFinished: function(){ return this.desc.isFinished },
		finish: function(){
			if(this.desc.isFinished || this.desc.deleted) return;
			this.desc.finishedAt = unixtime();
			this.desc.isFinished = true;
			this.desc.progress = this.getProgressLimit();
			this.flush();
			log('Task ' + this.desc.id + ' finished.');
			this.onFinish.fire();
		},
		addWork: function(w){ this.decs.work.push(w) },
		getWork: function(w){ return this.desc.work.pop() },
		flush: function(cb){
			if(this.desc.deleted) return cb && cb();
			
			this.flushCallbacks.push(cb)
			
			var invokeCallbacks = () => {
				this.flushCallbacks.forEach(cb => cb && cb())
				this.flushCallbacks = [];
			}
			
			var name = 'task_desc_file_before_flush_' + this.tempId;
			if(locks.have(name)) return; // will already flush in a seconds
			locks.with(name, freeBefore => {
				setTimeout(() => {
					locks.with('task_desc_file_' + this.tempId, free => {
						freeBefore();
						
						if(this.desc.deleted){
							return invokeCallbacks();
						} else {
							putFile(this.descFile, JSON.stringify(this.desc), () => {
								free();
								invokeCallbacks();
							})
						}
					})
				}, this.flushWaitTimeout)
			})
		
		},
		appendResult: function(data, cb){
			locks.with('task_result_file_' + this.tempId, free => {
				appendFile(this.resultFile, data, () => {
					free();
					cb && cb();
				})
			})
		},
		delete: function(cb){
			this.pause();
			
			var counter = 3, after = e => {
				e && log(e);
				if((--counter) === 0) {
					log("Task " + this.desc.id + ' deleted.');
					cb && cb();
				}
			}
			
			this.desc.deleted = true;
			fs.unlink(this.descFile, after)
			locks.with('task_desc_file_' + this.tempId, free => {
				fs.unlink(this.resultFile, e => {
					free();
					after(e)
				})
			});
			this.cleanup(after)
		},
		start: function(){ 
			if(this.desc.paused){
				this.onStart.fire();
			}
		},
		pause: function(){
			if(!this.desc.paused){
				this.onPause.fire();
			}
		},
		cleanup: function(cb){ cb()/* could be implemented */ }
	}
	
	return Task;
	
});