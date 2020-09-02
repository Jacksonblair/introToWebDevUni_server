const express = require('express')
const app = express()
const router = require('./api/routes/routes.js')
const fs = require('fs')
const http = require('http')
const cookieParser = require('cookie-parser')


// const { createRenderer } = require('vue-server-renderer')
// const renderer = createRenderer({ /* options */ })


app.use(express.json()) // for parsing appplication/json
app.use(cookieParser()) // for parsing cookies

app.use('/api', router)

app.use((req, res, next) => {
	console.log('Cookie handling middleware');
	next();
})

app.listen(process.env.PORT || '5000', () => {
	console.log(`Example app listening at http://localhost:${process.env.PORT || '5000'}`)
})

