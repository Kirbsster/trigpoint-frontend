import reflex as rx
import os
from dotenv import load_dotenv

load_dotenv('.env')
config = rx.Config(
    app_name="app",
    port=int(os.getenv("RF_PORT", "3000")),
)
