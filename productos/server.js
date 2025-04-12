const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./src/routes/routes');

const app = express();
mongoose.connect('mongodb://localhost:27017/productos_db');

app.use(express.json());
app.use('/api/products', productRoutes);

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
