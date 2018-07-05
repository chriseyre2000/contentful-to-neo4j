import { createClient } from "contentful";
import config from './config';

const contentfulClient = createClient({
  space: config.contentful.spaceId,
  accessToken: config.contentful.accessToken,
  resolveLinks: false,
});

const getAssets = (limit, skip) => {
    return contentfulClient.getAssets({
        skip: skip,
        limit: limit,
        order: 'sys.createdAt'
    });
}

const getEntries = (limit, skip) => {
    return contentfulClient.getEntries({
        skip: skip,
        limit: limit,
        order: 'sys.createdAt'
      })
}

const contentfulService = {
    getAssets: getAssets,
    getEntries: getEntries
};

export default contentfulService;