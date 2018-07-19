Contentful to Neo4j
===================

This library will populate a neo4j database from a contentful space.

The practical uses are visualization and a powerful query language.
You can easily find orphan entities.
This allows writing reports against Contentful Data.

Here is an article that explains this project: https://devrantsblog.wordpress.com/2018/07/01/viewing-contentful-data-in-neo4j/

Article has been used (with permission) here:

https://www.contentful.com/blog/2018/07/11/viewing-contentful-data-in-neo4j/

This still may break on unexpected content (use of quotes in arrays of strings is a known weakness).
I have yet to run it on a really large contentful space - which could could problems given that currently 
everything is committed in a single neo4j transaction.

WARNING - this will clean out the neo4j database before populating it from contentful

Usage:

Set the following environment variables (windows version, use export or prefix on unix system):

```
SET SPACE_ID=xxx
SET CONTENTFUL_ACCESS_TOKEN=yyy
SET NEO4J_PASSWORD=badpassword // defaults to GRAPHENEDB_BOLT_PASSWORD
SET NEO4j_USER=neo4j // defaults to GRAPHENEDB_BOLT_USER then neo4j
SET NEO4J_SERVER=bolt://localhost    // defaults to GRAPHENEDB_BOLT_URL then  bolt://localhost
SET CONTENTFUL_BATCH_SIZE=1000 // defaults to 500

npm install

node index.js
```

The contentful access token is the read-only publish token (it currently does not work with the preview api).

Known issues:

- Embedded images are not referenced from markdown fields.
- Quotes in arrays of strings may break the import.
- There is a rate limit issue with larger datasets.

Working with a graphene database hosted in heroku
=================================================

If you want to have you neo4j server running in a hosted environment then you can try and use the Graphene addon to Heroku:

- Sign up to heroku (it's free if you are not using anything)
- Enter a credit card (just to stop anyone from using too much free stuff)
- Create a heroku app - it can be empty.
- Add a Graphene database (I used the free tier to test this).
- After a few mins it will be provisioned so now look at the settings tab of your app.

Use the heroku cli to add a remote to your local copy of this repo.
Push the code to the repo. (git push heroku master)

Add SET SPACE_ID and CONTENTFUL_ACCESS_TOKEN.

Once this has restarted you can use the Heroku command:

```
heroku run loader -a INSERT_SPACE_NAME
```

This should populate your graphene database with the content from your space.
