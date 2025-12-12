from pydantic import BaseModel

class UserSignup(BaseModel):
    email: str
    password: str
    username: str = None

class UserLogin(BaseModel):
    email: str
    password: str


