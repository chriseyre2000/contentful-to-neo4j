import { processEntries } from "./contentfulProcessing";
import mockNeo4jServiceFactory from "./mocks/mockNeo4jService";

test('Check Process Empty Entries Calls Relationships', () => {

    const neo4jService = mockNeo4jServiceFactory();

    const entries = {
        total: 0,
        items: []
    };

    const mockDBCommand = jest.fn();
    const mockCurrentFetch = jest.fn();
    const mockRecordRelationship = jest.fn();
    const mockNextFetch = jest.fn();
    const mockFinish = neo4jService.finish;

    processEntries(neo4jService, entries, 0, 10, mockDBCommand, mockRecordRelationship, mockCurrentFetch, mockNextFetch);

    expect(mockDBCommand.mock.calls.length).toBe(0);
    expect(mockCurrentFetch.mock.calls.length).toBe(0);
    expect(mockRecordRelationship.mock.calls.length).toBe(0);
    expect(mockNextFetch.mock.calls.length).toBe(1);
    expect(mockFinish.mock.calls.length).toBe(0);

} );

test('Check Process Empty Entries Calls Fetch More', () => {

    const neo4jService = mockNeo4jServiceFactory();

    const entries = {
        total: 11,
        items: []
    };

    const mockDBCommand = jest.fn();
    const mockCurrentFetch = jest.fn();
    const mockRecordRelationship = jest.fn();
    const mockNextFetch = jest.fn();
    const mockFinish = neo4jService.finish;

    processEntries(neo4jService, entries, 0, 10, mockDBCommand, mockRecordRelationship, mockCurrentFetch, mockNextFetch);

    expect(mockDBCommand.mock.calls.length).toBe(0);
    expect(mockCurrentFetch.mock.calls.length).toBe(1);
    expect(mockRecordRelationship.mock.calls.length).toBe(0);
    expect(mockNextFetch.mock.calls.length).toBe(0);
    expect(mockFinish.mock.calls.length).toBe(0);

} );
