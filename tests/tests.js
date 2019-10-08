var Ethereum_erc20 = require('../../ethereum_erc20');
var ethereum_erc20 = Ethereum_erc20.getObject();


const {describe} = require('mocha');

const {expect} = require('chai');

const assert = require('assert');

describe('Running tests:', function() {
	this.timeout(5000);
	it('initialization', function(done) {
    	// initialize framework
		ethereum_erc20.init(function(res) {
        	
        	describe('Module', function() {
        		var Tests = require('./test-init.js');
        		
        		Tests.run(describe, expect, assert);
        	});
        	
        	
			done()
		});
     });

});

