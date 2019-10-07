/**
 * 
 */
'use strict';

var Tests = class {
	
	static run() {
		var ERC20Controllers = require('./control/controllers.js');

		var erc20controllers = ERC20Controllers.getObject();

		var session = erc20controllers.getCurrentSessionObject();

		// web3 node info
		erc20controllers.getNodeInfo(session, function(err, nodeinfo)  {
			console.log('is listening: ' + nodeinfo.islistening);
		});

		// current block number
		erc20controllers.readCurrentBlockNumber(session, function(err, blocknumber)  {
			console.log('current block number is: ' + blocknumber);
		});

		// transaction

		// ethchainreader
		var txhash = '0xc23bbf67438f508c15fa423e6c53fbc9ae0d4418479a864558cd174f722117c3';

		erc20controllers.readTransaction(session, txhash, function(err, tx)  {
			console.log('transaction data is: ' + (tx ? tx.input_decoded_ascii : null));
			
			if (tx) {
				tx.getTransactionReceiptData(function(err, data)  {
					console.log('transaction receipt data');
				});
			}
		});

		// ethnode
		erc20controllers.getTransaction(session, txhash, function(err, tx)  {
			var data = (tx ? tx.getData() : null);
			console.log('transaction data is: ' + data);
		});	


		// web 3 account balance
		var address = '0xeF1cbd797Bf7D7aeC3fC53eA3905fe43e774c16c';

		erc20controllers.getEthAddressBalance(session, address, function(err, balance)  {
			console.log(address + ' balance is: ' + balance);
		});

		// erc20
		var providerurl = 'https://rinkeby-dapps-preprod3.primusfinance.fr/v3/6599b370003c485db18319242fbd1474';
		//var providerurl = 'https://rinkeby.infura.io/v3/6599b370003c485db18319242fbd1474';
		var tokenaddress = '0xa2e09e02cEcf2650539eD9f0f91d0F5975c6B9BA';
		var blanksession = erc20controllers.createBlankSessionObject();


		erc20controllers.getWalletERC20Position(blanksession, providerurl, tokenaddress, address,  function(err, balance)  {
			console.log(address + ' erc20 balance on Rinkeby is: ' + balance);
		});

		providerurl = 'https://ropsten.infura.io/v3/6599b370003c485db18319242fbd1474';
		tokenaddress = '0x56dB4c6Fd59366E28Ff4090e20BEE35c9D434755';
		blanksession = erc20controllers.createBlankSessionObject();

		erc20controllers.getWalletERC20Position(blanksession, providerurl, tokenaddress, address,  function(err, balance)  {
			console.log(address + ' erc20 balance on Ropsten is: ' + balance);
		});


		// generate private key
		var senderprivatekey = erc20controllers.generatePrivateKey(session);
		var senderpublickeys = erc20controllers.getPublicKeys(session, senderprivatekey)

		console.log('generated private key for sender: ' + senderprivatekey);

		var recipientprivatekey = erc20controllers.generatePrivateKey(session);
		var recipientpublickeys = erc20controllers.getPublicKeys(session, recipientprivatekey)

		console.log('generated private key for recipient: ' + recipientprivatekey);

		// symmetric encryption

		// aes encrypt text
		var plaintext = 'the fox jumps over the lazy dog';
		var cyphertext;

		cyphertext = erc20controllers.aesEncryptString(session, senderprivatekey, plaintext);

		// aes decrypt text
		var resulttext = erc20controllers.aesDecryptString(session, senderprivatekey, cyphertext);

		if (resulttext == plaintext)
			console.log('aes decrypted cyphertext matches plaintext');
		else
			console.log('aes decrypted cyphertext DOES NOT match plaintext');

		// asymmetric encryption

		// rsa encrypt text
		var senderaccount;
		var recipientaccount;

		senderaccount = session.createBlankAccountObject();
		recipientaccount = session.createBlankAccountObject();

		senderaccount.setPrivateKey(senderprivatekey);
		recipientaccount.setRsaPublicKey(recipientpublickeys['rsa_public_key']);

		cyphertext = erc20controllers.rsaEncryptString(senderaccount, recipientaccount, plaintext);

		// rsa decrypt text
		senderaccount = session.createBlankAccountObject();
		recipientaccount = session.createBlankAccountObject();

		senderaccount.setRsaPublicKey(senderpublickeys['rsa_public_key']);
		recipientaccount.setPrivateKey(recipientprivatekey);

		resulttext = erc20controllers.rsaDecryptString(recipientaccount, senderaccount, cyphertext);

		if (resulttext == plaintext)
			console.log('rsa decrypted cyphertext matches plaintext');
		else
			console.log('rsa decrypted cyphertext DOES NOT match plaintext');

		// storage
		var keys = ['mobile', 'data'];
		var input = {hello: 'world'};
		var value;

		erc20controllers.saveLocalJson(session, keys, input, function(err, res) {
			console.log('MobileLoad.saveLocalJson returned')
		});

		value = erc20controllers.getLocalJsonLeaf(session, keys, false, function(err, res) {
			console.log('MobileLoad.getLocalJsonLeaf callback without refresh returned: ' + JSON.stringify(res));
		});

		console.log('MobileLoad.getLocalJsonLeaf without refresh returned: ' + JSON.stringify(value));

		value = erc20controllers.getLocalJsonLeaf(session, keys, true, function(err, res) {
			console.log('MobileLoad.getLocalJsonLeaf callback with refresh returned: ' + JSON.stringify(res));
		});

		console.log('MobileLoad.getLocalJsonLeaf with refresh returned: ' + JSON.stringify(value));


		// transaction with data
		/*var fromaccount = session.createBlankAccountObject();;
		var fromprivatekey = '';

		var data = JSON.stringify({text: 'the fox jumps over the lazy dog'});

		fromaccount.setPrivateKey(fromprivatekey);

		var transaction = erc20controllers.createTransaction(session, fromaccount);

		var fee = erc20controllers.createFee();

		transaction.setToAddress(address);
		transaction.setValue(0);
		transaction.setGas(fee.gaslimit);
		transaction.setGasPrice(fee.gasPrice);

		transaction.setData(data);

		erc20controllers.sendTransaction(session, transaction, function(err, res) {
			if (err)
				console.log('error in sendTransaction: ' + err);
			else
				console.log('sendTransaction returned: ' + res);
		});*/

		
	}
	
}

module.exports = Tests;

