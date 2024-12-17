const mongoose = require('mongoose');
let user= 'juuligarcia2208';
let password= 'julito123';
let databaseName = 'production';

if(process.env.NODE_ENV === 'test'){
    databaseName = 'testdb'
}
try{
    mongoose.connect(`mongodb+srv://${user}:${password}@primary.imymk61.mongodb.net/?retryWrites=true&w=majority&appName=Primary`,
        {dbName: databaseName});
    console.log('Database connected');

}catch{
    console.log('Error connecting to database');
}