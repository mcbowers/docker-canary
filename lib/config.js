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
            url: 'redis://localhost'
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
            url: 'redis://redis'
        }
    }
}

module.exports = config[NODE_ENV]