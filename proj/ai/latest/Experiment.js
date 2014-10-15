
function Experiment() {
	this.world = null;
	this.worldModel = null;
	this.aiGenetic = null;
	this.scorer = null;
	this.TICK = 0.03;
	this.SLOWMO_EASE = 1.05;
	this.SLOWMO_MAX = 8;
	this.SLOWMO_TRES = -40;
	this.slowmo = 1;
	this.enableSlowmo = true;

	this.reset();
};

Experiment.prototype.reset = function() {
	this.world = new World();
	this.worldModel = new WorldModel();
	this.scorer = new PathScorer(this.worldModel);
	this.aiGenetic = new GeneticAi(this.scorer, {outputInterval: this.TICK});
	this.scorer.geneticAi = this.aiGenetic;
};

Experiment.prototype.bestScore = function() {
	var best = this.aiGenetic.pathPool.best();
	return (best === undefined) ? undefined : best.$score;
};

Experiment.prototype.tick = function(time) {
	var tick = this.TICK;
	var bs;
	if (this.enableSlowmo) {
		bs = this.bestScore();
		if (bs <= this.SLOWMO_TRES) {
			this.slowmo *= this.SLOWMO_EASE;
			if (this.slowmo >= this.SLOWMO_MAX) this.slowmo = this.SLOWMO_MAX;
		} else {
			this.slowmo /= this.SLOWMO_EASE;
			if (this.slowmo < 1) this.slowmo = 1;
		}
		tick /= this.slowmo;
	}
	
	this.world.input(this.aiGenetic.input());
	this.world.step(tick);
	this.aiGenetic.skip(tick);
	this.worldModel.sense(this.world);
	this.aiGenetic.iterate();
	this.aiGenetic.processInput();
};