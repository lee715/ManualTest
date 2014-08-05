var current;
(function(){
	var info = {}, Cases = [],
		HEI = $(window).height(),
		WID = $(window).width();

	$.getJSON('/getFiles',function(data){
		$.each(data, function(ind, d){
			Cases.push(d);
		});
		var c;
		while(c = Wgs.onGetFileSuc.pop()){
			c();
		}
	});

	window.Wgs = {
		onGetFileSuc: [],
		color: {
			red: '#f38283',
			blue: '#a3e6f8',
			purple: '#c7b3ef',
			yellow: '#fed174',
			getRandom: function(){
			}
		},
		account: {
			update: function(e){
				var $e = $(e), id = $e.data('id'),
					val = $e.closest('.user').find('.select-level').data('value');
				$e.html('updating...');
				$.ajax({
					url: '/account/update',
					data: {id: id, level: val},
					success: function(){
						$e.html('updated');
						setTimeout(function(){$e.html('update');}, 2000);
					}
				})
			}
		},
		test: {
			delete: function(e){
				var $e = $(e), id = $e.data('id');
				$.ajax({
					url: '/test/delete?id='+id,
					success: function(res){
						$e.parent().animate({height: 0,opacity: 0}, 'fast', null, function(){
							$e.parent().remove();
						})
					}
				})
			}
		},
		levelSel: {
			edit: function(num, tar){
				var $sel = $(tar).closest('.select-level'),
					$nw = $sel.find('.num-wrap'),
					cur = +$nw.html(),
					max = $sel.data('max'),
					cd = cur + num;
				if(!(cd<0 || (max && cd > max))){
					cur += num;
				}
				$nw.html(cur);
				$sel.data('value', cur);
			}
		},
		footer: {
			slide: function(el){
				var $e = $(el), mv;
				if($e.hasClass('ui-icon-plus')){
					$e.removeClass('ui-icon-plus').addClass('ui-icon-minus');
					mv = 'translateY(-50px)';
				}else{
					$e.removeClass('ui-icon-minus').addClass('ui-icon-plus');
					mv = 'translateY(0)';
				}
				$e.closest('.footer').css('-webkit-transform', mv);
			}
		},
		prepareToTest: function(el){
			route('/test?id='+$(el).data('id'));
		},
		newToTest: function(){
			var data = {}, od = 'system device plan'.split(' ');
			$.each(od, function(ind, o){
				data[o] = info[o];
			});
			$.ajax({
				url: '/test/create',
				data: data,
				success: function(res){
					if(res.status == 'success'){
						route('/test?id='+res.data);
					}
				}
			})
		},
		storeInfo: function(){
			var  res = true;
			$('input,select', '#infoForm').each(function(ind, dom){
				if(dom.name && !dom.value){
					res = false;
					return false;
				} 
				info[dom.name] = dom.value;
			});
			return res;
		},
		logout: function(){
			user.logout();
		},
		addPlan: function(){
			var name = $('#createArea .nameInp').html();
			if(name){
				$.ajax({
					url: "/plan/create",
					data: {content: name},
					success: function(res){
						if(res.status == 'success'){
							location.href = '/plans';
						}
					}
				})
			}
		}
	}; 

	var user = {
		login: function(info, success, fail){
			$.ajax({
				url: '/loginAjax',
				data: info,
				success: function(res){
					if(res.status == 'success'){
						user.name = res.data.name;
						user.level = res.data.level;
						user.id = res.data.id;
						user.localSave();
						success && success();
					}else{
						fail && fail(res.err);
					}
				},
				error: function(err){
					fail && fail(err);
				}
			})
		},
		logout: function(){
			this.clearLocal();
			$.ajax({
				url: '/logout',
				success: function(){
					location.href = '/login';
				}
			})
		},
		create: function(info, success, fail){
			$.ajax({
				url: '/account/create',
				data: info,
				success: function(res){
					if(res.status == 'success'){
						success && success(res.data);
					}else{
						fail && fail(res);
					}
				}
			})
		},
		clearLocal: function(){
			localStorage.setItem('user', '');
		},
		localSave: function(){
			localStorage.setItem('user', user.id);
		},
		autoLogin: function(redir){
			var id = localStorage.getItem('user');
			if(id){
				$.ajax({
					url: '/autoLogin',
					data: {id: id},
					success: function(res){
						if(res.status == 'success'){
							user.name = res.data.name;
							user.level = res.data.level;
							user.id = res.data.id;
							if(redir){
								if(user.level>=3){
									route('/index');
								}else{
									route('/unfinishedtests');
								}
							}
							autoLogin = function(){};
						}
					}
				});
			}
		}
	};
	var route = function(url){
		$.mobile.navigate(url);
	}
	// $(document).on('navigate', function(){
	// 	console.log(location);
	// });
	// $(document).on('mobileinit', function(){
	// 	console.log('mobileinit: '+location.pathname);
	// });
	// $(document).on('pagebeforeshow', function(){
	// 	console.log('pagebeforeshow: '+location.pathname);
	// });
	// $(document).on('pagebechange', function(){
	// 	console.log('pagebechange: '+location.pathname);
	// });
	// $(document).on('pageload', function(){
	// 	console.log('pageload: '+location.pathname);
	// });
	
	$(document).on('pagebeforeshow', function(){
		
		var pg = location.pathname;
		switch(pg){
			case '/login':
				user.autoLogin(true);
				$('#loginHandler').click(function(){
					var info = {}, valid = true;
					$('input', '#loginForm').each(function(ind, inp){
						var name = inp.name,
							value = inp.value;
						if(!value){
							inp.style.border = '1px solid red';
							inp.placeholder = 'required';
							valid = false;
							return false;
						}
						info[name] = value;
					});
					if(valid){
						user.login(info, function(res){
							if(user.level>=3){
								route('/index');
							}else{
								route('/unfinishedtests');
							}
						}, function(res){
							if(res == 'name_err'){
								var inp = $('input[name="name"]', '#loginForm')[0];
								inp.placeholder = '用户不存在';
								inp.value = '';
								inp.style.border = '1px solid red';
							}else if(res == 'pass_err'){
								var inp = $('input[name="pass"]', '#loginForm')[0];
								inp.placeholder = '密码错误';
								inp.value = '';
								inp.style.border = '1px solid red';
							}else{

							}
						});
					}
				});
				break;
			case '/account':
				user.autoLogin();
				$('.createHandler').click(function(){
					var name = $('#createArea .nameInp').html();
					var lev = $('#createArea .select-level').data('value');
					if(name){
						user.create({
							name: name, level: lev
						}, function(data){
							location.reload();
						})
					}
				});
				break;
			case '/test':
				user.autoLogin();
				$('.footer').css({'top': HEI - 50});
				$('.main').height(HEI - 154);
				var id = location.search.slice(1).split('=')[1];
				if(current && current.id == id){
					current.initIfr();
					current.go(current.counter);
				}else{
					current && current.distroy();
					$.ajax({
						url: '/test/get',
						data: {id: id},
						success: function(res){
							if(res.status == 'success'){
								var doit = function(){
									if(Cases.length){
										res.data.cases = Cases;
										new Test(res.data);
									}else{
										setTimeout(doit, 500);
									}
								};
								doit();
							}
						}
					})
				}
				
				break;
			case '/unfinishedtests':
				user.autoLogin();
				var initTestItem = function(){
					$('.test-item .process').each(function(ind, p){
						var pro = +$(p).data('process'),
							total = Cases.length,
							process = parseInt(pro/total*100), bg;
						$(p).width(process+'%');
						if(process < 33)
							bg = Wgs.color.red;
						else if(process > 66)
							bg = Wgs.color.blue;
						else
							bg = Wgs.color.yellow;
						$(p).css('background', bg);
					})
				}
				if(Cases.length){
					initTestItem();
				}else{
					Wgs.onGetFileSuc.push(initTestItem);
				}
				break;
			case '/report':
				user.autoLogin();
				if(current){
					current.drawReport();
				}else{
					var id = location.search.slice(1).split('=')[1];
					$.ajax({
						url: '/test/get',
						data: {id: id},
						success: function(res){
							if(res.status == 'success'){
								var doit = function(){
									if(Cases.length){
										res.data.cases = Cases;
										res.data.slice = true;
										new Test(res.data);
										current._end = true;
										current.drawReport();
									}else{
										setTimeout(doit, 500);
									}
								};
								doit();
							}
						}
					})
				}
		}
		// 初始化test页面
		// if(page == 'test'){
		// 	if(Cases.length && current){
		// 		current.initIfr();
		// 		current.refresh();
		// 	}else if(Cases.length){
		// 		var opts = $.extend({}, info, {cases: Cases}); 
		// 		new Test(opts);
		// 	}else{
		// 		// fetch file names
				// $.getJSON('/getFiles',function(data){
				// 	$.each(data, function(ind, d){
				// 		Cases.push(d);
				// 	});
				// 	var opts = $.extend({}, info, {cases: Cases}); 
				// 	new Test(opts);
				// });
		// 	}
		
		// }else if(page == 'report'){
		// 	current.drawReport();
		// }
		//.width(WID - 60)
	});

	// $(document).on('scrollstop', function(e){
	// 	var top = $(this).scrollTop();
	// 	if($('.footer')[0]) $('.footer')[0].style.bottom = -top + 'px';
	// });
})()