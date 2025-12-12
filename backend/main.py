from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.db import engine
import models
from routers.auth import auth_router
from routers.communities import community_router
from routers.memberships import membership_router
from routers.posts import post_router
from routers.comments import comment_router
from routers.likes import like_router
from routers.chat import chat_router
from routers.users import user_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(community_router.router)
app.include_router(membership_router.router)
app.include_router(post_router.router)
app.include_router(comment_router.router)
app.include_router(like_router.router)
app.include_router(chat_router.router)
app.include_router(user_router.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}