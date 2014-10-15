
function GeneticAi(scorer) {
	this._pathScorer = scorer;
	this._pathPool = new GenePool(
		Utils.bind(this._pathScorer,"score"),
		new PathMutator(8, 20));
	this._nextTick = GeneticAi.TICK;
};

GeneticAi.rotatePath = function(p) {
	Arrays.rotateLeft(p.path, p.length);
};

GeneticAi.prototype.skip = function(dt) {
	this._nextTick -= dt;
	while (this._nextTick < 0) {
		this._nextTick += GeneticAi.TICK;
		this._pathPool.genes.forEach(GeneticAi.rotatePath);
	}
};

GeneticAi.prototype.iterate = function() {
	this._pathPool.iterate();
};

GeneticAi.prototype.input = function() {
	var best = this._pathPool.best();
	if (best === undefined) 
		return undefined;
	return best.path[0];
};

GeneticAi.TICK = PathScorer.TICK;
