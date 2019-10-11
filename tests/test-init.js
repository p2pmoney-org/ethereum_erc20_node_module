var Tests = class {
	
	static run(describe, expect, assert) {
		
		var Ethereum_core = require('../../ethereum_core');
		var ethereum_core = Ethereum_core.getObject();

		var corecontrollers = ethereum_core.getControllersObject();

		var Ethereum_erc20 = require('../../ethereum_erc20');
		var ethereum_erc20 = Ethereum_erc20.getObject();

		var erc20controllers = ethereum_erc20.getControllersObject();

		var session = corecontrollers.getCurrentSessionObject();

		describe('Controller:', function() {
		    it('core controllers object not null', function() {
		    	assert(corecontrollers != null);
		    });
		    it('erc20 controllers object not null', function() {
		    	assert(erc20controllers !== null);
		    });
		});
		

	}
}

module.exports = Tests;