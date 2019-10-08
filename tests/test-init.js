var Tests = class {
	
	static run(describe, expect, assert) {
		
		var CoreControllers = require('../../ethereum_core/js/control/controllers.js');
		var corecontrollers = CoreControllers.getObject();

		var ERC20Controllers = require('../js/control/controllers.js');
		var erc20controllers = ERC20Controllers.getObject();

		var session = corecontrollers.getCurrentSessionObject();

		describe('Controller:', function() {
		    it('erc20 controller object not null', function() {
		    	assert(erc20controllers !== null);
		    });
		});
		

	}
}

module.exports = Tests;