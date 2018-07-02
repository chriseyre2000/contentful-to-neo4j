import { storeRelationship, processRelationships  } from './contentfulProcessing';


test('If No Stored Relationship then processRelationships does no call db', () => {
  const mockDBCommand = jest.fn();
  const mockFinish = jest.fn();

  processRelationships(mockDBCommand, mockFinish)

  expect(mockDBCommand.mock.calls.length).toBe(0);
  expect(mockFinish.mock.calls.length).toBe(1);
} );

test('Stored Relationships get passed to the db', () => {
    storeRelationship( {order: 1, id: "first", otherId: "second", relation: "uses"} );
    storeRelationship( { id: "third", otherId: "fourth", relation: "breaks"} );

    const mockDBCommand = jest.fn();
    const mockFinish = jest.fn();


    processRelationships(mockDBCommand, mockFinish);

    expect(mockDBCommand.mock.calls.length).toBe(2);

    expect(mockDBCommand.mock.calls[0][0]).toBe("MATCH (a {cmsid: 'first'}), (b {cmsid: 'second'} ) CREATE (a) -[r:uses {order: 1} ]-> (b)");
    expect(mockDBCommand.mock.calls[1][0]).toBe("MATCH (a {cmsid: 'third'}), (b {cmsid: 'fourth'} ) CREATE (a) -[r:breaks]-> (b)");

    expect(mockFinish.mock.calls.length).toBe(1);

});
