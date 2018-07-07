function isArray(arr) {
    return arr instanceof Array;
}

function isPrimitiveNonString(value) {
  return (typeof(value) == "number") || (typeof(value) == "boolean")
}

const transformServiceFactory = (contentful, neo4j) => {

    let relationships = [];

    const storeRelationship = (data) => {
        relationships.push(data)
    }

    const processRelationships = () => {
        console.log("We found " +  relationships.length + " relationships")
      
          relationships.forEach( relationship => {
            if (relationship.order) {
              let cmd1 = `MATCH (a {cmsid: '${relationship.id}'}), (b {cmsid: '${relationship.otherId}'} ) CREATE (a) -[r:${relationship.relation} {order: ${relationship.order}} ]-> (b)`;
              neo4j.cypherCommand(cmd1);
            } else {
              let cmd = `MATCH (a {cmsid: '${relationship.id}'}), (b {cmsid: '${relationship.otherId}'} ) CREATE (a) -[r:${relationship.relation}]-> (b)`;
              neo4j.cypherCommand(cmd);
            }
          });
      
          neo4j.finish();
      }
    
    const fetchAssets = (limit, skip) => {
        contentful.getAssets(limit, skip)
        .then( assets => processAssets(assets, skip, limit) );  
    };

    const fetchEntries = (limit, skip) => { 
        contentful.getEntries(limit, skip)
        .then(entries => processEntries(entries, skip, limit)); 
    }   

    const processAssets = (assets, skip, limit) => {

        assets.items.forEach( (asset) => {
            neo4j.cypherCommand(`CREATE (a:asset {cmsid: '${asset.sys.id}', cmstype: '${asset.sys.type}', title: {titleParam}, url: '${asset.fields.file.url}'} ) RETURN a`, {titleParam: asset.fields.title})
        });

        if ((skip + limit) < assets.total) {
           fetchAssets(limit, skip + limit);
        }
        else {
          fetchEntries(limit, 0);
        }
    }

    const processEntries = (entries, skip, limit) => {
        console.log("Entries:", entries.items.length);
    
        entries.items.forEach( (entry) =>  {
    
          // Bare entry
          const cmd = `CREATE (a:${entry.sys.contentType.sys.id} {cmsid: '${entry.sys.id}', contenttype: '${entry.sys.contentType.sys.id}', cmstype: '${entry.sys.type}'} ) RETURN a`;
          neo4j.cypherCommand(cmd);
    
          // Work on fields and relationships
          const fields = entry.fields;
    
          Object.keys(fields).forEach( (fieldName) => {
    
            let fieldValue = fields[fieldName];
    
            if ( isPrimitiveNonString(fieldValue) ) {
              let cmd = `MATCH (a {cmsid: '${entry.sys.id}'}) SET a.${fieldName} = ${ fieldValue } RETURN a`
              neo4j.cypherCommand(cmd);
            } else if ( typeof(fieldValue) == "string" ) {
              let cmd = `MATCH (a {cmsid: '${entry.sys.id}'}) SET a.${fieldName} = {valueParam} RETURN a`
              neo4j.cypherCommand(cmd, {valueParam: fieldValue});
            } else if (isArray(fieldValue)) {
              let collection = [];
              fieldValue.forEach( (v, i) => {
                if (v.sys && v.sys.type) {
                  storeRelationship( {id: entry.sys.id, otherId: v.sys.id, relation: fieldName, order: i  } )
                } else {
                  collection.push( '"' + v.toString() + '"');
                  // This will fail if we ever see an array of primitive types
                  //console.log ( fieldName + ' is an array of unhandled type ' + typeof(v))
                }
              });
    
              if (collection.length > 0) {
                let cmd = `MATCH (a {cmsid: '${entry.sys.id}'}) SET a.${fieldName} = [${ collection.join(",") }] RETURN a`
                neo4j.cypherCommand(cmd);
              }
    
            } else if (fieldValue.sys && fieldValue.sys.type) {
              storeRelationship( {id: entry.sys.id, otherId: fieldValue.sys.id, relation: fieldName } )
            } else {
              console.log('UNKNOWN FIELD: ' + fieldName + ' ' + typeof(fieldValue) );
            }
          });
        });
    
        if ((skip + limit) <  entries.total) {
            fetchEntries(limit, skip + limit);
        } else {
          processRelationships();
        }
    }
    

    const copyContentfulSpaceToNeo4j = (batchSize) => {
        fetchAssets(batchSize, 0);
    }

    return {
        copyContentfulSpaceToNeo4j,
        // The following are exposed for testing
        processAssets,
        processEntries,
        processRelationships,
        storeRelationship 
    }
};

export default transformServiceFactory;