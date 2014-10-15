function Ball(vals) {
	this.rad = (vals !== undefined) ? vals.rad : 20;
	
	if (vals !== undefined) {
		if (vals.pos !== undefined) {
			this.pos = vals.pos.clone();
		} else {
			this.pos = new Vector(vals.posX, vals.posY);
		}
		if (vals.vel !== undefined) {
			this.vel = vals.vel.clone();
		} else {
			this.vel = new Vector(vals.velX, vals.velY);
		}
		this.phi = vals.phi || 0;
		this.omega = vals.omega || 0;
		this.acc = vals.acc || 0;
		this.beta = vals.beta || 0;
	} else {
		this.pos = new Vector();
		this.vel = new Vector();
		this.phi = 0;
		this.omega = 0;
		this.acc = 0;
		this.beta = 0;
	}	
};

Ball.temp_v1 = new Vector();

Ball.prototype.set = function(o) {
	this.rad = o.rad;
	this.pos.set(o.pos);
	this.vel.set(o.vel);
	this.phi = o.phi;
	this.omega = o.omega;
	
	this.acc = o.acc;
	this.beta = o.beta;
	return this;
}
Ball.prototype.clone = function() {
	return new Ball().set(this);
}

Ball.prototype.step = function(dt) {
	var hdt = dt * 0.5, adt = this.acc * dt;
	
	this.phi += this.omega * hdt;
	
	this.pos.x += this.vel.x * hdt;
	this.pos.y += this.vel.y * hdt;
	this.vel.x += Math.cos(this.phi) * adt;
	this.vel.y += Math.sin(this.phi) * adt;
	this.pos.x += this.vel.x * hdt;
	this.pos.y += this.vel.y * hdt;
	
	this.omega += this.beta * dt;
	this.phi += this.omega * hdt;
};
		
function World(seed) {
	var i;
	if (seed === undefined) {
		seed = 1;
	}
	
	this.width = 640;
	this.height = 480;
	this.center = new Vector(this.width/2, this.height/2);
	this.ship = new Ball({rad: 15, pos: this.center});
	this.sweet = this.center.clone();
	this.sweetsGot = 0;
	this.relocateSweet = true;
	this.gameOver = World.GAMEOVER_TIME;
	this.gameOverCount = 0;	
	this._input = "";
	this.obstacles = [];
	this.obstaclesMoving = true;	
	this.sweetPickupRadius = this.ship.rad + 5;
	
	this.notJustPath = true;
	
	this._random = Utils.WeakRandom(seed);
};

World.inputs = ["","l","r","a","al","ar"];
World.GAMEOVER_TIME = 2;
World.MAX_DT = 0.05;

