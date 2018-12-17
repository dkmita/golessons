# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json

from sgfs import SGFS
from translate_sgf import translate_sgf
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


def get_game_tree(request, id):
    return JsonResponse(translate_sgf(SGFS[int(id)]), safe=False)


def get_lesson(request, lesson):
    f = open("/Users/Dom/PycharmProjects/golessons/golessons/db/" + lesson + ".txt", "r")
    lesson_json = json.loads(f.readline())
    return JsonResponse(lesson_json, safe=False)


@csrf_exempt
def post_lesson(request):
    request_params = json.loads(request.body)
    lesson_name = request_params['lessonName']
    lesson_json = request_params['lessonJson']
    f = open("/Users/Dom/PycharmProjects/golessons/golessons/db/" + lesson_name + ".txt", "w+")
    f.write(lesson_json)
    f.close()
    return JsonResponse("Success", safe=False)





