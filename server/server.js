require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const app = express();

const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Configuracion de las rutas
app.use(require('./routes/index'));

// For the deprecation warnings...
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose.connect(process.env.URLDB, (err, res) => {
    if (err) throw err;
    console.log(`Base de Datos OK`);
});

app.listen(process.env.PORT, () => console.log(`Escuchando en ${process.env.PORT}`));