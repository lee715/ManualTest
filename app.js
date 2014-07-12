var express = require('express');
var fs = require('fs');

var app = express();

app.engine('jade', require('jade').__express);

app.use(express.static(__dirname + '/public'));

var Models = require('./models/index.js');

app.get('/test', function(req, res){
	res.render('test.jade');
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
	var datas = 'tester device system results notes'.split(' '),
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
		if(err) return res.send('error: failed to read TestResult');
		res.render('list.jade', {list: data});
	})
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
})

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});