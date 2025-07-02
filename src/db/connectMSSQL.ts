import sql, { config as SQLConfig, ConnectionPool } from "mssql";
import config from "../config";

const dbConfig: SQLConfig = {
    user: config.mssqlUser,
    password: config.mssqlPassword,
    server: config.mssqlServer,
    port: config.mssqlPort, // Make sure it's number in config
    database: config.mssqlDatabase,
    options: {
        encrypt: false, // set true if using Azure or need encryption
        trustServerCertificate: true,
    },
};

async function connectMSSQL(): Promise<ConnectionPool | null> {
    try {
        const pool = await sql.connect(dbConfig);
        console.log("✅ Connected to MSSQL");
        return pool;
    } catch (err) {
        console.error("❌ MSSQL Connection Error:", err);
        return null;  // safer: return null if connection failed
    }
}

export default connectMSSQL;
