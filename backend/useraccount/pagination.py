# pagination.py
from rest_framework.pagination import PageNumberPagination


class SmallResultsSetPagination(PageNumberPagination):
    page_size = 2  # default if none provided
    page_size_query_param = "page_size"  # lets frontend set ?page_size=2
    max_page_size = 100  # maximum allowed
