aPackage('nart.util.countdown.pagebound', () => {

	var Countdown = aRequire('nart.util.countdown');

	// TODO: move this function to separate package
	var onPageLoaded = (cb, intervalSize) => {
		var check = () => {
			if(document.readyState === 'complete'){
				clearInterval(interval);
				cb && cb();
			}
		};
		
		var interval = setInterval(check, intervalSize);
		
		check();
	}

	
	// частный случай Countdown - изначальный счет равен единице, уменьшается на 1 после полной загрузке страницы и таймаута
	// подразумевается, что в течение этого времени на странице случится что-то еще, что поколеблет его счет
	var PageBoundCountdown = function(onZero, timeout, checkInterval){
		if(this instanceof PageBoundCountdown) return PageBoundCountdown(onZero, timeout);
		var counter = new Countdown(1, onZero);
		onPageLoaded(
			() => setTimeout(counter.dec, timeout || PageBoundCountdown.defaultTimeout), 
			checkInterval || PageBoundCountdown.defaultCheckInterval
		);
		return counter;
	}
	
	PageBoundCountdown.defaultTimeout = 10000;
	PageBoundCountdown.defaultCheckInterval = 100;
	
	return PageBoundCountdown;

})