// --- CONFIGURAÇÕES INICIAIS ---
const FOTO_PADRAO = "imgpadrao.png";
let personagens = [];
let roundAtual = 1;

function salvarDados() {
  localStorage.setItem("personagens_rpg", JSON.stringify(personagens));
  localStorage.setItem("round_rpg", roundAtual);
}

function carregarDados() {
  const salvos = localStorage.getItem("personagens_rpg");
  const roundSalvo = localStorage.getItem("round_rpg");

  if (salvos) {
    personagens = JSON.parse(salvos);
  }
  
  if (roundSalvo) {
    roundAtual = parseInt(roundSalvo);
    document.getElementById("round").innerText = "Round: " + roundAtual;
  }
  atualizarLista();
}

// --- ADICIONAR PERSONAGEM ---
function adicionarPersonagem() {
  const nomeInput = document.getElementById("nome");
  const classeInput = document.getElementById("classe");
  const nivelInput = document.getElementById("nivel");
  const racaInput = document.getElementById("raca");
  const vidaInput = document.getElementById("vida");
  const fotoInput = document.getElementById("foto");
  const iniciativaInput = document.getElementById("iniciativa");

  if (!nomeInput.value) return;

  let novoPersonagem = {
    nome: nomeInput.value,
    classe: classeInput.value,
    nivel: Number(nivelInput.value) || 1,
    raca: racaInput.value,
    vida: Number(vidaInput.value) || 0,
    iniciativa: Number(iniciativaInput.value) || 0,
    foto: FOTO_PADRAO, 
    dano: 0,
    recebido: 0,
    cura: 0,
    kills: 0
  };

  const arquivo = fotoInput.files[0];

  if (arquivo) {
    const leitor = new FileReader();
    leitor.onload = function(e) {
      novoPersonagem.foto = e.target.result;
      personagens.push(novoPersonagem);
      finalizarAdicao(nomeInput, classeInput, nivelInput, racaInput, vidaInput, fotoInput, iniciativaInput);
    };
    leitor.readAsDataURL(arquivo);
  } else {
    personagens.push(novoPersonagem);
    finalizarAdicao(nomeInput, classeInput, nivelInput, racaInput, vidaInput, fotoInput, iniciativaInput);
  }
}

function finalizarAdicao(nome, classe, nivel, raca, vida, foto, iniciativa) {
  nome.value = ""; classe.value = ""; nivel.value = ""; raca.value = ""; vida.value = ""; foto.value = ""; iniciativa.value = "";
  atualizarLista();
  salvarDados();
}

// --- EDITAR INICIATIVA ---
function editarIniciativa(i) {
    const novoValor = prompt(`Nova iniciativa para ${personagens[i].nome}:`, personagens[i].iniciativa);
    if (novoValor !== null && !isNaN(novoValor)) {
        personagens[i].iniciativa = Number(novoValor);
        atualizarLista();
        salvarDados();
    }
}

// --- CONTROLE DE ORDEM ---
function organizarPorIniciativa() {
    personagens.sort((a, b) => b.iniciativa - a.iniciativa);
    atualizarLista();
    salvarDados();
}

function passarTurno() {
    if (personagens.length < 2) return;

    
    const maiorIniciativa = Math.max(...personagens.map(p => p.iniciativa));

    const jogadorQueJogou = personagens.shift();
    personagens.push(jogadorQueJogou);

    if (personagens[0].iniciativa === maiorIniciativa) {
        proximoRound();
    }
    
    atualizarLista();
    salvarDados();
}

function proximoRound() {
    roundAtual++;
    document.getElementById("round").innerText = "Round: " + roundAtual;
    salvarDados();
}

// --- FUNÇÕES DE ATRIBUTOS ---
function darDano(i) {
  let valor = Number(document.getElementById(`dano-${i}`).value);
  if (valor) { personagens[i].dano += valor; atualizarLista(); salvarDados(); }
}

