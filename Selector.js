dojo.provide("dojox.dnd.Selector");

dojo.require("dojo.dnd.Selector");

dojo.declare(
	"dojox.dnd.Selector",
	[dojo.dnd.Selector],
	{
		// summary: a mixin for the dojo.dnd.Selector class which adds functionality
		// to shift the currently selected index backwards and forwards. One possible
		// use for this mixin would be to allow a user select different dnd items using
		// the right and left keys.
		
		shift: function(offset, shiftKey) {
			// summary: shifts the currently selected dnd item
			// offset: int: the amount to bump the selection by.
			// shiftKey: Boolean: whether or not this new selection happened when the user was holding
			// down the shift key
			var selectedNodes = this.getSelectedNodes();
			if(selectedNodes && selectedNodes.length) {
				// only delegate to _selectNode if at least one node is selected. If multiple nodes are selected
				// assume that we go with the last selected node.
				this._selectNode(this._getNodeId(selectedNodes[selectedNodes.length - 1].id, offset), shiftKey);
			}
		},
		
		selectAll: function(args) {
			// summary: selects all nodes
			// args: Object: contains coordinate information for the bounding box. (optional)
			// check to see whether this function is being invoked as a result of a bounding box.
			if(args && args.endX != null && args.endY != null) {
				// user has drawn a bounding box ... time to see whether any dom nodes
				// in this container satisfy the bounding box range.
				this.selectNone();
				this.forInItems(function(data, id) {
					var node = dojo.byId(id);
					if(node && this._isBoundedByBox({coords: dojo.coords(node),
											startX: args.startX, endX: args.endX,
											startY: args.startY, endY: args.endY})) {
						this._selectNode(id, true);
					}
				}, this);
				return this._removeAnchor();
			} else {
				// just invoke the regular selectAll without bounding box arguments
				return this.inherited(arguments);
			}
		},
		
		_selectNode: function(nodeId, shiftKey) {
			// summary: selects a node based on nodeId
			// nodeId: String: the id of the node to select
			// shiftKey: Boolean: whether or not this new selection happened when the user was holding
			// down the shift key
			if(!shiftKey) {
				// only clear the selection if the user was not holding down the shift key
				this.selectNone();
			}
			this._addItemClass(dojo.byId(nodeId), "Selected");
			this.selection[nodeId] = 1;
		},
		
		_isBoundedByBox: function(args) {
			// summary: figures out whether certain coodinates bound a particular dom node.
			// args: contains dom node coordinates and coordinates for the
			// positioning of the bounding box
			var isBounded = false, tlx, tly, brx, bry, xBounded, yBounded,
			nodeTlx = args.coords.x, nodeTly = args.coords.y, nodeBrx = args.coords.x + args.coords.w, nodeBry = args.coords.y + args.coords.h;
			// tlx, tly represents the x,y coordinates for the top left of the bounding box
			// brx, bry represents the x,y coordinates for the bottom right of the bounding box
			// nodeTlx, nodeTly represents the x,y coordinates for the top left of the dom node
			// nodeBrx, nodeBry represents the x,y coordinates for the bottom right of the dom node
			if(args.startX < args.endX) {
				tlx = args.startX;
				tly = args.startY;
			} else {
				tlx = args.endX;
				tly = args.endY;
			}
			if(args.startY < args.endY) {
				brx = args.endX;
				bry = args.endY;
			} else {
				brx = args.startX;
				bry = args.startY;
				tlx = args.endX;
				tly = args.endY;
			}
			xBounded = (nodeTlx >= tlx || nodeBrx <= brx) && (tlx <= nodeBrx && brx >= nodeTlx) || (nodeTlx <= tlx && nodeBrx >= brx);
			yBounded = (tly <= nodeBry && bry >= nodeTly) || (nodeBry >= bry && nodeTly <= bry);
			if(xBounded && yBounded) {
				isBounded = true;
			}
			return isBounded;
		},
		
		_getNodeId: function(nodeId, offset) {
			// summary: selects a node based on nodeId
			// nodeId: String: the id of the node to select
			// offset: int: the number of nodes to shift the current selection by
			var allNodes = this.getAllNodes(), newId = nodeId, node;
			for(var i = 0, l = allNodes.length; i < l; i++) {
				node = allNodes[i]; 
				if(node.id == nodeId) {
					// have a match ... make sure we're not at the start or the end of the dnd set
					if(!((offset == -1 && i == 0) || (i == l - 1 && offset == 1))) {
						// we should be fine to go with the id the user has requested.
						newId = allNodes[i + offset].id;
					}
					break;
				}
			}
			// if we don't get a match, the newId defaults to the currently selected node
			return newId;
		}
	}
);