const jwt = require('jsonwebtoken')
const auth = require('../../custom_modules/authentication.js')

const secret = 'secret'


exports.checkJwt = (req, res, next) => {

	/* Checks if user has a valid token in cookies, and sets their id (req.userId) + a flag (req.hasToken) */

	if (req.cookies.token) {
		jwt.verify(req.cookies.token, secret, (err, decoded) => {
			if (err) {
				console.log('[middleware.checkJwt] Error: ', err.message);
				// NOTE: If token is expired.. How do i get the details to make a new token? 
				// - For now, just force user to log in again.
			} else {
				// user has token, refresh it.
				console.log('Refreshing token...');
				auth.addJWTToCookie(res, auth.signJWT(decoded.id))
				req.userId = decoded.id
				req.hasToken = true
			}
		})
	} else {
		req.hasToken = false
	}

	next();

}