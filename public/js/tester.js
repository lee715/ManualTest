

function Test(data){
	this.cases = data.cases;
	this.plan = data.plan;
	this.tester = data.tester;
	this.device = data.device;
	this.system = data.system;
	this.res = [];
	this.notes = [];
	this.counter = 0;
	current = this;
	this.initIfr();
	// Testers.push(this);
	this.go(0);
}
Test.prototype.initIfr = function(){
	var ifr = this.ifr = document.getElementsByTagName('iframe')[0];
	// handle the descriptions 
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
Test.prototype.drawReport = function(){
	var self = this,
		$report = $('#testReport')[0];
	var str = '<table cellpadding="0" cellspacing="0" width="100%"><tr class="rep-header"><td>ID</td><td>Case</td><td style="padding: 0 12px;">result</td><td align="center">operation</td><td width="100%">Note</td></tr>';
	str += this.getTrs();
	str += '</table>';
	$report.childNodes[0].innerHTML = str;
	$('.retest', $report).click(function(e){
		var i = $(e.currentTarget).data('ind');
		current.counter = i;
		self.reDirect(i);
	});
	$('.note-input').blur(function(){
		var ind = $(this).data('ind');
		current.notes[ind] = this.value;
	});
};
Test.prototype.reDirect = function(ind){
	$.mobile.navigate('/test',{transition:'flip'});
};
Test.prototype.save = function(ind, dom){
	$.ajax({
		url: '/save',
		data: current.toJSON(),
		type: 'GET',
		success: function(data){
			console.log(data);
			$(dom).removeClass('ui-icon-cloud').addClass('ui-icon-check');
			dom.onclick = '';
		},
		error: function(err){
			console.log(err);
		}
	})
};

Test.prototype.report = function(){
	$.mobile.navigate('/report',{transition:'flip'});
};
Test.prototype.getTrs = function(noOp){
	var res = this.res, cases = this.cases, notes = this.notes, str = '';
	$.each(res, function(ind, d){
		var r = d?'PASS':'FAIL';
		var c = cases[ind].split('/')[1].split('.')[0];
		var op = noOp?'': '<td align="center" class="retest" data-ind="'+ind+'"><a href="javascript:;" class="ui-btn ui-btn-icon-notext ui-corner-all ui-icon-refresh ui-btn-a"></a></td>'; 
		str += '<tr><td>'+(ind+1)+'</td><td>'+c+'</td><td align="center" class="'+r.toLowerCase()+'">'+r+'</td>'+op+'<td><input class="note-input" type="text" data-ind="'+ind+'" value="'+(notes[ind]||"")+'" /></td></tr>';
	});
	return str;
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
Test.prototype.next = function(){
	var c = ++this.counter;
	if(c<this.cases.length){
		this.refresh();
	}else{
		this._end = true;
		this.report();
	}
}
Test.prototype.back = function(){
	var c = this.counter - 1;
	if(~c){
		this.go(c);
	}else{
		location.href = '/login';
	}
}
Test.prototype.pass = function(){
	var c = this.counter;
	this.res[c] = 1;
	if(this._end){
		this.report();
	}else{
		this.next();
	}
}
Test.prototype.fail = function(){
	var c = this.counter;
	this.res[c] = 0;
	if(this._end){
		this.report();
	}else{
		this.next();
	}
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
	this.notes[this.counter] = val;
	//this.hideNote();
}
Test.prototype.getNote = function(ind){
	return this.notes[ind || this.counter] || '';
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
}

