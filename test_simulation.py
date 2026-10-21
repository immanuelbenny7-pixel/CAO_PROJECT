# Verify course examples
# Example 1: Signed magnitude 23 x 19 = 437
# Example 2: Booth -9 x -13 = 117

def test_signed_magnitude(B_val, Q_val, width=5):
    print(f"--- Signed Magnitude: {B_val} x {Q_val} (width={width}) ---")
    B_bin = f"{abs(B_val):0{width}b}"
    Q_bin = f"{abs(Q_val):0{width}b}"
    A_bin = "0" * width
    E = 0
    SC = width
    print(f"Initial: E={E}, A={A_bin}, Q={Q_bin}, SC={SC}")
    
    step = 1
    while SC > 0:
        Qn = Q_bin[-1]
        if Qn == '1':
            # Add B to A
            total = int(A_bin, 2) + int(B_bin, 2)
            E = 1 if total >= (1 << width) else 0
            A_bin = f"{(total % (1 << width)):0{width}b}"
            print(f"Step {step} (Add): E={E}, A={A_bin}, Q={Q_bin}, SC={SC}")
            step += 1
        
        # Shift EAQ
        old_E = E
        new_Q = A_bin[-1] + Q_bin[:-1]
        new_A = str(old_E) + A_bin[:-1]
        E = 0
        SC -= 1
        A_bin = new_A
        Q_bin = new_Q
        print(f"Step {step} (Shift): E={E}, A={A_bin}, Q={Q_bin}, SC={SC}")
        step += 1
    
    prod_mag = int(A_bin + Q_bin, 2)
    print(f"Final AQ = {A_bin} {Q_bin} = {prod_mag}")
    assert prod_mag == 437, f"Expected 437, got {prod_mag}"
    print("SUCCESS: Signed Magnitude matches course slide 437 exactly!")

def to_twos_comp(val, width):
    if val >= 0:
        return f"{val:0{width}b}"
    else:
        return f"{((1 << width) + val):0{width}b}"

def test_booth(BR_val, QR_val, width=5):
    print(f"\n--- Booth Algorithm: {BR_val} x {QR_val} (width={width}) ---")
    BR_bin = to_twos_comp(BR_val, width)
    neg_BR_bin = to_twos_comp(-BR_val, width)
    QR_bin = to_twos_comp(QR_val, width)
    AC_bin = "0" * width
    Qn1 = '0'
    SC = width
    print(f"Initial: AC={AC_bin}, QR={QR_bin}, Qn+1={Qn1}, SC={SC}")
    print(f"BR = {BR_bin}, -BR = {neg_BR_bin}")
    
    step = 1
    while SC > 0:
        Qn = QR_bin[-1]
        pair = Qn + Qn1
        if pair == '10': # Sub BR
            total = int(AC_bin, 2) + int(neg_BR_bin, 2)
            AC_bin = f"{(total % (1 << width)):0{width}b}"
            print(f"Step {step} (Sub BR): AC={AC_bin}, QR={QR_bin}, Qn+1={Qn1}, SC={SC}")
            step += 1
        elif pair == '01': # Add BR
            total = int(AC_bin, 2) + int(BR_bin, 2)
            AC_bin = f"{(total % (1 << width)):0{width}b}"
            print(f"Step {step} (Add BR): AC={AC_bin}, QR={QR_bin}, Qn+1={Qn1}, SC={SC}")
            step += 1
        
        # Ashr
        new_Qn1 = QR_bin[-1]
        new_QR = AC_bin[-1] + QR_bin[:-1]
        new_AC = AC_bin[0] + AC_bin[:-1]
        SC -= 1
        AC_bin = new_AC
        QR_bin = new_QR
        Qn1 = new_Qn1
        print(f"Step {step} (Ashr): AC={AC_bin}, QR={QR_bin}, Qn+1={Qn1}, SC={SC}")
        step += 1
    
    full_bin = AC_bin + QR_bin
    val = int(full_bin, 2)
    if full_bin[0] == '1':
        val -= (1 << (width * 2))
    print(f"Final AC QR = {AC_bin} {QR_bin} = {val}")
    assert val == 117, f"Expected 117, got {val}"
    print("SUCCESS: Booth matches course slide 117 exactly!")

test_signed_magnitude(23, 19, 5)
test_booth(-9, -13, 5)
