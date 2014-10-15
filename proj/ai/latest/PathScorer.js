
PathScorer = function(model) {
	this.model = model;
	this.tempModel = new WorldModel();
};

PathScorer.clamp = function(v) {
	return (v <= 0) ? 0 : ((v >= 1) ? 1 : v);
};

PathScorer.prototype.score = function(path, callback, cbThis) {
	var temp1 = this.tempModel;
	var i, t = 0, maxi;
	var tick;

	var creditTime = -1;
	var creditGot = false;
	var penaltyTime = -1;
	var penaltyProbability = 0;
	var creditDist = 1e8;
	var maxOmegaSq = 0;
	
	
	temp1.set(this.model);
	temp1.sweetPickupRadius -= 3;
	
	if (callback) callback.call(cbThis, temp1, t);
		
	var func = function(model, innerdt) {
		var realt = t + innerdt;
		var sigmaPos = model.ship.sigmaPos;
		var currentCreditDist = model.sweet.dist(model.ship.pos);
		var o = model.ship.omega;
		if (!model.isShield()) {
			var closestObstacle = model.currentClosestObstacle();
			var currentPenaltyProbability =
				PathScorer.clamp(1.0 - closestObstacle / sigmaPos);
			if (currentPenaltyProbability > penaltyProbability) {
				penaltyTime = realt;
				penaltyProbability = currentPenaltyProbability;
			}
		}
		if (!creditGot
			&& (currentCreditDist < model.sweetPickupRadius)) {
			creditTime = realt;
			creditGot = true;
		}
		creditDist = Math.min(creditDist, currentCreditDist);
		maxOmegaSq = Math.max(maxOmegaSq, o * o);
	};

	{
		i = 0;
		temp1.input(path.path[i]);
		tick = path.nextTick;
		temp1.step(tick, func);
		t += tick;
		if (callback) callback.call(cbThis, temp1, t);
		
		for (i = 1, maxi = path.length - 1; i < maxi; i++) {
			temp1.input(path.path[i]);
			tick = path.tick;
			temp1.step(tick, func);
			t += tick;
			if (callback) callback.call(cbThis, temp1, t);
		}
		
		tick = path.tick - path.nextTick;
		temp1.input(path.path[i]);
		temp1.step(tick, func);
		t += tick;
		if (callback) callback.call(cbThis, temp1, t);
	}
	
	var res;
	if (penaltyProbability > 0.001) {
		if (penaltyProbability > 0.999) {
			res = -150 + penaltyTime;
		} else {
			res = 90 - 80 * penaltyProbability - 2.3 * Math.sqrt(creditDist);
		}
	} else if (creditGot) {
		res = Math.max(100 - creditTime);
	} else {
		res = Math.max(50 - Math.sqrt(creditDist));
	}
	res -=  0.05 * maxOmegaSq;
	return res;
};
