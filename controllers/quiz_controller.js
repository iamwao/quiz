var models = require('../models/models.js');

// Autoload - factoriza el código si la ruta inclute :quizId
exports.load = function(req, res, next, quizId){
	models.Quiz.find({
		where: { id: Number(quizId)},
		include: [{ model: models.Comment}]
	}).then(
		function(quiz){
			if(quiz){
				req.quiz = quiz;
				next();
			}else{
				next(new Error('No existe quizId=' + quizId));
			}
		}
	).catch(function(error){
		next(error);
	})
};

// GET /quizes
exports.index = function(req, res){
	param = req.query.search || '';
	param = param.replace(/\s/g, "%");
	models.Quiz.findAll({where: ['pregunta like ?', '%' + param + '%']}).then(
		function(quizes){
			res.render('quizes/index.ejs', {quizes: quizes, errors: []});
		}
	).catch(function(error){
		next(error);	
	});
};

exports.show = function(req, res){
	res.render('quizes/show', {quiz: req.quiz, errors: []});
};

exports.answer = function(req, res){
	var resultado = 'Incorrecto';
	if(req.query.respuesta === req.quiz.respuesta){
		resultado = 'Correcto';
	}
	res.render(
		'quizes/answer', 
		{
			quiz: req.quiz, 
			respuesta: resultado, 
			errors: []
		}
	);
};

exports.new = function(req, res){
	var quiz = models.Quiz.build( // Crea un objeto quiz
					{pregunta: "Pregunta", respuesta: "Respuesta", tema: "Tema"}
				);
	res.render('quizes/new', {quiz:quiz, errors: []});
};

exports.create = function(req, res){
	var quiz = models.Quiz.build(req.body.quiz);

	quiz
	.validate()
	.then(
		function(err){
			if(err){
				res.render('quizes/new', {quiz: quiz, errors: err.errors});
			}else{
				quiz // save: Guarda en DB los campos pregunta y respuesta de quiz
				.save({fields: ["pregunta", "respuesta", "tema"]})
				.then(function(){
					res.redirect('/quizes')
						// res.redirect: Redireccion HTTP a lista de preguntas
				})
			}
		}
	);
};

exports.edit = function(req, res){
	var quiz = req.quiz;  // Autoload de instancia de quiz

	res.render('quizes/edit', {quiz: quiz, errors: []});
};

exports.update = function(req, res){
	req.quiz.pregunta  = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tema = req.body.quiz.tema;

	req.quiz
	.validate()
	.then(
		function(err){
			if(err){
				res.render('quizes/edit', {quiz: quiz, errors: err.errors});
			}else{
				req.quiz
				.save({fields:["pregunta", "respuesta", "tema"]})
				.then(function(){
					res.redirect('/quizes');
				});
			}
		}
	);
};

exports.destroy = function(req, res){
	req.quiz.destroy().then( function(){
		res.redirect('/quizes');
	}).catch(function(error){
		next(error)
	});
};
