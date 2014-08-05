var 
	
	TestResult = require('../models/index.js').TestResult,
	User = require('../models/index.js').User,
	Plan = require('../models/index.js').Plan,

	unfinishedtests = function(req, res){
		var name = req.session.name;
		var level = req.session.level;
		TestResult.find({submited: false, tester: name}, function(err, uts){
			if(err) res.send(err.message);
			if(uts.length){
				res.render('unfinishedtests.jade', {uts: uts, level: level});
			}else{
				res.redirect('/newtest');
			}
		})
	},
	create = function(req, res){
		var unm = req.session.name,
			sys = req.param('system'),
			dev = req.param('device'),
			plan = req.param('plan'),
			one = new TestResult;
		one.tester = unm;
		one.system = sys;
		one.device = dev;
		one.plan = plan;
		one.save(function(err){
			if(err){
				res.json({status: 'fail', data: err.message});
			}else{
				res.json({status: 'success', data: one._id});
			}
		});
	},
	update = function(req, res){
		var id = req.param('id'),
			key = req.param('key'),
			rlt = req.param('result'),
			note = req.param('note') || '',
			cur = req.param('current');
		TestResult.findOne({_id: id}, function(err, tr){
			var results = JSON.parse(tr.results);
			var notes =  JSON.parse(tr.notes);
			results[key] = rlt;
			notes[key] = note;
			tr.current = cur;
			tr.results = JSON.stringify(results);
			tr.notes = JSON.stringify(notes);
			tr.save(function(err, one){
				res.send('ok');
			});
			
		});
	},
	submit = function(req, res){
		var id = req.param('id');
		TestResult.findOne({_id: id}, function(err, test){
			test.submited = true;
			test.save(function(err, one){
				if(err) res.json({status: 'fail', data: err});
				res.json({status: 'success'});
			});
		})
	},
	newtest = function(req, res){
		Plan.find({}, function(err, plans){
			if(err) return res.send(err.message);
			plans.sort(function(a, b){
				if(a.time.getTime() < b.time.getTime())
					return true;
				else
					return false;
			});
			res.render('newtest.jade', {plans: plans});
		});
	},
	get = function(req, res){
		var id = req.param('id');
		TestResult.findOne({_id: id}, function(err, one){
			one.id = one._id;
			res.json({
				status: 'success',
				data: one
			})
		})
	},
	del = function(req, res){
		var id = req.param('id');
		TestResult.remove({_id: id}, function(err, one){
			console.log(err, one);
			res.json({status: 'success'});
		})
	};

module.exports = {
	unfinishedtests: unfinishedtests,
	newtest: newtest,
	submit: submit,
	update: update,
	create: create,
	get: get,
	delete: del
}