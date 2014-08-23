
var push = function(al, item){
	if(!item.slice) item = [item];
	return Array.prototype.push.apply(al, item);
}

function Test(data){
	this.cases = data.cases;
	if(typeof data.results == 'string'){
		this.res = JSON.parse(data.results);
	}else{
		this.res = data.results || {};
	}
	if(typeof data.notes == 'string'){
		this.notes = JSON.parse(data.notes);
	}else{
		this.notes = data.notes || {};
	}
	this.counter = data.current || 0;
	this.id = data.id || data._id;
	this.submited = data.submited;
	this.submitable = data.submitable;
	current = this;
	if(!data.slice){
		this.start();
	}
};
Test.prototype.start = function(){
	var isRedo = ~location.search.slice(1).indexOf('redo=1');
	if(this.submitable && !isRedo){
		this.report();
	}else{
		this.initIfr();
		this.go(this.counter);
	}
};
Test.prototype.initIfr = function(){
	var ifr = this.ifr = document.getElementsByTagName('iframe')[0];
	// handle the descriptions 
	if(ifr){
		ifr.onload = function(){
			var pass = ifr.contentDocument.getElementById('pass-desc'),
				fail = ifr.contentDocument.getElementById('fail-desc'),
				step = ifr.contentDocument.getElementById('step-desc'),
				table = document.getElementById('descTable');
			if(pass){
				$('.pass-body', table).html(pass.innerHTML).closest('tr').show();
			}else{
				$('.pass-body', table).closest('tr').hide();
			}
			if(fail){
				$('.fail-body', table).html(fail.innerHTML).closest('tr').show();
			}else{
				$('.fail-body', table).closest('tr').hide();
			}
			if(step){
				$('.step-body', table).html(step.innerHTML).closest('tr').show();
			}else{
				$('.step-body', table).closest('tr').hide();
			}
			if(!pass && !fail && !step){
				$('.blank', table).show();
			}else{
				$('.blank', table).hide();
			}
		}
	} 
}
Test.prototype.drawReport = function(){
	var self = this,
		$report = $('#testReport')[0];
	var str = '<table cellpadding="0" cellspacing="0" width="100%"><tr class="rep-header"><td>ID</td><td>Case</td><td style="padding: 0 12px;">result</td><td align="center">operation</td><td width="100%" style="min-width:100px;">Note</td></tr>';
	str += this.getTrs();
	str += '</table>';
	$report.childNodes[0].innerHTML = str;
	$('.retest', $report).click(function(e){
		var i = $(e.currentTarget).data('ind');
		self.counter = i;
		self.reDirect(i);
	});
	$('.note-input').blur(function(){
		var ind = $(this).data('ind');
		self.notes[self.getCase(ind)] = this.value;
		self.dbSave(+ind);
	});
};
Test.prototype.reDirect = function(ind){
	$.mobile.navigate('/test?id='+this.id+'&redo=1');
};

Test.prototype.report = function(){
	$.mobile.navigate('/report?id='+this.id);
};

Test.prototype.getTrs = function(noOp){
	var res = this.res, cases = this.cases, notes = this.notes, str = '', self = this;
	$.each(cases, function(ind, cn){
		var map = 'FAIL PASS BLOCK SKIP'.split(' ');
		var c = cn.split('/')[1].split('.')[0];
		var unitCN = self.getCase(ind);
		var r = res[unitCN] === undefined?'/': map[res[unitCN]]||'/';
		var note = notes[unitCN] || '';
		var op = noOp?'': '<td align="center" class="retest" data-ind="'+ind+'"><a href="javascript:;" class="ui-btn ui-btn-icon-notext ui-corner-all ui-icon-refresh ui-btn-a"></a></td>'; 
		str += '<tr><td>'+(ind+1)+'</td><td>'+c+'</td><td align="center" class="'+r.toLowerCase()+'">'+r+'</td>'+op+'<td><input class="note-input" type="text" data-ind="'+ind+'" value="'+(note)+'" /></td></tr>';
	});
	return str;
};

