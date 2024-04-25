const url = window.location.hostname.includes('localhost')
	? 'http://localhost:8080/api/auth/'
	: 'http://localhost:8080/api/auth/';

let usuario = null;
let socket = null;

//Referencias HTMl
const txtUid = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir = document.querySelector('#btnSalir');
const btnEnviar = document.querySelector('#btnEnviar');

//Validar el token del localstorage
const validarJWT = async () => {
	const token = localStorage.getItem('token') || '';

	if (token.length <= 10) {
		window.location = 'index.html';
		throw new Error('No hay token en el servidor');
	}

	const resp = await fetch(url, {
		headers: { 'x-token': token },
	});

	const { usuario: userDB, token: tokenDB } = await resp.json();
	localStorage.setItem('token', tokenDB);
	usuario = userDB;
	document.title = usuario.nombre;

	await conectarSocket();
};

const conectarSocket = async () => {
	socket = io({
		extraHeaders: {
			'x-token': localStorage.getItem('token'),
		},
	});

	socket.on('connect', () => {
		console.log('Sockets online');
	});
	socket.on('disconnect', () => {
		console.log('Sockets offline');
	});

	// socket.on('recibir-mensajes', dibujarMensajes);

	socket.on('usuarios-activos', dibujarUsuarios);

	socket.on('mensaje-privado', dibujarMensajePrivado);

	socket.on('nuevo-mensaje-general', dibujarNuevoMensaje);
};

const dibujarNuevoMensaje = ({ nombre, mensaje }) => {
	const nuevoMensajeHtml = `
	<li>
		<p>
			<span class='text-primary'> ${nombre}: </span>
			<span> ${mensaje}</span>
		</p>
	</li>`;
	ulMensajes.insertAdjacentHTML('beforeend', nuevoMensajeHtml);
};

const dibujarUsuarios = (usuarios = []) => {
	let userHtml = '';
	usuarios.forEach(({ nombre, uid }) => {
		userHtml += `
		<li>
			<p>
				<h5 class='text-success'> ${nombre}</h5>
				<span class='fs-6 text-muted'> ${uid}</span>
			</p>
		</li>`;
	});
	ulUsuarios.innerHTML = userHtml;
};

const dibujarMensajePrivado = ({ de, mensaje }) => {
	let nuevoMensajeHtml = '';
	nuevoMensajeHtml = `
		<li>
			<p>
				<span class='text-primary'> Privado de ${de}: </span>
				<span> ${mensaje}</span>
			</p>
		</li>`;

	ulMensajes.insertAdjacentHTML('beforeend', nuevoMensajeHtml);
};

// const dibujarMensajes = (mensajes = []) => {
// 	let mensajesHtml = '';
// 	mensajes.forEach(({ nombre, mensaje }) => {
// 		mensajesHtml += `
// 		<li>
// 			<p>
// 				<span class='text-primary'> ${nombre}: </span>
// 				<span> ${mensaje}</span>
// 			</p>
// 		</li>`;
// 	});
// 	ulMensajes.insertAdjacentHTML('beforeend', mensajesHtml);
// };

btnEnviar.addEventListener('click', () => {
	const mensaje = txtMensaje.value;
	const uid = txtUid.value;

	if (mensaje.length === 0) {
		return;
	}

	socket.emit('enviar-mensaje', { mensaje, uid });
	txtMensaje.value = '';
});

btnSalir.addEventListener('click', () => {
	window.location = 'index.html';
});

txtMensaje.addEventListener('keyup', ({ keyCode }) => {
	const mensaje = txtMensaje.value;
	const uid = txtUid.value;
	if (keyCode !== 13) {
		return;
	}

	if (mensaje.length === 0) {
		return;
	}

	socket.emit('enviar-mensaje', { mensaje, uid });

	txtMensaje.value = '';
});

const main = async () => {
	await validarJWT();
};

main();
