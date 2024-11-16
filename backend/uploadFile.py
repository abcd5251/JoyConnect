from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
from typing import Dict
import shutil

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware for logging
@app.middleware("http")
async def log_requests(request, call_next):
    print(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    print(f"Response status code: {response.status_code}")
    return response

# Base directory for storing files
STORAGE_DIR = "storage"
os.makedirs(STORAGE_DIR, exist_ok=True)

@app.post("/buckets/{bucket_name}/files")
async def upload_file(bucket_name: str, file: UploadFile = File(...)) -> Dict:
    try:
        bucket_path = os.path.join(STORAGE_DIR, bucket_name)
        os.makedirs(bucket_path, exist_ok=True)
        
        file_path = os.path.join(bucket_path, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "bucket": bucket_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/buckets/{bucket_name}/files/{file_name}/download")
async def download_file(bucket_name: str, file_name: str):
    try:
        file_path = os.path.join(STORAGE_DIR, bucket_name, file_name)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
            
        return FileResponse(
            file_path,
            media_type="application/octet-stream",
            filename=file_name
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/buckets")
async def create_bucket(bucket_name: str) -> Dict:
    try:
        bucket_path = os.path.join(STORAGE_DIR, bucket_name)
        if os.path.exists(bucket_path):
            raise HTTPException(
                status_code=400,
                detail=f"Bucket '{bucket_name}' already exists"
            )
            
        os.makedirs(bucket_path)
        return {
            "message": "Bucket created successfully",
            "bucket_name": bucket_name
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))