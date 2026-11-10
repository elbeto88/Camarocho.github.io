try {
const SUPABASE_URL = 'https://wpurrdflwijuvxmlxoh.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_uZFWpeGtIlzsNb2z0KrDFQ_r0FVYunx'; 

  
  function safeLocalStorageGet(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
  function safeLocalStorageSet(key, val) { try { localStorage.setItem(key, val); } catch(e) {} }

  let analytics = {
    user_id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: '', age: null, device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
    playtime: 0, correct_answers: 0, wrong_answers: 0,
    games_played: {}, pet_actions: {}, ai_questions: []
  };
  
  const savedId = safeLocalStorageGet('mathLiveUserId');
  if (savedId) analytics.user_id = savedId;
  else safeLocalStorageSet('mathLiveUserId', analytics.user_id);

  async function syncAnalytics() {
    if (!SUPABASE_URL || SUPABASE_URL === 'TU_SUPABASE_URL') return; 
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/user_stats?user_id=eq.${analytics.user_id}`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(analytics)
      });
    } catch (e) { console.error("Error sync", e); }
  }

  setInterval(() => { analytics.playtime += 30; syncAnalytics(); }, 30000); 
  window.addEventListener('beforeunload', syncAnalytics); 

  const toast = document.getElementById('toast');
  function showToast(message) { if (!toast) return; toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }

  // --- FUNCIÓN DE PARTÍCULAS EN LA MASCOTA ---
  function showParticlesAtPet() {
    const petViewer = document.getElementById('modelViewer3D');
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    
    if (petViewer && petViewer.getBoundingClientRect().width > 0) {
      const rect = petViewer.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const container = document.createElement('div');
    container.className = 'particle-container';
    document.body.appendChild(container);
    const colors = ['#ff4d1f', '#2a8c4a', '#ffcc00', '#8a4dff', '#0066cc', '#cc0066'];
    const numParticles = 25;
    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      const angle = Math.random() * Math.PI * 2;
      const velocity = 80 + Math.random() * 120;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');
      container.appendChild(particle);
    }
    setTimeout(() => container.remove(), 800);
  }

  // --- SISTEMA DE CONSENTIMIENTO Y REGISTRO ---
  const consentOverlay = document.getElementById('consentOverlay');
  const consentCheck = document.getElementById('consentCheck');
  const btnAcceptConsent = document.getElementById('btnAcceptConsent');
  const registerOverlay = document.getElementById('registerOverlay');
  const btnRegister = document.getElementById('btnRegister');

  // Habilitar/deshabilitar botón según el checkbox
  if (consentCheck) {
    consentCheck.addEventListener('change', () => {
      if (consentCheck.checked) {
        btnAcceptConsent.disabled = false;
        btnAcceptConsent.style.opacity = '1';
      } else {
        btnAcceptConsent.disabled = true;
        btnAcceptConsent.style.opacity = '0.5';
      }
    });
  }

  // Verificar si ya se aceptó el consentimiento
  const consentAccepted = safeLocalStorageGet('mathLiveConsentAccepted');
  if (consentAccepted === 'true') {
    if (consentOverlay) consentOverlay.classList.remove('active');
    
    const savedName = safeLocalStorageGet('mathLiveUserName');
    const savedAge = safeLocalStorageGet('mathLiveUserAge');
    if (savedName && savedAge) {
      analytics.name = savedName;
      analytics.age = parseInt(savedAge);
      if (registerOverlay) registerOverlay.classList.remove('active');
    } else {
      if (registerOverlay) registerOverlay.classList.add('active');
    }
  }

  // Botón de aceptar consentimiento
  if (btnAcceptConsent) {
    btnAcceptConsent.addEventListener('click', () => {
      if (!consentCheck || !consentCheck.checked) return;
      safeLocalStorageSet('mathLiveConsentAccepted', 'true');
      consentOverlay.classList.remove('active');
      registerOverlay.classList.add('active');
    });
  }

  // Botón de registro
  if (btnRegister) {
    btnRegister.addEventListener('click', () => {
      const name = document.getElementById('regName').value.trim();
      const age = document.getElementById('regAge').value.trim();
      if (!name || !age) { 
        showToast("Por favor, ingresa tu nombre y edad."); 
        return; 
      }
      analytics.name = name; analytics.age = parseInt(age);
      safeLocalStorageSet('mathLiveUserName', name);
      safeLocalStorageSet('mathLiveUserAge', age);
      registerOverlay.classList.remove('active');
      syncAnalytics();
      showToast("¡Bienvenido, " + name + "! 🎉");
    });
  }

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => navMenu.classList.toggle('open'));
  if (navMenu) navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navMenu.classList.remove('open')));

  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.activity-panel').forEach(panel => panel.classList.remove('active'));
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      analytics.games_played[btn.dataset.tab] = (analytics.games_played[btn.dataset.tab] || 0) + 1;
      syncAnalytics();
    });
  });

  let petData = { name: '', model: '', points: 10, xp: 0, level: 1, hunger: 80, happy: 80, health: 100, sleep: 100 };
  try { 
    const savedData = safeLocalStorageGet('matePetData'); 
    if (savedData) {
      petData = JSON.parse(savedData);
      if (petData.xp === undefined) petData.xp = 0;
      if (petData.level === undefined) petData.level = 1;
    } 
  } catch (e) {}
  
  function savePetData() { safeLocalStorageSet('matePetData', JSON.stringify(petData)); }

  const petWidget = document.getElementById('petWidget');
  const widgetToggleBtn = document.getElementById('widgetToggleBtn');
  const petNameInput = document.getElementById('petNameInput');
  const petPointsEl = document.getElementById('petPoints');
  const petLevelEl = document.getElementById('petLevel');
  const xpBar = document.getElementById('xpBar');
  const hungerBar = document.getElementById('hungerBar');
  const happyBar = document.getElementById('happyBar');
  const healthBar = document.getElementById('healthBar');
  const sleepBar = document.getElementById('sleepBar');

  if (petNameInput) {
    if (petData.name) petNameInput.value = petData.name;
    petNameInput.addEventListener('input', (e) => { petData.name = e.target.value; savePetData(); });
  }
  if (petWidget) {
    petWidget.addEventListener('click', (e) => {
      if (petWidget.classList.contains('collapsed') || e.target === widgetToggleBtn || e.target.closest('#widgetToggleBtn')) {
        petWidget.classList.toggle('collapsed');
      }
    });
  }

  function updateHUD() {
    if (petPointsEl) petPointsEl.textContent = petData.points;
    if (petLevelEl) petLevelEl.textContent = petData.level || 1;
    if (xpBar) {
      const currentLevelXp = (petData.level - 1) * 1000;
      const progress = ((petData.xp - currentLevelXp) / 1000) * 100;
      xpBar.style.width = Math.max(1, Math.min(100, progress)) + '%';
    }
    if (hungerBar) hungerBar.style.width = petData.hunger + '%';
    if (happyBar) happyBar.style.width = petData.happy + '%';
    if (healthBar) { healthBar.style.width = petData.health + '%'; healthBar.style.opacity = petData.health < 50 ? '0.6' : '1'; }
    if (sleepBar) sleepBar.style.width = petData.sleep + '%';
  }

  const widgetViewer = document.getElementById('modelViewer3D');
  const heroViewer = document.getElementById('heroModelViewer');
  const viewers = [widgetViewer, heroViewer].filter(v => v !== null);
  let idleAnimName, eatAnimName, playAnimName, sleepAnimName, jumpAnimName, hitAnimName, climbAnimName, fallAnimName;
  let isBusy = false, isPetSick = false, actionTimeout = null;

  function getEvolvedModelUrl() {
    if (!petData.model) return '';
    if (petData.level === 1) return petData.model;
    return petData.model.replace('.glb', `-${petData.level}.glb`);
  }

  async function doesModelExist(url) {
    try { const res = await fetch(url, { method: 'HEAD' }); return res.ok; } catch (e) { return true; }
  }

  function loadPetModel(src) { viewers.forEach(v => v.src = src); }
  function setAllViewersAnimation(animName) { viewers.forEach(v => { if (v && v.availableAnimations && v.availableAnimations.length > 0) v.animationName = animName; }); }

  viewers.forEach(v => {
    if (!v) return;
    v.addEventListener('load', () => {
      const errMsg = v.parentElement.querySelector('.model-error-msg');
      if (errMsg) errMsg.classList.add('hide');
      const animations = v.availableAnimations;
      if (animations && animations.length > 0) {
        if (!idleAnimName) { 
          idleAnimName = animations.find(a => a.toLowerCase().includes('idle')) || animations[0];
          eatAnimName = animations.find(a => a.toLowerCase().includes('eat'));
          sleepAnimName = animations.find(a => a.toLowerCase().includes('sleep'));
          playAnimName = animations.find(a => a.toLowerCase().includes('run'));
          jumpAnimName = animations.find(a => a.toLowerCase().includes('jump'));
          hitAnimName = animations.find(a => a.toLowerCase().includes('hit'));
          climbAnimName = animations.find(a => a.toLowerCase().includes('climb'));
          fallAnimName = animations.find(a => a.toLowerCase().includes('fall') || a.toLowerCase().includes('drop'));
        }
        if (!isBusy && idleAnimName) v.animationName = idleAnimName;
      }
    });
    v.addEventListener('error', () => {
      const errMsg = v.parentElement.querySelector('.model-error-msg');
      if (errMsg) {
        errMsg.innerHTML = '<div class="font-display text-xl italic font-light">Error al cargar</div><p class="text-sm">Falta el archivo 3D.</p>';
        errMsg.classList.remove('hide');
      }
    });
  });

  function playAction(animName, duration, force = false) {
    if (!animName) return;
    if (isBusy && !force) return;
    isBusy = true;
    setAllViewersAnimation(animName);
    clearTimeout(actionTimeout);
    actionTimeout = setTimeout(() => { 
      isBusy = false; 
      if (isPetSick && sleepAnimName) setAllViewersAnimation(sleepAnimName);
      else if (idleAnimName) setAllViewersAnimation(idleAnimName); 
    }, duration);
  }

  async function checkPetEvolution() {
    const newLevel = Math.floor(petData.xp / 1000) + 1;
    if (newLevel > (petData.level || 1)) {
      const newModelUrl = (newLevel === 1) ? petData.model : petData.model.replace('.glb', `-${newLevel}.glb`);
      const exists = await doesModelExist(newModelUrl);
      if (exists) {
        petData.level = newLevel;
        loadPetModel(newModelUrl);
        showToast("¡EVOLUCIÓN! Tu mascota ha subido al Nivel " + newLevel + " 🎉");
        if (jumpAnimName) playAction(jumpAnimName, 3000);
      }
      savePetData(); updateHUD();
    }
  }

  function checkPetStatus() {
    if (petData.health < 50) {
      if (!isPetSick) { isPetSick = true; showToast("Tu mascota se siente débil... ¡Resuelve retos!"); }
      if (!isBusy && sleepAnimName) setAllViewersAnimation(sleepAnimName);
    } else {
      if (isPetSick) { isPetSick = false; showToast("¡Tu mascota se siente mucho mejor!"); if (!isBusy && idleAnimName) setAllViewersAnimation(idleAnimName); }
    }
  }

  setInterval(() => {
    petData.health = Math.max(0, petData.health - 3);
    petData.hunger = Math.max(0, petData.hunger - 1);
    petData.sleep = Math.max(0, petData.sleep - 1);
    checkPetStatus(); savePetData(); updateHUD();
  }, 60000);
  

  const availablePets = [
    { id: 'modelo', name: 'Mascota 1', src: 'modelo.glb' }, 
    { id: 'modelo1', name: 'Mascota 2', src: 'modelo1.glb' },
    { id: 'modelo2', name: 'Mascota 3', src: 'modelo2.glb' }, 
    { id: 'modelo4', name: 'Mascota 4', src: 'modelo4.glb' },
    { id: 'robot', name: 'Robot', src: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb' },
    { id: 'modelo5', name: 'Mascota 6', src: 'modelo5.glb' },
    { id: 'modelo6', name: 'Mascota 7', src: 'modelo6.glb' },
    { id: 'modelo7', name: 'Mascota 8', src: 'modelo7.glb' },
    { id: 'modelo8', name: 'Mascota 9', src: 'modelo8.glb' },
    { id: 'modelo9', name: 'Mascota 10', src: 'modelo9.glb' },
    { id: 'modelo10', name: 'Mascota 11', src: 'modelo10.glb' }
  ];
  
  const selectionOverlay = document.getElementById('selectionOverlay');
  const petGrid = document.getElementById('petGrid');
  const btnSelectPet = document.getElementById('btnSelectPet');
  const closeSelection = document.getElementById('closeSelection');

  function initPetSelection() {
    if (!petGrid) return; petGrid.innerHTML = '';
    availablePets.forEach(pet => {
      const card = document.createElement('div');
      card.className = 'pet-card interactive';
      if (petData.model === pet.src) card.classList.add('selected');
      card.innerHTML = `<model-viewer src="${pet.src}" alt="${pet.name}" style="background: var(--bg); border-radius: 8px;"></model-viewer><h3 class="font-display text-xl mt-2">${pet.name}</h3>`;
      card.addEventListener('click', () => selectPet(pet));
      petGrid.appendChild(card);
    });
  }
  function selectPet(pet) { 
    petData.model = pet.src; petData.level = 1; petData.xp = 0; savePetData(); loadPetModel(pet.src); initPetSelection(); 
    showToast("¡Has elegido a " + pet.name + "!"); updateHUD();
  }
  if (btnSelectPet) btnSelectPet.addEventListener('click', () => { selectionOverlay.classList.add('active'); initPetSelection(); });
  if (closeSelection) closeSelection.addEventListener('click', () => selectionOverlay.classList.remove('active'));
  
  if (!petData.model || !availablePets.some(p => p.src === petData.model)) { 
    petData.model = availablePets[0].src; savePetData(); 
  }
  if (petData.model) loadPetModel(getEvolvedModelUrl());

  const btnFeed = document.getElementById('btnFeed'), btnPlay = document.getElementById('btnPlay'), btnSleep = document.getElementById('btnSleep');
  if (btnFeed) btnFeed.addEventListener('click', () => {
    if (isBusy) return;
    if (petData.points < 2) { showToast("¡Necesitas más puntos! Resuelve un reto."); if (hitAnimName) playAction(hitAnimName, 2000); return; }
    petData.points -= 2; petData.hunger = Math.min(100, petData.hunger + 15); petData.health = Math.min(100, petData.health + 5); petData.sleep = Math.max(0, petData.sleep - 5); 
    if (eatAnimName) playAction(eatAnimName, 3000);
    updateHUD(); savePetData(); showToast("¡" + (petData.name || "Tu mascota") + " está comiendo!");
    analytics.pet_actions.feed = (analytics.pet_actions.feed || 0) + 1; syncAnalytics();
  });
  if (btnPlay) btnPlay.addEventListener('click', () => {
    if (isBusy) return;
    if (petData.points < 2) { showToast("¡Necesitas más puntos! Resuelve un reto."); if (hitAnimName) playAction(hitAnimName, 2000); return; }
    petData.points -= 2; petData.happy = Math.min(100, petData.happy + 15); petData.hunger = Math.max(0, petData.hunger - 10); petData.sleep = Math.max(0, petData.sleep - 15); 
    if (playAnimName) playAction(playAnimName, 3000);
    updateHUD(); savePetData(); showToast("¡Jugando con " + (petData.name || "tu mascota") + "!");
    analytics.pet_actions.play = (analytics.pet_actions.play || 0) + 1; syncAnalytics();
  });
  if (btnSleep) btnSleep.addEventListener('click', () => {
    if (isBusy) return;
    if (petData.points < 2) { showToast("¡Necesitas más puntos! Resuelve un reto."); if (hitAnimName) playAction(hitAnimName, 2000); return; }
    petData.points -= 2; petData.sleep = Math.min(100, petData.sleep + 40); petData.health = Math.min(100, petData.health + 15); petData.hunger = Math.max(0, petData.hunger - 5); 
    if (sleepAnimName) playAction(sleepAnimName, 4000);
    updateHUD(); savePetData(); showToast((petData.name || "Tu mascota") + " está descansando...");
    analytics.pet_actions.sleep = (analytics.pet_actions.sleep || 0) + 1; syncAnalytics();
  });

  let currentDifficulty = 1, currentAnswer = 0;
  const difficultyBtns = document.querySelectorAll('.difficulty-btn');
  const mathQuestionEl = document.getElementById('mathQuestion');
  const mathOptionsContainer = document.getElementById('mathOptionsContainer');
  difficultyBtns.forEach(btn => btn.addEventListener('click', () => { difficultyBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); currentDifficulty = parseInt(btn.dataset.diff); generateQuestion(); }));
  
  function generateQuestion() {
    if (!mathQuestionEl || !mathOptionsContainer) return;
    let num1, num2, big, small;
    if (currentDifficulty === 1) { num1 = Math.floor(Math.random() * 10) + 1; num2 = Math.floor(Math.random() * 10) + 1; if (Math.random() > 0.5) { currentAnswer = num1 + num2; mathQuestionEl.textContent = `${num1} + ${num2} = ?`; } else { big = Math.max(num1, num2); small = Math.min(num1, num2); currentAnswer = big - small; mathQuestionEl.textContent = `${big} - ${small} = ?`; } } 
    else if (currentDifficulty === 2) { num1 = Math.floor(Math.random() * 5) + 2; num2 = Math.floor(Math.random() * 5) + 2; currentAnswer = num1 * num2; mathQuestionEl.textContent = `${num1} × ${num2} = ?`; } 
    else { num2 = Math.floor(Math.random() * 4) + 2; const result = Math.floor(Math.random() * 5) + 2; num1 = num2 * result; currentAnswer = result; mathQuestionEl.textContent = `${num1} ÷ ${num2} = ?`; }
    const options = [currentAnswer];
    while (options.length < 4) { let wrong = currentAnswer + (Math.floor(Math.random() * 7) - 3); if (wrong !== currentAnswer && wrong >= 0 && !options.includes(wrong)) options.push(wrong); }
    options.sort(() => Math.random() - 0.5); mathOptionsContainer.innerHTML = '';
    options.forEach(opt => { const btn = document.createElement('button'); btn.className = 'math-option interactive'; btn.textContent = opt; btn.addEventListener('click', () => checkAnswer(opt, btn)); mathOptionsContainer.appendChild(btn); });
  }
  function checkAnswer(selected, btn) {
    if (selected === currentAnswer) {
      btn.classList.add('correct'); petData.points += 10; petData.xp += 10; petData.happy = Math.min(100, petData.happy + 5); petData.health = Math.min(100, petData.health + 5); 
      showToast("¡Correcto! +10 puntos y +10 XP."); 
      showParticlesAtPet(); 
      if (jumpAnimName) playAction(jumpAnimName, 2000); updateHUD(); savePetData(); checkPetEvolution(); setTimeout(generateQuestion, 1500);
      analytics.correct_answers++; syncAnalytics();
    } else { btn.classList.add('wrong'); showToast("¡Casi! Inténtalo de nuevo."); if (hitAnimName) playAction(hitAnimName, 1500); analytics.wrong_answers++; syncAnalytics(); }
  }

  const contactForm = document.getElementById('contactForm'), submitBtn = document.getElementById('submitBtn'), submitBtnText = document.getElementById('submitBtnText');
  if (contactForm) contactForm.addEventListener('submit', async (e) => {
    e.preventDefault(); if (submitBtnText) submitBtnText.textContent = "Enviando..."; if (submitBtn) submitBtn.disabled = true;
    const formData = new FormData(contactForm); const object = Object.fromEntries(formData); const json = JSON.stringify(object);
    try { const response = await fetch(contactForm.action, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: json }); const result = await response.json(); if (result.success) { showToast("¡Mensaje enviado con éxito!"); contactForm.reset(); } else { showToast("Hubo un error. Intenta de nuevo."); } } catch (error) { contactForm.submit(); }
    if (submitBtnText) submitBtnText.textContent = "Enviar mensaje"; if (submitBtn) submitBtn.disabled = false;
  });

  const aiBubble = document.getElementById('aiBubble'), aiChatWindow = document.getElementById('aiChatWindow'), closeAiChat = document.getElementById('closeAiChat'), aiMessages = document.getElementById('aiMessages'), aiInput = document.getElementById('aiInput'), aiSendBtn = document.getElementById('aiSendBtn');
  if (aiBubble) aiBubble.addEventListener('click', () => aiChatWindow.classList.add('open'));
  if (closeAiChat) closeAiChat.addEventListener('click', () => aiChatWindow.classList.remove('open'));
  async function sendAiMessage() {
    if (!aiInput || !aiMessages) return; const userText = aiInput.value.trim(); if (!userText) return;
    const userMsgEl = document.createElement('div'); userMsgEl.className = 'ai-msg user'; userMsgEl.textContent = userText; aiMessages.appendChild(userMsgEl); aiInput.value = ''; aiMessages.scrollTop = aiMessages.scrollHeight;
    const typingEl = document.createElement('div'); typingEl.className = 'ai-msg bot typing-indicator'; typingEl.textContent = "Escribiendo..."; aiMessages.appendChild(typingEl); aiMessages.scrollTop = aiMessages.scrollHeight;
    try { const systemPrompt = "Eres un profesor de matemáticas amigable para niños de 5 a 7 años. Explicas sumas, restas, multiplicaciones, divisiones y figuras geométricas de forma muy sencilla, usando ejemplos visuales y muchos emojis. Tus respuestas deben ser cortas y motivadoras."; const response = await puter.ai.chat(userText, { systemPrompt: systemPrompt }); typingEl.remove(); const botMsgEl = document.createElement('div'); botMsgEl.className = 'ai-msg bot'; botMsgEl.textContent = response.message.content || response; aiMessages.appendChild(botMsgEl); aiMessages.scrollTop = aiMessages.scrollHeight; } 
    catch (error) { typingEl.remove(); const errorMsgEl = document.createElement('div'); errorMsgEl.className = 'ai-msg bot'; errorMsgEl.textContent = "¡Ups! Se me desconectó el cerebro por un segundo. Intenta preguntarme de nuevo. 🤖"; aiMessages.appendChild(errorMsgEl); }
    analytics.ai_questions.push(userText); syncAnalytics();
  }
  if (aiSendBtn) aiSendBtn.addEventListener('click', sendAiMessage);
  if (aiInput) aiInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendAiMessage(); });

  let audioCtx = null;
  function playSound(type) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.connect(gain); gain.connect(audioCtx.destination);
      if (type === 'jump' || type === 'climb') { osc.type = 'square'; osc.frequency.value = 440; osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1); osc.start(); osc.stop(audioCtx.currentTime + 0.1); } 
      else if (type === 'coin') { osc.type = 'triangle'; osc.frequency.value = 880; osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.05); gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15); osc.start(); osc.stop(audioCtx.currentTime + 0.15); } 
      else if (type === 'pop') { osc.type = 'sine'; osc.frequency.value = 600; osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05); gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05); osc.start(); osc.stop(audioCtx.currentTime + 0.05); } 
      else if (type === 'fail') { osc.type = 'sawtooth'; osc.frequency.value = 200; osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.3); gain.gain.setValueAtTime(0.15, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3); osc.start(); osc.stop(audioCtx.currentTime + 0.3); }
    } catch(e) {}
  }
  updateHUD(); generateQuestion(); 

  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('service-worker.js').catch(err => console.error('Error SW:', err)));

  // --- ENCUESTA GAMEX ---
  const gamexData = [
    { dim: "1. Disfrute (Enjoyment)", questions: ["Jugar el juego fue divertido.", "Me gustó jugar el juego.", "Disfruté mucho jugando el juego.", "Mi experiencia de juego fue agradable.", "Creo que jugar el juego es muy entretenido.", "Jugaría a este juego por sí mismo, no solo cuando me lo pidan."] },
    { dim: "2. Absorción (Absorption)", questions: ["Jugar el juego me hizo olvidar dónde estoy.", "Me olvidé de mi entorno inmediato mientras jugaba.", "Después de jugar, sentí como si volviera al 'mundo real' tras un viaje.", "Jugar el juego me alejó de todo.", "Mientras jugaba, era completamente ajeno/a a todo lo que me rodeaba.", "Mientras jugaba, perdí la noción del tiempo."] },
    { dim: "3. Pensamiento Creativo (Creative Thinking)", questions: ["Jugar el juego despertó mi imaginación.", "Mientras jugaba me sentí creativo/a.", "Mientras jugaba sentí que podía explorar cosas.", "Mientras jugaba me sentí aventurero/a."] },
    { dim: "4. Activación (Activation)", questions: ["Mientras jugaba me sentí activado/a.", "Mientras jugaba me sentí inquieto/a.", "Mientras jugaba me sentí frenético/a.", "Mientras jugaba me sentí emocionado/a."] },
    { dim: "5. Ausencia de Afecto Negativo (Absence of Negative Affect)", questions: ["Mientras jugaba me sentí molesto/a.", "Mientras jugaba me sentí hostil.", "Mientras jugaba me sentí frustrado/a."] },
    { dim: "6. Dominio (Dominance)", questions: ["Mientras jugaba sentía que tenía el control.", "Mientras jugaba me sentí influyente.", "Mientras jugaba me sentí autónomo/a.", "Mientras jugaba me sentí seguro/a."] }
  ];
  
  const gamexForm = document.getElementById('gamexForm');
  if (gamexForm) {
    let html = '';
    gamexData.forEach((dimData, dIndex) => {
      html += `<div class="gamex-dimension"><h3>${dimData.dim}</h3>`;
      dimData.questions.forEach((q, qIndex) => {
        const qId = `gamex_${dIndex}_${qIndex}`;
        html += `
          <div class="gamex-question">
            <p>${q}</p>
            <div class="gamex-scale">
              <label>1<input type="radio" name="${qId}" value="1" required></label>
              <label>2<input type="radio" name="${qId}" value="2"></label>
              <label>3 (Neutral)<input type="radio" name="${qId}" value="3"></label>
              <label>4<input type="radio" name="${qId}" value="4"></label>
              <label>5<input type="radio" name="${qId}" value="5"></label>
            </div>
          </div>`;
      });
      html += `</div>`;
    });
    gamexForm.innerHTML = html;
  }

  const submitGamexBtn = document.getElementById('submitGamexBtn');
  if (submitGamexBtn) {
    submitGamexBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const formData = new FormData(gamexForm);
      let allAnswered = true;
      let qCounter = 1;
      
      gamexData.forEach((dimData, dIndex) => {
        dimData.questions.forEach((q, qIndex) => {
          const qId = `gamex_${dIndex}_${qIndex}`;
          const val = formData.get(qId);
          if (!val) allAnswered = false;
          analytics['gamex_q' + qCounter] = val ? parseInt(val) : null;
          qCounter++;
        });
      });

      if (!allAnswered) {
        showToast("Por favor, responde todas las preguntas.");
        return;
      }

      syncAnalytics();
      showToast("¡Gracias por tus respuestas! 📝");
      gamexForm.reset();
      submitGamexBtn.disabled = true;
      submitGamexBtn.textContent = "Enviado ✓";
    });
  }

  // --- MINIJUEGO 1: SALTA Y SUMA ---
  const levelShapes = [{ name: 'Triángulos', sides: 3, formula: 'P=3L, A=(b*h)/2' }, { name: 'Cuadrados', sides: 4, formula: 'P=4L, A=L^2' }, { name: 'Círculos', sides: 0, formula: 'P=2πr, A=πr^2' }, { name: 'Pentágonos', sides: 5, formula: 'P=5L, A=(P*a)/2' }, { name: 'Hexágonos', sides: 6, formula: 'P=6L, A=(P*a)/2' }];
  function initMiniGame1() {
    const canvas = document.getElementById('gameCanvas'); if (!canvas) return; const ctx = canvas.getContext('2d'); const W = canvas.width, H = canvas.height; const GRAVITY = 0.8, GROUND_Y = H - 60, MAX_JUMPS = 3, LEVEL_WIDTH = 2400;
    const runFrames = []; ['run.png', 'run2.png', 'run3.png'].forEach(src => { const img = new Image(); img.src = src; runFrames.push(img); });
    const player = { x: 100, y: GROUND_Y, w: 60, h: 70, vx: 0, vy: 0, speed: 5, jumpPower: 13, grounded: true, jumpsLeft: MAX_JUMPS, frameCount: 0 };
    let platforms = [], coins = [], enemies = [], keys = { left: false, right: false, jump: false }; let cameraX = 0, currentGameLevel = 1, totalCoins = 0, coinsCollected = 0, isLevelTransitioning = false;
    function drawShape(x, y, w, h, sides) { ctx.fillStyle = '#ff4d4d'; ctx.beginPath(); if (sides === 0) { ctx.arc(x + w/2, y + h/2, w/2, 0, Math.PI * 2); } else if (sides === 4) { ctx.rect(x, y, w, h); } else if (sides === 3) { ctx.moveTo(x + w/2, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); } else { let cx = x + w/2, cy = y + h/2, radius = w/2; for (let i = 0; i < sides; i++) { let angle = (Math.PI * 2 * i / sides) - Math.PI / 2; let px = cx + radius * Math.cos(angle), py = cy + radius * Math.sin(angle); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.closePath(); } ctx.fill(); }
    function initGame() { player.x = 100; player.y = GROUND_Y; player.vy = 0; player.grounded = true; player.jumpsLeft = MAX_JUMPS; platforms = [{ x: 0, y: GROUND_Y, w: 600, h: H - GROUND_Y }, { x: 750, y: GROUND_Y, w: 600, h: H - GROUND_Y }, { x: 1500, y: GROUND_Y, w: 900, h: H - GROUND_Y }, { x: 200, y: 280, w: 120, h: 20 }, { x: 450, y: 220, w: 120, h: 20 }, { x: 850, y: 260, w: 150, h: 20 }, { x: 1100, y: 200, w: 120, h: 20 }, { x: 1600, y: 280, w: 100, h: 20 }, { x: 1850, y: 220, w: 120, h: 20 }, { x: 2100, y: 260, w: 150, h: 20 }]; coins = [{ x: 250, y: 240, r: 10 }, { x: 500, y: 180, r: 10 }, { x: 900, y: 220, r: 10 }, { x: 1150, y: 160, r: 10 }, { x: 1650, y: 240, r: 10 }, { x: 1900, y: 180, r: 10 }, { x: 2150, y: 220, r: 10 }, { x: 2300, y: 320, r: 10 }].map(c => ({...c, collected: false})); totalCoins = coins.length; coinsCollected = 0; let speed = 1.5 + (currentGameLevel - 1) * 0.5; enemies = [{ x: 350, y: GROUND_Y - 30, w: 30, h: 30, vx: speed, rangeStart: 300, rangeEnd: 550 }, { x: 950, y: GROUND_Y - 30, w: 30, h: 30, vx: speed, rangeStart: 800, rangeEnd: 1300 }, { x: 1700, y: GROUND_Y - 30, w: 30, h: 30, vx: speed, rangeStart: 1550, rangeEnd: 1800 }, { x: 2050, y: GROUND_Y - 30, w: 30, h: 30, vx: speed, rangeStart: 1950, rangeEnd: 2300 }]; }
    function gameLoop() { try { cameraX = player.x - W / 2 + player.w / 2; if (cameraX < 0) cameraX = 0; if (cameraX > LEVEL_WIDTH - W) cameraX = LEVEL_WIDTH - W; ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#87CEEB'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(-cameraX, 0); if (!isLevelTransitioning) { if (keys.left) player.vx = -player.speed; else if (keys.right) player.vx = player.speed; else player.vx = 0; player.x += player.vx; player.y += player.vy; player.vy += GRAVITY; if (player.x < 0) player.x = 0; if (player.x + player.w > LEVEL_WIDTH) player.x = LEVEL_WIDTH - player.w; if (player.y > H + 100) { showToast("¡Caíste! Reintentando Nivel " + currentGameLevel); initGame(); } let onGround = false; platforms.forEach(p => { ctx.fillStyle = '#8B4513'; if (p.y !== GROUND_Y) ctx.fillStyle = '#2a8c4a'; ctx.fillRect(p.x, p.y, p.w, p.h); if (player.x < p.x + p.w && player.x + player.w > p.x && player.y + player.h > p.y && player.y + player.h < p.y + p.h + 15 && player.vy > 0) { player.y = p.y - player.h; player.vy = 0; player.grounded = true; player.jumpsLeft = MAX_JUMPS; onGround = true; } }); if (!onGround) player.grounded = false; if (keys.jump && player.jumpsLeft > 0) { player.vy = -player.jumpPower; player.grounded = false; player.jumpsLeft--; keys.jump = false; playSound('jump'); } let shapeInfo = levelShapes[(currentGameLevel - 1) % levelShapes.length]; enemies.forEach(e => { e.x += e.vx; if (e.x < e.rangeStart || e.x + e.w > e.rangeEnd) e.vx *= -1; drawShape(e.x, e.y, e.w, e.h, shapeInfo.sides); ctx.font = 'bold 24px Space Grotesk'; const textWidth = ctx.measureText(shapeInfo.formula).width; ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; ctx.fillRect(e.x + e.w + 10, e.y - 5, textWidth + 16, 34); ctx.fillStyle = '#1a1814'; ctx.fillText(shapeInfo.formula, e.x + e.w + 18, e.y + 20); if (player.x < e.x + e.w && player.x + player.w > e.x && player.y + player.h > e.y) { showToast("¡Te atrapó un " + shapeInfo.name.slice(0, -1) + "! Reintentando..."); playSound('jump'); initGame(); } }); coins.forEach(c => { if (!c.collected) { ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fillStyle = '#FFD700'; ctx.fill(); ctx.closePath(); if (player.x < c.x + c.r && player.x + player.w > c.x - c.r && player.y < c.y + c.r && player.y + player.h > c.y - c.r) { c.collected = true; coinsCollected++; petData.points += 5; petData.xp += 5; petData.happy = Math.min(100, petData.happy + 2); petData.health = Math.min(100, petData.health + 1); updateHUD(); savePetData(); checkPetEvolution(); showToast("¡Moneda! (" + coinsCollected + "/" + totalCoins + ")"); playSound('coin'); if (coinsCollected === totalCoins) { isLevelTransitioning = true; if (currentGameLevel >= 5) { petData.points += 2; petData.xp += 50; petData.happy = Math.min(100, petData.happy + 10); petData.health = Math.min(100, petData.health + 5); updateHUD(); savePetData(); checkPetEvolution(); showToast("¡VICTORIA! Completaste los 5 niveles. ¡+2 pts y +50 XP!"); if (jumpAnimName) playAction(jumpAnimName, 3000); setTimeout(() => { currentGameLevel = 1; isLevelTransitioning = false; initGame(); }, 3000); } else { currentGameLevel++; let nextShape = levelShapes[(currentGameLevel - 1) % levelShapes.length]; showToast("¡Nivel Completado! Prepárate para " + nextShape.name); setTimeout(() => { isLevelTransitioning = false; initGame(); }, 1500); } } } } }); } player.frameCount++; let currentFrame = (player.vx !== 0 || !player.grounded) ? runFrames[Math.floor(player.frameCount / 5) % runFrames.length] : runFrames[0]; if (currentFrame && currentFrame.complete && currentFrame.naturalWidth !== 0) { ctx.drawImage(currentFrame, player.x, player.y, player.w, player.h); } else { ctx.fillStyle = '#ff4d1f'; ctx.fillRect(player.x, player.y, player.w, player.h); } ctx.restore(); ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.font = 'bold 18px Space Grotesk, sans-serif'; ctx.fillText("Nivel " + currentGameLevel + "/5: " + (levelShapes[(currentGameLevel - 1) % levelShapes.length].name), 20, 30); ctx.fillText("Monedas: " + coinsCollected + "/" + totalCoins, 20, 55); } catch (e) { console.error("Error en el game loop:", e); } requestAnimationFrame(gameLoop); }
    document.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') keys.left = true; if (e.key === 'ArrowRight') keys.right = true; if (e.key === ' ' || e.key === 'ArrowUp') { if (!keys.jump) keys.jump = true; e.preventDefault(); } });
    document.addEventListener('keyup', (e) => { if (e.key === 'ArrowLeft') keys.left = false; if (e.key === 'ArrowRight') keys.right = false; if (e.key === ' ' || e.key === 'ArrowUp') keys.jump = false; });
    const btnLeft = document.getElementById('btnLeft'), btnRight = document.getElementById('btnRight'), btnJump = document.getElementById('btnJump');
    function setupTouch(btn, key) { if(!btn) return; btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; }); btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[key] = false; }); btn.addEventListener('mousedown', () => keys[key] = true); btn.addEventListener('mouseup', () => keys[key] = false); btn.addEventListener('mouseleave', () => keys[key] = false); }
    setupTouch(btnLeft, 'left'); setupTouch(btnRight, 'right');
    if(btnJump) { btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); keys.jump = true; }); btnJump.addEventListener('touchend', (e) => { e.preventDefault(); keys.jump = false; }); btnJump.addEventListener('mousedown', () => keys.jump = true); btnJump.addEventListener('mouseup', () => keys.jump = false); }
    initGame(); gameLoop();
  }
  initMiniGame1();

  // --- MINIJUEGO 2: CUENTA Y TOCA ---
  let countNum1, countNum2, countIsAddition, countTarget, countTapped;
  const objectsContainer = document.getElementById('objectsContainer'), countPrompt = document.getElementById('countPrompt'), countStatus = document.getElementById('countStatus'), resetCountBtn = document.getElementById('resetCountBtn');
  function generateCountGame() { if (!objectsContainer) return; countIsAddition = Math.random() > 0.5; countNum1 = Math.floor(Math.random() * 5) + 2; countNum2 = Math.floor(Math.random() * 5) + 1; countTapped = 0; objectsContainer.innerHTML = ''; const emojis = ['🍎', '🔵', '⭐', '🐱', '🟢']; const emoji = emojis[Math.floor(Math.random() * emojis.length)]; if (countIsAddition) { countTarget = countNum1 + countNum2; countPrompt.textContent = `${countNum1} + ${countNum2} = ?`; countStatus.textContent = `Toca ${countTarget} objetos`; for (let i = 0; i < countTarget; i++) { const obj = document.createElement('div'); obj.className = 'count-obj interactive'; obj.innerHTML = `<span>${emoji}</span>`; obj.addEventListener('click', () => handleTap(obj)); objectsContainer.appendChild(obj); } } else { if (countNum2 > countNum1) [countNum1, countNum2] = [countNum2, countNum1]; countTarget = countNum2; countPrompt.textContent = `${countNum1} - ${countNum2} = ?`; countStatus.textContent = `Quita ${countTarget} objetos (tócalos)`; for (let i = 0; i < countNum1; i++) { const obj = document.createElement('div'); obj.className = 'count-obj interactive'; obj.innerHTML = `<span>${emoji}</span>`; obj.addEventListener('click', () => handleTap(obj)); objectsContainer.appendChild(obj); } } }
  function handleTap(obj) { if (obj.classList.contains('tapped')) return; obj.classList.add('tapped'); playSound('pop'); countTapped++; if (countTapped === countTarget) { petData.points += 10; petData.xp += 10; petData.happy = Math.min(100, petData.happy + 5); petData.health = Math.min(100, petData.health + 5); updateHUD(); savePetData(); checkPetEvolution(); showToast("¡Excelente! +10 puntos y +10 XP."); showParticlesAtPet(); if (jumpAnimName) playAction(jumpAnimName, 2000); setTimeout(generateCountGame, 1500); analytics.correct_answers++; syncAnalytics(); } else if (countTapped > countTarget) { showToast("¡Oops! Tocaste demasiados. Reiniciando."); setTimeout(generateCountGame, 1000); analytics.wrong_answers++; syncAnalytics(); } }
  if (resetCountBtn) resetCountBtn.addEventListener('click', generateCountGame); generateCountGame();

  // --- MINIJUEGO 3: AGRUPA Y REPARTE ---
  let grpIsMult, grpNum1, grpNum2, grpBoxes = [], grpPileItems = [], grpDistIndex = 0;
  const grpPrompt = document.getElementById('grpPrompt'), grpStatus = document.getElementById('grpStatus'), grpPileContainer = document.getElementById('grpPileContainer'), grpBoxesContainer = document.getElementById('grpBoxesContainer'), resetGrpBtn = document.getElementById('resetGrpBtn');
  function generateGrpGame() { if (!grpBoxesContainer) return; grpIsMult = Math.random() > 0.5; grpBoxes = []; grpPileItems = []; grpDistIndex = 0; grpPileContainer.innerHTML = ''; grpBoxesContainer.innerHTML = ''; const emojis = ['🍎', '🔵', '⭐', '🐱', '🟢', '🍊']; const currentEmoji = emojis[Math.floor(Math.random() * emojis.length)]; if (grpIsMult) { grpNum1 = Math.floor(Math.random() * 4) + 2; grpNum2 = Math.floor(Math.random() * 4) + 2; grpPrompt.textContent = `${grpNum1} × ${grpNum2} = ?`; grpStatus.textContent = `Toca cada caja ${grpNum2} veces`; for (let i = 0; i < grpNum1; i++) { const box = { count: 0, full: false, element: null }; const div = document.createElement('div'); div.className = 'grp-box interactive'; div.innerHTML = `<div class="grp-box-content"></div>`; div.addEventListener('click', () => handleMultTap(box, currentEmoji)); box.element = div; grpBoxes.push(box); grpBoxesContainer.appendChild(div); } } else { grpNum2 = Math.floor(Math.random() * 3) + 2; let mult = Math.floor(Math.random() * 3) + 2; grpNum1 = grpNum2 * mult; grpPrompt.textContent = `${grpNum1} ÷ ${grpNum2} = ?`; grpStatus.textContent = `Toca los objetos para repartir en ${grpNum2} cajas`; for (let i = 0; i < grpNum2; i++) { const div = document.createElement('div'); div.className = 'grp-box'; div.innerHTML = `<div class="grp-box-content"></div>`; grpBoxesContainer.appendChild(div); } for (let i = 0; i < grpNum1; i++) { const item = document.createElement('div'); item.className = 'grp-item-pile interactive'; item.innerHTML = `<span>${currentEmoji}</span>`; item.addEventListener('click', () => handleDivTap(item, currentEmoji)); grpPileContainer.appendChild(item); grpPileItems.push(item); } } }
  function handleMultTap(box, emoji) { if (box.full) return; box.count++; playSound('pop'); const content = box.element.querySelector('.grp-box-content'); content.innerHTML += `<span style="font-size: 1.8rem">${emoji}</span>`; if (box.count === grpNum2) { box.full = true; box.element.classList.add('full'); } if (grpBoxes.every(b => b.full)) { petData.points += 10; petData.xp += 10; petData.happy = Math.min(100, petData.happy + 5); petData.health = Math.min(100, petData.health + 5); updateHUD(); savePetData(); checkPetEvolution(); showToast("¡Excelente! +10 puntos y +10 XP."); showParticlesAtPet(); if (jumpAnimName) playAction(jumpAnimName, 2000); setTimeout(generateGrpGame, 1500); analytics.correct_answers++; syncAnalytics(); } }
  function handleDivTap(item, emoji) { item.style.visibility = 'hidden'; playSound('pop'); const box = grpBoxesContainer.children[grpDistIndex]; const content = box.querySelector('.grp-box-content'); content.innerHTML += `<span style="font-size: 1.8rem">${emoji}</span>`; grpDistIndex = (grpDistIndex + 1) % grpNum2; if (grpPileItems.every(i => i.style.visibility === 'hidden')) { petData.points += 10; petData.xp += 10; petData.happy = Math.min(100, petData.happy + 5); petData.health = Math.min(100, petData.health + 5); updateHUD(); savePetData(); checkPetEvolution(); showToast("¡Excelente! +10 puntos y +10 XP."); showParticlesAtPet(); if (jumpAnimName) playAction(jumpAnimName, 2000); setTimeout(generateGrpGame, 1500); analytics.correct_answers++; syncAnalytics(); } }
  if (resetGrpBtn) resetGrpBtn.addEventListener('click', generateGrpGame); generateGrpGame();

  // --- MINIJUEGO 4: ESCALA MÚLTIPLOS ---
  let multLevel = 1, multExercise = 1, multErrors = 0, multBaseNum = 0, multCurrentTaps = 0, multCurrentMultiple = 0, multLastTapTime = 0, multTimerInterval = null, multIsGameOver = false, multHasStarted = false;
  const multTapArea = document.getElementById('multTapArea'), multBubblesContainer = document.getElementById('multBubblesContainer'), multLevelEl = document.getElementById('multLevel'), multExerciseEl = document.getElementById('multExercise'), multErrorsEl = document.getElementById('multErrors'), multTargetText = document.getElementById('multTargetText'), multStatus = document.getElementById('multStatus'), resetMultBtn = document.getElementById('resetMultBtn'), startMultBtn = document.getElementById('startMultBtn'), multProgressDots = document.getElementById('multProgressDots');
  function resetMultGameState() { multLevel = 1; multErrors = 0; multIsGameOver = false; multHasStarted = false; multCurrentTaps = 0; multCurrentMultiple = 0; multBubblesContainer.innerHTML = ''; multProgressDots.innerHTML = ''; multLevelEl.textContent = 0; multExerciseEl.textContent = 0; multErrorsEl.textContent = 0; multTargetText.textContent = "Prepárate"; multStatus.textContent = "Pulsa 'Comenzar' cuando estés listo"; multStatus.style.color = "var(--accent-2)"; multTapArea.classList.add('disabled'); clearInterval(multTimerInterval); if(startMultBtn) startMultBtn.style.display = 'inline-flex'; }
  function startMultLevel() { multBaseNum = Math.floor(Math.random() * 10) + 1; multCurrentMultiple = 0; multExercise = 1; multCurrentTaps = 0; multBubblesContainer.innerHTML = ''; multProgressDots.innerHTML = ''; for(let i = 0; i < multBaseNum; i++) { const dot = document.createElement('div'); dot.className = 'mult-progress-dot'; multProgressDots.appendChild(dot); } updateMultUI(); multStatus.textContent = "¡Toca " + multBaseNum + " veces seguidas!"; multStatus.style.color = "var(--accent-2)"; multTapArea.classList.remove('disabled'); startMultTimer(); }
  function updateMultUI() { multLevelEl.textContent = multLevel; multExerciseEl.textContent = multExercise; multErrorsEl.textContent = multErrors; multTargetText.textContent = "Toca " + multBaseNum + " veces (" + multCurrentTaps + "/" + multBaseNum + ")"; const dots = multProgressDots.children; for(let i = 0; i < dots.length; i++) { if(i < multCurrentTaps) dots[i].classList.add('active'); else dots[i].classList.remove('active'); } }
  function handleMultTap() { if (multIsGameOver || !multHasStarted) return; if (isBusy) { triggerMultError("¡Te adelantaste! Espera a que termine de escalar."); return; } multLastTapTime = Date.now(); multCurrentTaps++; playSound('climb'); updateMultUI(); if (multCurrentTaps === multBaseNum) { multCurrentMultiple += multBaseNum; const bubble = document.createElement('div'); bubble.className = 'mult-bubble'; bubble.textContent = multCurrentMultiple; multBubblesContainer.appendChild(bubble); petData.points += 10; petData.xp += 10; petData.happy = Math.min(100, petData.happy + 5); petData.health = Math.min(100, petData.health + 10); updateHUD(); savePetData(); checkPetEvolution(); showToast("¡Correcto! +10 pts y +10 XP. Múltiplo: " + multCurrentMultiple); showParticlesAtPet(); multCurrentTaps = 0; multExercise++; if (multExercise > 10) { multLevel++; if (multLevel > 10) { multStatus.textContent = "¡Juego Completado! 🏆"; multStatus.style.color = "var(--accent)"; multIsGameOver = true; multHasStarted = false; clearInterval(multTimerInterval); if (jumpAnimName) playAction(jumpAnimName, 3000); showToast("¡Felicidades! Completaste todos los niveles."); return; } showToast("¡Nivel " + (multLevel - 1) + " completado!"); setTimeout(() => startMultLevel(), 1500); } else { multStatus.textContent = "¡Excelente! Sigue tocando " + multBaseNum + " veces."; if (climbAnimName) playAction(climbAnimName, 800); } analytics.correct_answers++; syncAnalytics(); } }
  function triggerMultError(reason) { if (multIsGameOver || !multHasStarted) return; multErrors++; multCurrentTaps = 0; updateMultUI(); playSound('fail'); if (multErrors >= 5) { multIsGameOver = true; multHasStarted = false; clearInterval(multTimerInterval); multStatus.textContent = "¡Caíste! Demasiados errores. Reiniciando..."; multStatus.style.color = "#ff4d4d"; multTapArea.classList.add('disabled'); if (fallAnimName) playAction(fallAnimName, 1500); if (sleepAnimName) setTimeout(() => { playAction(sleepAnimName, 3000); }, 1500); showToast("¡Te quedaste dormido! Volviendo al inicio..."); setTimeout(() => { resetMultGameState(); }, 4000); } else { multStatus.textContent = reason + " Llevas " + multErrors + "/5 errores."; multStatus.style.color = "#ff4d4d"; showToast(reason); } analytics.wrong_answers++; syncAnalytics(); }
  function startMultTimer() { clearInterval(multTimerInterval); multLastTapTime = Date.now(); multTimerInterval = setInterval(() => { if (multIsGameOver || !multHasStarted) return; if (Date.now() - multLastTapTime > 4000) { triggerMultError("¡Muy lento! Te demoraste más de 4 segundos."); multLastTapTime = Date.now(); } }, 500); }
  if (multTapArea) { multTapArea.addEventListener('click', handleMultTap); multTapArea.addEventListener('touchstart', (e) => { e.preventDefault(); handleMultTap(); }, { passive: false }); }
  if (startMultBtn) startMultBtn.addEventListener('click', () => { multHasStarted = true; startMultBtn.style.display = 'none'; startMultLevel(); });
  if (resetMultBtn) resetMultBtn.addEventListener('click', () => { resetMultGameState(); });
  resetMultGameState();

  // --- MINIJUEGO 5: FRACCIONES ---
  let fracCurrentDenom = 0, fracShadedCount = 0, fracCorrectValue = 0;
  const fracPrompt = document.getElementById('fracPrompt'), fracStatus = document.getElementById('fracStatus'), fracDenomContainer = document.getElementById('fracDenomContainer'), fracSvg = document.getElementById('fracSvg'), checkFracBtn = document.getElementById('checkFracBtn'), resetFracBtn = document.getElementById('resetFracBtn');
  function generateFractionGame() { if (!fracPrompt) return; const operations = [{ text: "1/2 + 1/4 = ?", value: 3/4 }, { text: "1/2 + 1/3 = ?", value: 5/6 }, { text: "1/4 + 1/4 = ?", value: 1/2 }, { text: "3/4 - 1/4 = ?", value: 1/2 }, { text: "1/2 - 1/4 = ?", value: 1/4 }, { text: "1/2 * 1/2 = ?", value: 1/4 }, { text: "1/3 * 1/2 = ?", value: 1/6 }, { text: "1/2 ÷ 2 = ?", value: 1/4 }, { text: "1/4 ÷ 2 = ?", value: 1/8 }, { text: "2/3 + 1/3 = ?", value: 1 }, { text: "3/4 - 1/2 = ?", value: 1/4 }, { text: "1 - 1/2 = ?", value: 1/2 }]; const op = operations[Math.floor(Math.random() * operations.length)]; fracPrompt.textContent = op.text; fracCorrectValue = op.value; fracStatus.textContent = "Divide el círculo y pinta la respuesta correcta"; fracStatus.style.color = "var(--accent-2)"; fracDenomContainer.innerHTML = ''; fracSvg.innerHTML = ''; fracCurrentDenom = 0; fracShadedCount = 0; [2, 3, 4, 5, 6, 8].forEach(d => { const btn = document.createElement('button'); btn.className = 'frac-denom-btn interactive'; btn.textContent = `÷ ${d}`; btn.dataset.denom = d; btn.addEventListener('click', () => setFractionDenominator(d, btn)); fracDenomContainer.appendChild(btn); }); }
  function setFractionDenominator(denom, btn) { fracCurrentDenom = denom; fracShadedCount = 0; document.querySelectorAll('.frac-denom-btn').forEach(b => b.classList.remove('active')); if (btn) btn.classList.add('active'); let html = ''; const r = 40, cx = 50, cy = 50; for (let i = 0; i < denom; i++) { const startAngle = (i * 2 * Math.PI / denom) - Math.PI / 2; const endAngle = ((i + 1) * 2 * Math.PI / denom) - Math.PI / 2; const x1 = cx + r * Math.cos(startAngle); const y1 = cy + r * Math.sin(startAngle); const x2 = cx + r * Math.cos(endAngle); const y2 = cy + r * Math.sin(endAngle); const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0; html += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z" class="frac-slice interactive" data-index="${i}" />`; } fracSvg.innerHTML = html; fracSvg.querySelectorAll('.frac-slice').forEach(slice => slice.addEventListener('click', () => toggleFractionSlice(slice))); }
  function toggleFractionSlice(slice) { if (slice.classList.contains('shaded')) { slice.classList.remove('shaded'); fracShadedCount--; } else { slice.classList.add('shaded'); fracShadedCount++; playSound('pop'); } }
  if (checkFracBtn) checkFracBtn.addEventListener('click', () => { if (fracCurrentDenom === 0 || fracShadedCount === 0) { showToast("Divide y pinta el círculo primero."); return; } const userValue = fracShadedCount / fracCurrentDenom; if (Math.abs(userValue - fracCorrectValue) < 0.01) { petData.points += 15; petData.xp += 15; petData.happy = Math.min(100, petData.happy + 5); petData.health = Math.min(100, petData.health + 5); updateHUD(); savePetData(); checkPetEvolution(); showToast("¡Fracción correcta! +15 puntos y +15 XP."); showParticlesAtPet(); if (jumpAnimName) playAction(jumpAnimName, 2000); setTimeout(generateFractionGame, 1500); analytics.correct_answers++; syncAnalytics(); } else { showToast("¡Casi! Revisa tus porciones."); if (hitAnimName) playAction(hitAnimName, 1500); analytics.wrong_answers++; syncAnalytics(); } });
  if (resetFracBtn) resetFracBtn.addEventListener('click', generateFractionGame); generateFractionGame();

  // --- LÓGICA AR PURO ---
  const btnAR = document.getElementById('btnAR');
  const pureArOverlay = document.getElementById('pureArOverlay');
  const arVideoBg = document.getElementById('arVideoBg');
  const arModelViewer = document.getElementById('arModelViewer');
  const exitPureAR = document.getElementById('exitPureAR');
  let arBgStream = null;
  let arAnimations = [];
  let isArBusy = false;
  let arActionTimeout = null;

  if (arModelViewer) {
    arModelViewer.addEventListener('load', () => {
      arAnimations = arModelViewer.availableAnimations || [];
      const idle = arAnimations.find(a => a.toLowerCase().includes('idle')) || arAnimations[0];
      if (idle) arModelViewer.animationName = idle;
    });
  }

  function playArAnim(animKey) {
    if (!arModelViewer || arAnimations.length === 0 || isArBusy) return;
    
    let targetAnim = null;
    if (animKey === 'idle') targetAnim = arAnimations.find(a => a.toLowerCase().includes('idle')) || arAnimations[0];
    if (animKey === 'eat') targetAnim = arAnimations.find(a => a.toLowerCase().includes('eat'));
    if (animKey === 'play') targetAnim = arAnimations.find(a => a.toLowerCase().includes('run'));
    if (animKey === 'jump') targetAnim = arAnimations.find(a => a.toLowerCase().includes('jump'));
    if (animKey === 'sleep') targetAnim = arAnimations.find(a => a.toLowerCase().includes('sleep'));
    
    if (targetAnim) {
      isArBusy = true;
      arModelViewer.animationName = targetAnim;
      clearTimeout(arActionTimeout);
      arActionTimeout = setTimeout(() => { 
        isArBusy = false; 
        const idle = arAnimations.find(a => a.toLowerCase().includes('idle')) || arAnimations[0];
        if (idle) arModelViewer.animationName = idle; 
      }, animKey === 'sleep' ? 4000 : 3000);
    } else {
      showToast("El modelo 3D no tiene esta animación.");
    }
  }

  if (btnAR) {
    btnAR.addEventListener('click', async () => {
      try {
        arBgStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        arVideoBg.srcObject = arBgStream;
        arModelViewer.src = getEvolvedModelUrl();
        pureArOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      } catch (err) {
        console.error("Error AR:", err);
        showToast("No se pudo acceder a la cámara. Revisa los permisos.");
      }
    });
  }

  if (exitPureAR) {
    exitPureAR.addEventListener('click', () => {
      pureArOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
      if (arBgStream) {
        arBgStream.getTracks().forEach(track => track.stop());
        arBgStream = null;
      }
    });
  }

  document.querySelectorAll('.ar-btn[data-ar-anim]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      playArAnim(btn.dataset.arAnim);
    });
  });

  if (arModelViewer) {
    let touchStartX = 0, touchStartY = 0;
    arModelViewer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });
    
    arModelViewer.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
        const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
        if (dx < 10 && dy < 10) { 
          playArAnim('jump');
        }
      }
    }, { passive: true });

    let mouseStartX = 0, mouseStartY = 0;
    arModelViewer.addEventListener('mousedown', (e) => {
      mouseStartX = e.clientX;
      mouseStartY = e.clientY;
    });
    arModelViewer.addEventListener('mouseup', (e) => {
      const dx = Math.abs(e.clientX - mouseStartX);
      const dy = Math.abs(e.clientY - mouseStartY);
      if (dx < 5 && dy < 5) { 
        playArAnim('jump');
      }
    });
  }

} catch (globalError) { console.error("Error global inicializando la app:", globalError); }
