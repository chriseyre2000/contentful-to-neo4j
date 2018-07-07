
import config from './config';
import contentfulService from './contentfulService';
import neo4jService from "./neo4jService";
import transformServiceFactory from "./transformService";

// const fetch = require('node-fetch');
// // This is a polyfill for "Headers is not defined"  
// global.Headers = fetch.Headers;

neo4jService.emptyGraphDatabase();

const transformService = transformServiceFactory(contentfulService, neo4jService);
 
transformService.fetchAssets(config.contentful.batchSize, 0);


