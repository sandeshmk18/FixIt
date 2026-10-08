from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "FixIt API"
    env: str = "development"
    secret_key: str = "change-me-in-production"
    database_url: str = "sqlite:///./fixit.db"
    access_token_expire_minutes: int = 60 * 24
    algorithm: str = "HS256"
    cors_allowed_origins: list[str] = [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "http://127.0.0.1:8002",
        "http://localhost:8002",
    ]
    cors_allowed_origin_regex: str = r"https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
