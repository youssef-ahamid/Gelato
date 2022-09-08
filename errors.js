module.exports.missingField = (name) => {
	return {
		error: {
			message: `Invalid Fields. ${name} is required.`,
			code: 400,
			error: {
				field: name,
				name: 'validation/missing-required-field',
				code: 1001,
			},
		},
	};
};

module.exports.invalidFieldType = (name, type) => {
	return {
		error: {
			message: `Invalid Fields. ${name} must be of type ${type}.`,
			code: 400,
			error: {
				field: name,
				name: 'validation/invalid-type',
				code: 1002,
			},
		},
	};
};

module.exports.notUnique = (name, val) => {
	return {
		error: {
			message: `Invalid Fields. ${name} must be unique.\n${name} with value ${val} already exists`,
			code: 400,
			error: {
				field: name,
				name: 'validation/multiple-unique',
				code: 1004,
			},
		},
	};
};

module.exports.invalidQuery = (name, type) => {
	return {
		error: {
			message: `Invalid query. ${name} must be of type ${type}.`,
			code: 400,
			error: {
				field: name,
				name: 'validation/invalid-query',
				code: 1003,
			},
		},
	};
};


module.exports.extraField = (name, model) => {
	return {
		error: {
			message: `Invalid Fields. ${name} does not exist on the ${model} model.`,
			code: 400,
			error: {
				field: name,
				name: 'validation/extra-field',
				code: 1005,
			},
		},
	};
};