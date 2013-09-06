-- http://stackoverflow.com/questions/9688483/what-is-the-standard-sql-type-for-binary-data
-- May work for hsqldb:
-- CREATE TYPE BYTEA AS VARBINARY(1000000)

-- Does not work on postgres CREATE TYPE "BINARY" AS bytea(1000000);

--CREATE TABLE IF NOT EXISTS "query_cache"(
--    "query_hash" bytea PRIMARY KEY,
--    "query_string" VARCHAR(16383),
--    "data" bytea,
--    "time" TIMESTAMP
--);

CREATE TABLE "permalinks"(
    "link_hash" text PRIMARY KEY,
    "ip" text NOT NULL,
    "state" text NOT NULL,
    "time" TIMESTAMP DEFAULT NOW()
);

-- TODO Possibly track the IP, so we can detect someone spamming the DB
-- We could also use the tracking (anonymously) to figure out how people are
-- using the application
--CREATE TABLE IF NOT EXISTS "permalink"(
--    "link_hash" bytea PRIMARY KEY,
    -- "title"
    -- "comment"
    -- "ip" cidr NOT NULL,
    -- "hit_count" INT, Keep track how often the link is used
--    "state" bytea,
--    "time" TIMESTAMP
--);
