(function(){

	var KEY = 'manualresults';
	var NOTE = 'manualnotes';

	function cut(str, end){
		var arr = str.split('/');
		if(end){
			var tail = arr.pop();
			var pref = arr.join('/');
			
		}else{
			var pref = arr.shift();
			var tail = arr.join('/');
		}
		return [pref, tail];
	}

	function format(arr){
		var res = {};
		$.each(arr, function(ind, item){
			var cutted = cut(item);
			var section = cutted[0];
			if(!res[section]){
				res[section] = {keys:['root'], root: []};
			}
			cutted = cut(cutted[1], true);
			var type = cutted[0] || 'root';
			if(!res[section][type]){
				res[section][type] = [cutted[1]];
				res[section]['keys'].push(type);
			}else{
				res[section][type].push(cutted[1]);
			}
		});
		return res;
	}

	$.ajax({
		url: '/getFiles'
	})
	.done(function(res){
		var dirObj = format(res);
		var str = '';
		$.each(dirObj, function(sec, secObj){
 			str += '<section id="'+ sec +'">';
 			str += '<p class="sec-header">'+sec+'</p>';
 			$.each(secObj['keys'], function(ind, key){
 				var arr = secObj[key];
 				if(key != 'root') str += '<p class="type-item">'+key+'</p>';
 				str += '<ul>';
 				$.each(arr, function(i, a){
 					var href = '/container.html?u=/testCases/'+sec+(key=='root'?'':'/'+key)+'/'+a;
 					str += '<li><a target="_blank" href="'+href+'">'+a+'</a>&nbsp;&nbsp;<a target="_blank" href="'+href+'&noifr=1">simple<a></li>';
 	   			});
 				str += '</ul>';
 			});
 			str += '</section>';
		});
		document.getElementById('content').innerHTML = str;
	});

	window.beforeStart = function(){
		localStorage.setItem(KEY, '');
		localStorage.setItem(NOTE, '');
	}
	window.endTest = function(){
		$('#saveResults .form-item').val('');
		$('#saveResults input[name="results"]').val(localStorage.getItem(KEY));
		$('#saveResults input[name="notes"]').val(localStorage.getItem(NOTE));
		$('#saveResults').show();
	}

	$('#saveResults .close').click(function(){
		$('#saveResults').hide();
	})

})()