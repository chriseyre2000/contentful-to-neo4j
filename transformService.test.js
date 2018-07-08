import mockNeo4jServiceFactory from "./mocks/mockNeo4jService";
import mockContentfulServiceFactory from "./mocks/mockContentfulService";
import transformServiceFactory from "./transformService"

const contentfulBatchSize = 10;

test("If contentful is empty then nothing is sent to the db", (done) => {

  const contentfulService = mockContentfulServiceFactory();
  const neo4jService = mockNeo4jServiceFactory();

  contentfulService.getAssets.mockReturnValue(new Promise(() => contentfulService.emptyResult));
  contentfulService.getEntries.mockReturnValue(new Promise(() => contentfulService.emptyResult));
  neo4jService.finish.mockReturnValue(new Promise(() => {
    done();
  }));
  const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize);

  transformService.copyContentfulSpaceToNeo4j();

  expect(contentfulService.getAssets.mock.calls.length).toEqual(1);
});

test("processRelationships ", () => {
  //Given
  const contentfulService = mockContentfulServiceFactory();
  const neo4jService = mockNeo4jServiceFactory();

  contentfulService.getAssets.mockReturnValue(new Promise(() => contentfulService.emptyResult));
  contentfulService.getEntries.mockReturnValue(new Promise(() => contentfulService.emptyResult));

  const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize);

  const relationshipSimple = {
    id: "first-id",
    otherId: "other-id",
    relation: "assetField"
  };

  const relationshipOrdered = {
    id: 'this',
    otherId: 'that',
    relation: 'maps',
    order: 7
  };

  transformService.storeRelationship(relationshipSimple);
  transformService.storeRelationship(relationshipOrdered);

  //When
  transformService.processRelationships();

  //Then
  expect(neo4jService.cypherCommand.mock.calls.length).toBe(2);
});

test("process fetch assets", () => {

  //Given
  const contentfulService = mockContentfulServiceFactory();
  const neo4jService = mockNeo4jServiceFactory();

  contentfulService.getAssets.mockReturnValue(new Promise(() => contentfulService.emptyResult));
  contentfulService.getEntries.mockReturnValue(new Promise(() => contentfulService.emptyResult));

  const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize);

  //when/then

  transformService.fetchAssets(0)

});


