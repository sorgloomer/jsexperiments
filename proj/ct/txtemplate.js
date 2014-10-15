(function() {
	function coalarr(arr, indices) {
		for (var i = 0, li = indices.length; i < li; i++) {
			var tmp = arr[indices[i]];
			if (tmp !== null && tmp !== undefined) return tmp;
		}
	}

	function Templater(template, pattern, groups) {
		if (pattern) {
			groups = groups || [1];
		} else {
			pattern = /(<%([\s\S]*?)%>|^\s*?#([\s\S]*?)\n)/gm;
			groups = [2, 3];
		}
		
		var cursor = 0;
		var genlines = ["var $result = [];"];
		var chunks = [];
		var match;
		while ((match = pattern.exec(template)) !== null) {
			chunks.push(template.substring(cursor, match.index));
			genlines.push("$result.push($chunks[" + (chunks.length - 1) + "]);");
			var command = coalarr(match, groups);
			if (command.charAt(0) === "=") {
				genlines.push("$result.push(String("+command.substring(1)+"));");
			} else {
				genlines.push(command);
			}
			cursor = pattern.lastIndex;
		}
		chunks.push(template.substring(cursor));
		genlines.push("$result.push($chunks[" + (chunks.length - 1) + "]);");
		genlines.push("return $result.join('');");

		this.templateFunc = new Function('$chunks', genlines.join(""));
		this.chunks = chunks;
	}

	Templater.prototype.apply = function(scope) {
		scope = scope || {};
		var str = this.templateFunc.call(scope, this.chunks);
		return str;
	};

	Templater.apply = function(template, scope, pattern, groups) {
		var tmp = new Templater(template, pattern, groups);
		return tmp.apply(scope);
	};
	
	window.Templater = Templater;
})();