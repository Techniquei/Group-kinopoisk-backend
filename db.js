import pkg from 'pg';
const { Pool } = pkg;


export const pool = new Pool({
    user: "postgres",
    password: 'root',
    host: 'localhost',
    port: 5432,
    database: 'kinopoisk_accounts'
})

