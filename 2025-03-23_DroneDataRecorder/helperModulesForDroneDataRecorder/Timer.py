import time

class Timer:
    _start_time = -1
    _end_time = -1

    @classmethod
    def s(cls):
        cls._start_time = time.time()

    @classmethod
    def e(cls, msg="goalPointX"):
        cls._end_time = time.time()
        duration = cls._end_time - cls._start_time
        print(f"reached \"{msg}\" ---> time taken: {duration:.4f} [s] = {duration / 60:.4f} [min]")
        cls._start_time = time.time()

    # @classmethod
    # def rs(cls):
    #     cls._end_time = time.time()
    #     duration = cls._end_time - cls._start_time
    #     print(f"time taken: {duration:.4f} [s] = {duration / 60:.4f} [min]")
    #     cls._start_time = time.time()

