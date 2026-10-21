/**
 * Inside the Multiplier - Minimalist Monochrome SVG Visualizers
 * High-Contrast Editorial Architecture for Flowcharts & Hardware Datapaths
 */

const MultiplierVisualizers = (() => {

  // =========================================================================
  // 1. SIGNED-MAGNITUDE FLOWCHART (Monochrome Editorial)
  // =========================================================================
  function renderSignedMagnitudeFlowchart(containerId, activeNodeId = 'node-init', branchTaken = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const svg = `
      <svg viewBox="0 0 520 620" class="flowchart-svg" aria-label="Signed-Magnitude Multiplication Flowchart" role="img">
        <defs>
          <filter id="mono-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <marker id="arrow-mono" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#555555"/>
          </marker>
          <marker id="arrow-mono-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#ffffff"/>
          </marker>
        </defs>

        <!-- Center Guide Line -->
        <line x1="260" y1="20" x2="260" y2="600" stroke="#1f1f1f" stroke-dasharray="3 3"/>

        <!-- Connectors -->
        <!-- Start -> Load -->
        <path d="M 260 55 L 260 80" class="flow-line ${activeNodeId === 'node-load' ? 'flow-line-active' : ''}" marker-end="url(#${activeNodeId === 'node-load' ? 'arrow-mono-active' : 'arrow-mono'})"/>
        
        <!-- Load -> Init -->
        <path d="M 260 125 L 260 150" class="flow-line ${activeNodeId === 'node-init' ? 'flow-line-active' : ''}" marker-end="url(#${activeNodeId === 'node-init' ? 'arrow-mono-active' : 'arrow-mono'})"/>
        
        <!-- Init -> Decision Qn -->
        <path d="M 260 220 L 260 250" class="flow-line" marker-end="url(#arrow-mono)"/>
        
        <!-- Decision Qn = 1 -> Add EA <- A + B -->
        <path d="M 330 280 L 400 280 L 400 320" class="flow-line ${branchTaken === '1' || activeNodeId === 'node-add' ? 'flow-line-active' : ''}" marker-end="url(#${branchTaken === '1' || activeNodeId === 'node-add' ? 'arrow-mono-active' : 'arrow-mono'})"/>
        
        <!-- Decision Qn = 0 -> Shift directly -->
        <path d="M 190 280 L 130 280 L 130 400 L 190 400" class="flow-line ${branchTaken === '0' ? 'flow-line-active' : ''}" marker-end="url(#${branchTaken === '0' ? 'arrow-mono-active' : 'arrow-mono'})"/>
        
        <!-- Add -> Shift -->
        <path d="M 400 365 L 400 400 L 330 400" class="flow-line ${activeNodeId === 'node-shift' && branchTaken === '1' ? 'flow-line-active' : ''}" marker-end="url(#arrow-mono)"/>
        
        <!-- Shift -> Decision SC -->
        <path d="M 260 425 L 260 460" class="flow-line" marker-end="url(#arrow-mono)"/>
        
        <!-- Decision SC != 0 (Loop back to Qn) -->
        <path d="M 190 490 L 50 490 L 50 280 L 180 280" class="flow-line ${branchTaken === 'neq0' ? 'flow-line-active' : ''}" marker-end="url(#${branchTaken === 'neq0' ? 'arrow-mono-active' : 'arrow-mono'})"/>
        
        <!-- Decision SC = 0 -> End -->
        <path d="M 260 520 L 260 550" class="flow-line ${branchTaken === 'eq0' || activeNodeId === 'node-end' ? 'flow-line-active' : ''}" marker-end="url(#${branchTaken === 'eq0' || activeNodeId === 'node-end' ? 'arrow-mono-active' : 'arrow-mono'})"/>

        <!-- Branch Labels -->
        <text x="350" y="272" class="flow-branch-text ${branchTaken === '1' ? 'branch-active' : ''}"> = 1</text>
        <text x="145" y="272" class="flow-branch-text ${branchTaken === '0' ? 'branch-active' : ''}"> = 0</text>
        <text x="105" y="482" class="flow-branch-text ${branchTaken === 'neq0' ? 'branch-active' : ''}"> ≠ 0 (Loop)</text>
        <text x="272" y="538" class="flow-branch-text ${branchTaken === 'eq0' ? 'branch-active' : ''}"> = 0</text>

        <!-- 1. Node: Start -->
        <g id="node-start" class="flow-node ${activeNodeId === 'node-start' ? 'node-active' : ''}">
          <rect x="175" y="20" width="170" height="35" rx="17.5" class="node-shape oval"/>
          <text x="260" y="42" text-anchor="middle" class="node-text title">Multiply Operation</text>
        </g>

        <!-- 2. Node: Load Multiplicand & Multiplier -->
        <g id="node-load" class="flow-node ${activeNodeId === 'node-load' ? 'node-active' : ''}">
          <rect x="160" y="80" width="200" height="45" rx="22.5" class="node-shape oval"/>
          <text x="260" y="100" text-anchor="middle" class="node-text">Multiplicand in B</text>
          <text x="260" y="117" text-anchor="middle" class="node-text">Multiplier in Q</text>
        </g>

        <!-- 3. Node: Initialization -->
        <g id="node-init" class="flow-node ${activeNodeId === 'node-init' ? 'node-active' : ''}">
          <rect x="170" y="150" width="180" height="70" rx="3" class="node-shape rect"/>
          <text x="260" y="172" text-anchor="middle" class="node-text math">As ← Qs ⊕ Bs</text>
          <text x="260" y="190" text-anchor="middle" class="node-text math">Qs ← Qs ⊕ Bs</text>
          <text x="260" y="208" text-anchor="middle" class="node-text math">A ← 0,  E ← 0,  SC ← n</text>
        </g>

        <!-- 4. Node: Decision Qn (LSB of Q) -->
        <g id="node-check-qn" class="flow-node ${activeNodeId === 'node-check-qn' ? 'node-active' : ''}">
          <polygon points="260,250 330,280 260,310 190,280" class="node-shape diamond"/>
          <text x="260" y="285" text-anchor="middle" class="node-text diamond-text">Qn</text>
        </g>

        <!-- 5. Node: Add EA <- A + B -->
        <g id="node-add" class="flow-node ${activeNodeId === 'node-add' ? 'node-active' : ''}">
          <rect x="330" y="320" width="140" height="45" rx="3" class="node-shape rect"/>
          <text x="400" y="347" text-anchor="middle" class="node-text math">EA ← A + B</text>
        </g>

        <!-- 6. Node: Shift Right EAQ & Decrement SC -->
        <g id="node-shift" class="flow-node ${activeNodeId === 'node-shift' ? 'node-active' : ''}">
          <rect x="190" y="380" width="140" height="45" rx="3" class="node-shape rect"/>
          <text x="260" y="399" text-anchor="middle" class="node-text math">Shr EAQ</text>
          <text x="260" y="416" text-anchor="middle" class="node-text math">SC ← SC − 1</text>
        </g>

        <!-- 7. Node: Decision SC == 0 -->
        <g id="node-check-sc" class="flow-node ${activeNodeId === 'node-check-sc' ? 'node-active' : ''}">
          <polygon points="260,460 325,490 260,520 195,490" class="node-shape diamond"/>
          <text x="260" y="495" text-anchor="middle" class="node-text diamond-text">SC = 0 ?</text>
        </g>

        <!-- 8. Node: End -->
        <g id="node-end" class="flow-node ${activeNodeId === 'node-end' ? 'node-active' : ''}">
          <rect x="160" y="550" width="200" height="48" rx="24" class="node-shape oval end-node"/>
          <text x="260" y="570" text-anchor="middle" class="node-text title end-text">END</text>
          <text x="260" y="588" text-anchor="middle" class="node-text sub-text">(Product is in AQ)</text>
        </g>
      </svg>
    `;

    container.innerHTML = svg;
  }

  // =========================================================================
  // 2. SIGNED-MAGNITUDE HARDWARE DATAPATH (Monochrome Editorial)
  // =========================================================================
  function renderSignedMagnitudeHardware(containerId, state = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const {
      B = '10111',
      A = '00000',
      Q = '10011',
      E = 0,
      SC = 5,
      SC_bin = '101',
      Bs = 0,
      Qs = 0,
      As = 0,
      Qn = '1',
      activeHighlight = 'idle',
      operation = ''
    } = state;

    const isAdding = operation.toLowerCase().includes('add') || activeHighlight === 'add';
    const isShifting = operation.toLowerCase().includes('shift') || activeHighlight === 'shift';

    const svg = `
      <svg viewBox="0 0 680 440" class="hardware-svg" aria-label="Signed-Magnitude Datapath Hardware Diagram" role="img">
        <defs>
          <marker id="hw-arrow-mono" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#666666"/>
          </marker>
          <marker id="hw-arrow-mono-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#ffffff"/>
          </marker>
        </defs>

        <!-- Bus Lines & Interconnects -->
        <!-- Bus: B register down into Parallel Adder -->
        <path d="M 170 120 L 170 150 L 260 150 L 260 180" class="hw-bus ${isAdding ? 'bus-active' : ''}" marker-end="url(#${isAdding ? 'hw-arrow-mono-active' : 'hw-arrow-mono'})"/>
        
        <!-- Bus: A register loop up into Parallel Adder -->
        <path d="M 330 280 L 330 250" class="hw-bus ${isAdding ? 'bus-active' : ''}" marker-end="url(#${isAdding ? 'hw-arrow-mono-active' : 'hw-arrow-mono'})"/>
        
        <!-- Bus: Adder output into A register and E flip-flop -->
        <path d="M 270 250 L 270 280" class="hw-bus ${isAdding ? 'bus-active' : ''}" marker-end="url(#${isAdding ? 'hw-arrow-mono-active' : 'hw-arrow-mono'})"/>
        <path d="M 220 215 L 120 215 L 120 280" class="hw-bus ${isAdding ? 'bus-active' : ''}" marker-end="url(#${isAdding ? 'hw-arrow-mono-active' : 'hw-arrow-mono'})"/>

        <!-- Shift Chain: 0 into E, E into A, A into Q -->
        <path d="M 40 310 L 75 310" class="hw-shift-line ${isShifting ? 'shift-active' : ''}" marker-end="url(#${isShifting ? 'hw-arrow-mono-active' : 'hw-arrow-mono'})"/>
        <text x="25" y="315" class="hw-bit-label">0</text>

        <path d="M 135 310 L 195 310" class="hw-shift-line ${isShifting ? 'shift-active' : ''}" marker-end="url(#${isShifting ? 'hw-arrow-mono-active' : 'hw-arrow-mono'})"/>
        <path d="M 385 310 L 425 310" class="hw-shift-line ${isShifting ? 'shift-active' : ''}" marker-end="url(#${isShifting ? 'hw-arrow-mono-active' : 'hw-arrow-mono'})"/>
        
        <!-- Qn tap out of Q register to Control Logic -->
        <path d="M 570 280 L 570 240 L 500 240" class="hw-bus" marker-end="url(#hw-arrow-mono)"/>
        <text x="580" y="255" class="hw-label-sm">rightmost bit Qn</text>

        <!-- Top Left: Bs (Sign of B) & B Register -->
        <g class="hw-block" data-tooltip="Sign bit of multiplicand B">
          <rect x="75" y="45" width="45" height="40" rx="2" class="hw-sign-box"/>
          <text x="97" y="62" class="hw-title-text" text-anchor="middle">Bs</text>
          <text x="97" y="78" class="hw-bit-val mono" text-anchor="middle">${Bs}</text>
        </g>

        <g class="hw-block ${isAdding ? 'hw-highlight' : ''}" data-tooltip="Multiplicand register B (Magnitude bits)">
          <rect x="135" y="45" width="200" height="75" rx="3" class="hw-chip-rect"/>
          <text x="235" y="70" class="hw-chip-title" text-anchor="middle">B register (Multiplicand)</text>
          <rect x="150" y="80" width="170" height="30" rx="2" class="hw-val-bg"/>
          <text x="235" y="100" class="hw-reg-value mono" text-anchor="middle">${B}</text>
        </g>

        <!-- Top Center: Sequence Counter SC -->
        <g class="hw-block ${isShifting ? 'hw-highlight' : ''}" data-tooltip="Sequence Counter: initialized to number of multiplier bits and decrements after each shift step">
          <rect x="425" y="45" width="210" height="75" rx="3" class="hw-chip-rect"/>
          <text x="530" y="70" class="hw-chip-title" text-anchor="middle">Sequence Counter (SC)</text>
          <rect x="445" y="80" width="170" height="30" rx="2" class="hw-val-bg"/>
          <text x="530" y="100" class="hw-reg-value mono" text-anchor="middle">${SC} (${SC_bin})</text>
        </g>

        <!-- Center: Parallel Adder -->
        <g class="hw-block ${isAdding ? 'hw-adder-active' : ''}" data-tooltip="Parallel Adder: Adds Multiplicand B to Accumulator A when current multiplier bit Qn is 1. Output updates A and Carry flip-flop E.">
          <polygon points="220,180 380,180 340,250 260,250" class="hw-adder-poly"/>
          <text x="300" y="215" class="hw-adder-title" text-anchor="middle">Complementer &amp; Parallel Adder</text>
          <text x="300" y="233" class="hw-adder-sub" text-anchor="middle">A + B → A, E</text>
        </g>

        <!-- Bottom Left: As Sign and E Flip-Flop -->
        <g class="hw-block" data-tooltip="Sign bit of Accumulator / Product: As = Qs ⊕ Bs">
          <rect x="25" y="280" width="40" height="60" rx="2" class="hw-sign-box"/>
          <text x="45" y="302" class="hw-title-text" text-anchor="middle">As</text>
          <text x="45" y="325" class="hw-bit-val mono" text-anchor="middle">${As}</text>
        </g>

        <g class="hw-block ${isAdding || isShifting ? 'hw-highlight' : ''}" data-tooltip="Carry / Overflow flip-flop E: Holds adder carry out; shifts into Accumulator A MSB during Shift EAQ">
          <rect x="75" y="280" width="60" height="60" rx="3" class="hw-chip-rect"/>
          <text x="105" y="302" class="hw-chip-title" text-anchor="middle">E</text>
          <rect x="85" y="310" width="40" height="24" rx="2" class="hw-val-bg"/>
          <text x="105" y="327" class="hw-reg-value mono" text-anchor="middle">${E}</text>
        </g>

        <!-- Bottom Center: Accumulator A Register -->
        <g class="hw-block ${isAdding || isShifting ? 'hw-highlight' : ''}" data-tooltip="Accumulator register A: Holds partial products. Concatenated with Q as [A:Q] for final double-width product.">
          <rect x="195" y="280" width="190" height="60" rx="3" class="hw-chip-rect"/>
          <text x="290" y="302" class="hw-chip-title" text-anchor="middle">A register (Accumulator)</text>
          <rect x="210" y="310" width="160" height="24" rx="2" class="hw-val-bg"/>
          <text x="290" y="327" class="hw-reg-value mono" text-anchor="middle">${A}</text>
        </g>

        <!-- Bottom Right: Qs and Q Register (Multiplier) -->
        <g class="hw-block ${isShifting ? 'hw-highlight' : ''}" data-tooltip="Multiplier register Q: Holds multiplier magnitude. LSB Qn is tested each iteration. Bits shift right into lower order positions.">
          <rect x="425" y="280" width="190" height="60" rx="3" class="hw-chip-rect"/>
          <text x="520" y="302" class="hw-chip-title" text-anchor="middle">Q register (Multiplier)</text>
          <rect x="440" y="310" width="160" height="24" rx="2" class="hw-val-bg"/>
          <text x="520" y="327" class="hw-reg-value mono" text-anchor="middle">${Q}</text>
        </g>

        <g class="hw-block" data-tooltip="Sign bit of multiplier Q">
          <rect x="625" y="280" width="40" height="60" rx="2" class="hw-sign-box"/>
          <text x="645" y="302" class="hw-title-text" text-anchor="middle">Qs</text>
          <text x="645" y="325" class="hw-bit-val mono" text-anchor="middle">${Qs}</text>
        </g>

        <!-- Control signal info banner -->
        <rect x="135" y="375" width="480" height="38" rx="2" class="hw-status-bar"/>
        <text x="375" y="398" class="hw-status-text" text-anchor="middle">
          ${isAdding ? 'ADDER ACTIVE: A + B loaded into EA' : (isShifting ? 'SHIFT ACTIVE: 0 → E → A → Q' : 'DATAPATH READY: Qn = ' + Qn)}
        </text>
      </svg>
    `;

    container.innerHTML = svg;
  }

  // =========================================================================
  // 3. BOOTH'S ALGORITHM FLOWCHART (Monochrome Editorial)
  // =========================================================================
  function renderBoothFlowchart(containerId, activeNodeId = 'node-booth-init', branchTaken = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const svg = `
      <svg viewBox="0 0 540 640" class="flowchart-svg" aria-label="Booth's Algorithm Flowchart" role="img">
        <defs>
          <marker id="booth-arrow-mono" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#555555"/>
          </marker>
          <marker id="booth-arrow-mono-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#ffffff"/>
          </marker>
        </defs>

        <!-- Center Guide -->
        <line x1="270" y1="20" x2="270" y2="620" stroke="#1f1f1f" stroke-dasharray="3 3"/>

        <!-- Flow lines -->
        <!-- Start -> Load -->
        <path d="M 270 50 L 270 75" class="flow-line ${activeNodeId === 'node-booth-load' ? 'flow-line-active' : ''}" marker-end="url(#${activeNodeId === 'node-booth-load' ? 'booth-arrow-mono-active' : 'booth-arrow-mono'})"/>
        
        <!-- Load -> Init -->
        <path d="M 270 120 L 270 145" class="flow-line ${activeNodeId === 'node-booth-init' ? 'flow-line-active' : ''}" marker-end="url(#${activeNodeId === 'node-booth-init' ? 'booth-arrow-mono-active' : 'booth-arrow-mono'})"/>
        
        <!-- Init -> Decision Qn Qn+1 -->
        <path d="M 270 215 L 270 245" class="flow-line" marker-end="url(#booth-arrow-mono)"/>

        <!-- Decision 3-Way Branch: -->
        <!-- 10: Subtract BR (Left) -->
        <path d="M 200 275 L 120 275 L 120 315" class="flow-line ${branchTaken === '10' || activeNodeId === 'node-booth-sub' ? 'flow-line-active' : ''}" marker-end="url(#${branchTaken === '10' || activeNodeId === 'node-booth-sub' ? 'booth-arrow-mono-active' : 'booth-arrow-mono'})"/>
        
        <!-- 01: Add BR (Right) -->
        <path d="M 340 275 L 420 275 L 420 315" class="flow-line ${branchTaken === '01' || activeNodeId === 'node-booth-add' ? 'flow-line-active' : ''}" marker-end="url(#${branchTaken === '01' || activeNodeId === 'node-booth-add' ? 'booth-arrow-mono-active' : 'booth-arrow-mono'})"/>
        
        <!-- 00 or 11: Direct bypass (Center down) -->
        <path d="M 270 305 L 270 405" class="flow-line ${branchTaken === '00' || branchTaken === '11' ? 'flow-line-active' : ''}" marker-end="url(#${branchTaken === '00' || branchTaken === '11' ? 'booth-arrow-mono-active' : 'booth-arrow-mono'})"/>

        <!-- Sub -> Ashr join -->
        <path d="M 120 365 L 120 425 L 190 425" class="flow-line ${branchTaken === '10' ? 'flow-line-active' : ''}" marker-end="url(#booth-arrow-mono)"/>
        
        <!-- Add -> Ashr join -->
        <path d="M 420 365 L 420 425 L 350 425" class="flow-line ${branchTaken === '01' ? 'flow-line-active' : ''}" marker-end="url(#booth-arrow-mono)"/>

        <!-- Ashr -> Decision SC -->
        <path d="M 270 450 L 270 480" class="flow-line" marker-end="url(#booth-arrow-mono)"/>

        <!-- Decision SC != 0 (Loop back to Qn Qn+1) -->
        <path d="M 200 510 L 40 510 L 40 275 L 190 275" class="flow-line ${branchTaken === 'neq0' ? 'flow-line-active' : ''}" marker-end="url(#${branchTaken === 'neq0' ? 'booth-arrow-mono-active' : 'booth-arrow-mono'})"/>
        
        <!-- Decision SC = 0 -> End -->
        <path d="M 270 540 L 270 570" class="flow-line ${branchTaken === 'eq0' || activeNodeId === 'node-booth-end' ? 'flow-line-active' : ''}" marker-end="url(#${branchTaken === 'eq0' || activeNodeId === 'node-booth-end' ? 'booth-arrow-mono-active' : 'booth-arrow-mono'})"/>

        <!-- Branch Labels -->
        <text x="145" y="268" class="flow-branch-text ${branchTaken === '10' ? 'branch-active' : ''}"> = 10</text>
        <text x="365" y="268" class="flow-branch-text ${branchTaken === '01' ? 'branch-active' : ''}"> = 01</text>
        <text x="280" y="340" class="flow-branch-text ${branchTaken === '00' || branchTaken === '11' ? 'branch-active' : ''}"> = 00, 11</text>
        <text x="85" y="502" class="flow-branch-text ${branchTaken === 'neq0' ? 'branch-active' : ''}"> ≠ 0 (Loop)</text>
        <text x="285" y="555" class="flow-branch-text ${branchTaken === 'eq0' ? 'branch-active' : ''}"> = 0</text>

        <!-- 1. Node: Multiply Start -->
        <g id="node-booth-start" class="flow-node ${activeNodeId === 'node-booth-start' ? 'node-active' : ''}">
          <rect x="195" y="15" width="150" height="35" rx="17.5" class="node-shape oval"/>
          <text x="270" y="37" text-anchor="middle" class="node-text title">Multiply</text>
        </g>

        <!-- 2. Node: Load BR and QR -->
        <g id="node-booth-load" class="flow-node ${activeNodeId === 'node-booth-load' ? 'node-active' : ''}">
          <rect x="170" y="75" width="200" height="45" rx="22.5" class="node-shape oval"/>
          <text x="270" y="95" text-anchor="middle" class="node-text">Multiplicand in BR</text>
          <text x="270" y="112" text-anchor="middle" class="node-text">Multiplier in QR</text>
        </g>

        <!-- 3. Node: Initialization -->
        <g id="node-booth-init" class="flow-node ${activeNodeId === 'node-booth-init' ? 'node-active' : ''}">
          <rect x="190" y="145" width="160" height="70" rx="3" class="node-shape rect"/>
          <text x="270" y="167" text-anchor="middle" class="node-text math">AC ← 0</text>
          <text x="270" y="185" text-anchor="middle" class="node-text math">Qn+1 ← 0</text>
          <text x="270" y="203" text-anchor="middle" class="node-text math">SC ← n</text>
        </g>

        <!-- 4. Node: Decision Qn Qn+1 -->
        <g id="node-booth-check-pair" class="flow-node ${activeNodeId === 'node-booth-check-pair' ? 'node-active' : ''}">
          <polygon points="270,245 340,275 270,305 200,275" class="node-shape diamond"/>
          <text x="270" y="280" text-anchor="middle" class="node-text diamond-text">Qn Qn+1</text>
        </g>

        <!-- 5. Node: Subtract BR (AC <- AC + BR_bar + 1) -->
        <g id="node-booth-sub" class="flow-node ${activeNodeId === 'node-booth-sub' ? 'node-active' : ''}">
          <rect x="40" y="315" width="160" height="50" rx="3" class="node-shape rect"/>
          <text x="120" y="338" text-anchor="middle" class="node-text math">AC ← AC + BR̄ + 1</text>
          <text x="120" y="354" text-anchor="middle" class="node-text sub-text">(Subtract BR)</text>
        </g>

        <!-- 6. Node: Add BR (AC <- AC + BR) -->
        <g id="node-booth-add" class="flow-node ${activeNodeId === 'node-booth-add' ? 'node-active' : ''}">
          <rect x="340" y="315" width="160" height="50" rx="3" class="node-shape rect"/>
          <text x="420" y="338" text-anchor="middle" class="node-text math">AC ← AC + BR</text>
          <text x="420" y="354" text-anchor="middle" class="node-text sub-text">(Add BR)</text>
        </g>

        <!-- 7. Node: Arithmetic Right Shift -->
        <g id="node-booth-ashr" class="flow-node ${activeNodeId === 'node-booth-ashr' ? 'node-active' : ''}">
          <rect x="190" y="405" width="160" height="45" rx="3" class="node-shape rect"/>
          <text x="270" y="424" text-anchor="middle" class="node-text math">ashr (AC &amp; QR)</text>
          <text x="270" y="441" text-anchor="middle" class="node-text math">SC ← SC − 1</text>
        </g>

        <!-- 8. Node: Decision SC == 0 -->
        <g id="node-booth-check-sc" class="flow-node ${activeNodeId === 'node-booth-check-sc' ? 'node-active' : ''}">
          <polygon points="270,480 340,510 270,540 200,510" class="node-shape diamond"/>
          <text x="270" y="515" text-anchor="middle" class="node-text diamond-text">SC = 0 ?</text>
        </g>

        <!-- 9. Node: End -->
        <g id="node-booth-end" class="flow-node ${activeNodeId === 'node-booth-end' ? 'node-active' : ''}">
          <rect x="170" y="570" width="200" height="48" rx="24" class="node-shape oval end-node"/>
          <text x="270" y="590" text-anchor="middle" class="node-text title end-text">END</text>
          <text x="270" y="608" text-anchor="middle" class="node-text sub-text">(Product in AC &amp; QR)</text>
        </g>
      </svg>
    `;

    container.innerHTML = svg;
  }

  // =========================================================================
  // 4. BOOTH'S HARDWARE DATAPATH (Monochrome Editorial)
  // =========================================================================
  function renderBoothHardware(containerId, state = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const {
      BR = '10111',
      negBR = '01001',
      AC = '00000',
      QR = '10011',
      Qn = '1',
      Qn1 = '0',
      SC = 5,
      pair = '10',
      operation = '',
      activeHighlight = 'idle'
    } = state;

    const isSub = operation.toLowerCase().includes('sub') || activeHighlight === 'sub';
    const isAdd = operation.toLowerCase().includes('add') || activeHighlight === 'add';
    const isShift = operation.toLowerCase().includes('ashr') || activeHighlight === 'ashr';

    const svg = `
      <svg viewBox="0 0 680 440" class="hardware-svg" aria-label="Booth Multiplier Datapath Hardware Diagram" role="img">
        <defs>
          <marker id="booth-hw-arrow-mono" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#666666"/>
          </marker>
          <marker id="booth-hw-arrow-mono-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#ffffff"/>
          </marker>
        </defs>

        <!-- Interconnects & Buses -->
        <!-- Bus: BR to Complementer and Parallel Adder -->
        <path d="M 190 120 L 190 170" class="hw-bus ${isAdd || isSub ? 'bus-active' : ''}" marker-end="url(#${isAdd || isSub ? 'booth-hw-arrow-mono-active' : 'booth-hw-arrow-mono'})"/>
        
        <!-- Bus: AC loop up into Complementer/Adder -->
        <path d="M 270 280 L 270 240" class="hw-bus ${isAdd || isSub ? 'bus-active' : ''}" marker-end="url(#${isAdd || isSub ? 'booth-hw-arrow-mono-active' : 'booth-hw-arrow-mono'})"/>

        <!-- Bus: Adder output into AC -->
        <path d="M 160 240 L 160 280" class="hw-bus ${isAdd || isSub ? 'bus-active' : ''}" marker-end="url(#${isAdd || isSub ? 'booth-hw-arrow-mono-active' : 'booth-hw-arrow-mono'})"/>

        <!-- Shift Interconnects: AC MSB sign-extension into AC, AC into QR, QR into Qn+1 -->
        <path d="M 85 285 C 65 260 65 330 85 305" class="hw-shift-line ${isShift ? 'shift-active' : ''}"/>
        <path d="M 290 310 L 330 310" class="hw-shift-line ${isShift ? 'shift-active' : ''}" marker-end="url(#${isShift ? 'booth-hw-arrow-mono-active' : 'booth-hw-arrow-mono'})"/>
        <path d="M 525 310 L 565 310" class="hw-shift-line ${isShift ? 'shift-active' : ''}" marker-end="url(#${isShift ? 'booth-hw-arrow-mono-active' : 'booth-hw-arrow-mono'})"/>

        <!-- Taps to Decision Logic -->
        <path d="M 480 280 L 480 235" class="hw-bus" marker-end="url(#booth-hw-arrow-mono)"/>
        <path d="M 600 280 L 600 235" class="hw-bus" marker-end="url(#booth-hw-arrow-mono)"/>

        <text x="480" y="225" class="hw-label-sm" text-anchor="middle">Qn</text>
        <text x="600" y="225" class="hw-label-sm" text-anchor="middle">Qn+1</text>

        <!-- Top Left: BR Register -->
        <g class="hw-block ${isAdd || isSub ? 'hw-highlight' : ''}" data-tooltip="Multiplicand register BR: Holds signed 2's complement multiplicand. Feeds into complementer and parallel adder.">
          <rect x="90" y="45" width="200" height="75" rx="3" class="hw-chip-rect"/>
          <text x="190" y="70" class="hw-chip-title" text-anchor="middle">BR register (Multiplicand)</text>
          <rect x="110" y="80" width="160" height="30" rx="2" class="hw-val-bg"/>
          <text x="190" y="100" class="hw-reg-value mono" text-anchor="middle">${BR}</text>
        </g>

        <!-- Top Right: Sequence Counter (SC) -->
        <g class="hw-block ${isShift ? 'hw-highlight' : ''}" data-tooltip="Sequence counter (SC): initialized to n (number of multiplier bits). Decremented on each arithmetic right shift.">
          <rect x="390" y="45" width="220" height="75" rx="3" class="hw-chip-rect"/>
          <text x="500" y="70" class="hw-chip-title" text-anchor="middle">Sequence counter (SC)</text>
          <rect x="420" y="80" width="160" height="30" rx="2" class="hw-val-bg"/>
          <text x="500" y="100" class="hw-reg-value mono" text-anchor="middle">${SC}</text>
        </g>

        <!-- Center: Complementer and Parallel Adder -->
        <g class="hw-block ${isAdd || isSub ? 'hw-adder-active' : ''}" data-tooltip="Complementer and Parallel Adder: Performs AC + BR when Qn Qn+1 = 01, or AC + BR̄ + 1 (subtraction) when Qn Qn+1 = 10.">
          <rect x="90" y="170" width="220" height="70" rx="3" class="hw-adder-poly"/>
          <text x="200" y="198" class="hw-adder-title" text-anchor="middle">Complementer and</text>
          <text x="200" y="218" class="hw-adder-title" text-anchor="middle">parallel adder</text>
          <text x="200" y="233" class="hw-mode-text" text-anchor="middle">
            ${isSub ? 'SUB MODE: + BR̄+1 (' + negBR + ')' : (isAdd ? 'ADD MODE: + BR (' + BR + ')' : 'STANDBY')}
          </text>
        </g>

        <!-- Bottom Left: AC Register (Accumulator) -->
        <g class="hw-block ${isAdd || isSub || isShift ? 'hw-highlight' : ''}" data-tooltip="Accumulator register AC: Holds running partial products in 2's complement. Arithmetic shift preserves its sign bit.">
          <rect x="90" y="280" width="200" height="60" rx="3" class="hw-chip-rect"/>
          <text x="190" y="302" class="hw-chip-title" text-anchor="middle">AC register (Accumulator)</text>
          <rect x="110" y="310" width="160" height="24" rx="2" class="hw-val-bg"/>
          <text x="190" y="327" class="hw-reg-value mono" text-anchor="middle">${AC}</text>
        </g>

        <!-- Bottom Center: QR Register (Multiplier) -->
        <g class="hw-block ${isShift ? 'hw-highlight' : ''}" data-tooltip="Multiplier register QR: Holds multiplier bits. LSB Qn is compared with Qn+1. Shifts right each step.">
          <rect x="330" y="280" width="195" height="60" rx="3" class="hw-chip-rect"/>
          <text x="427" y="302" class="hw-chip-title" text-anchor="middle">QR register (Multiplier)</text>
          <rect x="350" y="310" width="155" height="24" rx="2" class="hw-val-bg"/>
          <text x="427" y="327" class="hw-reg-value mono" text-anchor="middle">${QR}</text>
        </g>

        <!-- Bottom Right: 1-Bit Flip-Flop Qn+1 -->
        <g class="hw-block ${isShift ? 'hw-highlight' : ''}" data-tooltip="1-bit Flip-Flop Qn+1: Stores the previous least significant multiplier bit. Initialized to 0.">
          <rect x="565" y="280" width="70" height="60" rx="3" class="hw-chip-rect"/>
          <text x="600" y="302" class="hw-chip-title" text-anchor="middle">Qn+1</text>
          <rect x="580" y="310" width="40" height="24" rx="2" class="hw-val-bg"/>
          <text x="600" y="327" class="hw-reg-value mono" text-anchor="middle">${Qn1}</text>
        </g>

        <!-- Status & Decision Bar -->
        <rect x="90" y="375" width="545" height="38" rx="2" class="hw-status-bar"/>
        <text x="362" y="398" class="hw-status-text" text-anchor="middle">
          CURRENT PAIR [${pair}] ➔ ${pair === '01' ? 'ADD BR (AC ← AC + BR)' : (pair === '10' ? 'SUBTRACT BR (AC ← AC + BR̄ + 1)' : (pair === '00' || pair === '11' ? 'NO OPERATION (DIRECT SHIFT)' : 'COMPLETE'))}
        </text>
      </svg>
    `;

    container.innerHTML = svg;
  }

  return {
    renderSignedMagnitudeFlowchart,
    renderSignedMagnitudeHardware,
    renderBoothFlowchart,
    renderBoothHardware
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MultiplierVisualizers;
} else if (typeof window !== 'undefined') {
  window.MultiplierVisualizers = MultiplierVisualizers;
}
