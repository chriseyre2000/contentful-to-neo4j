import { processEntries, storeRelationship, processRelationships  } from './contentfulProcessing';

test('Check Process Empty Entries Calls Relationships', () => {

    const entries = {
        total: 0,
        items: []
    };

    const mockDBCommand = jest.fn();
    const mockCurrentFetch = jest.fn();
    const mockRecordRelationship = jest.fn();
    const mockNextFetch = jest.fn();
    const mockFinish = jest.fn();

    processEntries(entries, 0, 10, mockDBCommand, mockRecordRelationship, mockCurrentFetch, mockNextFetch, mockFinish);

    expect(mockDBCommand.mock.calls.length).toBe(0);
    expect(mockCurrentFetch.mock.calls.length).toBe(0);
    expect(mockRecordRelationship.mock.calls.length).toBe(0);
    expect(mockNextFetch.mock.calls.length).toBe(1);
    expect(mockFinish.mock.calls.length).toBe(0);

} );

