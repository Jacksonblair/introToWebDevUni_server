const bcrypt = require('bcrypt');

const verification = require('../../custom_modules/verification.js')
const auth = require('../../custom_modules/authentication.js')

const secret = 'secret'
const saltRounds = 10;


// fake id sequence arrays for 'database'
const user_id_seq = [0]
const post_id_seq = [0]

// Our 'database'
const db = {
	users: {
		rows: [
			/* { id: int, email: string, password: hash } */
		]	
	},
	posts: {
		rows: [
			/* { userId: int, id: int, content: string, author: string, title: string }*/
			{ userId: 1, id: 1, content: 'This is a post!', author: 'Jim', title: 'A post title', category: 0, day: 22, month: 4, year: 2020}
		]
	}
}

exports.register = (req, res) => {

	// Get username and password from req.body
	// Verify e-mail and password 
	// Store in database
	// Generate jsonwebtoken with details
	// Send token back in cookies as httpOnly
	// Client 'redirects' back to /home

	console.log(req.body)

	// variables to return to client
	let success = false
	let error = ''
	
	if (verification.verifyRegisterDetails) {
		console.log('Registration details are valid')

		// hash password
		let hashedPassword = bcrypt.hashSync(req.body.password, saltRounds)

		// check if user already in DB
		if (db.users.rows[0]) {
			db.users.rows.forEach((user) => {
				if (user.email == req.body.email) {
					error = "User already exists in database."
					console.log("User alread exists in database")
				}
			})			
		} else {
			console.log("Creating new user")
			success = true;
			/* Fake push user to database */
			// push new user id to user_id_seq, and use to store in user
			let idIndex = user_id_seq.push(user_id_seq[user_id_seq.length - 1] + 1) - 1
			// store in 'database', keep index (return val - 1)
			let userIndex = ( db.users.rows.push({ id: user_id_seq[idIndex], email: req.body.email, password: hashedPassword }) - 1 )
			// Create new JWT and add to cookies.
			auth.addJWTToCookie(res, auth.signJWT(db.users.rows[userIndex].id))			
		}
	} else {
		error = "Registration details not valid."
	}

	res.json({ success: success, error: error })
}

exports.login = async (req, res) => {

	if (!req.body.password || !req.body.email) { 
		return res.send({error: "an error"})
	}

	let user = {}
	let success = false
	let error = ''
	let notValidMessage = "Password/e-mail combination is not valid"
	let email = ''

	// try and find user in database
	if (db.users.rows[0]) {
		db.users.rows.forEach((_user) => {
			if (_user.email == req.body.email) {
				user = _user
			} else {
				console.log('Cannot find user matching those details.')
				error = notValidMessage
			}
		})
	} else {
		console.log("There are no users in database.")
		error = notValidMessage
	}
	
	// if user found
		// compare password with hashed password (stored in db)
		// if passwords match, sign JWT with user.id (stored in db)
		// slap JWT into httpOnly cookies
	if (user.email) {
		const match = await bcrypt.compare(req.body.password, user.password)
		if (match) {
			console.log("User authenticated.")
			auth.addJWTToCookie(res, auth.signJWT(user.id))
			email = user.email
			success = true;
	    } else {
	    	console.log("Password/e-mail combination is not valid.")
	    	error = notValidMessage
	    }
	}

	res.json({ success: success, error: error, email: email })
}

exports.home = (req, res) => {

	if (req.hasToken) {
		console.log('user has token')
		console.log('id:', req.userId)
		let user
		let posts = []

		// get user details from 'database'
		db.users.rows.forEach((_user) => {
			if (_user.id == req.userId) {
				user = _user
				user.password = null // remove password
			}
		})

		// get user board items from 'database' (if the user exists)
		if (user) {
			db.posts.rows.forEach((post) => {
				if (post.userId == user.id) {
					posts.push(post)
				}
			})			
		}

		res.json({
			email: user.email,
			posts: posts 
		})

	} else {
		console.log('user does not have token')
		res.json({ shouldLogin: true})		
	}

}