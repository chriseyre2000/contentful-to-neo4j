import mockNeo4jServiceFactory from "./mocks/mockNeo4jService";
import mockContentfulServiceFactory, { assetFactory } from "./mocks/mockContentfulService";
import transformServiceFactory from "./transformService"
import mockLogService from "./mocks/mockLogService";

import mockSystemServiceFactory from "./mocks/mockSystemService";

const contentfulBatchSize = 10;

test('Check Process Empty Assets Calls Entries', (done) => {
  
  const contentfulService = mockContentfulServiceFactory();
  const neo4jService = mockNeo4jServiceFactory();
  const log = mockLogService();
  const systemService = mockSystemServiceFactory();

  const assets = {
    total: 0,
    items: []
  };

  contentfulService.getEntries.mockReturnValue( new Promise(() => contentfulService.emptyResult) );
  neo4jService.finish.mockReturnValue( new Promise( () => {
    done();
  } ));


  const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize, log, systemService);

  transformService.processAssets(assets, 0);

  expect(contentfulService.getEntries.mock.calls.length).toEqual(1);
} );

test('Check Process Empty Assets Calls Entries', (done) => {
  
    const contentfulService = mockContentfulServiceFactory();
    const neo4jService = mockNeo4jServiceFactory();
    const log = mockLogService();
    const systemService = mockSystemServiceFactory();
    
    const assets = {
        total: 20,
        items: [
            assetFactory("first-asset-id", "first-asset-title", "//first-file-url"),            
            assetFactory("second-asset-id", "second-asset-title", "//second-file-url"),            
        ]
    };
  
    contentfulService.getAssets.mockReturnValue( Promise.resolve(contentfulService.emptyResult) );
    contentfulService.getEntries.mockReturnValue( Promise.resolve(contentfulService.emptyResult) );


    const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize, log, systemService);
  
    transformService.copyContentfulSpaceToNeo4j();
  
    setTimeout( () => {
      expect(contentfulService.getAssets.mock.calls.length).toEqual(1);
      expect(contentfulService.getEntries.mock.calls.length).toEqual(1);

      done();
    }, 1);
  } );
  