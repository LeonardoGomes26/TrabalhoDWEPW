'use server'
import axios from "axios"
import { revalidatePath } from "next/cache"
import xss from "xss"

const urlAPI = 'https://ads.osorio.ifrs.edu.br/progweb-api'

export async function getEstudantes(){
    const {data} = await axios.get(urlAPI)
    return data
}
export async function addEstudante({nome, turma, nota1, nota2, nota3}){
    const preCarrega = {
        nome: xss(nome),
        ...(turma && {turma: xss(turma)}),
        nota1: Number(nota1),
        nota2: Number(nota2),
        nota3: Number(nota3)
    }

    await axios.post(urlAPI, preCarrega)
    revalidatePath('/')
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