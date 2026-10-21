/**
 * Inside the Multiplier - Register Simulation Engine
 * Computer Organization and Architecture (CAO) Educational Lab
 * 
 * Provides bit-accurate hardware register simulation for:
 * 1. Signed-Magnitude Multiplication
 * 2. Booth's Algorithm (Signed 2's Complement Multiplication)
 */

const MultiplierEngine = (() => {
  // Helper: Convert positive number to binary string of width n
  function toUnsignedBinary(num, width) {
    const val = BigInt(num);
    let bin = val.toString(2);
    if (bin.length < width) {
      bin = '0'.repeat(width - bin.length) + bin;
    } else if (bin.length > width) {
      bin = bin.slice(bin.length - width);
    }
    return bin;
  }

  // Helper: Convert signed integer to 2's complement binary string of width n
  function toTwosComplement(num, width) {
    const n = BigInt(num);
    const minVal = -(1n << BigInt(width - 1));
    const maxVal = (1n << BigInt(width - 1)) - 1n;
    if (n < minVal || n > maxVal) {
      throw new Error(`Value ${num} is out of range for ${width}-bit 2's complement [${minVal}, ${maxVal}]`);
    }

    if (n >= 0n) {
      return toUnsignedBinary(n, width);
    } else {
      const posVal = (1n << BigInt(width)) + n;
      return toUnsignedBinary(posVal, width);
    }
  }

  // Helper: Convert 2's complement binary string to signed BigInt
  function fromTwosComplement(binStr) {
    const width = binStr.length;
    const isNegative = binStr[0] === '1';
    const rawVal = BigInt('0b' + binStr);
    if (isNegative) {
      return rawVal - (1n << BigInt(width));
    }
    return rawVal;
  }

  // Helper: Add two binary strings of equal width, returns { sum: string, carryOut: number }
  function addBinary(aStr, bStr) {
    const len = aStr.length;
    let carry = 0;
    let sum = '';
    for (let i = len - 1; i >= 0; i--) {
      const bitA = parseInt(aStr[i], 10);
      const bitB = parseInt(bStr[i], 10);
      const total = bitA + bitB + carry;
      sum = (total % 2) + sum;
      carry = Math.floor(total / 2);
    }
    return { sum, carryOut: carry };
  }

  // Helper: 2's complement negation of a binary string
  function twosComplementNegate(binStr) {
    // Invert bits
    let inverted = '';
    for (let i = 0; i < binStr.length; i++) {
      inverted += binStr[i] === '0' ? '1' : '0';
    }
    // Add 1
    const { sum } = addBinary(inverted, '0'.repeat(binStr.length - 1) + '1');
    return sum;
  }

  // =========================================================================
  // 1. SIGNED-MAGNITUDE MULTIPLICATION
  // =========================================================================
  /**
   * Simulates Signed-Magnitude multiplication following Mano's CAO convention:
   * Multiplicand sign Bs, magnitude B (n bits)
   * Multiplier sign Qs, magnitude Q (n bits)
   * Product sign As = Qs ⊕ Bs
   * Accumulator A (n bits) = 0
   * Carry flip-flop E = 0
   * Sequence counter SC = n
   *
   * Iteration:
   *   Check Q_n (LSB of Q):
   *     If Q_n = 1: EA <- A + B (Add step)
   *     Then: Shift Right EAQ (E shifts to A MSB, A LSB shifts to Q MSB, Q LSB discarded, 0 into E)
   *           SC <- SC - 1
   *     If Q_n = 0: Skip add, perform Shift Right EAQ, SC <- SC - 1
   *   Repeat until SC = 0.
   */
  function simulateSignedMagnitude(multiplicandVal, multiplierVal, width = 5) {
    const B_sign = multiplicandVal < 0 ? 1 : 0;
    const Q_sign = multiplierVal < 0 ? 1 : 0;
    const prodSign = B_sign ^ Q_sign;

    const B_mag = Math.abs(multiplicandVal);
    const Q_mag = Math.abs(multiplierVal);

    const maxMag = (1 << width) - 1;
    if (B_mag > maxMag) {
      throw new Error(`Multiplicand magnitude ${B_mag} exceeds ${width}-bit limit (${maxMag})`);
    }
    if (Q_mag > maxMag) {
      throw new Error(`Multiplier magnitude ${Q_mag} exceeds ${width}-bit limit (${maxMag})`);
    }

    const B_bin = toUnsignedBinary(B_mag, width);
    let Q_bin = toUnsignedBinary(Q_mag, width);
    let A_bin = '0'.repeat(width);
    let E_val = 0;
    let SC_val = width;

    const steps = [];

    // Initial Step (Step 0)
    steps.push({
      stepIndex: 0,
      operation: 'Initialization',
      microOp: 'A ← 0, E ← 0, SC ← n',
      flowchartNodeId: 'node-init',
      hardwareActive: ['reg-b', 'reg-q', 'reg-a', 'reg-e', 'reg-sc'],
      E: E_val,
      A: A_bin,
      Q: Q_bin,
      SC: SC_val,
      SC_bin: toUnsignedBinary(SC_val, 3),
      B: B_bin,
      Qn: Q_bin[width - 1],
      highlightRegs: ['A', 'E', 'SC'],
      explanation: `Loaded |B| = ${B_mag} (${B_bin}) and |Q| = ${Q_mag} (${Q_bin}). Cleared Accumulator A to ${A_bin}, E to 0. Initialized Sequence Counter SC = ${SC_val}. Product sign is calculated as Bs ⊕ Qs = ${B_sign} ⊕ ${Q_sign} = ${prodSign} (${prodSign === 1 ? 'Negative' : 'Positive'}).`
    });

    let currentStepNum = 1;
    while (SC_val > 0) {
      const qLSB = Q_bin[width - 1];
      const isOne = qLSB === '1';

      if (isOne) {
        // Step A: Add B to A
        const addRes = addBinary(A_bin, B_bin);
        const oldA = A_bin;
        const oldE = E_val;
        A_bin = addRes.sum;
        E_val = addRes.carryOut;

        steps.push({
          stepIndex: currentStepNum++,
          iteration: width - SC_val + 1,
          operation: 'Add',
          microOp: 'EA ← A + B',
          flowchartNodeId: 'node-add',
          hardwareActive: ['reg-adder', 'reg-a', 'reg-e', 'reg-b'],
          E: E_val,
          A: A_bin,
          Q: Q_bin,
          SC: SC_val,
          SC_bin: toUnsignedBinary(SC_val, 3),
          B: B_bin,
          Qn: qLSB,
          highlightRegs: ['A', 'E'],
          explanation: `Since multiplier LSB Qn = 1: Add multiplicand B (${B_bin}) to A (${oldA}). Result: A = ${A_bin}, Carry E = ${E_val}.`
        });
      }

      // Step B: Shift Right EAQ
      const oldE = E_val;
      const oldA = A_bin;
      const oldQ = Q_bin;

      const newQ = oldA[width - 1] + oldQ.slice(0, width - 1);
      const newA = String(oldE) + oldA.slice(0, width - 1);
      const newE = 0;
      SC_val -= 1;

      A_bin = newA;
      Q_bin = newQ;
      E_val = newE;

      steps.push({
        stepIndex: currentStepNum++,
        iteration: width - SC_val,
        operation: 'Shift',
        microOp: 'Shr EAQ, SC ← SC - 1',
        flowchartNodeId: SC_val === 0 ? 'node-check-sc' : 'node-shift',
        hardwareActive: ['reg-shift', 'reg-e', 'reg-a', 'reg-q', 'reg-sc'],
        E: E_val,
        A: A_bin,
        Q: Q_bin,
        SC: SC_val,
        SC_bin: toUnsignedBinary(SC_val, 3),
        B: B_bin,
        Qn: Q_bin[width - 1],
        highlightRegs: ['E', 'A', 'Q', 'SC'],
        explanation: `Shift right EAQ: 0 into E, previous E (${oldE}) into A MSB, A LSB into Q MSB. Decremented SC to ${SC_val}.`
      });
    }

    // End Step: Product is in AQ with sign
    const finalAQ = A_bin + Q_bin;
    const finalMag = parseInt(finalAQ, 2);
    const finalDecimal = prodSign === 1 ? -finalMag : finalMag;

    steps.push({
      stepIndex: currentStepNum,
      operation: 'Complete',
      microOp: 'END (Product in AQ)',
      flowchartNodeId: 'node-end',
      hardwareActive: ['reg-a', 'reg-q'],
      E: E_val,
      A: A_bin,
      Q: Q_bin,
      SC: 0,
      SC_bin: toUnsignedBinary(0, 3),
      B: B_bin,
      Qn: Q_bin[width - 1],
      highlightRegs: ['A', 'Q'],
      explanation: `Multiplication finished (SC = 0). Combined product in AQ = ${A_bin} ${Q_bin} (Binary magnitude: ${finalMag}). Applying computed sign (${prodSign === 1 ? '-' : '+'}) gives final product ${finalDecimal}.`
    });

    return {
      algorithm: 'signed-magnitude',
      multiplicand: multiplicandVal,
      multiplier: multiplierVal,
      width,
      B_sign,
      Q_sign,
      prodSign,
      B_bin,
      Q_bin_initial: toUnsignedBinary(Q_mag, width),
      expectedProduct: multiplicandVal * multiplierVal,
      computedProduct: finalDecimal,
      finalAQ,
      steps
    };
  }

  // =========================================================================
  // 2. BOOTH'S ALGORITHM (SIGNED 2'S COMPLEMENT)
  // =========================================================================
  /**
   * Simulates Booth's algorithm following the course reference diagram:
   * Multiplicand in BR (n bits, 2's complement)
   * Multiplier in QR (n bits, 2's complement)
   * Accumulator AC (n bits) = 0
   * Previous multiplier bit Q_{n+1} = 0 (1-bit flip-flop)
   * Sequence counter SC = n
   *
   * Iteration:
   *   Inspect pair Qn Q_{n+1}:
   *     10: AC <- AC + BR_bar + 1 (Subtract BR)
   *     01: AC <- AC + BR (Add BR)
   *     00 or 11: No addition or subtraction
   *   Then: Arithmetic right shift of [AC, QR, Q_{n+1}] (ashr preserves AC MSB sign bit)
   *         SC <- SC - 1
   *   Repeat until SC = 0.
   *   Product is in AC QR (2n bits, 2's complement).
   */
  function simulateBooth(multiplicandVal, multiplierVal, width = 5) {
    const minVal = -(1 << (width - 1));
    const maxVal = (1 << (width - 1)) - 1;

    if (multiplicandVal < minVal || multiplicandVal > maxVal) {
      throw new Error(`Multiplicand ${multiplicandVal} out of ${width}-bit 2's complement range [${minVal}, ${maxVal}]`);
    }
    if (multiplierVal < minVal || multiplierVal > maxVal) {
      throw new Error(`Multiplier ${multiplierVal} out of ${width}-bit 2's complement range [${minVal}, ${maxVal}]`);
    }

    const BR_bin = toTwosComplement(multiplicandVal, width);
    const negBR_bin = twosComplementNegate(BR_bin);
    let QR_bin = toTwosComplement(multiplierVal, width);
    let AC_bin = '0'.repeat(width);
    let Qn1_val = '0';
    let SC_val = width;

    const steps = [];

    // Initial Step (Step 0)
    steps.push({
      stepIndex: 0,
      operation: 'Initialization',
      comment: 'Initial State',
      microOp: 'AC ← 0, Qn+1 ← 0, SC ← n',
      flowchartNodeId: 'node-booth-init',
      hardwareActive: ['reg-br', 'reg-qr', 'reg-ac', 'reg-qn1', 'reg-sc'],
      AC: AC_bin,
      QR: QR_bin,
      Qn: QR_bin[width - 1],
      Qn1: Qn1_val,
      SC: SC_val,
      BR: BR_bin,
      negBR: negBR_bin,
      pair: QR_bin[width - 1] + Qn1_val,
      highlightRegs: ['AC', 'Qn1', 'SC'],
      explanation: `Loaded BR = ${multiplicandVal} (${BR_bin}), QR = ${multiplierVal} (${QR_bin}). Two's complement negation (-BR) = ${negBR_bin} (+${-multiplicandVal}). Initialized AC = ${AC_bin}, Qn+1 = 0, Sequence Counter SC = ${SC_val}.`
    });

    let currentStepNum = 1;

    while (SC_val > 0) {
      const qn = QR_bin[width - 1];
      const pair = qn + Qn1_val;

      if (pair === '10') {
        // Subtract BR: AC <- AC + negBR
        const oldAC = AC_bin;
        const addRes = addBinary(AC_bin, negBR_bin);
        AC_bin = addRes.sum;

        steps.push({
          stepIndex: currentStepNum++,
          iteration: width - SC_val + 1,
          operation: 'Subtract BR',
          comment: 'Subtract BR',
          microOp: 'AC ← AC + BR̄ + 1',
          flowchartNodeId: 'node-booth-sub',
          hardwareActive: ['reg-adder', 'reg-ac', 'reg-br', 'comp-unit'],
          AC: AC_bin,
          QR: QR_bin,
          Qn: qn,
          Qn1: Qn1_val,
          SC: SC_val,
          BR: BR_bin,
          negBR: negBR_bin,
          pair,
          highlightRegs: ['AC'],
          explanation: `Pair Qn Qn+1 = 10: Subtract BR from AC by adding BR̄ + 1 (${negBR_bin}) to AC (${oldAC}). New AC = ${AC_bin}.`
        });
      } else if (pair === '01') {
        // Add BR: AC <- AC + BR
        const oldAC = AC_bin;
        const addRes = addBinary(AC_bin, BR_bin);
        AC_bin = addRes.sum;

        steps.push({
          stepIndex: currentStepNum++,
          iteration: width - SC_val + 1,
          operation: 'Add BR',
          comment: 'Add BR',
          microOp: 'AC ← AC + BR',
          flowchartNodeId: 'node-booth-add',
          hardwareActive: ['reg-adder', 'reg-ac', 'reg-br'],
          AC: AC_bin,
          QR: QR_bin,
          Qn: qn,
          Qn1: Qn1_val,
          SC: SC_val,
          BR: BR_bin,
          negBR: negBR_bin,
          pair,
          highlightRegs: ['AC'],
          explanation: `Pair Qn Qn+1 = 01: Add BR (${BR_bin}) to AC (${oldAC}). New AC = ${AC_bin}.`
        });
      }

      // Arithmetic Right Shift: ashr (AC & QR & Qn+1), SC <- SC - 1
      const oldAC = AC_bin;
      const oldQR = QR_bin;
      const oldQn1 = Qn1_val;

      // New Qn+1 gets QR LSB
      const newQn1 = oldQR[width - 1];
      // New QR gets AC LSB + oldQR shifted right by 1
      const newQR = oldAC[width - 1] + oldQR.slice(0, width - 1);
      // New AC preserves sign bit (oldAC[0]) and shifts right
      const newAC = oldAC[0] + oldAC.slice(0, width - 1);
      SC_val -= 1;

      AC_bin = newAC;
      QR_bin = newQR;
      Qn1_val = newQn1;

      steps.push({
        stepIndex: currentStepNum++,
        iteration: width - SC_val,
        operation: 'Ashr',
        comment: 'Ashr',
        microOp: 'ashr (AC & QR & Qn+1), SC ← SC - 1',
        flowchartNodeId: SC_val === 0 ? 'node-booth-check-sc' : 'node-booth-ashr',
        hardwareActive: ['reg-shift', 'reg-ac', 'reg-qr', 'reg-qn1', 'reg-sc'],
        AC: AC_bin,
        QR: QR_bin,
        Qn: QR_bin[width - 1],
        Qn1: Qn1_val,
        SC: SC_val,
        BR: BR_bin,
        negBR: negBR_bin,
        pair: QR_bin[width - 1] + Qn1_val,
        highlightRegs: ['AC', 'QR', 'Qn1', 'SC'],
        explanation: `Arithmetic right shift: AC MSB (${oldAC[0]}) replicated, AC LSB shifted into QR MSB, QR LSB shifted into Qn+1. Decremented SC to ${SC_val}.`
      });
    }

    // End Step: Product is in AC QR
    const finalProductBin = AC_bin + QR_bin;
    const finalDecimal = Number(fromTwosComplement(finalProductBin));

    steps.push({
      stepIndex: currentStepNum,
      operation: 'Complete',
      comment: 'END',
      microOp: 'END (Product in AC & QR)',
      flowchartNodeId: 'node-booth-end',
      hardwareActive: ['reg-ac', 'reg-qr'],
      AC: AC_bin,
      QR: QR_bin,
      Qn: QR_bin[width - 1],
      Qn1: Qn1_val,
      SC: 0,
      BR: BR_bin,
      negBR: negBR_bin,
      pair: '--',
      highlightRegs: ['AC', 'QR'],
      explanation: `Multiplication complete (SC = 0). Result in [AC:QR] = ${AC_bin} ${QR_bin}. Interpreted as ${width * 2}-bit 2's complement gives ${finalDecimal}.`
    });

    return {
      algorithm: 'booth',
      multiplicand: multiplicandVal,
      multiplier: multiplierVal,
      width,
      BR_bin,
      negBR_bin,
      QR_bin_initial: toTwosComplement(multiplierVal, width),
      expectedProduct: multiplicandVal * multiplierVal,
      computedProduct: finalDecimal,
      finalProductBin,
      steps
    };
  }

  return {
    toUnsignedBinary,
    toTwosComplement,
    fromTwosComplement,
    addBinary,
    twosComplementNegate,
    simulateSignedMagnitude,
    simulateBooth
  };
})();

// Export for node or browser window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MultiplierEngine;
} else if (typeof window !== 'undefined') {
  window.MultiplierEngine = MultiplierEngine;
}
