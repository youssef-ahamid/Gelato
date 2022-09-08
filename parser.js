const getPath = (paths, prefix, suffix) => {
	return [prefix, paths[0], suffix].filter((p) => !!p).join('.');
};

function populate(paths, prefix, suffix) {
	if (paths.length === 1) return getPath(paths, prefix, suffix);

	let path = {};
	path.path = getPath(paths, prefix, suffix);
	paths.splice(0, 1);
	path.populate = populate(paths);
	return path;
}

module.exports.getPopulationPath = (path, prefix = '', suffix = '') => {
	const populations = [];
	let paths = path.split('+');
	for (let i = 0; i < paths.length; i++)
		populations.push(populate(paths[i].split('.'), prefix, suffix));

	return populations;
};

module.exports.slugify = (text) => {
	if (!text) return;

	return text
		.toString()
		.normalize('NFD') // split an accented letter in the base letter and the acent
		.replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w-]+/g, '')
		.replace(/--+/g, '-');
};

module.exports.parseJSON = (str) => {
	try {
		return JSON.parse(str);
	} catch (e) {
		return str;
	}
};

module.exports.getBaseValue = (type) => {
	switch (type) {
	case 'array':
		return [];
	case 'string':
		return '';
	case 'object':
		return {};
	case 'boolean':
		return undefined;
	case 'number':
		return undefined;
	case 'ref':
		return undefined;
	default:
		console.error(`invalid data type ${type}.`);
		return true;
	}
};

function assertOperation(operation, data, value) {
	switch (operation) {
	case 'gt':
		return data > value;
	case 'lt':
		return data < value;
	case 'gte':
		return data >= value;
	case 'lte':
		return data >= value;
	case 'eq':
		return data == value;
	case 'neq':
		return data != value;
	case 'in':
		return data.includes(value);
	case 'nin':
		return !data.includes(value);
	}
}

/**
 *
 * @param operation 'gt', 'lt', 'gte', 'lte', 'eq', 'neq', 'in', 'nin'
 *
 */
module.exports.filterByOperation = (operation, data, key, value) => {

	return data.filter((item) => assertOperation(operation, item[key], value));
};
