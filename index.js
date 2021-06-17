//UTILIZANDO STREAM COM PAUSE/RESUME.

//importando mysql
const mysql = require('mysql2');

//configurando a conexão com DB
let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "employees"
});

//iniciando a conexão com DB
connection.connect((err) => {
    if (err) {
        throw err;
    }
    else {
        console.log("Conectado!");
    }
});

//função que atualiza os dados do empregado.
const processRow = (row, callback) => {

    var sql = mysql.format('UPDATE employees set full_name = CONCAT(?, " ", ?) WHERE emp_no = ?', [row['first_name'], row['last_name'], row['emp_no']]);//aqui nós definimos como vai ser o processamento. Estamos usando o mysql.format por questões de segurança, para evitar mysql injection. Na query que montamos, as ? são os parâmetros que queremos, eles estão na array que criamos. Utilizamos ? por conta do mysql.format, para garantir a segurança. o CONCAT é uma função do mysql que vai concatenar os parâmetros que escolhermos.

    connection.query(sql);//aqui mandamos o comando da variável sql para o DB.

    callback();//criamos a callback acima e chamamos aqui. A callback informa ao nosso programa que, depois que fizermos algo, no nosso caso, depois de processar a row que chegou, vamos dar uma callback, uma resposta. Essa callback está descrita no .on, onde utilizamos a função.
}

//buscando os dados dos empregados no DB.
let query = connection.query('SELECT emp_no, first_name, last_name FROM employees.employees LIMIT 1000;');//o .query equivale a digitar um comando query no DB.


query.on('error', (err) => {//com o .on (ligado) eu quero dizer que enquanto estiver acontecendo o query que pedi acima, se ele der um erro, imprimir um erro no console. Este on é somente para verificar erros.

    console.error(err);
})
    .on('result', (row) => {//se não der erro, quando o query estiver on e trouxer uma linha(row)...

        connection.pause();//ele deve dar um pause.

        //agora vamos utilizar a função que fizemos mais acima.
        processRow(row, () => {//vamos processar a row que chegou e, depois de processar, vamos utilizar a callback. Nossa callback aqui na função é descrita pelo () =>...
            connection.resume();//que vai mandar retomar a conexão.
        });
    })
    .on('end', () => {//.on somente para nos informar quando terminar todo o processo e fechar a conexão com o DB.
        console.log('Sucesso!');
        connection.end();
    });
