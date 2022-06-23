const express = require('express')
const app = express()

app.use(express.json())

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
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

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    person ?
        response.json(person) :
        response.status(404).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    let error = null

    if (!body.name) error = 'name missing'
    if (!body.number) error = 'number missing'
    if (!body.number && !body.name) error = 'name and number missing'
    if (persons.find(person => person.name === body.name)) error = 'name must be unique'

    if (error) response.status(400).json({error})

    const person = {
        id: Math.floor(Math.random() * 1000000),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(persone => persone.id !== id)

    response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))