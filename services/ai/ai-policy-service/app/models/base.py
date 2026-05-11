from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BaseResponse(BaseModel):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
