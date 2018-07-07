import { storeRelationship, processRelationships  } from './contentfulProcessing';
import mockNeo4jServiceFactory from "./mocks/mockNeo4jService";

test('If No Stored Relationship then processRelationships does no call db', () => {
  
  const neo4jService = mockNeo4jServiceFactory();
  
  const mockDBCommand = neo4jService.cypherCommand;
  const mockFinish = neo4jService.finish;

  processRelationships(neo4jService)

  expect(mockDBCommand.mock.calls.length).toBe(0);
  expect(mockFinish.mock.calls.length).toBe(1);
} );

test('Stored Relationships get passed to the db', () => {

  const neo4jService = mockNeo4jServiceFactory();

  storeRelationship( {order: 1, id: "first", otherId: "second", relation: "uses"} );
  storeRelationship( { id: "third", otherId: "fourth", relation: "breaks"} );

  const mockDBCommand = neo4jService.cypherCommand;
  const mockFinish = neo4jService.finish;

  processRelationships(neo4jService);
  expect(mockDBCommand.mock.calls.length).toBe(2);
  expect(mockDBCommand.mock.calls[0][0]).toBe("MATCH (a {cmsid: 'first'}), (b {cmsid: 'second'} ) CREATE (a) -[r:uses {order: 1} ]-> (b)");
  expect(mockDBCommand.mock.calls[1][0]).toBe("MATCH (a {cmsid: 'third'}), (b {cmsid: 'fourth'} ) CREATE (a) -[r:breaks]-> (b)");
  expect(mockFinish.mock.calls.length).toBe(1);

});
