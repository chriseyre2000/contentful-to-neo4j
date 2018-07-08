import config from "./config";
import contentfulService from "./contentfulService";
import neo4jService from "./neo4jService";
import transformServiceFactory from "./transformService";

neo4jService.emptyGraphDatabase();

const transformService = transformServiceFactory(contentfulService, neo4jService, config.contentful.batchSize);

transformService.copyContentfulSpaceToNeo4j();


