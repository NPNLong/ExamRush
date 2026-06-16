from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Postgres (local)
    DATABASE_URL: str = "postgresql://examrush:examrush@localhost:5433/examrush"

    # Redis (local)
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SECONDS: int = 60

    # JWT / Auth
    SECRET_KEY: str = "change-this-secret-key-in-production-32chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 * 7  # 7 days

    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
