'use strict';

var ERC20TokenLocalPersistor = class {
	
	constructor(session, contractuuid) {
		this.session = session;
		this.contractuuid = contractuuid;
		
		this.global = this.session.getGlobalObject()
		this.commonmodule = this.global.getModuleObject('common');
	}
	
	saveERC20TokenJson(erc20token, callback) {
		var global = this.global;
		var session = this.session;
		
		var uuid = erc20token.getUUID();
		var json = erc20token.getLocalJson();
		
		console.log('ERC20TokenLocalPersistor.saveERC20TokenJson json to save is ' + JSON.stringify(json));
		
		var commonmodule = this.commonmodule;
		var ethnodemodule = global.getModuleObject('ethnode');

		// refresh cache before inserting leave to be sure not to overload with out of sync cache
		return new Promise((resolve, reject) => { 
			ethnodemodule.getContractsObject(session, true, (err, res) => {
				if (err) reject(err); else resolve(res);
			});
		})
		.then(() => {
			// update cache
			var keys = ['contracts'];
			
			var jsonleaf = commonmodule.getLocalJsonLeaf(session, keys, uuid);
			if (jsonleaf) {
				commonmodule.updateLocalJsonLeaf(session, keys, uuid, json);
			}
			else {
				commonmodule.insertLocalJsonLeaf(session, keys, null, null, json);
			}
			
			// save contracts in cache under keys
			var contractsjson = commonmodule.readLocalJson(session, keys); // from cache, since no refresh
			
			return new Promise((resolve, reject) => { 
				commonmodule.saveLocalJson(session, keys, contractsjson, (err, res) => {
					if (err) reject(err); else resolve(res);
				})
			});
		})
		.then(() => {
			if (callback)
				callback(null, json)
		})
		.catch(err => {
			console.log('error in ERC20TokenLocalPersistor.saveERC20TokenJson: ' + err);
			
			if (callback)
				callback(err, null)
		});
		
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