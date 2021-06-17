//UTILIZANDO STREAM COM PIPE.

//importando mysql
const mysql = require('mysql2');
const stream = require('stream')//incluindo a biblioteca para utilizar o pipe

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

//criando a stream.
var updateStream = new stream.Transform({highWaterMark: 5, objectMode: true});//criamos uma classe de stream (que importamos lá em cima). Escolhemos o Transform como tipo de stream, pois vamos buscar uma informação, transformar e enviar de volta (ver material anotado na pasta). Como parâmetros, usaremos o highWaterMark para definir o tamanho do buffer e o objectMode, que vai definir que toda informação que vier do DB, venha como um objeto, onde cada coluna da nossa DB seja uma posição no nosso objeto.

updateStream._write = (chunk, encoding, callback) => {//quando a stream for utilizada para escrever ._write, ele vai receber como parâmetros a chunk, que é igual a row, chama-se de chunk porque são pedaços, encoding, pode ser necessário para dizer qual a codificação utilizamos (no nosso exemplo aqui não) e o callback.
    
    var sql = mysql.format('UPDATE employees set full_name = CONCAT(?, " ", ?) WHERE emp_no = ?', [chunk['first_name'], chunk['last_name'], chunk['emp_no']]);//aqui nós definimos como vai ser o processamento. Estamos usando o mysql.format por questões de segurança, para evitar mysql injection. Na query que montamos, as ? são os parâmetros que queremos, eles estão na array que criamos. Utilizamos ? por conta do mysql.format, para garantir a segurança. o CONCAT é uma função do mysql que vai concatenar os parâmetros que escolhermos.
    
    connection.query(sql);//aqui mandamos o comando da variável sql para o DB.

    callback();//criamos a callback acima e chamamos aqui. A callback informa ao nosso programa que, depois que fizermos algo, no nosso caso, depois de processar a row que chegou, vamos dar uma callback, uma resposta. Essa callback está descrita no .on, onde utilizamos a função.
}

//buscando os dados dos empregados no DB.
let query = connection.query('SELECT emp_no, first_name, last_name FROM employees.employees LIMIT 1000;').on('end', () => {//o .on no final é uma callback para fechar a conexão com DB.

    console.log('Sucesso!');
    connection.end();

});//o .query equivale a digitar um comando query no DB

query.stream({highWaterMark: 5}).pipe(updateStream);//Este stream criado aqui é somente leitura. Ele vai na base de dados, le os dados de 5 em 5 e colocando no buffer. O highWaterMark: 5 é o tamanho do nosso buffer. Cada vez que o sistema for no DB, ele vai trazer 5 rows. Quando dou o .pipe, eu pego o resultado deste stream e jogo em outro stream, que é a classe updateStream que criamos acima, o stream Transform, e aí sim faz a transformação que queremos e manda de volta. O .pipe já faz o callback.
