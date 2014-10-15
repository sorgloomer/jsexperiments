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
	this.pos.addTo(Ball.temp_v1.set(this.vel).mulTo(dt));
	this.vel.addTo(Ball.temp_v1.setAngle(this.phi).mulTo(this.acc*dt));
	
	this.phi += this.omega * dt;
	this.omega += this.beta * dt;
};
		
function World(map) {
	var i;
	this.width = 640;
	this.height = 480;
	this.center = new Vector(this.width/2, this.height/2);
	this.ship = new Ball({rad: 15, pos: this.center});
	this.sweet = this.center.clone();
	this.sweetsGot = 0;
	this.relocateSweet = true;
	this.gameOver = 0;
	this.gameOverCount = 0;
	
	this.modelDelta = 0;
	this.obstacles = [];
	
	
	if (map) {
		this.obstacles.push(new Ball({rad: 60, posX:this.center.x, posY:this.center.y+220}));
		this.obstacles.push(new Ball({rad: 60, posX:this.center.x, posY:this.center.y+100}));
		this.obstacles.push(new Ball({rad: 60, posX:this.center.x, posY:this.center.y-100}));
		this.obstacles.push(new Ball({rad: 60, posX:this.center.x, posY:this.center.y-220}));
		this.obstacles.push(new Ball({rad: 30, posX:this.center.x-140, posY:this.center.y}));
	} else {
		for (i = 0; i < World.OBSTACLE_COUNT; i++) {
			var absOmega = Math.random() * 3 + 1;
			this.obstacles.push(new Ball({
				rad: 5 + Math.sqrt(Math.random()) * 50,
				posX: Math.random() * this.width,
				posY: Math.random() * this.height,
				velX: (Math.random() - 0.5) * 300,
				velY: (Math.random() - 0.5) * 300,
				phi: (Math.random() - 0.5) * Math.PI,
				omega: (Math.random() < 0.5) ? absOmega : -absOmega,
				//acc: Math.random() * 600,
			}));
		}
	}
};

World.inputs = ["","l","r","a","al","ar"];
World.GAMEOVER_TIME = 4;
World.OBSTACLE_COUNT = 10;
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

World.prototype._stepIt = function(dt) {
	this.ship.step(dt);
	this.obstacles.forEach(function(b) {
		b.step(dt);
	});
	if (this.sweet.dist(this.ship.pos) < this.ship.rad - this.modelDelta) {
		if (this.relocateSweet) {
			this.sweet.x = Math.random() * (this.width-this.ship.rad*2) + this.ship.rad;
			this.sweet.y = Math.random() * (this.height-this.ship.rad*2) + this.ship.rad;
		}
		this.sweetsGot++;
	}
	this._collideBounds();
	this._relocateObstacles();
	this._collideObstacles();
	if (this.gameOver > 0) this.gameOver -= dt;
}
World.prototype.step = function(dt) {
	while (dt > World.MAX_DT) {
		this._stepIt(World.MAX_DT);
		dt -= World.MAX_DT;
	}
	this._stepIt(dt);
}

World.prototype.input = function(str) {
	var acc = 200;
	var beta = 10;
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
	this.obstacles.forEach(Utils.cacheBind(this, "_relocateBall"));
};

World.prototype._relocateBall = function(ball) {
	if (ball.pos.x < -ball.rad && ball.vel.x < 0) {
		ball.pos.x += this.width + 2 * ball.rad;
	}
	if (ball.pos.x > this.width + ball.rad && ball.vel.x > 0) {
		ball.pos.x -= this.width + 2 * ball.rad;
	}
	if (ball.pos.y < -ball.rad && ball.vel.y < 0) {
		ball.pos.y += this.height + 2 * ball.rad;
	}
	if (ball.pos.y > this.height + ball.rad && ball.vel.y > 0) {
		ball.pos.y -= this.height + 2 * ball.rad;
	}
};

World.prototype._collideObstacle = function(obs) {
	if (this.ship.pos.dist2(obs.pos) < Utils.sqr(obs.rad + this.ship.rad + this.modelDelta)) {
		this._handleGameOver();
	}
}
World.prototype._collideObstacles = function() {
	this.obstacles.forEach(Utils.cacheBind(this, "_collideObstacle"));
};

function PathDrawer(ctx, scorer) {
	this.ctx = ctx;
	this.scorer = scorer;
};

PathDrawer.prototype.drawPath = function(world, path) {
	this.first = true;
	this.ctx.strokeStyle = "rgba("+(256+path.$score*2.0 | 0)+",0,"+(256-(path.$score*2.0 | 0))+",0.2)";
	this.ctx.beginPath();
	this.scorer.score(path, Utils.cacheBind(this,"drawPathPoint"));
	this.ctx.stroke();
};

PathDrawer.prototype.drawPathPoint = function(world) {
	if (this.first) {
		this.ctx.moveTo(world.ship.pos.x, world.ship.pos.y);
		this.first = false;
	} else {
		this.ctx.lineTo(world.ship.pos.x, world.ship.pos.y);
	}
};
