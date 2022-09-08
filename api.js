const fetch = import('node-fetch');

class API {
	constructor() {}
  
	async request(method, url, options = {}) {
		let contentType = options.contentType || 'application/json';
		let headers = options.headers || {};

		let opts = {
			method: method,
			headers: {
				'Content-Type': contentType,
				...headers,
			},
			...options,
		};
  
		if (opts.body) opts.body = JSON.stringify(opts.body);
  
		try {
			let res = await fetch(url, opts);
			if (res.status >= 200 && res.status < 300)
				return await res.json();
			else return { success: false, ...res };
		} catch (e) {
			console.error(e);
			return e;
		}
	}
  
	async get(url = '', options = {}) {
		return this.request('GET', url, options);
	}
  
	async post(url = '', body = {}, options = {}) {
		options.body = body;
		return this.request('POST', url, options);
	}
  
	async patch(url = '', body = {}, options = {}) {
		options.body = body;
		return this.request('PATCH', url, options);
	}
  
	async delete(url = '', options = {}) {
		return this.request('DELETE', url, options);
	}
}
module.exports = new API();