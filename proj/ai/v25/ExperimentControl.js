function ExperimentControl() {
	this.model = new Experiment();
	this.view = new ExperimentView(this.model);
	
	this._options = Utils.copyTo({}, ExperimentControl.DEFAULT_OPTIONS);

	this.applyOptions();
};

ExperimentControl.DEFAULT_OPTIONS = {
	poolFit: 6,
	poolBreed: 6,
	poolMutate: 6,
	poolRandom: 6,
	lengthMin: 25,
	lengthMax: 30,
	inputAveraging: false,
	showPlans: "best",
	enableSlowmo: true,
	slowmoMax: 5,
	tick: 0.03,
	obstacleCount: 10,
	obstaclesMoving: true,
};

ExperimentControl.prototype.reset = function() {
	this.model.reset();
	this.view.setModel(this.model);
	this.applyOptions();
};

ExperimentControl.prototype.handleClick = function(x, y) {
	this.model.world.sweet.setXY(x, y);
};

ExperimentControl.prototype._optionSetters = {
	poolFit:	function(val) { this.model.aiGenetic.pathPool.sizeFit = val; },
	poolBreed:	function(val) { this.model.aiGenetic.pathPool.sizeBreed = val; },
	poolMutate:	function(val) { this.model.aiGenetic.pathPool.sizeMutate = val; },
	poolRandom:	function(val) { this.model.aiGenetic.pathPool.sizeRandom = val; },
	lengthMin:	function(val) { this.model.aiGenetic.mutator.setLengthMin(val); },
	lengthMax:	function(val) { this.model.aiGenetic.mutator.setLengthMax(val); },
	inputAveraging:	function(val) { this.model.aiGenetic.averaging = val; },
	tick:		function(val) { this.model.TICK = val; },
	slowmoMax:	function(val) { this.model.SLOWMO_MAX = val; },
	enableSlowmo:	function(val) { this.model.enableSlowmo = val; },
	obstacleCount:	function(val) { this.model.world.setObstacleCount(val); },
	obstaclesMoving:	function(val) { this.model.world.obstaclesMoving = val; },
	showPlans:	function(val) {
		if (val === "all") {
			this.view.pathDrawer.pathOpacity = 0.15;
		} else if (val === "best") {
			this.view.pathDrawer.pathOpacity = 0.8;
		}
	},
};

ExperimentControl.prototype.getOptions = function(dst) {
	return Utils.copyTo(dst, this._options);
};

ExperimentControl.prototype.applyOptions = function(opts) {
	var key, setter;
	if (opts === undefined) {
		opts = this._options;
	}
	setter = this._optionSetters;
	for (key in opts) {
		if (setter[key] !== undefined) {
			this._options[key] = opts[key];
			setter[key].call(this, opts[key]);
		}
	}
};
