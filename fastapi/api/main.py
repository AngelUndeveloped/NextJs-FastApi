from fastapi import FastAPI

app = FastAPI(title="FastAPI + NextJS", description="FastAPI + NextJS practice project")

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.get("/hello")
def hello():
    return {"message": "Hello, World!"}