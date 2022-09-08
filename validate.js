const Mongoose = require('mongoose');

module.exports.assertDataType = (dataType, value) => {
	switch (dataType) {
	case 'array':
		return Array.isArray(value);
	case 'string':
		return typeof value === 'string';
	case 'object':
		return typeof value === 'object';
	case 'boolean':
		return typeof value === 'boolean';
	case 'number':
		return typeof value === 'number';
	case 'ref':
		return Mongoose.isValidObjectId(value);
	default:
		console.error(`invalid data type ${dataType}.`);
		return true;
	}
};
