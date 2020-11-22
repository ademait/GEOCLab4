'use strict'

/**
 TODO Replace this by your own, correct, triangulation function
 Triangles should be return as arrays of array of indexes
 e.g., [[1,2,3],[2,3,4]] encodes two triangles, where the indices are relative to the array points
**/
var tempsClassify = 0;
var eraseElements = 0;
var indexTriangle;

class TreeNode {
	constructor(triangle, vertex0, vertex1, vertex2, index) {
		this.triangle = triangle;
		this.descendents = undefined;
		this.vertices = new Array(vertex0, vertex1, vertex2);
		this.indexTriangle = index;
	}
}

class outputTriangle {
	constructor(triangle, index) {
		this.triangle = triangle;
		this.index = index;
	}
}

function eraseElement(array, triangle) {
	var index = array.findIndex(function (element) {
		return element[0] == triangle[0] && 
				element[1] == triangle[1] &&
				element[2] == triangle[2];
	});
	array.splice(index, 1);
}

function triangulateTree(point, desc, pointIndex) {

	var numDesc = desc.length;

	for (var i = 0; i<numDesc; i++) {
		var node = desc[i];
		var t0, t1;
		t0 = performance.now();
		var type = classifyPoint(point, node.vertices[0], node.vertices[1], node.vertices[2]);
		t1 = performance.now();
		tempsClassify += (t1 - t0);

		switch (type) {
			case 0:
				if (node.descendents) {
					return triangulateTree(point, node.descendents, pointIndex);
					
				} else {
					var index = node.indexTriangle;
					node.indexTriangle = undefined;
					var subTr1 = new TreeNode([pointIndex, node.triangle[0], node.triangle[1]], point, node.vertices[0], node.vertices[1]);
					var subTr2 = new TreeNode([pointIndex, node.triangle[1], node.triangle[2]], point, node.vertices[1], node.vertices[2]);
					var subTr3 = new TreeNode([pointIndex, node.triangle[2], node.triangle[0]], point, node.vertices[2], node.vertices[0]);
					node.descendents = new Array(subTr1, subTr2, subTr3);
					return [[subTr1, subTr2, subTr3], node.triangle, false, index];
				}
			
			case 2:
				if (node.descendents) {
					return triangulateTree(point, node.descendents, pointIndex);
					
				} else {
					var index = node.indexTriangle;
					node.indexTriangle = undefined;
					var subTr1 = new TreeNode([pointIndex, node.triangle[0], node.triangle[2]], point, node.vertices[0], node.vertices[2]);
					var subTr2 = new TreeNode([pointIndex, node.triangle[1], node.triangle[2]], point, node.vertices[1], node.vertices[2]);
					node.descendents = new Array(subTr1, subTr2);

					return [[subTr1, subTr2], node.triangle, true, index];	
				}
				
			
			case 3:
				if (node.descendents) {
					return triangulateTree(point, node.descendents, pointIndex);
					
				} else {
					var index = node.indexTriangle;
					node.indexTriangle = undefined;
					var subTr1 = new TreeNode([pointIndex, node.triangle[0], node.triangle[1]], point, node.vertices[0], node.vertices[1]);
					var subTr2 = new TreeNode([pointIndex, node.triangle[1], node.triangle[2]], point, node.vertices[1], node.vertices[2]);
					node.descendents = new Array(subTr1, subTr2);
					
					return [[subTr1, subTr2], node.triangle, true, index];
				}
			
			case 4:
				if (node.descendents) {
					return triangulateTree(point, node.descendents, pointIndex);
					
				} else {
					var index = node.indexTriangle;
					node.indexTriangle = undefined;
					var subTr1 = new TreeNode([pointIndex, node.triangle[0], node.triangle[1]], point, node.vertices[0], node.vertices[1]);
					var subTr2 = new TreeNode([pointIndex, node.triangle[0], node.triangle[2]], point, node.vertices[0], node.vertices[2]);
					node.descendents = new Array(subTr1, subTr2);
	
					return [[subTr1, subTr2], node.triangle, true, index];
				}
		}		
	}
}



