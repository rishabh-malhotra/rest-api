var express = require('express')
var app = express()
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
app.use('/', require('./routes/articledetails'))
app.use('/', require('./routes/userdetails'))
app.use('/', require('./routes/commentdetails'))
app.use('/', require('./routes/tagdetails'))
app.listen(4949, () => {
    console.log('Server started http://localhost:4949')
  })
