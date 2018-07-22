const config = {
    contentful: {
      spaceId : process.env.SPACE_ID,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
      batchSize :  parseInt(process.env.CONTENTFUL_BATCH_SIZE) || 500,
      minTimeBetweenTransactions: parseInt(process.env.CONTENTFUL_DELAY) || 2000,
    },
    neo4j: {
      uri : process.env.NEO4J_SERVER || process.env.GRAPHENEDB_BOLT_URL || 'bolt://localhost',
      user: process.env.NEO4j_USER || process.env.GRAPHENEDB_BOLT_USER ||'neo4j',
      password: process.env.NEO4J_PASSWORD || process.env.GRAPHENEDB_BOLT_PASSWORD,
    }
  };

export default config;