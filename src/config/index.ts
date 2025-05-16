import dotenv from 'dotenv';

type Config = {
    port: Number;
}

dotenv.config();


const config:Config = {
    port: Number(process.env.PORT),
}

export default config;