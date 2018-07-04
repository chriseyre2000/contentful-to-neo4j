import { createClient } from 'contentful';
import { 
  processAssets, 
  processEntries, 
  storeRelationship, 
  processRelationships, 
  afterProcessAssets  } from './contentfulProcessing';

// This is a polyfill for "Headers is not defined"  
const fetch = require('node-fetch');
global.Headers = fetch.Headers;

const neo4j = require('neo4j-driver').v1;

const contentfulClient = createClient({
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

const finish = () => {
  transaction.commit().then(
    () => {
      session.close( () => {
        console.log("Done");
        driver.close();
      });
  });
}

const fetchAssets = (client, limit, skip = 0) => {  
  contentfulClient.getAssets({
    skip: skip,
    limit: limit,
    order: 'sys.createdAt'
  })
  .then( assets => processAssets(assets, skip, limit, cypherCommand, fetchAssets, fetchEntries) );  
}

const fetchEntries = (limit, skip = 0) => { 
  contentfulClient.getEntries({
    skip: skip,
    limit: limit,
    order: 'sys.createdAt'
  })
  .then(entries => processEntries(entries, skip, limit, cypherCommand, storeRelationship, fetchEntries, processRelationships, finish)); 
}
 
fetchAssets(contentfulBatchSize);
