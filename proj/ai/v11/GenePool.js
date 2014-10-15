

function GenePool(scorer, mutator, sizeFit, sizeBreed, sizeMutate, sizeRandom) {
	if (sizeFit === undefined) sizeFit = 10;
	if (sizeBreed === undefined) sizeBreed = 5;
	if (sizeMutate === undefined) sizeMutate = 5;
	if (sizeRandom === undefined) sizeRandom = 30;
	
	this.sizeFit = sizeFit;
	this.sizeBreed = sizeBreed;
	this.sizeMutate = sizeMutate;
	this.sizeRandom = sizeRandom;
	
	this.scorer = scorer;
	this.mutator = mutator;
	this.genes = [];
	
	this.scoreId = "$score";
};

GenePool.prototype._giveScore = function(item) {
	item[this.scoreId] = this.scorer(item);
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
	
	for (j = 0; j < this.sizeFit; j++) {
		if (!this.genes[j]) {
			this.genes[j] = this.mutator.random();
		}
	}
	if (this.mutator.mutate) {
		for (i = 0; i < this.sizeBreed; i++, j++) {
			idx1 = (Math.random() * this.sizeFit) | 0;
			this.genes[j] =
				this.mutator.mutate(
					this.genes[j],
					this.genes[idx1]);
		}
	}
	if ((this.mutator.breed) && (this.sizeFit >= 2)) {
		for (i = 0; i < this.sizeMutate; i++, j++) {
			idx1 = (Math.random() * this.sizeFit) | 0;
			idx2 = (Math.random() * (this.sizeFit - 1)) | 0;
			if (idx2 >= idx1) idx2++;
			this.genes[j] =
				this.mutator.breed(
					this.genes[j],
					this.genes[idx1],
					this.genes[idx2]);
		}
	}
	for (i = 0; i < this.sizeRandom; i++, j++) {
		this.genes[j] = this.mutator.random(this.genes[j]);
	}
	this.genes.length = j;
};

GenePool.prototype.scoredOrder = function() {
	if (typeof(this.scorer) === "function") {
		this.genes.forEach(Utils.cacheBind(this,"_giveScore"));
		this.genes.sort(Utils.cacheBind(this,"_compareScore"));
	} else {
		this.genes.forEach(Utils.cacheBind(this.scorer,"score"));
		this.genes.sort(Utils.cacheBind(this.scorer,"compare"));
	}
};
