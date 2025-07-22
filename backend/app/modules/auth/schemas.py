from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class User(BaseModel):
    id: uuid.UUID
    email: str
    subscription_tier: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserInDB(User):
    password_hash: str