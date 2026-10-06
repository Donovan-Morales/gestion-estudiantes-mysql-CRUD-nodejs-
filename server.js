const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'user01',
  password: process.env.DB_PASSWORD || 'donovan@2003',
  database: process.env.DB_NAME || 'instituto02',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// OBTENER TODOS
app.get('/api/estudiantes', (req, res) => {
  const query = 'SELECT Carnet, Nombres, Apellidos, DATE_FORMAT(Fecha_nac, "%Y-%m-%d") AS Fecha_nac, Carrera, Correo FROM estudiantes';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    res.json(results);
  });
});

// BUSCAR POR CARNET
app.get('/api/estudiantes/:carnet', (req, res) => {
  const { carnet } = req.params;
  const query = 'SELECT Carnet, Nombres, Apellidos, DATE_FORMAT(Fecha_nac, "%Y-%m-%d") AS Fecha_nac, Carrera, Correo FROM estudiantes WHERE Carnet = ?';
  db.query(query, [carnet], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la consulta' });
    if (results.length === 0) return res.status(404).json({ message: 'Estudiante no encontrado' });
    res.json(results[0]);
  });
});

// REGISTRAR
app.post('/api/estudiantes', (req, res) => {
  const { Carnet, Nombres, Apellidos, Fecha_nac, Carrera, Correo } = req.body;
  if (!Carnet || !Nombres || !Apellidos) {
    return res.status(400).json({ error: 'Carnet, Nombres y Apellidos son obligatorios' });
  }

  const fechaValida = Fecha_nac ? Fecha_nac : null;
  const query = 'INSERT INTO estudiantes (Carnet, Nombres, Apellidos, Fecha_nac, Carrera, Correo) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(query, [Carnet, Nombres, Apellidos, fechaValida, Carrera || null, Correo || null], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El Carnet ya está registrado' });
      return res.status(500).json({ error: 'Error al guardar el estudiante' });
    }
    res.status(201).json({ message: 'Estudiante registrado con éxito' });
  });
});

// EDITAR
app.put('/api/estudiantes/:carnet', (req, res) => {
  const { carnet } = req.params;
  const { Nombres, Apellidos, Fecha_nac, Carrera, Correo } = req.body;

  const fechaValida = Fecha_nac ? Fecha_nac : null;
  const query = 'UPDATE estudiantes SET Nombres = ?, Apellidos = ?, Fecha_nac = ?, Carrera = ?, Correo = ? WHERE Carnet = ?';
  
  db.query(query, [Nombres, Apellidos, fechaValida, Carrera || null, Correo || null, carnet], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Estudiante no encontrado' });
    res.json({ message: 'Estudiante actualizado con éxito' });
  });
});

// ELIMINAR
app.delete('/api/estudiantes/:carnet', (req, res) => {
  const { carnet } = req.params;
  const query = 'DELETE FROM estudiantes WHERE Carnet = ?';
  db.query(query, [carnet], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Estudiante no encontrado' });
    res.json({ message: 'Estudiante eliminado con éxito' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});