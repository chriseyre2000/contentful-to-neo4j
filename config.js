const required = (field) => { throw `${field} is required` };

const env = (name) => process.env[name];

const envInt = (name, defaultValue) => {
  return parseInt( env(name) ) || defaultValue;
}
const envRequired = (name) => {
  return env(name) || required(name)();
}

const envDefault = (name, defaultValue) => {
  return env(name) || defaultValue
}

const envFallbackRequired = (first, second) => {
  return env(first) || env(second) || required(`${first} OR ${second}`)
}

const envFallbackDefault = (first, second, defaultValue) => {
  return env(first) || env(second) || defaultValue
}

const config = {
    contentful: {
      spaceId: envRequired("SPACE_ID"),
      accessToken: envRequired("CONTENTFUL_ACCESS_TOKEN"),
      batchSize: envInt("CONTENTFUL_BATCH_SIZE", 1000),
      minTimeBetweenTransactions: envInt("CONTENTFUL_DELAY", 2000),
    },
    neo4j: {
      uri : envFallbackDefault(
        "NEO4J_SERVER", 
        "GRAPHENEDB_BOLT_URL", 
        "bolt://localhost"),
      user: envFallbackDefault(
        "NEO4j_USER", 
        "GRAPHENEDB_BOLT_USER", 
        "neo4j"),
      password: envFallbackRequired(
        "NEO4J_PASSWORD", 
        "GRAPHENEDB_BOLT_PASSWORD"),
    }
  };

export default config;