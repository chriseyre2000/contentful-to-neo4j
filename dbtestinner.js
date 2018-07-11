import neo4j from './neo4jService';

neo4j.cypherCommand("MATCH (a) RETURN a");
// neo4j.cypherCommand("MATCH (a) RETURN b");
// neo4j.cypherCommand("BAD COMMAND");

neo4j.finish();