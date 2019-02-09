import config from "./config";
import contentfulService from "./contentfulService";
import neo4jService from "./neo4jService";
import transformServiceFactory from "./transformService";
import log from "./logService";
import systemService from "./systemService";

neo4jService.emptyGraphDatabase();

const transformService = transformServiceFactory(contentfulService, neo4jService, config.contentful.batchSize, log, systemService);

transformService.copyContentfulSpaceToNeo4j();


