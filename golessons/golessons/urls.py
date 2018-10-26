from django.conf.urls import url, include
from django.contrib import admin
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    #url(r'^admin/', include(admin.site.urls)),
    url(r'^api/.*', views.my_view),
    url('.*', TemplateView.as_view(template_name='index.html')),
]
