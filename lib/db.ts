import { Pool } from 'pg';

// Configuración del pool de PostgreSQL usando TUS variables de entorno
const pool = new Pool({
    host: process.env.DB_HOST || '185.211.4.203',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE || 'learning_platform',
    user: process.env.DB_USER || 'auwolf',
    password: process.env.PG_PASSWORD || 'unpocolokO3814x.0+',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

// Función para ejecutar consultas
export const query = async (text: string, params?: any[]) => {
    let client;
    try {
        const start = Date.now();
        client = await pool.connect();
        const result = await client.query(text, params);
        const duration = Date.now() - start;

        return result;
    } catch (error) {
        console.error('Error en query:', error);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
};

// Función para obtener un cliente directamente (para transacciones)
export const getClient = async () => {
    const client = await pool.connect();
    return client;
};

// Función para verificar la conexión y estructura de la BD
export const testConnection = async () => {
    let client;
    try {
        client = await pool.connect();
        console.log('✅ Conexión a PostgreSQL exitosa');
        return true;
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error);
        return false;
    } finally {
        if (client) {
            client.release();
        }
    }
};

// Manejo de errores de conexión
pool.on('error', (err) => {
    console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
});

// Probar conexión al cargar el módulo (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
    setTimeout(() => {
        testConnection().catch(console.error);
    }, 1000);
}

export default pool;