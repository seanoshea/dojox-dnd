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
		
		_getNodeId: function(nodeId, offset) {
			// summary: selects a node based on nodeId
			// nodeId: String: the id of the node to select
			// offset: int: the number of nodes to shift the current selection by
			var allNodes = this.getAllNodes(), newId = nodeId;
			for(var i = 0, l = allNodes.length; i < l; i++) {
				var node = allNodes[i]; 
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