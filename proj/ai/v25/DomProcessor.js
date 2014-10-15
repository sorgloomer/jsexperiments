function DomProcessor() {
	this._processors = [];
};

DomProcessor.process = function(selector, func, thisArg) {
	DomProcessor.processElement(undefined, selector, func, thisArg);
};

DomProcessor.controlValue = function(el, val) {
	if (val === undefined) {
		if (el.tagName === "INPUT") {
			if (el.type === "checkbox") {
				val = Boolean(el.checked);
			} else if (el.type === "number") {
				val = Number(el.value);
			} else {
				val = el.value;
			}
		} else {
			val = el.value;
		}
	} else {
		if (el.tagName === "INPUT" && el.type === "checkbox") {
			el.checked = val;
		} else {
			el.value = val;
		}
	}
	return val;
};

DomProcessor.processElement = function(root, selector, func, thisArg) {
	if (root === undefined) root = document;
	var els = root.querySelectorAll(selector);
	for (var i = 0; i < els.length; i++) {
		func.call(thisArg, els[i], i);
	}
};

DomProcessor.prototype.push = function(selector, func, thisArg) {
	this._processors.push({selector: selector, func: func, thisArg: thisArg});
	return this;
};

DomProcessor.prototype.process = function(root, thisArg) {
	this._processors.forEach(function(proc) {
		DomProcessor.processElement(
			root,
			proc.selector,
			proc.func,
			proc.thisArg || thisArg);
	});
	return this;
};