Consts = {
	RAD_TO_DEG: 180/Math.PI,
	DEG_TO_RAD: Math.PI/180,
	TWO_PI: Math.PI * 2
};

function Vector(x,y) {
	this.x = x || 0;
	this.y = y || 0;
}

Vector.dot = function(a,b) {
	return a.x*b.x + a.y*b.y;
}

Vector.angle = function(a) {
	return new Vector(Math.cos(a), Math.sin(a));
}

Vector.prototype.clone = function() {
	return new Vector(this.x, this.y);
}
Vector.prototype.set = function(v) {
	this.x=v.x;
	this.y=v.y;
	return this;
}
Vector.prototype.setAngle = function(a) {
	this.x=Math.cos(a);
	this.y=Math.sin(a);
	return this;
}
Vector.prototype.add = function(v) {
	return this.clone().addTo(v);
}
Vector.prototype.addTo = function(v) {
	this.x += v.x;
	this.y += v.y;
	return this;
}
Vector.prototype.sub = function(v) {
	return this.clone().subTo(v);
}
Vector.prototype.subTo = function(v) {
	this.x -= v.x;
	this.y -= v.y;
	return this;
}

Vector.prototype.dot = function(p) {
	return Vector.dot(this, p);
}

Vector.prototype.mul = function(p) {
	return this.clone().mulTo(p);
}
Vector.prototype.mulTo = function(p) {
	this.x *= p;
	this.y *= p;
	return this;
}

Vector.prototype.abs = function() {
	return Math.sqrt(this.abs2());
}
Vector.prototype.abs2 = function() {
	return this.x*this.x+this.y*this.y;
}

Vector.prototype.normalize = function() {
	return this.mulTo(1/this.abs());
}
Vector.prototype.normalized = function() {
	return this.clone().normalize();
}

Vector.prototype.dist = function(v) {
	return Math.sqrt(this.dist2(v));
}
Vector.prototype.dist2 = function(v) {
	var x = this.x - v.x;
	var y = this.y - v.y;
	return x*x+y*y;
}

Vector.prototype.distXY = function(x, y) {
	x -= this.x;
	y -= this.y;
	return Math.sqrt(x*x+y*y);
}

Vector.prototype.setXY = function(x, y) {
	this.x = x; this.y = y;
	return this;
}




