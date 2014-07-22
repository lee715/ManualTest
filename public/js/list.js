

(function(){
	$('.item').click(function(){
		$(this).find('.checkbox').toggleClass('checked');
	});

	$('#reportBtn').click(function(){
		var $checked = $('.checked');
		if($checked.length){
			var ids = [];
			$checked.each(function(ind, c){
				var id = $(c).data('id');
				if(id) ids.push(id);
			});
			if(ids.length){
				$.ajax({
					url: '/treport',
					data: {ids: ids},
					success: function(res){
						renderReport(res);
					},	
					error: function(err){
						console.log(err)
					}
				})
			}
		}else{
			alert('请先选择要查看的测试结果');
		}
	});

	var colors = ['red', 'green', 'yellow', 'darkblue', 'blue'];
	var _colors = ['purple', 'red', 'green', 'yellow', 'darkblue', 'blue', 'gray'];
	var caches = {};
	var getColor = function(sys){
		sys = sys.trim().toLowerCase();
		if(caches[sys]) return caches[sys];
		if(!colors.length) colors = _colors.slice();
		caches[sys] = colors.shift()
		return caches[sys];
	}

	var renderReport = function(obj){
		var cases = obj.cases,
			tests = obj.tests;

		// format data
		var systems = [], dataBySys = {};
		$.each(tests, function(ind, test){
			var sys = test.system;
			if(systems.indexOf(sys) == -1){
				systems.push(sys);
				dataBySys[sys.trim()] = [test];
			}else{
				dataBySys[sys.trim()].push(test);
			}
		});

		// render systems
		var tStr = '<table class="reportTable" cellpadding="0" cellspacing="0"><tr><td class="purple" id="manualTestResults" rowspan=3 align="center">Manaul Test Results</td>';
		$.each(systems, function(ind, sys){
			var len = dataBySys[sys.trim()].length;
			tStr += '<td class="'+getColor(sys)+'" colspan='+len+' align="center">'+sys+'</td>';
		})
		tStr += '</tr><tr align="center">';

		// render devices
		$.each(systems, function(ind, sys){
			var data = dataBySys[sys.trim()];
			$.each(data, function(ind, da){
				tStr += '<td class="'+getColor(sys)+'">'+da.device+'</td>'
			});
		});
		tStr += '</tr><tr align="center">';

		// render testers
		$.each(systems, function(ind, sys){
			var data = dataBySys[sys.trim()];
			$.each(data, function(ind, da){
				tStr += '<td class="'+getColor(sys)+'">'+da.tester+'</td>'
			});
		});
		tStr += '</tr><tr>';

		// render test results
		$.each(cases, function(ind, ca){
			tStr += '<td>'+ca.replace('.html', '')+'</td>';
			$.each(systems, function(i, sys){
				$.each(dataBySys[sys.trim()], function(index, item){
					var re = +item.results[ind]?'PASS':'FAIL';
					tStr += '<td class="'+re.toLowerCase()+'">'+ re + (item.notes[ind]?'<a href="javascript:;" class="note" data-note="'+item.notes[ind]+'"></a>':'') + '</td>';
				})
			});
			tStr += '</tr><tr>';
		});

		tStr += '</tr></table>';
		document.body.innerHTML = tStr;
		$('.note').click(function(e){
			var offset = $(this).offset();
			var $div = $('<div>'+$(this).data('note')+'</div>');
			$div.css({
				position: 'absolute',
				'max-width': '200px',
				padding: '12px',
				top: offset.top + 20,
				left: -1000,
				border: '1px solid #eee',
				color: '#9d6e42;',
				background: '#fedfa7',
				'border-radius': '5px'
			});
			$('body').append($div);
			var wid = $div.width();
			$div.css({left: offset.left - wid/2 + 10});
			var handler = function(){
				$div.remove();
				$(document).unbind('click', handler);
			};
			setTimeout(function(){
				$(document).click(handler);
			}, 0);
			
		})
	};

	$('#all').click(function(){
		$('.checkbox').addClass('checked');
	})
})()