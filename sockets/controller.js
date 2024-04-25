const { Socket } = require('socket.io');
const { comprobarJWT } = require('../helpers/generar-jwt');
const ChatMensajes = require('../models/chat-mensajes');

const chatMensajes = new ChatMensajes();

const socketController = async (socket = new Socket(), io) => {
	const token = await comprobarJWT(socket.handshake.headers['x-token']);
	const usuario = token;

	if (!usuario) {
		return socket.disconnect();
	}
	//Agregar el usuario conectado
	chatMensajes.conectarUsuario(usuario);
	io.emit('usuarios-activos', chatMensajes.usuariosArr);
	socket.emit('recibir-mensajes', chatMensajes.ultimos10);

	//Conectarlo a una sala especial
	socket.join(usuario.id); //global, socket.id, usuario.id

	//Limpiar cuando alguien se desconecta
	socket.on('disconnect', () => {
		chatMensajes.desconectarUsuario(usuario.id);
		io.emit('usuarios-activos', chatMensajes.usuariosArr);
	});

	//Enviar mensaje
	socket.on('enviar-mensaje', ({ uid, mensaje }) => {
		if (uid) {
			//Mensaje Privado
			socket
				.to(uid)
				.emit('mensaje-privado', { de: usuario.nombre, mensaje });
		} else {
			//Mensaje General
			chatMensajes.enviarMensaje(usuario.id, usuario.nombre, mensaje);
			// io.emit('recibir-mensajes', chatMensajes.ultimos10);
			const nuevoMensaje = { nombre: usuario.nombre, mensaje };
			io.emit('nuevo-mensaje-general', nuevoMensaje);
		}
	});
};

module.exports = {
	socketController,
};
