using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Globalization;
using System.Linq;
using System.Collections.Generic;
public class Octree {
	public class Node {
		public float r;
		public float g;
		public float b;
		public Node[] children;
		public bool leaf;
		public static Node Leaf() {
			var res = new Node();
			res.leaf = true;
			return res;
		}
		public static Node Inner() {
			var res = new Node();
			res.children = new Node[8];
			res.leaf = false;
			return res;
		}
	}

	public Node root = Node.Inner();
	public int depth = 6;
	
	public void put(float x, float y, float z, float r, float g, float b) {
		float size = 0.25f;
		Node node = this.root;
		
		for (int i = 0; i < this.depth; i++) {
			int id = 7;
			if (x > 0) id -= 1;
			if (y > 0) id -= 2;
			if (z > 0) id -= 4;
			x = (x > 0) ? x - size : x + size;
			y = (y > 0) ? y - size : y + size;
			z = (z > 0) ? z - size : z + size;
			size *= 0.5f;
			
			Node next = node.children[id];
			if (next == null) {
				next = Node.Inner();
				node.children[id] = next;
			}
			node = next;
		}
		node.leaf = true;
		node.r = r;
		node.g = g;
		node.b = b;
	}

	private int occupied;
	public int size = 128;
	private void help(Bitmap bmp, Node node, int nindex) {
		if (node.leaf) {
			bmp.SetPixel(
				nindex % this.size, 
				bmp.Height - nindex / this.size - 1, 
				Color.FromArgb(
					255,
					(int)(node.r * 255.0f),
					(int)(node.g * 255.0f),
					(int)(node.b * 255.0f)));
		} else {
			int mask = 0;
			for (int i = 0; i < 8; i++) {
				if (node.children[7-i] != null) {
					mask |= 1 << i;
				}
			}
			
			//Console.WriteLine(mask);

			int ix = this.occupied % this.size;
			int iy = this.occupied / this.size;
			bmp.SetPixel(
				nindex % this.size, 
				bmp.Height - nindex / this.size - 1, 
				Color.FromArgb(
					255-mask,
					ix % 256,
					iy % 256,
					((ix / 256) << 4) | (iy / 256)
					));
			
			int index = this.occupied;
			for (int i = 0; i < 8; i++) {
				if (node.children[i] != null) {
					this.occupied++;
				}
			}
			for (int i = 0; i < 8; i++) {
				if (node.children[i] != null) {
					help(bmp, node.children[i], index);
					index++;
				}
			}
		}
	}
	
	public void ToBmp(Bitmap bmp) {
		this.occupied = 1;
		this.help(bmp, this.root, 0);
	}
	
	public struct Vec3 {
		public float X,Y,Z;
		
		public Vec3(float x, float y, float z) {
			this.X = x;
			this.Y = y;
			this.Z = z;
		}
		
		public Vec3 Min(Vec3 o) {
			Vec3 v;
			v.X = Math.Min(X, o.X);
			v.Y = Math.Min(Y, o.Y);
			v.Z = Math.Min(Z, o.Z);
			return v;
		}
		public Vec3 Max(Vec3 o) {
			Vec3 v;
			v.X = Math.Max(X, o.X);
			v.Y = Math.Max(Y, o.Y);
			v.Z = Math.Max(Z, o.Z);
			return v;
		}
		public static float operator*(Vec3 a, Vec3 b) {
			return a.X*b.X+a.Y*b.Y+a.Z*b.Z;
		}
		public static Vec3 operator-(Vec3 a) {
			return new Vec3(-a.X,-a.Y,-a.Z);
		}
	}
	public struct Vec5 {
		public float X,Y,Z,U,V;
		
		public Vec5(float x, float y, float z, float u, float v) {
			this.X = x;
			this.Y = y;
			this.Z = z;
			this.U = u;
			this.V = v;
		}
		public Vec3 XYZ {
			get {
				return new Vec3(X,Y,Z);
			}
		}
	}

