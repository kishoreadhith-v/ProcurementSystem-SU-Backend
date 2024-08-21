import express from 'express';
import dotenv from 'dotenv'
import userRouter from './router/userRoute';
import morgan from 'morgan';
import procurementItemRouter from './router/procurementItem';
import ClubsRouter from './router/ClubsRouter';
import grantsRouter from './router/grantsRouter';
dotenv.config()

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/u', userRouter);
app.use('/api/p', procurementItemRouter);
app.use('/api/c', ClubsRouter);
app.use('/api/g', grantsRouter);


app.listen(process.env.EXPRESS_PORT, () => {
    console.log('Server is running on port 3000');
});