World.prototype.set = function(o) {
	var i;
	this.ship.set(o.ship);
	this.width = o.width;
	this.height = o.height;
	this.center.set(o.center);
	this.sweet.set(o.sweet);
	this.gameOver = o.gameOver;
	this.sweetsGot = o.sweetsGot;
	this.gameOverCount = o.gameOverCount;
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

World.prototype.clone = function(o) {
	return new World().set(o);
}

World.prototype.newObstacle = function() {
	var absOmega = this._random() * 3 + 1;
	this.obstacles.push(new Ball({
		rad: 5 + Math.sqrt(this._random()) * 50,
		posX: this._random() * this.width,
		posY: this._random() * this.height,
		velX: (this._random() - 0.5) * 300,
		velY: (this._random() - 0.5) * 300,
		phi: (this._random() - 0.5) * Math.PI,
		omega: (this._random() < 0.5) ? absOmega : -absOmega,
		//acc: this._random() * 600,
	}));
};

World.prototype.arrangeMap = function() {
	this.obstacles = [];
	this.obstacles.push(new Ball({rad: 60, posX:this.center.x, posY:this.center.y+220}));
	this.obstacles.push(new Ball({rad: 60, posX:this.center.x, posY:this.center.y+100}));
	this.obstacles.push(new Ball({rad: 60, posX:this.center.x, posY:this.center.y-100}));
	this.obstacles.push(new Ball({rad: 60, posX:this.center.x, posY:this.center.y-220}));
	this.obstacles.push(new Ball({rad: 30, posX:this.center.x-140, posY:this.center.y}));
};

World.prototype.setObstacleCount = function(cnt) {
	if (cnt === undefined) cnt = World.OBSTACLE_COUNT;
	
	while (this.obstacles.length < cnt) {
		this.newObstacle();
	}
	this.obstacles.length = cnt;
};

World.prototype._stepIt = function(dt) {
	var i, arr;
	
	this.ship.step(dt);
	this._collideBounds();
	
	if (this.notJustPath) {
		if (this.obstaclesMoving) {
			for (i = 0, arr = this.obstacles; i < arr.length; i++) {
				arr[i].step(dt);
			};
		}
		
		if (this.sweet.dist(this.ship.pos) < this.sweetPickupRadius) {
			if (this.relocateSweet) {
				this.sweet.x = this._random() * (this.width-this.ship.rad*2) + this.ship.rad;
				this.sweet.y = this._random() * (this.height-this.ship.rad*2) + this.ship.rad;
			}
			this.sweetsGot++;
		}
		
		this._relocateObstacles();
		this._collideObstacles();
		if (this.gameOver > 0) this.gameOver -= dt;
	};
};

World.prototype.step = function(dt) {
	while (dt > World.MAX_DT) {
		this._stepIt(World.MAX_DT);
		dt -= World.MAX_DT;
	}
	this._stepIt(dt);
};

World.prototype.input = function(str) {
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
World.prototype._handleGameOver = function() {
	if (this.gameOver <= 0) {
		this.gameOver = World.GAMEOVER_TIME;
		this.gameOverCount++;
	}
};

World.prototype.isGameOver = function() {
	return this.gameOver > 0;
};

World.prototype._collideBounds = function() {
	var ball = this.ship;
	if (ball.pos.x < ball.rad && ball.vel.x < 0) {
		ball.vel.x = ball.vel.x * -0.2;
		this._handleGameOver();
	}
	if (ball.pos.x > this.width-ball.rad && ball.vel.x > 0) {
		ball.vel.x = ball.vel.x * -0.2;
		this._handleGameOver();
	}
	if (ball.pos.y < ball.rad && ball.vel.y < 0) {
		ball.vel.y = ball.vel.y * -0.2;
		this._handleGameOver();
	}
	if (ball.pos.y > this.height-ball.rad && ball.vel.y > 0) {
		ball.vel.y = ball.vel.y * -0.2;
		this._handleGameOver();
	}
};

World.prototype._relocateObstacles = function() {
	var arr = this.obstacles;
	for (var i = 0; i < arr.length; i++) {
		var obs = arr[i];
		this._relocateBall(obs);
	}
};

World.prototype._relocateBall = function(ball) {
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

World.prototype._collideObstacles = function() {
	var arr = this.obstacles;
	var pos = this.ship.pos;
	var drad = this.ship.rad;
	for (var i = 0; i < arr.length; i++) {
		var obs = arr[i];
		var srad = obs.rad + drad;
		if (pos.dist2(obs.pos) < srad * srad) {
			this._handleGameOver();
		}
	}
};

function PathDrawer(scorer) {
	this.scorer = scorer;
	this._dots = [];
	this._dotsLength = 0;
	this._pathScore = 0;
	this._tempDot = {};
	this.waypointDt = 0.5;
	this.pathOpacity = 0.15;
};

PathDrawer.lerp = function(dst, a, b, t) {
	var l = (t - a.t) / (b.t - a.t);
	dst.x = a.x + (b.x - a.x) * l;
	dst.y = a.y + (b.y - a.y) * l;
	dst.t = t;
};

PathDrawer.prototype._drawPath = function(ctx, drawWaypoints) {
	var i, lt, x, y, r, style;
	var dot = this._tempDot, dots = this._dots;
	var wdt = this.waypointDt;
	
	r = (this._pathScore + 1.5) * 40.0 | 0;
	style = "rgba("+(200-r)+","+(200+r)+",0,"+this.pathOpacity+")";
	ctx.strokeStyle = style;
	
	ctx.beginPath();
	ctx.moveTo(dots[0].x, dots[0].y);
	for (i = 1; i < this._dotsLength; i++) {
		ctx.lineTo(dots[i].x, dots[i].y);
	}
	ctx.stroke();
	if (drawWaypoints) {
		ctx.fillStyle = "rgba(60,60,60,0.5)";
		for (i = 1, lt = wdt; i < this._dotsLength; i++) {
			while (dots[i].t > lt) {
				PathDrawer.lerp(dot, dots[i-1], dots[i], lt);
				ctx.fillRect(dot.x - 2, dot.y - 2, 4, 4);
				lt += wdt;
			}
		}
	}
};

PathDrawer.prototype.drawPath = function(ctx, path, drawWaypoints) {
	this._dotsLength = 0;
	this._pathScore = this.scorer.score(path, Utils.cacheBind(this,"collectPointCb"));
	this._drawPath(ctx, drawWaypoints);
};

PathDrawer.prototype.collectPointCb = function(world, t) {
	var dot = this._dots[this._dotsLength];
	if (!dot) {
		this._dots[this._dotsLength] = dot = {};
	}
	this._dotsLength++;
	dot.x = world.ship.pos.x;
	dot.y = world.ship.pos.y;
	dot.t = t;
};
