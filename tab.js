(function(externalParent) {
	var tabHelper = {
		controlByScroll: function(elem, moved) {
			var scrollRight = moved.scrollWidth - moved.clientWidth - moved.scrollLeft;
			elem.classList.toggle('aras-tabs_moved-right', scrollRight > 0);
			elem.classList.toggle('aras-tabs_moved-left', moved.scrollLeft > 0);
		},
		scrollLeft: function(elem, moved) {
			moved.scrollLeft = Math.max(0, moved.scrollLeft - moved.clientWidth);
			elem.classList.toggle('aras-tabs_moved-left', moved.scrollLeft !== 0);
			elem.classList.add('aras-tabs_moved-right');
		},
		scrollRight: function(elem, moved) {
			var diffWidth = moved.scrollWidth - moved.clientWidth;
			moved.scrollLeft = Math.min(moved.scrollLeft + moved.clientWidth, diffWidth);
			elem.classList.toggle('aras-tabs_moved-right', moved.scrollLeft !== diffWidth);
			elem.classList.add('aras-tabs_moved-left');
		},
		scrollIntoView: function(elem, moved, tab) {
			var tabStyle = window.getComputedStyle(tab);
			var leftMargin = parseInt(tabStyle.marginLeft);
			var rightMargin = parseInt(tabStyle.marginRight);
			var tabOffset = tab.offsetLeft - moved.offsetLeft;
			var rightOffset = tabOffset + tab.offsetWidth - moved.clientWidth;

			if (rightOffset + rightMargin - moved.scrollLeft > 0) {
				//Firefox and IE have float tab coordinates: adding 1px to fix offset and count right scrollLeft
				moved.scrollLeft = rightOffset + rightMargin + 1;
			} else if (tabOffset - leftMargin - moved.scrollLeft < 0) {
				moved.scrollLeft = tabOffset - leftMargin;
			}
		},
		scrollByTab: function(elem, moved, tab) {
			if (moved.scrollWidth !== moved.clientWidth) {
				tabHelper.scrollIntoView(elem, moved, tab);
				tabHelper.controlByScroll(elem, moved);
				tabHelper.scrollIntoView(elem, moved, tab);
			}
		}
	};

	function Tab(elem) {
		this._elem = elem;
		this._moved = this._elem.querySelector('div');
		this._attachedEvents = {};
		if (this._moved) {
			this.makeScroll();
		}
		this.makeClosed();
		this.makeSelected();
	}

	var TabPrototype = {
		constructor: Tab,
		makeScroll: function() {
			// Binded handlers
			var controlByScrollBinded = tabHelper.controlByScroll.bind(null, this._elem, this._moved);
			var moveScrollLeftBinded = tabHelper.scrollLeft.bind(null, this._elem, this._moved);
			var moveScrollRightBinded = tabHelper.scrollRight.bind(null, this._elem, this._moved);

			// Attach Events on elements
			window.addEventListener('resize', controlByScrollBinded);
			this._elem.firstElementChild.addEventListener('click', moveScrollLeftBinded);
			this._elem.lastElementChild.addEventListener('click', moveScrollRightBinded);

			//Set events in object for destroying
			this._attachedEvents.onScrollable = {
				source: window,
				eventType: 'resize',
				callback: controlByScrollBinded
			};
			this._attachedEvents.onMoveScrollLeft = {
				source: this._elem.firstElementChild,
				eventType: 'click',
				callback: moveScrollLeftBinded
			};
			this._attachedEvents.onMoveScrollRight = {
				source: this._elem.lastElementChild,
				eventType: 'click',
				callback: moveScrollRightBinded
			};

			tabHelper.controlByScroll(this._elem, this._moved);
		},
		makeClosed: function() {
			var close = function(event) {
				var target = event.target;
				if (target.className === 'aras-icon-close') {
					var tab = target.parentNode;
					this.removeTab(tab);
					event.stopPropagation();
				}
			}.bind(this);
			var wheelClose = function(event) {
				var target = event.target;

				// Check if wheel(middle button) is clicked
				if (event.which === 2) {
					var tab = target.closest('li');
					if (tab) {
						this.removeTab(tab);
					}
				}
			}.bind(this);
			var ul = this._elem.querySelector('ul');
			this._attachedEvents.onClose = {
				source: ul,
				eventType: 'click',
				callback: close
			};
			this._attachedEvents.onWheelClose = {
				source: ul,
				eventType: 'mouseup',
				callback: wheelClose
			};
			ul.addEventListener('click', close);
			ul.addEventListener('mouseup', wheelClose);
		},
		removeTab: function(tab) {
			if (tab.classList.contains('aras-tabs_active')) {
				var currentTab = tab.previousElementSibling || tab.nextElementSibling;
				if (currentTab) {
					this.selectTab(currentTab);
				}
			}
			tab.parentNode.removeChild(tab);
			if (this._moved) {
				tabHelper.controlByScroll(this._elem, this._moved);
			}
		},
		makeSelected: function() {
			var select = function(event) {
				var target = event.target;
				var tab = target.closest('li');

				if (tab) {
					this.selectTab(tab);
				}
			}.bind(this);
			this._attachedEvents.onSelect = {
				source: this._elem,
				eventType: 'click',
				callback: select
			};
			this._elem.addEventListener('click', select);
		},
		selectTab: function(tab) {
			var currentActiveTab = this._elem.querySelector('.aras-tabs_active');
			if (currentActiveTab !== tab) {
				if (currentActiveTab) {
					currentActiveTab.classList.remove('aras-tabs_active');
				}
				tab.classList.add('aras-tabs_active');
				this.scrollIntoView(tab);

			}
		},
		setTabContent: function(tab, content, isClosed) {
			if (tab) {
				tab.innerHTML = content || '';
				if (isClosed) {
					var span = document.createElement('span');
					span.className = 'aras-icon-close';
					tab.appendChild(span);
				}
			}
		},
		addTab: function(tab) {
			var list = this._elem.querySelector('ul');
			list.appendChild(tab);
		},
		scrollIntoView: function(tab) {
			if (this._moved) {
				tabHelper.scrollByTab(this._elem, this._moved, tab);
			}
		}
	};
	Tab.prototype = TabPrototype;
	externalParent.Tab = Tab;
	window.ArasModules = window.ArasModules || externalParent;
}(window.ArasModules || {}));
