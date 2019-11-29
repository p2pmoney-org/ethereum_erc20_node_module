/**
 * 
 */
'use strict';


console.log('@p2pmoney-org/ethereum_erc20 node module');

if ( typeof window !== 'undefined' && window ) {
	// react-native
	console.log('creating window.simplestore in @p2pmoney-org/ethereum_erc20 index.js');

	window.simplestore = {};
	
	window.simplestore.nocreation = true;
	
} else if ((typeof global !== 'undefined') && (typeof global.simplestore === 'undefined')) {
	// nodejs
	console.log('creating global.simplestore in @p2pmoney-org/ethereum_erc20 index.js');
	global.simplestore = {};
}

const Ethereum_erc20 = require('./ethereum_erc20.js');


module.exports = Ethereum_erc20