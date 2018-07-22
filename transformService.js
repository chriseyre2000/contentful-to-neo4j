import {
    processAsset,
    processEntry,
    processRelationship,
} from "./contentfulTransform";

const transformServiceFactory = (contentful, neo4j, contentfulBatchSize, log, systemService) => {
    
    var targetBatchSize = contentfulBatchSize;

    // This is the main entry point
    const copyContentfulSpaceToNeo4j = () => {
        fetchAssets(0);
    }

    const assetBatchSize = 1000;

    const fetchAssets = (skip) => {
        log(`fetch Assets ${skip}`);
        const handleAssets = assets => processAssets(assets, skip);
        
        const handleFailure = reason => {
            log(`Fetch assets failed with ${reason} at skip ${skip}`);
            systemService.systemExit(1);
        };

        contentful.getAssets(assetBatchSize, skip)
            .then(handleAssets, handleFailure);
    };

    const processAssets = (assets, skip) => {
        log(`Assets: ${assets.items.length} of ${assets.total} ${skip}`);
        
        assets.items.forEach(asset => processAsset(neo4j, asset));

        log(`processAssets ${skip} ${assetBatchSize} ${assets.total}`);

        if ((skip + assetBatchSize) < assets.total) {
            fetchAssets(skip + assetBatchSize);
        }
        else {
            fetchEntries();
        }
    }

    const fetchEntries = (skip = 0) => {
        log(`fetch Entries ${skip} ${targetBatchSize}`);

        const handleEntries = entries => processEntries(entries, skip);

        contentful.getEntries(targetBatchSize, skip)
            .then(handleEntries)
            .catch(error=>{
                log(`Fetch entries failed with ${error} at skip ${skip} ${targetBatchSize}`);
                systemService.systemExit(1);
            })
    }

    const processEntries = (entries, skip) => {
        log(`Entries: ${entries.items.length} of ${entries.total} ${skip}`);

        entries.items.forEach((entry) => {
            processEntry(neo4j, storeRelationship, entry, log); 
        });

        log(`processEntries ${skip} ${targetBatchSize} ${entries.total}`);

        if ((skip + targetBatchSize) < entries.total) {
            fetchEntries(skip + targetBatchSize);
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


