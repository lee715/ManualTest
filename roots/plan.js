var 
	
	Plan = require('../models/index.js').Plan,

	create = function(req, res){
		var plan = req.param('content');
		if(plan){
			var n = new Plan();
			n.content = plan;
			n.save(function(err, saved){
				if(err) return res.send(err.message);
				res.json({
					status: 'success'
				});
			});
		}else{
			res.send('error');
		}
	},

	index = function(req, res){
		res.render('plan.jade');
	},

	plans = function(req, res){
		Plan.find({}, function(err, ps){
			res.render('plans.jade', {plans: ps});
		})
	};

module.exports = {
	create: create,
	index: index,
	plans: plans
}



// app.get('/plans', function(req, res){
// 	Models.Plan.find({}, function(err, plans){
// 		if(err) return res.send(err.message);
// 		plans.sort(function(a, b){
// 			if(a.time.getTime() < b.time.getTime())
// 				return true;
// 			else
// 				return false;
// 		});
// 		res.render('plans.jade', {plans: plans});
// 	});
// });
