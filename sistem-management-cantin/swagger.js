// swagger.js  
const swaggerJsDoc = require('swagger-jsdoc');  
  
const swaggerOptions = {  
  swaggerDefinition: {  
    openapi: '3.0.0',  
    info: {  
      title: 'API Documentation',  
      version: '1.0.0',  
      description: 'API for managing users, products, sales, inventory, and profits',  
    },  
    servers: [  
      {  
        url: 'http://localhost:3000',  
      },  
    ],  
  },  
  apis: ['./routes/*.js'], // Path to the API docs  
};  
  
const swaggerDocs = swaggerJsDoc(swaggerOptions);  
module.exports = swaggerDocs;  
