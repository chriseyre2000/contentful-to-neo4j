import mockNeo4jServiceFactory from "./mocks/mockNeo4jService";
import mockContentfulServiceFactory from "./mocks/mockContentfulService";
import transformServiceFactory from "./transformService"

// We can now test the service from the outside.

test('If contentful is empty then nothing is sent to the db', (done) => {
  
  const contentfulService = mockContentfulServiceFactory();
  const neo4jService = mockNeo4jServiceFactory();
  
  contentfulService.getAssets.mockReturnValue( new Promise(() => contentfulService.emptyResult) );
  contentfulService.getEntries.mockReturnValue( new Promise(() => contentfulService.emptyResult) );
  neo4jService.finish.mockReturnValue( new Promise( () => {
    done();
  } ));
  const transformService = transformServiceFactory(contentfulService, neo4jService);

  transformService.copyContentfulSpaceToNeo4j(10);

  expect(contentfulService.getAssets.mock.calls.length).toEqual(1);
} );


