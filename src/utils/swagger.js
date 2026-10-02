const swaggerjsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Chat App Backend API',
            version: '1.0.0',
            description: 'API documentation for the Chat App Backend',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: [require('path').join(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerjsdoc(options);
module.exports = swaggerSpec;