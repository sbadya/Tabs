/*jshint expr: true*/
describe('Tab API test', function() {
	var tabs;
	var tabsContainer;
	var list;
	var createTabsContainer;
	var tab;

	before(function() {

		createTabsContainer = function() {
			var tabsContainer = document.createElement('div');
			tabsContainer.className = 'aras-tabs';
			tabsContainer.innerHTML =
				'<span class="aras-tabs-arrow"></span>' +
				'<div>' +
				'<ul></ul>' +
				'</div>' +
				'<span class="aras-tabs-arrow"></span>';

			list = tabsContainer.querySelector('ul');

			return tabsContainer;
		};

		tabsContainer = createTabsContainer();
		tabs = new ArasModules.Tab(tabsContainer);
	});

	beforeEach(function() {
		tab = document.createElement('li');
		tab.textContent = 'New Tab';
	});

	describe('Tabs scrolling test', function() {
		var scrollContainer;
		var moved;

		var addScroll = function(container) {
			document.body.appendChild(container);

			moved = container.querySelector('div');

			while (moved.scrollWidth === moved.clientWidth) {
				var tab = document.createElement('li');
				tab.textContent = 'New Tab';
				list.appendChild(tab);
			}

			return container;
		};

		before(function() {
			scrollContainer = addScroll(tabsContainer);
		});

		after(function() {
			document.body.removeChild(scrollContainer);
			list.innerHTML = '';
		});

		it('Should to check if moved element is scrolled right', function() {
			var rightArrow = scrollContainer.lastElementChild;

			var evObj = document.createEvent('MouseEvents');
			evObj.initEvent('click', true, true);
			rightArrow.dispatchEvent(evObj);

			expect(moved.scrollLeft).to.be.at.least(0);
			expect(scrollContainer.classList.contains('aras-tabs_moved-left')).to.be.true;

		});

		it('Should to check if moved element is scrolled left', function() {
			var leftArrow = scrollContainer.firstElementChild;

			moved.scrollLeft = 1;

			var evObj = document.createEvent('MouseEvents');
			evObj.initEvent('click', true, true);
			leftArrow.dispatchEvent(evObj);

			expect(moved.scrollLeft).to.equal(0);
			expect(scrollContainer.classList.contains('aras-tabs_moved-right')).to.be.true;
		});

		it('When select the first Tab and scrollLeft should be 0', function() {

			moved.scrollLeft = 1;
			var tab = scrollContainer.querySelector('li');
			tabs.selectTab(tab);

			expect(moved.scrollLeft).to.equal(0);
			expect(tab.classList.contains('aras-tabs_active')).to.be.true;
		});

		it('When select the last Tab and scrollRight should be 0', function() {

			moved.scrollLeft = moved.scrollWidth - moved.clientWidth - moved.scrollLeft - 1;

			var tabsList = scrollContainer.querySelectorAll('li');
			var lastTab = tabsList[tabsList.length - 1];
			tabs.selectTab(lastTab);

			expect(moved.scrollWidth - moved.clientWidth - moved.scrollLeft).to.equal(0);
			expect(lastTab.classList.contains('aras-tabs_active')).to.be.true;
		});
	});

	it('Should to check if instance of Tab has public API', function() {
		//API methods
		var methods = ['makeScroll', 'makeClosed', 'removeTab', 'makeSelected', 'selectTab',
			'setTabContent', 'addTab', 'scrollIntoView'];

		var prototypeMethods = Object.getOwnPropertyNames(ArasModules.Tab.prototype);
		prototypeMethods.splice(prototypeMethods.indexOf('constructor'), 1);

		expect(prototypeMethods.length).to.be.eq(methods.length);

		methods.forEach(function(method) {
			expect(prototypeMethods.indexOf(method)).to.be.not.eq(-1);
		});
	});

	it('Should to check if tab is added', function() {
		tabs.addTab(tab);

		expect(list.contains(tab)).to.be.true;
		list.removeChild(tab);
	});

	it('Should to check if tab content is set', function() {
		tabs.setTabContent(tab, 'some content', true);
		var tabCloseElem = tab.querySelector('.aras-icon-close');

		var siblingTab = document.createElement('li');
		tabs.setTabContent(siblingTab, 'some content');
		var siblingCloseElem = siblingTab.querySelector('.aras-icon-close');

		expect(tab.textContent).to.be.equal('some content');
		expect(tabCloseElem).to.be.exist;

		expect(siblingTab.textContent).to.be.equal('some content');
		expect(siblingTab.contains(siblingCloseElem)).to.be.false;
	});

	it('Should to check if tab is selected when click on tab', function() {
		tabs.addTab(tab);

		var siblingTab = document.createElement('li');
		siblingTab.textContent = 'Sibling Tab';
		tabs.addTab(siblingTab);

		var evObj = document.createEvent('MouseEvents');
		evObj.initEvent('click', true, true);
		tab.dispatchEvent(evObj);

		expect(list.querySelectorAll('li').length).to.be.equal(2);
		expect(siblingTab.classList.contains('aras-tabs_active')).to.be.false;
		expect(tab.classList.contains('aras-tabs_active')).to.be.true;

		list.removeChild(tab);
		list.removeChild(siblingTab);
	});

	it('Should to check if active tab is removed and sibling tab is selected', function() {
		tabs.addTab(tab);
		tabs.selectTab(tab);

		var siblingTab = document.createElement('li');
		siblingTab.textContent = 'Sibling Tab';
		tabs.addTab(siblingTab);

		tabs.removeTab(tab);

		expect(list.contains(tab)).to.be.false;
		expect(siblingTab.classList.contains('aras-tabs_active')).to.be.true;

		list.removeChild(siblingTab);
	});

	it('Should to check if tab is closed when click on close button', function() {
		tabs.addTab(tab);
		tabs.setTabContent(tab, 'some content', true);

		var closeElem = tab.querySelector('.aras-icon-close');

		var evObj = document.createEvent('MouseEvents');
		evObj.initEvent('click', true, true);
		closeElem.dispatchEvent(evObj);

		expect(list.contains(tab)).to.be.false;
	});

	it('Should to check if tab is closed when click on wheel', function() {
		tabs.addTab(tab);
		tabs.setTabContent(tab, 'some content', true);

		var evObj = document.createEvent('MouseEvents');
		evObj.initMouseEvent('mouseup', true, true, null, 0, 0, 0, 0, 0, true, true, true, null, 1, null);

		tab.dispatchEvent(evObj);

		expect(list.contains(tab)).to.be.false;
	});
});
