import dotenv from 'dotenv';
dotenv.config();

type Config = {
    port: number;
    mongoDBURL: string;
    dbName: string;
    mssqlUser: string;
    mssqlPassword: string;
    mssqlServer: string
    mssqlPort: number;
    mssqlDatabase: string;

}



const config:Config = {
    port: Number(process.env.PORT),
    mongoDBURL: String(process.env.MONGODB_URL),
    dbName: String(process.env.DB_NAME),
    mssqlUser: String(process.env.MSSQL_USER),
    mssqlPassword: String(process.env.MSSQL_PASSWORD),
    mssqlServer: String(process.env.MSSQL_SERVER),
    mssqlPort: Number(process.env.MSSQL_PORT),
    mssqlDatabase: String(process.env.MSSQL_DATABASE),
}

export default config;