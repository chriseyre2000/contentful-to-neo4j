import config from './config';

const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver(config.neo4j.uri, neo4j.auth.basic(config.neo4j.user, config.neo4j.password));
const session = driver.session();
var transaction = session.beginTransaction();

const cypherCommand = (cmd, params) => {
    transaction.run(cmd, params);
};

const emptyGraphDatabase = () => {
    cypherCommand("MATCH (a)-[m]-(b) DELETE m");
    cypherCommand("MATCH (a) DELETE a");   
}

const finish = () => {
    transaction.commit().then(
      () => {
        session.close( () => {
          console.log("Done");
          driver.close();
          process.exit(0); // This should not be required.
        });
    });
  }

const neo4jService = {
    cypherCommand,
    emptyGraphDatabase,
    finish
};

export default neo4jService;