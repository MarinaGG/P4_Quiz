
const Sequelize = require('sequelize');

//nueva base de datos
const sequelize= new Sequelize("sqlite:quizzes.sqlite",{logging: false});

//definimos un modelo de datos: quiz
sequelize.define('quiz',{
	question: {
		type: Sequelize.STRING,
		unique: {msg:"Ya existe esta pregunta."},
		validate: {notEmpty: {msg:"La pregunta no puede estar vacía."}}
	},
	answer: {
		type: Sequelize.STRING,
		validate: {notEmpty: {msg:"La respuesta no puede estar vacía."}}
	}
});

//se crea un array que se llama models, donde estan definidos los modelos---- models.quiz

//sincronización
sequelize.sync()//Esto es una promesa
.then(()=>sequelize.models.quiz.count())//otra promesa
.then(count=>{
	if(!count){
		return sequelize.models.quiz.bulkCreate([
		{question: "Capital de España", answer: "Madrid"},
		{question: "Capital de Italia", answer: "Roma"},
		{question: "Capital de Francia", answer: "París"},
		{question: "Capital de Portugal", answer: "Lisboa"}
		]);
	}
})
.catch(error =>{
	console.log(error);
});

module.exports=sequelize;



/*
//TODO ESTO YA NO NOS SERVIRÁ
const fs = require("fs");

const DB_FILENAME = "quizzes.json";
//Quizzes almacenados
let quizzes = [
{
	question: "Capital de Italia",
	answer: "Roma"
},
{
	question: "Capital de Francia",
	answer: "París"
},
{
	question: "Capital de España",
	answer: "Madrid"
},
{
	question: "Capital de Portugal",
	answer: "Lisboa"
}];

const load = () => {

	fs.readFile(DB_FILENAME, (err, data) => {
		if(err) {

			//La primera vez no existe el fichero.
			if (err.code === "ENOENT") {
				save();
				return;
			}
			throw err;
		}
		let json = JSON.parse(data);

		if(json) {
			quizzes = json;
		}
	});
};

const save = () => {
	fs.writeFile(DB_FILENAME,
		JSON.stringify(quizzes),
		err => {
			if (err) throw err;
		});
};

exports.count = () => quizzes.length;

exports.add = (question, answer) => {

	quizzes.push({
		question: (question || "").trim(),
		answer: (answer || "").trim()
	});
	save();
};

exports.update = (id, question, answer) => {
	const quiz = quizzes[id];
	if (typeof quiz === "undefined"){
		throw new Error(`El valor del parámetro id no es válido.`);
	}
	quizzes.splice(id, 1, {
		question: (question || "").trim(),
		answer: (answer || "").trim()
	});
	save();
};

exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

exports.getByIndex = id => {

	const quiz = quizzes[id];
	if (typeof quiz === "undefined") {
		throw new Error(`El valor del parámetro id no es válido.`);
	}
	return JSON.parse(JSON.stringify(quiz));
};

exports.deleteByIndex = id => {
	const quiz = quizzes[id];
	if (typeof quiz === "undefined") {
		throw new Error(`El valor del parámetro id no es válido.`);
	}
	quizzes.splice(id, 1);
	save();
};

//Carga los quizzes almacenados.
load();
*/
