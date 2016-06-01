aPackage('nart.util.queue.async.uniq', () => {

	var classBasedOn = aRequire('nart.util.class').classBasedOn,
		AsyncQueue = aRequire('nart.util.queue.async');

	// то же самое, что и просто AsyncQueue, только не принимает ранее обработанные элементы
	var AsyncUniqQueue = classBasedOn(AsyncQueue, function(proc, onAdd, onRemove, getUniqKey){
		this.keyOf = getUniqKey;
		this.processed = {};
	}, {
		add: function(el){
			var key = this.keyOf(el);
			if(key in this.processed) return;
			this.processed[key] = true;
			this.super.add.call(this, el);
		}
	});
	
	return AsyncUniqQueue;
})