# LivePortrait

# Set env with available GPU
```bash
export CUDA_VISIBLE_DEVICES=2,3
```

# Execution
```bash
python inference.py -s ./inputs/images/test1.png -d ./inputs/videos/test2.mp4
```

Run server
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8070
```
endpoint

ikala4 : 
frontend 172.21.10.105:3000

server : 172.21.10.105:8091
