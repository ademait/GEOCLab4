'use strict'

/* These two global variables are used to improve the efficency regarding execution time of the program
-indexTriangle is used to store the index of the triangle in the outputTriangles array. Before that i used
	a function that looked for the index every time i had to replace a triangle with another two or three
	new triangles. The execution time of this function in Lanzarote was around 2500ms, so using a global
	variable was a much better alternative.
-firstDegen is used to know when a point is in a degenerative position. I use this boolean to know when to 
	create the four new triangles if it's the case.
*/
var indexTriangle;
var firstDegen = false;

/* Each node of my structure -that simulates a tree- has the information of:
-The triangle that forms.
-The two or three triangles, called descendents, inside him -if there's any-. This will be of the type 
	TreeNode also.
-The three vertices that form the triangle.
-The index of the triangle in the outputTriangles array. It's undefined when this triangle is erased from 
	outputTriangles
*/
class TreeNode {
	constructor(triangle, vertex0, vertex1, vertex2, index) {
		this.triangle = triangle;
		this.descendents = undefined;
		this.vertices = new Array(vertex0, vertex1, vertex2);
		this.indexTriangle = index;
	}
}

/* This is the function I used to erase the triangle of outputTriangles which took so much computation time.
I saved it only to justify the indexTriangle global variable
function eraseElement(array, triangle) {
	var index = array.findIndex(function (element) {
		return element[0] == triangle[0] && 
				element[1] == triangle[1] &&
				element[2] == triangle[2];
	});
	array.splice(index, 1);
}*/

/* This is the function where is computed whether a point is inside a triangle or not. It's a recursive function, and
returns an array:
-[0]: An array of the two or three new triangles formed
-[1]: The triangle where the triangles of [0] are into. This triangle has to be erased from outputTriangles.
-[2]: Boolean which tells if it has to be done another call at this function -because of the degenerative points-
-[3]: The index of the triangle at [1] of outputTriangles. 

In this function it is used the firstDegen global variable. When it's true means that at the first triangle which the point
is in a degenerative position -type > 1- it will not make a return. This will cause that it will keep executing the function
until the second triangle is found, and then it will make a return, because firstDegen will be put in false.
*/
function triangulateTree(point, desc, pointIndex) {

	var numDesc = desc.length;

	for (var i = 0; i<numDesc; i++) {
		var node = desc[i];
		var type = classifyPoint(point, node.vertices[0], node.vertices[1], node.vertices[2]);

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
					if (firstDegen) {
						triangulateTree(point, node.descendents, pointIndex);
						firstDegen = false;
					}
					else return triangulateTree(point, node.descendents, pointIndex);
					
				} else {
					var index = node.indexTriangle;
					node.indexTriangle = undefined;
					var subTr1 = new TreeNode([pointIndex, node.triangle[0], node.triangle[2]], point, node.vertices[0], node.vertices[2]);
					var subTr2 = new TreeNode([pointIndex, node.triangle[1], node.triangle[2]], point, node.vertices[1], node.vertices[2]);
					node.descendents = new Array(subTr1, subTr2);
					
					return [[subTr1, subTr2], node.triangle, true, index];	
				}
				break;
				
			
			case 3:
				if (node.descendents) {
					if (firstDegen) {
						triangulateTree(point, node.descendents, pointIndex);
						firstDegen = false;
					}
					else return triangulateTree(point, node.descendents, pointIndex);
					
				} else {
					var index = node.indexTriangle;
					node.indexTriangle = undefined;
					var subTr1 = new TreeNode([pointIndex, node.triangle[0], node.triangle[1]], point, node.vertices[0], node.vertices[1]);
					var subTr2 = new TreeNode([pointIndex, node.triangle[1], node.triangle[2]], point, node.vertices[1], node.vertices[2]);
					node.descendents = new Array(subTr1, subTr2);
					
					return [[subTr1, subTr2], node.triangle, true, index];
				}
				break;
			
			case 4:
				if (node.descendents) {
					if (firstDegen) {
						triangulateTree(point, node.descendents, pointIndex);
						firstDegen = false;
					}
					else return triangulateTree(point, node.descendents, pointIndex);

				} else {
					var index = node.indexTriangle;
					node.indexTriangle = undefined;
					var subTr1 = new TreeNode([pointIndex, node.triangle[0], node.triangle[1]], point, node.vertices[0], node.vertices[1]);
					var subTr2 = new TreeNode([pointIndex, node.triangle[0], node.triangle[2]], point, node.vertices[0], node.vertices[2]);
					node.descendents = new Array(subTr1, subTr2);
	
					return [[subTr1, subTr2], node.triangle, true, index];
				}
				break;
		}		
	}
}



function computeTriangulation(points) {
	
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
	/* tr would be the root in a tree data structure */
	var tr = new TreeNode([0, 1, 2], vertexTriangle1, vertexTriangle2, vertexTriangle3, 0);

	for (var i=3;i<n+3;i++) {
		
		if (tr.descendents) {

			var ret = triangulateTree(points[i], tr.descendents, i);

			var indexTrOut = ret[3];
			outputTriangles[indexTrOut] = ret[0][0].triangle;
			ret[0][0].indexTriangle = indexTrOut;
			var outputLength = outputTriangles.length;
			for (var m = 1; m<ret[0].length; m++) {
				ret[0][m].indexTriangle = outputLength;
				outputLength++;
				outputTriangles.push(ret[0][m].triangle);
			}
			/* This is where i make the second call at triangulateTree if the point was in a 
			degenerative position */
			if (ret[2]) {
				firstDegen = true;
				var secondRet = triangulateTree(points[i], tr.descendents, i);
				var indexTr2Out = secondRet[3];
				outputTriangles[indexTr2Out] = secondRet[0][0].triangle;
				secondRet[0][0].indexTriangle = indexTr2Out;
				for (var k = 1; k<secondRet[0].length; k++) {
					secondRet[0][k].indexTriangle = outputLength;
					outputLength++;
					outputTriangles.push(secondRet[0][k].triangle);
				}
				firstDegen = false;
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
	return outputTriangles;
}


/* This functions are the same of the ones of lab2.
I only improved the performance of classify point. */
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
		
		if (pointsAreEqual(p,vertex1) || pointsAreEqual(p,vertex2)) {
			if (firstDegen) type = 1;
			else type = 2;
		} 
		if (maxPoint(vertex1, vertex2)) {


			if (minPoint(p, vertex2) || maxPoint(p, vertex1)) type = 1;
			else type = 2;

		} else {
	
			if (minPoint(p, vertex1) || maxPoint(p, vertex2)) type = 1;		
			else type = 2;
	
		}
  
	}
	else if (detMat31p == 0) {
		if (pointsAreEqual(p,vertex1) || pointsAreEqual(p,vertex3)) {
			if (firstDegen) type = 1;
			else type = 3;
		} 
  
		if (maxPoint(vertex1, vertex3)) {
	
			if (minPoint(p, vertex3) || maxPoint(p, vertex1)) type = 1;
		
			else type = 3;

		} else {
	
			if (minPoint(p, vertex1) || maxPoint(p, vertex3)) type = 1;
		
			else type = 3;
	
		}
  
	}
	else if (detMat23p == 0) {
		if (pointsAreEqual(p,vertex2) || pointsAreEqual(p,vertex3)) {
			if (firstDegen) type = 1;
			else type = 4;
		} 
  
		if (maxPoint(vertex2, vertex3)) {
	
			if (minPoint(p, vertex3) || maxPoint(p, vertex2)) type = 1;
			else type = 4;

		} else {
	
			if (minPoint(p, vertex2) || maxPoint(p, vertex3)) type = 1;
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