'use strict';

var Module = class {
	
	constructor() {
		this.name = 'dapps';
		this.current_version = "0.11.1.2019.05.20";
		
		this.global = null; // put by global on registration
		this.isready = false;
		this.isloading = false;
		
		
		// operating
		this.angularcontrollers = [];
		
		this.registerDappsModules();
	}
	
	init() {
		console.log('module init called for ' + this.name);
		
		var global = this.global;
		
		this.isready = true;
	}
	
	loadModule(parentscriptloader, callback) {
		console.log('loadModule called for module ' + this.name);
		
		if (this.isready) {
			if (callback)
				callback(null, this);
			
			return;
		}

		if (this.isloading) {
			var error = 'calling loadModule while still loading for module ' + this.name;
			console.log('error: ' + error);
			
			if (callback)
				callback(error, null);
			
			return;
		}
			
		this.isloading = true;

		var self = this;
		var global = this.global;

		// loading dapps
		var modulescriptloader = global.getScriptLoader('dappsloader', parentscriptloader);
		
		var moduleroot = './dapps';

		// no file loaded
		
		modulescriptloader.load_scripts(function() { self.init(); if (callback) callback(null, self); });
		
		return modulescriptloader;
	}
	
	_getGlobalObject() {
		var _global = (this.global ? this.global : null);
		
		if (!_global) {
			let _GlobalClass;

			if (typeof window !== 'undefined') {
				_GlobalClass = ( window && window.simplestore && window.simplestore.Global ? window.simplestore.Global : null);
			}
			else if (typeof global !== 'undefined') {
				// we are in node js
				_GlobalClass = ( global && global.simplestore && global.simplestore.Global ? global.simplestore.Global : null);
			}
			
			_global = _GlobalClass.getGlobalObject();
		}
			
		return _global;
	}
	
	registerDappsModules() {
		var global = this._getGlobalObject();
		
		console.log('registerDappsModules called for ' + this.name);
		
		var modulescriptloader = global.findScriptLoader('moduleloader');
		var dappsscriptloader = global.findScriptLoader('dappmodulesloader');
		var dappsmodelsloader = dappsscriptloader.getChildLoader('dappsmodelsloader');

		var moduleroot = './dapps';

		//erc20 dapp
		dappsscriptloader.push_script( moduleroot + '/erc20/module.js', function() {
			// load module if initialization has finished
			if (global.isReady())
				global.loadModule('erc20-dapp', modulescriptloader);
			else if (global.hasGlobalScopeInitializationStarted())
				console.log('WARNING: erc20-dapp may be too late for load all module!');
			
			// then load models
			dappsmodelsloader.load_scripts();
		 });
		
	}
	
	isReady() {
		return this.isready;
	}

	hasLoadStarted() {
		return this.isloading;
	}
	
	// optional  module functions
	registerHooks() {
		console.log('module registerHooks called for ' + this.name);
		
		var global = this.global;
		
		global.registerHook('alterMenuBar_hook', 'dapps', this.alterMenuBar_hook);
		global.registerHook('getVersionInfo_hook', 'dapps', this.getVersionInfo_hook);
	}
	
	//
	// hooks
	//
	alterMenuBar_hook(result, params) {
		console.log('alterMenuBar_hook called for ' + this.name);
		
		var global = this.global;
		
		var menuitems = params[1];
		
		var menuitem = [];
		var child;
		
		menuitems.push(menuitem);
		
		menuitem.label = global.t('ERC20 Tokens');
		
		menuitem.children = [];
		
		// private list
		child = {};
		
		child.label = global.t('My list');
		child.state = 'home.erc20tokens';
		
		menuitem.children.push(child);
		
		// create
		child = {};
		
		child.label = global.t('Create');
		child.state = 'home.erc20tokens.create';
		
		menuitem.children.push(child);
		
		// import
		child = {};
		
		child.label = global.t('Import');
		child.state = 'home.erc20tokens.import';
		
		menuitem.children.push(child);
		
		// on the wire
		/*child = {};
		
		child.label = global.t('On the wire');
		child.state = 'home.erc20tokens.onthewire';
		
		menuitem.children.push(child);*/
		

		
		result.push({module: 'dapps', handled: true});
		
		return true;
	}
	
	getVersionInfo_hook(result, params) {
		console.log('getVersionInfo_hook called for ' + this.name);
		
		var global = this.global;
		
		var versioninfos = params[0];
		
		var versioninfo = {};
		
		versioninfo.label = global.t('ethereum erc20');
		versioninfo.value = this.current_version;

		versioninfos.push(versioninfo);

		
		result.push({module: 'dapps', handled: true});
		
		return true;
	}
	
	// functions
	getAngularControllers() {
		return this.angularcontrollers;	
	}
	
	pushAngularController(angularcontroller) {
		this.angularcontrollers.push(angularcontroller);
	}
	

}

if ( typeof GlobalClass !== 'undefined' && GlobalClass ) {
	GlobalClass.getGlobalObject().registerModuleObject(new Module());

	// dependencies
	GlobalClass.getGlobalObject().registerModuleDepency('dapps', 'common');	
}
else if (typeof window !== 'undefined') {
	let _GlobalClass = ( window && window.simplestore && window.simplestore.Global ? window.simplestore.Global : null);
	
	_GlobalClass.getGlobalObject().registerModuleObject(new Module());

	// dependencies
	_GlobalClass.getGlobalObject().registerModuleDepency('dapps', 'common');		
}
else if (typeof global !== 'undefined') {
	// we are in node js
	let _GlobalClass = ( global && global.simplestore && global.simplestore.Global ? global.simplestore.Global : null);
	
	_GlobalClass.getGlobalObject().registerModuleObject(new Module());

	// dependencies
	_GlobalClass.getGlobalObject().registerModuleDepency('dapps', 'common');		
}

