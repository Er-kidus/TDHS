docker run --rm -v pg_data:/volume -v "${PWD}:/backup" alpine tar -czf /backup/pg_data_volume.tar.gz -C /volume .

docker run --rm -v pg_data:/volume -v "${PWD}:/backup" alpine sh -c "tar -xzf /backup/pg_data_volume.tar.gz -C /volume"