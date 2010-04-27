dojo.provide("dojox.dnd.BoundingBoxController");

dojo.declare(
	"dojox.dnd.BoundingBoxController",
	[],
	{
		// summary: Allows the user draw bounding boxes around nodes on the page.
		// Publishes to the "/dojox/dnd/bounding" topic to tell the selector to check
		// to see whether any dnd items fall within the coordinates of the bounding box 
		
		// x,y start and end coordinates for the bounding box
		_startX: null,
		_startY: null,
		_endX: null,
		_endY: null,

		constructor: function(args) {
			// summary: Sets mouse handlers for the document to capture when a user is
			// trying to draw a bounding box.
			// args: Object: a dict of parameters, recognized parameters are:
			//  domNode: Object: the dom node which represents the bounding box on the page.
			//	sources: Array: an array of dojox.dnd.Selectors which need to be aware of the
			//           positioning of the bounding box.
			dojo.connect(dojo.doc, "onmousedown", this, "_onMouseDown");
			dojo.connect(dojo.doc, "onmouseup", this, "_onMouseUp");
			dojo.connect(dojo.doc, "onmousemove", this, "_onMouseMove");
			// when a user is scrolling using a scrollbar, don't draw the bounding box.
			dojo.connect(dojo.doc, "onscroll", this, "_onMouseUp");
			// set up a subscription so the client can easily cancel a user drawing a bounding box.
			dojo.subscribe("/dojox/bounding/cancel", this, "_onMouseUp");
			dojo.forEach(args.sources, function(item) {
				// listen for "/dojox/dnd/bounding" events eminating from the bounding box.
				// for each of the dojox.dnd.selectors passed in args.
				dojo.subscribe("/dojox/dnd/bounding", item, "selectAll");
			});
			this.domNode = args.domNode;
		},
		
		boundingBoxIsViable: function() {
			// summary: Override-able by the client as an extra check to ensure that a bounding
			// box is viable. In some instances, it might not make sense that
			// a mouse down -> mouse move -> mouse up interaction represents a bounding box.
			// For example, if a dialog is open the client might want to suppress a bounding
			// box. This function could be used by the client to ensure that a bounding box is only
			// drawn on the document when certain conditions are met.
			return true;
		},
		
		_onMouseDown: function(evt) {
			// summary: Executed when the user mouses down on the document. Resets the
			// this._startX and this._startY member variables.
			// evt: Object: the mouse event which caused this callback to fire.
			if(this._startX == null && this._startY == null) {
				this._startX = evt.clientX;
				this._startY = evt.clientY;
			}
		},
		
		_onMouseMove: function(evt) {
			// summary: Executed when the user moves the mouse over the document. Delegates to
			// this._drawBoundingBox if the user is trying to draw a bounding box.
		 	// whether the user was drawing a bounding box and publishes to the
		 	// "/dojox/dnd/bounding" topic if the user is finished drawing their bounding box.
			// evt: Object: the mouse event which caused this callback to fire.
			if(this._isMouseDown()) {
				this._endX = evt.clientX;
				this._endY = evt.clientY;
				this._drawBoundingBox();
			}
		},

		_onMouseUp: function(evt) {
			// summary: Executed when the users mouses up on the document. Checks to see
		 	// whether the user was drawing a bounding box and publishes to the
		 	// "/dojox/dnd/bounding" topic if the user is finished drawing their bounding box.
			// evt: Object: the mouse event which caused this callback to fire.
			console.warn("_onMouseUp ", this._isMouseDown(), this._endX, this._endY);
			if(this._isMouseDown() && this._endX != null && this._endY != null) {
				// the user has moused up ... tell the selector to check to see whether
				// any nodes within the bounding box need to be selected.
				dojo.publish("/dojox/dnd/bounding", [{startX: this._startX, startY: this._startY,
					endX: this._endX, endY: this._endY}]);
			}
			// hide the bounding box and reset for the next time around
			dojo.style(this.domNode, "display", "none");
			this._startX = null;
			this._startY = null;
			this._endX = null;
			this._endY = null;
		},
		
		_isMouseDown: function() {
			// summary: Checks to see whether this controller believes the mouse to be down on the document.
			// Used to initiate the start of drawing the bounding box.
			// returns a Boolean indicating whether the user has started to draw a bounding box.
			return this._startX != null && this._startY != null && this.boundingBoxIsViable();
		},
		
		_drawBoundingBox: function() {
			// summary: draws the bounding box over the document.
			if(this._endX > this._startX) {
				// the user is moving from left to right
				dojo.style(this.domNode, "left", this._startX + "px");
				dojo.style(this.domNode, "width", (this._endX - this._startX) + "px");
			} else {
				// user is moving from right to left
				dojo.style(this.domNode, "width", (this._startX - this._endX) + "px");
				dojo.style(this.domNode, "left", this._endX + "px");
			}
			if(this._endY > this._startY) {
				// user is moving from top to bottom
				dojo.style(this.domNode, "top", this._startY + "px");
				dojo.style(this.domNode, "height", (this._endY - this._startY) + "px");
			} else {
				// user is moving from bottom to top
				dojo.style(this.domNode, "top", this._endY + "px");
				dojo.style(this.domNode, "height", (this._startY - this._endY) + "px");
			}
			dojo.style(this.domNode, "display", "")
		}
	}
);