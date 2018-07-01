Contentful to Neo4j
===================

This library will populate a neo4j database from a contentful space.

The practical uses are visualization and a powerful query language.
You can easily find orphan entities.

This is still in early development.

So far I can read entries and assets from contentful.

I can now create relationships for images and non-primitive fields. 

WARNING - this will clean out the neo4j database before populating it from contentful

Usage:

Set the following environment variables (windows version, use export or prefix on unix system):

``` 
SET SPACE_ID=xxx 
SET CONTENTFUL_ACCESS_TOKEN=yyy
SET NEO4J_PASSWORD=badpassword
SET NEO4j_USER=neo4j // defaults to neo4j 
SET NEO4J_SERVER=bolt://localhost
SET CONTENTFUL_BATCH_SIZE=1000 // defaults to 500 

node index.js
```

The contentful access token is the read-only publish token (it would work with the preview version).

Known issues:

- Embedded images are not referenced.
- No tests.
- Only handles string and number primitives in fields.