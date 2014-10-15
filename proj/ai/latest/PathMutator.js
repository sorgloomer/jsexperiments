function PathMutator(){
	this._lengthMin = 10;
	this._lengthMax = 20;
	
	this._lengthSpread = this._lengthMax - this._lengthMin;
	this._pathCapacity = this._lengthMax;
	this._tickMin = 0.17;
	this._tickMax = 0.20;
	this._tickSpread = this._tickMax - this._tickMin;

	var validate = function(a) {
		for (var i = 0; i < a.length; i++) {
			if (a.path[i] === undefined) {
				throw new Error("Mutator error");
			}
		}
	};
	
	this.setLengthMin = function(val) {
		this._lengthMin = val;
		
		this._lengthSpread = this._lengthMax - this._lengthMin;
		this._pathCapacity = this._lengthMax;
	};
	this.setLengthMax = function(val) {
		this._lengthMax = val;
		
		this._lengthSpread = this._lengthMax - this._lengthMin;
		this._pathCapacity = this._lengthMax;
	};
	
	this.random = function(dst) {
		var i;
		var rnd = Math.random();
		var length = this._lengthMin + rnd * rnd * this._lengthSpread | 0;
		if (dst === undefined) {
			dst = new Path(this._pathCapacity);
		}
		dst.length = length;
		
		dst.tick = this._tickMin + this._tickSpread * Math.random();
		dst.nextTick = dst.tick * Math.random();
		
		for (i = 0; i < length; i++) {
			dst.path[i] = Arrays.randomElement(World.inputs);
		}
		validate(dst);
		return dst;
	};
	
	this.mutate = function(dst, a) {
		var rnd, i;
		if (dst !== a) {
			if (dst === undefined) {
				dst = a.clone();
			} else {
				dst.set(a);
			}
		}
		rnd = Math.exp(Math.random() * 1.5) | 0;
		for (;rnd>0;rnd--) {
			i = (Math.random() * (dst.length + 2) | 0) - 1;
			if (i < 0 && dst.length > this._lengthMin) {
				dst.length--;
			} else if (i < dst.length) {
				dst.path[i] = Arrays.randomElement(World.inputs);
			} else if (dst.length < this._lengthMax) {
				dst.path[dst.length] = Arrays.randomElement(World.inputs);
				dst.length++;
			}
		}
		rnd = Math.random() < 0.1;
		if (rnd < 0.1) {
			dst.tick *= 1.05;
			if (dst.tick > this._tickMax) {
				dst.tick = this._tickMax;
			}
		} else if (rnd < 0.2) {
			dst.tick /= 1.05;
			if (dst.tick < this._tickMin) {
				dst.tick = this._tickMin;
			}
		}
		
		validate(dst);
		return dst;
	};
	
	this.breed = function(dst, a, b) {
		var newlen = b.length;
		if (dst === undefined) {
			dst = new Path(this._pathCapacity);
		}
		dst.length = newlen;
	
		var i = (Math.random() * Math.min(a.length, b.length)) | 0;
		Arrays.copy(dst.path, a.path, 0, i, 0);
		Arrays.copy(dst.path, b.path, i, newlen - i, i);
		dst.tick = (a.tick + b.tick) * 0.5;
		dst.nextTick = (a.nextTick + b.nextTick) * 0.5;
		validate(dst);
		return dst;
	};
};
