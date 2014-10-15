
function GeneticAi(scorer, opts) {
	this._inputData = {};
	this._input = World.inputs[0];
	
	this.pathScorer = scorer;
	this.mutator = new PathMutator();
	this.pathPool = new GenePool(
		Utils.bind(this.pathScorer,"score"),
		this.mutator);		
	this.averaging = true;
	this.outputInterval = GeneticAi.TICK;
	
	Utils.copyTo(this, opts);
};

GeneticAi.rotatePath = function(p) {
	Arrays.rotateLeft(p.path, p.length);
};

GeneticAi.prototype.skip = function(dt) {
	this.pathPool.genes.forEach(function(path) {
		path.elapse(dt);
	});
};

GeneticAi.prototype.iterate = function() {
	this.pathPool.iterate();
};

GeneticAi.prototype.processInput = function(dt) {
	var inputData = this._inputData;
	var bestVal, bestScore;
	if (this.averaging) {
		World.inputs.forEach(function(inp) {
			inputData["score$"+inp] = 0;
			inputData["count$"+inp] = 0;
		});
		this.pathPool.genes.forEach(function(path){
			var first = path.inputFor(dt);
			inputData["score$"+first] += path.$score;
			inputData["count$"+first] ++;
		});
		World.inputs.forEach(function(inp) {
			var score = inputData["score$"+inp];
			var count = inputData["count$"+inp];
			if (count > 0) {
				var cScore = score / count;
				if (bestVal === undefined || cScore > bestScore) {
					bestVal = inp;
					bestScore = cScore;
				}
			}
		});
		
		this._input = (bestVal === undefined)
			? World.inputs[0]
			: bestVal;
	} else {
		this._input = this.pathPool.best().inputFor(dt);
	}
	return this._input;
};

GeneticAi.prototype.input = function() {
	return this._input;
};

GeneticAi.TICK = PathScorer.TICK;
