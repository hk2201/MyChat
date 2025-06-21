"""Initial migration

Revision ID: b54f7cc5af9c
Revises: 3392abf69aaf
Create Date: 2025-06-18 20:04:17.906481

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b54f7cc5af9c'
down_revision: Union[str, Sequence[str], None] = '3392abf69aaf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
