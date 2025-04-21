from rest_framework.response import Response
from rest_framework.decorators import api_view


@api_view(['GET'])
def printHelloWorld(request):
    name = request.GET.get('name')
    favorite_team = request.GET.get('favorite-team')
    # printedVal = {'message': 'Hello World!'}
    if name:
        printedVal = {'message': f'Hello, {name}, your favorite basketball team is the {favorite_team}!'}

    else:
        printedVal = {'message': 'Hello World!'}
    return Response(printedVal)


@api_view(['GET'])
def printSomething(request):
    name = request.GET.get('name')
    favorite_team = request.GET.get('favorite-team')
    # printedVal = {'message': 'Hello World!'}
    if name:
        printedVal = {'message': f'Hello, {name}, your least favorite basketball team is the {favorite_team}!'}
        print("wer got in name")
    else:
        printedVal = {'message': 'Hello World!'}
    return Response(printedVal)
