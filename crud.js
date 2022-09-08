const { getPopulationPath, slugify } = require('./parser.js');
const { update } = require('./webhook.js');

class crud {
	constructor(name, object, db) {
		this.model = db.createMongooseSchema(name, object);
		this.name = name;
		this.props = Object.keys(object);
	}

	async getAll(req) {
		const { populate } = req.query || {};
		let things;

		if (populate) {
			things = await this.model
				.find()
				.populate(getPopulationPath(populate, this.props.data ? 'data' : null));
		}
		things = await this.model.find();

		const { data, total, error } = await req.applyQuery(things);

		if (error) return error;

		let obj = {};
		obj[`${this.name}s`] = data;
		obj.total = total;
		return obj;
	}

	async getOne(req, query) {
		const { populate } = req.query || {};

		if (populate)
			return await this.model
				.findOne(query)
				.populate(
					getPopulationPath(
						populate,
						this.name === 'Instance' ? 'data' : null,
						this.name === 'Instance' ? 'value' : null
					)
				);
		return await this.model.findOne(query);
	}

	async create(data) {
		if (this.name === 'Field' && data.reverseField) {
			const reverse = data.reverseField;
			delete data.reverseField;
			let thing = new this.model(data);
			thing = await thing.save();
			return thing;
		}

		let thing = new this.model(data);
		if (this.name === 'Model') thing.slug = slugify(thing.name);
		thing = await thing.save();
		return thing;
	}

	async update(req, query, data) {
		let thing;
		if (query._id) thing = await this.model.findById(query._id);
		else thing = await this.model.findOne(query);

		for (const [key, value] of Object.entries(data)) {
			thing[key] = update(thing[key], value, req.query.function);
			thing.markModified(key);
		}

		return await thing.save();
	}

	async remove(query) {
		return await this.model.findOneAndDelete(query);
	}
}

module.exports = crud;
