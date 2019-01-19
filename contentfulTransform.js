function isArray(arr) {
    return arr instanceof Array;
}

function isPrimitiveNonString(value) {
  return (typeof(value) == "number") || (typeof(value) == "boolean")
}

function processAsset(neo4j, asset) {
    neo4j.cypherCommand(`CREATE (a:asset {cmsid: '${asset.sys.id}', cmstype: '${asset.sys.type}', title: {titleParam}, url: '${asset.fields.file.url}'} ) RETURN a`, { titleParam: asset.fields.title });
}

function processEntry(neo4j, storeRelationship, entry, log) {
    //Neo4j will not allow a hyphen in a label name
    const cmd = `CREATE (a:type_${entry.sys.contentType.sys.id.replace(/-/g,"")} {cmsid: '${entry.sys.id}', contenttype: '${entry.sys.contentType.sys.id}', cmstype: '${entry.sys.type}'} ) RETURN a`;
    neo4j.cypherCommand(cmd);
    // Work on fields and relationships
    const fields = entry.fields;
    Object.keys(fields).forEach((fieldName) => {
        let fieldValue = fields[fieldName];
        if (isPrimitiveNonString(fieldValue)) {
            let cmd = `MATCH (a {cmsid: '${entry.sys.id}'}) SET a.${fieldName} = ${fieldValue} RETURN a`;
            neo4j.cypherCommand(cmd);
        }
        else if (typeof (fieldValue) == "string") {
            let cmd = `MATCH (a {cmsid: '${entry.sys.id}'}) SET a.${fieldName} = {valueParam} RETURN a`;
            neo4j.cypherCommand(cmd, { valueParam: fieldValue });
        }
        else if (isArray(fieldValue)) {
            let collection = [];
            let params = {};
            fieldValue.forEach((v, i) => {
                if (v.sys && v.sys.type) {
                    storeRelationship({ id: entry.sys.id, otherId: v.sys.id, relation: fieldName, order: i });
                }
                else {
                    params[`${i}`] = v;
                    collection.push(`{${i}}`);
                }
            });
            if (collection.length > 0) {
                let cmd = `MATCH (a {cmsid: '${entry.sys.id}'}) SET a.${fieldName} = [${collection.join(",")}] RETURN a`;
                neo4j.cypherCommand(cmd, params);
            }
        }
        else if (fieldValue.sys && fieldValue.sys.type) {
            storeRelationship({ id: entry.sys.id, otherId: fieldValue.sys.id, relation: fieldName });
        }
        else {
            log('UNKNOWN FIELD: ' + fieldName + ' ' + typeof (fieldValue));
        }
    });
}

function processRelationship(neo4j, relationship) {
    if (relationship.hasOwnProperty("order")) {
        let cmd1 = `MATCH (a {cmsid: '${relationship.id}'}), (b {cmsid: '${relationship.otherId}'} ) CREATE (a) -[r:${relationship.relation} {order: ${relationship.order}}]-> (b)`;
        neo4j.cypherCommand(cmd1);
    }
    else {
        let cmd = `MATCH (a {cmsid: '${relationship.id}'}), (b {cmsid: '${relationship.otherId}'} ) CREATE (a) -[r:${relationship.relation}]-> (b)`;
        neo4j.cypherCommand(cmd);
    }
}

export { processAsset, processEntry, processRelationship }