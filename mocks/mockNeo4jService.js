const mockNeo4jServiceFactory = () => {
    return { 
        cypherCommand: jest.fn(),
        emptyGraphDatabase: jest.fn(),
        finish: jest.fn(),
    }
}

export default mockNeo4jServiceFactory;