const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const hbs = require('hbs')
const {generateMessage} = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3001
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
pathViews = path.join(__dirname,'../templates/views')

let count = 0
var addedUser = false;
users = {}
userdatabase = []
io.on('connection', (socket) => {
    console.log('New web-socket connection')

    socket.on('join', ({ username }) => {
        var user = new Object()
        user['username'] = username;
        userdatabase.push(user)
        socket.emit('message', generateMessage('Welcome!', 'Server'))
        addedUser = true;
        users[username] = socket;
        socket.username = username;
        io.emit('usersData', userdatabase)
        socket.broadcast.emit('message', generateMessage('has joined!', username))
    })

    // socket.on('sendMessage', (message) => {
    //     io.emit('message', message)
    // })

    socket.on('pvtMessage', (data, callback) => {
        if(users[data.to]){
            users[data.to].emit('pvtMessage', generateMessage(data.message, socket.username))
            callback()
        }
        else callback('User does not exist')
    })

    socket.on('uniMessage', (message, callback) => {
        io.emit('message', generateMessage(message, socket.username))
        callback()
    })

    socket.on('disconnect', () => {
        if(addedUser) {
            delete users[socket.username]
            userdatabase = userdatabase.filter(( user ) => {
                return user.username !== socket.username;
            });
        }
        io.emit('message', generateMessage('has left', socket.username))
        io.emit('usersData', userdatabase)
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})