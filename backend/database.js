const mongoose = require('mongoose');
const dotenv = require('dotenv')
const { MongoMemoryServer } = require('mongodb-memory-server');
dotenv.config()
let user= process.env.DB_USER;
let password= process.env.DB_PASSWORD;
let databaseName = 'production';

const isTest = process.env.NODE_ENV === 'test';

const connectToDatabase = async () => {
try{
    if(isTest){
        console.log('connecting to test database');
        const mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        mongoose.connect(uri, {dbName: databaseName});
    }else{
        await mongoose.connect(`mongodb+srv://${user}:${password}@primary.imymk61.mongodb.net/?retryWrites=true&w=majority&appName=Primary`,
        {dbName: databaseName});
        console.log('connected to database ' + databaseName);
    }
}catch{
    console.log('Error connecting to database');
}
}
connectToDatabase();
