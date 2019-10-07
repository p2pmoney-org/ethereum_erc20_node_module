var Ethereum_erc20 = require('../../ethereum_erc20');
var ethereum_erc20 = Ethereum_erc20.getObject();

ethereum_erc20.init(function() {
	var Tests = require('./tests-1.js');

	Tests.run();
	
});