function levarDano(i) {
  let valor = Number(document.getElementById(`recebido-${i}`).value);
  if (valor) { 
    personagens[i].recebido += valor; 
    personagens[i].vida -= valor; 
    atualizarLista(); salvarDados(); 
  }
}

function curar(i) {
  let valor = Number(document.getElementById(`cura-${i}`).value);
  if (valor) { personagens[i].cura += valor; atualizarLista(); salvarDados(); }
}

function kill(i) {
  let valor = Number(document.getElementById(`kill-${i}`).value);
  if (valor) { personagens[i].kills += valor; atualizarLista(); salvarDados(); }
}

function alterarVida(i, operacao) {
  let valor = Number(document.getElementById(`vida-${i}`).value);
  if (!valor) return;
  personagens[i].vida = operacao === 'somar' ? personagens[i].vida + valor : personagens[i].vida - valor;
  atualizarLista(); salvarDados();
}

function removerPersonagem(i) {
  if (confirm(`Remover ${personagens[i].nome}?`)) {
    personagens.splice(i, 1);
    salvarDados();
    atualizarLista();
  }
}

// --- RENDERIZAÇÃO DA LISTA ---
function atualizarLista() {
  let lista = document.getElementById("lista");
  lista.innerHTML = "";

  personagens.forEach((p, i) => {
    const classeTurno = (i === 0) ? "turno-ativo" : "";

    lista.innerHTML += `
  <div class="personagem ${classeTurno}">
    <div class="header-personagem">
      <div>
        <span class="badge-iniciativa" onclick="editarIniciativa(${i})">⚡ ${p.iniciativa}</span>
        <strong>${p.nome}</strong>
        <span class="subinfo">Lv ${p.nivel} • ${p.classe}</span>
      </div>
      <button class="btn-delete" onclick="removerPersonagem(${i})">🗑️</button>
    </div>

    <div class="stats-grid">
      <div class="stat-box">
        <span title="Dano Causado">⚔️ Dano Causado</span>
        <div class="valor">${p.dano}</div>
        <input id="dano-${i}" type="number">
        <button onclick="darDano(${i})">+</button>
      </div>

      <div class="stat-box">
        <span title="Dano Recebido">🛡️ Dano Recebido</span>
        <div class="valor">${p.recebido}</div>
        <input id="recebido-${i}" type="number">
        <button onclick="levarDano(${i})">+</button>
      </div>

      <div class="stat-box">
        <span title="Cura">💚 Cura</span>
        <div class="valor">${p.cura}</div>
        <input id="cura-${i}" type="number">
        <button onclick="curar(${i})">+</button>
      </div>

      <div class="stat-box">
        <span title="Kills">💀 Kills</span>
        <div class="valor">${p.kills}</div>
        <input id="kill-${i}" type="number">
        <button onclick="kill(${i})">+</button>
      </div>

      <div class="stat-box">
        <span title="Vida">❤️ HP</span>
        <div class="valor">${p.vida}</div>
        <input id="vida-${i}" type="number">
        <button onclick="alterarVida(${i}, 'somar')">+</button>
        <button onclick="alterarVida(${i}, 'subtrair')">-</button>
      </div>
    </div>
  </div>`;
  });
}

// --- SISTEMA DE RANKING E BADGES ---
function calcularScore(p) {
  return p.dano + (p.cura * 0.5) + (p.kills * 50) - (p.recebido * 0.2);
}

