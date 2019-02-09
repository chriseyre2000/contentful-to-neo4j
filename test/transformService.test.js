import mockNeo4jServiceFactory from "../mocks/mockNeo4jService";
import mockContentfulServiceFactory, { entryFactory, assetFactory, assetFieldFactory} from "../mocks/mockContentfulService";
import transformServiceFactory from "../src/transformService";
import mockLogFactory from "../mocks/mockLogService";
import mockSystemServiceFactory from "../mocks/mockSystemService";

const contentfulBatchSize = 10;

test("If contentful is empty then nothing is sent to the db", (done) => {

  const contentfulService = mockContentfulServiceFactory();
  const neo4jService = mockNeo4jServiceFactory();
  const log = mockLogFactory();
  const systemService = mockSystemServiceFactory();

  contentfulService.getAssets.mockReturnValue( Promise.resolve(contentfulService.emptyResult));
  contentfulService.getEntries.mockReturnValue( Promise.resolve(contentfulService.emptyResult));
  
  const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize, log, systemService);

  transformService.copyContentfulSpaceToNeo4j();

  setTimeout( () => {

    expect(contentfulService.getAssets.mock.calls.length).toEqual(1);
    expect(contentfulService.getEntries.mock.calls.length).toEqual(1);
    expect(neo4jService.cypherCommand.mock.calls.length).toEqual(0);

    done();
  }, 
  1);
});

test("Can call multiple batches of assets and entries", (done) => {

  const contentfulService = mockContentfulServiceFactory();
  const neo4jService = mockNeo4jServiceFactory();
  const log = mockLogFactory();
  const systemService = mockSystemServiceFactory();

  const assetResult = Promise.resolve({total: 1001, items: []});
  const entryResult = Promise.resolve({total: 21, items: []});

  contentfulService.getAssets.mockReturnValue( assetResult);
  contentfulService.getEntries.mockReturnValue( entryResult );
  
  const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize, log, systemService);

  transformService.copyContentfulSpaceToNeo4j();

  setTimeout( () => {

    expect(contentfulService.getAssets.mock.calls.length).toEqual(2);
    expect(contentfulService.getAssets.mock.calls[0]).toEqual([1000, 0]);
    expect(contentfulService.getAssets.mock.calls[1]).toEqual([1000, 1000]);
    expect(contentfulService.getEntries.mock.calls.length).toEqual(3);
    expect(contentfulService.getEntries.mock.calls[0]).toEqual([10, 0]);
    expect(contentfulService.getEntries.mock.calls[1]).toEqual([10, 10]);
    expect(contentfulService.getEntries.mock.calls[2]).toEqual([10, 20]);
    expect(neo4jService.cypherCommand.mock.calls.length).toEqual(0);

    done();
  }, 
  1);
});

test('Check Process Empty Assets Calls Entries', (done) => {
  
  const contentfulService = mockContentfulServiceFactory();
  const neo4jService = mockNeo4jServiceFactory();
  const log = mockLogFactory();
  const systemService = mockSystemServiceFactory();

  contentfulService.getAssets.mockReturnValue( Promise.resolve(contentfulService.emptyResult) );
  
  contentfulService.getEntries.mockReturnValue( Promise.resolve(contentfulService.emptyResult) );
  
  const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize, log, systemService);

  transformService.copyContentfulSpaceToNeo4j();

  setTimeout( () => {
    expect(contentfulService.getEntries.mock.calls.length).toEqual(1);
    done();
  }, 1);
});

test("If contentful is empty then nothing is sent to the db", (done) => {

  const contentfulService = mockContentfulServiceFactory();
  const neo4jService = mockNeo4jServiceFactory();
  const log = mockLogFactory();
  const systemService = mockSystemServiceFactory();

  contentfulService.getAssets.mockReturnValue( Promise.resolve(contentfulService.emptyResult));
  contentfulService.getEntries.mockReturnValue( Promise.resolve(contentfulService.emptyResult));
  
  const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize, log, systemService);

  transformService.copyContentfulSpaceToNeo4j();

  setTimeout( () => {

    expect(contentfulService.getAssets.mock.calls.length).toEqual(1);
    expect(contentfulService.getEntries.mock.calls.length).toEqual(1);
    expect(neo4jService.cypherCommand.mock.calls.length).toEqual(0);

    done();
  }, 
  1);
});


