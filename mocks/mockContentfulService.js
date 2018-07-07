const mockContentfulServiceFactory = () => {
    return { 
        getAssets: jest.fn(),
        getEntries: jest.fn(),

        emptyResult : {
            total: 0,
            items: []
        },
    }
}

export default mockContentfulServiceFactory;