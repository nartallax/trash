// класс для учета расписания чего-либо
// например, еженедельный запуск какого-либо процесса
aPackage('nart.tasking.scheduler', () => {
	
	var fs = aRequire.node('fs'),
		err = aRequire('nart.util.err'),
		log = aRequire('nart.util.log'),
		putFile = aRequire('nart.util.fs').putFile,
		unixtime = aRequire('nart.util.time').unixtime;
	
	// runTask = (taskData, cb) => { ... }
	// cb should be called after SUCCESSFUL task start
	// the task will not be attempted to start again as long as cb is not called
	// callback is needed to get a correct lastSuccessfulStart time
	var Scheduler = function(schedulePath, runTask, cb){
		if(!(this instanceof Scheduler)) return new Scheduler(schedulePath, cb);
		
		this.path = schedulePath;
		this.runTask = runTask;
		
		this.schedule = {};
		this.launchState = {};
		
		this.readData(sc => {
			this.schedule = sc;
			this.updateId();
			cb && cb(this);
		});
		
		this.interval = setInterval(() => {
			var now = unixtime();
			
			Object.keys(this.schedule).map(id => {
				var item = this.schedule[id],
					// время, когда таска должна была попробовать запуститься
					lastExpectedStartTime = now - ((now - item.startsAt) % item.frequency);
				
				if(item.startsAt > now) return; // еще рано для этой таски
				
				// если после времени ожидаемого последнего запуска был хотя бы один успешный запуск, не запускаем еще раз
				if((item.lastSuccessfulStart || 0) >= lastExpectedStartTime) return
				
				// если таска уже в процессе запуска, не пробуем запускать её еще раз
				if(this.launchState[id] === 'starting') return;
				this.launchState[id] = 'starting';
				
				this.runTask(item.data, () => {
					delete this.launchState[id]
					item.lastSuccessfulStart = unixtime();
					this.writeData();
				});
			})
		}, 1000);
	}
	
	var addItemInner = function(props, id, cb){
		var frequency = props.frequency,
			startsAt = props.startsAt || unixtime(),
			data = props.data || {};
			
		if(!frequency) throw new Error('Failed to add item to schedule: frequency is not passed with other parameters.');
		
		this.schedule[id] = {
			frequency: frequency,
			startsAt: startsAt,
			data: data,
			lastSuccessfulStart: props.lastSuccessfulStart
		};
		
		this.writeData(() => cb && cb(id));
	}
	
	Scheduler.prototype = {
		readData: function(cb){
			fs.readFile(this.path, 'utf8', (e, text) => {
				if(e && !e.message.startsWith('ENOENT')) log(e);
				cb(JSON.parse(text || '{}'));
			});
		},
		writeData: function(cb){
			putFile(this.path, JSON.stringify(this.schedule), cb);
		},
		
		updateId: function(){
			this.id = 0;
			Object.keys(this.schedule).forEach(k => {
				k = parseInt(k);
				(k > this.id) && (this.id = k);
			})
		},
		nextId: function(){
			return ++this.id;
		},
		
		addItem: function(props, cb){
			addItemInner.call(this, {
				frequency: props.frequency,
				startsAt: props.startsAt,
				data: props.data
			}, this.nextId(), cb);
		},
		
		removeItem: function(id, cb){
			if(!(id in this.schedule)) throw new Error('Could not delete schedule item #' + id + ': there is no item with this id in schedule.');
			delete this.schedule[id];
			this.writeData(cb);
		},
		
		replaceItem: function(id, props, cb){
			if(!(id in this.schedule)) throw new Error('Could not replace schedule item #' + id + ': there is no item with this id in schedule.');
			props.lastSuccessfulStart = this.schedule[id].lastSuccessfulStart;
			delete this.schedule[id];
			addItemInner.call(this, props, id, cb);
		},
		
		getItems: function(){
			return Object.keys(this.schedule).map(id => {
				var item = this.schedule[id];
				return {
					id: parseInt(id),
					frequency: item.frequency,
					startsAt: item.startsAt,
					lastSuccessfulStart: item.lastSuccessfulStart || null,
					data: JSON.parse(JSON.stringify(item.data)) // copying
				}
			});
		}
	}
	
	

	
	return Scheduler;
	
});