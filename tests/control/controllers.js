'use strict';

var modulecontrollers;

var ModuleControllers = class {
	
	constructor() {
		this.module = null;
		
		this.ethereum_core = require('../../../ethereum_core').getObject();
		this.ethereum_erc20 = require('../../../ethereum_erc20').getObject();
		
		this.global = this.ethereum_erc20.getGlobalObject();

		this.session = null;
	}
	
	getCurrentSessionObject() {
		if (this.session)
			return this.session;
		
		this.session = this.createBlankSessionObject();
		
		return this.session;
	}
	
	createBlankSessionObject() {
		var global = this.global;
		var commonmodule = global.getModuleObject('common');

		this.session = commonmodule.createBlankSessionObject();
		
		return this.session;
	}

	
	getArtifact(artifactname) {
		return this.ethereum_core.getArtifact(artifactname);
	}
	
	//
	// Storage-access
	//
	getLocalJsonLeaf(session, keys, bForceRefresh, callback) {
		var localstorage = session.getLocalStorageObject();
		
		return localstorage.readLocalJson(keys, bForceRefresh, callback)
	}
	
	saveLocalJson(session, keys, json, callback) {
		var localstorage = session.getLocalStorageObject();
		
		localstorage.saveLocalJson(keys, json, callback)
	}
	
	//
	// Web 3 (ethnode)
	// 
	
	getNodeInfo(session, callback) {
		var global = this.global;
		
		var mobileconfigmodule = global.getModuleObject('mobileconfig');
		

		var ethnodemodule = global.getModuleObject('ethnode');

		var ethereumnodeaccess = ethnodemodule.getEthereumNodeAccessInstance(session);

		var nodeinfo = {};

		nodeinfo.islistening = global.t('loading');
		nodeinfo.networkid = global.t('loading');
		nodeinfo.peercount = global.t('loading');
		nodeinfo.issyncing = global.t('loading');
		nodeinfo.currentblock = global.t('loading');
		nodeinfo.highestblock = global.t('loading');

		var writenodeinfo = function(nodeinfo) {
			
			ethereumnodeaccess.web3_getNodeInfo(function(err, info) {
				console.log('returning from web3_getNodeInfo');
				
				if (info) {
					nodeinfo.islistening = info.islistening;
					nodeinfo.networkid = info.networkid;
					nodeinfo.peercount = info.peercount;
					nodeinfo.issyncing = info.issyncing;
					nodeinfo.currentblock = info.currentblock;
					nodeinfo.highestblock = info.highestblock;
				}
				else {
					nodeinfo.islistening = global.t('not available');
					nodeinfo.networkid = global.t('not available');
					nodeinfo.peercount = global.t('not available');
					nodeinfo.issyncing = global.t('not available');
					nodeinfo.currentblock = global.t('not available');
					nodeinfo.highestblock = global.t('not available');
				}

				console.log(JSON.stringify(nodeinfo));
				
				if (callback)
					callback(null, nodeinfo);
			});
		};

		writenodeinfo(nodeinfo);
	}
	
	_createAccount(session, address, privatekey) {
		var global = this.global;

		var commonmodule = global.getModuleObject('common');
		
		// create account with this address
		var account = commonmodule.createBlankAccountObject(session);
		
		if (privatekey)
			account.setPrivateKey(privatekey);
		else
			account.setAddress(address);
		
		return account;
	}
	
	getEthAddressBalance(session, address, callback) {
		var global = this.global;
		
		var commonmodule = global.getModuleObject('common');

		var account = this._createAccount(session, address);
		
		this.getEthAccountBalance(session, account, callback);
	}
	
	// using accounts
	getEthAccountFromUUID(session, accountuuid, callback) {
		var global = this.global;
		
		var commonmodule = global.getModuleObject('common');
		var commoncontrollers = commonmodule.getControllersObject();
		
		var account = commoncontrollers.getAccountObjectFromUUID(session, accountuuid);
		
		if (callback)
			callback(null, account);
	}
	
	getEthAccountBalance(session, account, callback) {
		var global = this.global;

		var ethnodemodule = global.getModuleObject('ethnode');
		var ethnodecontrollers = ethnodemodule.getControllersObject();

		ethnodemodule.getChainAccountBalance(session, account, function(err, res) {
			if (err) {
				if (callback)
					callback(err, null);
			}
			else {
				var etherbalance = (ethnodecontrollers ? ethnodecontrollers.getEtherStringFromWei(res) : null);
				if (callback)
					callback(err, etherbalance);
			}
		});
	}
	
	createFee(level) {
		var fee = {};
		
		fee.gaslimit = 4850000;
		fee.gasPrice = 10000000000;
		
		return fee;
	}
	
	createTransaction(session, fromaccount) {
		var global = this.global;
		
		var ethereumnodeaccessmodule = global.getModuleObject('ethereum-node-access');
	
		var ethereumtransaction =  ethereumnodeaccessmodule.getEthereumTransactionObject(session, fromaccount);
		
		return ethereumtransaction;
	}
	
	sendTransaction(session, transaction, callback) {
		var global = this.global;
		
		var ethnodemodule = global.getModuleObject('ethnode');
		
		var ethereumnodeaccessmodule = global.getModuleObject('ethereum-node-access');
		
		var EthereumNodeAccess = ethnodemodule.getEthereumNodeAccessInstance(session);
		
		
		return EthereumNodeAccess.web3_sendEthTransaction(transaction, callback);
	}
	
	getTransaction(session, txhash, callback) {
		var global = this.global;

		var ethereumnodeaccessmodule = global.getModuleObject('ethereum-node-access');

	    ethereumnodeaccessmodule.readEthereumTransactionObject(session, txhash, function(err, res) {
	    	console.log('callback from readEthereumTransactionObject');
	    	
	    	if (err) {
	    		if (callback)
	    			callback(err, null);
	    	}
	    	
	    })
	    .then(function(res) {
	    	console.log('readEthereumTransactionObject finished');
	    	
	    	if (res) {
	    		if (callback)
	    			callback(null, res);
	    	}
	    });
		
	}
	
	//
	// Web 3 (ethchainreader)
	//
	readCurrentBlockNumber(session, callback) {
		var global = this.global;
		
		var ethchainreadermodule = global.getModuleObject('ethchainreader');
		
		var chainreaderinterface = ethchainreadermodule.getChainReaderInterface(session);
		
		chainreaderinterface.getCurrentBlockNumber(callback);
	}
	
	readBlock(session, txhash, callback) {
		var global = this.global;
		
		var ethchainreadermodule = global.getModuleObject('ethchainreader');
		
		var chainreaderinterface = ethchainreadermodule.getChainReaderInterface(session);
		
		chainreaderinterface.getBlock(blocknumber, callback);
	}
	
	readTransaction(session, txhash, callback) {
		var global = this.global;
		
		var ethchainreadermodule = global.getModuleObject('ethchainreader');
		
		var chainreaderinterface = ethchainreadermodule.getChainReaderInterface(session);
		
		chainreaderinterface.getTransaction(txhash, callback);
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
					callback('could not retrieve erc20 token balance', );
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

	
	//
	// cryptokey
	// 
	generatePrivateKey(session) {
		var privkey = session.generatePrivateKey();		
		
		return privkey;
		
	}
	
	getPublicKeys(session, privatekey) {
		var account = this._createAccount(session, null, privatekey);
		
		var keys = {};
		
		keys['private_key'] = account.getPrivateKey();
		keys['public_key'] = account.getPublicKey();
		keys['address'] = account.getAddress();
		keys['rsa_public_key'] = account.getRsaPublicKey();
		
		return keys;
	}
	
	aesEncryptString(session, privatekey, plaintext) {
		var cryptokey = session.createBlankCryptoKeyObject();
		cryptokey.setPrivateKey(privatekey);

		return cryptokey.aesEncryptString(plaintext);
		
	}
	
	aesDecryptString(session, privatekey, cyphertext) {
		var cryptokey = session.createBlankCryptoKeyObject();
		cryptokey.setPrivateKey(privatekey);

		return cryptokey.aesDecryptString(cyphertext);
	}
	
	rsaEncryptString(senderaccount, recipientaccount, plaintext) {
		return senderaccount.rsaEncryptString(plaintext, recipientaccount)
	}
	
	rsaDecryptString(recipientaccount, senderaccount, cyphertext) {
		return recipientaccount.rsaDecryptString(cyphertext, senderaccount)
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