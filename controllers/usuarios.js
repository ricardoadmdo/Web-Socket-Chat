const { response, request } = require('express');
const bcryptjs = require('bcryptjs');
const Usuario = require('../models/usuario');

const usuariosGet = async (req = request, res = response) => {
	const { limite = 5, desde = 0 } = req.query;
	const query = { estado: true };

	//PROMISE.ALL ES PARA METER EN UN ARREGLO LAS PROMESAS Y QUE SE EJECUTEN SIMULTÁNEAMENTE Y TODO SEA MÁS RÁPIDO
	//Y SE PUEDE DESESTRUCTURAR EL ARREGLO QUE DEVUELVE PARA CAPTURAR LAS 2 RESPUESTAS POR SEPARADO.
	const [total, usuarios] = await Promise.all([
		Usuario.countDocuments(query),
		Usuario.find(query).skip(Number(desde)).limit(Number(limite)),
	]);

	res.json({
		total,
		usuarios,
	});
};

const usuariosPut = async (req, res) => {
	const { id } = req.params;
	const { _id, password, google, correo, ...resto } = req.body;

	if (password) {
		//Encriptar el password
		const salt = bcryptjs.genSaltSync();
		resto.password = bcryptjs.hashSync(password, salt);
	}
	const usuario = await Usuario.findByIdAndUpdate(id, resto);

	res.json(usuario);
};

const usuariosPost = async (req, res) => {
	const { nombre, correo, password, rol } = req.body;
	const usuario = new Usuario({ nombre, correo, password, rol });

	//Encriptar el password
	const salt = bcryptjs.genSaltSync();
	usuario.password = bcryptjs.hashSync(password, salt);

	//Guardar en BD
	await usuario.save();

	res.json({
		usuario,
	});
};

const usuariosDelete = async (req, res) => {
	const { id } = req.params;

	//Borrar Físicamente, no es recomendado hacer.
	// const usuario = await Usuario.findByIdAndDelete(id);

	const usuario = await Usuario.findByIdAndUpdate(id, { estado: false });

	res.json({ msg: 'Usuario eliminado: ', usuario });
};

module.exports = {
	usuariosGet,
	usuariosPut,
	usuariosPost,
	usuariosDelete,
};
