document.addEventListener('DOMContentLoaded', () => {
    fetch('api/clientes.php?action=list')
        .then(response => response.json())
        .then(dados => {

            let html = '<table border="1" cellpadding="5">';
            html += '<tr><th>Email</th><th>Nome</th><th>Cidade</th></tr>';

            dados.forEach(cliente => {
                html += `
                    <tr>
                        <td>${cliente.nome}</td>
                        <td>${cliente.email}</td>
                        <td>${cliente.cidade}</td>
                    </tr>
                `;
            });

            html += '</table>';
            document.getElementById('relatorios').innerHTML = html;
        });
});
