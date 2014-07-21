var refresh = function(){
	ifr.contentDocument.location.reload();
}

var Cases = [], current, Testers = [],
	ifr = document.getElementsByTagName('iframe')[0],
	$pre = document.getElementById('testPre'),
	$process = document.getElementById('testProcess'),
	$report = document.getElementById('testReport');

var init = function(){
	$pre.style.display = 'block';
	$process.style.display = 'none';
	$report.style.display = 'none';
};
var start = function(){
	var data = {};
	$('#form input,#form select').each(function(ind, inp){
		if(inp.value)
			data[inp.name] = inp.value;
		else
			data = false;
		return data;			
	});
	if(data){
		data.cases = Cases;
		new Test(data);
	}
};


var testAgain = function(){
	Testers.pop();
	init();
}
var nextTest = function(){
	init();
};
var saveAndGoOn = function(){
	$.ajax({
		url: '/save',
		data: current.toJSON(),
		type: 'GET',
		success: function(data){
			console.log(data);
			init();
		},
		error: function(err){
			console.log(err);
		}
	})
}
var showReport = function(){
	var str = '<table cellpadding="0" cellspacing="0" width="80%" style="margin-left:10%"><tr class="header"><td width="100%">Case</td><td style="padding: 0 12px;">result</td></tr>';
	$.each(Testers, function(ind, t){
		str += t.getTrs(true);
		str += '<tr align="right"><td width="100%">from '+t.tester+' '+t.device+' '+t.system+'</td><td></td></tr>'
	});
	str += '</table>';
	$report.innerHTML = str;
	var cavs = document.createElement('canvas'),
	    wid = $report.scrollWidth,
	    hei = $report.scrollHeight,
	    ctx = cavs.getContext('2d');
	cavs.height = hei;
	cavs.width = wid;
	// domvas.toImage($report, function(){
	// 	ctx.drawImage(this, 0, 0);
	// })
	// document.body.appendChild(cavs);
	// setTimeout(function(){
	// 	var img    = cavs.toDataURL("image/png");
	// 	img.crossorigin="anonymous";
	// 	document.write('<img src="'+img+'"/>');
	// }, 2000);

	// var data   = '<svg xmlns="http://www.w3.org/2000/svg" width="'+wid+'" height="'+hei+'">' +
 //               		'<foreignObject width="100%" height="100%">'+ html +
 //               		'</foreignObject>' +
 //             	 '</svg>';
 	var data   = '<svg xmlns="http://www.w3.org/2000/svg" width="'+wid+'" height="'+hei+'">' +
               '<foreignObject width="100%" height="100%">' +
               	 document.getElementsByTagName('style')[0].outerHTML+
                 '<div xmlns="http://www.w3.org/1999/xhtml">' +
                  // '<em>I</em> like <span style="color:white; text-shadow:0 0 2px blue;">cheese</span>' +
                 $report.outerHTML+
                 '</div>' +
               '</foreignObject>' +
             '</svg>';
    var DOMURL = window.URL || window.webkitURL || window;
    var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
	var url = DOMURL.createObjectURL(svg);
	var img = new Image();
	img.src = url;
	document.body.appendChild(img);
	// var a = document.createElement('a');
	// a.href = url;
	// a.innerHTML = 'download';
	// document.body.appendChild(a);
}
function Test(data){
	this.cases = data.cases;
	this.plan = data.plan;
	this.tester = data.tester;
	this.device = data.device;
	this.system = data.system;
	this.res = [];
	this.notes = [];
	this.counter = 0;
	this.noteInp = document.getElementById('note-input');
	current = this;
	Testers.push(this);
	this.go(0);
}
Test.prototype.report = function(){
	var self = this;
	$pre.style.display = 'none';
	$process.style.display = 'none';
	$report.style.display = 'block';
	var str = '<table cellpadding="0" cellspacing="0" width="80%" style="margin-left:10%"><tr class="header"><td>ID</td><td>Case</td><td style="padding: 0 12px;">result</td><td align="center">operation</td><td width="100%">Note</td></tr>';
	str += this.getTrs();
	str += '</table>';
	$report.childNodes[0].innerHTML = str;
	$('.retest', $report).click(function(e){
		var i = $(e.currentTarget).data('ind');
		self.go(i);
	});
	$('.note-input').blur(function(){

	});
}
Test.prototype.getTrs = function(noOp){
	var res = this.res, cases = this.cases, notes = this.notes, str = '';
	$.each(res, function(ind, d){
		var r = d?'PASS':'FAIL';
		var c = cases[ind];
		var op = noOp?'': '<td align="center" class="retest" data-ind="'+ind+'">test</td>'; 
		str += '<tr><td>'+(ind+1)+'</td><td>'+c+'</td><td align="center" class="'+r.toLowerCase()+'">'+r+'</td>'+op+'<td><input class="note-input" type="text" value="'+notes[ind]+'" /></td></tr>';
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
		this.report();
	}
}
Test.prototype.pass = function(){
	var c = this.counter;
	var goNext = c === this.res.length;
	this.res[c] = 1;
	this.note();
	if(goNext){
		this.next();
	}else{
		this.report();
	}
}
Test.prototype.fail = function(){
	var c = this.counter;
	var goNext = c === this.res.length;
	this.res[c] = 0;
	this.note();
	if(goNext){
		this.next();
	}else{
		this.report();
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
Test.prototype.note = function(){
	this.notes[this.counter] = this.noteInp.value;
	this.hideNote();
}
Test.prototype.go = function(ind){
	this.counter = ind;
	this.refresh();
	$pre.style.display = 'none';
	$process.style.display = 'block';
	$report.style.display = 'none';
}
Test.prototype.refresh = function(){
	var ind = this.counter;
	var toTestA = document.getElementById('toTest');
	toTestA.href = 'testCases/'+this.cases[ind];
	// toTestA.innerHTML = "Click To Test:"+ toTestA.href;
	ifr.src = 'testCases/'+this.cases[ind];
}

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
	var hei = $(table).height() - 10;
	$('#descWrap').css({top: -hei});
}

var toggleDesc = function(){
	var $wrap = $('#descWrap'),
		top = $wrap.css('top');
	if(top == '0px'){
		var hide = $('#descTable').height() - 10;
		$wrap.animate({top: -hide}, 'fast', 'ease');
	}else{
		$wrap.animate({top: 0}, 'fast', 'ease');
	}
}

// fetch file names
$.getJSON('/getFiles',function(data){
	$.each(data, function(ind, d){
		Cases.push(d);
	});
	init();
})	
$(document).keydown(function(e){
	var code = e.keyCode;
	if(code == 37){
		current.pass();
	}else if(code == 39){
		current.fail();
	}
})