function gerarBadges(p, todos) {
  let badges = [];


  const maxCura = Math.max(...todos.map(x => x.cura));
  const maxDano = Math.max(...todos.map(x => x.dano));
  const maxKills = Math.max(...todos.map(x => x.kills));
  
  const danoTotalGrupo = todos.reduce((acc, char) => acc + char.recebido, 0);

  if (danoTotalGrupo > 0) {

    if (p.recebido >= (danoTotalGrupo * 0.5)) {
      badges.push({ emoji: "🥊", nome: "Saco de Pancadas" });
    } 
    
    else if (p.recebido > 50 || (p.recebido === Math.max(...todos.map(x => x.recebido)) && p.recebido > 0)) {
      badges.push({ emoji: "🛡️", nome: "Tank" });
    }
  }

  if (p.kills >= 3 && p.kills < 10) badges.push({ emoji: "💀", nome: "Matador" });
  if (p.kills >= 10) badges.push({ emoji: "🔥", nome: "Aniquilador" });
  if (p.cura === maxCura && p.cura > 0) badges.push({ emoji: "💚", nome: "Curandeiro" });
  if (p.dano === 0 && p.recebido === 0 && p.kills === 0 && p.cura > 0) badges.push({ emoji: "🧙", nome: "Suporte" });
  if (p.dano === maxDano && p.dano > 0) badges.push({ emoji: "⚔️", nome: "Combatente" });
  if (p.vida <= 5 && p.vida > 0) badges.push({ emoji: "🩸", nome: "No Limite" });
  if (p.vida <= 0) badges.push({ emoji: "🪦", nome: "Inconsciente" });
  if (p.dano > 10 && p.recebido < 10) badges.push({ emoji: "🥷", nome: "Intocável" });
  if (p.dano === 0 && p.kills === 0 && p.cura === 0) badges.push({ emoji: "🕊️", nome: "Pacifista" });
  if (p.iniciativa >= 20) badges.push({ emoji: "⚡", nome: "Veloz" });
  if (p.iniciativa > 0 && p.iniciativa <= 3) badges.push({ emoji: "🐢", nome: "Lento" });
  
  return badges;
}


function mostrarRanking() {
  let rankingDiv = document.getElementById("ranking");
  if (!rankingDiv) return;

  if (personagens.length === 0) {
    rankingDiv.innerHTML = "<h2>🏆 Ranking de Combate</h2><p style='text-align:center;'>Nenhum personagem na arena.</p>";
    return;
  }

  let ordenado = personagens.map(p => ({
    ...p,
    score: calcularScore(p)
  })).sort((a, b) => b.score - a.score);

  rankingDiv.innerHTML = "<h2>🏆 Ranking de Combate</h2>";

  ordenado.forEach((p, index) => {
    let pos = index + 1;
    let badges = gerarBadges(p, ordenado);

    rankingDiv.innerHTML += `
      <div class="ranking-card">
        <div class="rank rank-${pos}">#${pos}</div>

        <img src="${p.foto}" alt="${p.nome}" class="foto-ranking">

        <div class="info">
            <div class="nome">${p.nome}</div>
          <div class="subinfo">Lv ${p.nivel} • ${p.classe} • ${p.raca}</div>

          <div class="stats-ranking">
            <span>⚔️ Dano Causado: ${p.dano}</span>
            <span>🛡️ Dano Recebido: ${p.recebido}</span>
            <span>💚 Cura: ${p.cura}</span>
            <span>💀 Kills: ${p.kills}</span>
          </div>

          <div class="score">⭐ ${p.score.toFixed(1)}</div>
          
        </div>

        <div class="badges-right">
          ${badges.map(b => `
            <div class="badge-circle">
              <span>${b.emoji}</span>
              <small>${b.nome}</small>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  });
  
  rankingDiv.scrollIntoView({ behavior: 'smooth' });
}

function resetarTudo() {
  if (confirm("Apagar tudo?")) { localStorage.clear(); location.reload(); }
}

function resetarStats() {
    if (confirm("Deseja resetar as estatísticas de combate (Dano, Kills, etc) de todos os personagens?")) {
        
        personagens.forEach(p => {
            p.dano = 0;
            p.recebido = 0;
            p.cura = 0;
            p.kills = 0;
        });

        
        round = 1;
        turnoAtivo = 0;

        
        atualizarLista();
        if (typeof atualizarRanking === "function") atualizarRanking();
        
    }
}

carregarDados();
