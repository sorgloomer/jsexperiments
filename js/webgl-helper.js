GlHelper = {};

GlHelper.getAttribs = function(id, attrib) {
	var elem = document.getElementById(id);
	if (!elem) {
		return null;
	}
	var attr = elem.getAttribute(attrib);
	if (attr) {
		return attr.split(',');
	} else {
		return [];
	}
};

GlHelper.getShader = function(id, templateParams) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = [];

	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3)
			str.push(k.textContent);
		k = k.nextSibling;
	}
	str = str.join("");

	if (typeof templateParams === "object") {
		for (var key in templateParams) {
			str = str.replace("%" + key + "%", templateParams[key]);
		}
	}
	
	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
};

GlHelper.getShaderProgram = function(shaders, templateParams, attribs, uniforms) {
	var program = gl.createProgram();
	
	if (attribs === undefined) {
		attribs = [];
		shaders.forEach(function(item){
			var cattr = GlHelper.getAttribs(item, "data-attribs");
			attribs = attribs.concat(cattr);
		});
	}
	if (uniforms === undefined) {
		uniforms = [];
		shaders.forEach(function(item){
			var cattr = GlHelper.getAttribs(item, "data-uniforms");
			uniforms = uniforms.concat(cattr);
		});
	}
	
	shaders.forEach(function(item){
		var shader = GlHelper.getShader(item, templateParams);
		gl.attachShader(program, shader);
	});
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}
	gl.useProgram(program);
	if (attribs) {
		attribs.forEach(function(item){
			var loc = gl.getAttribLocation(program, item);
			gl.enableVertexAttribArray(loc);
			program[item] = loc;
		});
	}
	if (uniforms) {
		uniforms.forEach(function(item){
			var loc = gl.getUniformLocation(program, item);
			program[item] = loc;
		});
	}
	return program;
};

GlHelper.getShader2 = function(id, transform) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = [];

	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3)
			str.push(k.textContent);
		k = k.nextSibling;
	}
	str = str.join("");
	if (transform) {
		str = transform(str);
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
};

GlHelper.getShaderProgram2 = function(shaders, transform, attribs, uniforms) {
	var program = gl.createProgram();
	
	if (attribs === undefined) {
		attribs = [];
		shaders.forEach(function(item){
			var cattr = GlHelper.getAttribs(item, "data-attribs");
			attribs = attribs.concat(cattr);
		});
	}
	if (uniforms === undefined) {
		uniforms = [];
		shaders.forEach(function(item){
			var cattr = GlHelper.getAttribs(item, "data-uniforms");
			uniforms = uniforms.concat(cattr);
		});
	}
	
	shaders.forEach(function(item){
		var shader = GlHelper.getShader2(item, transform);
		gl.attachShader(program, shader);
	});
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}
	gl.useProgram(program);
	if (attribs) {
		attribs.forEach(function(item){
			var loc = gl.getAttribLocation(program, item);
			gl.enableVertexAttribArray(loc);
			program[item] = loc;
		});
	}
	if (uniforms) {
		uniforms.forEach(function(item){
			var loc = gl.getUniformLocation(program, item);
			program[item] = loc;
		});
	}
	return program;
};

GlHelper.initGL = function(canvas, contextCreationParameters) {
	var gl = null;
	try {
		if (typeof canvas === "string") {
			canvas = document.getElementById(canvas);
		}
		gl = canvas.getContext("webgl", contextCreationParameters) || canvas.getContext("experimental-webgl", contextCreationParameters);
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch(e) {}
	if (!gl) {
		gl = null;
	}
	gl.disable(gl.DEPTH_TEST);
	GlHelper.gl = gl;
	return gl;
};

GlHelper.loadTexture = function(path, cb) {
	var gl = GlHelper.gl;
	var img = new Image();
	var tex = new GlHelper.Texture();
	img.onload = function() {
		var tid = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, tid);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(
			gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
			gl.UNSIGNED_BYTE, img);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.bindTexture(gl.TEXTURE_2D, null);
		tex.id = tid;
		tex.width = img.width;
		tex.height = img.height;
		tex.ready = true;
		if (typeof cb !== "undefined") {
			cb.call(tex, tex, img);
		}
	};
	img.src = path;
	return tex;
};

GlHelper.Texture = function() {
	this.width = 0;
	this.height = 0;
	this.ready = false;
	this.id = null;
};

GlHelper.mainloop = function(ontick, delay) {
	var startTime;
	
	var scheduler;
	if (typeof delay === "undefined") {
		scheduler = window.requestAnimationFrame;
	}
	if (typeof scheduler === "undefined") {
		if (typeof delay === "undefined") {
			delay = 10;
		}
		scheduler = function(cb) {
			window.setTimeout(cb, delay);
		};
	}
	
	function handleTick() {
		var currentTime = +Date.now() - startTime;
		ontick(currentTime);
		scheduler(handleTick);
	}
	startTime = +Date.now();
	scheduler(handleTick);
};





