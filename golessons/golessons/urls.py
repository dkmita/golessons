from django.conf.urls import url, include
from django.contrib import admin
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    #url(r'^admin/', include(admin.site.urls)),
    url(r'^api/problem/(?P<id>\d{0,15})/$', views.get_game_tree),
    url(r'^api/lesson/(?P<lesson>\S{0,32})/$', views.get_lesson),
    url(r'^api/save-lesson$', views.post_lesson),
    url('.*', TemplateView.as_view(template_name='index.html')),
]
