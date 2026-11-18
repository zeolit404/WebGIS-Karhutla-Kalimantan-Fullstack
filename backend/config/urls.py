from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'app': 'WebGIS Karhutla Django GraphQL Backend',
        'database': 'PostgreSQL PostGIS (webgis_karhutla_kalimantan)'
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('graphql', csrf_exempt(GraphQLView.as_view(graphiql=True))),
    path('api/health', health_check),
]
