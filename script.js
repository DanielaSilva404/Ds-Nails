const $ = id => document.getElementById(id);
const real = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const SERVICOS = [
  { id: "manicure",    nome: "Manicure",          min: 40,  preco: 35,  desc: "Cuidado completo para as mãos, com esmaltação tradicional." },
  { id: "pedicure",    nome: "Pedicure",          min: 45,  preco: 40,  desc: "Pés bem cuidados, com conforto e acabamento delicado." },
  { id: "mao-e-pe",    nome: "Mão e pé",          min: 80,  preco: 65,  desc: "Uma pausa completa para renovar mãos e pés." },
  { id: "gel",         nome: "Esmaltação em gel", min: 60,  preco: 85,  desc: "Cor intensa e brilho duradouro para a sua rotina." },
  { id: "alongamento", nome: "Alongamento",       min: 120, preco: 160, desc: "Formato e comprimento para expressar seu estilo." }
];

if ($("lista-servicos")) {
  $("lista-servicos").innerHTML = SERVICOS.map(s => `
    <li class="col">
      <a class="card-servico" href="agendar.html?servico=${s.id}">
        <small class="text-muted">${s.min} min</small>
        <h3 class="h5 mt-2">${s.nome}</h3>
        <p class="small text-muted">${s.desc}</p>
        <span class="preco">${real(s.preco)}</span>
      </a>
    </li>`).join("");
}

if ($("etapa1")) {
  const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const DIAS = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
  const FUNC = { 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [9, 17] };

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const mes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  let srv = null, data = null, hora = null;

  const fmt = m => String(Math.floor(m / 60)).padStart(2, "0") + "h" + String(m % 60).padStart(2, "0");

  $("servicos").innerHTML = SERVICOS.map(s => `
    <label class="opcao"><input type="radio" name="srv" value="${s.id}" class="visually-hidden">
      <span>${s.nome}<br><small class="text-muted">${s.min} min</small></span>
      <span class="text-nowrap text-rosa">${real(s.preco)}</span></label>`).join("");

  $("servicos").onchange = e => {
    srv = SERVICOS.find(s => s.id === e.target.value);
    hora = null;
    desenharHoras();
    atualizarBarra();
  };

  function desenharCalendario() {
    const a = mes.getFullYear(), m = mes.getMonth();
    $("mesTitulo").textContent = `${MESES[m]} ${a}`;
    $("anterior").disabled = mes <= new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    let h = "<span></span>".repeat(new Date(a, m, 1).getDay());
    for (let d = 1; d <= new Date(a, m + 1, 0).getDate(); d++) {
      const dt = new Date(a, m, d);
      const ok = dt >= hoje && FUNC[dt.getDay()];
      const sel = data && +data === +dt;
      h += `<button type="button" class="dia${sel ? " sel" : ""}" data-d="${d}" ${ok ? "" : "disabled"}
             aria-pressed="${!!sel}" aria-label="${DIAS[dt.getDay()]}, ${d} de ${MESES[m]}">${d}</button>`;
    }
    $("dias").innerHTML = h;
  }

  $("anterior").onclick = () => { mes.setMonth(mes.getMonth() - 1); desenharCalendario(); };
  $("proximo").onclick = () => { mes.setMonth(mes.getMonth() + 1); desenharCalendario(); };

  $("dias").onclick = e => {
    const b = e.target.closest(".dia");
    if (!b) return;
    data = new Date(mes.getFullYear(), mes.getMonth(), +b.dataset.d);
    hora = null;
    desenharCalendario();
    desenharHoras();
    atualizarBarra();
    document.querySelector(`.dia[data-d="${b.dataset.d}"]`).focus();
  };

  function desenharHoras() {
    if (!data) {
      $("diaTitulo").textContent = "Selecione um dia";
      $("horas").innerHTML = "";
      return;
    }
    $("diaTitulo").textContent = `${DIAS[data.getDay()]}, ${data.getDate()} de ${MESES[data.getMonth()].toLowerCase()}`;
    if (!srv) {
      $("horas").innerHTML = '<p class="small text-muted">Escolha um serviço primeiro.</p>';
      return;
    }
    const [abre, fecha] = FUNC[data.getDay()];
    let h = "";
    for (let m = abre * 60; m + srv.min <= fecha * 60; m += 30) {
      if (m < 780 && m + srv.min > 720) continue;
      if ((data.getDate() + m / 30) % 3 === 0) continue;
      h += `<button type="button" class="hora${hora === m ? " sel" : ""}" data-m="${m}" aria-pressed="${hora === m}">${fmt(m)}</button>`;
    }
    $("horas").innerHTML = h || '<p class="small text-muted">Sem horários neste dia.</p>';
  }

  $("horas").onclick = e => {
    const b = e.target.closest(".hora");
    if (!b) return;
    hora = +b.dataset.m;
    desenharHoras();
    atualizarBarra();
    document.querySelector(`.hora[data-m="${hora}"]`).focus();
  };

  function atualizarBarra() {
    const completo = srv && data && hora !== null;
    $("continuar").disabled = !completo;
    $("barraTitulo").textContent = srv ? `${srv.nome} · ${real(srv.preco)}` : "Selecione um serviço";
    $("barraSub").textContent = completo
      ? `${data.getDate()} de ${MESES[data.getMonth()].toLowerCase()} de ${data.getFullYear()} · ${fmt(hora)} · ${srv.min} min`
      : "Escolha também o dia e o horário";
  }

  function irPara(n) {
    [1, 2, 3].forEach(i => $("etapa" + i).hidden = i !== n);
    document.querySelectorAll(".ind").forEach((el, i) => {
      el.classList.toggle("ativa", i + 1 === n);
      el.classList.toggle("feita", i + 1 < n);
      el.toggleAttribute("aria-current", i + 1 === n);
    });
    $("titulo" + n).focus();
    window.scrollTo({ top: 0 });
  }

  function preencherResumo() {
    const set = (c, t) => document.querySelectorAll("." + c).forEach(e => e.textContent = t);
    set("res-nome", srv.nome);
    set("res-data", `${DIAS[data.getDay()]}, ${data.getDate()} de ${MESES[data.getMonth()].toLowerCase()} de ${data.getFullYear()}`);
    set("res-hora", `${fmt(hora)} · duração de ${srv.min} min`);
    set("res-preco", real(srv.preco));
  }

  $("continuar").onclick = () => { preencherResumo(); irPara(2); };
  $("voltar").onclick = () => irPara(1);

  $("tel").oninput = e => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 11)
      .replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4,5})(\d{4})$/, "$1-$2");
  };

  $("form").onsubmit = e => {
    e.preventDefault();
    const nomeOk = $("nome").value.trim().split(/\s+/).length >= 2;
    const telOk = $("tel").value.replace(/\D/g, "").length >= 10;
    $("nome").classList.toggle("is-invalid", !nomeOk);
    $("tel").classList.toggle("is-invalid", !telOk);
    if (!nomeOk) return $("nome").focus();
    if (!telOk) return $("tel").focus();
    $("cliente").textContent = `${$("nome").value.trim()} · ${$("tel").value}`;
    irPara(3);
  };

  $("novo").onclick = () => location.href = "agendar.html";

  const pre = new URLSearchParams(location.search).get("servico");
  const achado = SERVICOS.find(s => s.id === pre);
  if (achado) {
    srv = achado;
    document.querySelector(`input[value="${pre}"]`).checked = true;
  }

  desenharCalendario();
  atualizarBarra();
}