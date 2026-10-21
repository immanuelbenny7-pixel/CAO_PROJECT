# Inside the Multiplier

> **Tagline:** Explore how computers multiply signed numbers, one register step at a time.  
> **Headline:** Watch signed multiplication in silicon.  
> **Subject:** Computer Organization and Architecture (CAO) Interactive Educational Lab.  
> **Aesthetic:** Minimalist Monochrome Editorial Portfolio Style.

---

## 🌟 Overview

**Inside the Multiplier** is an interactive, hardware-accurate educational laboratory designed to teach the two core register-level signed binary multiplication algorithms:

1. **Signed-Magnitude Multiplication** (Mano Architecture: $B$, $Q$, $A$, $E$, $SC$, Parallel Adder, separate sign XOR logic $A_s \leftarrow Q_s \oplus B_s$)
2. **Signed 2’s-Complement Multiplication using Booth’s Algorithm** (Registers: $BR$, $QR$, $AC$, $Q_n$, $Q_{n+1}$, $SC$, Complementer & Parallel Adder, Arithmetic Right Shift)

The site features a **dramatic, minimalist, monochrome editorial design** inspired by high-end photography portfolios:
- Deep near-black background (`#060606` / `#0a0a0a`) with generous negative space and subtle film-grain texture.
- Oversized condensed uppercase headlines using `Barlow Condensed` and `Anton`.
- High-contrast black-and-white hardware photography with subtle grain treatment.
- Asymmetric editorial hero layout pairing bold display typography beside a striking hardware photography frame.
- Clean hairline borders (`#222222`), inverted high-contrast interactive states, and zero visual clutter.
- Tabular monospace register typography (`JetBrains Mono`).

---

## 🚀 How to Run the Website

The project is built entirely with standard modern web technologies (HTML5, Vanilla CSS3, and ES6+ JavaScript), with zero external build tools, bundle dependencies, or server frameworks required.

### Option 1: Python HTTP Server (Recommended)
You can run a local server using Python (already active on port 8080):

```powershell
# In the project directory:
py -m http.server 8080
```

Then open your browser to:
```
http://localhost:8080
```

### Option 2: Direct File Opening
You can double-click [`index.html`](file:///c:/Users/imman/OneDrive/Desktop/cao%20project/index.html) or open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

---

## 📁 Directory & Media File Structure

```text
cao project/
├── index.html                           # Main web application & multi-page views
├── style.css                            # Minimalist monochrome editorial styles
├── js/
│   ├── algorithms.js                    # Bit-accurate register simulation engine
│   ├── visualizers.js                   # High-contrast SVG flowcharts & hardware datapaths
│   └── app.js                           # UI controller, video modal, & step sync
├── media/
│   ├── signed-magnitude-hardware.mp4    # 8-second hardware datapath video for Signed Magnitude
│   ├── booths-hardware.mp4              # 8-second breadboard animation video for Booth's Algorithm
│   ├── signed-magnitude-poster.jpg      # Fallback poster image for Signed Magnitude
│   └── booths-poster.jpg                # Fallback poster image for Booth's Algorithm
├── test_simulation.py                   # Automated Python unit test for course presets
└── README.md                            # Documentation and user guide
```

---

## 🔬 Mathematical Verification

The register engine in [`js/algorithms.js`](file:///c:/Users/imman/OneDrive/Desktop/cao%20project/js/algorithms.js) was verified with a Python test suite ([`test_simulation.py`](file:///c:/Users/imman/OneDrive/Desktop/cao%20project/test_simulation.py)) against both course slides:

- **Signed-Magnitude Course Example:** $23 \times 19 = 437$ (Magnitude product in $AQ = 01101\ 10101_2$, $E = 0$).
- **Booth’s Algorithm Course Example:** $-9 \times -13 = 117$ (Product in $[AC:QR] = 00011\ 10101_2$).
