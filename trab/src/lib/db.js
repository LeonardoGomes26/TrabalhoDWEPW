'use server'
import axios from "axios"
import { revalidatePath } from "next/cache"
import { Pool } from "pg"
import xss from "xss"

const urlAPI = 'https://ads.osorio.ifrs.edu.br/progweb-api/estudantes'

const pool = new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE
})

export async function getEstudantes(){
    const {data} = await axios.get(urlAPI)
    return data
}
export async function getFrequencias(){
    try{
        const {rows} = await pool.query('SELECT * FROM frequencias')
        return rows
    } catch(error){
        console.log('Erro ao buscar frequências: ', error)
        return []
    }
}
export async function salvarFrequencias(estudanteId, indexPresenca, frequencia){
    estudanteId = xss(String(estudanteId))

    try{
        const resposta = await pool.query(`UPDATE frequencias SET index_presenca = $1, frequencia = $2 WHERE estudante_id = $3`, [Number(indexPresenca), Number(frequencia), estudanteId])
        if(resposta.rowCount === 0)
            await pool.query(`INSERT INTO frequencias (estudante_id, index_presenca, frequencia) VALUES ($1, $2, $3)`, [estudanteId, Number(indexPresenca), Number(frequencia)])
    } catch(error){
        console.log('Erro ao salvar frequência: ', error)
    }
}
export async function addEstudante({nome, turma, nota1, nota2, nota3}){
    const preCarrega = {
        nome: xss(nome),
        turma: turma ? xss(turma) : '',
        nota1: Number(nota1),
        nota2: Number(nota2),
        nota3: Number(nota3)
    }

    try{
        await axios.post(urlAPI, preCarrega)
        revalidatePath('/')
    } catch(error){
        return {error: 'Erro ao cadastrar estudante!'}
    }
}
export async function addProfessor({nome, cpf, senha}){
    nome =  xss(nome)
    cpf =  xss(cpf)
    senha =  xss(senha)

    if(!nome || !cpf || !senha)
        return {error: 'Preencha todos os campos!'}

    try{
        await pool.query('INSERT INTO professores (nome, cpf, senha) VALUES ($1, $2, $3)', [nome, cpf, senha])
        return true
    } catch(error){
        if(error.code === '23505')
            return {error: 'Este CPF já está cadastrado!'}
        console.log('Erro ao cadastrar professor: ', error)
        return {error: 'Erro ao conectar com o banco de dados!'}
    }
}
export async function loginProfessor({cpf, senha}){
    cpf = xss(cpf)
    senha = xss(senha)

    if(!cpf || !senha)
        return {error: 'Preencha todos os campos!'}
    
    try{
        const {rows} = await pool.query('SELECT id, nome, cpf FROM professores WHERE cpf = $1 AND senha = $2', [cpf, senha])

        if(rows.length === 0)
            return {error: 'CPF ou Senha incorretos!'}

        return rows[0]
    } catch(error){
        console.log('Erro ao fazer login: ', error)
        return {error: 'Erro ao conectar no banco de dados!'}
    }
}
export async function redefinirSenha({cpf, novaSenha, confirmarSenha}){
    cpf = xss(cpf)
    novaSenha = xss(novaSenha)
    confirmarSenha = xss(confirmarSenha)

    if(!cpf || !novaSenha || !confirmarSenha)
        return {error: 'Preencha todos os campos!'}
    else if(novaSenha !== confirmarSenha)
        return {error: 'As senhas não são iguais'}
    try{
        const {rowCount} = await pool.query('UPDATE professores SET senha = $1 WHERE cpf = $2', [novaSenha, cpf])
        if(rowCount === 0)
            return {error: 'CPF não encontrado!'}

        return true
    } catch(error){
        console.log('Erro ao redefinir senha: ', error)
        return {error: 'Erro ao conectar com o banco de dados!'}
    }
}
export async function buscarEstudante(nome){
    const estudantes = await getEstudantes()
    if(!nome || !nome.trim())
        return estudantes

    const nomeIndentado = nome.trim().toLowerCase()
    return estudantes.filter((estudante) => 
        estudante.nome?.toLowerCase().includes(nomeIndentado)
    )
}
export async function editarEstudante(id, {nome, turma, nota1, nota2, nota3}){
    const preCarrega = {
        nome: xss(nome),
        turma: turma ? xss(turma) : '',
        nota1: Number(nota1),
        nota2: Number(nota2),
        nota3: Number(nota3)
    }

    await axios.patch(`${urlAPI}/${id}`, preCarrega)
    revalidatePath('/')
}
export async function apagarEstudante(id){
    await axios.delete(`${urlAPI}/${id}`)
    revalidatePath('/')
}