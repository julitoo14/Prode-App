const app = require('./app');
const dotenv = require('dotenv');
require('./database');
dotenv.config();

const PORT = process.env.PORT || 4000;
app.listen(PORT,() =>{
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});