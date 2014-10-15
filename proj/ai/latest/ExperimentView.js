function ExperimentView(model) {
	this.model = null;
	this.pathDrawer = null;
	
	this.imgShips = {};
	this.imgOid = new Image();
	this.width = 640;
	this.height = 480;

	World.inputs.forEach(function(inp) {
		this.imgShips[inp] = new Image();
		this.imgShips[inp].src = "../common/spaceship_" + inp + ".png";
	}, this);	
	this.imgOid.src = "../common/asteroid.png";
	
	this.setModel(model);
};

ExperimentView.prototype.setModel = function(model) {
	this.model = model;
	this.pathDrawer = new PathDrawer(this.model.scorer);
};

CanvasRenderingContext2D.prototype.clear = 
	CanvasRenderingContext2D.prototype.clear
	|| function (preserveTransform) {
	if (preserveTransform) {
		this.save();
	}
	this.setTransform(1, 0, 0, 1, 0, 0);
	this.clearRect(0, 0, this.canvas.width, this.canvas.height);
	if (preserveTransform) {
		this.restore();
	}           
};

ExperimentView.prototype.draw = function(ctx, _opts) {
	var world = this.model.world;
	ctx.clear();
	ctx.scale(this.height / 480, this.height / 480);
	
	if (world.gameOver > 0) {
		ctx.fillStyle = "#A00000";
		ctx.beginPath();
		//ctx.moveTo(world.ship.pos.x, world.ship.pos.y);
		ctx.arc(world.ship.pos.x, world.ship.pos.y, world.ship.rad+5, 0, Consts.TWO_PI * world.gameOver / World.GAMEOVER_TIME);
		ctx.lineTo(world.ship.pos.x, world.ship.pos.y);
		ctx.fill();
	}
	
	ctx.strokeStyle = "#b00000";
	world.obstacles.forEach(function(o){
		this.drawOid(ctx, o);
	}, this);
	ctx.strokeStyle = "#000000";
	this.drawShip(ctx, world.ship);
	
	ctx.fillStyle = "rgb(0,150,30)";
	ctx.beginPath();
	ctx.arc(world.sweet.x,world.sweet.y,8,0,Consts.TWO_PI);
	ctx.fill();
	
	this.drawPlans(ctx, _opts);
	
	ctx.setTransform(1,0,0,1,0,0);
	this.drawStats(ctx);
};

ExperimentView.prototype.drawStats = function(ctx) {
	var i;
	var arr = this.model.aiGenetic.pathPool.genes;
	var world = this.model.world;
	var smin, smax;
	smax = smin = arr[0].length;
	for (i = 1; i < arr.length; i++) {
		smin = Math.min(smin, arr[i].length);
		smax = Math.max(smax, arr[i].length);
	}
	
	ctx.fillStyle = "rgba(255,255,255,0.75)";
	ctx.fillRect(5, 5, 110, 65);
	
	ctx.fillStyle = "black";
	ctx.fillText("Length: " + smin + " : " + arr[0].length + " : " + smax, 10, 16);
	ctx.fillText("$score: " + this.model.bestScore().toFixed(2), 10, 28);
	ctx.fillText("Credits: " + world.sweetsGot, 10, 40);
	ctx.fillText("Deaths: " + world.gameOverCount, 10, 52);
	
	if (this.model.slowmo > 1.5) {
		ctx.fillStyle="#a00000";
	} else {
		ctx.fillStyle="rgba(0,0,0,0.2)";
	}
	ctx.fillText("Slow Mo! (" + Math.round(100 / this.model.slowmo) + "%)", 10, 64);
};

ExperimentView.prototype.drawPlans = function(ctx, _opts) {
	var i;
	var arr = this.model.aiGenetic.pathPool.genes;
	
	var lastNotJustPath = this.pathDrawer.scorer.tempModel.notJustPath;
	this.pathDrawer.scorer.tempModel.notJustPath = false;
	if (_opts.showPlans === "all" || _opts.showPlans === "best5") {
		i = arr.length - 1;
		if (_opts.showPlans === "best5") i = Math.min(i, 5);
		for (; i > 0; i--) {
			this.pathDrawer.drawPath(ctx, arr[i]);
		}
	}
	if (_opts.showPlans !== "none") {
		this.pathDrawer.drawPath(ctx, arr[0], true);
	}
	this.pathDrawer.scorer.tempModel.notJustPath = lastNotJustPath;
};

ExperimentView.prototype.drawShip = function(ctx, ship) {
	var r = ship.rad;
	ctx.save()
	ctx.translate(ship.pos.x, ship.pos.y);
	ctx.rotate(ship.phi);
	this.drawBall(ctx, r);
	r *= 1.75;
	ctx.drawImage(this.imgShips[this.model.world._input], -r, -r, 2*r, 2*r);
	ctx.restore();
};

ExperimentView.prototype.drawOid = function(ctx, oid) {
	var r = oid.rad;
	ctx.save()
	ctx.translate(oid.pos.x, oid.pos.y);
	ctx.rotate(oid.phi);
	ctx.drawImage(this.imgOid, -r, -r, 2*r, 2*r);
	this.drawBall(ctx, r);
	ctx.restore();
};

ExperimentView.prototype.drawBall = function(ctx, r) {
	ctx.beginPath();
	ctx.arc(0,0,r,0,Consts.TWO_PI);
	//ctx.moveTo(0, 0);
	//ctx.lineTo(r, 0);
	ctx.stroke();
};