"""Init file for routers package"""
from .predict import router as predict_router
from .health import router as health_router
from .foods import router as foods_router

__all__ = ['predict_router', 'health_router', 'foods_router']
