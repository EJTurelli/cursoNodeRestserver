// PUERTO
process.env.PORT = process.env.PORT || 3000;

// ENTORNO
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// SEMILLA DE TOKEN
process.env.TOKEN_SEED = process.env.TOKEN_SEED || 'Esta-es-la-semilla-de-desarrollo';

// VENCIMIENTO
process.env.TOKEN_EXP = '31d';

// BASE DE DATOS
let urlDB = null;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;