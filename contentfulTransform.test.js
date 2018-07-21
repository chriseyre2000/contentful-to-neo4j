import {
    processAsset,
    processEntry,
    processRelationship
} from "./contentfulTransform";

import neo4jServiceMockFactory from "./mocks/mockNeo4jService";
import { entryFactory } from "./mocks/mockContentfulService";
import mockLogFactory from "./mocks/mockLogService";

describe("Process Asset Test", () => {
    test("process Asset", () => {
        const neo4j = neo4jServiceMockFactory();

        const asset = {
            sys: {
                id: "identifier",
                type: "Asset",
            },
            fields: {
                file: {
                    url: "//somewhere.interesting",
                },
                title: "This is what we call it",
            }
        };

        processAsset(neo4j, asset);

        expect(neo4j.cypherCommand.mock.calls.length)
            .toEqual(1);
        expect(neo4j.cypherCommand.mock.calls[0][0])
            .toEqual("CREATE (a:asset {cmsid: 'identifier', cmstype: 'Asset', title: {titleParam}, url: '//somewhere.interesting'} ) RETURN a");
        expect(neo4j.cypherCommand.mock.calls[0][1])
            .toEqual({ titleParam: "This is what we call it" });
    });
});

describe("ProcessEntry Tests", () => {
    test("ProcessEntry with no fields", () => {
        const neo4j = neo4jServiceMockFactory();
        const storeRelationships = jest.fn();
        const log = mockLogFactory();

        const entry = entryFactory(
            "first-content-type", 
            "first-id", 
            {}
        );

        processEntry(neo4j, storeRelationships, entry, log);
        expect(neo4j.cypherCommand.mock.calls.length)
            .toEqual(1);
        expect(neo4j.cypherCommand.mock.calls[0][0])
            .toEqual("CREATE (a:first-content-type {cmsid: 'first-id', contenttype: 'first-content-type', cmstype: 'Entry'} ) RETURN a");

    });

    test("Process Entry with a single boolean field", () => {
        //Given
        const neo4j = neo4jServiceMockFactory();
        const storeRelationships = jest.fn();
        const log = mockLogFactory();

        const entry = entryFactory(
            "content-type-with-boolean", 
            "first-id", 
            {
                booleanField: true
            }
        );

        //When
        processEntry(neo4j, storeRelationships, entry, log);

        //Then
        const dbCalls = neo4j.cypherCommand.mock.calls;

        expect(dbCalls.length)
            .toEqual(2);

        // We only care about the second one    
        expect(dbCalls[1][0])
            .toEqual("MATCH (a {cmsid: 'first-id'}) SET a.booleanField = true RETURN a")

        expect(storeRelationships.mock.calls.length)
            .toEqual(0);
    });

    test("Process Entry with a single number field", () => {
        //Given
        const neo4j = neo4jServiceMockFactory();
        const storeRelationships = jest.fn();
        const log = mockLogFactory();

        const entry = entryFactory(
            "content-type-with-number", 
            "first-id", 
            {
                numberField: 42
            }
        );
        
        //When
        processEntry(neo4j, storeRelationships, entry, log);

        //Then
        const dbCalls = neo4j.cypherCommand.mock.calls;

        expect(dbCalls.length)
            .toEqual(2);

        // We only care about the second one    
        expect(dbCalls[1][0])
            .toEqual("MATCH (a {cmsid: 'first-id'}) SET a.numberField = 42 RETURN a")

        expect(storeRelationships.mock.calls.length)
            .toEqual(0);
    });

    test("Process Entry with a single string field", () => {
        //Given
        const neo4j = neo4jServiceMockFactory();
        const storeRelationships = jest.fn();
        const log = mockLogFactory();

        const entry = entryFactory(
            "content-type-with-string", 
            "first-id", 
            {
                stringField: "This is a complex value"
            }
        );
        
        //When
        processEntry(neo4j, storeRelationships, entry, log);

        //Then
        const dbCalls = neo4j.cypherCommand.mock.calls;

        expect(dbCalls.length)
            .toEqual(2);

        // We only care about the second one    
        expect(dbCalls[1][0])
            .toEqual("MATCH (a {cmsid: 'first-id'}) SET a.stringField = {valueParam} RETURN a");
        expect(dbCalls[1][1])
            .toEqual({valueParam: "This is a complex value" });

        expect(storeRelationships.mock.calls.length)
            .toEqual(0);
    });

    test("Process Entry with a single asset or entry field", () => {
        //Given
        const neo4j = neo4jServiceMockFactory();
        const storeRelationships = jest.fn();
        const log = mockLogFactory();

        const entry = entryFactory(
            "content-type-with-asset", 
            "first-id", 
            {
                assetField: { 
                    sys: {
                        id : "other-id",
                        type: "Asset"
                    }
                }
            }
        );
        
        //When
        processEntry(neo4j, storeRelationships, entry, log);

        //Then
        const dbCalls = neo4j.cypherCommand.mock.calls;

        expect(dbCalls.length)
            .toEqual(1);

        expect(storeRelationships.mock.calls.length)
            .toEqual(1);

        expect(storeRelationships.mock.calls[0][0])
            .toEqual({
                id: "first-id", 
                otherId: "other-id", 
                relation: "assetField"
            });    
    });


    test("Process Entry with an unknown field", () => {
        //Given
        const neo4j = neo4jServiceMockFactory();
        const storeRelationships = jest.fn();
        const log = mockLogFactory();

        const entry = entryFactory(
            "content-type-with-unknown-field", 
            "first-id", 
            {
                unknownField: { 
                    foo: "bar",
                }
            }
        );
        
        //When
        processEntry(neo4j, storeRelationships, entry, log);

        //Then
        const dbCalls = neo4j.cypherCommand.mock.calls;

        expect(dbCalls.length)
            .toEqual(1);

        expect(storeRelationships.mock.calls.length)
            .toEqual(0);

        //We should probably catch the log message
    });


    test("Process Entry with an array of booleans", () => {
        //Given
        const neo4j = neo4jServiceMockFactory();
        const storeRelationships = jest.fn();
        const log = mockLogFactory();

        const entry = entryFactory(
            "content-type-with-array-of-booleans", 
            "first-id", 
            {
                booleanArrayField: [
                    false, 
                    true
                ]
            }
        );
        
        //When
        processEntry(neo4j, storeRelationships, entry, log);

        //Then
        const dbCalls = neo4j.cypherCommand.mock.calls;

        expect(dbCalls.length)
            .toEqual(2);

        // We only care about the second one    
        expect(dbCalls[1][0])
            .toEqual("MATCH (a {cmsid: 'first-id'}) SET a.booleanArrayField = [{0},{1}] RETURN a");

        expect(dbCalls[1][1])
            .toEqual({0: false, 1: true});

        expect(storeRelationships.mock.calls.length)
            .toEqual(0);
    });

    test("Process Entry with an array of numbers", () => {
        //Given
        const neo4j = neo4jServiceMockFactory();
        const storeRelationships = jest.fn();
        const log = mockLogFactory();

        const entry = entryFactory(
            "content-type-with-array-of-numbers", 
            "first-id", 
            {
                numberArrayField: [
                    42, 
                    101
                ]
            }
        );
        
        //When
        processEntry(neo4j, storeRelationships, entry, log);

        //Then
        const dbCalls = neo4j.cypherCommand.mock.calls;

        expect(dbCalls.length)
            .toEqual(2);

        // We only care about the second one    
        expect(dbCalls[1][0])
            .toEqual("MATCH (a {cmsid: 'first-id'}) SET a.numberArrayField = [{0},{1}] RETURN a");
        expect(dbCalls[1][1])
            .toEqual({0: 42, 1: 101});

        expect(storeRelationships.mock.calls.length)
            .toEqual(0);
    });

    test("Process Entry with an array of strings", () => {
        //Given
        const neo4j = neo4jServiceMockFactory();
        const storeRelationships = jest.fn();
        const log = mockLogFactory();

        const entry = entryFactory(
            "content-type-with-string-array", 
            "first-id", 
            {
                stringArrayField: [
                    "This is a complex value", 
                    "Another"
                ]
            }
        );
        
        //When
        processEntry(neo4j, storeRelationships, entry, log);

        //Then
        const dbCalls = neo4j.cypherCommand.mock.calls;

        expect(dbCalls.length)
            .toEqual(2);

        // We only care about the second one    
        expect(dbCalls[1][0])
            .toEqual("MATCH (a {cmsid: 'first-id'}) SET a.stringArrayField = [{0},{1}] RETURN a");
        expect(dbCalls[1][1])
            .toEqual({0: "This is a complex value", 1: "Another"});

        expect(storeRelationships.mock.calls.length)
            .toEqual(0);
    });

    test("Process Entry with an array of assets or entries", () => {
        //Given
        const neo4j = neo4jServiceMockFactory();
        const storeRelationships = jest.fn();
        const log = mockLogFactory();

        const entry = entryFactory(
            "content-type-with-string", 
            "first-id", 
            {
                complexArrayField: [
                    { 
                        sys: {
                            id : "other-asset-id",
                            type: "Asset"
                        }
                    }, 
                    { 
                        sys: {
                            id : "other-entry-id",
                            type: "Entry"
                        }
                    }, 
                ]
            }
        );
        
        //When
        processEntry(neo4j, storeRelationships, entry, log);

        //Then
        const dbCalls = neo4j.cypherCommand.mock.calls;

        expect(dbCalls.length)
            .toEqual(1);

        // We only care about the second one    

        expect(storeRelationships.mock.calls.length)
            .toEqual(2);
        expect(storeRelationships.mock.calls[0][0])
            .toEqual({
                id: "first-id",
                order: 0, 
                otherId: "other-asset-id", 
                relation: "complexArrayField"
            });    
        expect(storeRelationships.mock.calls[1][0])
            .toEqual({
                id: "first-id", 
                order: 1,
                otherId: "other-entry-id", 
                relation: "complexArrayField"
            });    
    });
});

describe("Process Relationship", () => {
    test("Store a relationship without an order", () => {
        const neo4j = neo4jServiceMockFactory();

        const relationship = {
            id: 'this',
            otherId: 'that',
            relation: 'maps'
        };

        processRelationship(neo4j, relationship);

        expect(neo4j.cypherCommand.mock.calls.length)
            .toEqual(1);
        expect(neo4j.cypherCommand.mock.calls[0][0])
            .toEqual("MATCH (a {cmsid: 'this'}), (b {cmsid: 'that'} ) CREATE (a) -[r:maps]-> (b)");
    });

    test("Store a relationship with an order", () => {
        const neo4j = neo4jServiceMockFactory();

        const relationship = {
            id: 'this',
            otherId: 'that',
            relation: 'maps',
            order: 7
        };

        processRelationship(neo4j, relationship);

        expect(neo4j.cypherCommand.mock.calls.length).toEqual(1);
        expect(neo4j.cypherCommand.mock.calls[0][0]).toEqual("MATCH (a {cmsid: 'this'}), (b {cmsid: 'that'} ) CREATE (a) -[r:maps {order: 7}]-> (b)");
    });
});