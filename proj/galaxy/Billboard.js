function Billboard(canvas) {
	var size = Billboard.MAX_BUFFER_SIZE * 8;
	this.canvas = canvas;
	this.vertices = new Float32Array(size);
	this._vBuffer = gl.createBuffer();
	this.itemCount = 0;
	this._pv = 0;
	this._program = GlHelper.getShaderProgram(["shader-v", "shader-f"]);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this._vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, size * 4, gl.DYNAMIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

Billboard.MAX_BUFFER_SIZE = 1024;
Billboard.SOLID = 0;
Billboard.BLEND = 1;
Billboard.ADD = 2;


Billboard.prototype.put = function(x, y, z, s, r, g, b, a) {
	var p = this._pv;
	var v = this.vertices;
	if (p >= v.length) {
		this.flush();
		p = 0;
		this.itemCount = 0;
	}
	v[p++] = x;
	v[p++] = y;
	v[p++] = z;
	v[p++] = s;
	v[p++] = r;
	v[p++] = g;
	v[p++] = b;
	v[p++] = a;
	this._pv = p;
	this.itemCount++;
};

Billboard.prototype.puta = function(p, s, c) {
	this.put(p[0],p[1],p[2],s,c[0],c[1],c[2],c[3]);
};

Billboard.prototype.begin = function(tex, opts) {
	var shader = this._program;
	var c = this.canvas;
	
	switch (opts) {
		case Billboard.ADD:
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
			break;
		default:
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			break;
	};
	
	gl.useProgram(shader);
	
	//gl.activeTexture(gl.TEXTURE0);
	//gl.bindTexture(gl.TEXTURE_2D, tex);
	//gl.uniform1i(shader.uTexture, 0);
	
	gl.uniformMatrix4fv(shader.uMVP, false, cam.mvp);
	gl.uniform2f(shader.uResolution, c.width, c.height);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this._vBuffer);
	
	gl.enableVertexAttribArray(shader.aPositionSize);
	gl.enableVertexAttribArray(shader.aColor);
	gl.vertexAttribPointer(shader.aPositionSize, 4, gl.FLOAT, false, 32, 0);
	gl.vertexAttribPointer(shader.aColor, 4, gl.FLOAT, false, 32, 16);
};

Billboard.prototype.flush = function() {
	if (this.itemCount > 0) {
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
		gl.drawArrays(gl.POINTS, 0, this.itemCount);
		this.itemCount = 0;
		this._pv = 0;
	}
};

Billboard.prototype.end = function() {
	this.flush();
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
};
