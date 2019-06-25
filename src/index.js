const express = require('express')

const server = express()

server.use(express.json())

const projects = []
var numberOfRequests = 0;

//Middlewares
//Global Middlerware that count the number of requests did on the server.
server.use((req, res, next) => {
  numberOfRequests++

  console.log(`Number of requests: ${numberOfRequests}`)

  return next()
})

//Middleware that verify if the format of the project object is right.
function verifyProjectData(req, res, next) {
  const { title, tasks } = req.body

  const isInvalidPost = !title || !tasks

  if (isInvalidPost) {
    return res.status(400).json({ message: 'Body params title and tasks are required.' })
  }

  req.title = title
  req.tasks = tasks
  req.id = projects.length + 1

  return next()
}

//Middleware that verify if title is in body params.
function verifyIfTitleIsInBodyParams(req, res, next) {
  const { title } = req.body

  if (!title) {
    return res.status(400).json({ message: 'Body param title is required to update the project.' })
  }

  req.title = title

  return next()
}

//Middleware thath verify if project exists in array.
function isProjectInArray(req, res, next) {
  const { id } = req.params

  const project = projects.find(project => project.id == id)

  if (!project) {
    res.status(404).json({ message: `The project with id ${id} was not found.` })
  }

  req.project = project

  return next()
}

//Server URL's
//Endpoint to create a new project.
server.post('/projects', verifyProjectData, (req, res) => {
  const { title, tasks, id } = req

  const newProject = {
    title,
    tasks,
    id
  }

  projects.push(newProject)

  return res.json(newProject)
})

//Endpoint to list all the projects.
server.get('/projects', (req, res) => {
  return res.json(projects)
})

//Endpoint to update a specific project.
server.put('/projects/:id', verifyIfTitleIsInBodyParams, isProjectInArray, (req, res) => {
  const { project, title } = req

  project.title = title
  return res.json(project)
})

//Endpoint to delete a specific project.
server.delete('/projects/:id', isProjectInArray, (req, res) => {
  const projectIndex = projects.indexOf(req.project)
  projects.splice(projectIndex, 1)

  return res.json(req.project)
})

//Endpoint to add new tasks to an specific project.
server.post('/projects/:id/tasks', verifyIfTitleIsInBodyParams, isProjectInArray, (req, res) => {
  const { project, title } = req
  project.tasks.push(title)

  return res.json(project)
})

server.listen(3001)
