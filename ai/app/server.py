from fastapi import FastAPI
from app.problem_generator.chatgpt import router as chatgpt_router
from app.health_check.health_check import router as health_router
from app.docling.docling import router as docling_router

app = FastAPI()

app.include_router(health_router, prefix="/api/ai")
app.include_router(chatgpt_router, prefix="/api/ai")
app.include_router(docling_router, prefix="/api/ai")