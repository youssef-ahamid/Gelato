const crud = require('./crud.js');
const { attempt, e, s } = require('./utils.js');
const api = require('./api.js');
const { slugify } = require('./parser.js');
const authorize = require('./middleware/validatePermissions.js');

class Endpoint {
	constructor(options = {}, db) {
		this.route = options.name.toLowerCase();
		this.crud = new crud(options.name, options.object, db);
		this.webhooks = options.webhooks || [];
		this.middlewares = options.middlewares || [];
		this.authenticate = options.authenticate;
	}

	async getAll(req, res) {
		await attempt(async () => {
			const things = await this.crud.getAll(req);

			if (things.error)
				return e(things.code, res, things.message, things.error);

			await this.runHooks('getAll', things);
			s(things, res);
		}, res);
	}

	async getOne(req, res) {
		await attempt(async () => {
			const query = this.getQuery(req);

			const thing = await this.crud.getOne(req, query);
			if (thing === null)
				return e(
					404,
					res,
					`${this.crud.model.modelName} ${query[Object.keys(query)[0]]
					} not found`
				);

			await this.runHooks('get', thing);
			s(thing, res);
		}, res);
	}

	async create(req, res) {
		await attempt(async () => {
			let data = this.getData(req, res);

			const newThing = await this.crud.create(data);
			await this.runHooks('create', newThing);
			s(newThing, res, 'entry created successfully');
		}, res);
	}

	async update(req, res) {
		await attempt(async () => {
			const query = this.getQuery(req);
			const data = this.getData(req, res);

			data.updatedAt = Date.now();

			const updatedThing = await this.crud.update(req, query, data);
			await this.runHooks('update', updatedThing);
			s(updatedThing, res, 'entry updated successfully');
		}, res);
	}

	async remove(req, res) {
		await attempt(async () => {
			const query = this.getQuery(req);

			const deletedThing = await this.crud.remove(query);
			if (deletedThing) await this.runHooks('delete', deletedThing);
			s(deletedThing, res, 'entry deleted successfully');
		}, res);
	}

	async mutate(data, wh) {
		const Crud = new crud(wh.model);
		let query = {};
		query[wh.param.name] = data[wh.param.prop];

		let thing = await Crud.getOne({}, query);
		if (thing === null) return;
		thing = this.apply(wh.function, thing, wh.prop, data[wh.dataPoint]);
		return await thing.save();
	}

	async getHooks(data) {
		let hooks = [];

		if (!this.crud.props.includes('webhooks')) return hooks;

		if (Array.isArray(data)) {
			let items = await this.crud.getAll({ query: { populate: 'webhooks' } });
			hooks = items.map((item) => item.webhooks);

			return Array.prototype.concat.apply([], hooks);
		}

		if (typeof data === 'object' && data !== null) return data.webhooks;

		return hooks;
	}

	async runHooks(on, data) {
		let whks = await this.getHooks(data);

		if (!this.webhooks && whks.length === 0) return;

		let webhooks = this.webhooks
			.concat(whks)
			.filter((wh) => wh && wh.action === on);
		webhooks.forEach(async (wh) => {
			if (wh.type === 'internal') await this.mutate(data, wh);
			else if (wh.type === 'external')
				await api.request(wh.method, wh.url, { body: data });

			console.log(`${wh.type} webhook ran successfully`);
		});
	}

	getQuery(req) {
		let query = { _id: req.params.id };
		if (req.body.filterQuery) query = req.body.filterQuery;
		return query;
	}

	getData(req, res) {
		const data = {};
		attempt(() => {
			this.crud.props.forEach((prop) => {
				let val = req.body[prop];
				if (val !== null && typeof val !== 'undefined') data[prop] = val;
			});
		}, res);
		return data;
	}

	apply(func, thing, prop, data) {
		switch (func) {
			case 'push':
				thing[prop].push(data);
				break;
			case 'set':
				thing[prop] = data;
				break;
			case 'remove':
				thing[prop] = null;
				break;
			case 'filter':
				thing[prop] = thing[prop].filter(
					(p) => p.toString() !== data.toString()
				);
				break;
			default:
				break;
		}
		return thing;
	}
}

module.exports.createEndpoint = (ep, db, app) => {
	const endpoint = new Endpoint(ep, db);
	const route = slugify(ep.name);

	app
		.get(`/${route}`, authorize(endpoint.authenticate && `read:${route}`), ...endpoint.middlewares, endpoint.getAll.bind(endpoint))
		.get(`/${route}/:id`, authorize(endpoint.authenticate && `read:${route}.id`), ...endpoint.middlewares, endpoint.getOne.bind(endpoint))
		.patch(`/${route}/:id`, authorize(endpoint.authenticate && `update:${route}.id`), ...endpoint.middlewares, endpoint.update.bind(endpoint))
		.post(`/${route}`, authorize(endpoint.authenticate && `create:${route}`), ...endpoint.middlewares, endpoint.create.bind(endpoint))
		.delete(`/${route}/:id`, authorize(endpoint.authenticate && `delete:${route}.id`), ...endpoint.middlewares, endpoint.remove.bind(endpoint));

	return endpoint;
};
