
PathScorer = function(world, geneticAi) {
	this.world = world;
	this.geneticAi = geneticAi;
	this.tempWorld = new World();
};

PathScorer.scoreState = function(world) {
	var score = 0;
	score += Math.sqrt(world.ship.pos.dist(world.sweet) + 1) * 0.1;
	var tmp = Math.abs(world.ship.omega);
	score += tmp * tmp * 0.01;
	score += world.ship.vel.abs() * 0.001;
	return score;
};
	
PathScorer.prototype.score = function(path, callback) {
	var cdist = 10000, sdist;
	var credits = 0, penalties = 0;
	var temp1 = this.tempWorld;
	var i, t = 0;
	var penaltyTime = 0;
	var creditTime = 0;
	temp1.set(this.world);
	temp1.sweetsGot = 0;
	temp1.gameOverCount = 0;
	temp1.sweetPickupRadius -= 3;
	temp1.ship.rad += 3;
	
	if (callback) callback(temp1, t);
	
	
	for (i = 0; i < path.length; i++) {
		temp1.input(path.path[i]);
		if (i == 0) {
			temp1.step(path.nextTick);
			t += path.nextTick;
		} else {
			temp1.step(path.tick);
			t += path.tick;
		}
		if (creditTime <= 0 && temp1.sweetsGot > 0) {
			creditTime = t;
		}
		if (penaltyTime <= 0 && temp1.gameOverCount > 0) {
			penaltyTime = t;
		}
		sdist = PathScorer.scoreState(temp1);
		if (sdist < cdist) cdist = sdist;
		if (callback) callback(temp1, t);
	}
	
	if (temp1.sweetsGot > 0) {
		credits = 100 - creditTime;
	}
	if (temp1.gameOverCount > 0) {
		penalties = 100 - penaltyTime;
	}
	
	//return 10 * penalties - credits + cdist;
	
	var res = 0; //path.length * 0.02;
	if (penalties > 0)
		res -= penalties;
	else if (credits > 0)
		res += credits;
	else res -= cdist;
	return res;
};
