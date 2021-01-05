'use strict';

const NODE_ENV = process.env.NODE_ENV || 'prod';

const config = {
    test: {
        mongo: 'mongodb://localhost:27017',
        mysql: {
            host: 'localhost',
            user: 'root',
            password: 'password'
        },
        rabbit: 'amqp://localhost',
        redis: {
            port: 6379,
            host: 'localhost'
        }
    },
    prod: {
        mongo: 'mongodb://mongo:27017',
        mysql: {
            host: 'mysql',
            user: 'root',
            password: 'password'
        },
        rabbit: 'amqp://rabbit',
        redis: {
            port: 6379,
            host: 'redis'
        }
    }
}

module.exports = config[NODE_ENV]