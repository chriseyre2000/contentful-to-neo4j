import Bottleneck from "bottleneck"
import { createClient } from "contentful";
import config from './config';


const contentfulClient = createClient({
  space: config.contentful.spaceId,
  accessToken: config.contentful.accessToken,
  resolveLinks: false,
});

const limiter = new Bottleneck({
    minTime: 2000,
    maxConcurrent: 1
  });

const getAssets = (limit, skip) => {
    return limiter.schedule( () =>  contentfulClient.getAssets({
        skip: skip,
        limit: limit,
        order: 'sys.createdAt'
    }));
}

const getEntries = (limit, skip) => {
    return limiter.schedule( () => contentfulClient.getEntries({
        skip: skip,
        limit: limit,
        order: 'sys.createdAt'
      }));
}

const contentfulService = {
    getAssets: getAssets,
    getEntries: getEntries
};

export default contentfulService;