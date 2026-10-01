const $ = id => document.getElementById(id);

const K = {
    users: "pep_users",
    user: "pep_current",
    records: "pep_records",
    acts: "pep_acts"
};

const get = (k, d = []) =>
    JSON.parse(localStorage.getItem(k) || JSON.stringify(d));

const put = (k, v) =>
    localStorage.setItem(k, JSON.stringify(v));

const toast = mensagem => {
    const x = $("toast");
    x.textContent = mensagem;
    x.classList.add("show");

    setTimeout(() => {
        x.classList.remove("show");
    }, 2300);
};

const user = () =>
    get(K.users).find(u => u.email === localStorage.getItem(K.user));

const agora = () => {
    let d = new Date();

    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());

    return d.toISOString().slice(0, 16);
};

const formatarData = valor => {
    if (!valor) return "—";

    return new Date(valor).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    });
};

const iniciais = nome =>
    (nome || "PE")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(x => x[0])
        .join("")
        .toUpperCase();


function screen(tipo) {
    $("loginScreen").classList.toggle("hidden", tipo !== "login");
    $("registerScreen").classList.toggle("hidden", tipo !== "register");
    $("app").classList.toggle("hidden", tipo !== "app");
}


function openPage(pagina) {
    document.querySelectorAll(".page").forEach(x => {
        x.classList.remove("active");
    });

    const paginaAtual = $(pagina + "Page");

    if (paginaAtual) {
        paginaAtual.classList.add("active");
    }

    document.querySelectorAll(".nav").forEach(x => {
        x.classList.toggle("active", x.dataset.page === pagina);
    });

    if (pagina === "home") {
        dashboard();
    }

    if (pagina === "history") {
        history();
    }

    if (pagina === "create" && !$("editId").value) {
        resetForm();
    }

    if (pagina === "assessment") {
        assessmentStart();
    }

    scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function go(pagina) {
    openPage(pagina);
}


function setupUser() {
    const u = user();

    if (!u) return;

    $("sideName").textContent = u.name;
    $("avatar").textContent = iniciais(u.name);
    $("topName").textContent = u.name.split(" ")[0];
    $("homeName").textContent = u.name.split(" ")[0];
}


function logout() {
    localStorage.removeItem(K.user);
    screen("login");
}


function addAct(texto) {
    let atividades = get(K.acts);

    atividades.unshift({
        text: texto,
        date: new Date().toISOString()
    });

    put(K.acts, atividades.slice(0, 12));
}


function gerarId() {
    return "PEP-" + String(Date.now()).slice(-8);
}


const fieldIds = [
    "nome",
    "cpf",
    "nascimento",
    "sexo",
    "telefone",
    "endereco",
    "responsavel",

    "numero",
    "atendimento",
    "unidade",
    "leito",
    "profissional",

    "queixa",
    "historia",
    "antecedentes",
    "alergias",
    "medUso",

    "vitalHora",
    "pa",
    "fc",
    "fr",
    "temp",
    "spo2",
    "dor",

    "estado",
    "consciencia",
    "respiracao",
    "pele",
    "alimentacao",
    "eliminacao",
    "mobilidade",
    "acesso",
    "outrosAval",

    "medicamento",
    "dose",
    "via",
    "horario",
    "administrado",
    "obsMed",

    "outrosProc",

    "evolucaoHora",
    "cuidados",
    "resposta",

    "tipoExame",
    "dataExame",
    "resultado",
    "obsExame",

    "altaHora",
    "condicao",
    "orientacoes",
    "destino",

    "resumo"
];


function resetForm() {
    $("recordForm").reset();

    $("editId").value = "";
    $("formMode").textContent = "NOVO REGISTRO";
    $("formTitle").textContent = "Criar prontuário";

    $("numero").value = gerarId();
    $("atendimento").value = agora();
    $("vitalHora").value = agora();
    $("evolucaoHora").value = agora();

    const u = user();

    $("profissional").value = u
        ? u.name + (u.professionalId ? " — " + u.professionalId : "")
        : "";

    document.querySelectorAll(".checks input").forEach(x => {
        x.checked = false;
    });
}


function collect() {
    const registro = {
        id: $("editId").value || crypto.randomUUID()
    };

    fieldIds.forEach(campo => {
        const elemento = $(campo);

        if (elemento) {
            registro[campo] = elemento.value || "";
        }
    });

    registro.procedimentos = [
        ...document.querySelectorAll(".checks input:checked")
    ].map(x => x.value);

    return registro;
}


function summary(r) {
    const partes = [];

    const adicionar = (nome, valor) => {
        if (valor) {
            partes.push(nome + ": " + valor + ".");
        }
    };

    adicionar("Paciente", r.nome);
    adicionar("CPF", r.cpf);
    adicionar("Data de nascimento", r.nascimento);
    adicionar("Sexo", r.sexo);
    adicionar("Telefone", r.telefone);
    adicionar("Responsável", r.responsavel);

    adicionar("Prontuário", r.numero);

    if (r.atendimento) {
        adicionar("Atendimento", formatarData(r.atendimento));
    }

    adicionar("Unidade/setor", r.unidade);
    adicionar("Leito", r.leito);
    adicionar("Profissional responsável", r.profissional);

    adicionar("Queixa principal", r.queixa);
    adicionar("História da doença atual", r.historia);
    adicionar("Antecedentes pessoais", r.antecedentes);
    adicionar("Alergias", r.alergias);
    adicionar("Medicamentos em uso", r.medUso);

    const sinais = [
        ["PA", r.pa],
        ["FC", r.fc],
        ["FR", r.fr],
        ["Temperatura", r.temp],
        ["SpO₂", r.spo2],
        ["Dor", r.dor]
    ]
        .filter(x => x[1])
        .map(x => x[0] + " " + x[1]);

    if (sinais.length) {
        partes.push(
            "Sinais vitais: " + sinais.join(", ") + "."
        );
    }

    const avaliacao = [
        ["Estado geral", r.estado],
        ["Nível de consciência", r.consciencia],
        ["Respiração", r.respiracao],
        ["Pele", r.pele],
        ["Alimentação", r.alimentacao],
        ["Eliminação", r.eliminacao],
        ["Mobilidade", r.mobilidade],
        ["Acesso venoso", r.acesso],
        ["Outros", r.outrosAval]
    ]
        .filter(x => x[1])
        .map(x => x[0] + ": " + x[1]);

    if (avaliacao.length) {
        partes.push(
            "Avaliação de enfermagem: " +
            avaliacao.join("; ") +
            "."
        );
    }

    const medicamento = [
        r.medicamento,
        r.dose,
        r.via,
        r.horario
    ].filter(Boolean);

    if (medicamento.length) {
        partes.push(
            "Prescrição/medicação: " +
            medicamento.join(", ") +
            "."
        );
    }

    adicionar("Administrado por", r.administrado);
    adicionar("Observações da medicação", r.obsMed);

    if (r.procedimentos.length || r.outrosProc) {
        partes.push(
            "Procedimentos realizados: " +
            [...r.procedimentos, r.outrosProc]
                .filter(Boolean)
                .join(", ") +
            "."
        );
    }

    adicionar("Cuidados realizados", r.cuidados);

    adicionar(
        "Resposta do paciente/intercorrências",
        r.resposta
    );

    adicionar("Tipo de exame", r.tipoExame);
    adicionar("Resultado", r.resultado);
    adicionar("Observações do exame", r.obsExame);

    adicionar("Condição do paciente", r.condicao);
    adicionar("Orientações", r.orientacoes);
    adicionar("Destino", r.destino);

    return partes.join(" ");
}


$("makeSummary").addEventListener("click", () => {
    $("resumo").value = summary(collect());
});


$("loginForm").addEventListener("submit", e => {
    e.preventDefault();

    const email = $("loginEmail")
        .value
        .trim()
        .toLowerCase();

    const senha = $("loginPassword").value;

    const u = get(K.users).find(
        x => x.email === email && x.password === senha
    );

    if (!u) {
        return toast("E-mail ou senha incorretos.");
    }

    localStorage.setItem(K.user, u.email);

    screen("app");
    setupUser();
    openPage("home");
});


$("registerForm").addEventListener("submit", e => {
    e.preventDefault();

    const u = {
        name: $("regName").value.trim(),
        email: $("regEmail").value.trim().toLowerCase(),
        password: $("regPass").value,
        professionalId: $("regId").value.trim()
    };

    let users = get(K.users);

    if (users.some(x => x.email === u.email)) {
        return toast("Este e-mail já está cadastrado.");
    }

    users.push(u);

    put(K.users, users);

    $("registerForm").reset();

    toast("Conta criada. Faça login.");

    screen("login");
});


$("showRegister").onclick = () => screen("register");

$("showLogin").onclick = () => screen("login");

$("logout").onclick = logout;


function dashboard() {
    let registros = get(K.records);
    let atividades = get(K.acts);

    let nomes = new Set(
        registros.map(
            x => (x.cpf || x.nome).toLowerCase()
        )
    );

    $("statPatients").textContent = nomes.size;

    $("statRecords").textContent = registros.length;

    $("statLast").textContent =
        atividades[0]
            ? formatarData(atividades[0].date).split(",")[0]
            : "—";

    $("activities").innerHTML =
        atividades.length
            ? atividades
                .slice(0, 5)
                .map(
                    x => `
                    <div class="activity">
                        <b>${esc(x.text)}</b>
                        <small>${esc(formatarData(x.date))}</small>
                    </div>
                    `
                )
                .join("")
            : `<div class="empty">Nenhuma atividade.</div>`;
}


function esc(valor) {
    return String(valor ?? "").replace(
        /[&<>"']/g,
        c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[c])
    );
}


$("recordForm").addEventListener("submit", e => {
    e.preventDefault();

    let registro = collect();

    if (!registro.nome) {
        return toast("Informe o nome completo.");
    }

    if (!registro.resumo) {
        registro.resumo = summary(registro);
    }

    let registros = get(K.records);

    let indice = registros.findIndex(
        x => x.id === registro.id
    );

    let data = new Date().toISOString();

    if (indice >= 0) {

        registro.createdAt = registros[indice].createdAt;
        registro.updatedAt = data;

        registros[indice] = registro;

        addAct(
            "Prontuário de " +
            registro.nome +
            " atualizado."
        );

        toast("Prontuário atualizado.");

    } else {

        registro.createdAt = data;
        registro.updatedAt = data;

        registros.unshift(registro);

        addAct(
            "Novo prontuário criado para " +
            registro.nome +
            "."
        );

        toast("Prontuário salvo.");
    }

    put(K.records, registros);

    resetForm();

    setTimeout(() => {
        openPage("history");
    }, 350);
});


function history() {

    let busca = $("search")
        .value
        .toLowerCase();

    let registros = get(K.records).filter(r =>
        (
            r.nome +
            " " +
            r.cpf +
            " " +
            r.numero
        )
            .toLowerCase()
            .includes(busca)
    );

    $("historyList").innerHTML =
        registros.length
            ? registros
                .map(
                    r => `
                    <article class="history-card">

                        <div class="history-head">

                            <div class="patient">

                                <div class="patient-avatar">
                                    ${esc(iniciais(r.nome))}
                                </div>

                                <div>
                                    <h3>${esc(r.nome)}</h3>

                                    <p>
                                        ${esc(r.numero)}
                                        •
                                        ${esc(r.sexo || "Sexo não informado")}
                                        •
                                        ${esc(formatarData(r.updatedAt))}
                                    </p>
                                </div>

                            </div>

                            <div class="history-buttons">

                                <button
                                    class="btn white"
                                    onclick="viewRecord('${r.id}')"
                                >
                                    Ver
                                </button>

                                <button
                                    class="btn blue"
                                    onclick="editRecord('${r.id}')"
                                >
                                    Editar
                                </button>

                            </div>

                        </div>

                        <div class="summary-preview">

                            <b>Resumo do prontuário</b>

                            ${esc(
                                r.resumo ||
                                "Resumo não informado."
                            )}

                        </div>

                    </article>
                    `
                )
                .join("")
            : `
                <div class="panel empty">
                    Nenhum prontuário encontrado.
                </div>
            `;
}


$("search").addEventListener("input", history);


function editRecord(id) {

    let registro = get(K.records).find(
        x => x.id === id
    );

    if (!registro) return;

    $("editId").value = registro.id;

    $("formMode").textContent = "EDIÇÃO";

    $("formTitle").textContent =
        "Editar prontuário";

    fieldIds.forEach(campo => {

        if ($(campo)) {
            $(campo).value =
                registro[campo] || "";
        }

    });

    document
        .querySelectorAll(".checks input")
        .forEach(x => {
            x.checked =
                (registro.procedimentos || [])
                    .includes(x.value);
        });

    openPage("create");
}


function viewRecord(id) {

    let r = get(K.records).find(
        x => x.id === id
    );

    if (!r) return;

    const row = (nome, valor) => {

        if (!valor) return "";

        return `
            <label>

                <b>${esc(nome)}</b>

                <div
                    style="
                        background:#f8fafc;
                        border:1px solid #e4e7ec;
                        border-radius:8px;
                        padding:11px
                    "
                >
                    ${esc(valor)}
                </div>

            </label>
        `;
    };

    let procedimentos = [
        ...(r.procedimentos || [])
    ];

    if (r.outrosProc) {
        procedimentos.push(r.outrosProc);
    }

    $("historyList").innerHTML = `

        <article class="history-card">

            <div class="history-head">

                <div>

                    <small>
                        PRONTUÁRIO ${esc(r.numero)}
                    </small>

                    <h2
                        style="
                            color:#16345c;
                            margin-top:7px
                        "
                    >
                        ${esc(r.nome)}
                    </h2>

                    <p>
                        Atualizado
                        ${esc(formatarData(r.updatedAt))}
                    </p>

                </div>

                <div class="history-buttons">

                    <button
                        class="btn white"
                        onclick="history()"
                    >
                        Voltar
                    </button>

                    <button
                        class="btn blue"
                        onclick="editRecord('${r.id}')"
                    >
                        Editar
                    </button>

                </div>

            </div>

            <div class="summary-preview">

                <b>Resumo</b>

                ${esc(r.resumo)}

            </div>

            <div
                class="grid"
                style="margin-top:18px"
            >

                ${row("CPF", r.cpf)}

                ${row(
                    "Data de nascimento",
                    r.nascimento
                )}

                ${row("Telefone", r.telefone)}

                ${row("Endereço", r.endereco)}

                ${row(
                    "Responsável",
                    r.responsavel
                )}

                ${row(
                    "Unidade/setor",
                    r.unidade
                )}

                ${row("Leito", r.leito)}

                ${row(
                    "Profissional",
                    r.profissional
                )}

                ${row(
                    "Queixa principal",
                    r.queixa
                )}

                ${row(
                    "História da doença atual",
                    r.historia
                )}

                ${row(
                    "Alergias",
                    r.alergias
                )}

                ${row(
                    "Medicamentos em uso",
                    r.medUso
                )}

                ${row(
                    "Procedimentos",
                    procedimentos.join(", ")
                )}

                ${row(
                    "Cuidados realizados",
                    r.cuidados
                )}

                ${row(
                    "Resposta/intercorrências",
                    r.resposta
                )}

                ${row(
                    "Resultado do exame",
                    r.resultado
                )}

                ${row(
                    "Orientações",
                    r.orientacoes
                )}

                ${row(
                    "Destino",
                    r.destino
                )}

            </div>

        </article>
    `;
}


/* =========================
   AVALIAÇÃO DE SAÚDE MENTAL
   ========================= */

const questions = [

    [
        "Como você tem se sentido nos últimos dias?",
        [
            "Muito bem",
            "Bem",
            "Regular",
            "Mal",
            "Muito mal"
        ]
    ],

    [
        "Com que frequência você tem se sentido sobrecarregado(a)?",
        [
            "Nunca",
            "Raramente",
            "Às vezes",
            "Frequentemente",
            "Sempre"
        ]
    ],

    [
        "Você tem conseguido descansar e dormir bem?",
        [
            "Sempre",
            "Na maioria das vezes",
            "Às vezes",
            "Raramente",
            "Nunca"
        ]
    ],

    [
        "Você tem sentido vontade de conversar com alguém sobre como está?",
        [
            "Não",
            "Um pouco",
            "Sim, gostaria",
            "Sim, preciso de apoio",
            "Prefiro não responder"
        ]
    ],

    [
        "Você sente que precisa buscar apoio neste momento?",
        [
            "Não",
            "Talvez",
            "Sim",
            "Não sei",
            "Prefiro não responder"
        ]
    ]

];


let questionIndex = 0;

let answers = [];


function assessmentStart() {

    questionIndex = 0;

    answers = [];

    $("result").classList.add("hidden");

    $("next").classList.remove("hidden");

    renderQuestion();
}


function renderQuestion() {

    let question = questions[questionIndex];

    $("qnum").textContent =
        `${questionIndex + 1} de ${questions.length}`;

    $("bar").style.width =
        ((questionIndex + 1) /
            questions.length * 100) + "%";

    $("question").textContent =
        question[0];

    $("answers").innerHTML =
        question[1]
            .map(
                (resposta, indice) => `
                    <button
                        class="answer ${
                            answers[questionIndex] === indice
                                ? "selected"
                                : ""
                        }"
                        data-i="${indice}"
                    >
                        ○ ${esc(resposta)}
                    </button>
                `
            )
            .join("");

    document
        .querySelectorAll(".answer")
        .forEach(botao => {

            botao.onclick = () => {

                answers[questionIndex] =
                    Number(botao.dataset.i);

                renderQuestion();
            };

        });

    $("prev").disabled =
        questionIndex === 0;

    $("next").textContent =
        questionIndex === questions.length - 1
            ? "Concluir"
            : "Próxima";
}


$("next").onclick = () => {

    if (answers[questionIndex] === undefined) {
        return toast("Selecione uma resposta.");
    }

    if (questionIndex < questions.length - 1) {

        questionIndex++;

        renderQuestion();

        return;
    }


    /* =========================
       ANÁLISE DAS RESPOSTAS
       ========================= */

    const q1 = answers[0];
    const q2 = answers[1];
    const q3 = answers[2];
    const q4 = answers[3];
    const q5 = answers[4];


    let dificuldade = 0;

    let precisaApoio = false;

    let querConversar = false;

    let estaBem = false;


    /* Questão 1
       0 = Muito bem
       1 = Bem
       2 = Regular
       3 = Mal
       4 = Muito mal
    */

    if (q1 === 3 || q1 === 4) {
        dificuldade++;
    }

    if (q1 === 0 || q1 === 1) {
        estaBem = true;
    }


    /* Questão 2
       3 = Frequentemente
       4 = Sempre
    */

    if (q2 === 3 || q2 === 4) {
        dificuldade++;
    }


    /* Questão 3
       3 = Raramente
       4 = Nunca
    */

    if (q3 === 3 || q3 === 4) {
        dificuldade++;
    }


    /* Questão 4
       2 = Sim, gostaria
       3 = Sim, preciso de apoio
    */

    if (q4 === 2) {
        querConversar = true;
    }

    if (q4 === 3) {
        precisaApoio = true;
    }


    /* Questão 5
       2 = Sim
    */

    if (q5 === 2) {
        precisaApoio = true;
    }


    let mensagem = "";


    if (precisaApoio) {

        mensagem = `
            <strong>Você não precisa passar por isso sozinho(a).</strong>
            <br><br>
            Suas respostas indicam que talvez seja importante conversar
            com alguém de confiança ou procurar apoio de um profissional
            de saúde.
        `;

    } else if (dificuldade >= 2) {

        mensagem = `
            <strong>Seus sentimentos são importantes.</strong>
            <br><br>
            Algumas das suas respostas indicam que você pode estar
            enfrentando algumas dificuldades nos últimos dias.
            Procure reservar um tempo para cuidar de você e, se sentir
            necessidade, converse com alguém de confiança.
        `;

    } else if (querConversar) {

        mensagem = `
            <strong>Falar sobre o que sentimos pode ajudar.</strong>
            <br><br>
            Se você sentir vontade, procure alguém de confiança para
            conversar sobre o que está acontecendo.
        `;

    } else if (estaBem) {

        mensagem = `
            <strong>Continue cuidando de você!</strong>
            <br><br>
            Manter momentos de descanso, conversar com pessoas próximas
            e cuidar da saúde emocional também são formas importantes
            de prevenção.
        `;

    } else {

        mensagem = `
            <strong>Obrigado por responder à avaliação.</strong>
            <br><br>
            Continue observando como você tem se sentido e procure apoio
            caso perceba que precisa.
        `;
    }


    $("result").innerHTML = `
        ${mensagem}

        <br><br>

        <small>
            Esta avaliação é apenas uma reflexão inicial e não substitui
            uma avaliação ou diagnóstico realizado por um profissional
            de saúde.
        </small>
    `;

    $("result").classList.remove("hidden");

    $("next").classList.add("hidden");

    addAct(
        "Avaliação rápida de saúde mental concluída."
    );
};


$("prev").onclick = () => {

    if (questionIndex > 0) {

        questionIndex--;

        renderQuestion();
    }
};


document.addEventListener("click", e => {

    let nav = e.target.closest("[data-page]");
    let go = e.target.closest("[data-go]");

    if (nav) {
        openPage(nav.dataset.page);
    }

    if (go) {
        openPage(go.dataset.go);
    }
});


if (
    localStorage.getItem(K.user) &&
    user()
) {

    screen("app");

    setupUser();

    openPage("home");

} else {

    screen("login");
}