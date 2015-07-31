var path = require('path');

// Postgres DB_URL = postgres://user:passwd@host:port/database
// SQLite 	DB_URL = sqlite://@:/

var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_NAME = (url[6]||null);
var user	= (url[2]||null);
var pwd 	= (url[3]||null);
var protocol= (url[1]||null);
var dialect = (url[1]||null);
var port 	= (url[5]||null);
var host	= (url[4]||null);
var storage	= process.env.DATABASE_STORAGE;

// Cargar Modelo ORM
var Sequelize = require('sequelize');

//Usar BBDD SQLite
var sequelize = new Sequelize(DB_NAME, user, pwd,
								{	dialect: protocol, 
									storage: protocol,
									port: 	 port,
									host: 	 host,
									storage: storage,
									omitNull:true
								}
							);

// Importar la definicion de la tabla Quiz en quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));

exports.Quiz = Quiz; // Exportar definicion de la Tabla Quiz

// sequelize.sync() crea e inicializa la tabla de preguntas en DB

sequelize.sync().then(function(){
	// success... ejecuta el manejador una vez creada la tabla
	Quiz.count().then(function(count){
		if(count === 0){ // la tabla se inicializa solo si esta vacia
			Quiz.create({ pregunta: 'Capital de Italia',
						  respuesta: 'Roma',
						  tema: "otro"
					});
			Quiz.create({ pregunta: 'Capital de Portugal',
						  respuesta: 'Lisboa',
						  tema: 'otro'
					})
			.then(function(){console.log('Base de datos inicializada.')});
		};
	});
});