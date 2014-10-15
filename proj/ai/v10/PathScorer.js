
PathScorer = function(world, geneticAi) {
	this.world = world;
	this.geneticAi = geneticAi;
};

PathScorer.temp1 = new World();
//PathScorer.temp1.relocateSweet = false;
PathScorer.temp1.modelDelta = 3;
PathScorer.TICK = 0.15;

PathScorer.scoreState = function(world) {
	var score = 0;
	score += Math.sqrt(world.ship.pos.dist(world.sweet) + 1) * 0.1;
	var tmp = Math.abs(world.ship.omega);
	score += tmp * tmp * 0.01;
	score += world.ship.vel.abs() * 0.001;
	return score;
};
	
PathScorer.prototype.score = function(path, callback) {
	var cdist, sdist;
	var credits = 0, penalties = 0;
	var temp1 = PathScorer.temp1;
	var i;
	temp1.set(this.world);
	temp1.sweetsGot = 0;
	temp1.gameOverCount = 0;
	
	if (callback) callback(temp1);
	
	
	//if (path[0] !== undefined) { temp1.input(path[0]); }
	temp1.step(this.geneticAi._nextTick);
	cdist = PathScorer.scoreState(temp1);
	//for (i = 1; i < path.length; i++) {
	for (i = 0; i < path.length; i++) {
		temp1.input(path.path[i]);
		temp1.step(PathScorer.TICK);
		credits += temp1.sweetsGot;
		penalties += temp1.gameOverCount;
		sdist = PathScorer.scoreState(temp1);
		if (sdist < cdist) cdist = sdist;
		if (callback) callback(temp1);
	}
	
	credits += temp1.sweetsGot * 100;
	penalties += temp1.gameOverCount * 100;
	
	//return 10 * penalties - credits + cdist;
	
	var res = path.length * 0.02;
	if (penalties > 0)
		res -= penalties;
	else if (credits > 0)
		res += credits;
	else res -= cdist;
	return res;
};
