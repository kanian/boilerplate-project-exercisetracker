const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const {
  createAndSaveExercise,
  createAndSavePerson,
  listUsers,
  listUserExercises
} = require('./app')

const cors = require('cors')

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.post('/api/exercise/new-user', async function(req, res) {
  const username = req.body.username
  try {
    const result = await createAndSavePerson(username)
    if (result instanceof Error) {
      res.json(result.message)
    }
    res.json(result)
  } catch (err) {
    res.json('Internal Server Error')
  }
})

app.get('/api/exercise/users', async function(req, res){
  try{
    const result = await listUsers()
    res.json(result)
  } catch(err){
    res.json('Internal Server Error')
  }
})

app.get('/api/exercise/log/:userId/:from/:to/:limit', async function(req, res) {
  const {userId, from, to, limit} = req.params
  try {
    const result = await listUserExercises(userId, from, to, limit)
    if (result instanceof Error) {
      res.json(result.message)
    }
    res.json(result)
  } catch (err) {
    res.json('Internal Server Error')
  }
})



// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: 'not found' })
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res
    .status(errCode)
    .type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
