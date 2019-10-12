'use strict';

var modulecontrollers;

var ModuleControllers = class {
	
	constructor() {
		this.module = null;
		
		this.ethereum_erc20 = require('../../../ethereum_erc20').getObject();
		this.ethereum_core = this.ethereum_erc20.ethereum_core;
		
		this.global = this.ethereum_erc20.getGlobalObject();

		this.session = null;
	}
	
	
	//
	// ERC20
	//
	
	_importERC20Token(session, tokenaddress) {
		var global = this.global;
		
		var erc20tokenmodule = global.getModuleObject('erc20');
		
		var data = {};
		
		data['description'] = tokenaddress;
		data['address'] = tokenaddress;
		
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		
		// create (local) contract for these values
		var erc20tokencontract = erc20tokencontrollers.createERC20TokenObject(session, data);
		
		return erc20tokencontract;
	}
	
	getWalletERC20Position(session, providerurl, tokenaddress, address, callback) {
		var global = this.global;

		var commonmodule = global.getModuleObject('common');
		
		var ethnodemodule = global.getModuleObject('ethnode');
		
		// set providerurl as web3 provider
		ethnodemodule.setWeb3ProviderUrl(providerurl, session);
		
		// create account with this address
		var account = this._createAccount(session, address);

		// import erc20 token contract
		var erc20tokencontract = this._importERC20Token(session, tokenaddress);
		
		// ask for balance
		erc20tokencontract.balanceOf(account, function(err, res) {
			var balance = res;
			
			if (!err) {
				console.log('balance position for ' + address + ' is: ' + balance);
				
				if (callback)
					callback(err, balance);
			}
			else {
				console.log('balance position for ' + address + ' could not be retrieved');
				if (callback)
					callback('could not retrieve erc20 token balance', null);
			}
		});
	}
	
	sendERC20Tokens(session, providerurl, tokenaddress, senderprivatekey, recipientaddress, fee, callback) {
		var global = this.global;

		var commonmodule = global.getModuleObject('common');
		var ethnodemodule = global.getModuleObject('ethnode');

		// import erc20 token contract
		var erc20tokencontract = this._importERC20Token(session, tokenaddress);
		
		
		if (erc20tokencontract) {
			
			var fromaccount = this._createAccount(session, null, senderprivatekey);
			var toaccount = this._createAccount(session, recipientaddress);
			var payingaccount = fromaccount;
			
			var gaslimit = fee.gaslimit;
			var gasPrice = fee.gasPrice;
			
			// unlock account
			ethnodemodule.unlockAccount(session, payingaccount, password, 300) // 300s, but we can relock the account
			.then(function(res) {
				console.log('paying account ' + payingaccount.getAddress() + ' is now unlocked');
				try {
					erc20tokencontract.transfer(fromaccount, toaccount, tokenamount, payingaccount, gaslimit, gasPrice, function (err, res) {
						
						if (!err) {
							console.log('transfer transaction successful: ' + res);
							
							if (callback)
								callback(null, res);
						}
						else  {
							console.log('error in token transfer: ' + err);
							
							if (callback)
								callback('error in token transfer: ' + err, null);
						}
						
						// relock account
						ethnodemodule.lockAccount(session, payingaccount);

					});
					
				}
				catch(e) {
					console.log('error in token transfer: ' + e);
				}

			});
		}
	}		

	
	// static
	static getObject() {
		if (modulecontrollers)
			return modulecontrollers;
		
		modulecontrollers = new ModuleControllers();
		
		return modulecontrollers;
	}
}

module.exports = ModuleControllers; 