import { 
  processAssets, 
  processEntries, 
  storeRelationship, 
  processRelationships
} from './contentfulProcessing';

import config from './config';
import contentfulService from './contentfulService';
import neo4jService from "./neo4jService";

// const fetch = require('node-fetch');
// // This is a polyfill for "Headers is not defined"  
// global.Headers = fetch.Headers;

const cypherCommand = neo4jService.cypherCommand;

neo4jService.emptyGraphDatabase();

const finish = neo4jService.finish;

const fetchAssets = (limit, skip = 0) => {  
  contentfulService.getAssets(limit, skip)
  .then( assets => processAssets(assets, skip, limit, cypherCommand, fetchAssets, fetchEntries) );  
}

const fetchEntries = (limit, skip = 0) => { 
  contentfulService.getEntries(limit, skip)
  .then(entries => processEntries(entries, skip, limit, cypherCommand, storeRelationship, fetchEntries, processRelationships, finish)); 
}
 
fetchAssets(config.contentful.batchSize);
