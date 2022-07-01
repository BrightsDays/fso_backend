require("dotenv").config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/persons')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('body', (request, response) => {
    return request.method === 'POST' ? JSON.stringify(request.body) : ' '
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id'})
    }

    next(error)
}
app.use(errorHandler)

app.get('/info', (request, response) => {
    Person
        .find({})
        .then(persons => {
            const info = {
                content: `Phonebook has info for ${persons.length} people`,
                date: new Date()
            }
        
            response.send(
                `<div>
                    <p>${info.content}</p>
                    <p>${info.date}</p>
                </div>`
            )
        })
})

app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(persons => response.json(persons))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person
        .findById(request.params.id)
        .then(person => {
            person
                ? response.json(person)
                : response.status(404).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    let error = null

    if (!body.name) error = 'name missing'
    if (!body.number) error = 'number missing'
    if (!body.number && !body.name) error = 'name and number missing'

    if (error) response.status(400).json({ error })

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person
        .save()
        .then(savedPerson => response.json(savedPerson))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person
        .findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => response.json(updatedPerson))
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person
        .findByIdAndRemove(request.params.id)
        .then(result => response.status(204).end())
        .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))