'use strict';

var ERC20TokenLocalPersistor = class {
	
	constructor(session, contractuuid) {
		this.session = session;
		this.contractuuid = contractuuid;
		
		this.commonmodule = this.session.getGlobalObject().getModuleObject('common');
	}
	
	saveERC20TokenJson(erc20token, callback) {
		var session = this.session;
		var keys = ['contracts'];
		
		var uuid = erc20token.getUUID();
		var json = erc20token.getLocalJson();
		
		console.log('ERC20TokenLocalPersistor.saveERC20TokenJson json to save is ' + JSON.stringify(json));
		
		// update cache
		var commonmodule = this.commonmodule;
		
		var jsonleaf = commonmodule.getLocalJsonLeaf(session, keys, uuid);
		if (jsonleaf) {
			commonmodule.updateLocalJsonLeaf(session, keys, uuid, json);
		}
		else {
			commonmodule.insertLocalJsonLeaf(session, keys, null, null, json);
		}
		
		// save contracts
		var contractsjson = commonmodule.readLocalJson(session, keys); // from cache, since no refresh
		
		commonmodule.saveLocalJson(session, keys, contractsjson, callback);
	}
	
}

if ( typeof GlobalClass !== 'undefined' && GlobalClass )
	GlobalClass.registerModuleClass('erc20', 'ERC20TokenLocalPersistor', ERC20TokenLocalPersistor);
else if (typeof window !== 'undefined') {
	let _GlobalClass = ( window && window.simplestore && window.simplestore.Global ? window.simplestore.Global : null);
	
	_GlobalClass.registerModuleClass('erc20', 'ERC20TokenLocalPersistor', ERC20TokenLocalPersistor);
}
else if (typeof global !== 'undefined') {
	// we are in node js
	let _GlobalClass = ( global && global.simplestore && global.simplestore.Global ? global.simplestore.Global : null);
	
	_GlobalClass.registerModuleClass('erc20', 'ERC20TokenLocalPersistor', ERC20TokenLocalPersistor);
}