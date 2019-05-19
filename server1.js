// 用户登录 返回一个唯一标识 cookie

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')

const app = express()

app.use(express.static(path.join(__dirname, './public')))
app.use(express.static(__dirname))

// req.body
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// req.cookies
app.use(cookieParser())

app.listen(3001)