	public static void Main(string[] args) {
		string line;
		var oct = new Octree();
		/*
		for (float a = 0; a < 6; a+=0.001f) {
			oct.put((float)Math.Sin(a) * 0.4f, 0.4f, (float)Math.Cos(a) * 0.4f, 1.0f);
		}
		*/
		var ifn = (args.Length > 0) ? args[args.Length - 1] : "input.ply";
		if (args.Length > 1) oct.depth = int.Parse(args[0]);
		if (args.Length > 2) oct.size = int.Parse(args[1]);
		
		
		List<Vec5> list = new List<Vec5>();
		System.IO.StreamReader file = new System.IO.StreamReader(ifn);
		while((line = file.ReadLine()) != null)
		{
			string[] split = line.Split((char[])null, StringSplitOptions.RemoveEmptyEntries);
			if (split.Length == 5) {
				list.Add(new Vec5(
					float.Parse(split[0], CultureInfo.InvariantCulture),
					float.Parse(split[1], CultureInfo.InvariantCulture),
					float.Parse(split[2], CultureInfo.InvariantCulture),
					float.Parse(split[3], CultureInfo.InvariantCulture),
					float.Parse(split[4], CultureInfo.InvariantCulture)
				));
			}
		}

		var cmin = new Vec5(
			list.Min(v => v.X),
			list.Min(v => v.Y),
			list.Min(v => v.Z),
			list.Min(v => v.U),
			list.Min(v => v.V)
		);
		var cmax = new Vec5(
			list.Max(v => v.X),
			list.Max(v => v.Y),
			list.Max(v => v.Z),
			list.Max(v => v.U),
			list.Max(v => v.V)
		);
		float size = Math.Max(Math.Max(cmax.X - cmin.X, cmax.Y - cmin.Y), cmax.Z - cmin.Z);
		list = list.Select(v => new Vec5(
			(v.X - (cmin.X + cmax.X) * 0.5f) / size,
			(v.Y - (cmin.Y + cmax.Y) * 0.5f) / size,
			(v.Z - (cmin.Z + cmax.Z) * 0.5f) / size,
			(v.U - cmin.U) / (cmax.U - cmin.U),
			(v.V - cmin.V) / (cmax.V - cmin.V)
		)).ToList();
		
		foreach (var v in list) {
			oct.put(v.X,v.Y,v.Z,v.U,-v.XYZ * new Vec3(0.3f, 0.3f, 0.3f) + 0.5f,v.V);
		}
		
		for (float i = 0; i <= 1.001f; i += 0.1f) {
			oct.put(i - 0.5f, 0 - 0.5f, 0 - 0.5f, 1, 0, 0);
			oct.put(i - 0.5f, 1 - 0.5f, 0 - 0.5f, 1, 0, 0);
			oct.put(i - 0.5f, 0 - 0.5f, 1 - 0.5f, 1, 0, 0);
			oct.put(i - 0.5f, 1 - 0.5f, 1 - 0.5f, 1, 0, 0);
			oct.put(0 - 0.5f, 0 - 0.5f, i - 0.5f, 1, 0, 0);
			oct.put(0 - 0.5f, 1 - 0.5f, i - 0.5f, 1, 0, 0);
			oct.put(1 - 0.5f, 0 - 0.5f, i - 0.5f, 1, 0, 0);
			oct.put(1 - 0.5f, 1 - 0.5f, i - 0.5f, 1, 0, 0);
			oct.put(0 - 0.5f, i - 0.5f, 0 - 0.5f, 1, 0, 0);
			oct.put(0 - 0.5f, i - 0.5f, 1 - 0.5f, 1, 0, 0);
			oct.put(1 - 0.5f, i - 0.5f, 0 - 0.5f, 1, 0, 0);
			oct.put(1 - 0.5f, i - 0.5f, 1 - 0.5f, 1, 0, 0);
		}
		
		Bitmap bmp = new Bitmap(oct.size, oct.size, PixelFormat.Format32bppArgb);
		oct.ToBmp(bmp);
		bmp.Save("output.png", ImageFormat.Png);
	}
}