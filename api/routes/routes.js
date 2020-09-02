const express = require('express')
const router = express.Router()

const mw = require('../middleware/middleware.js')
const controllers = require('../controllers/controllers.js')

router.post('/register', controllers.register)

router.post('/login', controllers.login)

router.get('/home', mw.checkJwt, controllers.login)

module.exports = router
