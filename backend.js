const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Configuración de conexión a la base de datos MySQL
const pool = mysql.createPool({
    host: '192.168.137.134', // Cambia esto si usas otra IP para MySQL
    user: 'user_app',
    password: 'ezquiel19',
    database: 'MiAplicacion',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware
app.use(cors());
app.use(express.json());

// Ruta raíz de prueba
app.get('/', (req, res) => {
    res.json({ message: "Servidor de aplicaciones en Rocky Linux con Express", status: "OK" });
});

// Ruta para obtener usuarios
app.get('/usuarios', (req, res) => {
    pool.query('SELECT * FROM Usuarios', (err, results) => {
    if (err) {
        console.error('Error al consultar en la bd: ', err);
        res.status(500).json({ error: 'Error al consultar en la bd' });
    return;
    }
        res.json(results);
    });
});

// Ruta para agregar un usuario
app.post('/usuarios', (req, res) => {
    const nuevoUsuario = req.body;
    if (nuevoUsuario.nombre && nuevoUsuario.email && nuevoUsuario.contraseña) {
        const query = 'INSERT INTO Usuarios (Nombre, Email, Contraseña) VALUES (?, ?, ?)';
        pool.query(query, [nuevoUsuario.nombre, nuevoUsuario.email, nuevoUsuario.contraseña], (err, result) => {
        if (err) {
            console.error('Error al insertar en la base de datos:', err);
            res.status(500).json({ error: 'Error al insertar en la base de datos' });
            return;
        }
        res.status(201).json({ mensaje: 'Usuario agregado exitosamente', id: result.insertId });
    });
    } else {
        res.status(400).json({ mensaje: 'Datos inválidos' });
    }
});

// Puerto en el que escucha el backend
const port = 8080;
app.listen(port, () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});