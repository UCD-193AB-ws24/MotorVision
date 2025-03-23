s0 = 4; s1 = 9


print([s0+2, s1+7])
print()
print([-(  ( 1/25)*s1 + (1/5)   ) ])
print([(( 1/25)*s0 + (2/5)) ])
print([s0/5 + 2])
print()
print([s1/25 + (2/5)])
print([-(s0/25 + (1/5))])
print(s1/5 + 2)
print()
print([s0/5 + s1/5 + 4])
print()

print([])

def printDivider():
    print('-------------------')

printDivider()

import numpy as np

m = [[-0.56, 0.56], [0.76, -0.36], [.2, 0.2]]
print(np.linalg.matrix_rank(m))

printDivider()

# 2d) 
s0 = 4; s1 = 9

y1 = ((1/2441406250*(s0**2) + 1/2441406250*(s1**2) + 7/2441406250*s0 + 17/2441406250*s1 + 8/244140625)/(1/6103515625*s0 + 1/6103515625*s1 + 3/1220703125))

y2 = ((1/953674316406250*(s0**2) + 1/953674316406250*(s1**2) + 17/953674316406250*s0 + 7/953674316406250*s1 + 3/95367431640625)/(1/2384185791015625*s0 + 1/2384185791015625*s1 + 3/476837158203125))

y3 = ((-1/156250*(s0**2) - 1/156250*(s1**2) - 7/156250*s0 - 17/156250*s1 - 8/15625)/(-1/390625*s0 - 1/390625*s1 - 3/78125))

print(f"[y1, y2, y3] = {[y1, y2, y3]}")
print()
print(f"y1 = {y1}")
print(f"y2 = {y2}")
print(f"y3 = {y3}")
print()
# RESULT:
# [y1, y2, y3] = [31.964285714285715, 23.03571428571429, 31.964285714285715]



printDivider()

print(f"\nDual objective function value: {-2.8*y1 - 3.8*y2 - 6.6*y3}")
print(f"Constraint 1 LHS evaluates to: {round(0.56*y1 - 0.76*y2 - 0.2*y3, 4)}")
print(f"Constraint 2 LHS evaluates to: {round(-0.56*y1 + 0.36*y2 - 0.2*y3, 4)}\n")
