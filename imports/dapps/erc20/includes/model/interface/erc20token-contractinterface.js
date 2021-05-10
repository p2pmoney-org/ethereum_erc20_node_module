'use strict';

var ERC20TokenContractInterface = class {
	
	constructor(session, contractaddress, web3providerurl) {
		this.session = session;
		this.address = contractaddress;
		
		this.contractpath = './contracts/TokenERC20.json';
		
		this.web3providerurl = web3providerurl;

		this.chainid = null;
		this.networkid = null;

		
		// operating variables
		this.finalized_init = null;
		
		this.contractinstance = null;
		
		var global = session.getGlobalObject();
		this.ethnodemodule = global.getModuleObject('ethnode');
	}
	
	getContractPath() {
		return this.contractpath;
	}

	setContractPath(path) {
		this.contractpath = path;
		this.contractinstance = null;
	}
	
	getAddress() {
		return this.address;
	}
	
	setAddress(address) {
		this.address = address;
	}
	
	getWeb3ProviderUrl() {
		return this.web3providerurl;
	}
	
	setWeb3ProviderUrl(url) {
		this.web3providerurl = url;
	}
	
	getChainId() {
		return this.chainid;
	}

	setChainId(chainid) {
		this.chainid = chainid;
	}

	getNetworkId() {
		return this.networkid;
	}

	setNetworkId(networkid) {
		this.networkid = networkid;
	}
	
	getContractInstance() {
		if (this.contractinstance)
			return this.contractinstance;
		
		var session = this.session;
		var global = session.getGlobalObject();
		var ethnodemodule = global.getModuleObject('ethnode');
		
		var contractpath = this.getContractPath();

		this.contractinstance = ethnodemodule.getContractInstance(session, this.address, contractpath, this.web3providerurl);

		if (this.chainid)
		this.contractinstance.setChainId(this.chainid);
		
		if (this.networkid)
		this.contractinstance.setNetworkId(this.networkid);

		
		return this.contractinstance;
	}
	
	validateTransactionExecution(payingaccount, gas, gasPrice, callback) {
		var session = this.session;
		var ethnodemodule = this.ethnodemodule;

		// we check the account is unlocked
		if (ethnodemodule.isAccountLocked(session, payingaccount))
			throw 'account ' + payingaccount.getAddress() + ' is locked, unable to initiate transaction';
		
		return true;
	}
	
	validateTransferExecution(fromaccount, amount, callback) {
		var fromaddress = fromaccount.getAddress();
		
		// we check the account balance is sufficient
		return this.balanceOf(fromaddress, function(err, balance) {
			if (err) {
				if (callback)
					callback('error checking balance of ' + err, null);
			}
			else {
				if ((!balance) || (parseInt(amount.toString(),10) > parseInt(balance.toString(),10)))
					throw 'account ' + fromaddress + ' balance (' + balance + ') is too low to transfer '+ amount + ' token(s).';
				
				if (callback)
					callback(null, true);
				
				return true;
			}
		});
		
	}
	
	validateTransferFromExecution(fromaccount, toaddress, amount, callback) {
		var fromaddress = fromaccount.getAddress();
		
		// we check the account balance is sufficient
		return this.allowance(fromaddress, toaddress, function(err, allowance) {
			if (err) {
				if (callback)
					callback('error checking allowance of ' + err, null);
			}
			else {
				console.log('allowance of ' + toaddress + ' on ' + fromaddress + ' is ' + allowance);
				if (parseInt(amount.toString(),10) > parseInt(allowance.toString(),10))
					throw 'account ' + fromaddress + ' allowance (' + allowance + ') is too low to transfer '+ amount + ' token(s) to ' + toaddress + '.';
				
				if (callback)
					callback(null, true);
				
				return true;
			}
		});
		
	}
	
	validateBurnExecution(fromaccount, amount, callback) {
		var fromaddress = fromaccount.getAddress();
		
		// we check the account balance is sufficient
		return this.balanceOf(fromaddress, function(err, balance) {
			if (err) {
				if (callback)
					callback('error checking balance of ' + err, null);
			}
			else {
				if (parseInt(amount.toString(),10) > parseInt(balance.toString(),10))
					throw 'account ' + fromaddress + ' balance (' + balance + ') is too low to burn '+ amount + ' token(s).';
				
				if (callback)
					callback(null, true);
				
				return true;
			}
		});
		
	}
	
	validateBurnFromExecution(fromaccount, burnedaddress, amount, callback) {
		var fromaddress = fromaccount.getAddress();
		
		// we check the account balance is sufficient
		return this.allowance(burnedaddress, fromaddress, function(err, allowance) {
			if (err) {
				if (callback)
					callback('error checking allowance of ' + err, null);
			}
			else {
				console.log('allowance of ' + fromaddress + ' on ' + burnedaddress + ' is ' + allowance);
				if (parseInt(amount.toString(),10) > parseInt(allowance.toString(),10))
					throw 'account ' + fromaddress + ' allowance (' + allowance + ') is too low to burn '+ amount + ' token(s) from ' + burnedaddress + '.';
				
				if (callback)
					callback(null, true);
				
				return true;
			}
		});
		
	}
	
	// contract api
	activateContractInstance(callback) {
		return this.getContractInstance().activate(callback);
	}
	

	deploy(tokenName, tokenSymbol, decimals, initialSupply,
			payingaccount, gas, gasPrice, 
			transactionuuid, callback) {
		var self = this;
		var session = this.session;

		var fromaddress = payingaccount.getAddress();
		
		console.log('ERC20TokenContractInterface.deploy called for ' + tokenName + " from " + fromaddress + " with gas limit " + gas + " and gasPrice " + gasPrice + " and transactionuuid " + transactionuuid);
		
		
		// we validate the transaction
		if (!this.validateTransactionExecution(payingaccount, gas, gasPrice, callback))
			return;
		
		var contractinstance = this.getContractInstance();
		
		var contracttransaction = contractinstance.getContractTransactionObject(payingaccount, gas, gasPrice);
		
		var args = [];
		
		args.push(initialSupply);
		args.push(tokenName);
		args.push(tokenSymbol);
		args.push(decimals);
		
		contracttransaction.setArguments(args);
		
		contracttransaction.setContractTransactionUUID(transactionuuid);
		
		var promise = contractinstance.contract_new_send(contracttransaction, function(err, res) {
			console.log('ERC20TokenContractInterface.deploy callback called, result is: ' + res);
			
			if (callback)
				callback(null, res);
			
			return res;
		})
		.then(function(res) {
			console.log('ERC20TokenContractInterface.deploy promise of deployment resolved, result is: ' + res);
			
			self.setAddress(contractinstance.getAddress());
			
			return res;
		});
		
		return promise;
	}
	
	getName(callback) {
		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();
		var params = [];
		
		var promise = contractinstance.method_call("name", params, callback);
		
		return promise
	}
	
	getSymbol(callback) {
		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();
		var params = [];
		
		var promise = contractinstance.method_call("symbol", params, callback);
		
		return promise
	}
	
	getTotalSupply(callback) {
		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();
		var params = [];
		
		var promise = contractinstance.method_call("totalSupply", params, callback);
		
		return promise
	}
	
	getDecimals(callback) {
		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();
		var params = [];
		
		var promise = contractinstance.method_call("decimals", params, callback);
		
		return promise
	}
	
	balanceOf(address, callback) {
		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();
		var params = [];
		
		params.push(address);
		
		var promise = contractinstance.method_call("balanceOf", params, callback);
		
		return promise
	}
	
	allowance(alloweraddress, alloweeaddress, callback) {
		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();
		var params = [];
		
		params.push(alloweraddress);
		params.push(alloweeaddress);
		
		var promise = contractinstance.method_call("allowance", params, callback);
		
		return promise
	}
	
	// transactions
	getAddressFromTransactionUUID(transactionuuid, callback) {
		console.log('ERC20TokenContractInterface.getAddressFromTransactionUUID called for transactionuuid ' + transactionuuid);

		var self = this;
		var session = this.session;
		
		var contractinstance = this.getContractInstance();

		var promise = contractinstance.findAddressFromUUID(transactionuuid)
		.then(function(res) {
			
			if (callback)
				callback(( res ? null: 'error'), res);
				
			return res;
		});
		
		return promise;
		
	}

	async transferAsync(toaddress, amount, ethtx) {
		var fromaccount = ethtx.getFromAccount();
		var payingaccount = ethtx.getPayingAccount();

		payingaccount = (payingaccount ? payingaccount : fromaccount);

		// we validate the transaction
		var gas = ethtx.getGas();
		var gasPrice = ethtx.getGasPrice();

		if (!this.validateTransactionExecution(payingaccount, gas, gasPrice))
			return Promise.reject('transaction was not valid');
		
		var contractinstance = this.getContractInstance();

		var valid = await this.validateTransferExecution(payingaccount, amount);

		if (valid === false)
			return Promise.reject('transaction was not valid');

		// create contract transaction
		var gas = ethtx.getGas();
		var gasPrice = ethtx.getGasPrice();
		var transactionuuid = ethtx.getTransactionUUID();
		var value = ethtx.getValue();

		var contracttransaction = contractinstance.getContractTransactionObject(payingaccount, gas, gasPrice);
			
		contracttransaction.setContractTransactionUUID(transactionuuid);
		contracttransaction.setValue(value);

		// set call argument
		var args = [];
		
		args.push(toaddress);
		args.push(amount);
		
		contracttransaction.setArguments(args);
		
		contracttransaction.setMethodName('transfer');
		
		return contractinstance.method_send(contracttransaction);
	}
	
	transfer(toaddress, amount, 
			payingaccount, gas, gasPrice, 
			transactionuuid, callback) {
		var self = this;
		var session = this.session;
		
		var fromaddress = payingaccount.getAddress();
		
		console.log('ERC20TokenContractInterface.transfer called from ' + fromaddress + ' to ' + toaddress + ' amount ' + amount + ' with gas limit ' + gas + ' and gasPrice ' + gasPrice + ' with transactionuuid ' + transactionuuid);

		// we validate the transaction
		if (!this.validateTransactionExecution(payingaccount, gas, gasPrice, callback))
			return;
		
		var contractinstance = this.getContractInstance();

		// we validate the transfer first
		var promise = this.validateTransferExecution(payingaccount, amount, function(err, res) {
			if (res === true) {
				return res;
			}
			else {
				console.log('could not validate transfer: ' + err);
			}
		})
		.then(function(res) {
			// then call the transfer transaction
			var contracttransaction = contractinstance.getContractTransactionObject(payingaccount, gas, gasPrice);
			
			var args = [];
			
			args.push(toaddress);
			args.push(amount);
			
			contracttransaction.setArguments(args);
			
			contracttransaction.setContractTransactionUUID(transactionuuid);

			contracttransaction.setMethodName('transfer');
			
			return contractinstance.method_send(contracttransaction, callback);
		})
		.then(function(res) {
			console.log('ERC20TokenContractInterface.transfer promise resolved, result is ' + res);
			
			return res;
		});
		
		
		return promise;
	}
	
	async transferFromAsync(fromaddress, toaddress, amount, ethtx) {
		var fromaccount = ethtx.getFromAccount();
		var payingaccount = ethtx.getPayingAccount();

		payingaccount = (payingaccount ? payingaccount : fromaccount);

		// we validate the transaction
		var gas = ethtx.getGas();
		var gasPrice = ethtx.getGasPrice();

		if (!this.validateTransactionExecution(payingaccount, gas, gasPrice, callback))
			return Promise.reject('transaction was not valid');
		
		var contractinstance = this.getContractInstance();

		var valid = await this.validateTransferExecution(payingaccount, amount);

		if (valid === false)
			return Promise.reject('transaction was not valid');

		// create contract transaction
		var gas = ethtx.getGas();
		var gasPrice = ethtx.getGasPrice();
		var transactionuuid = ethtx.getTransactionUUID();
		var value = ethtx.getValue();

		var contracttransaction = contractinstance.getContractTransactionObject(payingaccount, gas, gasPrice);
			
		contracttransaction.setContractTransactionUUID(transactionuuid);
		contracttransaction.setValue(value);

		// set call argument
		var args = [];
		
		args.push(fromaddress);
		args.push(toaddress);
		args.push(amount);
		
		contracttransaction.setArguments(args);
		
		contracttransaction.setMethodName('transferFrom');
		
		return contractinstance.method_send(contracttransaction);
	}

	transferFrom(fromaccount, toaddress, amount, 
			payingaccount, gas, gasPrice, 
			transactionuuid, callback) {
		var self = this;
		var session = this.session;
		
		var fromaddress = fromaccount.getAddress();
		var payingaddress = payingaccount.getAddress();
		
		console.log('ERC20TokenContractInterface.transferFrom called from ' + fromaddress + ' to ' + toaddress + ' amount ' + amount + ' with gas limit ' + gas + ' and gasPrice ' + gasPrice + ' with transactionuuid ' + transactionuuid);

		// we validate the transaction
		if (!this.validateTransactionExecution(payingaccount, gas, gasPrice, callback))
			return;
		
		var contractinstance = this.getContractInstance();
		
		// we validate the transfer first
		var promise = this.validateTransferFromExecution(fromaccount, toaddress, amount, function(err, res) {
			if (res === true) {
				return res;
			}
			else {
				console.log('could not validate transfer: ' + err);
			}
		})
		.then(function(res) {
			// then call the transfer transaction
			var contracttransaction = contractinstance.getContractTransactionObject(payingaccount, gas, gasPrice);
			
			var args = [];
			
			args.push(fromaddress);
			args.push(toaddress);
			args.push(amount);
			
			contracttransaction.setArguments(args);
			
			contracttransaction.setContractTransactionUUID(transactionuuid);

			contracttransaction.setMethodName('transferFrom');
			
			return contractinstance.method_send(contracttransaction, callback);
		})
		.then(function(res) {
			console.log('ERC20TokenContractInterface.transferFrom promise resolved, result is ' + res);
			
			return res;
		});
		
		return promise;
	}
	
	approve(alloweeaddress, amount, 
			payingaccount, gas, gasPrice, 
			transactionuuid, callback) {
		var self = this;
		var session = this.session;
		
		var alloweraddress = payingaccount.getAddress();
		
		console.log('ERC20TokenContractInterface.approve called from ' + alloweraddress + ' spender ' + alloweeaddress + ' amount ' + amount + ' with gas limit ' + gas + ' and gasPrice ' + gasPrice + ' with transactionuuid ' + transactionuuid);

		// we validate the transaction
		if (!this.validateTransactionExecution(payingaccount, gas, gasPrice, callback))
			return;
		
		var contractinstance = this.getContractInstance();

		/*var params = [];
		
		params.push(alloweeaddress);
		params.push(amount);
		
		var value = null;
		var txdata = null;
		var nonce = null;
		
		var promise = contractinstance.method_sendTransaction('approve', params, payingaccount, value, gas, gasPrice, txdata, nonce, callback)*/

		var contracttransaction = contractinstance.getContractTransactionObject(payingaccount, gas, gasPrice);
		
		var args = [];
		
		args.push(alloweeaddress);
		args.push(amount);
		
		contracttransaction.setArguments(args);
		
		contracttransaction.setContractTransactionUUID(transactionuuid);

		contracttransaction.setMethodName('approve');
		
		var promise = contractinstance.method_send(contracttransaction, callback)
		
		.then(function(res) {
			console.log('ERC20TokenContractInterface.approve promise resolved, result is ' + res);
			
			return res;
		});
		
		return promise;
	}
	
	approveAndCall(alloweeaddress, amount, extraData,
			payingaccount, gas, gasPrice, 
			transactionuuid, callback) {
		var self = this;
		var session = this.session;
		
		var alloweraddress = payingaccount.getAddress();
		
		console.log('ERC20TokenContractInterface.approveAndCall called from ' + alloweraddress + ' spender ' + alloweraddress + ' amount ' + amount + ' with gas limit ' + gas + ' and gasPrice ' + gasPrice + ' with transactionuuid ' + transactionuuid);

		// we validate the transaction
		if (!this.validateTransactionExecution(payingaccount, gas, gasPrice, callback))
			return;
		
		var contractinstance = this.getContractInstance();

		/*var params = [];
		
		params.push(alloweeaddress);
		params.push(amount);
		params.push(extraData);
		
		var value = null;
		var txdata = null;
		var nonce = null;
		
		var promise = contractinstance.method_sendTransaction('approveAndCall', params, payingaccount, value, gas, gasPrice, txdata, nonce, callback)*/

		var contracttransaction = contractinstance.getContractTransactionObject(payingaccount, gas, gasPrice);
		
		var args = [];
		
		args.push(alloweeaddress);
		args.push(amount);
		args.push(extraData);
		
		contracttransaction.setArguments(args);
		
		contracttransaction.setContractTransactionUUID(transactionuuid);

		contracttransaction.setMethodName('approveAndCall');
		
		var promise = contractinstance.method_send(contracttransaction, callback)
		
		.then(function(res) {
			console.log('ERC20TokenContractInterface.approveAndCall promise resolved, result is ' + res);
			
			return res;
		});
		
		return promise;
	}
	
	burn(amount, 
			payingaccount, gas, gasPrice, 
			transactionuuid, callback) {
		var self = this;
		var session = this.session;
		
		var fromaddress = payingaccount.getAddress();
		var burnedaddress = payingaccount.getAddress();
		
		console.log('ERC20TokenContractInterface.burn called from ' + fromaddress + ' amount ' + amount + ' with gas limit ' + gas + ' and gasPrice ' + gasPrice + ' with transactionuuid ' + transactionuuid);

		// we validate the transaction
		if (!this.validateTransactionExecution(payingaccount, gas, gasPrice, callback))
			return;
		
		var contractinstance = this.getContractInstance();
		
		var promise = this.validateBurnExecution(payingaccount, amount, function(err, res) {
			if (res === true) {
				return res;
			}
			else {
				console.log('could not validate transfer: ' + err);
			}
		})
		.then(function(res) {
			// then call the burn transaction
			/*var params = [];
			
			params.push(amount);
			
			var value = null;
			var txdata = null;
			var nonce = null;
			
			return contractinstance.method_sendTransaction('burn', params, payingaccount, value, gas, gasPrice, txdata, nonce, callback);*/


			var contracttransaction = contractinstance.getContractTransactionObject(payingaccount, gas, gasPrice);
			
			var args = [];
			
			args.push(amount);
			
			contracttransaction.setArguments(args);
			
			contracttransaction.setContractTransactionUUID(transactionuuid);

			contracttransaction.setMethodName('burn');
			
			return contractinstance.method_send(contracttransaction, callback);
		})
		.then(function(res) {
			console.log('ERC20TokenContractInterface.burn promise resolved, result is ' + res);
			
			return res;
		});
		
		return promise;
	}
	

	burnFrom(burnedaddress, amount, 
			payingaccount, gas, gasPrice, 
			transactionuuid, callback) {
		var self = this;
		var session = this.session;
		
		var payingaddress = payingaccount.getAddress();
		
		console.log('ERC20TokenContractInterface.burnFrom called from ' + payingaddress + ' on ' + burnedaddress + ' amount ' + amount + ' with gas limit ' + gas + ' and gasPrice ' + gasPrice + ' with transactionuuid ' + transactionuuid);

		// we validate the transaction
		if (!this.validateTransactionExecution(payingaccount, gas, gasPrice, callback))
			return;
		
		var contractinstance = this.getContractInstance();

		var promise = this.validateBurnFromExecution(payingaccount, burnedaddress, amount, function(err, res) {
			if (res === true) {
				return res;
			}
			else {
				console.log('could not validate transfer: ' + err);
			}
		})
		.then(function(res) {
			// then call the burn transaction
			/*var params = [];
			
			params.push(burnedaddress);
			params.push(amount);
			
			var value = null;
			var txdata = null;
			var nonce = null;
			
			return contractinstance.method_sendTransaction('burnFrom', params, payingaccount, value, gas, gasPrice, txdata, nonce, callback);*/

			var contracttransaction = contractinstance.getContractTransactionObject(payingaccount, gas, gasPrice);
			
			var args = [];
			
			args.push(burnedaddress);
			args.push(amount);
			
			contracttransaction.setArguments(args);
			
			contracttransaction.setContractTransactionUUID(transactionuuid);

			contracttransaction.setMethodName('burnFrom');
			
			return contractinstance.method_send(contracttransaction, callback);
		})
		.then(function(res) {
			console.log('ERC20TokenContractInterface.burnFrom promise resolved, result is ' + res);
			
			return res;
		});
		
		return promise;
	}
	
	
}

if ( typeof GlobalClass !== 'undefined' && GlobalClass )
	GlobalClass.registerModuleClass('erc20', 'ERC20TokenContractInterface', ERC20TokenContractInterface);
else if (typeof window !== 'undefined') {
	let _GlobalClass = ( window && window.simplestore && window.simplestore.Global ? window.simplestore.Global : null);
	
	_GlobalClass.registerModuleClass('erc20', 'ERC20TokenContractInterface', ERC20TokenContractInterface);
}
else if (typeof global !== 'undefined') {
	// we are in node js
	let _GlobalClass = ( global && global.simplestore && global.simplestore.Global ? global.simplestore.Global : null);
	
	_GlobalClass.registerModuleClass('erc20', 'ERC20TokenContractInterface', ERC20TokenContractInterface);
}