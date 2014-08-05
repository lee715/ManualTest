var User = require('../models/index.js').User;

User.find({name: 'root'}, function(err, root){
	if(root.length == 0){
		var r = new User();
		r.name = 'root';
		r.pass = 'root';
		r.level = 9;
		r.save();
	}
});

var userSession = function(req, user){
	req.session.user_id = user._id;
	req.session.name = user.name;
	req.session.level = user.level;
}

module.exports = {
	checkLogin: function(req, res, next){
		var id = req.session.user_id;
		console.log('check login: '+ id);
		if(!id)
			res.redirect('/login');
		else
			next();
	},
	checkLevel: function(req, res, next){
 		var level = req.session.level;
		if(level < 3)
			res.redirect('/index');
		else
			next();
	},
	login: function(req, res){
		if(req.session.uesr_id){
			if(req.session.level >=3){
				res.redirect('/index');
			}else{
				res.redirect('/unfinishedtests');
			}
		}else{
			res.render('login.jade');
		}
	},
	logout: function(req, res){
		req.session.user_id = undefined;
		req.session.level = undefined;
		req.session.name = undefined;
		res.send('ok');
	},
	// auto login by id
	autoLogin: function(req, res){
		var id = req.param('id');
		console.log('autoLogin:'+id);
		User.findOne({_id: id}, function(err, user){
			if(user){
				console.log('autoLogin success');
				userSession(req, user);
				res.json({
					data: {
						name: user.name,
						id: user._id,
						level: user.level
					},
					status: 'success'
				})
			}else{
				res.json({status: 'fail'})
			}
		})
	},
	loginAjax: function(req, res){
		var name = req.param('name'),
			pass = req.param('pass');
		if(name && pass){
			User.findOne({name: name}, function(err, user){
				if(user && (user.pass == pass)){
					userSession(req, user);
				}else if(user && !user.pass){
					user.pass = pass;
					user.save();
					userSession(req, user);
				}else if(user){
					res.json({status: 'fail',err: 'pass_err'});
				}else{ 
					res.json({status: 'fail',err: 'user_err'});
				}
				res.json({
					data: {
						name: user.name,
						id: user._id,
						level: user.level
					},
					status: 'success'
				})
			});
		}
	},
	create: function(req, res){
		var name = req.param('name'),
			level = req.param('level') || 0,
			one = new User();
		one.name = name;
		one.level = level;
		one.save(function(err, ac){
			if(err) res.send({err: err.message, status: 'fail'});
			res.json({
				status: 'success',
				data: ac
			});
		});
	},
	update: function(req, res){
		var name = req.param('name'),
			level = req.param('level') || 0,
			id = req.param('id'),
			pass = req.param('pass');
		User.findOne({_id: id}, function(err, one){
			if(err) res.send(err.message);
			if(name) one.name = name;
			if(pass) one.pass = pass;
			if(level) one.level = level;
			one.save(function(err, ac){
				if(err) res.send(err.message);
				res.send(ac);
			});
		})
	},
	account: function(req, res){
		var level = req.session.level;
		User.find({level:{$lt: level}}, function(err, us){
			res.render('account.jade', {users: us, level: level});
		});
	}
}

// app.get('/login', function(req, res){
// 	var name = req.param('name'),
// 		pass = req.param('pass');
// 	if(name && pass){
// 		User.find({name: name}, function(err, user){
// 			user = user[0];
// 			if(user && (user.pass == pass)){
// 				res.render('index.jade');
// 			}else if(user && !user.pass){
// 				user.pass = pass;
// 				user.save();
// 				res.render('index.jade');
// 			}else if(user){
// 				res.render('login.jade',{pass_err: 1})
// 			}else{
// 				res.render('login.jade',{user_err: 1})
// 			}
// 		})
// 	}else{
// 		res.render('login.jade');
// 	}
// 	Models.Plan.find({}, function(err, plans){
// 		if(err) return res.send(err.message);
// 		plans.sort(function(a, b){
// 			if(a.time.getTime() < b.time.getTime())
// 				return true;
// 			else
// 				return false;
// 		});
// 		res.render('login.jade', {plans: plans});
// 	});
// });