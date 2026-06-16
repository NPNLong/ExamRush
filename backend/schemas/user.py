from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=3, max_length=128)
    display_name: Optional[str] = Field(None, max_length=100)

    @field_validator("username")
    @classmethod
    def username_alnum(cls, v: str) -> str:
        v = v.strip()
        if not v.replace("_", "").replace(".", "").isalnum():
            raise ValueError("Tên đăng nhập chỉ gồm chữ, số, dấu chấm hoặc gạch dưới")
        return v


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    display_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
