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
        return { status: false, message: error || 'Problem connecting to mongo.' };
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
        return { status: false, message: error || 'Problem connecting to mysql.' };
    }
};

const checkRedis = async () => {
    log.debug('Checking Redis connection.');
    let client = null;
    try {
        client = redis.createClient(config.redis);
	    await client.connect();
        await client.quit();
        client = null;
        return { status: true, message: 'Successfully connected to Redis.' };
    } catch (error) {
        if (client) await client.quit();
        log.error(error.message);
        return { status: false, message: error.message };
    }
};

const checkRabbit = async () => {
    log.debug('Checking Rabbit connection.');
    let connection = null;
    try {
        connection = await amqp.connect(config.rabbit);
        await connection.close();
        return { status: true, message: 'Successfully connected to Rabbit.' };
    } catch (error) {
        if (connection) await connection.close();
        return { status: false, message: error || 'Problem connecting to rabbit.' };
    }
};


const connectivityHandler = async (req, res) => {
    const response = {
        data: { ...await checkAll() }
    }
    log.info(`${HOST}:${ID} received an info request on ${req.url}, returning ${JSON.stringify(response)}`);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    res.send(response);
}


const healthHandler = async (req, res) => {
    let response = {
        name: NAME,
        host: HOST,
        id: ID,
        time: new Date(),
        uptime: process.uptime(),
        message: 'Service is healthy.'
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    res.send(response);
}

const helpHandler = (req, res) => {
    const response = {
        commands: [
            { route: '/', description: 'Defaults to /help.' },
            { route: '/connectivity', description: 'Check connectivity info.' },
            { route: '/health', description: 'Display health check.' },
            { route: '/help', description: 'Display usage information.' },
            { route: '/process', description: 'Show process information.' }
        ]
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(404);
    res.send(JSON.stringify(response, null, 3));
}

const processHandler = async (req, res) => {
    const response = {
        host: HOST,
        id: ID,
        time: new Date(),
        uptime: process.uptime(),
        env: sortObject(process.env)
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    res.send(response);
}

const errorHandler = (req, res) => {
    let response = {
        name: NAME,
        host: HOST,
        id: ID,
        time: new Date(),
        message: `Unsupported route: ${req.url}`
    };
    log.info(`${HOST}:${PORT} received a request for an unsupported route: ${req.url}`);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(404);
    res.send(response);
}

app.get('/', helpHandler); app.get('/${NAME}', helpHandler);
app.get('/connectivity', connectivityHandler); app.get('/${NAME}/connectivity', connectivityHandler);
app.get('/health', healthHandler); app.get('/${NAME}/health', healthHandler);
app.get('/help', helpHandler); app.get('/${NAME}/help', helpHandler);
app.get('/process', processHandler); app.get('/${NAME}/process', processHandler);

app.use(errorHandler);

app.listen(PORT, () => {
    log.info(`${NAME} ${HOST}:${ID} listening for API requests on port ${PORT} at ${new Date()}.`);
});
