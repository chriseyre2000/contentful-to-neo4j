import config from "./config";

const neo4j = require('neo4j-driver')

var driver = neo4j.driver(
  config.neo4j.uri,
  neo4j.auth.basic(config.neo4j.user, config.neo4j.password)
)

const session = driver.session();
var transaction = session.beginTransaction();

const cypherCommand = (cmd, params) => {
  transaction.run(cmd, params);
};

const emptyGraphDatabase = () => {
  cypherCommand("MATCH (a)-[m]-(b) DELETE m");
  cypherCommand("MATCH (a) DELETE a");
};

const tidyUp = (msg, status) => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`The script uses approximately ${used} MB`);

    console.log(msg);
    driver.close();
    process.exit(status);
}

const finish = () => {
  transaction.commit().then(
    result => {
     if (result) {console.log('neo4j commit', JSON.stringify(result)) }
      // result.summary.notifications.forEach(n => {
      //   console.log(`${n.code} ${n.title} ${n.description} ${n.severity}`);
      // });

      tidyUp("Done", 0);
    },

    reason => {
      console.log(`Transaction failed with ${reason}`);
      tidyUp("Error", 1);
    }
  );
};

const neo4jService = {
  cypherCommand,
  emptyGraphDatabase,
  finish
};

export default neo4jService;