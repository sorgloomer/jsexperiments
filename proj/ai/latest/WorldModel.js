		
function WorldModel() {
	var i;
	
	this.width = 0;
	this.height = 0;
	
	this.ship = new WorldModel.Ship();
	this.sweet = new Vector();
	this.shieldTime = 0;
	this._input = "";
	this.obstacles = [];
	this.obstaclesMoving = true;
	this.sweetPickupRadius = this.ship.rad + 5;
	
	this.notJustPath = true;
};

WorldModel.inputs = World.inputs;
WorldModel.MAX_DT = 0.05;
WorldModel.SIGMA_RATIO = 0.12;

WorldModel.prototype.set = function(o) {
	var i;
	this.ship.set(o.ship);
	this.width = o.width;
	this.height = o.height;
	this.sweet.set(o.sweet);
	this.shieldTime = o.shieldTime;
	this.obstaclesMoving = o.obstaclesMoving;
	this._input = o._input;
	this.sweetPickupRadius = o.sweetPickupRadius;
	
	var olen = o.obstacles.length;
	if (this.obstacles.length !== olen) {
		this.obstacles = new Array(olen);
		for (i = 0; i < olen; i++) {
			this.obstacles[i] = o.obstacles[i].clone();
		}
	} else {
		for (i = 0; i < olen; i++) {
			this.obstacles[i].set(o.obstacles[i]);
		}
	}
	return this;
}

WorldModel.prototype.sense = function(w) {
	this.ship.sense(w.ship);
	this.width = w.width;
	this.height = w.height;
	this.sweet.set(w.sweet);
	
	this.sweetPickupRadius = w.sweetPickupRadius;
	
	this.shieldTime = w.gameOver;
	
	this.obstaclesMoving = w.obstaclesMoving;
	
	var wlen = w.obstacles.length;
	if (this.obstacles.length !== wlen) {
		this.obstacles = new Array(wlen);
		for (i = 0; i < wlen; i++) {
			this.obstacles[i] = (new WorldModel.Oid()).sense(w.obstacles[i]);
		}
	} else {
		for (i = 0; i < wlen; i++) {
			this.obstacles[i].sense(w.obstacles[i]);
		}
	}
	return this;
};


WorldModel.prototype.clone = function(o) {
	return new WorldModel().set(o);
}

WorldModel.prototype._stepIt = function(dt) {
	var i, arr;
	
	this.ship.step(dt);
	this._collideBounds();
	
	if (this.notJustPath) {
		if (this.obstaclesMoving) {
			for (i = 0, arr = this.obstacles; i < arr.length; i++) {
				arr[i].step(dt);
			};
		}
		
		this._relocateObstacles();
		if (this.shieldTime > 0) this.shieldTime -= dt;
	};
};

WorldModel.prototype.step = function(dt, cb, cbThis) {
	var left = dt;
	while (left > WorldModel.MAX_DT) {
		this._stepIt(WorldModel.MAX_DT);
		left -= WorldModel.MAX_DT;
		if (cb !== undefined) cb.call(cbThis, this, dt - left);
	}
	this._stepIt(left);
	if (cb !== undefined) cb.call(cbThis, this, dt);
};

WorldModel.prototype.input = function(str) {
	var acc = 200;
	var beta = 10;
	this._input = str;
	if (str === "l") {
		this.ship.acc = 0;
		this.ship.beta = -beta;
	} else if (str === "r") {
		this.ship.acc = 0;
		this.ship.beta = +beta;
	} else if (str === "a") {
		this.ship.acc = acc;
		this.ship.beta = 0;
	} else if (str === "al") {
		this.ship.acc = acc;
		this.ship.beta = -beta;
	} else if (str === "ar") {
		this.ship.acc = acc;
		this.ship.beta = +beta;
	} else if (str === "") {
		this.ship.acc = 0;
		this.ship.beta = 0;
	} else {
		throw new Error("Invalid input for simulation!");
	}
}

WorldModel.prototype._collideBounds = function() {
	var ball = this.ship;
	if (ball.pos.x < ball.rad && ball.vel.x < 0) {
		ball.vel.x = ball.vel.x * -0.2;
	}
	if (ball.pos.x > this.width-ball.rad && ball.vel.x > 0) {
		ball.vel.x = ball.vel.x * -0.2;
	}
	if (ball.pos.y < ball.rad && ball.vel.y < 0) {
		ball.vel.y = ball.vel.y * -0.2;
	}
	if (ball.pos.y > this.height-ball.rad && ball.vel.y > 0) {
		ball.vel.y = ball.vel.y * -0.2;
	}
};

WorldModel.prototype._relocateObstacles = function() {
	var arr = this.obstacles;
	for (var i = 0; i < arr.length; i++) {
		var obs = arr[i];
		this._relocateOid(obs);
	}
};

