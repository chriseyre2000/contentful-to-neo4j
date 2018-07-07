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

neo4jService.emptyGraphDatabase();

const fetchAssets = (limit, skip = 0) => {  
  contentfulService.getAssets(limit, skip)
  .then( assets => processAssets(neo4jService, assets, skip, limit, fetchAssets, fetchEntries) );  
}

const fetchEntries = (limit, skip = 0) => { 
  contentfulService.getEntries(limit, skip)
  .then(entries => processEntries(neo4jService, entries, skip, limit, storeRelationship, fetchEntries, processRelationships)); 
}
 
fetchAssets(config.contentful.batchSize);
