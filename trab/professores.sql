CREATE TABLE professores(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(150) NOT NULL,
	cpf VARCHAR(14) NOT NULL,
	senha VARCHAR(100) NOT NULL
)

SELECT * FROM professores

CREATE TABLE frequencias(
	estudante_id VARCHAR(255) PRIMARY KEY,
	index_presenca INT NOT NULL DEFAULT 2,
	frequencia INT NOT NULL DEFAULT 100
)

SELECT * FROM frequencias

DROP TABLE frequencias

