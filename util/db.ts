import { Pool } from "pg";
const dotenv = require('dotenv');
dotenv.config();


const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    idleTimeoutMillis: 0,
})

export default async function query(text: any, params: any) {
    const res = await pool.query(text, params);
    return res;
}


pool.on('connect', () => {
    console.log('connected to the db');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err)

})
