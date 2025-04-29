from fastapi import FastAPI
from app.problem_generator.chatgpt import router as chatgpt_router
# from upload import router as upload_router

app = FastAPI()

app.include_router(chatgpt_router, prefix="/api/ai")
# app.include_router(upload_router, prefix="/api/ai/upload")