test("processRelationships", (done) => {
  //Given
  const contentfulService = mockContentfulServiceFactory();
  const neo4jService = mockNeo4jServiceFactory();
  const log = mockLogFactory();
  const systemService = mockSystemServiceFactory();

  const asset1 = assetFactory("asset-id-1", "asset-title1", "//asset.url.1");
  const asset2 = assetFactory("asset-id-2", "asset-title2", "//asset.url.2");

  const assets = {
    total: 0,
    items: [
      asset1, 
      asset2
    ],
  }

  const entry = entryFactory("content-type-1", "content-type-id-1", {
    assetField: assetFieldFactory("asset-id-1"),

    arrayField: [
      assetFieldFactory("asset-id-1"),
      assetFieldFactory("asset-id-2") 
    ],
  });

  const entries = {
    total: 1,
    items: [
      entry, 
    ],
  }

  contentfulService.getAssets.mockReturnValue(Promise.resolve(assets));
  contentfulService.getEntries.mockReturnValue(Promise.resolve(entries));

  const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize, log, systemService);

  transformService.copyContentfulSpaceToNeo4j();

  //Then
  setTimeout( () => {
    expect(neo4jService.cypherCommand.mock.calls.length).toBe(6);

    expect(neo4jService.cypherCommand.mock.calls[0][0]).toEqual("CREATE (a:asset {cmsid: 'asset-id-1', cmstype: 'Asset', title: {titleParam}, url: '//asset.url.1'} ) RETURN a");
    expect(neo4jService.cypherCommand.mock.calls[1][0]).toEqual("CREATE (a:asset {cmsid: 'asset-id-2', cmstype: 'Asset', title: {titleParam}, url: '//asset.url.2'} ) RETURN a");
    expect(neo4jService.cypherCommand.mock.calls[2][0]).toEqual("CREATE (a:type_contenttype1 {cmsid: 'content-type-id-1', contenttype: 'content-type-1', cmstype: 'Entry'} ) RETURN a");
    expect(neo4jService.cypherCommand.mock.calls[3][0]).toEqual("MATCH (a {cmsid: 'content-type-id-1'}), (b {cmsid: 'asset-id-1'} ) CREATE (a) -[r:assetField]-> (b)");
     expect(neo4jService.cypherCommand.mock.calls[4][0]).toEqual("MATCH (a {cmsid: 'content-type-id-1'}), (b {cmsid: 'asset-id-1'} ) CREATE (a) -[r:arrayField {order: 0}]-> (b)");
    expect(neo4jService.cypherCommand.mock.calls[5][0]).toEqual("MATCH (a {cmsid: 'content-type-id-1'}), (b {cmsid: 'asset-id-2'} ) CREATE (a) -[r:arrayField {order: 1}]-> (b)");

    done();
  }, 1);

});

test("process entries", (done) => {

  //Given
  const contentfulService = mockContentfulServiceFactory();
  const neo4jService = mockNeo4jServiceFactory();
  const log = mockLogFactory();
  const systemService = mockSystemServiceFactory();

  const entries = {
    total: 1,
    items: [
      entryFactory("content-type-this", "this-id", {})
    ]
  };

  contentfulService.getAssets.mockReturnValue(Promise.resolve( contentfulService.emptyResult));
  contentfulService.getEntries.mockReturnValue(Promise.resolve(entries));

  const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize, log, systemService);


  //when
  transformService.copyContentfulSpaceToNeo4j();

  setTimeout( () => {
    expect(log.mock.calls.length).toEqual(7);
    expect(log.mock.calls[0][0]).toEqual("fetch Assets 0");
    expect(log.mock.calls[1][0]).toEqual("Assets: 0 of 0 0");
    expect(log.mock.calls[2][0]).toEqual("processAssets 0 1000 0");
    expect(log.mock.calls[3][0]).toEqual("fetch Entries 0 10");
    expect(log.mock.calls[4][0]).toEqual("Entries: 1 of 1 0");
    expect(log.mock.calls[5][0]).toEqual("processEntries 0 10 1");
    expect(log.mock.calls[6][0]).toEqual("We found 0 relationships");

    expect(neo4jService.cypherCommand.mock.calls.length).toEqual(1);
    done();
  }, 1);

});

test("Get Assets fails", (done) => {

  //Given
  const contentfulService = mockContentfulServiceFactory();
  const neo4jService = mockNeo4jServiceFactory();
  const log = mockLogFactory();
  const systemService = mockSystemServiceFactory();

  contentfulService.getAssets.mockRejectedValue("Because");

  const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize, log, systemService);

  transformService.copyContentfulSpaceToNeo4j();

  setTimeout( () => {
    expect(log.mock.calls.length).toEqual(2);
    expect(log.mock.calls[0][0]).toEqual("fetch Assets 0");
    expect(log.mock.calls[1][0]).toEqual("Fetch assets failed with Because at skip 0");
    expect(systemService.systemExit.mock.calls.length).toEqual(1);
    done();
  }, 
  1);

});

test("Get Entries fails", (done) => {

  //Given
  const contentfulService = mockContentfulServiceFactory();
  const neo4jService = mockNeo4jServiceFactory();
  const log = mockLogFactory();
  const systemService = mockSystemServiceFactory();

  contentfulService.getAssets.mockReturnValue(Promise.resolve(contentfulService.emptyResult));
  contentfulService.getEntries.mockReturnValue(Promise.reject("Because"));

  const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize, log, systemService);

  transformService.copyContentfulSpaceToNeo4j();

  setTimeout( () => {
    expect(log.mock.calls.length).toEqual(5);
    expect(log.mock.calls[0][0]).toEqual("fetch Assets 0");
    expect(log.mock.calls[1][0]).toEqual("Assets: 0 of 0 0");
    expect(log.mock.calls[2][0]).toEqual("processAssets 0 1000 0");
    expect(log.mock.calls[3][0]).toEqual("fetch Entries 0 10");
    expect(log.mock.calls[4][0]).toEqual("Fetch entries failed with Because at skip 0 10");   
    expect(systemService.systemExit.mock.calls.length).toEqual(1);
    done();
  }, 
  1);
});
