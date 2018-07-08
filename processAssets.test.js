import mockNeo4jServiceFactory from "./mocks/mockNeo4jService";
import mockContentfulServiceFactory, { assetFactory } from "./mocks/mockContentfulService";
import transformServiceFactory from "./transformService"

const contentfulBatchSize = 10;

test('Check Process Empty Assets Calls Entries', (done) => {
  
  const contentfulService = mockContentfulServiceFactory();
  const neo4jService = mockNeo4jServiceFactory();
  
  const assets = {
    total: 0,
    items: []
  };

  contentfulService.getEntries.mockReturnValue( new Promise(() => contentfulService.emptyResult) );
  neo4jService.finish.mockReturnValue( new Promise( () => {
    done();
  } ));


  const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize);

  transformService.processAssets(assets, 0);

  expect(contentfulService.getEntries.mock.calls.length).toEqual(1);
} );

test('Check Process Empty Assets Calls Entries', (done) => {
  
    const contentfulService = mockContentfulServiceFactory();
    const neo4jService = mockNeo4jServiceFactory();
    
    const assets = {
        total: 20,
        items: [
            assetFactory("first-asset-id", "first-asset-title", "//first-file-url"),            
            assetFactory("second-asset-id", "second-asset-title", "//second-file-url"),            
        ]
    };
  
    contentfulService.getAssets.mockReturnValue( new Promise(() => contentfulService.emptyResult) );
    neo4jService.finish.mockReturnValue( new Promise( () => {
      done();
    } ));
    const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize);
  
    transformService.processAssets(assets, 0);
  
    expect(contentfulService.getAssets.mock.calls.length).toEqual(1);
  } );
  