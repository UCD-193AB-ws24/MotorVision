    # tello_address = ('192.168.10.1', 8889)
    # sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    # sock.bind(('', 9000))

    # def send(cmd):
    #     print(f">> {cmd}")
    #     sock.sendto(cmd.encode('utf-8'), tello_address)
    #     time.sleep(2)

    # try:
    #     send("command")
    #     send("takeoff")
    #     time.sleep(5)
    #     send("land")
    # finally:
    #     sock.close()


#~~~~~~~~~~~~~~~~~~~~~

# # basic multi-threaded script
# import threading
# import time
# import cv2


# def thread_function_1():
#     while True:
#         print("🧵 Thread 1: Running")
#         time.sleep(2)

# def thread_function_2():
#     while True:
#         print("🧵 Thread 2: Working")
#         time.sleep(3)


# # Start threads before main loop
# t1 = threading.Thread(target=thread_function_1, daemon=True)
# t2 = threading.Thread(target=thread_function_2, daemon=True)

# t1.start()
# t2.start()

# print("🔁 Main loop started. Press 'q' or 'Esc' to exit.")

# # Main loop
# while True:
#     time.sleep(1)
#     key = cv2.waitKey(1) & 0xFF
#     if key == ord('q') or key == 27:  # 27 = ESC
#         print("🛑 HIT: Exiting loop.")
#         break


#~~~~~~~~~~~~~~~~~~~~~

def greet():
    return "Hello!"

def farewell():
    return "Goodbye!"

# Dict mapping names to functions
actions = {
    "greet": greet,
    "farewell": farewell
}

# Call by name
action_name = "greet"
result = actions[action_name]()  # Calls greet()
print(result)  # Output: Hello!

#~~~~~~~~~~~~~~~~~~~~~


#~~~~~~~~~~~~~~~~~~~~~


#~~~~~~~~~~~~~~~~~~~~~


#~~~~~~~~~~~~~~~~~~~~~


#~~~~~~~~~~~~~~~~~~~~~


#~~~~~~~~~~~~~~~~~~~~~


#~~~~~~~~~~~~~~~~~~~~~


#~~~~~~~~~~~~~~~~~~~~~

#~~~~~~~~~~~~~~~~~~~~~

#~~~~~~~~~~~~~~~~~~~~~
