document.addEventListener('DOMContentLoaded', function () {
    var todosClientes = [];
    var grafico = null;
    var ordenarPor = 'nome';
    var ordemCrescente = true;
    var filtro = '';

    // carrega os clientes da api
    fetch('api/clientes.php?action=report')
        .then(function (res) {
            if (!res.ok) {
                throw new Error('erro na api');
            }
            return res.json();
        })
        .then(function (clientes) {
            todosClientes = clientes;
            montarRelatorio();
        })
        .catch(function () {
            document.getElementById('relatorio').innerHTML = '<p class="erro">Não foi possível carregar o relatório.</p>';
        });

    function montarRelatorio() {
        var porCidade = {};
        var html = '';

        // conta quantos clientes tem em cada cidade
        todosClientes.forEach(function (c) {
            if (!porCidade[c.cidade]) {
                porCidade[c.cidade] = 0;
            }
            porCidade[c.cidade]++;
        });

        // pega a cidade com mais clientes
        var cidadeTop = '';
        var qtdTop = 0;
        for (var cidade in porCidade) {
            if (porCidade[cidade] > qtdTop) {
                qtdTop = porCidade[cidade];
                cidadeTop = cidade;
            }
        }

        var qtdCidades = Object.keys(porCidade).length;
        var media = qtdCidades > 0 ? (todosClientes.length / qtdCidades).toFixed(1) : 0;

        // cards de resumo
        html += '<div class="cards">';
        html += '<div class="card"><small>Total de clientes</small><strong>' + todosClientes.length + '</strong></div>';
        html += '<div class="card"><small>Cidades atendidas</small><strong>' + qtdCidades + '</strong></div>';
        html += '<div class="card"><small>Cidade com mais clientes</small><strong class="texto">' + cidadeTop + '</strong><span>' + qtdTop + ' clientes</span></div>';
        html += '<div class="card"><small>Média por cidade</small><strong>' + media + '</strong></div>';
        html += '</div>';

        // grafico
        html += '<div class="box">';
        html += '<h2>Clientes por cidade</h2>';
        html += '<div class="grafico"><canvas id="grafico-cidades"></canvas></div>';
        html += '</div>';

        // tabela
        html += '<div class="box" id="area-tabela">';
        html += '<h2>Clientes</h2>';
        html += '<div class="filtro-area">';
        html += '<input type="text" id="filtro" class="filtro" placeholder="Buscar por nome, email ou cidade...">';
        html += '<button type="button" id="limpar-filtro" class="btn-limpar" style="display:none">Limpar</button>';
        html += '</div>';
        html += '<p id="contador-filtro" class="contador"></p>';
        html += '<div class="table-wrap">' + montarTabela(filtrarClientes()) + '</div>';
        html += '</div>';

        document.getElementById('relatorio').innerHTML = html;

        desenharGrafico(porCidade);
        atualizarTabela();
        ligarFiltro();
    }

    function filtrarClientes() {
        return todosClientes.filter(function (c) {
            if (!filtro) {
                return true;
            }
            return c.nome.toLowerCase().indexOf(filtro) !== -1
                || c.email.toLowerCase().indexOf(filtro) !== -1
                || c.cidade.toLowerCase().indexOf(filtro) !== -1;
        });
    }

    function atualizarTabela() {
        var lista = filtrarClientes();

        document.querySelector('#area-tabela .table-wrap').innerHTML = montarTabela(lista);
        document.getElementById('contador-filtro').textContent = 'Mostrando ' + lista.length + ' de ' + todosClientes.length + ' clientes';
        document.getElementById('limpar-filtro').style.display = filtro ? 'inline-block' : 'none';

        ligarOrdenacao();
    }

    function ligarFiltro() {
        document.getElementById('filtro').addEventListener('input', function () {
            filtro = this.value.toLowerCase();
            atualizarTabela();
        });

        document.getElementById('limpar-filtro').addEventListener('click', function () {
            filtro = '';
            document.getElementById('filtro').value = '';
            atualizarTabela();
        });
    }

    function montarTabela(lista) {
        // ordena pela coluna clicada
        lista.sort(function (a, b) {
            var valA = a[ordenarPor] || '';
            var valB = b[ordenarPor] || '';
            if (valA < valB) return ordemCrescente ? -1 : 1;
            if (valA > valB) return ordemCrescente ? 1 : -1;
            return 0;
        });

        var html = '<table><thead><tr>';
        html += coluna('nome', 'Nome');
        html += coluna('email', 'Email');
        html += coluna('cidade', 'Cidade');
        html += coluna('telefone', 'Telefone');
        html += '</tr></thead><tbody>';

        if (lista.length === 0) {
            html += '<tr><td colspan="4">Nenhum cliente encontrado.</td></tr>';
        } else {
            lista.forEach(function (c) {
                var tel = c.telefone;
                // formata telefone com ddd
                if (tel.length === 11) {
                    tel = '(' + tel.substring(0, 2) + ') ' + tel.substring(2, 7) + '-' + tel.substring(7);
                }

                html += '<tr>';
                html += '<td>' + c.nome + '</td>';
                html += '<td>' + c.email + '</td>';
                html += '<td>' + c.cidade + '</td>';
                html += '<td>' + tel + '</td>';
                html += '</tr>';
            });
        }

        html += '</tbody></table>';
        return html;
    }

    function coluna(campo, titulo) {
        var seta = '';
        if (ordenarPor === campo) {
            seta = ordemCrescente ? ' ▲' : ' ▼';
        }
        return '<th class="ordenavel" data-campo="' + campo + '">' + titulo + seta + '</th>';
    }

    function ligarOrdenacao() {
        document.querySelectorAll('th.ordenavel').forEach(function (th) {
            th.addEventListener('click', function () {
                var campo = th.getAttribute('data-campo');

                if (ordenarPor === campo) {
                    ordemCrescente = !ordemCrescente;
                } else {
                    ordenarPor = campo;
                    ordemCrescente = true;
                }

                atualizarTabela();
            });
        });
    }

    function desenharGrafico(porCidade) {
        var cidades = Object.keys(porCidade);

        // ordena do maior pro menor
        cidades.sort(function (a, b) {
            return porCidade[b] - porCidade[a];
        });

        var valores = [];
        cidades.forEach(function (c) {
            valores.push(porCidade[c]);
        });

        if (grafico) {
            grafico.destroy();
        }

        grafico = new Chart(document.getElementById('grafico-cidades'), {
            type: 'bar',
            data: {
                labels: cidades,
                datasets: [{
                    data: valores,
                    backgroundColor: '#4a7c59'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
});
