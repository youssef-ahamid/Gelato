const mongoose = require('mongoose');
const Schema = mongoose.Schema;

class db {
	constructor(databaseURI) {
		mongoose.connect(databaseURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		this.connection = mongoose.connection;
		
		// Bind connection to error event (to get notification of connection errors)
		this.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
	};

	createMongooseSchema(name, schema) {
		const obj = new Schema(schema);
		return mongoose.model(name, obj);
	}
}

module.exports = db;