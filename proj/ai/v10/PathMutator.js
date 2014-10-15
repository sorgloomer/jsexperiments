function PathMutator(minlen, maxlen){
	var lenSpread = maxlen - minlen;

	var validate = function(a) {
		for (var i = 0; i < a.length; i++) {
			if (a.path[i] === undefined) {
				throw new Error("Mutator error");
			}
		}
	};
	
	this.random = function(dst) {
		var i;
		var length = minlen + Math.random() * lenSpread | 0;
		if (dst === undefined) {
			dst = new Path(maxlen, length);
		}
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
		rnd = (Math.exp(Math.random() * 2) + 1) | 0;
		for (;rnd>0;rnd--) {
			i = (Math.random() * (dst.length + 2) | 0) - 1;
			if (i < 0 && dst.length > minlen) {
				dst.length--;
			} else if (i < dst.length) {
				dst.path[i] = Arrays.randomElement(World.inputs);
			} else if (dst.length < maxlen) {
				dst.path[dst.length] = Arrays.randomElement(World.inputs);
				dst.length++;
			}
		}
		validate(dst);
		return dst;
	};
	
	this.breed = function(dst, a, b) {
		var newlen = b.length;
		if (dst === undefined) {
			dst = new Path(maxlen, newlen);
		} else {
			dst.length = newlen;
		}
		var i = (Math.random() * Math.min(a.length, b.length)) | 0;
		Arrays.copy(dst.path, a.path, 0, i, 0);
		Arrays.copy(dst.path, b.path, i, newlen - i, i);
		validate(dst);
		return dst;
	};
};
