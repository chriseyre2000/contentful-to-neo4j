Contentful to Neo4j
===================

This library will populate a neo4j database from a contentful space.

The practical uses are visualization and a powerful query language.
You can easily find orphan entities.
This allows writing reports against Contentful Data.

Why do I need this?
===================

If you are operating an application or website that uses Contentful it can be difficult to check the correctness of your data.
Directly calling Contentful via the api is difficult since you will be caught out by the rate limits (and these queries could
rate limit your production site).

This utility uses the minimum needed calls to extract the full dataset from a Contentful space so that you can query a neo4j 
database instead.

The contentful api allows for one way links but does not have the full power of Neo4j. Neo4j allows queries between things 
ignoring the direction of the link.

Real would usages have included:

- Check content has been entered and published  
- Locate duplicates
- Find orphan entries or images
- Allow queries across content types (the Contentful content api is one content type at a time)
- Count entries with a certain attribute (colour)
- Determine that a content type is unused
- Determine that a field is unused.
- Validate complex business rules (this field must have three of this entry type attached)

These examples are based upon the sample contentful space loaded into a local neo4j graph database.

Check that we have published the expected lessons:

MATCH (a:lesson) RETURN a

Return a count by slug

MATCH (a:lesson) RETURN a.slug, count(*)

Find orphan records

MATCH (a) WHERE not (a)-[]-() RETURN a

Here is an article that explains this project: https://devrantsblog.wordpress.com/2018/07/01/viewing-contentful-data-in-neo4j/

Article has been used (with permission) here:

https://www.contentful.com/blog/2018/07/11/viewing-contentful-data-in-neo4j/

This still may break on unexpected content.
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
SET CONTENTFUL_BATCH_SIZE=500 // defaults to 1000
SET CONTENTFUL_DELAY=1000 // defaults to 2000 Time (ms) between calls to avoid rate limit.

yarn

yarn load
```

The contentful access token is the read-only publish token (it currently does not work with the preview api).

Known issues:

- Embedded images are not referenced from markdown fields.
- Commits to neo4j are currently in a single transaction so can be slow for large contentful spaces.

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
