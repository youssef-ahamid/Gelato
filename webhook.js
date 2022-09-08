const api = require('./api.js');
const crud = require('./crud.js');

module.exports.update = function(thing, data, func = 'set') {
	switch (func) {
	case 'set':
		if (Array.isArray(thing) && !Array.isArray(data)) thing = [data];
		else thing = data;
		break;
	case 'push':
		if (!Array.isArray(thing)) thing = data;
		else if (!Array.isArray(data)) thing.push(data);
		else thing.concat(data);
		break;
	case 'remove':
		if (Array.isArray(thing)) thing = [];
		else thing = null;
		break;
	case 'filter':
		if (Array.isArray(thing)) thing = thing.filter((p) => p.toString() !== data.toString());
		break;
	}
	return thing;
}

async function mutate(data, wh) {
	let query = {};

	query[wh.param.name] = data[wh.param.prop];
	
	if(data.data) wh.param.name = 'data.' + wh.param.name;

	const ModelCrud = new crud('Model');
	const myModel = await ModelCrud.getOne({ query: { populate: 'instances' }}, { _id: wh.model });

	let thing = myModel.instances.filter(instance => instance[wh.param.name] == data[wh.param.prop])[0];
	thing[wh.prop] = update(thing[wh.prop], data[wh.dataPoint], wh.function);

	if (typeof thing[wh.prop] === 'object' && !Array.isArray(thing[wh.prop])) thing.markModified(wh.prop);

	return await thing.save();
}

async function getHooks(crud, data) {
	let hooks = [];

	if (!crud.props.includes('webhooks')) return hooks;

	if (Array.isArray(data)) {
		let items = await crud.getAll({ query: { populate: 'webhooks' } });
		hooks = items.map((item) => item.webhooks);

		return Array.prototype.concat.apply([], hooks);
	}

	if (typeof data === 'object') return data.webhooks || [];

	return hooks;
}

module.exports.runHooks = async function(on, data, crud, hooks = []) {
	let whks = await getHooks(crud, data);

	if (hooks?.length === 0 && whks.length === 0) return;

	let webhooks = hooks.concat(whks).filter((wh) => wh.action === on);
	webhooks.forEach(async (wh) => {
		if (wh.type === 'internal') await mutate(data, wh);
		else if (wh.type === 'external')
			await api.request(wh.method, wh.url, { body: data });

		console.log(`${wh.type} webhook ran successfully`);
	});
}
