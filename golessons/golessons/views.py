# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from sgfs import SGFS
from translate_sgf import translate_sgf
from django.http import JsonResponse


def my_view(request, id):
    return JsonResponse(translate_sgf(SGFS[int(id)]), safe=False)
