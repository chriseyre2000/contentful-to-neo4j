Contentful to Neo4j
===================

This library will populate a neo4j database from a contentful space.

The practical uses are visualization and a powerful query language.
You can easily find orphan entities.

Currently I am just spiking the api's required.

So far I can read entries and assets from contentful.

I can now create relationships for images and non-primitive fields. 

*Usage:

Set the following environment variables (windows version, use export or prefix on unix system):

``` SET SPACE_ID=xxx ```
``` SET CONTENTFUL_ACCESS_TOKEN=yyy```
``` SET NEO4J_PASSWORD=badpassword```
``` SET NEO4j_USER=neo4j // defaults to neo4j ```
``` SET NEO4J_SERVER=bolt://localhost ```

```node index.js```

The contentful access token is the read-only publish token (it would work with the preview version).

Known issues:

1. Embedded images are not referenced.
2. Seems to hang at end - need to close the session when done.
3. No tests.
4. No batching of commands.
5. Only handles string and number primitives in fields.
6. No paging of contentful