function Path(cap) {
	this.capacity = cap;
	this.path = new Array(cap);	
	
	this.length = Path.LENGTH_DEF;
	this.tick = Path.TICK_DEF;
	this.nextTick = this.tick;
};

Path.TICK_DEF = 0.10;
Path.LENGTH_DEF = 20;

Path.prototype.set = function(o) {
	this.length = o.length;
	this.capacity = o.capacity;
	if (this.path.length != o.path.length) {
		this.path = new Array(o.path.length);
	};
	Arrays.copy(this.path, o.path);
	this.tick = o.tick;
	this.nextTick = o.nextTick;
};

Path.prototype.clone = function() {
	var res = new Path(this.capacity);
	Arrays.copy(res.path, this.path);
	res.length = this.length;
	res.tick = this.tick;
	res.nextTick = this.nextTick;
	return res;
};

Path.prototype.elapse = function(dt) {
	this.nextTick -= dt;
	while (this.nextTick <= 0) {
		this.nextTick += this.tick;
		Arrays.rotateLeft(this.path, this.length);
	}
};

Path.prototype.inputFor = function(dt) {
	return this.path[(this.nextTick < dt * 0.5) ? 1 : 0];
};



