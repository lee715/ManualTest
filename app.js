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

app.get('/report', function(req,res){
	res.render('report.jade');
})

app.get('/login', function(req, res){
	Models.Plan.find({}, function(err, plans){
		if(err) return res.send(err.message);
		plans.sort(function(a, b){
			if(a.time.getTime() < b.time.getTime())
				return true;
			else
				return false;
		});
		res.render('login.jade', {plans: plans});
	});
});

app.get('/', function(req, res){
	res.redirect('/login');
});

app.post('/login', function(req, res){
	
});

app.get('/getFiles', function(req, res){
	var base = './public/testCases';
	fs.readdir(base, function(err, files){
		if(err){
			console.log(err.message);
			res.send('fail to read dir /cases');
		}else{
			var r = [], _fs;
			for(var i=0,l=files.length;i<l;i++){
				_fs = fs.readdirSync(base+'/'+files[i]);
				for(var j=0,m=_fs.length;j<m;j++){
					_fs[j] = files[i]+'/'+_fs[j];
				}
				r = r.concat( _fs );
			}
			res.json(r);
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

app.get('/treport', function(req, res){
	var ids = req.param('ids').join(' '), r = [];
	Models.TestResult.find({}, function(err, data){
		var d;
		while(d = data.pop()){
			if(ids.indexOf(d.id) != -1) r.push(d);
		}
		var base = './public/testCases';
		fs.readdir(base, function(err, files){
			if(err){
				console.log(err.message);
				res.send('fail to read dir /cases');
			}else{
				var fr = [], _fs;
				for(var i=0,l=files.length;i<l;i++){
					_fs = fs.readdirSync(base+'/'+files[i]);
					for(var j=0,m=_fs.length;j<m;j++){
						_fs[j] = files[i]+'/'+_fs[j];
					}
					fr = fr.concat( _fs );
				}
				var result = {
					tests: r,
					cases: fr
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