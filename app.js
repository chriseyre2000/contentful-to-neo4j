import { createClient } from 'contentful'

// This is a polyfill for "Headers is not defined"  
const fetch = require('node-fetch');
global.Headers = fetch.Headers;

const neo4j = require('neo4j-driver').v1;

function isArray(arr) {
  return arr instanceof Array;
}

const client = createClient({
  // This is the space ID. 
  space: process.env.SPACE_ID,
  // This is the access token for this space.
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  resolveLinks: false,
});

const uri = process.env.NEO4J_SERVER || 'bolt://localhost'; 
const user = process.env.NEO4j_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD;
const contentfulBatchSize = process.env.CONTENTFUL_BATCH_SIZE || 500;
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();
var transaction = session.beginTransaction();

const cypherCommand = (cmd, params) => {
  transaction.run(cmd, params);
}

// Empty the graph
cypherCommand("MATCH (a)-[m]-(b) DELETE m");
cypherCommand("MATCH (a) DELETE a");

let relationships = [];

const storeRelationship = (data) => {
  relationships.push(data)
} 

const processAssets = (assets, skip, limit, next = fetchEntries) => {
    
  console.log("Assets:", assets.items.length)

  assets.items.forEach( (asset) => {
    cypherCommand(`CREATE (a:asset {cmsid: '${asset.sys.id}', cmstype: '${asset.sys.type}', title: '${asset.fields.title}', url: '${asset.fields.file.url}'} ) RETURN a`)
  });

  if ((skip + limit) <= assets.total) {
    fetchAssets(skip + limit, limit);
  } else {
    next(limit);
  }
}

const processEntries = (entries, skip, limit, next = processRelationships ) => {
  console.log("Entries:", entries.items.length);
  
  entries.items.forEach( (entry) =>  {
  
    // Bare entry
    const cmd = `CREATE (a:${entry.sys.contentType.sys.id} {cmsid: '${entry.sys.id}', cmstype: '${entry.sys.type}'} ) RETURN a`;
    cypherCommand(cmd);

    // Work on fields and relationships
    const fields = entry.fields;

    Object.keys(fields).forEach( (fieldName) => {

      let fieldValue = fields[fieldName];

      if ( typeof(fieldValue) == "number" ) {
        let cmd = `MATCH (a {cmsid: '${entry.sys.id}'}) SET a.${fieldName} = ${ fieldValue } RETURN a`
        cypherCommand(cmd);
      } else if ( typeof(fieldValue) == "string" ) {
        let cmd = `MATCH (a {cmsid: '${entry.sys.id}'}) SET a.${fieldName} = {valueParam} RETURN a`
        cypherCommand(cmd, {valueParam: fieldValue});
      } else if (isArray(fieldValue)) {
        fieldValue.forEach( (v, i) => {
          if (v.sys && v.sys.type) {
            storeRelationship( {id: entry.sys.id, otherId: v.sys.id, relation: fieldName, order: i  } )    
          } else {
            // This will fail if we ever see an array of primitive types
            console.log ( fieldName + ' is an array of unhandled type ' + typeof(v))
          } 
        });
      } else if (fieldValue.sys && fieldValue.sys.type) {
        storeRelationship( {id: entry.sys.id, otherId: fieldValue.sys.id, relation: fieldName } )
      } else {
        console.log('UNKNOWN FIELD: ' + fieldName + ' ' + typeof(fieldValue) );
      }
    });
  });

  if ((skip + limit) <=  entries.total) {
    fetchEntries(skip + limit, limit);
  } else {
    next()
  }
}

const processRelationships = (next = finish) => {
  console.log("We found " +  relationships.length + " relationships")

  relationships.forEach( relationship => {
    if (relationship.order) {
      let cmd1 = `MATCH (a {cmsid: '${relationship.id}'}), (b {cmsid: '${relationship.otherId}'} ) CREATE (a) -[r:${relationship.relation} {order: ${relationship.order}} ]-> (b)`;
      cypherCommand(cmd1);
    } else {
      let cmd = `MATCH (a {cmsid: '${relationship.id}'}), (b {cmsid: '${relationship.otherId}'} ) CREATE (a) -[r:${relationship.relation}]-> (b)`;
      cypherCommand(cmd);
    }
  });

  next();
}

const finish = () => {
  transaction.commit().then(
    () => {
      session.close( () => {
        console.log("Done");
        driver.close();
      });
  });
}

const fetchAssets = (limit, skip = 0) => {  
  client.getAssets({
    skip: skip,
    limit: limit,
    order: 'sys.createdAt'
  })
  .then( assets => processAssets(assets, skip, limit) );  
}

const fetchEntries = (limit, skip = 0) => { 
  client.getEntries({
    skip: skip,
    limit: limit,
    order: 'sys.createdAt'
  })
  .then(entries => processEntries(entries, skip, limit)); 
}
 
fetchAssets(contentfulBatchSize);
