import express from 'express';
import dotenv from 'dotenv'
import userRouter from './router/userRoute';
import morgan from 'morgan';
import procurementItemRouter from './router/procurementItem';
import ClubsRouter from './router/ClubsRouter';
import grantsRouter from './router/grantsRouter';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

dotenv.config()


const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0', // Specify the OpenAPI version
        info: {
            title: 'Procurement System SU', // API name
            version: '1.0.0', // API version
            description: 'API Documentation', // Description
            contact: {
                name: 'Team backend',
                email: 'rojapoomala@gmail.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000', // Server URL
            },
        ],
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
    apis: ['./router/*.ts'], // Path to the API docs
};


const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use('/api/u', userRouter);
app.use('/api/p', procurementItemRouter);
app.use('/api/c', ClubsRouter);
app.use('/api/g', grantsRouter);


app.listen(process.env.EXPRESS_PORT, () => {
    console.log('Server is running on port 3000');
});
