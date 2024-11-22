const express = require('express');
const cors = require('cors');
const db = require('./firebaseConfig'); // Conexión a Firebase

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si ya existe un usuario con el mismo email
    const emailSnapshot = await db.collection('usuarios').where('email', '==', email).get();

    if (!emailSnapshot.empty) {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
    }

    // Registrar el usuario
    await db.collection('usuarios').add({ username, email, password });
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const snapshot = await db.collection('usuarios').where('email', '==', email).get();

    if (snapshot.empty) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const user = snapshot.docs[0].data();

    if (user.password === password) {
      return res.status(200).json({ message: 'Inicio de sesión exitoso', email: user.email });
    } else {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});


// Iniciar servidor
const PORT = process.env.PORT || 5000; // Usa el puerto de Render o 5000 como fallback
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
