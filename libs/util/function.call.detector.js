aPackage('nart.util.function.call.detector', () => {

	/*
		эти переопределения нужны для одной простой цели - отличать вызов функции как конструктора и как-нибудь еще
		в простейшем случае, чтобы проверить, вызвана ли функция как конструктор, достаточно this instanceof MyFunc
		но такой подход совершенно не учитывает возможность MyFunc.call(this)
		это может быть решено, если объекту в момент call будет проставленo objectIsForged
		этот флаг будет однозначно указывать на то, что объект сконструирован раньше, чем вызвана функция-конструктор
	*/
	
	var attach = aRequire('nart.util.object.attach').attach,
		detach = aRequire('nart.util.object.attach').detach,
		getAttached = aRequire('nart.util.object.attach').getAttached,
		
		key = '_____nart_util_function_call_detector_object_is_forged';
	
	var setup = () => {
		var oldCall = Function.prototype.call,
			oldApply = Function.prototype.apply;
		
		oldApply._____call = oldCall;
		
		var clarr = function(arr, start, to){
			to = to || [];
			start = start || 0;
			for(; start < arr.length; start++) to.push(arr[start]);
			return to;
		}
		
		Function.prototype.call = function(self){ 
			if((typeof(self) === 'object' && self !== null) || typeof(self) === 'function'){
				attach(self, key, true);
			}
			
			return oldApply._____call(this, self, clarr(arguments, 1));
		}

		Function.prototype.apply = function(self, args){
			if((typeof(self) === 'object' && self !== null) || typeof(self) === 'function'){
				attach(self, key, true);
			}
			
			return oldApply._____call(this, self, args);
		}
		
		// теоретически, bind и так работает через call
		// но давайте в этом уверимся, написав замену
		// (к тому же, он может работать не через наш замененный call, а через внутренний его аналог)
		Function.prototype.bind = function(self){
			var args = clarr(arguments, 1), theFunction = this;
			
			return function(){
				theFunction.apply(self, clarr(arguments, 0, clarr(args)));
			}
		}
	}
	
	var Detector = {
		isSetUp: false,
		setup: () => {
			if(Detector.isSetUp) return;
			Detector.isSetUp = true;
			
			setup();
		},
		objectIsForged: obj => getAttached(obj, key)? true: false
	}
	
	return Detector;

})