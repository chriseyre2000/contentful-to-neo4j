const config = {
    contentful: {
      spaceId : process.env.SPACE_ID,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
      batchSize : process.env.CONTENTFUL_BATCH_SIZE || 500,
    },
    neo4j: {
      uri : process.env.NEO4J_SERVER || 'bolt://localhost',
      user: process.env.NEO4j_USER || 'neo4j',
      password: process.env.NEO4J_PASSWORD,
    }
  };

export default config;