var express = require('express');
var fs = require('fs');
var https = require('https');
var cookieParser = require('cookie-parser');
//var session = require('cookie-session');
var session = require('express-session');

var app = express();

app.engine('jade', require('jade').__express);

app.use(express.static(__dirname + '/public'));

// app.use(session({
// 	keys: ['userId', 'level'],
// 	secureProxy: true
// }));
app.use(session({secret: 'keyboard cat'}));

var Models = require('./models/index.js');

var UserCtl = require('./roots/user.js');
var PlanCtl = require('./roots/plan.js');
var TestCtl = require('./roots/test.js');

app.get('/', function(req, res){
	res.redirect('/login');
});

app.get('/index', UserCtl.checkLogin, function(req, res){
	var level = req.session.level;
	if(level < 3){
		res.redirect('/unfinishedtests');
	}else{
		res.render('index.jade');
	}
});

/*** account ***/
app.get('/login', UserCtl.login);
app.get('/logout', UserCtl.logout);
app.get('/loginAjax', UserCtl.loginAjax);
app.get('/autoLogin', UserCtl.autoLogin);
app.get('/account/create', UserCtl.create);
app.get('/account/update', UserCtl.update);
app.get('/account', UserCtl.checkLogin, UserCtl.checkLevel, UserCtl.account);
/*** account end ***/

/*** test ***/
app.get('/unfinishedtests', UserCtl.checkLogin, TestCtl.unfinishedtests);
app.get('/newtest', UserCtl.checkLogin, TestCtl.newtest);
app.get('/test/create', TestCtl.create);
app.get('/test/update', TestCtl.update);
app.get('/test/submit', TestCtl.submit);
app.get('/test/get', TestCtl.get);
app.get('/test/delete', TestCtl.delete);
app.get('/test', function(req, res){
	res.render('test.jade');
});
/*** test end ***/

/*** plan ***/
app.get('/plan', PlanCtl.index);
app.get('/plans', PlanCtl.plans);
app.get('/plan/create', PlanCtl.create);
/*** plan end ***/

app.get('/report', function(req,res){
	res.render('report.jade');
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
})

app.get('/list', function(req, res){
	Models.TestResult.find({submited: true}, function(err, data){
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
	Models.TestResult.find({submited: true}, function(err, data){
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

/*** https test end ***/

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