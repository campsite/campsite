api-web: cd api && bundle exec rails server -p 3001 -b '127.0.0.1'
api-js: cd api && yarn build --watch
api-app-css: cd api && yarn build:app:css --watch
api-mailer-css: cd api && yarn build:mailer:css --watch
api-worker: cd api && bundle exec sidekiq -C config/sidekiq.yml
redis: cd api && redis-server
ngrok: cd api && USER_CONFIG=`ngrok config check | sed -n -e 's/Valid configuration file at //p'` && ngrok start campsite campsite-api campsite-sync --config "$USER_CONFIG" --config ngrok.yaml
site: npx turbo run dev --filter=@campsite/site --log-prefix=none
web: npx turbo run dev --filter=@campsite/web --log-prefix=none
html-to-image: cd html-to-image && PORT=9222 npm run dev
styled-text-server: PORT=3002 AUTHTOKEN=d8c0a2827589659ff292a8999b024f24a185ed82 npx turbo run dev --filter=@campsite/styled-text-server --log-prefix=none
sync-server: PORT=9000 npx turbo run dev --filter=@campsite/sync-server --log-prefix=none
elasticsearch: trap 'docker stop elasticsearch' EXIT > /dev/null; docker start -a elasticsearch
