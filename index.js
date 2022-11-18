const mongoose = require('mongoose');
const { ApolloServer } = require("apollo-server");
const typeDefs = require("./src/gql/schemas");
const resolvers = require("./src/gql/resolvers")
//require("dotenv").config({path: ".env"});

const path = require('path');

const dotenvAbsolutePath = path.join(__dirname, '.env');

  const dotenv = require('dotenv').config({
    path: dotenvAbsolutePath
  });
  if (dotenv.error) {
    throw dotenv.error;
  }
mongoose.connect(process.env.MONGO_URI,  {
    
    poolSize:2,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}, (err, _) => {
    if(err){
        console.log("Error de conexion");
    }else{
        server();
    }
});

 mongoose.createConnection(
    process.env.MONGO_URI_CLOUD,
    {
     
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    }
  );  
function server(){
    const serverApollo = new ApolloServer({
        typeDefs,
        resolvers
    });

    serverApollo.listen({port: process.env.PORT || 4000})
        .then(({url}) => {
            console.log(`######################################################################`);
            console.log(`### Base conectada y apollo conectado. URL: ${url} ###`);
            console.log(`######################################################################`);
        })
        .catch((err) => {
            console.log(err);
            console.log("Error al conectarse a apollo");
        })
}