function computeTriangulation(points) {
	
	var t0 = performance.now();
	var n = points.length;
	var outputTriangles = new Array; 

	var minx, maxx, miny, maxy;

	minx = maxx = points[0].x;
	miny = maxy = points[0].y;

	for (var j = 1; j<n; j++) {
		if (points[j].x < minx) minx = points[j].x;
		else if (points[j].y < miny) miny = points[j].y;
		else if (points[j].x > maxx) maxx = points[j].x;
		else if (points[j].y > maxy) maxy = points[j].y;
	}

	var dx = maxx - minx;
	var dy = maxy - miny;

	/* The vertices of the enclosing triangle will be computed by the values of
	the enclosing rectangle oriented with coordinate axis. These values are the 
	minimum value of coordinate x and y of our point set, and the maximum value of
	coordinate x and y. 
	Then the triangle will be something similar to this:
		    3
           / \
          /   \
         /     \
        /-------\       ---
	   /|       |\       |
	  / |       | \      | dy
	 /  |       |  \     |
	/   |       |   \    |
   1-----------------2  ---
	|-a-|---dx--|-a--|
	I will compute the enclosing triangle creating an equilateral triangle (alpha = 60º).
	To compute the vertices it will be used the tangent of alpha to know the coordinates of
	the vertices. 
	Then it will be subtracted or added the 10th percent of the width/height of the rectangle
	to be sure none of the points of the set will be collinear with an edge of the triangle.
	*/
	// I use the ceiling value to work with integers only
	var deg2rad = Math.PI/180;
	var a = Math.ceil((dy/(Math.tan(deg2rad*60))));
	var vertex1coordX = minx - a - 0.1*dx;
	var vertex1coordY = miny - 0.1*dy;

	var vertex2coordX = maxx + a + 0.1*dx;
	var vertex2coordY = vertex1coordY;

	/*The coordinates of the third vertex will be:
	·x: The min value of x plus midpoint of the width of the rectangle
	·y: The min value of y plus the height of the equilateral triangle. This is calculated with
		the same trigonometric rules of the computation of a
	
	It will also be added the 10th percent at the coordinate y*/
	var vertex3coordX = minx + (dx/2);
	var vertex3coordY = miny + ((a + dx/2)/Math.tan(deg2rad*30)) + 0.1*dy;

	var vertexTriangle3 = {'x':vertex3coordX, 'y':vertex3coordY, 'z':0.0};
	points.unshift(vertexTriangle3);
	var vertexTriangle2 = {'x':vertex2coordX, 'y':vertex2coordY, 'z':0.0};
	points.unshift(vertexTriangle2);
	var vertexTriangle1 = {'x':vertex1coordX, 'y':vertex1coordY, 'z':0.0};
	points.unshift(vertexTriangle1);
	
	outputTriangles[0] = [0, 1, 2];
	var tr = new TreeNode([0, 1, 2], vertexTriangle1, vertexTriangle2, vertexTriangle3, 0);

	var t1 = performance.now();
	var string = "time preprocess: " + (t1 - t0).toFixed(0) + " milliseconds.";
	console.log(string);
	var n0, n1;
	for (var i=3;i<n+3;i++) {
		
		if (tr.descendents) {
			var ret = triangulateTree(points[i], tr.descendents, i);
			// n0 = performance.now();
			// eraseElement(outputTriangles, ret[1]);
			// n1 = performance.now();
			// eraseElements += (n1-n0);
			var indexTrOut = ret[3];
			outputTriangles[indexTrOut] = ret[0][0].triangle;
			ret[0][0].indexTriangle = indexTrOut;
			var outputLength = outputTriangles.length;
			for (var m = 1; m<ret[0].length; m++) {
				ret[0][m].indexTriangle = outputLength;
				outputLength++;
				outputTriangles.push(ret[0][m].triangle);
			}
			if (ret[2]) {
				var secondRet = triangulateTree(points[i], tr.descendents, i);
				var indexTr2Out = secondRet[3];
				outputTriangles[indexTr2Out] = secondRet[0][0].triangle;
				secondRet[0][0].indexTriangle = indexTr2Out;
				for (var k = 1; k<secondRet[0].length; k++) {
					secondRet[0][m].indexTriangle = outputLength;
					outputLength++;
					outputTriangles.push(secondRet[0][k].triangle);
				}
			}
			
			
		} else {
			var point = points[i];
			tr.indexTriangle = undefined;
			var subTr1 = new TreeNode([i, 0, 1], point, tr.vertices[0], tr.vertices[1], 0);
			var subTr2 = new TreeNode([i, 1, 2], point, tr.vertices[1], tr.vertices[2], 1);
			var subTr3 = new TreeNode([i, 2, 0], point, tr.vertices[2], tr.vertices[0], 2);
			tr.descendents = new Array(subTr1, subTr2, subTr3);
			outputTriangles[0] = subTr1.triangle;
			outputTriangles.push(subTr2.triangle, subTr3.triangle);
		}
		
		
	}
	console.log("Classify points Total: " + tempsClassify + "ms");
	console.log("erase points Total: " + eraseElements + "ms");
	return outputTriangles;
}



