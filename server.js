import fs from 'fs';
import express from 'express';
import {MongoClient} from 'mongodb';
import Schema from './data/schema';
import GraphQLHTTP from 'express-graphql';
import {graphql} from 'graphql';
import {introspectionQuery, printSchema} from 'graphql';

let app = express();
app.use(express.static('public'));

(async () => {
  try {
    let db = await MongoClient.connect(process.env.MONGO_URL); 
    let schema = Schema(db);

    app.use('/graphql', GraphQLHTTP({
      schema,
      graphiql: true
    }))
    app.listen(3000, () => console.log('Listening on port 3000'));

    //Generate schema.json
    console.log('Enter generate schema.json');
    let json = await graphql(schema, introspectionQuery);
    fs.writeFile('./data/schema.json', JSON.stringify(json, null, 2), err => {
      if (err) throw err; 
      console.log("JSON schema created in ./data/schema/");
    });
    //Generate readable schema
    fs.writeFile('./data/schema.graphql', printSchema(schema), err => {
      if (err) throw err; 
    });
  } catch(e) {
    console.log(e);
  }

})();

