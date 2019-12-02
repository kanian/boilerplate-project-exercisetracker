/** Install & Set up mongoose */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

require('dotenv').config()
const mongo_uri = process.env.MONGO_URI
mongoose.connect(mongo_uri)

/** Create a 'Person' Model */

const PersonSchema = new Schema({
  username: String
})
const Person = mongoose.model('Person', PersonSchema)

/** Create an 'Exercise' Model */

const ExerciseSchema = new Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date
})
const Exercise = mongoose.model('Exercise', ExerciseSchema)

/** Create and Save a Person */

const createAndSavePerson = async function(_username) {
  const result = await findPersonByUsername(_username)
  // If err
  if (result instanceof Error) {
    return result
  }
  // If already created, return old created
  if (result) {
    return new Error('username already taken')
  }

  const person = new Person({
    username: _username
  })
  const { id, username } = await person.save()
  console.log({ id, username })
  return { _id: id, username }
}

/** Create and Save a Person */

const createAndSaveExercise = async function(
  userId,
  description,
  duration,
  date
) {
  const userFound = await findPersonById(userId)
  if (!userFound) {
    throw new Error(`User does not exist`)
  }

  const found = await findExercise(
    userFound.username,
    description,
    duration,
    date
  )
  // If err
  if (found instanceof Error) {
    throw found
  }
  // If already created, return old created
  if (found) {
    throw new Error('exercise already created')
  }

  // In case date is undefined
  if (typeof date === 'undefined') {
    date = new Date()
  } else {
    date = new Date(date)
  }

  const exercise = new Exercise({
    username: userFound.username,
    description,
    duration,
    date
  })
  const saved = await exercise.save()
  return saved
}

/** List People */
const listUsers = async function() {
  return await Person.find().select('username _id')
}
/** Find Person by id */
const findPersonById = async function(id) {
  return await Person.findById(id)
}
/** Find a Person by username */
const findPersonByUsername = async function(username) {
  return await Person.findOne({ username })
}
/** List User Exercises */
const listUserExercises = async function(userId, _from, _to, _limit) {
  const person = await findPersonById(userId)
  if (!person) {
    throw new Error(`User does not exist`)
  }
  const result = await to(
    from(
      limit(Exercise.find({ username: person.username }), parseInt(_limit)),
      _from
    ),
    _to
  ).select('username description duration date')
  return result
}

const limit = function(query, limit) {
  if (limit === undefined) {
    return query
  }
  return query.limit(limit)
}

const from = function(query, date) {
  if (from === undefined) {
    return query
  }
  return query.where('date').gte(new Date(date))
}

const to = function(query, date) {
  if (from === undefined) {
    return query
  }
  return query.where('date').lte(new Date(date))
}

/** Find an Exercise by username, description, duration, date */
const findExercise = async function(username, description, duration, date) {
  return await Exercise.findOne({
    username,
    description,
    duration,
    date
  }).select('username description duration date -_id')
}
exports.createAndSaveExercise = createAndSaveExercise
exports.createAndSavePerson = createAndSavePerson
exports.findExercise = findExercise
exports.findPersonByUsername = findPersonByUsername
exports.listUsers = listUsers
exports.listUserExercises = listUserExercises
