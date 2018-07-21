import {
    processAsset,
    processEntry,
    processRelationship,
} from "./contentfulTransform";

const transformServiceFactory = (contentful, neo4j, contentfulBatchSize, log, systemService) => {
    
    // This is the main entry point
    const copyContentfulSpaceToNeo4j = () => {
        fetchAssets(0);
    }

    const fetchAssets = (skip) => {
        log(`fetch Assets ${skip}`);
        const handleAssets = assets => processAssets(assets, skip);
        
        const handleFailure = reason => {
            log(`Fetch assets failed with ${reason} at skip ${skip}`);
            systemService.systemExit(1);
        };

        contentful.getAssets(contentfulBatchSize, skip)
            .then(handleAssets, handleFailure);
    };

    const processAssets = (assets, skip) => {
        log(`Assets: ${assets.items.length} of ${assets.total} ${skip}`);
        
        assets.items.forEach(asset => processAsset(neo4j, asset));

        log(`processAssets ${skip} ${contentfulBatchSize} ${assets.total}`);

        if ((skip + contentfulBatchSize) < assets.total) {
            fetchAssets(skip + contentfulBatchSize);
        }
        else {
            fetchEntries();
        }
    }

    const fetchEntries = (skip = 0) => {
        log(`fetch Entries ${skip}`);

        const handleEntries = entries => processEntries(entries, skip);

        const handleFailure = reason => {
            log(`Fetch entries failed with ${reason} at skip ${skip}`);
            systemService.systemExit(1);
        };

        contentful.getEntries(contentfulBatchSize, skip)
            .then(handleEntries, handleFailure);
    }

    const processEntries = (entries, skip) => {
        log(`Entries: ${entries.items.length} of ${entries.total}`);

        entries.items.forEach((entry) => {
            processEntry(neo4j, storeRelationship, entry, log); 
        });

        log(`processEntries ${skip} ${contentfulBatchSize} ${entries.total}`);

        if ((skip + contentfulBatchSize) < entries.total) {
            fetchEntries(skip + contentfulBatchSize);
        } else {
            processRelationships();
        }
    }

    let relationships = [];

    const storeRelationship = (data) => {
        relationships.push(data)
    }

    const processRelationships = () => {
        log("We found " + relationships.length + " relationships")

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
        storeRelationship,
        fetchAssets,
        fetchEntries
    }
};

export default transformServiceFactory;


