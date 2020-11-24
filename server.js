const express = require('express')
const app = express()

app.use(express.static("public"))

const http = require('http').Server(app)
const serverSocket = require('socket.io')(http)

const porta = process.env.PORT || 8000

const host = process.env.HEROKU_APP_NAME ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : "http://localhost"

http.listen(porta, function(){
    const portaStr = porta === 80 ? '' :  ':' + porta

    if (process.env.HEROKU_APP_NAME) 
        console.log('Servidor iniciado. Abra o navegador em ' + host)
    else console.log('Servidor iniciado. Abra o navegador em ' + host + portaStr)
})

app.get('/', function (requisicao, resposta) {
    resposta.sendFile(__dirname + '/index.html')
})


serverSocket.on('connect', function(socket){

    socket.on('login', function (nickname) { // Informa que um usuario fez login
        socket.nickname = nickname
        const msg = nickname + ' conectou'
        console.log(msg)
        serverSocket.emit('chat msg', msg)
    })

    socket.on('disconnect', function(){ // Informa outros usuarios, que um cliente desconectou
        console.log('Cliente desconectado: ' + socket.nickname)
        serverSocket.emit('chat msg',  socket.nickname + ' saiu')
    })
        
    socket.on('chat msg', function(msg){ // Informa qual usuario enviou a msg e qual a msg 
        serverSocket.emit('chat msg', `${socket.nickname} diz: ${msg}`)
    })

    socket.on('status', function(msg){ // Mostra o status do usuario
        console.log(msg)
        socket.broadcast.emit('status', msg)
    })
})

