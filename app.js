import { createClient } from 'contentful';
import { 
  processAssets, 
  processEntries, 
  storeRelationship, 
  processRelationships
} from './contentfulProcessing';

import config from './config';

const fetch = require('node-fetch');

// This is a polyfill for "Headers is not defined"  
global.Headers = fetch.Headers;

const neo4j = require('neo4j-driver').v1;

const contentfulClient = createClient({
  space: config.contentful.spaceId,
  // This is the access token for this space.
  accessToken: config.contentful.accessToken,
  resolveLinks: false,
});

const driver = neo4j.driver(config.neo4j.uri, neo4j.auth.basic(config.neo4j.user, config.neo4j.password));
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

const fetchAssets = (limit, skip = 0) => {  
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
 
fetchAssets(config.contentful.batchSize);
