const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const mailgun = require("mailgun-js");

const app = express();
const DOMAIN = "sandbox2787c3d99cd145e6b5f0fc2a8bb37b4f.mailgun.org";
const mg = mailgun({ apiKey: "ae353eedb3ddf2fd33f0004de0ffb848-d8df908e-32c7bf71", domain: DOMAIN });

const pool = mysql.createPool({
  host: "192.168.137.134",
  user: "user_app",
  password: "ezhigue19",
  database: "MiAplicacion",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 8,
});

app.get("/", (req, res) => {
  res.json({ message: "Servidor de Aplicaciones en Rocky Linux con Express B1", status: "OK" });
});

app.use(cors());
app.use(express.json());

app.get("/usuarios", (req, res) => {
  pool.query("SELECT * FROM Usuarios", (err, results) => {
    if (err) {
      console.error("Error al consultar en la bd: ", err);
      res.status(500).json({ error: "Error al consultar en la bd" });
      return;
    }
    res.json(results);
  });
});

app.post("/usuarios", (req, res) => {
  const nuevoUsuario = req.body;
  if (nuevoUsuario.nombre && nuevoUsuario.email && nuevoUsuario.contraseña) {
    const query = "INSERT INTO Usuarios (Nombre, Email, Contraseña) VALUES (?, ?, ?)";
    pool.query(query, [nuevoUsuario.nombre, nuevoUsuario.email, nuevoUsuario.contraseña], (err, result) => {
      if (err) {
        console.error("Error al insertar en la base de datos: ", err);
        res.status(500).json({ error: "Error al insertar en la base de datos" });
        return;
      }

      // Enviar correo de bienvenida
      const emailData = {
        from: "EG Fitness Gym <postmaster@sandbox2787c3d99cd145e6b5f0fc2a8bb37b4f.mailgun.org>",
        to: nuevoUsuario.email,
        subject: "Bienvenido a EG Fitness Gym",
        text: `Hola ${nuevoUsuario.nombre}, ¡gracias por registrarte en EG Fitness Gym!`
      };

      mg.messages().send(emailData, (error, body) => {
        if (error) {
          console.error("Error al enviar correo: ", error);
        } else {
          console.log("Correo enviado:", body);
        }
      });

      res.status(201).json({ mensaje: "Usuario agregado exitosamente", id: result.insertId });
    });
  } else {
    res.status(400).json({ mensaje: "Datos Inválidos" });
  }
});

const port = 8080;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});