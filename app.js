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

const uri =  'bolt://localhost'; 
const user = 'neo4j';
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

let relationships = [];

cypherCommand(session, "MATCH (a)-[m]-(b) DELETE m");
cypherCommand(session, "MATCH (a) DELETE a");

// create assets

//TODO: implement paging once we have a space with > 1000 assets
client.getAssets({
  skip: 0,
  limit: 1000,
  order: 'sys.createdAt'
})
.then((assets) => {
  console.log("Assets:", assets.items.length)

    const assetDetails = assets.items.forEach( (v) => {
    //  console.log('.');
      cypherCommand(session, `CREATE (a:asset {cmsid: '${v.sys.id}', cmstype: '${v.sys.type}', title: '${v.fields.title}', url: '${v.fields.file.url}'} ) RETURN a`)
    });
  }
);

// create entries

//TODO: implement paging when we have a space with > 1000 entries
client.getEntries({
  skip: 0,
  limit: 1000,
  order: 'sys.createdAt'
})
.then(
  (entries) => {
    console.log("Entries:", entries.items.length)
    
    const firstItemFields = entries.items[0].fields;  

    entries.items.forEach( (e, i) =>  {
      
      // Bare entry
      const cmd = `CREATE (a:${e.sys.contentType.sys.id} {cmsid: '${e.sys.id}', cmstype: '${e.sys.type}'} ) RETURN a`;
      //console.log("Entry: " + cmd );
      cypherCommand(session, cmd);

      // Work on fields and relationships
      const fields = e.fields;

      Object.keys(fields).forEach( (f) => {
        if ( typeof(fields[f]) == "number" ) {
          let cmd = `MATCH (a {cmsid: '${e.sys.id}'}) SET a.${f} = ${ fields[f] } RETURN a`
          cypherCommand(session, cmd);
        } else if ( typeof(fields[f]) == "string" ) {
            let cmd = `MATCH (a {cmsid: '${e.sys.id}'}) SET a.${f} = {valueParam} RETURN a`
            //console.log("String field: ", cmd);
            cypherCommand(session, cmd, {valueParam: fields[f]});
        } else {
          // Now handle the complex types:
          let fieldValue = fields[f];
          
          if (isArray(fieldValue)) {
            fieldValue.forEach( v => {
              if (v.sys && v.sys.type == "Asset") {
                relationships.push( {id: e.sys.id, otherId: v.sys.id, relation: f } )    
              } else if ( v.sys && v.sys.type == "Entry" ) {
                relationships.push( {id: e.sys.id, otherId: v.sys.id, relation: f } )    
              } else {
                console.log ( f + ' is an array of unhandled type ' + typeof(v))
              } 
            });
          } else if (fieldValue.sys && fieldValue.sys.type == "Asset") {
            relationships.push( {id: e.sys.id, otherId: fieldValue.sys.id, relation: f } )
          } else if (fieldValue.sys && fieldValue.sys.type == "Entry") {
            relationships.push( {id: e.sys.id, otherId: fieldValue.sys.id, relation: f } )
          } else {
            console.log('UNKNOWN FIELD: ' + f + ' ' + typeof(fieldValue) );
            if ( f == "course") {
                  console.log( JSON.stringify(fieldValue) );
            }
          }
        }     
      });

    });

     // Run this after the nodes have been created.
     setTimeout( () => {
         console.log("We found " +  relationships.length + " relationships")

         relationships.forEach( r => {
           const cmd = `MATCH (a {cmsid: '${r.id}'}), (b {cmsid: '${r.otherId}'} ) CREATE (a) -[r:${r.relation}]-> (b)`;

          // console.log(cmd);
           cypherCommand(session, cmd); 
         })
              
      }, 0); 

   }
 );

