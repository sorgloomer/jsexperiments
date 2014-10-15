function PathDrawer(scorer) {
	this.scorer = scorer;
	this._dots = [];
	this._dotsLength = 0;
	this._pathScore = 0;
	this._tempDot = {};
	this.waypointDt = 0.5;
	this.pathOpacity = 0.15;
	this.drawSigma = false;
};

PathDrawer.lerp = function(dst, a, b, t) {
	var l = (t - a.t) / (b.t - a.t);
	dst.x = a.x + (b.x - a.x) * l;
	dst.y = a.y + (b.y - a.y) * l;
	dst.r = a.r + (b.r - a.r) * l;
	dst.t = t;
};

PathDrawer.prototype._drawPath = function(ctx, drawWaypoints) {
	var i, lt, x, y, r, style;
	var rad = 2;
	var dot = this._tempDot, dots = this._dots;
	var wdt = this.waypointDt;
	if (this.drawSigma) {
		wdt *= 4;
	}

	
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
		ctx.strokeStyle = "rgba(60,60,60,0.5)";
		for (i = 1, lt = wdt; i < this._dotsLength; i++) {
			while (dots[i].t > lt) {
				PathDrawer.lerp(dot, dots[i-1], dots[i], lt);
				
				if (this.drawSigma) {
					rad = dot.r;
				}
				
				ctx.rect(dot.x - rad, dot.y - rad, 2*rad, 2*rad);
				lt += wdt;
			}
		}
		ctx.stroke();
	}
};

PathDrawer.prototype.drawPath = function(ctx, path, drawWaypoints) {
	this._dotsLength = 0;
	this._pathScore = path.$score;
	this.scorer.score(path, this.collectPointCb, this);
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
	dot.r = world.ship.rad + world.ship.sigmaPos;
};
