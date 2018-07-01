function isArray(arr) {
    return arr instanceof Array;
}

const processAssets = (assets, skip, limit, dbCommand, currentFetch, nextFetch) => {
    
    console.log("Assets:", assets.items.length)
  
    assets.items.forEach( (asset) => {
      dbCommand(`CREATE (a:asset {cmsid: '${asset.sys.id}', cmstype: '${asset.sys.type}', title: '${asset.fields.title}', url: '${asset.fields.file.url}'} ) RETURN a`)
    });
  
    if ((skip + limit) <= assets.total) {
      currentFetch(skip + limit, limit);
    } else {
      nextFetch(limit);
    }
  }

  const processEntries = (entries, skip, limit, dbCommand, recordRelationship, currentFetch, nextProcess, endProcess) => {
    console.log("Entries:", entries.items.length);
    
    entries.items.forEach( (entry) =>  {
    
      // Bare entry
      const cmd = `CREATE (a:${entry.sys.contentType.sys.id} {cmsid: '${entry.sys.id}', contenttype: '${entry.sys.contentType.sys.id}', cmstype: '${entry.sys.type}'} ) RETURN a`;
      dbCommand(cmd);
  
      // Work on fields and relationships
      const fields = entry.fields;
  
      Object.keys(fields).forEach( (fieldName) => {
  
        let fieldValue = fields[fieldName];
  
        if ( typeof(fieldValue) == "number" ) {
          let cmd = `MATCH (a {cmsid: '${entry.sys.id}'}) SET a.${fieldName} = ${ fieldValue } RETURN a`
          dbCommand(cmd);
        } else if ( typeof(fieldValue) == "string" ) {
          let cmd = `MATCH (a {cmsid: '${entry.sys.id}'}) SET a.${fieldName} = {valueParam} RETURN a`
          dbCommand(cmd, {valueParam: fieldValue});
        } else if (isArray(fieldValue)) {
          fieldValue.forEach( (v, i) => {
            if (v.sys && v.sys.type) {
              recordRelationship( {id: entry.sys.id, otherId: v.sys.id, relation: fieldName, order: i  } )    
            } else {
              // This will fail if we ever see an array of primitive types
              console.log ( fieldName + ' is an array of unhandled type ' + typeof(v))
            } 
          });
        } else if (fieldValue.sys && fieldValue.sys.type) {
          recordRelationship( {id: entry.sys.id, otherId: fieldValue.sys.id, relation: fieldName } )
        } else {
          console.log('UNKNOWN FIELD: ' + fieldName + ' ' + typeof(fieldValue) );
        }
      });
    });
  
    if ((skip + limit) <=  entries.total) {
      currentFetch(skip + limit, limit);
    } else {
      //Call process relationships  
      nextProcess(dbCommand, endProcess)
    }
  }

  let relationships = [];
  
  const storeRelationship = (data) => {
    relationships.push(data)
  } 
  
  
  const processRelationships = (dbCommand, finish) => {
    console.log("We found " +  relationships.length + " relationships")
  
    relationships.forEach( relationship => {
      if (relationship.order) {
        let cmd1 = `MATCH (a {cmsid: '${relationship.id}'}), (b {cmsid: '${relationship.otherId}'} ) CREATE (a) -[r:${relationship.relation} {order: ${relationship.order}} ]-> (b)`;
        dbCommand(cmd1);
      } else {
        let cmd = `MATCH (a {cmsid: '${relationship.id}'}), (b {cmsid: '${relationship.otherId}'} ) CREATE (a) -[r:${relationship.relation}]-> (b)`;
        dbCommand(cmd);
      }
    });
  
    finish();
  }

export { processAssets, processEntries, storeRelationship, processRelationships }  