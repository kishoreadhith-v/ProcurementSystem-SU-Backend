import express, { type Response, type Request, type NextFunction } from 'express';
import dotenv from 'dotenv'
import userRouter from './router/userRoute';
import morgan from 'morgan';
import procurementItemRouter from './router/procurementItem';
import ClubsRouter from './router/ClubsRouter';
import grantsRouter from './router/grantsRouter';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import cors from 'cors';
import findFreePort from 'find-free-port';

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
            {
                url: 'https://procurementsystem-su-backend-1.onrender.com'
            }
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
app.use(cors(
    {
        origin: '*',
    }
))

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use('/api/u', userRouter);
app.use('/api/p', procurementItemRouter);
app.use('/api/c', ClubsRouter);
app.use('/api/g', grantsRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});



findFreePort(3000, (err: any, freePort: any) => {
    if (err) {
        console.error(err);
        return;
    }
    app.listen(freePort, () => {
        console.log(`Server is running on port ${freePort}`);
    });
});