from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.database import Base, engine
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router

BASE_DIR = Path(__file__).resolve().parent


app = FastAPI(
    title="SDET Practice Application",
    version="1.0.0",
)


Base.metadata.create_all(bind=engine)


app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static",
)


templates = Jinja2Templates(directory=BASE_DIR / "templates")

app.include_router(auth_router)
app.include_router(users_router)


@app.get(
    "/",
    response_class=HTMLResponse,
)
def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
    )


@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "sdet-practice-app",
    }
