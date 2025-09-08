import { Pool } from 'pg';

// Configuración del pool de PostgreSQL usando TUS variables de entorno
const pool = new Pool({
    host: process.env.DB_HOST || '185.211.4.203',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE || 'learning_platform',
    user: process.env.DB_USER || 'auwolf',
    password: process.env.PG_PASSWORD || 'un4x.0+',
    max: 200,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

// Función para ejecutar consultas
export const query = async (text, params) => {
    try {
        console.log('🔍 Ejecutando query:', text.substring(0, 150) + (text.length > 150 ? '...' : ''));
        if (params) {
            console.log('📊 Parámetros:', params);
        }

        const start = Date.now();
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        console.log(`✅ Query ejecutada en ${duration}ms, filas: ${result.rowCount}`);
        return result;
    } catch (error) {
        console.error('❌ Error en query:', error);
        console.error('Query fallida:', text);
        if (params) {
            console.error('Parámetros:', params);
        }
        throw error;
    }
};

// Función para obtener un cliente directamente (para transacciones)
export const getClient = async () => {
    const client = await pool.connect();

    const originalQuery = client.query;
    const originalRelease = client.release;

    // Monkey patch para logging de queries
    client.query = (...args) => {
        console.log('🔍 Query con cliente:', args[0].substring(0, 100) + '...');
        return originalQuery.apply(client, args);
    };

    // Monkey patch para logging de release
    client.release = () => {
        console.log('🔄 Liberando cliente');
        client.query = originalQuery;
        client.release = originalRelease;
        return originalRelease.apply(client);
    };

    return client;
};

// Función para verificar la conexión y estructura de la BD
export const testConnection = async () => {
    let client;
    try {
        client = await pool.connect();
        console.log('✅ Conexión a PostgreSQL exitosa');

        // Verificar tablas esenciales
        const tablesToCheck = ['users', 'courses', 'course_modules', 'user_course_enrollments'];

        for (const table of tablesToCheck) {
            const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);

            console.log(`📊 ¿Tabla ${table} existe?`, tableCheck.rows[0].exists);

            if (!tableCheck.rows[0].exists) {
                console.warn(`⚠️  Advertencia: La tabla ${table} no existe en la base de datos`);
            }
        }

        // Contar registros en tablas principales
        try {
            const usersCount = await client.query('SELECT COUNT(*) FROM users');
            const coursesCount = await client.query('SELECT COUNT(*) FROM courses');

            console.log(`👥 Usuarios en BD: ${usersCount.rows[0].count}`);
            console.log(`📚 Cursos en BD: ${coursesCount.rows[0].count}`);
        } catch (countError) {
            console.log('ℹ️  No se pudieron contar registros (tablas probablemente vacías)');
        }

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

// Función para inicializar la base de datos (ejecutar tablas básicas si no existen)
export const initializeDatabase = async () => {
    const client = await getClient();

    try {
        await client.query('BEGIN');

        // Crear tabla users si no existe
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('admin', 'instructor', 'student')),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        profile_image_url VARCHAR(500),
        phone_number VARCHAR(20),
        department VARCHAR(100),
        position VARCHAR(100),
        last_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
    `);

        console.log('✅ Tabla users verificada/creada');

        // Insertar usuario admin por defecto si no existe (password: admin123)
        await client.query(`
      INSERT INTO users (email, first_name, last_name, password_hash, role)
      VALUES ('admin@learninghub.com', 'Administrador', 'Sistema', '$2b$10$K7Vv.ExampleHashHere1234567890', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `);

        await client.query('COMMIT');
        console.log('✅ Base de datos inicializada correctamente');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error inicializando base de datos:', error);
        throw error;
    } finally {
        client.release();
    }
};

// Manejo de errores de conexión
pool.on('error', (err) => {
    console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
});

// Probar conexión al cargar el módulo (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
    testConnection().then(success => {
        if (success) {
            // Inicializar con tablas básicas si es necesario
            initializeDatabase().catch(console.error);
        }
    });
}

export default pool;