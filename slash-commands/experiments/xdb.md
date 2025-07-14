---
description: Comprehensive database management, migrations, and performance operations
tags: [database, schema, migration, performance, backup]
---

Perform database operations based on the arguments provided in $ARGUMENTS.

First, examine the project for database configuration and tools:
!ls -la | grep -E "(database|db|migration|schema)"
!find . -name "*.sql" -o -name "*migration*" -o -name "*schema*" | head -10
!which psql 2>/dev/null || which mysql 2>/dev/null || which sqlite3 2>/dev/null || echo "No database clients found"

Based on $ARGUMENTS, perform the appropriate database operation:

## 1. Schema Management

If managing schema (--schema):
!find . -name "schema.sql" -o -name "*.schema" | head -5
!ls models/ 2>/dev/null || ls app/models/ 2>/dev/null || echo "No models directory found"

For schema operations:
- Check existing schema files
- Validate schema syntax
- Generate schema documentation
- Compare schema versions

## 2. Migration Operations

If handling migrations (--migrate):
!find . -name "*migration*" -o -path "*/migrations/*" | head -10
!python manage.py showmigrations 2>/dev/null || rails db:migrate:status 2>/dev/null || echo "No migration framework detected"

Migration tasks:
- Check migration status
- Run pending migrations
- Create new migration files
- Rollback migrations if needed

## 3. Data Seeding

If seeding data (--seed):
!find . -name "*seed*" -o -name "*fixture*" | head -5
!python manage.py loaddata 2>/dev/null || rails db:seed 2>/dev/null || echo "No seeding framework detected"

Seeding operations:
- Load test fixtures
- Populate sample data
- Environment-specific seeding
- Data validation after seeding

## 4. Performance Analysis

If analyzing performance (--performance):
!ps aux | grep -E "(postgres|mysql|sqlite)" | head -3
!top -l 1 | grep -E "(CPU|Memory)" 2>/dev/null || echo "System stats not available"

Performance checks:
- Database connection status
- Query performance analysis
- Index optimization suggestions
- Resource usage monitoring

## 5. Backup Operations

If performing backup (--backup):
!ls -la *.sql *.dump 2>/dev/null || echo "No backup files found"
!which pg_dump 2>/dev/null || which mysqldump 2>/dev/null || echo "No backup tools found"

Backup tasks:
- Create database backups
- Verify backup integrity
- Schedule automated backups
- Test restore procedures

## 6. Database Testing

If testing database (--test):
!python -m pytest tests/test_*db* 2>/dev/null || npm test 2>/dev/null || echo "No database tests found"
!find . -name "*test*" | grep -i db | head -5

Testing operations:
- Run database unit tests
- Test migration scripts
- Validate data integrity
- Check constraint violations

## 7. Connection and Status

Check database connectivity:
!python -c "import sqlite3; print('SQLite available')" 2>/dev/null || echo "SQLite not available"
!python -c "import psycopg2; print('PostgreSQL client available')" 2>/dev/null || echo "PostgreSQL client not available"
!python -c "import pymongo; print('MongoDB client available')" 2>/dev/null || echo "MongoDB client not available"

Think step by step about database operations and provide:
- Current database status
- Available operations for detected database type
- Recommendations for database optimization
- Best practices for data management
- Security considerations

Generate database management report with actionable recommendations.