WorldModel.prototype._relocateOid = function(ball) {
	var r = ball.rad, x = ball.pos.x, y = ball.pos.y;
	if (x < -r && ball.vel.x < 0) {
		ball.pos.x += this.width + 2 * r;
	}
	if (x > this.width + r && ball.vel.x > 0) {
		ball.pos.x -= this.width + 2 * r;
	}
	if (y < -r && ball.vel.y < 0) {
		ball.pos.y += this.height + 2 * r;
	}
	if (y > this.height + r && ball.vel.y > 0) {
		ball.pos.y -= this.height + 2 * r;
	}
};

WorldModel.prototype.currentClosestObstacle = function() {
	var arr = this.obstacles, obs;
	var pos = this.ship.pos;
	var mindist = pos.x;
	mindist = Math.min(mindist, pos.y);
	mindist = Math.min(mindist, this.width - pos.x);
	mindist = Math.min(mindist, this.height - pos.y);
		
	for (var i = 0; i < arr.length; i++) {
		var obs = arr[i];
		mindist = Math.min(mindist, pos.dist(obs.pos) - obs.rad);
	}
	return mindist - this.ship.rad;
};

WorldModel.prototype.isShield = function() {
	return this.shieldTime > 0;
};


WorldModel.Ship = function() {
	this.rad = 20;
	
	this.pos = new Vector();
	this.vel = new Vector();
	this.phi = 0;
	this.omega = 0;
	this.acc = 0;
	this.beta = 0;
	
	this.sigmaPos = 0;
	this.sigmaOmega = 0;
	this.sigmaPhi = 0;
	this.sigmaVel = 0;
};

WorldModel.Ship.prototype.set = function(o) {
	this.rad = o.rad;
	this.pos.set(o.pos);
	this.vel.set(o.vel);
	this.phi = o.phi;
	this.omega = o.omega;
	
	this.acc = o.acc;
	this.beta = o.beta;
	
	this.sigmaPos = o.sigmaPos;
	this.sigmaOmega = o.sigmaOmega;
	this.sigmaPhi = o.sigmaPhi;
	this.sigmaVel = o.sigmaVel;
	
	return this;
};
WorldModel.Ship.prototype.clone = function(o) {
	if (o === undefined) o = new WorldModel.Ship();
	return o.set(this);
};

WorldModel.Ship.prototype.sense = function(b) {
	this.pos.set(b.pos);
	this.vel.set(b.vel);
	this.rad = b.rad;
	this.phi = b.phi;
	this.omega = b.omega;
	this.acc = b.acc;
	this.beta = b.beta;
	
	this.sigmaPos = this.rad * 0.1;
	this.sigmaOmega = 0;
	this.sigmaPhi = 0;
	this.sigmaVel = 0;
	
	return this;
};

WorldModel.Ship.prototype.step = function(dt) {
	var hdt = dt * 0.5, adt = this.acc * dt;
	var sigmaDt, o;
	
	this.phi += this.omega * hdt;
	
	this.pos.x += this.vel.x * hdt;
	this.pos.y += this.vel.y * hdt;
	this.vel.x += Math.cos(this.phi) * adt;
	this.vel.y += Math.sin(this.phi) * adt;
	this.pos.x += this.vel.x * hdt;
	this.pos.y += this.vel.y * hdt;
	
	this.omega += this.beta * dt;
	this.phi += this.omega * hdt;
	
	sigmaDt = WorldModel.SIGMA_RATIO * dt;
	o = this.omega * WorldModel.SIGMA_RATIO;
	this.sigmaOmega += sigmaDt * Math.abs(this.beta);
	this.sigmaPhi += sigmaDt * (this.sigmaOmega + o);
	this.sigmaVel += sigmaDt * (this.sigmaPhi * (Math.abs(this.acc) + o));
	this.sigmaPos += sigmaDt * this.sigmaVel * this.sigmaPhi;
};

WorldModel.Oid = function() {
	this.rad = 20;	
	this.pos = new Vector();
	this.vel = new Vector();
};

WorldModel.Oid.prototype.set = function(o) {
	this.rad = o.rad;
	this.pos.set(o.pos);
	this.vel.set(o.vel);
	return this;
};

WorldModel.Oid.prototype.clone = function(o) {
	if (o === undefined) o = new WorldModel.Oid();
	return o.set(this);
};

WorldModel.Oid.prototype.sense = function(o) {
	this.rad = o.rad;
	this.pos.set(o.pos);
	this.vel.set(o.vel);
	return this;
};

WorldModel.Oid.prototype.step = function(dt) {
	this.pos.x += this.vel.x * dt;
	this.pos.y += this.vel.y * dt;
};
