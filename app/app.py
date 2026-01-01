import os

import reflex as rx

# Import pages so @rx.page routes are registered
import app.pages.index      
import app.pages.login      
import app.pages.register   
import app.pages.verify
import app.pages.forgot
import app.pages.reset
import app.pages.bikes
import app.pages.bike_analyser
import app.pages.sheds
import app.pages.shed

app = rx.App(
    stylesheets=["/theme.css"],      # served from assets/theme.css
)