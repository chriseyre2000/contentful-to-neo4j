import config from "./config";
import contentfulService from "./contentfulService";
import neo4jService from "./neo4jService";
import transformServiceFactory from "./transformService";
import log from "./logService";

neo4jService.emptyGraphDatabase();

const transformService = transformServiceFactory(contentfulService, neo4jService, config.contentful.batchSize, log);

transformService.copyContentfulSpaceToNeo4j();


