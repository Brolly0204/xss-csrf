// 用户登录 返回一个唯一标识 cookie

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')
const svgCaptcha = require('svg-captcha')

const app = express()

app.use(express.static(path.join(__dirname, './public')))
app.use(express.static(__dirname))

// req.body
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// req.cookies
app.use(cookieParser())

let userList = [
  {
    username: 'ww',
    password: '123',
    money: 20000
  },
  {
    username: 'a',
    password: '1',
    money: 30000
  },
  {
    username: 'b',
    password: '1',
    money: 10000
  }
]

const SESSION_ID = 'connect.sid'
let session = {}

app.post('/api/login', function(req, res) {
  let { username, password } = req.body
  let user = userList.find(
    user => user.username === username && user.password === password
  )
  if (user) {
    let cardId = Math.random() + Date.now()
    session[cardId] = { user }
    res.cookie(SESSION_ID, cardId, { httpOnly: true })
    res.json({ code: 0 })
  } else {
    res.json({ code: 1, msg: '用户不存在' })
  }
})

app.get('/welcome', function(req, res) {
  res.send(`${encodeURIComponent(req.query.type) || 'hello Brolly'}`)
})

let comments = [
  {
    username: 'lwl',
    content: '中华文明应为亚洲文明和世界文明作出更大贡献'
  },
  {
    username: 'wl',
    content: '“为世界人民探寻发展之路提供途径”'
  }
]

app.get('/api/list', function(req, res) {
  res.json({ code: 0, comments })
})

app.post('/api/addcomment', function(req, res) {
  let cardId = req.cookies[SESSION_ID]
  let r = session[cardId]
  if (r) {
    // 已登录
    comments.push({
      username: r.user.username,
      content: req.body.content
    })
    res.json({ code: 0 })
  } else {
    // 未登录、
    res.json({ code: 1, msg: '用户未登录' })
  }
})

app.get('/api/userinfo', (req, res) => {
  let cardId = req.cookies[SESSION_ID]
  let r = session[cardId] || {}
  let { data, text } = svgCaptcha.create()
  r.text = text
  console.log('r', r)
  if (r.user) {
    res.json({
      code: 0,
      user: { username: r.user.username, money: r.user.money, svg: data }
    })
  } else {
    res.json({ code: 1, msg: '用户未登录' })
  }
})

app.post('/api/transfer', function(req, res) {
  let r = session[req.cookies[SESSION_ID]] || {}
  let user = r.user
  let referer = req.headers.referer
  if (referer.includes('http://localhost:3000')) {
    if (user) {
      let { target, money, code } = req.body
      console.log(code, r.text)
      if (code && code === r.text) {
        money = parseFloat(money) || 0
        userList.forEach(u => {
          if (u.username === user.username) {
            u.money -= money
          }
          if (u.username === target) {
            u.money += money
          }
        })
        res.json({ code: 0, msg: '转账成功' })
      } else {
        res.json({ code: 2, msg: '验证码不正确' })
      }
    } else {
      res.json({ code: 1 })
    }
  } else {
    res.json({ code: 3, msg: '来源不明' })
  }
})

app.listen(3000)
