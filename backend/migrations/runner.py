"""Migration runner for deployment."""

import asyncio
import importlib
import sys
from pathlib import Path

from sqlalchemy import text

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import database
from database import init_db, close_db


async def run_migrations():
    """Run all pending migrations."""
    await init_db()

    async with database._engine.begin() as conn:
        # Create migrations tracking table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS _migrations (
                id VARCHAR(100) PRIMARY KEY,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # Get applied migrations
        result = await conn.execute(text("SELECT id FROM _migrations"))
        applied = {row[0] for row in result.fetchall()}

    # Find migration files
    migrations_dir = Path(__file__).parent
    migration_files = sorted(migrations_dir.glob("[0-9]*.py"))

    for migration_file in migration_files:
        module_name = migration_file.stem
        migration_module = importlib.import_module(f"migrations.{module_name}")
        migration_id = getattr(migration_module, "MIGRATION_ID", module_name)

        if migration_id in applied:
            print(f"Skipping {migration_id} (already applied)")
            continue

        print(f"Applying {migration_id}...")
        async with database._engine.begin() as conn:
            await migration_module.up(conn)

        # Record migration as applied
        async with database._engine.begin() as conn:
            await conn.execute(
                text("INSERT INTO _migrations (id) VALUES (:id)"),
                {"id": migration_id}
            )
        print(f"Applied {migration_id}")

    await close_db()
    print("Migrations complete")


async def revert_migration(migration_id: str):
    """Mark a migration as not applied (remove from tracking table)."""
    await init_db()

    async with database._engine.begin() as conn:
        result = await conn.execute(
            text("DELETE FROM _migrations WHERE id = :id"),
            {"id": migration_id}
        )
        if result.rowcount > 0:
            print(f"Reverted {migration_id} (marked as not applied)")
        else:
            print(f"Migration {migration_id} was not found in applied migrations")

    await close_db()


async def list_migrations():
    """List all migrations and their status."""
    await init_db()

    async with database._engine.begin() as conn:
        result = await conn.execute(text("SELECT id, applied_at FROM _migrations ORDER BY id"))
        applied = {row[0]: row[1] for row in result.fetchall()}

    migrations_dir = Path(__file__).parent
    migration_files = sorted(migrations_dir.glob("[0-9]*.py"))

    print("\nMigrations:")
    for migration_file in migration_files:
        module_name = migration_file.stem
        migration_module = importlib.import_module(f"migrations.{module_name}")
        migration_id = getattr(migration_module, "MIGRATION_ID", module_name)

        if migration_id in applied:
            print(f"  [x] {migration_id} (applied: {applied[migration_id]})")
        else:
            print(f"  [ ] {migration_id}")

    await close_db()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "revert" and len(sys.argv) > 2:
            asyncio.run(revert_migration(sys.argv[2]))
        elif command == "list":
            asyncio.run(list_migrations())
        else:
            print("Usage:")
            print("  python -m migrations.runner          # Run pending migrations")
            print("  python -m migrations.runner list     # List all migrations")
            print("  python -m migrations.runner revert <id>  # Mark migration as not applied")
    else:
        asyncio.run(run_migrations())