Test.prototype.localSave = function(){
	var ls = localStorage, ts = ls.getItem('TS');
	if(ts){
		ts = JSON.parse(ts);
	}else{
		ts = {};
		push(ts, []);
	}
	var id = this.localId;
	if(id){
		ts[id] = this;
	}else{
		this.localId = push(ts, this);
	}
	ls.setItem('TS', JSON.stringify(ts));
};

Test.prototype.save = function(el){
	$.ajax({
		url: '/test/submit',
		data: {id: this.id},
		success: function(res){
			if(res.status == 'success'){
				$(el).removeClass('ui-icon-cloud').addClass('ui-icon-check');
			}
		}
	})
};

Test.prototype.dbSave = function(ind, callback){
	if(arguments.length == 1){
		if(typeof ind == 'function'){
			callback = ind;
			ind = undefined;
		}else if(typeof ind !== 'number'){
			ind = undefined;
			callback = undefined;
		}
	}
	$.ajax({
		url: '/test/update',
		data: this.updateData(ind),
		type: 'GET',
		success: function(){
			callback && callback()
		}
	})
};

Test.prototype.updateData = function(ind){
	var caseName = this.getCase(ind),
		data = {
			key: caseName,
			result: this.res[caseName],
			note: this.notes[caseName],
			id: this.id,
			current: this.counter,
			submitable: this.submitable
		}
	return data;
}

Test.prototype.submitableAjax = function(callback){
	var data = {
			id: this.id,
			submitable: true
		}
	$.ajax({
		url: '/test/update',
		data: data,
		type: 'GET',
		success: function(){
			callback && callback();
		}
	})
}

Test.prototype.toJSON = function(){
	var obj = {}, self =this;
	$.each('plan tester device system results notes'.split(' '), function(ind, key){
		if(key == 'results'){
			obj[key] = self.res;
		}else{
			obj[key] = self[key]
		}
	})
	return obj;
}
Test.prototype.getCase = function(ind){
	var ca = this.cases[ind == undefined?this.counter:ind];
	ca = ca.split('/')[1].split('.')[0].replace(/-[a-zA-Z]{1}/g, function(m){
		return m.charAt(1).toUpperCase();
	});
	return ca;
}

Test.prototype.next = function(status){
	var c = ++this.counter;
	if(c<this.cases.length){
		this.refresh();
	}else{
		var self = this;
		this.submitableAjax(function(){
			self.submitable = true;
			self.report();
		});
	}
}
Test.prototype.back = function(){
	var c = this.counter - 1;
	if(~c){
		this.go(c);
	}else{
		location.href = '/unfinishedtests';
	}
}
Test.prototype.state = function(status){
	var c = this.counter, self = this;
	this.res[this.getCase()] = status;
	if(this.submitable){
		this.dbSave(function(){
			self.report();
		});
	}else{
		this.dbSave();
		this.next(status);
	}
}
Test.prototype.skip = function(){
	this.state(3);
}
Test.prototype.block = function(){
	this.state(2);
}
Test.prototype.pass = function(){
	this.state(1);
}
Test.prototype.fail = function(){
	this.state(0);
}
Test.prototype.showNote = function(){
	this.noteInp.value = this.notes[this.counter] || '';
	document.getElementById('noteArea').style.bottom = '-2px';
	document.getElementById('note-input').focus();
};
Test.prototype.hideNote = function(){
	document.getElementById('noteArea').style.bottom = '-62px';
	this.noteInp.value = "";
};
Test.prototype.note = function(val){
	this.notes[this.getCase()] = val;
}
Test.prototype.getNote = function(){
	return this.notes[this.getCase()] || '';
}
Test.prototype.go = function(ind){
	this.counter = ind;
	this.refresh();
}
Test.prototype.refresh = function(){
	var ind = this.counter;
	//var toTestA = document.getElementById('toTest');
	//toTestA.href = 'testCases/'+this.cases[ind];
	// toTestA.innerHTML = "Click To Test:"+ toTestA.href;
	this.ifr.src = 'testCases/'+this.cases[ind];
	document.getElementById('open-handler').href = 'testCases/'+this.cases[ind];
}
Test.prototype.distroy = function(ind){
	$(this.ifr).remove()
	current = null;
}
