

function Octree(field) {
	this.minSize = 0.06;
	this.sigma = 0.18;
	this.field = field;
	this.root = Octree.node();
	this._populate(this.root);
	this.activeNodeCount = 0;
};

+(function() {
	var tmp = vec3.create();
	Octree.prototype.traverse = function(bb,node,p,d) {
		var i,s;
		vec3.sub(tmp,node.p,p);
		s=vec3.dot(tmp,d)*this.sigma;
		if (node.s<=s || node.s<this.minSize) {
			this.activeNodeCount++;
			bb.puta(node.p,node.s,node.c);
			if (node.s < 2*s) node.d = null;
		} else {
			if (node.d===null) this._divide(node);
			for (i = 0; i < 8; i++) this.traverse(bb,node.d[i],p,d);
		}
	};
})();

Octree.prototype._divide = function(node) {
	var d = node.d=new Array(8);
	var qs = node.s*0.25;
	var hs = node.s*0.5;
	var i,p;
	for (i=0;i<8;i++) d[i] = Octree.subnode(node.p,hs);
	p=d[0].p;p[0]+=qs;p[1]+=qs;p[2]+=qs;
	p=d[1].p;p[0]+=qs;p[1]+=qs;p[2]-=qs;
	p=d[2].p;p[0]+=qs;p[1]-=qs;p[2]+=qs;
	p=d[3].p;p[0]+=qs;p[1]-=qs;p[2]-=qs;
	p=d[4].p;p[0]-=qs;p[1]+=qs;p[2]+=qs;
	p=d[5].p;p[0]-=qs;p[1]+=qs;p[2]-=qs;
	p=d[6].p;p[0]-=qs;p[1]-=qs;p[2]+=qs;
	p=d[7].p;p[0]-=qs;p[1]-=qs;p[2]-=qs;
	for (i=0;i<8;i++) this._populate(d[i]);
};
Octree.prototype._populate = function(node) {
	node.c[3]=this.field(node.p,node.s);
};
Octree.node = function() {
	return {p:vec3.create(),s:1,c:vec4.fromValues(1.0,1.0,1.0,1.0),d:null};
};
Octree.subnode = function(p,hs) {
	return {p:vec3.clone(p),s:hs,c:vec4.fromValues(1.0,1.0,1.0,1.0),d:null};
};

Octree.prototype.update = function(bb,pos,dir) {
	this.activeNodeCount = 0;
	bb.begin(0,Billboard.ADD);
	this.traverse(bb,this.root,pos,dir);
	bb.end();
};