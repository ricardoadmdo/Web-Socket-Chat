const express = require('express');
const cors = require('cors');
const { dbConnection } = require('../database/config');
const { socketController } = require('../sockets/controller');

class Server {
	constructor() {
		this.app = express();
		this.port = process.env.PORT;
		this.server = require('http').createServer(this.app);
		this.io = require('socket.io')(this.server);

		this.paths = {
			auth: '/api/auth',
			usuarios: '/api/usuarios',
		};

		//Conectar a la base de datos
		this.conectarDB();

		//Middlewares
		this.middlewares();

		//Rutas de mi APP
		this.routes();

		//Sockets
		this.sockets();
	}

	async conectarDB() {
		await dbConnection();
	}

	middlewares() {
		//CORS
		this.app.use(cors());

		//Lectura y parseo del body json
		this.app.use(express.json());

		//Directorio Publico
		this.app.use(express.static('public'));
	}

	routes() {
		this.app.use(this.paths.auth, require('../routes/auth'));
		this.app.use(this.paths.usuarios, require('../routes/usuarios'));
	}

	sockets() {
		this.io.on('connection', socket => socketController(socket, this.io));
	}

	listen() {
		this.server.listen(this.port, () => {
			console.log(`Backend corriendo en el puerto:`, this.port);
		});
	}
}

module.exports = Server;
