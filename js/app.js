/**
 * Inside the Multiplier - Application Controller & Interaction Logic
 * Handles Navigation, Video Presentation, Simulator Controls, Keyboard Shortcuts, and UI Sync
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // State Management
  // =========================================================================
  const state = {
    currentView: 'home', // 'home' | 'signed-magnitude' | 'booth' | 'compare'
    
    // Signed-Magnitude Simulator State
    signedMag: {
      multiplicand: 23,
      multiplier: 19,
      width: 5,
      simulationData: null,
      currentStep: 0,
      isPlaying: false,
      playTimer: null,
      playSpeedMs: 1200,
      showAllSteps: false
    },

    // Booth's Simulator State
    booth: {
      multiplicand: -9,
      multiplier: -13,
      width: 5,
      simulationData: null,
      currentStep: 0,
      isPlaying: false,
      playTimer: null,
      playSpeedMs: 1200,
      showAllSteps: false
    },

    // Video Presentation Overlay State
    videoModal: {
      targetAlgorithm: null, // 'signed-magnitude' | 'booth'
      hasPlayedIntro: {
        'signed-magnitude': false,
        'booth': false
      }
    }
  };

  // =========================================================================
  // DOM Elements
  // =========================================================================
  const views = {
    home: document.getElementById('view-home'),
    'signed-magnitude': document.getElementById('view-signed-magnitude'),
    booth: document.getElementById('view-booth'),
    compare: document.getElementById('view-compare')
  };

  const navLinks = document.querySelectorAll('.nav-link[data-view]');
  const videoOverlay = document.getElementById('video-intro-overlay');
  const videoPlayer = document.getElementById('intro-video-element');
  const videoTitleOverlay = document.getElementById('video-title-overlay');
  const videoCaptionText = document.getElementById('video-caption-text');
  const btnSkipVideo = document.getElementById('btn-skip-video');
  const btnVideoPlayPause = document.getElementById('btn-video-play-pause');
  const btnVideoReplay = document.getElementById('btn-video-replay');
  const glossaryModal = document.getElementById('glossary-modal');
  const btnOpenGlossary = document.getElementById('btn-open-glossary');
  const btnCloseGlossary = document.getElementById('btn-close-glossary');

  // =========================================================================
  // Navigation & Routing
  // =========================================================================
  function switchView(viewName, skipIntro = false) {
    if (!views[viewName]) viewName = 'home';
    
    // If switching to an algorithm for the first time and not skipping intro, show intro video
    if ((viewName === 'signed-magnitude' || viewName === 'booth') && !skipIntro && !state.videoModal.hasPlayedIntro[viewName]) {
      showVideoIntro(viewName);
      return;
    }

    state.currentView = viewName;
    window.location.hash = viewName;

    // Update active view visibility
    Object.keys(views).forEach(key => {
      if (views[key]) {
        views[key].classList.toggle('active-view', key === viewName);
      }
    });

    // Update nav links active class
    navLinks.forEach(link => {
      const target = link.getAttribute('data-view');
      link.classList.toggle('active', target === viewName);
    });

    // Window scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Initialize or render views if necessary
    if (viewName === 'signed-magnitude' && !state.signedMag.simulationData) {
      calculateSignedMagnitude();
    } else if (viewName === 'booth' && !state.booth.simulationData) {
      calculateBooth();
    }
  }

  // Handle URL Hash Changes
  function handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (views[hash]) {
      switchView(hash, true); // Don't block direct URL navigation with video
    } else {
      switchView('home');
    }
  }

  window.addEventListener('hashchange', handleHashChange);

  // Setup click listeners on all navigation links and explore buttons
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-view');
      switchView(target);
    });
  });

  document.querySelectorAll('[data-switch-view]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-switch-view');
      switchView(target);
    });
  });

  // =========================================================================
  // Video Presentation System
  // =========================================================================
  const VIDEO_CONFIG = {
    'signed-magnitude': {
      videoSrc: 'media/signed-magnitude-hardware.mp4',
      fallbackSrc: '/media/signed-magnitude-hardware.mp4',
      poster: 'media/signed-magnitude-poster.jpg',
      title: 'Meet the Signed-Magnitude Datapath',
      caption: 'Registers B (Multiplicand magnitude), Q (Multiplier), A (Accumulator), E (Carry/Overflow bit), SC (Sequence Counter), and the Parallel Adder.'
    },
    'booth': {
      videoSrc: 'media/booths-hardware.mp4',
      fallbackSrc: '/media/booths-hardware.mp4',
      poster: 'media/booths-poster.jpg',
      title: 'Meet Booth’s Multiplier',
      caption: 'Registers BR (Multiplicand), QR (Multiplier), AC (Accumulator), Qn and Qn+1 flip-flop bit pair, SC counter, and Complementer/Parallel Adder.'
    }
  };

  function showVideoIntro(algoType) {
    state.videoModal.targetAlgorithm = algoType;
    const config = VIDEO_CONFIG[algoType];
    if (!config) return;

    // Respect reduced-motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      state.videoModal.hasPlayedIntro[algoType] = true;
      proceedToAlgorithm(algoType);
      return;
    }

    videoTitleOverlay.textContent = config.title;
    videoCaptionText.textContent = config.caption;

    // Set video sources with fallback
    videoPlayer.poster = config.poster;
    videoPlayer.src = config.videoSrc;

    // Reset controls
    btnVideoPlayPause.textContent = 'Pause';
    videoOverlay.classList.add('active');
    videoOverlay.setAttribute('aria-hidden', 'false');

    // Attempt video playback
    videoPlayer.currentTime = 0;
    const playPromise = videoPlayer.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // If autoplay policy blocks or file is missing, fall back quietly to poster and let user control
        btnVideoPlayPause.textContent = 'Play';
      });
    }
  }

  function closeVideoIntro() {
    videoPlayer.pause();
    videoOverlay.classList.remove('active');
    videoOverlay.setAttribute('aria-hidden', 'true');
  }

  function proceedToAlgorithm(algoType) {
    closeVideoIntro();
    state.videoModal.hasPlayedIntro[algoType] = true;
    state.currentView = algoType;
    window.location.hash = algoType;

    Object.keys(views).forEach(key => {
      if (views[key]) {
        views[key].classList.toggle('active-view', key === algoType);
      }
    });

    navLinks.forEach(link => {
      const target = link.getAttribute('data-view');
      link.classList.toggle('active', target === algoType);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (algoType === 'signed-magnitude' && !state.signedMag.simulationData) {
      calculateSignedMagnitude();
    } else if (algoType === 'booth' && !state.booth.simulationData) {
      calculateBooth();
    }
  }

  // Video Event Handlers
  btnSkipVideo.addEventListener('click', () => {
    if (state.videoModal.targetAlgorithm) {
      proceedToAlgorithm(state.videoModal.targetAlgorithm);
    } else {
      closeVideoIntro();
    }
  });

  videoPlayer.addEventListener('ended', () => {
    if (state.videoModal.targetAlgorithm) {
      proceedToAlgorithm(state.videoModal.targetAlgorithm);
    }
  });

  videoPlayer.addEventListener('error', () => {
    console.warn("Video failed to play. Continuing with poster fallback.");
    // Continue cleanly without blocking student
  });

  btnVideoPlayPause.addEventListener('click', () => {
    if (videoPlayer.paused) {
      videoPlayer.play();
      btnVideoPlayPause.textContent = 'Pause';
    } else {
      videoPlayer.pause();
      btnVideoPlayPause.textContent = 'Play';
    }
  });

  btnVideoReplay.addEventListener('click', () => {
    videoPlayer.currentTime = 0;
    videoPlayer.play();
    btnVideoPlayPause.textContent = 'Pause';
  });

  // Replay hardware intro buttons on algorithm pages
  document.getElementById('btn-replay-sm-intro')?.addEventListener('click', () => {
    showVideoIntro('signed-magnitude');
  });

  document.getElementById('btn-replay-booth-intro')?.addEventListener('click', () => {
    showVideoIntro('booth');
  });

  // =========================================================================
  // SIGNED-MAGNITUDE SIMULATOR
  // =========================================================================
  const smInputs = {
    multiplicand: document.getElementById('sm-input-multiplicand'),
    multiplier: document.getElementById('sm-input-multiplier'),
    width: document.getElementById('sm-input-width'),
    validationMsg: document.getElementById('sm-validation-msg'),
    btnCalculate: document.getElementById('sm-btn-calculate'),
    btnPreset: document.getElementById('sm-btn-preset'),
    btnClear: document.getElementById('sm-btn-clear'),
    btnReset: document.getElementById('sm-btn-reset')
  };

  const smStepper = {
    btnPrev: document.getElementById('sm-btn-prev'),
    btnNext: document.getElementById('sm-btn-next'),
    btnPlay: document.getElementById('sm-btn-play'),
    btnResetStep: document.getElementById('sm-btn-reset-step'),
    btnShowAll: document.getElementById('sm-btn-show-all'),
    speedSelect: document.getElementById('sm-speed-select'),
    progressText: document.getElementById('sm-progress-text'),
    progressBar: document.getElementById('sm-progress-bar')
  };

  const smHUD = {
    decimalExpr: document.getElementById('sm-hud-decimal'),
    binaryOperands: document.getElementById('sm-hud-binary'),
    signCalc: document.getElementById('sm-hud-sign'),
    finalResult: document.getElementById('sm-hud-result'),
    regE: document.getElementById('sm-reg-e'),
    regA: document.getElementById('sm-reg-a'),
    regQ: document.getElementById('sm-reg-q'),
    regSC: document.getElementById('sm-reg-sc'),
    narrative: document.getElementById('sm-step-narrative'),
    tableBody: document.getElementById('sm-table-body')
  };

  function validateSignedMagnitudeInput() {
    const width = parseInt(smInputs.width.value, 10);
    const maxMag = (1 << width) - 1;
    const m1 = parseInt(smInputs.multiplicand.value, 10);
    const m2 = parseInt(smInputs.multiplier.value, 10);

    if (isNaN(m1) || isNaN(m2)) {
      smInputs.validationMsg.textContent = `Please enter valid integers for both operands.`;
      smInputs.validationMsg.className = 'input-validation-msg error';
      return false;
    }

    if (Math.abs(m1) > maxMag || Math.abs(m2) > maxMag) {
      smInputs.validationMsg.textContent = `For ${width}-bit magnitude, values must be in range [-${maxMag}, +${maxMag}].`;
      smInputs.validationMsg.className = 'input-validation-msg error';
      return false;
    }

    smInputs.validationMsg.textContent = `Valid ${width}-bit magnitude range: -${maxMag} to +${maxMag}. Ready to calculate.`;
    smInputs.validationMsg.className = 'input-validation-msg';
    return true;
  }

  function calculateSignedMagnitude() {
    if (!validateSignedMagnitudeInput()) return;

    pauseSMSimulation();
    const m1 = parseInt(smInputs.multiplicand.value, 10);
    const m2 = parseInt(smInputs.multiplier.value, 10);
    const width = parseInt(smInputs.width.value, 10);

    state.signedMag.multiplicand = m1;
    state.signedMag.multiplier = m2;
    state.signedMag.width = width;

    try {
      state.signedMag.simulationData = MultiplierEngine.simulateSignedMagnitude(m1, m2, width);
      state.signedMag.currentStep = 0;
      updateSMSimulationUI();
    } catch (err) {
      smInputs.validationMsg.textContent = `Error: ${err.message}`;
      smInputs.validationMsg.className = 'input-validation-msg error';
    }
  }

  function updateSMSimulationUI() {
    const data = state.signedMag.simulationData;
    if (!data) return;

    const currentStepIndex = state.signedMag.currentStep;
    const currentStepObj = data.steps[currentStepIndex];
    const totalSteps = data.steps.length - 1;

    // Update Result HUD
    smHUD.decimalExpr.textContent = `${data.multiplicand} × ${data.multiplier} = ${data.expectedProduct}`;
    smHUD.binaryOperands.textContent = `B = ${data.B_sign} | ${data.B_bin}, Q = ${data.Q_sign} | ${data.Q_bin_initial}`;
    smHUD.signCalc.textContent = `Bs ⊕ Qs = ${data.B_sign} ⊕ ${data.Q_sign} = ${data.prodSign} (${data.prodSign === 1 ? 'Negative' : 'Positive'})`;
    smHUD.finalResult.textContent = `AQ = ${currentStepObj.A} ${currentStepObj.Q} (${data.computedProduct})`;

    // Update Live Register Display
    smHUD.regE.textContent = currentStepObj.E;
    smHUD.regA.textContent = currentStepObj.A;
    smHUD.regQ.textContent = currentStepObj.Q;
    smHUD.regSC.textContent = `${currentStepObj.SC} (${currentStepObj.SC_bin})`;

    // Highlight active register boxes in HUD
    ['sm-card-e', 'sm-card-a', 'sm-card-q', 'sm-card-sc'].forEach(id => {
      document.getElementById(id)?.classList.remove('active-reg');
    });
    if (currentStepObj.highlightRegs.includes('E')) document.getElementById('sm-card-e')?.classList.add('active-reg');
    if (currentStepObj.highlightRegs.includes('A')) document.getElementById('sm-card-a')?.classList.add('active-reg');
    if (currentStepObj.highlightRegs.includes('Q')) document.getElementById('sm-card-q')?.classList.add('active-reg');
    if (currentStepObj.highlightRegs.includes('SC')) document.getElementById('sm-card-sc')?.classList.add('active-reg');

    // Update Stepper Progress
    smStepper.progressText.textContent = `Step ${currentStepIndex} of ${totalSteps} — ${currentStepObj.operation} (${currentStepObj.microOp})`;
    const pct = totalSteps > 0 ? (currentStepIndex / totalSteps) * 100 : 0;
    smStepper.progressBar.style.width = `${pct}%`;

    smStepper.btnPrev.disabled = currentStepIndex === 0;
    smStepper.btnNext.disabled = currentStepIndex === totalSteps;

    // Narrative panel
    smHUD.narrative.innerHTML = `<strong>Step ${currentStepIndex}:</strong> ${currentStepObj.explanation}`;

    // Flowchart highlight
    let branch = null;
    if (currentStepObj.operation === 'Add') branch = '1';
    else if (currentStepObj.operation === 'Shift') {
      branch = currentStepObj.SC === 0 ? 'eq0' : 'neq0';
    }
    MultiplierVisualizers.renderSignedMagnitudeFlowchart('sm-flowchart-container', currentStepObj.flowchartNodeId, branch);

    // Hardware Datapath Diagram
    MultiplierVisualizers.renderSignedMagnitudeHardware('sm-hardware-container', {
      B: currentStepObj.B,
      A: currentStepObj.A,
      Q: currentStepObj.Q,
      E: currentStepObj.E,
      SC: currentStepObj.SC,
      SC_bin: currentStepObj.SC_bin,
      Bs: data.B_sign,
      Qs: data.Q_sign,
      As: data.prodSign,
      Qn: currentStepObj.Qn,
      operation: currentStepObj.operation
    });

    // Update Register Table
    renderSMTable();
  }

  function renderSMTable() {
    const data = state.signedMag.simulationData;
    if (!data) return;

    const currentStepIndex = state.signedMag.currentStep;
    const showAll = state.signedMag.showAllSteps;

    let html = '';
    data.steps.forEach((st, idx) => {
      if (!showAll && idx > currentStepIndex) return;
      const isActive = idx === currentStepIndex;
      html += `
        <tr class="${isActive ? 'active-step-row' : ''}" data-step="${idx}">
          <td class="mono-cell">${st.stepIndex}</td>
          <td><strong>${st.operation}</strong> <span class="mono">(${st.microOp})</span></td>
          <td class="mono-cell">${st.E}</td>
          <td class="mono-cell">${st.A}</td>
          <td class="mono-cell">${st.Q}</td>
          <td class="mono-cell">${st.SC}</td>
          <td>${st.explanation}</td>
        </tr>
      `;
    });

    smHUD.tableBody.innerHTML = html;

    // Scroll active row into view if table is large
    const activeRow = smHUD.tableBody.querySelector('.active-step-row');
    if (activeRow) {
      activeRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function nextSMStep() {
    const data = state.signedMag.simulationData;
    if (!data) return;
    if (state.signedMag.currentStep < data.steps.length - 1) {
      state.signedMag.currentStep++;
      updateSMSimulationUI();
    } else {
      pauseSMSimulation();
    }
  }

  function prevSMStep() {
    if (state.signedMag.currentStep > 0) {
      state.signedMag.currentStep--;
      updateSMSimulationUI();
    }
  }

  function playSMSimulation() {
    state.signedMag.isPlaying = true;
    smStepper.btnPlay.textContent = 'Pause';
    state.signedMag.playTimer = setInterval(() => {
      const data = state.signedMag.simulationData;
      if (data && state.signedMag.currentStep < data.steps.length - 1) {
        nextSMStep();
      } else {
        pauseSMSimulation();
      }
    }, state.signedMag.playSpeedMs);
  }

  function pauseSMSimulation() {
    state.signedMag.isPlaying = false;
    smStepper.btnPlay.textContent = 'Play';
    if (state.signedMag.playTimer) {
      clearInterval(state.signedMag.playTimer);
      state.signedMag.playTimer = null;
    }
  }

  // Event Listeners for Signed Magnitude
  smInputs.btnCalculate.addEventListener('click', calculateSignedMagnitude);

  smInputs.btnPreset.addEventListener('click', () => {
    smInputs.multiplicand.value = 23;
    smInputs.multiplier.value = 19;
    smInputs.width.value = 5;
    calculateSignedMagnitude();
  });

  smInputs.btnClear.addEventListener('click', () => {
    smInputs.multiplicand.value = '';
    smInputs.multiplier.value = '';
    smInputs.validationMsg.textContent = 'Inputs cleared.';
    smInputs.validationMsg.className = 'input-validation-msg';
  });

  smInputs.btnReset.addEventListener('click', () => {
    smInputs.multiplicand.value = 23;
    smInputs.multiplier.value = 19;
    smInputs.width.value = 5;
    calculateSignedMagnitude();
  });

  smStepper.btnNext.addEventListener('click', () => {
    pauseSMSimulation();
    nextSMStep();
  });

  smStepper.btnPrev.addEventListener('click', () => {
    pauseSMSimulation();
    prevSMStep();
  });

  smStepper.btnPlay.addEventListener('click', () => {
    if (state.signedMag.isPlaying) {
      pauseSMSimulation();
    } else {
      const data = state.signedMag.simulationData;
      if (data && state.signedMag.currentStep >= data.steps.length - 1) {
        state.signedMag.currentStep = 0;
        updateSMSimulationUI();
      }
      playSMSimulation();
    }
  });

  smStepper.btnResetStep.addEventListener('click', () => {
    pauseSMSimulation();
    state.signedMag.currentStep = 0;
    updateSMSimulationUI();
  });

  smStepper.btnShowAll.addEventListener('click', () => {
    state.signedMag.showAllSteps = !state.signedMag.showAllSteps;
    smStepper.btnShowAll.textContent = state.signedMag.showAllSteps ? 'Show active step only' : 'Show all steps';
    renderSMTable();
  });

  smStepper.speedSelect.addEventListener('change', (e) => {
    state.signedMag.playSpeedMs = parseInt(e.target.value, 10);
    if (state.signedMag.isPlaying) {
      pauseSMSimulation();
      playSMSimulation();
    }
  });

  // =========================================================================
  // BOOTH'S ALGORITHM SIMULATOR
  // =========================================================================
  const boothInputs = {
    multiplicand: document.getElementById('booth-input-multiplicand'),
    multiplier: document.getElementById('booth-input-multiplier'),
    width: document.getElementById('booth-input-width'),
    validationMsg: document.getElementById('booth-validation-msg'),
    btnCalculate: document.getElementById('booth-btn-calculate'),
    btnPreset: document.getElementById('booth-btn-preset'),
    btnClear: document.getElementById('booth-btn-clear'),
    btnReset: document.getElementById('booth-btn-reset')
  };

  const boothStepper = {
    btnPrev: document.getElementById('booth-btn-prev'),
    btnNext: document.getElementById('booth-btn-next'),
    btnPlay: document.getElementById('booth-btn-play'),
    btnResetStep: document.getElementById('booth-btn-reset-step'),
    btnShowAll: document.getElementById('booth-btn-show-all'),
    speedSelect: document.getElementById('booth-speed-select'),
    progressText: document.getElementById('booth-progress-text'),
    progressBar: document.getElementById('booth-progress-bar')
  };

  const boothHUD = {
    decimalExpr: document.getElementById('booth-hud-decimal'),
    binaryOperands: document.getElementById('booth-hud-binary'),
    pairInfo: document.getElementById('booth-hud-pair'),
    finalResult: document.getElementById('booth-hud-result'),
    regAC: document.getElementById('booth-reg-ac'),
    regQR: document.getElementById('booth-reg-qr'),
    regQn1: document.getElementById('booth-reg-qn1'),
    regSC: document.getElementById('booth-reg-sc'),
    narrative: document.getElementById('booth-step-narrative'),
    tableBody: document.getElementById('booth-table-body')
  };

  function validateBoothInput() {
    const width = parseInt(boothInputs.width.value, 10);
    const minVal = -(1 << (width - 1));
    const maxVal = (1 << (width - 1)) - 1;
    const m1 = parseInt(boothInputs.multiplicand.value, 10);
    const m2 = parseInt(boothInputs.multiplier.value, 10);

    if (isNaN(m1) || isNaN(m2)) {
      boothInputs.validationMsg.textContent = `Please enter valid integers for both operands.`;
      boothInputs.validationMsg.className = 'input-validation-msg error';
      return false;
    }

    if (m1 < minVal || m1 > maxVal || m2 < minVal || m2 > maxVal) {
      boothInputs.validationMsg.textContent = `For ${width}-bit 2's complement, values must be in range [${minVal}, ${maxVal}].`;
      boothInputs.validationMsg.className = 'input-validation-msg error';
      return false;
    }

    boothInputs.validationMsg.textContent = `Valid ${width}-bit 2's complement range: ${minVal} to ${maxVal}. Ready to calculate.`;
    boothInputs.validationMsg.className = 'input-validation-msg';
    return true;
  }

  function calculateBooth() {
    if (!validateBoothInput()) return;

    pauseBoothSimulation();
    const m1 = parseInt(boothInputs.multiplicand.value, 10);
    const m2 = parseInt(boothInputs.multiplier.value, 10);
    const width = parseInt(boothInputs.width.value, 10);

    state.booth.multiplicand = m1;
    state.booth.multiplier = m2;
    state.booth.width = width;

    try {
      state.booth.simulationData = MultiplierEngine.simulateBooth(m1, m2, width);
      state.booth.currentStep = 0;
      updateBoothSimulationUI();
    } catch (err) {
      boothInputs.validationMsg.textContent = `Error: ${err.message}`;
      boothInputs.validationMsg.className = 'input-validation-msg error';
    }
  }

  function updateBoothSimulationUI() {
    const data = state.booth.simulationData;
    if (!data) return;

    const currentStepIndex = state.booth.currentStep;
    const currentStepObj = data.steps[currentStepIndex];
    const totalSteps = data.steps.length - 1;

    // Results HUD
    boothHUD.decimalExpr.textContent = `${data.multiplicand} × ${data.multiplier} = ${data.expectedProduct}`;
    boothHUD.binaryOperands.textContent = `BR = ${data.BR_bin}, -BR = ${data.negBR_bin}, QR = ${data.QR_bin_initial}`;
    boothHUD.pairInfo.textContent = `Current Qn Qn+1 = [${currentStepObj.pair}] ➔ ${currentStepObj.pair === '01' ? 'Add BR' : (currentStepObj.pair === '10' ? 'Subtract BR' : (currentStepObj.pair === '00' || currentStepObj.pair === '11' ? 'No Operation' : 'Done'))}`;
    boothHUD.finalResult.textContent = `[AC:QR] = ${currentStepObj.AC} ${currentStepObj.QR} (${data.computedProduct})`;

    // Live Register HUD
    boothHUD.regAC.textContent = currentStepObj.AC;
    boothHUD.regQR.textContent = currentStepObj.QR;
    boothHUD.regQn1.textContent = currentStepObj.Qn1;
    boothHUD.regSC.textContent = currentStepObj.SC;

    // Register active glows
    ['booth-card-ac', 'booth-card-qr', 'booth-card-qn1', 'booth-card-sc'].forEach(id => {
      document.getElementById(id)?.classList.remove('active-booth-reg');
    });
    if (currentStepObj.highlightRegs.includes('AC')) document.getElementById('booth-card-ac')?.classList.add('active-booth-reg');
    if (currentStepObj.highlightRegs.includes('QR')) document.getElementById('booth-card-qr')?.classList.add('active-booth-reg');
    if (currentStepObj.highlightRegs.includes('Qn1')) document.getElementById('booth-card-qn1')?.classList.add('active-booth-reg');
    if (currentStepObj.highlightRegs.includes('SC')) document.getElementById('booth-card-sc')?.classList.add('active-booth-reg');

    // Stepper progress
    boothStepper.progressText.textContent = `Step ${currentStepIndex} of ${totalSteps} — ${currentStepObj.operation} (${currentStepObj.microOp})`;
    const pct = totalSteps > 0 ? (currentStepIndex / totalSteps) * 100 : 0;
    boothStepper.progressBar.style.width = `${pct}%`;

    boothStepper.btnPrev.disabled = currentStepIndex === 0;
    boothStepper.btnNext.disabled = currentStepIndex === totalSteps;

    // Narrative panel
    boothHUD.narrative.innerHTML = `<strong>Step ${currentStepIndex}:</strong> ${currentStepObj.explanation}`;

    // Flowchart highlight
    let branch = null;
    if (currentStepObj.operation === 'Subtract BR') branch = '10';
    else if (currentStepObj.operation === 'Add BR') branch = '01';
    else if (currentStepObj.operation === 'Ashr') {
      branch = currentStepObj.SC === 0 ? 'eq0' : 'neq0';
    }
    MultiplierVisualizers.renderBoothFlowchart('booth-flowchart-container', currentStepObj.flowchartNodeId, branch);

    // Hardware Datapath
    MultiplierVisualizers.renderBoothHardware('booth-hardware-container', {
      BR: currentStepObj.BR,
      negBR: currentStepObj.negBR,
      AC: currentStepObj.AC,
      QR: currentStepObj.QR,
      Qn: currentStepObj.Qn,
      Qn1: currentStepObj.Qn1,
      SC: currentStepObj.SC,
      pair: currentStepObj.pair,
      operation: currentStepObj.operation
    });

    // Step Table
    renderBoothTable();
  }

  function renderBoothTable() {
    const data = state.booth.simulationData;
    if (!data) return;

    const currentStepIndex = state.booth.currentStep;
    const showAll = state.booth.showAllSteps;

    let html = '';
    data.steps.forEach((st, idx) => {
      if (!showAll && idx > currentStepIndex) return;
      const isActive = idx === currentStepIndex;
      html += `
        <tr class="${isActive ? 'active-booth-row' : ''}" data-step="${idx}">
          <td class="mono-cell">${st.stepIndex}</td>
          <td><strong>${st.comment || st.operation}</strong> <span class="mono">(${st.microOp})</span></td>
          <td class="mono-cell">${st.AC}</td>
          <td class="mono-cell">${st.QR}</td>
          <td class="mono-cell">${st.Qn1}</td>
          <td class="mono-cell">${st.SC}</td>
          <td>${st.explanation}</td>
        </tr>
      `;
    });

    boothHUD.tableBody.innerHTML = html;

    const activeRow = boothHUD.tableBody.querySelector('.active-booth-row');
    if (activeRow) {
      activeRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function nextBoothStep() {
    const data = state.booth.simulationData;
    if (!data) return;
    if (state.booth.currentStep < data.steps.length - 1) {
      state.booth.currentStep++;
      updateBoothSimulationUI();
    } else {
      pauseBoothSimulation();
    }
  }

  function prevBoothStep() {
    if (state.booth.currentStep > 0) {
      state.booth.currentStep--;
      updateBoothSimulationUI();
    }
  }

  function playBoothSimulation() {
    state.booth.isPlaying = true;
    boothStepper.btnPlay.textContent = 'Pause';
    state.booth.playTimer = setInterval(() => {
      const data = state.booth.simulationData;
      if (data && state.booth.currentStep < data.steps.length - 1) {
        nextBoothStep();
      } else {
        pauseBoothSimulation();
      }
    }, state.booth.playSpeedMs);
  }

  function pauseBoothSimulation() {
    state.booth.isPlaying = false;
    boothStepper.btnPlay.textContent = 'Play';
    if (state.booth.playTimer) {
      clearInterval(state.booth.playTimer);
      state.booth.playTimer = null;
    }
  }

  // Event Listeners for Booth's Algorithm
  boothInputs.btnCalculate.addEventListener('click', calculateBooth);

  boothInputs.btnPreset.addEventListener('click', () => {
    boothInputs.multiplicand.value = -9;
    boothInputs.multiplier.value = -13;
    boothInputs.width.value = 5;
    calculateBooth();
  });

  boothInputs.btnClear.addEventListener('click', () => {
    boothInputs.multiplicand.value = '';
    boothInputs.multiplier.value = '';
    boothInputs.validationMsg.textContent = 'Inputs cleared.';
    boothInputs.validationMsg.className = 'input-validation-msg';
  });

  boothInputs.btnReset.addEventListener('click', () => {
    boothInputs.multiplicand.value = -9;
    boothInputs.multiplier.value = -13;
    boothInputs.width.value = 5;
    calculateBooth();
  });

  boothStepper.btnNext.addEventListener('click', () => {
    pauseBoothSimulation();
    nextBoothStep();
  });

  boothStepper.btnPrev.addEventListener('click', () => {
    pauseBoothSimulation();
    prevBoothStep();
  });

  boothStepper.btnPlay.addEventListener('click', () => {
    if (state.booth.isPlaying) {
      pauseBoothSimulation();
    } else {
      const data = state.booth.simulationData;
      if (data && state.booth.currentStep >= data.steps.length - 1) {
        state.booth.currentStep = 0;
        updateBoothSimulationUI();
      }
      playBoothSimulation();
    }
  });

  boothStepper.btnResetStep.addEventListener('click', () => {
    pauseBoothSimulation();
    state.booth.currentStep = 0;
    updateBoothSimulationUI();
  });

  boothStepper.btnShowAll.addEventListener('click', () => {
    state.booth.showAllSteps = !state.booth.showAllSteps;
    boothStepper.btnShowAll.textContent = state.booth.showAllSteps ? 'Show active step only' : 'Show all steps';
    renderBoothTable();
  });

  boothStepper.speedSelect.addEventListener('change', (e) => {
    state.booth.playSpeedMs = parseInt(e.target.value, 10);
    if (state.booth.isPlaying) {
      pauseBoothSimulation();
      playBoothSimulation();
    }
  });

  // =========================================================================
  // COMPARISON SANDBOX
  // =========================================================================
  const compareInputs = {
    m1: document.getElementById('comp-input-m1'),
    m2: document.getElementById('comp-input-m2'),
    btnRun: document.getElementById('comp-btn-run'),
    smStepsCount: document.getElementById('comp-sm-steps'),
    smAddCount: document.getElementById('comp-sm-adds'),
    smShiftCount: document.getElementById('comp-sm-shifts'),
    boothStepsCount: document.getElementById('comp-booth-steps'),
    boothAddSubCount: document.getElementById('comp-booth-addsub'),
    boothShiftCount: document.getElementById('comp-booth-shifts'),
    summaryText: document.getElementById('comp-summary-text')
  };

  function runComparison() {
    const val1 = parseInt(compareInputs.m1.value, 10) || 7;
    const val2 = parseInt(compareInputs.m2.value, 10) || 3;
    const width = 5;

    try {
      const smData = MultiplierEngine.simulateSignedMagnitude(val1, val2, width);
      const boothData = MultiplierEngine.simulateBooth(val1, val2, width);

      const smAdds = smData.steps.filter(s => s.operation === 'Add').length;
      const smShifts = smData.steps.filter(s => s.operation === 'Shift').length;

      const boothAddSubs = boothData.steps.filter(s => s.operation.includes('Add') || s.operation.includes('Sub')).length;
      const boothShifts = boothData.steps.filter(s => s.operation === 'Ashr').length;

      compareInputs.smStepsCount.textContent = smData.steps.length - 1;
      compareInputs.smAddCount.textContent = smAdds;
      compareInputs.smShiftCount.textContent = smShifts;

      compareInputs.boothStepsCount.textContent = boothData.steps.length - 1;
      compareInputs.boothAddSubCount.textContent = boothAddSubs;
      compareInputs.boothShiftCount.textContent = boothShifts;

      let analysis = `For operands (${val1} × ${val2}): Signed-Magnitude required ${smAdds} additions and ${smShifts} shifts. Booth's Algorithm required ${boothAddSubs} additions/subtractions and ${boothShifts} arithmetic shifts. `;
      if (boothAddSubs < smAdds) {
        analysis += `Booth's algorithm performed fewer arithmetic operations due to bit-pair skipping on continuous runs of bits!`;
      } else {
        analysis += `Booth directly preserved 2's complement sign representation without needing separate operand sign logic ($B_s \\oplus Q_s$).`;
      }
      compareInputs.summaryText.textContent = analysis;
    } catch (err) {
      compareInputs.summaryText.textContent = `Error comparing operands: ${err.message}. Please use numbers within 5-bit range [-16 to 15].`;
    }
  }

  compareInputs.btnRun?.addEventListener('click', runComparison);

  // =========================================================================
  // GLOSSARY MODAL
  // =========================================================================
  function openGlossary() {
    glossaryModal.classList.add('active');
    glossaryModal.setAttribute('aria-hidden', 'false');
  }

  function closeGlossary() {
    glossaryModal.classList.remove('active');
    glossaryModal.setAttribute('aria-hidden', 'true');
  }

  btnOpenGlossary?.addEventListener('click', openGlossary);
  btnCloseGlossary?.addEventListener('click', closeGlossary);

  glossaryModal?.addEventListener('click', (e) => {
    if (e.target === glossaryModal) closeGlossary();
  });

  // Mobile Jump Buttons
  document.getElementById('sm-jump-flowchart')?.addEventListener('click', () => {
    document.getElementById('sm-flowchart-panel')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('booth-jump-flowchart')?.addEventListener('click', () => {
    document.getElementById('booth-flowchart-panel')?.scrollIntoView({ behavior: 'smooth' });
  });

  // =========================================================================
  // KEYBOARD ACCESSIBILITY
  // =========================================================================
  window.addEventListener('keydown', (e) => {
    // If video overlay is active
    if (videoOverlay.classList.contains('active')) {
      if (e.key === 'Escape') {
        btnSkipVideo.click();
      } else if (e.key === ' ') {
        e.preventDefault();
        btnVideoPlayPause.click();
      }
      return;
    }

    // If glossary modal is active
    if (glossaryModal.classList.contains('active')) {
      if (e.key === 'Escape') closeGlossary();
      return;
    }

    // Don't intercept typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
      return;
    }

    if (state.currentView === 'signed-magnitude') {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        pauseSMSimulation();
        nextSMStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        pauseSMSimulation();
        prevSMStep();
      } else if (e.key === ' ') {
        e.preventDefault();
        smStepper.btnPlay.click();
      } else if (e.key === 'Home') {
        e.preventDefault();
        smStepper.btnResetStep.click();
      }
    } else if (state.currentView === 'booth') {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        pauseBoothSimulation();
        nextBoothStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        pauseBoothSimulation();
        prevBoothStep();
      } else if (e.key === ' ') {
        e.preventDefault();
        boothStepper.btnPlay.click();
      } else if (e.key === 'Home') {
        e.preventDefault();
        boothStepper.btnResetStep.click();
      }
    }
  });

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  // Initialize simulations with course defaults
  calculateSignedMagnitude();
  calculateBooth();
  runComparison();

  // Route initial hash or default to home
  handleHashChange();
});
