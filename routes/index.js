const express = require('express');
const config = require('../config.json');

const router = express.Router();

if(config.private.enabled) {
	function unauthorized(res) {
		res.statusCode = 401;
		res.setHeader('WWW-Authenticate', 'Basic realm="Authorization Required"');
		res.render("errors/401");
	};

	router.use((req, res, next) => {
		let authorization = req.headers.authorization;
		if(!authorization) return unauthorized(res);
		let parts = authorization.split(' ');
		let scheme = parts[0];
		let credentials = new Buffer(parts[1], 'base64').toString();
		let index = credentials.indexOf(':');
		if ('Basic' != scheme || index < 0) return unauthorized(res);
		let user = credentials.slice(0, index);
		let pass = credentials.slice(index + 1);
		if(user != config.private.username || pass != config.private.password) return unauthorized(res);
		next();
	});
}

router.get('/', (req, res) => {
	res.status(200).render("index");
});

router.post('/', (req, res) => {
	if(!req.body.ip) {
		return res.status(200).render("index");
	}

	getIPFromInput(req.body.ip, (err, address, port) => {
		if(err) return res.render("index", {
			error: err.name
		});

		createProxy(address, port, (err, proxyport) => {
			if(err) return res.render("index", {
				error: "Could not find a free port. Please try again."
			});

			res.status(200).render("index", {
				proxy: {
					ip: config.ipaddress,
					port: proxyport
				}
			});
		});
	});
});

function getIPFromInput(input, cb) {
	const dns = require('dns');
	const isIp = require('is-ip');

	let address = input;
	let port = 9987;
	let customport = false;
	if(input.indexOf(":") > -1) {
		address = input.split(":")[0];
		port = input.split(":")[1];
		customport = true;
	}

	if(port < 1 || port > 65535) {
		return console.error("Port invalid.");
	}

	if(!isIp.v4(address)) {
		dns.resolveSrv("_ts3._udp." + address, (err, srvs) => {
			if(err) {
				dns.resolve4(address, (err, ips) => {
					if(err) {
						return cb(new Error("Invalid address."));
					}

					address = ips[0];
					return cb(null, address, port);
				});
			} else {
				dns.resolve4(srvs[0].name, (err, ips) => {
					if(err) {
						return cb(new Error("Invalid address."));
					}

					address = ips[0];
					port = customport ? port : srvs[0].port;
					return cb(null, address, port);
				});
			}
		});
	} else {
		return cb(null, address, port);
	}
}

function createProxy(address, port, cb, round) {
	if(!round) round = 1;
	if(round >= 5) return cb(new Error('Could not find a free port. Please try again.'));

	let tempproxyport = Math.floor(Math.random() * (config.ports.to - config.ports.from)) + config.ports.from;
	
	const udpproxy = require('udp-proxy');
	const server = udpproxy.createServer({
		address: address,
		port: port,
		localport: tempproxyport
	});

	server.on('proxyError', function (err) {
		createProxy(address, port, cb, ++round);
	});

	server.on('error', function (err) {
		createProxy(address, port, cb, ++round);
	});

	server.on('listening', function (err) {
		cb(null, tempproxyport);
	});
}

module.exports = router;
