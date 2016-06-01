// очередь асинхронно последовательно (в смысле, по одному за раз; LIFO) обрабатываемых элементов
aPackage('nart.util.queue.async', () => {

	var AsyncQueue = function(processElement, onElementAdded, onElementDone){
		if(!(this instanceof AsyncQueue)) return new AsyncQueue(processElement, onElementAdded, onElementDone);
		this.elements = [];
		this.processElement = processElement;
		this.onElementAdded = onElementAdded;
		this.onElementDone = onElementDone;
		this.isProcessing = false;
		this.isPaused = false;
	}
	
	AsyncQueue.prototype = {
		add: function(el){
			this.elements.push(el);
			this.onElementAdded(el);
			this.run();
		},
		run: function(){
			if(this.isProcessing || this.isPaused) return;
			
			if(this.elements.length < 1){
				this.isProcessing = false;
				return;
			}
			this.isProcessing = true;
			
			var el = this.elements.pop();
			
			try {
				this.processElement(el, () => {
					this.onElementDone(el);
					this.isProcessing = false;
					this.run();
				});
			} catch(e){
				log('Got exception processing queue element ' + el + ': ');
				log(e && e.message);
				throw e;
			}
			
		},
		pause: function(){ this.isPaused = true; },
		unpause: function(){ this.isPaused = false; this.run(); },
		size: function(){ return this.elements.length }
	}
	
	return AsyncQueue;
	
})