// несколько функций, позволяющих относительно незаметно прикрепить к объекту кусочек данных

// TODO: сейчас эти функции просто определяют неперечисляемое свойство, в которое и складывают значения;
// можно сделать то же самое как-нибудь хитрее, во имя улучшения инкапсуляции
// реальных причин этого делать пока нет, все работает и так
aPackage('nart.util.object.attach', () => {

	// длинный и достаточно уникальный ключ
	var key = '_____nart_util_object_attach_data_storage_object';
	
	return {
		attach: (obj, name, value) => {
			var aobj;
			if(obj.hasOwnProperty(key)){
				aobj = obj[key];
			} else {
				aobj = {};
				Object.defineProperty(obj, key, {
					writable: true,
					enumerable: false,
					configurable: true,
					value: aobj
				})
			}
			
			return aobj[name] = value;
		},
		getAttached: (obj, name) => {
			obj = obj || {};
			return obj.hasOwnProperty(key)? obj[key][name]: undefined;
		},
		detach: (obj, name) => { 
			obj = obj || {};
			if(obj.hasOwnProperty(key)){
				delete obj[key][name];
			}
		}
	}

});