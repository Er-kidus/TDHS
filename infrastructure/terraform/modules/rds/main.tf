variable "db_name"     { default = "tenadam" }
variable "db_username" { default = "tenadam" }
variable "db_password" {}
variable "subnet_ids"  { type = list(string) }
variable "vpc_id"      {}

resource "aws_db_instance" "tenadam" {
  identifier           = "tenadam-postgres"
  engine               = "postgres"
  engine_version       = "16.2"
  instance_class       = "db.t4g.medium"
  allocated_storage    = 100
  db_name              = var.db_name
  username             = var.db_username
  password             = var.db_password
  vpc_security_group_ids = []
  db_subnet_group_name = aws_db_subnet_group.tenadam.name
  skip_final_snapshot  = false
  deletion_protection  = true
}

resource "aws_db_subnet_group" "tenadam" {
  name       = "tenadam-db-subnet"
  subnet_ids = var.subnet_ids
}

output "endpoint" { value = aws_db_instance.tenadam.endpoint }
