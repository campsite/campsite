#!/bin/bash

# set some parameters that will be checked when ElasticSearch bootstraps
ulimit -n 65535
ulimit -u 4096
sysctl -w vm.max_map_count=262144

gosu elasticsearch:root /usr/local/bin/docker-entrypoint.sh
