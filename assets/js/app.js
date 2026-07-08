document.addEventListener('DOMContentLoaded', function () {
    fetch('api/clientes.php?action=report')
        .then(function (res) { return res.json(); })
        .then(function (clientes) {
            var html = '';

            html += '<p class="resumo">Total de clientes: <strong>' + clientes.length + '</strong></p>';

            var porCidade = {};
            clientes.forEach(function (c) {
                porCidade[c.cidade] = (porCidade[c.cidade] || 0) + 1;
            });

            html += '<h2>Por cidade</h2><ul class="cidades">';
            Object.keys(porCidade).sort().forEach(function (cidade) {
                html += '<li>' + cidade + ' (' + porCidade[cidade] + ')</li>';
            });
            html += '</ul>';

            html += '<h2>Clientes</h2>';
            html += '<table><thead><tr><th>Nome</th><th>Email</th><th>Cidade</th><th>Telefone</th></tr></thead><tbody>';

            clientes.forEach(function (c) {
                var tel = c.telefone;
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

            html += '</tbody></table>';

            document.getElementById('relatorio').innerHTML = html;
        })
        .catch(function () {
            document.getElementById('relatorio').innerHTML = '<p class="erro">Não foi possível carregar o relatório.</p>';
        });
});
