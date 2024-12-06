# Elasticsearch

## Local setup

First, install [Docker for macOS](https://docs.docker.com/desktop/install/mac-install/). Once that is setup, jump to the command line to setup and run an ES image:

```sh
docker pull docker.elastic.co/elasticsearch/elasticsearch:8.8.0
docker network create elastic
docker run --name elasticsearch \
	--net elastic \
	-p 9200:9200 \
	-e discovery.type=single-node \
	-e ES_JAVA_OPTS="-Xms1g -Xmx1g" \
	-e xpack.security.enabled=false \
	-it docker.elastic.co/elasticsearch/elasticsearch:8.8.0
```

## Remote tunneling

If you ever need to inspect the production Elasticsearch instance:

```sh
fly proxy 19200:9200 -a campsite-elasticsearch
```

This will expose the production ES instance via `localhost:19200`. You can use an API inspector to explore indexes and general instance health.

## Reindexing

While the `script/dev` script is running, open another Terminal and open the Rails console. Run the following command:

```ruby
> Post.reindex
> Note.reindex
> Call.reindex
```
