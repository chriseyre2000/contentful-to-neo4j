const mockContentfulServiceFactory = () => {
    return {
        getAssets: jest.fn(),
        getEntries: jest.fn(),

        emptyResult: {
            total: 0,
            items: []
        },
    }
}

const entryFactory = (contentTypeId, id, fields) => {
    return {
        sys: {
            contentType: {
                sys: {
                    id: `${contentTypeId}`,
                }
            },
            id: `${id}`,
            type: "Entry",
        },
        fields: fields,
    }
};


const assetFactory = (id, title, url) => {
    return {
        sys: { id: `${id}`, type: "Asset" },
        fields: {
            title: `${title}`,
            file: {
                url: `${url}`
            }
        }
    }
}

export default mockContentfulServiceFactory;

export { entryFactory, assetFactory };