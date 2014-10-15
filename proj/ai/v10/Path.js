function Path(cap, len) {
	this.length = len;
	this.capacity = cap;
	this.path = new Array(cap);	
};

Path.prototype.set = function(o) {
	this.length = o.length;
	this.capacity = o.capacity;
	if (this.path.length != o.path.length) {
		this.path = new Array(o.path.length);
	};
	Arrays.copy(this.path, o.path);
};

Path.prototype.clone = function() {
	var res = new Path(this.capacity, this.length);
	Arrays.copy(res.path, this.path);
	return res;
}