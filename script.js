// --- START OF FILE script.js ---

document.addEventListener('DOMContentLoaded', () => {
    // =============================================
    // == 1. DECLARAÇÃO DE ELEMENTOS E VARIÁVEIS ==
    // =============================================
    const modeSelectionDiv = document.getElementById('mode-selection');
    const gameAreaDiv = document.getElementById('game-area');
    const btnPaulista = document.getElementById('btn-paulista');
    const btnMineiro = document.getElementById('btn-mineiro');
    const currentModeDisplaySpan = document.getElementById('current-mode-display');
    const switchModeButton = document.getElementById('btn-switch-mode');
    const playerScoreSpan = document.getElementById('player-score');
    const aiScoreSpan = document.getElementById('opponent-score');
    const gameStatusSpan = document.getElementById('game-status');
    const playerHandDiv = document.getElementById('player-hand');
    const opponentHandDiv = document.getElementById('opponent-hand');
    const viraCardContainer = document.getElementById('vira-card');
    const playedCardsPlayerDiv = document.getElementById('played-cards-player');
    const playedCardsOpponentDiv = document.getElementById('played-cards-opponent');
    const actionButtonsDiv = document.getElementById('action-buttons');
    const btnTruco = document.getElementById('btn-truco');
    const btnRaise = document.getElementById('btn-raise');
    const btnAcceptTruco = document.getElementById('btn-accept-truco');
    const btnRunTruco = document.getElementById('btn-run-truco');
    const btnRaiseResponse = document.getElementById('btn-raise-response');
    const btnNewHand = document.getElementById('btn-new-hand');
    const btnRules = document.getElementById('btn-rules');
    const roundResultDisplay = document.getElementById('round-result-display');
    const specialMessageArea = document.getElementById('special-message-area');
    const btnAcceptMaoDe11 = document.getElementById('btn-accept-maode11');
    const btnRunMaoDe11 = document.getElementById('btn-run-maode11');
    const currentYearSpan = document.getElementById('current-year');

    let gameMode = null, playerScore = 0, aiScore = 0, playerHand = [], aiHand = [], deck = [], vira = null, manilhas = [], currentRound = 1, roundHistory = [], cardsOnTable = { player: null, ai: null }, isPlayerTurn = true, handStarter = 'player', roundStarter = 'player', isTrucoActive = false, trucoCaller = null, trucoLevel = 1, isMaoDeOnze = false, maoDeOnzeChoiceMade = false;

    const SUITS = { '♦': { color: 'var(--accent-red)' }, '♠': { color: 'var(--card-text)' }, '♥': { color: 'var(--accent-red)' }, '♣': { color: 'var(--card-text)' } };
    const RANKS_ORDER_PAULISTA = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
    const RANKS_ORDER_MINEIRO = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
    const MANILHAS_FIXAS_MINEIRO = ['4♣', '7♥', 'A♠', '7♦'];
    const POINTS_TO_WIN = 12; const MAO_DE_ONZE_THRESHOLD = 11;

    // =============================================
    // == 2. DEFINIÇÃO DE TODAS AS FUNÇÕES ==
    // =============================================

    // --- Funções Auxiliares / UI ---
    function updateStatus(message, type = 'info') { if(gameStatusSpan){gameStatusSpan.textContent=message; gameStatusSpan.className=`status-${type}`;} console.log(`[STATUS|${type.toUpperCase()}]: ${message}`); }
    function updateScoreboard() { if(playerScoreSpan)playerScoreSpan.textContent=playerScore; if(aiScoreSpan)aiScoreSpan.textContent=aiScore; if(currentModeDisplaySpan&&gameMode)currentModeDisplaySpan.textContent=gameMode; }
    function hideRoundResult() { if(roundResultDisplay){roundResultDisplay.textContent='';roundResultDisplay.className='';} }
    function showRoundResult(winner) { if(!roundResultDisplay)return; let msg = winner==='player'?"Você ganhou!":winner==='ai'?"IA ganhou.":"Empatou!"; roundResultDisplay.textContent=msg; roundResultDisplay.className=`visible ${winner}`; }
    function showSpecialMessage(message) { if(specialMessageArea){specialMessageArea.textContent=message; specialMessageArea.classList.add('visible'); specialMessageArea.style.display='block';} }
    function hideSpecialMessage() { if(specialMessageArea){specialMessageArea.textContent=''; specialMessageArea.classList.remove('visible'); specialMessageArea.style.display='none';} }
    function enablePlayerCards() { if(!playerHandDiv)return; playerHandDiv.classList.remove('disabled-hand'); playerHandDiv.querySelectorAll('.card-container[data-card-id], .card').forEach(c => c.classList.remove('disabled')); }
    function disablePlayerCards() { if(!playerHandDiv)return; playerHandDiv.classList.add('disabled-hand'); playerHandDiv.querySelectorAll('.card-container[data-card-id], .card').forEach(c => c.classList.add('disabled')); }

    // --- Funções de Controle de Botões ---
    function resetActionButtons() {
        if (!actionButtonsDiv) return; const isFerro=playerScore===11&&aiScore===11;
        actionButtonsDiv.querySelectorAll('.control-button').forEach(btn => { if(!['btn-switch-mode','btn-rules'].includes(btn.id)){btn.style.display='none';btn.disabled=true;} else {btn.disabled=false;} });
        if (!isTrucoActive && !isFerro && !(isMaoDeOnze && !maoDeOnzeChoiceMade)) { if(trucoLevel<3&&btnTruco)btnTruco.style.display='inline-block'; else if(trucoLevel>=3&&trucoLevel<12&&btnRaise){ const nextL=trucoLevel===3?6:trucoLevel===6?9:12; btnRaise.textContent=`Pedir ${nextL}!`; btnRaise.style.display='inline-block'; } }
    }
    function enablePlayerActions(enable) {
        if(!actionButtonsDiv)return; const isFerro=playerScore===11&&aiScore===11;
        actionButtonsDiv.querySelectorAll('.control-button').forEach(b=>{ if(!enable)b.disabled=true; else{ if(b.id==='btn-truco')b.disabled=!isPlayerTurn||isTrucoActive||(isMaoDeOnze&&!maoDeOnzeChoiceMade)||isFerro||trucoLevel>=12; else if(b.id==='btn-raise')b.disabled=!isPlayerTurn||isTrucoActive||(isMaoDeOnze&&!maoDeOnzeChoiceMade)||isFerro||trucoLevel>=12||trucoLevel<3; else if(['btn-accept-truco','btn-run-truco','btn-raise-response','btn-accept-maode11','btn-run-maode11'].includes(b.id))b.disabled=false; else if(['btn-new-hand','btn-switch-mode','btn-rules'].includes(b.id))b.disabled=false; else b.disabled=true; } });
    }
    function showTrucoResponseButtons(forPlayer) {
        if(!actionButtonsDiv)return; resetActionButtons();
        if(btnAcceptTruco){btnAcceptTruco.style.display='inline-block';btnAcceptTruco.disabled=!forPlayer;} if(btnRunTruco){btnRunTruco.style.display='inline-block';btnRunTruco.disabled=!forPlayer;}
        const curAsk=trucoLevel===1?3:trucoLevel===3?6:trucoLevel===6?9:12; const nxtCanAsk=curAsk<12?(curAsk===3?6:curAsk===6?9:12):null;
        if(forPlayer&&nxtCanAsk&&btnRaiseResponse){btnRaiseResponse.textContent=`Pedir ${nxtCanAsk}!`;btnRaiseResponse.style.display='inline-block';btnRaiseResponse.disabled=false;}
    }
    function showEndOfHandControls(isGameOver = false) {
        if(!actionButtonsDiv)return; actionButtonsDiv.querySelectorAll('.control-button').forEach(btn=>{if(!['btn-switch-mode','btn-rules','btn-new-hand'].includes(btn.id))btn.style.display='none';});
        if(btnNewHand){btnNewHand.textContent=isGameOver?"Jogar Novamente":"Nova Mão";btnNewHand.style.display='inline-block';btnNewHand.disabled=false;}
        if(switchModeButton){switchModeButton.style.display='inline-block';switchModeButton.disabled=false;} else console.error("Var switchModeButton não achada!"); // Usa nome correto
        if(btnRules){btnRules.style.display='inline-block';btnRules.disabled=false;}
        disablePlayerCards();
    }

    // --- Funções de Renderização ---
    function createCardHTML(card,isHidden=false,isSmall=false,isPlayed=false){if(!card||!card.suit||!card.rank)return`<div class="card-container ${isSmall?'small':''}"><div class="card empty"></div></div>`;const sColor=SUITS[card.suit]?.color||'var(--card-text)';const isFerro=playerScore===11&&aiScore===11;const hide=isHidden||(isFerro&&!isPlayed&&!isSmall);const classes=`card ${hide?'hidden':''} ${isSmall?'small':''} ${card.isManilha?'manilha':''} ${isPlayed?'played':''}`;const sSym=card.suit;const rank=card.rank;const idAttr=hide?'':`data-card-id="${card.id}"`;return`<div class="card-container ${isSmall?'small':''}" ${idAttr}><div class="${classes}" style="color:${sColor};" data-suit="${sSym}">${!hide?`<span class="suit suit-top-left">${sSym}</span><span class="rank">${rank}</span><span class="suit suit-bottom-right">${sSym}</span>`:''}</div></div>`;}
    function handleCardClick(event) { const c=event.currentTarget; const id=c.dataset.cardId; if(id)handlePlayerCardClick(id); else console.warn("Click s/ ID."); } // handlePlayerCardClick definida depois
    function addPlayerCardListeners() { const cards=playerHandDiv.querySelectorAll('.card-container[data-card-id]'); cards.forEach(c=>{c.removeEventListener('click',handleCardClick);c.addEventListener('click',handleCardClick);}); }
    function renderHands(){if(!playerHandDiv||!opponentHandDiv)return;playerHandDiv.innerHTML='';opponentHandDiv.innerHTML='';const isFerro=playerScore===11&&aiScore===11;playerHand.forEach(c=>playerHandDiv.innerHTML+=createCardHTML(c,isFerro,false,false));addPlayerCardListeners();let showAi=false;const p11=playerScore===11&&aiScore<11;if(isMaoDeOnze&&p11&&maoDeOnzeChoiceMade)showAi=true;aiHand.forEach(c=>opponentHandDiv.innerHTML+=createCardHTML(c,isFerro||!showAi,false,false));if(isPlayerTurn&&!isTrucoActive&&!(isMaoDeOnze&&!maoDeOnzeChoiceMade))enablePlayerCards();else disablePlayerCards();}
    function renderVira(){if(viraCardContainer)viraCardContainer.innerHTML=vira?createCardHTML(vira,false,true,false):'';}
    function renderPlayedCards(){if(playedCardsPlayerDiv)playedCardsPlayerDiv.innerHTML=cardsOnTable.player?createCardHTML(cardsOnTable.player,false,false,true):createCardHTML(null);if(playedCardsOpponentDiv)playedCardsOpponentDiv.innerHTML=cardsOnTable.ai?createCardHTML(cardsOnTable.ai,false,false,true):createCardHTML(null);hideRoundResult();}
    function renderGame() { console.log("Render..."); updateScoreboard(); renderHands(); renderVira(); renderPlayedCards(); }

    // --- Funções de Lógica Jogo (Setup Mão) ---
    function createDeck(){deck=[];const r=['4','5','6','7','Q','J','K','A','2','3'];for(const s of Object.keys(SUITS))for(const k of r)deck.push({id:k+s,suit:s,rank:k,value:0,isManilha:false});console.log(`Deck ${gameMode}:${deck.length}`);}
    function shuffleDeck(){for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}console.log("Shuffled.");}
    function setVira(){if(deck.length>0){vira=deck.pop();console.log(`Vira:${vira.id}`);}else{console.error("Deck Vazio!");vira=null;}}
    function determineManilhas(){manilhas=[];if(!vira&&gameMode!=='Mineiro'){console.error("Sem vira(P)!");return;}if(gameMode==='Paulista'){const r=RANKS_ORDER_PAULISTA;const i=r.indexOf(vira.rank);manilhas=[r[(i+1)%r.length]];console.log(`Manilha(P):${manilhas[0]}`);}else{manilhas=MANILHAS_FIXAS_MINEIRO;console.log(`Manilhas(M):${manilhas.join(',')}`);}}
    function dealCards(){playerHand=[];aiHand=[];if(deck.length<6){updateStatus("Erro Deck!","error");return false;}for(let i=0;i<3;i++){const p=deck.pop();const a=deck.pop();if(!p||!a){updateStatus("Erro Deal!","error");return false;}playerHand.push(p);aiHand.push(a);}console.log("Dealt.");return true;}
    function updateCardValues(){[...playerHand,...aiHand].forEach(c=>{if(c)c.isManilha=false;});const rO=gameMode==='Paulista'?RANKS_ORDER_PAULISTA:RANKS_ORDER_MINEIRO;const m=10;const o=rO.length*m; const calc=(c)=>{if(!c)return;let v=0,mn=false;if(gameMode==='Paulista'){if(c.rank===manilhas[0]){mn=true;v=o+{'♦':4,'♠':3,'♥':2,'♣':1}[c.suit];}else{v=rO.indexOf(c.rank)*m;}}else{const i=manilhas.indexOf(c.id);if(i!==-1){mn=true;v=o+(manilhas.length-i);}else{v=rO.indexOf(c.rank)*m;}} c.value=v;c.isManilha=mn;}; playerHand.forEach(calc);aiHand.forEach(calc); playerHand.sort((a,b)=>(b?.value??0)-(a?.value??0));aiHand.sort((a,b)=>(b?.value??0)-(a?.value??0));console.log("Values OK.");}

    // --- Funções Lógica Jogo (Truco Handlers) ---
    function aiRespondToTruco() { if(!isTrucoActive||trucoCaller!=='player')return; const asked=trucoLevel===1?3:trucoLevel===3?6:trucoLevel===6?9:12; console.log(`IA eval ${asked}`); aiHand.sort((a,b)=>(b?.value??0)-(a?.value??0)); const hasM=aiHand.some(c=>c?.isManilha);const highs=aiHand.filter(c=>c&&c.value>=70).length; let d='run'; if(hasM||highs>=2||(highs>=1&&aiHand.length<3)||(aiScore<=playerScore-3&&asked<=6)){d='accept';} if(d==='accept'){trucoLevel=asked;isTrucoActive=false;trucoCaller=null;console.log(`IA ACEITA ${trucoLevel}`);updateStatus(`IA aceitou ${trucoLevel}! Sua vez.`,"info");isPlayerTurn=true;enablePlayerActions(true);enablePlayerCards();resetActionButtons();} else{const pts=trucoLevel;console.log(`IA CORRE ${asked}! P+${pts}`);updateStatus(`IA correu! Você+${pts}p.`,"success");isTrucoActive=false;trucoCaller=null;awardHandPoints('player');}}
    function handleTrucoCall(){const f=playerScore===11&&aiScore===11;if(!isPlayerTurn||isTrucoActive||trucoLevel>=12||f||(isMaoDeOnze&&!maoDeOnzeChoiceMade)){updateStatus("N pode trucar.","warning");return;} trucoCaller='player';isTrucoActive=true; updateStatus(`Você pediu TRUCO! IA...`,"info");enablePlayerActions(false);disablePlayerCards();setTimeout(aiRespondToTruco,1800);}
    function handleRaiseTruco(){const f=playerScore===11&&aiScore===11;if(!isPlayerTurn||isTrucoActive||trucoLevel>=12||trucoLevel<3||f){updateStatus("N pode Aumentar.","warning");return;} trucoCaller='player';isTrucoActive=true;const l=trucoLevel===3?6:trucoLevel===6?9:12; updateStatus(`Você pediu ${l}! IA...`,"info");enablePlayerActions(false);disablePlayerCards();if(btnRaise)btnRaise.style.display='none'; setTimeout(aiRespondToTruco,1800);}
    function handleRaiseTrucoResponse(){const ask=trucoLevel===1?3:trucoLevel===3?6:trucoLevel===6?9:12;const nxt=ask<12?(ask===3?6:ask===6?9:12):null;if(trucoCaller!=='ai'||!isTrucoActive||!nxt){updateStatus("Aumento Inválido.","warning");return;} trucoCaller='player';isTrucoActive=true; updateStatus(`Você pediu ${nxt}! IA...`,"info");enablePlayerActions(false);disablePlayerCards();resetActionButtons(); setTimeout(aiRespondToTruco,1800);}
    function handleAcceptTruco(){if(!isTrucoActive||trucoCaller!=='ai')return;const lvl=trucoLevel===1?3:trucoLevel===3?6:trucoLevel===6?9:12;trucoLevel=lvl;isTrucoActive=false;trucoCaller=null; updateStatus(`Aceitou ${lvl}! Vez IA.`,"info");resetActionButtons();isPlayerTurn=false;enablePlayerActions(false);disablePlayerCards();setTimeout(aiTurn,1000);} // Chama aiTurn
    function handleRunTruco(){if(!isTrucoActive||trucoCaller!=='ai')return;const pts=trucoLevel;const ask=trucoLevel===1?3:trucoLevel===3?6:trucoLevel===6?9:12; updateStatus(`Correu ${ask}! IA+${pts}p.`,"warning");isTrucoActive=false;trucoCaller=null;awardHandPoints('ai');} // Chama awardHandPoints
    function handleAiTrucoCall(){console.log("IA TRUCO");trucoCaller='ai';isTrucoActive=true; updateStatus(`IA pediu TRUCO! Responda!`,"warning");showTrucoResponseButtons(true);enablePlayerActions(true);disablePlayerCards();}

    // --- Funções Lógica Jogo (Mão 11/Ferro) ---
    function handleMaoDeOnzeStart(isP11){hideSpecialMessage();resetActionButtons();if(isP11){showSpecialMessage("MÃO 11(VOCÊ)! Escolha:");if(btnAcceptMaoDe11){btnAcceptMaoDe11.style.display='inline-block';btnAcceptMaoDe11.disabled=false;}if(btnRunMaoDe11){btnRunMaoDe11.style.display='inline-block';btnRunMaoDe11.disabled=false;}}else{showSpecialMessage("MÃO 11(IA)! Decidindo...");setTimeout(()=>{let tmpH=[];let tmpD=[];const r=['4','5','6','7','Q','J','K','A','2','3'];for(const s of Object.keys(SUITS))for(const k of r)tmpD.push(k+s);for(let i=tmpD.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[tmpD[i],tmpD[j]]=[tmpD[j],tmpD[i]];} tmpH=tmpD.slice(0,3);let str=0;tmpH.forEach(id=>{if(!id)return; const rk=id.charAt(0);const fix=gameMode==='Mineiro'&&MANILHAS_FIXAS_MINEIRO.includes(id);if(['A','2','3'].includes(rk))str+=3;else if(['K','J','Q'].includes(rk))str+=2;else if(rk==='7'||rk==='4')str+=1;if(fix)str+=5;}); if(str>=7){console.log("IA ACEITA M11");maoDeOnzeChoiceMade=true;hideSpecialMessage();updateStatus("IA aceitou! 3pts...","info");startNewHandFlow();} else{console.log("IA CORRE M11");updateStatus("IA correu! Você+1p.","success");trucoLevel=1;awardHandPoints('player');}},2500);}} // Chama startNewHandFlow, awardHandPoints
    function checkMaoDeOnze(){const p11=playerScore===11&&aiScore<11;const a11=aiScore===11&&playerScore<11;const f=playerScore===11&&aiScore===11;isMaoDeOnze=(p11||a11)&&!f;maoDeOnzeChoiceMade=false; if(f){console.log("FERRO!");showSpecialMessage("FERRO! 3pts, escuro, sem truco.");trucoLevel=3;isMaoDeOnze=false;} else if(isMaoDeOnze){console.log("ONZE!");trucoLevel=3;handleMaoDeOnzeStart(p11);} else{hideSpecialMessage();}} // Chama handleMaoDeOnzeStart
    function handleAcceptMaoDe11(){console.log("P ACEITA M11");maoDeOnzeChoiceMade=true;hideSpecialMessage();resetActionButtons();updateStatus("Aceitou! 3pts...","info");trucoLevel=3;startNewHandFlow();} // Chama startNewHandFlow
    function handleRunMaoDe11(){console.log("P CORRE M11");updateStatus("Correu! IA+1p.","warning");trucoLevel=1;awardHandPoints('ai');} // Chama awardHandPoints

     // --- FUNÇÕES LÓGICA JOGO (Fim de Jogo e Mão) ---
     function endGame(winner) { const name=winner==='player'?'Jogador':'IA'; console.log(`FIM! Win:${name}`); updateStatus(`FIM JOGO! ${name} venceu! ${playerScore}x${aiScore}`, winner==='player'?'success':'error'); enablePlayerActions(false); disablePlayerCards(); showEndOfHandControls(true); } // Chama showEndOfHandControls
     function awardHandPoints(winner){if(!['player','ai'].includes(winner)){updateStatus("Erro Pontuar!","error");showEndOfHandControls(false);return;} const pts=trucoLevel; if(winner==='player'){playerScore+=pts;updateStatus(`Você +${pts}p!`,"success");} else {aiScore+=pts;updateStatus(`IA +${pts}p!`,"error");} console.log(`Mão Fim.${winner}+${pts}.P:${playerScore}x${aiScore}`); updateScoreboard(); if(playerScore>=POINTS_TO_WIN||aiScore>=POINTS_TO_WIN)endGame(playerScore>=aiScore?'player':'ai'); else showEndOfHandControls(false);} // Chama endGame, showEndOfHandControls, updateScoreboard
     function determineHandEndByCardCount(){console.warn("Fallback Cnt.");const pW=roundHistory.filter(r=>r.winner==='player').length;const aW=roundHistory.filter(r=>r.winner==='ai').length;if(pW>aW)awardHandPoints('player'); else if(aW>pW)awardHandPoints('ai'); else{const r1=roundHistory.find(r=>r.round===1); if(r1&&r1.winner!=='empate')awardHandPoints(r1.winner);else{updateStatus("Mão Empatada Geral!","warning");setTimeout(startNewHandFlow,2000);}} if(playerScore<POINTS_TO_WIN&&aiScore<POINTS_TO_WIN)showEndOfHandControls(false);} // Chama awardHandPoints, startNewHandFlow, showEndOfHandControls

    // --- FUNÇÕES DE LÓGICA JOGO (Turno e Rodada) ---
     function determineRoundWinner() { // <<<< AQUI CHAMA showRoundResult
         if (!cardsOnTable.player || !cardsOnTable.ai) { console.error("Faltam cartas!"); if(playerHand.length===0 && aiHand.length===0) determineHandEndByCardCount(); else startNewRound(); return; }
         const p=cardsOnTable.player; const a=cardsOnTable.ai; let w='empate'; if(p.value > a.value) w='player'; else if(a.value > p.value) w='ai'; else if(p.isManilha && a.isManilha) w = roundStarter==='player' ? 'ai':'player';
         console.log(`R${currentRound} Res: W:${w}`); roundHistory.push({round:currentRound, winner:w, starter:roundStarter}); showRoundResult(w); // <<< CHAMADA PROBLEMÁTICA ANTERIORMENTE
         const pWins = roundHistory.filter(r => r.winner === 'player').length; const aWins = roundHistory.filter(r => r.winner === 'ai').length; let finished = false;
         if(pWins>=2){awardHandPoints('player');finished=true;}else if(aWins>=2){awardHandPoints('ai');finished=true;}else if(currentRound>=2){const r1=roundHistory.find(r=>r.round===1);if(w==='empate'&&r1&&r1.winner!=='empate'){awardHandPoints(r1.winner);finished=true;}else if(currentRound===3&&w!=='empate'){awardHandPoints(w);finished=true;}else if(currentRound===3&&w==='empate'){updateStatus("Empate Geral!","warning");setTimeout(startNewHandFlow,2500);finished=true;}}
         if(!finished && currentRound<3) setTimeout(startNewRound,1800); else if(!finished && currentRound>=3) determineHandEndByCardCount();
     } // Chama awardHandPoints, startNewHandFlow, startNewRound, determineHandEndByCardCount

     function startNewRound() { // <<< AQUI CHAMA aiTurn
         currentRound++; console.log(`--- R${currentRound} ---`); cardsOnTable={player:null,ai:null}; setTimeout(()=>{renderPlayedCards();hideRoundResult();},800); const last=roundHistory.length>0?roundHistory[roundHistory.length-1]:null; roundStarter=last?(last.winner==='empate'?last.starter:last.winner):handStarter; isPlayerTurn=roundStarter==='player'; setTimeout(()=>{updateStatus(`R${currentRound}:${isPlayerTurn?'Sua vez!':'Vez IA.'}`,"info");enablePlayerActions(true);if(!isPlayerTurn){disablePlayerCards();setTimeout(aiTurn,1500);}else{enablePlayerCards();}},1200);
     }

     function handlePlayerCardClick(cardId) { // <<< AQUI CHAMA aiTurn, determineRoundWinner
        const isFerro=playerScore===11&&aiScore===11; if(!isPlayerTurn||isTrucoActive||(isMaoDeOnze&&!maoDeOnzeChoiceMade)){updateStatus("Inválido.","warning");return;} const idx=playerHand.findIndex(c=>c?.id===cardId); if(idx===-1||!playerHand[idx]){updateStatus("Erro Carta.","error");return;} cardsOnTable.player=playerHand.splice(idx,1)[0]; console.log(`P:${cardsOnTable.player.id}`); if(!cardsOnTable.ai)roundStarter='player'; renderHands();renderPlayedCards();disablePlayerCards();enablePlayerActions(false);isPlayerTurn=false;
        if(cardsOnTable.ai){updateStatus("Analisando...","info");setTimeout(determineRoundWinner,1000);} else{updateStatus("Vez IA.","info");setTimeout(aiTurn,isFerro?500:1200);}
    }

     function aiTurn() { // <<< AQUI CHAMA determineRoundWinner, determineHandEndByCardCount, handleAiTrucoCall
        if(isPlayerTurn||!aiHand||aiHand.length===0){console.warn("aiTurn Inválido.");return;} const isFerro=playerScore===11&&aiScore===11;
        const canTruco=!isTrucoActive&&trucoLevel<12&&!isFerro&&!(isMaoDeOnze&&!maoDeOnzeChoiceMade); if(canTruco&&currentRound===1&&aiHand.length===3){ aiHand.sort((a,b)=>(b?.value??0)-(a?.value??0)); const hasM=aiHand.some(c=>c?.isManilha);const twoG=(aiHand[0]?.value??0)>=70&&(aiHand[1]?.value??0)>=70; if((hasM||twoG)&&Math.random()>0.4){handleAiTrucoCall();return;} }
        console.log("--- IA Turn ---"); let card=null;const pCard=cardsOnTable.player; if(!pCard)roundStarter='ai'; aiHand.sort((a,b)=>(b?.value??0)-(a?.value??0)); const s=aiHand[0]; const w=aiHand[aiHand.length-1]; if(pCard){let win=aiHand.filter(c=>c&&c.value>pCard.value);let tie=aiHand.filter(c=>c&&c.value===pCard.value); if(win.length>0){win.sort((a,b)=>(a?.value??0)-(b?.value??0));card=win[0];}else if(tie.length>0&&roundStarter==='ai'){tie.sort((a,b)=>(b?.value??0)-(a?.value??0));card=tie[0];}else{card=w;}} else{const aiWonR1=roundHistory.some(r=>r.round===1&&r.winner==='ai'); if(currentRound===3||aiWonR1){card=s;}else{card=w;}}
        if(card){const i=aiHand.findIndex(c=>c?.id===card.id);if(i!==-1){cardsOnTable.ai=aiHand.splice(i,1)[0];console.log(`IA:${cardsOnTable.ai.id}`);}else{console.error("IA ERR J");if(aiHand.length>0)cardsOnTable.ai=aiHand.splice(0,1)[0];else{determineHandEndByCardCount();return;}}} else{console.error("IA ERR S");if(aiHand.length>0)cardsOnTable.ai=aiHand.splice(0,1)[0];else{determineHandEndByCardCount();return;}}
        renderHands();renderPlayedCards();
        if(cardsOnTable.player){updateStatus("Analisando...","info");setTimeout(determineRoundWinner,1000);} else{isPlayerTurn=true;updateStatus("Sua vez!","info");enablePlayerActions(true);enablePlayerCards();} console.log("--- Fim IA ---");
     }

     function startFirstRound() { // <<< AQUI CHAMA aiTurn
         handStarter = handStarter === 'player' ? 'ai' : 'player'; isPlayerTurn = handStarter === 'player'; roundStarter = handStarter;
         updateStatus(`R${currentRound}:${isPlayerTurn ? 'Sua vez!' : 'Vez IA.'}`, "info"); resetActionButtons(); enablePlayerActions(true);
         if (!isPlayerTurn) { disablePlayerCards(); setTimeout(aiTurn, 1500); } else { enablePlayerCards(); }
         console.log(`R1 Iniciada por ${handStarter}.`);
     }

    // --- Funções de FLUXO Principal (chamam outras) ---
     function resetHandState(){trucoLevel=1;isTrucoActive=false;trucoCaller=null;currentRound=1;roundHistory=[];cardsOnTable={player:null,ai:null};playerHand=[];aiHand=[];deck=[];vira=null;manilhas=[];isMaoDeOnze=false;maoDeOnzeChoiceMade=false;hideRoundResult();hideSpecialMessage();resetActionButtons();enablePlayerActions(false);if(playerHandDiv)playerHandDiv.innerHTML='';if(opponentHandDiv)opponentHandDiv.innerHTML='';if(viraCardContainer)viraCardContainer.innerHTML='';if(playedCardsPlayerDiv)playedCardsPlayerDiv.innerHTML='';if(playedCardsOpponentDiv)playedCardsOpponentDiv.innerHTML='';console.log("Hand Reset.");}
     function startNewHandFlow() { // <<< AQUI CHAMA resetHandState, checkMaoDeOnze, create/shuffle/deal, updateValues, renderGame, startFirstRound
         console.log(`--- NOVA MÃO (P${playerScore}xA${aiScore}) ---`); resetHandState(); checkMaoDeOnze(); if(isMaoDeOnze&&!maoDeOnzeChoiceMade){console.log("Wait M11");return;}
         createDeck();shuffleDeck();setVira(); if(!vira&&gameMode==='Paulista'){updateStatus("Erro Vira!","error");return;} determineManilhas();if(!dealCards())return; updateCardValues();renderGame(); startFirstRound(); // Chama startFirstRound no fim
     }
     function resetGame(){playerScore=0;aiScore=0;isMaoDeOnze=false;maoDeOnzeChoiceMade=false;handStarter='player';updateScoreboard();hideSpecialMessage();console.log("Game Reset.");} // Chama updateScoreboard, hideSpecialMessage
     function returnToModeSelection(){if(gameAreaDiv)gameAreaDiv.style.display='none';if(modeSelectionDiv)modeSelectionDiv.style.display='block';if(switchModeButton)switchModeButton.style.display='none';if(btnRules)btnRules.style.display='none';gameMode=null;updateStatus("Escolha:","info");if(playerHandDiv)playerHandDiv.innerHTML='';if(opponentHandDiv)opponentHandDiv.innerHTML='';if(viraCardContainer)viraCardContainer.innerHTML='';if(playedCardsPlayerDiv)playedCardsPlayerDiv.innerHTML='';if(playedCardsOpponentDiv)playedCardsOpponentDiv.innerHTML='';resetActionButtons();console.log("Back Sel.");} // Chama updateStatus, resetActionButtons
     function initializeGame(selectedMode) { console.log(`Init:${selectedMode}`);gameMode=selectedMode;if(!currentModeDisplaySpan||!modeSelectionDiv||!gameAreaDiv||!switchModeButton||!btnRules){updateStatus("Erro UI.","error");return;}currentModeDisplaySpan.textContent=gameMode;modeSelectionDiv.style.display='none';gameAreaDiv.style.display='block';switchModeButton.style.display='inline-block';btnRules.style.display='inline-block'; resetGame(); startNewHandFlow(); } // Chama resetGame, startNewHandFlow

    // ==================================================
    // == 3. SETUP LISTENERS (Após Funções Definidas) ==
    // ==================================================
    function setupInitialListeners() {
        if (currentYearSpan) currentYearSpan.textContent=new Date().getFullYear(); else console.warn("No year");
        try{if(btnPaulista)btnPaulista.addEventListener('click',()=>initializeGame('Paulista'));else console.error("No P Btn");}catch(e){console.error("ErrLP:",e);}
        try{if(btnMineiro)btnMineiro.addEventListener('click',()=>initializeGame('Mineiro'));else console.error("No M Btn");}catch(e){console.error("ErrLM:",e);}
        try{if(switchModeButton)switchModeButton.addEventListener('click', returnToModeSelection);else console.error("No Sw Btn");}catch(e){console.error("ErrLSw:",e);}
        try{if(btnRules)btnRules.addEventListener('click',()=>window.open('regras.html','_blank'));else console.error("No Rul Btn");}catch(e){console.error("ErrLRul:",e);}
        try{if(btnNewHand)btnNewHand.addEventListener('click', startNewHandFlow);else console.error("No NH Btn");}catch(e){console.error("ErrLNH:",e);}
        try{if(btnTruco)btnTruco.addEventListener('click', handleTrucoCall);}catch(e){console.error("ErrLTruco:",e);}
        try{if(btnAcceptTruco)btnAcceptTruco.addEventListener('click', handleAcceptTruco);}catch(e){console.error("ErrLAccT:",e);}
        try{if(btnRunTruco)btnRunTruco.addEventListener('click', handleRunTruco);}catch(e){console.error("ErrLRunT:",e);}
        try{if(btnRaise)btnRaise.addEventListener('click', handleRaiseTruco);}catch(e){console.error("ErrLRaise:",e);}
        try{if(btnRaiseResponse)btnRaiseResponse.addEventListener('click', handleRaiseTrucoResponse);}catch(e){console.error("ErrLRaiseR:",e);}
        try{if(btnAcceptMaoDe11)btnAcceptMaoDe11.addEventListener('click', handleAcceptMaoDe11);}catch(e){console.error("ErrLAcc11:",e);}
        try{if(btnRunMaoDe11)btnRunMaoDe11.addEventListener('click', handleRunMaoDe11);}catch(e){console.error("ErrLRun11:",e);}
        console.log("Listeners OK.");
    }

    // =============================================
    // == 4. CHAMADA INICIAL (Última Coisa) ==
    // =============================================
    console.log("DOM OK. Config Jogo...");
    setupInitialListeners();

}); // Fim do DOMContentLoaded
// --- END OF FILE script.js ---