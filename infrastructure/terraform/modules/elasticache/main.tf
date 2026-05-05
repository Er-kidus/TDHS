variable "subnet_ids" { type = list(string) }

resource "aws_elasticache_subnet_group" "tenadam" {
  name       = "tenadam-redis-subnet"
  subnet_ids = var.subnet_ids
}

resource "aws_elasticache_cluster" "tenadam" {
  cluster_id           = "tenadam-redis"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.tenadam.name
}

output "endpoint" { value = aws_elasticache_cluster.tenadam.cache_nodes[0].address }
