import { 
    processAssets, 
    processEntries, 
    storeRelationship, 
    processRelationships
  } from './contentfulProcessing';

const transformServiceFactory = (contentful, neo4j) => {

    const fetchAssets = (limit, skip) => {  
        contentful.getAssets(limit, skip)
        .then( assets => processAssets(neo4j, assets, skip, limit, fetchAssets, fetchEntries) );  
    };

    const fetchEntries = (limit, skip) => { 
        contentful.getEntries(limit, skip)
        .then(entries => processEntries(neo4j, entries, skip, limit, storeRelationship, fetchEntries, processRelationships)); 
    }   

    return {
        fetchAssets,
        fetchEntries, 
    }
};

export default transformServiceFactory;