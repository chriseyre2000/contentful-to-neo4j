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

node index.js
```

The contentful access token is the read-only publish token (it would work with the preview version).

Known issues:

- Embedded images are not referenced.
- Seems to hang at end - need to close the session when done.
- No tests.
- No batching of commands.
- Only handles string and number primitives in fields.
- No paging of contentful