var express = require('express');
var fs = require('fs');
var https = require('https');
var cookieParser = require('cookie-parser');
//var session = require('cookie-session');
var session = require('express-session');

var app = express();

app.engine('jade', require('jade').__express);

app.use(express.static(__dirname + '/public'));

var Models = require('./models/index.js');

app.get('/', function(req, res){
	res.redirect('/index');
});

app.get('/index', function(req, res){
	res.render('index.jade');
})

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
});

app.get('/save', function(req, res){
	var unm = req.param('tester'),
		sys = req.param('system'),
		dev = req.param('device'),
		plan = req.param('plan'),
		results = req.param('results'),
		notes = req.param('notes'),
		one = new Models.TestResult;
	one.tester = unm;
	one.system = sys;
	one.device = dev;
	one.plan = plan;
	one.results = results;
	one.notes = notes;
	console.log(one);
	one.save(function(err){
		if(err){
			res.json({status: 'fail', data: err.message});
		}else{
			res.json({status: 'success', data: one._id});
		}
	});
});

app.get('/list', function(req, res){
	Models.TestResult.find({}, function(err, data){
		data.reverse();
		if(err) return res.send('error: failed to read TestResult');
		// Models.Plan.find({}, function(err, plans){
		// 	if(err) return res.send('error: failed to read plans');
		// 	var p, pObj = {};
		// 	for(var i=0,l=plans.length;i<l;i++){
		// 		p = plans[i];
		// 		pObj[p.id] = p.content;
		// 	};
		// 	pObj[0] = 'no plan';
		// 	res.render('list.jade', {list: data, plans: pObj});
		// });
		res.render('list.jade', {list: data});
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

/*** https test ***/
app.get('/referer-301-redir', function(req, res){
	res.statusCode = 301;
	res.setHeader("Cache-Control", "no-cache,no-store");
	res.setHeader("Location",'http://172.16.2.243:3000/ssl/resources/no-http-referer.html');
	res.end();
});

app.get('/referer-303-redir', function(req, res){
	res.statusCode = 303;
	res.setHeader("Cache-Control", "no-cache,no-store");
	res.setHeader("Location",'http://172.16.2.243:3000/ssl/resources/no-http-referer.html');
	res.end();
});

app.get('/redirect-ping-to-http', function(req, res){
	res.statusCode = 303;
	res.setHeader("Location",'http://172.16.2.243:3000/ping-target-does-not-exist');
	res.end();
});


var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

var options = {
    key: fs.readFileSync('./privatekey.pem'),
    cert: fs.readFileSync('./certificate.pem')
};

https.createServer(options, app).listen(3011, function () {
    console.log('Https server listening on port ' + 3011);
});