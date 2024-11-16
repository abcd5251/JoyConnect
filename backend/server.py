from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn
import uuid
import subprocess
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
from typing import Dict
import shutil

app = FastAPI()

# middleware
app.add_middleware(
    CORSMiddleware, 
    allow_credentials=True, 
    allow_origins=["*"], 
    allow_methods=["*"], 
    allow_headers=["*"]
)

images_dir = "./inputs/images/"
video_dir = "./inputs/videos/"
output_dir = "./animations"

@app.post("/uploadImage/")
async def upload_image(image: UploadFile = File(...), number: int = Form(...)):
    # Generate a unique filename using UUID
    unique_filename = uuid.uuid4()
    image_path = os.path.join(images_dir, f"{unique_filename}.jpg")
    
    # Save the uploaded image
    with open(image_path, "wb") as buffer:
        buffer.write(await image.read())

    # Define the video path
    video_name = f"test{number}"
    video_path = os.path.join(video_dir, f"{video_name}.mp4")
    template_path = os.path.join(video_dir, f"{video_name}.pkl")
    
    # Run the command to generate the video
    try:
        command = f"python inference.py -s {image_path} -d {template_path}"
        subprocess.run(command, shell=True, check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}")
        return JSONResponse(content='{"error": "' + str(e) + '"}', status_code=500)
    
    return_video = os.path.join(output_dir, f"{unique_filename}--{video_name}.mp4")
    return FileResponse(return_video, media_type="video/mp4")

@app.post("/uploadFiles/")
async def upload_files(image: UploadFile = File(...), video: UploadFile = File(...)):
    # Generate unique filenames using UUID
    image_filename = uuid.uuid4()
    video_filename = uuid.uuid4()
    image_path = os.path.join("./inputs/images", f"{image_filename}.jpg")
    video_path = os.path.join("./inputs/videos", f"{video_filename}.mp4")
    
    # Save the uploaded image
    with open(image_path, "wb") as buffer:
        buffer.write(await image.read())

    # Save the uploaded video
    with open(video_path, "wb") as buffer:
        buffer.write(await video.read())

    # Define the output video path
    output_video_path = os.path.join(output_dir, f"{image_filename}--{video_filename}.mp4")

    # Run the external command to generate the video
    try:
        command = f"python inference.py -s {image_path} -d {video_path}"
        result = subprocess.run(command, shell=True, check=True)

    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}")
        #raise HTTPException(status_code=500, detail="Video generation failed")
        return JSONResponse(content='{"error": "' + str(e) + '"}', status_code=500)

    return FileResponse(output_video_path, media_type="video/mp4")

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
