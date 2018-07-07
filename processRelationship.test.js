import { processRelationship } from "./transformService";

test( "Store a relationship without an order", () => {

    const relationship = {id: 'this', otherId: 'that', relation: 'maps'};

    const dbWriter = jest.fn();

    processRelationship({cypherCommand: dbWriter}, relationship);

    expect(dbWriter.mock.calls.length).toEqual(1);
    expect(dbWriter.mock.calls[0][0]).toEqual("MATCH (a {cmsid: 'this'}), (b {cmsid: 'that'} ) CREATE (a) -[r:maps]-> (b)");
} );

test( "Store a relationship with an order", () => {

    const relationship = {id: 'this', otherId: 'that', relation: 'maps', order: 7};

    const dbWriter = jest.fn();

    processRelationship({cypherCommand: dbWriter}, relationship);

    expect(dbWriter.mock.calls.length).toEqual(1);
    expect(dbWriter.mock.calls[0][0]).toEqual("MATCH (a {cmsid: 'this'}), (b {cmsid: 'that'} ) CREATE (a) -[r:maps {order: 7}]-> (b)");
} );