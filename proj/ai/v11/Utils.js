Arrays = {};
Cloner = {};
Utils = {};

Utils.bind = function(obj, fun) {
	return obj[fun].bind(obj);
};

Utils.cacheBind = function(obj, fun) {
	var fname = "$cache$" + fun;
	var ofun = obj[fname];
	if (ofun !== undefined) return ofun;
	ofun = Utils.bind(obj, fun);
	obj[fname] = ofun;
	return ofun;
};

Utils.sqr = function(a) {
	return a*a;
};

Arrays.randomElement = function(array) {
	return array[(Math.random() * array.length) | 0];
};

Arrays.fillWithRandom = function(array, domain, i, endIndex) {
	var domLen = domain.length;
	if (!endIndex) endIndex = array.length;
	for (i = i || 0;i < endIndex; i++) {
		array[i] = domain[(Math.random() * domLen) | 0];
	}
	return array;
};

Utils.nvl = function(val, def, undef) {
	return (val === undef) ? def : val;
};

Arrays.copy = function(dst, src, dsti, len, srci) {
	var iend;
	if (len === undefined) len = src.length;
	if (dsti === undefined) dsti = 0;
	if (srci === undefined) srci = 0;
	for (iend = dsti + len;srci<iend;dsti++,srci++) {
		dst[dsti] = src[srci];
	}
	return dst;
};

Arrays.rotateLeft = function(arr, len) {
	if (len === undefined) len = arr.length;
	var i = 0, maxi = len - 1;
	var tmp = arr[0];
	for (; i < maxi; i++) {
		arr[i]=arr[i+1];
	}
	arr[maxi] = tmp;
	return arr;
};

Arrays.mirror = function(arr, first, last) {
	if (!first) first = 0;
	if (!last) last = arr.length;
	for (last--;first<last;first++,last--) {
		var tmp = arr[first];
		arr[first] = arr[last];
		arr[last] = tmp;
	}
	return arr;
};

Arrays.rotate = function(arr, di) {
	var len = arr.length;
	di = ((di % len) + len) % len;
	arr.reverse();
	Arrays.mirror(arr, 0, di);
	Arrays.mirror(arr, di, len);
	return arr;
};

Cloner.clone = function(original) {
	if (typeof(original) === "object") {
		
	} else {
		return original;
	}
};

