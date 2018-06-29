import { createClient } from 'contentful'

// This is a polyfill for "Headers is not defined"  
const fetch = require('node-fetch');
global.Headers = fetch.Headers;

const neo4j = require('neo4j-driver').v1;

function isArray(arr) {
  return arr instanceof Array;
}

const client = createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: process.env.SPACE_ID,
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});

const uri = process.env.NEO4J_SERVER || 'bolt://localhost'; 
const user = process.env.NEO4j_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

const cypherCommand = ( session, cmd, params ) => {
  const resultPromise = session.run(cmd, params);

  resultPromise.then( result => {
    //console.log('+');
  }).catch( e => {
    console.log(e);
  } );
}

// Empty the graph
cypherCommand(session, "MATCH (a)-[m]-(b) DELETE m");
cypherCommand(session, "MATCH (a) DELETE a");

let relationships = [];

// create assets

const processAssets = (assets) => {
  console.log("Assets:", assets.items.length)

  assets.items.forEach( (asset) => {
    cypherCommand(session, `CREATE (a:asset {cmsid: '${asset.sys.id}', cmstype: '${asset.sys.type}', title: '${asset.fields.title}', url: '${asset.fields.file.url}'} ) RETURN a`)
  });
}

const processEntries = (entries) => {
  console.log("Entries:", entries.items.length)
  
  entries.items.forEach( (entry) =>  {
  
    // Bare entry
    const cmd = `CREATE (a:${entry.sys.contentType.sys.id} {cmsid: '${entry.sys.id}', cmstype: '${entry.sys.type}'} ) RETURN a`;
    cypherCommand(session, cmd);

    // Work on fields and relationships
    const fields = entry.fields;

    Object.keys(fields).forEach( (fieldName) => {

      let fieldValue = fields[fieldName];

      if ( typeof(fieldValue) == "number" ) {
        let cmd = `MATCH (a {cmsid: '${entry.sys.id}'}) SET a.${fieldName} = ${ fieldValue } RETURN a`
        cypherCommand(session, cmd);
      } else if ( typeof(fieldValue) == "string" ) {
        let cmd = `MATCH (a {cmsid: '${entry.sys.id}'}) SET a.${fieldName} = {valueParam} RETURN a`
        cypherCommand(session, cmd, {valueParam: fieldValue});
      } else if (isArray(fieldValue)) {
        fieldValue.forEach( (v, i) => {
          if (v.sys && v.sys.type) {
            relationships.push( {id: entry.sys.id, otherId: v.sys.id, relation: fieldName, order: i  } )    
          } else {
            // This will fail if we ever see an array of primitive types
            console.log ( fieldName + ' is an array of unhandled type ' + typeof(v))
          } 
        });
      } else if (fieldValue.sys && fieldValue.sys.type) {
        relationships.push( {id: entry.sys.id, otherId: fieldValue.sys.id, relation: fieldName } )
      } else {
        console.log('UNKNOWN FIELD: ' + fieldName + ' ' + typeof(fieldValue) );
      }
    });
  });

    // Run this after the nodes have been created.
    setTimeout( processRelationships, 0); 
  }

  const processRelationships = () => {
    console.log("We found " +  relationships.length + " relationships")
  
    relationships.forEach( relationship => {
      if (relationship.order) {
        let cmd1 = `MATCH (a {cmsid: '${relationship.id}'}), (b {cmsid: '${relationship.otherId}'} ) CREATE (a) -[r:${relationship.relation} {order: ${relationship.order}} ]-> (b)`;
        cypherCommand(session, cmd1);
      } else {
        let cmd = `MATCH (a {cmsid: '${relationship.id}'}), (b {cmsid: '${relationship.otherId}'} ) CREATE (a) -[r:${relationship.relation}]-> (b)`;
        cypherCommand(session, cmd);
      }
       
    })
         
  }

//TODO: implement paging once we have a space with > 1000 assets
client.getAssets({
  skip: 0,
  limit: 1000,
  order: 'sys.createdAt'
})
.then(processAssets);

// create entries
//TODO: implement paging when we have a space with > 1000 entries
client.getEntries({
  skip: 0,
  limit: 1000,
  order: 'sys.createdAt'
})
.then(processEntries);

 