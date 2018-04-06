const {log, biglog, errorlog, colorize} = require("./out");
const {models} = require('./model');
const Sequelize =require('sequelize');


/*Comando de ayuda*/
exports.helpCmd = rl =>{
	log("Comandos:", 'green');
 	log(" h|help -  Muestra la lista de ayuda.", 'green');
 	log(" list - Listar los quizzes existentes.", 'green');
 	log(" show <id> - Muestra la pregunta y la respuesta del quiz indicado.", 'green');
 	log(" add - Añadir un nuevo quiz interactivamente.", 'green');
 	log(" delete <id> - Borrar el quiz indicado", 'green');
 	log(" edit <id> - Editar el quiz indicado.", 'green');
 	log(" test <id> - Probar el quiz indicado.", 'green');
 	log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.", 'green');
 	log(" credits - Créditos.", 'green');
 	log(" q|quit - Salir del programa.", 'green');
 	rl.prompt();
};

exports.listCmd = rl =>{
	/*
	model.getAll().forEach((quiz, id) => {log(`[${colorize(id, 'magenta')}]: ${quiz.question}`);
	});
	rl.prompt();
	*/

	models.quiz.findAll()//promesa
	/*
	//ESTO SE PODRÍA PONER DE LA SIQUIENTE FORMA:
	.each(quiz =>{
		log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize("=>", "magenta")} ${quiz.answer}`)
	
	})
	.catch(error=>{
		errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();
	});

	*/


	.then(quizzes =>{
		quizzes.forEach(quiz=>{
			log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize("=>", "magenta")} ${quiz.answer}`)
		});
	})
	.catch(error=>{
		errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();
	});


};

const validateId = id =>{
	return new Sequelize.Promise ((resolve, reject)=>{
		if(typeof id === "undefined"){
			reject(new Error(`Falta parámetro <id>`));
		}else{
			id = parseInt(id);
			if(Number.isNaN(id)){
				reject(new Error(`El parámetro id no es válido`));
			}else{
				resolve(id);

			}
		}

	});
};



exports.showCmd = (rl, id) =>{
	/*
	if (typeof id === "undefined") {
		errorlog(`Falta el parámetro id.`);
	} else {
		try{
			const quiz = model.getByIndex(id);
			log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
		} catch(error) {
			errorlog(error.message);
		}
	}
	rl.prompt();
	*/
	validateId(id)
	.then(id =>{
		return models.quiz.findById(id)
	})
	.then(quiz=>{
		if(!quiz){
			throw new Error ('No existe quiz asociado al <id>');
		}else{
			log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
		}

	})
	.catch(error=>{
		errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();

	});

};

const makeQuestion=(rl, text)=>{
	return new Sequelize.Promise ((resolve, reject)=>{
		rl.question(colorize(text,'red'), answer=>{
			resolve(answer.trim());
		});

	});

}; 

exports.addCmd = rl =>{
	/*
	rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
		rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
			model.add(question, answer);
			log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
			rl.prompt();
		});
	});
	*/
	makeQuestion(rl, 'Introduzca una pregunta: ')
	.then(q=>{
		return makeQuestion(rl, 'Introduzca una respuesta: ')
		.then(a=>{
			return {question: q, answer: a};
		});
	})
	.then(quiz =>{
		return models.quiz.create(quiz);
	})
	.then(quiz=>{
		log(`${colorize("Se ha añadido: ","magenta")} ${quiz.question} ${colorize(" => ","magenta")} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error =>{
		errorlog('Quiz erróneo:');
		error.errors.forEach(({message})=> errorlog(message));
	})
	.catch(error =>{
		errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();
	});


};

exports.deleteCmd = (rl, id) =>{


	/*if (typeof id === "undefined") {
		errorlog(`Falta el parámetro id.`);
	} else {
		try{
			model.deleteByIndex(id);
		} catch(error) {
			errorlog(error.message);
		}
	}
	rl.prompt();*/
	validateId(id)
	.then(id=>{
		return models.quiz.destroy({ where: {id}})
	})
	.then(quiz=>{
		if(!quiz){
			throw new Error ('No existe quiz asociado al <id>');
		}else{
			log(`Se ha borrado el quiz.`);
		}

	})

	.catch(error=>{
		errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();
	});

};

exports.editCmd = (rl, id) =>{
	/*
	if (typeof id === "undefined") {
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	} else {
		try{
			const quiz = model.getByIndex(id);

			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

			rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

				rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
					model.update(id, question, answer);
					log(` Se ha cambiado el quiz ${colorize(id, 'magenta')}  por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
					rl.prompt();
				});
			});
		} catch(error) {
			errorlog(error.message);
			rl.prompt();
		}
	}
	*/

	validateId(id)
	.then(id=>{
		return models.quiz.findById(id);
	})
	.then(quiz=>{
		if(!quiz){
			throw new Error ('No existe quiz asociado al id');
		}

		process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.question)},0);
		return makeQuestion(rl,'Introduzca una pregunta: ')
		.then(q=>{
			process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.answer)},0);
			return makeQuestion(rl, 'Introduzca una respuesta: ')
			.then(a =>{
				quiz.question=q;
				quiz.answer=a;
				return quiz;
			});
		});
	})
	.then(quiz =>{
		return quiz.save();
	})
	.then(quiz=>{
		log(` Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')}  por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
					

	})
	.catch(Sequelize.ValidationError, error =>{
		errorlog('Quiz erróneo:');
		error.errors.forEach(({message})=> errorlog(message));
	})
	.catch(error =>{
		errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();
	});



};

exports.testCmd = (rl, id) =>{
	/*
	if (typeof id === "undefined") {
	errorlog(`Falta el parámetro id.`);
		rl.prompt();
	} else {
		try{
			const quiz = model.getByIndex(id);
			rl.question(colorize(quiz.question+"? ", 'red'), answer => {
				if (quiz.answer.toLowerCase().trim() === answer.toLowerCase().trim()){
					log("Su respuesta es correcta.", 'green');
					biglog('CORRECTO', 'green');
					rl.prompt();
				} else{
					log("Su respuesta es incorrecta.", 'red');
					biglog('INCORRECTO', 'red');
					rl.prompt();
				}
			});
		} catch(error) {
			errorlog(error.message);
			rl.prompt();
		}
	}	
	*/
	validateId(id)
	.then(id =>{
		return models.quiz.findById(id);
	})
	.then(quiz=>{
		if(!quiz){
			throw new Error("No existe Quiz asociado al id.")
		}else{
			return makeQuestion(rl, quiz.question+"? : " )
			.then(a=>{
				if(quiz.answer.trim().toLowerCase() === a.toLowerCase()){
					biglog("CORRECTO");

				}else{
					biglog("INCORRECTO");
				}
			});
		}
	})
	.catch(Sequelize.ValidationError, error =>{
		errorlog('Quiz erróneo:');
		error.errors.forEach(({message})=> errorlog(message));
	})
	.catch(error =>{
		errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();
	});


};

exports.playCmd = rl =>{
	/*
	let score = 0;
	let qUnresolved = [];
	for(let i=0; i < model.count(); i++){
		qUnresolved[i] = model.getByIndex(i);
	};
	const playOne = () => {
		if(qUnresolved.length === 0){
			log("Fin del juego! Aciertos: " + score);
			biglog(score, 'magenta');
			score = 0;
			rl.prompt();
		} else {
			let idAleat = Math.random() * (qUnresolved.length - 1);
			let id = Math.round(idAleat);
			rl.question(colorize(qUnresolved[id].question+"? ", 'red'), answer => {
				if (qUnresolved[id].answer.toLowerCase().trim() === answer.toLowerCase().trim()){
					score++;
					log('CORRECTO - LLeva '+ score + ' aciertos.', 'green');
					qUnresolved.splice(id, 1);
					playOne();
				} else{
					log('INCORRECTO.', 'red');
					log("Fin del juego! Aciertos: " + score);
					biglog(score, 'magenta');
					score = 0;
					rl.prompt();
				}
			});

		}
	};
	playOne();
	*/

	let score=0;
	let qUnresolved = new Array();
	const playOne=()=>{
		return Promise.resolve()
		.then(() =>{
			if(qUnresolved.length===0){
				log(" Fin del juego");
				biglog(score,"blue");
				score=0;
				rl.prompt();
				return;
			}else{

				let id=Math.floor( Math.random()* (qUnresolved.length-1));
				let quiz = qUnresolved[id];
				qUnresolved.splice(id,1);
				makeQuestion(rl, quiz.question+"?: ")
				.then(a=>{
					if(quiz.answer.trim().toLowerCase() === a.toLowerCase()){
					biglog("CORRECTO");
					score++;
					log('Número de aciertos: '+score);
					
					playOne();


					}else{
						biglog("INCORRECTO");
						log('Número de aciertos: '+score);
						score = 0;

					}

				})
				.catch(error=>{
					errorlog(error.message);
				})
				.then(()=>{
					rl.prompt();
				});

			}
		});

	};
	models.quiz.findAll({raw: true})
	.then(quizzes=>{
		qUnresolved=quizzes;
	})
	.then(()=>{
		return playOne();
	})
	.catch(error=>{
		errorlog(error.message);
	})
	.then(()=>{
		rl.prompt();
	});


	};



exports.creditsCmd = rl =>{
	log("Autores de la práctica:", 'red');
 	log("MARINA GONZALEZ GONZALEZ", 'green');
 	
 	rl.prompt();
};

exports.quitCmd = rl =>{
	rl.close();
	rl.prompt();
};