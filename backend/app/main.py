from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import destinations, businesses, auth, trips, admin, ai

app = FastAPI(title="TravelConnect API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(destinations.router, prefix="/api/destinations", tags=["destinations"])
app.include_router(businesses.router, prefix="/api/businesses", tags=["businesses"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(trips.router, prefix="/api/trips", tags=["trips"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])


@app.get("/")
def root():
    return {"message": "TravelConnect API"}
