

function GenePool(scorer, mutator, sizeFit, sizeBreed, sizeMutate, sizeRandom) {
	var poolSize = 5;
	if (sizeFit === undefined) sizeFit = poolSize;
	if (sizeBreed === undefined) sizeBreed = poolSize;
	if (sizeMutate === undefined) sizeMutate = poolSize;
	if (sizeRandom === undefined) sizeRandom = poolSize;
	
	this.sizeFit = sizeFit;
	this.sizeBreed = sizeBreed;
	this.sizeMutate = sizeMutate;
	this.sizeRandom = sizeRandom;
	
	this.scorer = scorer;
	this.mutator = mutator;
	this.genes = [];
	this.scoreDamping = 0.9;
	
	this.scoreId = "$score";
};

GenePool.prototype._giveScore = function(item) {
	var oldScore = item[this.scoreId];
	var newScore = this.scorer(item);
	
	if (oldScore) {
		item[this.scoreId] = oldScore + (newScore - oldScore) * this.scoreDamping;
	} else {
		item[this.scoreId] = newScore;
	}
};

GenePool.prototype._compareScore = function(a,b) {
	return b[this.scoreId] - a[this.scoreId];
};

GenePool.prototype.best = function() {
	return this.genes[0];
};

GenePool.prototype.iterate = function() {
	this.iterateGeneration();
	this.scoredOrder();
};

GenePool.prototype.iterateGeneration = function() {
	var i, j, idx1, idx2;
	var sizeBreed3 = this.sizeFit + this.sizeBreed;
	var gene;
	for (j = 0; j < this.sizeFit; j++) {
		if (!this.genes[j]) {
			this.genes[j] = this.mutator.random();
		}
	}
	if ((this.mutator.mutate) && (this.sizeFit >= 1)) {
		for (i = 0; i < this.sizeMutate; i++, j++) {
			idx1 = (Math.random() * this.sizeFit) | 0;
			gene = this.mutator.mutate(
					this.genes[j],
					this.genes[idx1]);
			gene[this.scoreId] = undefined;
			this.genes[j] = gene;
		}
	}
	if ((this.mutator.breed) && (this.sizeFit >= 2)) {
		for (i = 0; i < this.sizeBreed; i++, j++) {
			idx1 = (Math.random() * this.sizeFit) | 0;
			idx2 = (Math.random() * (this.sizeFit - 1)) | 0;
			if (idx2 >= idx1) idx2++;
			gene = this.mutator.breed(
				this.genes[j],
				this.genes[idx1],
				this.genes[idx2]);
			gene[this.scoreId] = undefined;
			this.genes[j] = gene;
		}
	}
	for (i = 0; i < this.sizeRandom; i++, j++) {
		gene = this.mutator.random(this.genes[j]);
		gene[this.scoreId] = undefined;
		this.genes[j] = gene;
	}
	this.genes.length = j;
};

GenePool.prototype.scoredOrder = function() {
	if (typeof(this.scorer) === "function") {
		this.genes.forEach(this._giveScore, this);
		this.genes.sort(Utils.cacheBind(this,"_compareScore"));
	} else {
		this.genes.forEach(this.scorer.score, this.scorer);
		this.genes.sort(Utils.cacheBind(this.scorer,"compare"));
	}
};
