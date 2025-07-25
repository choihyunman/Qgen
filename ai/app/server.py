import logging
from fastapi import FastAPI
from app.problem_generator.chatgpt import router as chatgpt_router
from app.health_check.health_check import router as health_router
from app.rag.router import router as rag_router
from app.embedding.build import router as build_router
from app.embedding.embedding import router as embedding_router
from app.embedding.reranker import router as reranker_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI()

app.include_router(health_router, prefix="/api/ai")
app.include_router(chatgpt_router, prefix="/api/ai")
app.include_router(rag_router, prefix="/api/ai")
app.include_router(embedding_router, prefix="/api/ai")
app.include_router(build_router, prefix="/api/ai")
app.include_router(reranker_router, prefix="/api/ai")

