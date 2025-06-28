import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io'
import cors from 'cors';

import Deferred from '../models/deferred.mjs';

const SOCKETPORT = 3000;
const RESTPORT = 4300;

class ServerManager{
  constructor(){
    this.restServer = express();
    const socketExpressApp = express();
    this.socketServer = http.createServer(socketExpressApp);
    this.router = express.Router();
    this.router.use(cors());
    this.router.use(express.json());
    this.restServer.use(this.router);

    this._deferred = new Deferred();
    this.read = this._deferred.promise;
  }

  connect(){
    this.registerGeneralRoutes();
    this.registerSocketRoutes();
    this.start();
  }

  start(){
    this.restServer.set('trust proxy', true);
    this.restServer.set('x-powered-by', false);
    this.restServer.listen(RESTPORT, () => {
      console.log(`> rest server start [port=${RESTPORT}]`);
    });

    this.socketServer.listen(SOCKETPORT, () => {
      console.log(`> socket server start [port=${SOCKETPORT}]`);
    })
  }

  registerGeneralRoutes(){
    this.router.get('/status', (req, res) => {
      res.status(200);
      res.send({
        msg: 'I\'m alive'
      });
    })
  }

  registerSocketRoutes(){
    const io = new Server(this.socketServer,{
      cors: {
        origin: '*',
        methods: [ 'GET', 'POST' ],
        credentials: true
      }
    });
    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      socket.on('join', (room) => {
        console.log('> room join', room);
        let clients = io.sockets.adapter.rooms.get(room) || new Set();
        if(clients.size < 2){
          socket.join(room);
          clients = io.sockets.adapter.rooms.get(room);
          if (clients.size === 2) {
            io.to(room).emit('ready');
          }
        } else{
          io.to(room).emit('room-full');
        }
        console.log('> room clients', clients);
      });

      socket.on('offer', (data) => {
        socket.to(data.room).emit('offer', data.offer);
      });

      socket.on('answer', (data) => {
        socket.to(data.room).emit('answer', data.answer);
      });

      socket.on('ice-candidate', (data) => {
        socket.to(data.room).emit('ice-candidate', data.candidate);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

  }
}

export default ServerManager;