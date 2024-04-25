const mongoose = require('mongoose');

const dbConnection = async () => {
	try {
		await mongoose.connect('mongodb://localhost/NodeCafeDB');
		console.log('Base de datos Online');
	} catch (error) {
		console.log(error);
		throw new Error('Error al iniciar la Base de Datos');
	}
};

module.exports = {
	dbConnection,
};
