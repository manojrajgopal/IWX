from fastapi import FastAPI
from routers import virtual_try_on
from routers.token_manager import token_manager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Virtual Try-On API",
    description="API for virtual try-on with token rotation",
    version="1.0.0"
)

# Include routers with API prefix
app.include_router(virtual_try_on.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    await token_manager.start_processor()

@app.get("/")
async def root():
    return {"message": "Virtual Try-On API is running", "status": "healthy"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "virtual-try-on-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8011)