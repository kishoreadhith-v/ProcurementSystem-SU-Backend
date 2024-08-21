import express from 'express';
import dotenv from 'dotenv'
import userRouter from './router/userRoute';
import morgan from 'morgan';

dotenv.config()

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/u', userRouter);


app.listen(process.env.EXPRESS_PORT, () => {
    console.log('Server is running on port 3000');
});
