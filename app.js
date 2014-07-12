var express = require('express');
var fs = require('fs');

var app = express();

app.engine('jade', require('jade').__express);

app.use(express.static(__dirname + '/public'));

var Models = require('./models/index.js');

app.get('/test', function(req, res){
	Models.Plan.find({}, function(err, plans){
		if(err) return res.send(err.message);
		plans.sort(function(a, b){
			if(a.time.getTime() < b.time.getTime())
				return true;
			else
				return false;
		});
		res.render('test.jade', {plans: plans});
	});
});

app.get('/getFiles', function(req, res){
	fs.readdir('./public/testCases', function(err, files){
		if(err){
			console.log(err.message);
			res.send('fail to read dir /cases');
		}else{
			res.json(files);
		}
	});
})

app.get('/save', function(req, res){
	var datas = 'plan tester device system results notes'.split(' '),
		one = new Models.TestResult(), cur;
	while(cur = datas.shift()){
		if(!req.param(cur)){
			return res.send(cur+' is not found');
		} 
		one[cur] = req.param(cur);
	}
	one.save(function(err, saved){
		if(err){
			res.send(err.message);
		}else{
			res.send('success');
		}
	})
})

app.get('/list', function(req, res){
	Models.TestResult.find({}, function(err, data){
		data.reverse();
		if(err) return res.send('error: failed to read TestResult');
		Models.Plan.find({}, function(err, plans){
			if(err) return res.send('error: failed to read plans');
			var p, pObj = {};
			for(var i=0,l=plans.length;i<l;i++){
				p = plans[i];
				pObj[p.id] = p.content;
			};
			pObj[0] = 'no plan';
			res.render('list.jade', {list: data, plans: pObj});
		});
	});
});

app.get('/report', function(req, res){
	var ids = req.param('ids').join(' '), r = [];
	Models.TestResult.find({}, function(err, data){
		var d;
		while(d = data.pop()){
			if(ids.indexOf(d.id) != -1) r.push(d);
		}
		fs.readdir('./public/testCases', function(err, files){
			if(err){
				console.log(err.message);
				res.send('fail to read dir /cases');
			}else{
				var result = {
					tests: r,
					cases: files
				};
				res.json(result);
			}
		});
	})
});

app.get('/plan', function(req, res){
	res.render('plan.jade');
});

app.get('/plan/save', function(req, res){
	var plan = req.param('content');
	if(plan){
		var n = new Models.Plan();
		n.content = plan;
		n.save(function(err, saved){
			if(err) return res.send(err.message);
			res.redirect('/plans');
		});
	}else{
		res.send('error');
	}
});

app.get('/plans', function(req, res){
	Models.Plan.find({}, function(err, plans){
		if(err) return res.send(err.message);
		plans.sort(function(a, b){
			if(a.time.getTime() < b.time.getTime())
				return true;
			else
				return false;
		});
		res.render('plans.jade', {plans: plans});
	});
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});