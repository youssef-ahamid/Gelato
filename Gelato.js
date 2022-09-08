const { createEndpoint } = require('./Endpoint.js');
const { queryable } = require('query-request');

// -----------------Init App----------------- //
const express = require('express');

// db connection
const db = require('./db.js');

// ----------------Middleware---------------- //
const cors = require('cors');
const logger = require('morgan');

class Gelato {
    constructor(options = {}) {
        this.name = options.name || 'Gelato';
        this.port = options.port || 3000;

        this.server = express();
        this.server.listen(this.port, () => {
            console.log(`${this.name} live on port ${this.port}`);
        });

        this.db = new db(options.databaseURI)
        this.db.connection.on('open', () => {
            console.log('MongoDB Connected...');
        });

        this.server.use(cors({ origin: options.corsOrigins || "*" }));
        this.server.use(logger('dev'));

        this.server.use(express.json());
        this.server.use(express.urlencoded({ extended: false }));
        
        this.server.use(queryable);

        this.middlewares = options.middlewares || []
        this.middlewares.forEach(middleware => {
            this.middlewares.push(middleware)
            this.server.use(middleware)
        });

        this.endpoints = []
        options.endpoints.forEach(endpoint => {
            this.endpoints.push(createEndpoint(endpoint, this.db, this.server))
        });
    }
}

module.exports = Gelato;
