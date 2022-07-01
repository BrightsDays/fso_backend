require("dotenv").config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/persons')
const persons = require("./models/persons")

morgan.token('body', (request, response) => {
    return request.method === 'POST' ? JSON.stringify(request.body) : ' '
})

app.use(cors())
   .use(express.json())
   .use(express.static('build'))
   .use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(persons => response.json(persons))
})

app.get('/api/persons/:id', (request, response) => {
    Person
        .findById(request.params.id)
        .then(person => response.json(person))
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    let error = null

    if (!body.name) error = 'name missing'
    if (!body.number) error = 'number missing'
    if (!body.number && !body.name) error = 'name and number missing'
    // if (persons.find(person => person.name === body.name)) error = 'name must be unique'

    if (error) response.status(400).json({error})

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(persone => persone.id !== id)

    response.status(204).end()
})

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))