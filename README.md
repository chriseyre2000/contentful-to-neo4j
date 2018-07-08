Contentful to Neo4j
===================

This library will populate a neo4j database from a contentful space.

The practical uses are visualization and a powerful query language.
You can easily find orphan entities.

Here is an artile that explains this project: https://devrantsblog.wordpress.com/2018/07/01/viewing-contentful-data-in-neo4j/

This still may break on unexpected content (use of quotes in arrays of strings is a known weakness).
I have yet to run it on a really large contentful space - which could could problems given that currently 
everything is committed in a single neo4j transaction.

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

npm install

node index.js
```

The contentful access token is the read-only publish token (it currently does not work with the preview api).

Known issues:

- Embedded images are not referenced from markdown fields.
- Quotes in arrays of strings may break the import.
- Error handling is still weak.

The next neo4j change to make is to get it to work on a graphene database hosted in a heroku environment.