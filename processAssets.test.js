import { processAssets} from './contentfulProcessing';
import mockNeo4jServiceFactory from "./mocks/mockNeo4jService";

test('Check Process Empty Assets Calls Entries', () => {

    const neo4jService = mockNeo4jServiceFactory();

    const assets = {
        total: 0,
        items: []
    };

    const mockDBCommand = neo4jService.cypherCommand;
    const mockCurrentFetch = jest.fn();
    const mockNextFetch = jest.fn();

    processAssets(neo4jService, assets, 0, 10, mockCurrentFetch, mockNextFetch );

    expect(mockDBCommand.mock.calls.length).toBe(0);
    expect(mockCurrentFetch.mock.calls.length).toBe(0);
    expect(mockNextFetch.mock.calls.length).toBe(1);

} );

test('Check Process Large number calls for more assets', () => {

    const neo4jService = mockNeo4jServiceFactory();

    const assets = {
        total: 20,
        items: [
            {
                sys : {id: "first-asset-id", type: "Asset"},
                fields: { 
                    title: "first-asset-title",
                    file: {
                        url: "//first-file-url"
                    }
                }
            },
            {
                sys : {id: "second-asset-id", type: "Asset"},
                fields: { 
                    title: "second-asset-title",
                    file: {
                        url: "//second-file-url"
                    }
                }
            },

        ]
    };


    const mockDBCommand = neo4jService.cypherCommand;
    const mockCurrentFetch = jest.fn();
    const mockNextFetch = jest.fn();

    processAssets(neo4jService, assets, 0, 10, mockCurrentFetch, mockNextFetch );

    expect(mockDBCommand.mock.calls.length).toBe(2);
    expect(mockDBCommand.mock.calls[0][0]).toBe("CREATE (a:asset {cmsid: 'first-asset-id', cmstype: 'Asset', title: {titleParam}, url: '//first-file-url'} ) RETURN a");
    expect(mockDBCommand.mock.calls[0][1]).toEqual({"titleParam": "first-asset-title",});
    
    expect(mockDBCommand.mock.calls[1][0]).toBe("CREATE (a:asset {cmsid: 'second-asset-id', cmstype: 'Asset', title: {titleParam}, url: '//second-file-url'} ) RETURN a");
    expect(mockCurrentFetch.mock.calls.length).toBe(1);
    expect(mockNextFetch.mock.calls.length).toBe(0);

} );