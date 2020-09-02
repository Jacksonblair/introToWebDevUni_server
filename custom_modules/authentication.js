var jwt = require('jsonwebtoken')
const secret = 'secret';

exports.signJWT = (id) => {
	return jwt.sign({ 
		id: id,
		exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry
	}, secret);
}

exports.addJWTToCookie = (res, token) => {
	res.cookie('token', token, {
		httpOnly: true
	})
}