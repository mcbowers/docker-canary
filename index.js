'use strict';

const express = require('express');
const os = require('os');
const sortObject = require('sort-object');

const MongoClient = require('mongodb').MongoClient;
const mysql = require('mysql2/promise');
const amqp = require('amqplib');
const redis = require('redis');

const log = require('./lib/log');
const config = require('./lib/config');

const app = express();
const PORT = 8065;

const NAME = 'docker-canary';
const HOST = os.hostname();
const ID = process.pid;

const checkAll = async () => {
    log.debug(`Current environment: ${JSON.stringify(sortObject(process.env))}`);
    return {
        name: NAME,
        host: HOST,
        id: ID,
        time: new Date(),
        uptime: process.uptime(),
        services: {
            rabbit: await checkRabbit(),
            redis: await checkRedis(),
            mysql: await checkMySQL(),
            mongo: await checkMongo(),
        },
        env: process.env.NODE_ENV,
        config: config
    };
};

const checkMongo = async () => {
    log.debug('Checking Mongo connection.');
    let client = null;
    try {
        client = await MongoClient.connect(config.mongo, { useUnifiedTopology: true });
        client.close();
        return { status: true, message: 'Successfully connected to Mongo.' };
    } catch (error) {
        if (client) client.close();
        return { status: false, message: error };
    }
};

const checkMySQL = async () => {
    log.debug('Checking MySQL connection.');
    let connection = null;
    try {
        connection = await mysql.createConnection(config.mysql);
        connection.close();
        return { status: true, message: 'Successfully connected to MySQL.' };
    } catch (error) {
        if (connection) connection.close();
        return { status: false, message: error };
    }
};

const checkRedis = async () => {
    log.debug('Checking Redis connection.');
    let connection = null;
    try {
        connection = redis.createClient(config.redis);
        connection.end();
        return { status: true, message: 'Successfully connected to Redis.' };
    } catch (error) {
        if (connection) connection.end();
        return { status: false, message: error };
    }
};

const checkRabbit = async () => {
    log.debug('Checking Rabbit connection.');
    let connection = null;
    try {
        connection = await amqp.connect(config.rabbit);
        connection.close();
        return { status: true, message: 'Successfully connected to Rabbit.' };
    } catch (error) {
        if (connection) connection.close();
        return { status: false, message: error };
    }
};


const health = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200);
    res.send({});
}

const defaultHandler = async (req, res) => {
    const response = {
        data: { ...await checkAll() }
    }
    log.info(`${HOST}:${ID} received an info request on ${req.url}, returning ${JSON.stringify(response)}`);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(response);
}

const errorHandler = (req, res) => {
    let message = {
        name: NAME,
        host: HOST,
        id: ID,
        time: new Date(),
        message: `Unsupported route: ${req.url}`
    };
    log.info(`${HOST}:${PORT} received a request for an unsupported route: ${req.url}`);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(404);
    res.send(message);
}


app.get('/', defaultHandler);           // Real root route.
app.get(`/${NAME}`, defaultHandler);    // Silly root route due to AWS ELB passing in the route.

app.get('/health', health);
app.get(`/${NAME}/health`, health);

app.use(errorHandler);                  // Everything else.


app.listen(PORT, () => {
    log.info(`${NAME} ${HOST}:${ID} listening for API requests on port ${PORT} at ${new Date()}.`);
});