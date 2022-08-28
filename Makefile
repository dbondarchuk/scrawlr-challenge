# Keep Empty
FORCE:
up:
	docker compose up -d
down:
	docker compose down --remove-orphans
build:
	docker compose build --no-cache --force-rm
remake:
	@make destroy
	@make build
stop:
	docker compose stop
restart:
	@make down
	@make up

api: FORCE
	docker compose exec api bash
api.test: FORCE
	docker compose exec api bash ./run-tests.sh -c ./phpunit.xml
api.install: FORCE
	docker compose exec api composer install
api.stop: FORCE
	docker compose stop api
ui: FORCE
	docker compose exec ui bash
ui.test: FORCE
	docker compose exec ui yarn test run
ui.test.watch: FORCE
	docker compose exec ui yarn test watch
db: FORCE
	docker compose exec database bash
sql: FORCE
	docker compose exec database bash -c 'psql -d $$POSTGRES_DB -U $$POSTGRES_USER'
redis: FORCE
	docker compose exec redis redis-cli


test:
	@make api.test
	@make ui.test


destroy:
	docker compose down --volumes --remove-orphans
# 	docker compose down --rmi all --volumes --remove-orphans
# 	@make docker-images-prune
destroy-volumes:
	docker compose down --volumes --remove-orphans
docker-images-prune:
	docker image prune -f
ps:
	docker compose ps

logs:
	docker compose logs
log.watch:
	docker compose logs --follow
log.api:
	docker compose logs api
log.api.watch:
	docker compose logs --follow api
log.ui:
	docker compose logs ui
log.ui.watch:
	docker compose logs --follow ui
log.db:
	docker compose logs db
log.db.watch:
	docker compose logs --follow db


db.fresh:
	docker compose exec api php artisan migrate:fresh --seed
db.migrate:
	docker compose exec api php artisan migrate
db.seed:
	docker compose exec api php artisan db:seed
db.reset:
	docker compose exec api php artisan migrate:reset
