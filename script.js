// Firebase config (substitua pelos seus dados reais)
const firebaseConfig = {
  apiKey: "AIzaSyAnK_vQJtLNaeMFmQC6M0vCiu_ZB1E1PX0",
  authDomain: "calendariohorizon-a66ce.firebaseapp.com",
  projectId: "calendariohorizon-a66ce",
  storageBucket: "calendariohorizon-a66ce.firebasestorage.app",
  messagingSenderId: "253407645877",
  appId: "1:253407645877:web:007168909639fadb326efc",
  measurementId: "G-3SNNHMEKG6"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const docRef = db.collection("calendario").doc("dados");

docRef.get().then((doc) => {
  if (doc.exists) {
    console.log("Dados do Firebase:", doc.data());
    dados = doc.data();
    gerarCalendario(); // <- carrega dados se existirem
  } else {
    console.log("Documento não encontrado.");
  }
});
  
let dados = {};

const feriadosDetalhados = {
  "2025-01-01": "Confraternização Universal",
  "2025-04-21": "Tiradentes",
  "2025-05-01": "Dia do Trabalhador",
  "2025-09-07": "Independência do Brasil",
  "2025-10-12": "Nossa Senhora Aparecida",
  "2025-11-02": "Finados",
  "2025-11-15": "Proclamação da República",
  "2025-12-25": "Natal"
};

let mesAtual = 3;
let anoAtual = 2025;

function salvar() {
  docRef.set(dados);
}

function gerarCalendario(mes = mesAtual, ano = anoAtual) {
  const calendario = document.getElementById('calendario');
  calendario.innerHTML = '';

  const data = new Date(ano, mes);
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  document.getElementById('mes-atual').innerText =
    `${data.toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() +
    data.toLocaleString('pt-BR', { month: 'long' }).slice(1)} / ${ano}`;

  for (let i = 0; i < primeiroDia.getDay(); i++) {
    calendario.innerHTML += '<div></div>';
  }

  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    const dataStr = `${ano}-${(mes + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    const info = dados[dataStr] || {};
    let classe = 'dia';
    const diaSemana = new Date(ano, mes, dia).getDay();
    if (diaSemana === 0) classe += ' domingo';
    if (feriadosDetalhados[dataStr]) classe += ' feriado';
    if (info.concluido) classe += ' concluido';

    let obsHTML = info.observacao
      ? `<div class="obs" id="obs-${dataStr}" style="display:block;">${info.observacao}</div>`
      : `<div class="obs" id="obs-${dataStr}" style="display:none;"></div>`;

    let iconesHTML = '';
    if (info.icones) {
      info.icones.forEach((item, i) => {
        iconesHTML += `<div class="icone">${item.emoji} <strong>${item.texto}</strong> <span class="remover" onclick="removerIcone('${dataStr}', ${i})">x</span></div>`;
      });
    }

    let feriadoDescricao = feriadosDetalhados[dataStr]
      ? `<div class="obs" style="display:block; color:#0b5ed7;"><strong>Feriado:</strong> ${feriadosDetalhados[dataStr]}</div>`
      : '';

    calendario.innerHTML += `
      <div class="${classe}" id="dia-${dataStr}">
        <div>${dia}</div>
        <div class="menu-dia" onclick="toggleMenu(event, '${dataStr}')">⋮</div>
        <div class="menu-opcoes" id="menu-${dataStr}">
          <button onclick="marcarConcluido('${dataStr}')">✔ Concluir</button>
          <button onclick="desmarcarConcluido('${dataStr}')">↩ Não Concluído</button>
          <button onclick="adicionarObservacao('${dataStr}')">📝 Adicionar Observação</button>
          <button onclick="removerObservacao('${dataStr}')">❌ Remover Observação</button>
          <button onclick="adicionarIcone('${dataStr}', '🎥')">🎥 Vídeo</button>
          <button onclick="adicionarIcone('${dataStr}', '🖼️')">🖼️ Imagem</button>
          <button onclick="adicionarIcone('${dataStr}', '📝')">📝 Texto</button>
        </div>
        <div id="icones-${dataStr}">${iconesHTML}</div>
        ${obsHTML}
        ${feriadoDescricao}
      </div>
    `;
  }
} // ← FECHA corretamente a função gerarCalendario()

// Evento para fechar menus ao clicar fora
document.body.addEventListener('click', function (event) {
  if (!event.target.closest('.menu-opcoes') && !event.target.classList.contains('menu-dia')) {
    document.querySelectorAll('.menu-opcoes').forEach(el => el.style.display = 'none');
  }
});

function toggleMenu(event, data) {
  event.stopPropagation();
  document.querySelectorAll('.menu-opcoes').forEach(el => el.style.display = 'none');
  const menu = document.getElementById('menu-' + data);
  menu.style.display = 'block';
}

function adicionarIcone(data, emoji) {
  const texto = prompt('Texto para o ícone:');
  if (!texto) return;

  if (!dados[data]) dados[data] = {};
  if (!dados[data].icones) dados[data].icones = [];

  dados[data].icones.push({ emoji, texto });
  salvar();
  gerarCalendario();
}

function removerIcone(data, index) {
  if (dados[data] && dados[data].icones) {
    dados[data].icones.splice(index, 1);
    salvar();
    gerarCalendario();
  }
}

function adicionarObservacao(data) {
  const texto = prompt('Digite sua observação:');
  if (texto) {
    dados[data] = dados[data] || {};
    dados[data].observacao = texto;
    salvar();
    gerarCalendario();
  }
}

function removerObservacao(data) {
  if (dados[data] && dados[data].observacao) {
    delete dados[data].observacao;
    salvar();
    gerarCalendario();
  }
}

function marcarConcluido(data) {
  dados[data] = dados[data] || {};
  dados[data].concluido = true;
  salvar();
  gerarCalendario();
}

function desmarcarConcluido(data) {
  if (dados[data]) {
    dados[data].concluido = false;
    salvar();
    gerarCalendario();
  }
}

function mudarMes(direcao) {
  mesAtual += direcao;
  if (mesAtual > 11) {
    mesAtual = 0;
    anoAtual++;
  } else if (mesAtual < 0) {
    mesAtual = 11;
    anoAtual--;
  }
  gerarCalendario();
}

function fecharMenus() {
  const menus = document.querySelectorAll('.menu-aberto');
  menus.forEach(menu => menu.classList.remove('menu-aberto'));
}

function autoGrow(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight) + 'px';
}

function createProjectBox(initialText = '') {
  const template = document.getElementById('project-template');
  const projectList = document.getElementById('project-list');
  const node = template.content.cloneNode(true);
  const textarea = node.querySelector('textarea');
  const addBtn = node.querySelector('.add-btn');
  const seeMore = node.querySelector('.see-more');
  const deleteBtn = node.querySelector('.delete-btn');
  const editBtn = node.querySelector('.edit-btn');
  const optionsMenu = node.querySelector('.options-menu');

  if (initialText) textarea.value = initialText;

  textarea.addEventListener('input', () => {
    autoGrow(textarea);
    if (textarea.scrollHeight > 60) {
      seeMore.style.display = 'inline';
    } else {
      seeMore.style.display = 'none';
    }
  });

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finalizeProject(textarea, addBtn, optionsMenu);
    }
  });

  addBtn.addEventListener('click', () => finalizeProject(textarea, addBtn, optionsMenu));
  seeMore.addEventListener('click', () => {
    textarea.style.maxHeight = textarea.style.maxHeight === '200px' ? 'none' : '200px';
  });

  editBtn.addEventListener('click', () => {
    textarea.removeAttribute('readonly');
    textarea.focus();
    addBtn.style.display = 'inline';
  });

  deleteBtn.addEventListener('click', () => {
    node.firstElementChild.remove();
  });

  addBtn.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
  });

  projectList.appendChild(node);
}

function finalizeProject(textarea, btn, menu) {
  if (!textarea.value.trim()) return;
  textarea.setAttribute('readonly', true);
  btn.style.display = 'none';
  menu.style.display = 'none';
  createProjectBox(); // Cria a próxima caixa vazia
}

// Inicializar o primeiro campo vazio
createProjectBox();