function pointsAreEqual(p1, p2) {
	
	if (p1.x == p2.x && p1.y == p2.y) return true;
  return false;
  
}

function minPoint(p1, p2) {

if (p1.x < p2.x) return true;
else if (p1.x > p2.x) return false;
else {
  if (p1.y < p2.y) return true;
}
return false;

}

function maxPoint(p1, p2) {

if (p1.x > p2.x) return true;
else if (p1.x < p2.x) return false;
else {

if (p1.y > p2.y) return true;
}
return false;

}

function computeDeterminant(v1, v2, v3) {
	return ((v2.x - v1.x)*(v3.y - v1.y) - (v3.x - v1.x)*(v2.y - v1.y));
}

function classifyPoint(p, vertex1, vertex2, vertex3) {

	/*type: 0-inside, 1-outside, >1-collinear with an edge:
	·2: p is in the edge v1-v2
	·3: p is in the edge v1-v3
	·4: p is in the edge v2-v3
	*/
	var type;  
	var swap = false;
  
	var detMat12v = computeDeterminant(vertex1, vertex2, vertex3);

	if (detMat12v < 0) {
		[vertex2, vertex3] = [vertex3, vertex2];
		swap = true;
	} 

	var detMat12p = computeDeterminant(vertex1, vertex2, p);
	var detMat23p = computeDeterminant(vertex2, vertex3, p);
	var detMat31p = computeDeterminant(vertex3, vertex1, p);
  
	if (detMat12p > 0 && detMat31p > 0 && detMat23p > 0) type = 0;
	else if (detMat12p == 0) {
  
	  if (maxPoint(vertex1, vertex2)) {
  

		if (minPoint(p, vertex2) || maxPoint(p, vertex1)) type = 1;
		else if (pointsAreEqual(p,vertex1) || pointsAreEqual(p,vertex2)) type = 1;
		else type = 2;

	  } else {
  
		if (minPoint(p, vertex1) || maxPoint(p, vertex2)) type = 1;		
		else if (pointsAreEqual(p,vertex1) || pointsAreEqual(p,vertex2)) type = 1;
		else type = 2;
  
	  }
  
	}
	else if (detMat31p == 0) {
  
	  if (maxPoint(vertex1, vertex3)) {
  
		if (minPoint(p, vertex3) || maxPoint(p, vertex1)) type = 1;
		else if (pointsAreEqual(p,vertex1) || pointsAreEqual(p,vertex2)) type = 1;
		else type = 3;

	  } else {
  
		if (minPoint(p, vertex1) || maxPoint(p, vertex3)) type = 1;
		else if (pointsAreEqual(p,vertex1) || pointsAreEqual(p,vertex2)) type = 1;
		else type = 3;
  
	  }
  
	}
	else if (detMat23p == 0) {
  
	  if (maxPoint(vertex2, vertex3)) {
  
		if (minPoint(p, vertex3) || maxPoint(p, vertex2)) type = 1;
		else if (pointsAreEqual(p,vertex1) || pointsAreEqual(p,vertex2)) type = 1;
		else type = 4;

	  } else {
  
		if (minPoint(p, vertex2) || maxPoint(p, vertex3)) type = 1;
		else if (pointsAreEqual(p,vertex1) || pointsAreEqual(p,vertex2)) type = 1;
		else type = 4;
  
	  }
  
	}
	else type = 1;
	
	if (swap) {
		switch(type) {
			case 2:
				type = 3;
				break;
			case 3:
				type = 2
		}
	}
	return type;
  }