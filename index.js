require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/persons')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('body', (request) => {
	return request.method === 'POST' ? JSON.stringify(request.body) : ' '
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

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

app.post('/api/persons', (request, response, next) => {
	const body = request.body

	const person = new Person({
		name: body.name,
		number: body.number
	})

	person
		.save()
		.then(savedPerson => response.json(savedPerson))
		.catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
	const { name, number } = request.body

	Person
		.findByIdAndUpdate(
			request.params.id,
			{ name, number },
			{ new: true, runValidators: true, context: 'query' }
		)
		.then(updatedPerson => response.json(updatedPerson))
		.catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
	Person
		.findByIdAndRemove(request.params.id)
		.then(() => response.status(204).end())
		.catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	}
	if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	}

	next(error)
}
app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))