"""
ASGI config for djangoProject project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
asgi_application = get_asgi_application()

# pylint: disable=wrong-import-position
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter
from channels.routing import URLRouter
from .routing import ws_urlpatterns
# pylint: enable=wrong-import-position


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'embark.settings')

application = ProtocolTypeRouter({
    'http': asgi_application,
    'websocket': AuthMiddlewareStack(URLRouter(ws_urlpatterns))
})
