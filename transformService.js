import {
    processAsset,
    processEntry,
    processRelationship,
} from "./contentfulTransform";

const transformServiceFactory = (contentful, neo4j) => {

    // This is the main entry point
    const copyContentfulSpaceToNeo4j = (batchSize) => {
        fetchAssets(batchSize, 0);
    }

    const fetchAssets = (limit, skip) => {
        contentful.getAssets(limit, skip)
            .then(assets => processAssets(assets, skip, limit));
    };

    const processAssets = (assets, skip, limit) => {
        console.log("Assets:", assets.items.length);
        assets.items.forEach(asset => processAsset(neo4j, asset));

        if ((skip + limit) < assets.total) {
            fetchAssets(limit, skip + limit);
        }
        else {
            fetchEntries(limit, 0);
        }
    }

    const fetchEntries = (limit, skip) => {
        contentful.getEntries(limit, skip)
            .then(entries => processEntries(entries, skip, limit));
    }

    const processEntries = (entries, skip, limit) => {
        console.log("Entries:", entries.items.length);

        entries.items.forEach((entry) => {
            processEntry(neo4j, storeRelationship, entry);
        });

        if ((skip + limit) < entries.total) {
            fetchEntries(limit, skip + limit);
        } else {
            processRelationships();
        }
    }

    let relationships = [];

    const storeRelationship = (data) => {
        relationships.push(data)
    }

    const processRelationships = () => {
        console.log("We found " + relationships.length + " relationships")

        relationships.forEach(relationship => {
            processRelationship(neo4j, relationship);
        });
        neo4j.finish();
    }

    return {
        copyContentfulSpaceToNeo4j,
        // The following are exposed for testing
        processAssets,
        processEntries,
        processRelationships,
        storeRelationship
    }
};

export default transformServiceFactory;


