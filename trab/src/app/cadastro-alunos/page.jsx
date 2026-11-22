'use client'
import { addEstudante } from "@/lib/db"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function CadastrarAluno(){
    const [logado, setLogado] = useState(false)
    const [nome, setNome] = useState('')
    const [turma, setTurma] = useState('')
    const [nota1, setNota1] = useState('')
    const [nota2, setNota2] = useState('')
    const [nota3, setNota3] = useState('')
    const router = useRouter()

    useEffect(() => {
        const usuario = localStorage.getItem('usuario')
        if(!usuario)
            router.replace('/login')
        else
            setLogado(true)
    }, [router])

    const texto = 'Sistema de Notas'
    const letras = texto.split('')
    
    const pesoLetra = (l) => {
        if('mwMW'.includes(l))
            return 1.6
        if(l >= 'A' && l <= 'Z')
            return 1.3
        if('iljtfr'.includes(l))
            return 0.55
        return 1
    }
    
    const pesos = letras.map(pesoLetra)
    const pesoTotal = pesos.reduce((acc, p) => acc + p, 0)
    const anguloTotal = 44
    const grauPorPeso = anguloTotal/pesoTotal
    
    let anguloAtual = -anguloTotal/2
    const angulos = pesos.map((p) => {
        const centro = anguloAtual + (p*grauPorPeso)/2
        anguloAtual += p*grauPorPeso
        return centro
    })

    async function handleCadastrar(e){
        e.preventDefault()

        const resposta = await addEstudante({nome, turma, nota1, nota2, nota3})
        if(resposta?.error){
            alert(resposta.error)
            return;
        }

        setNome('')
        setTurma('')
        setNota1('')
        setNota2('')
        setNota3('')

        alert('Estudante cadastrado com sucesso!')
        router.push('/')
    }

    if(!logado)
        return null

    return(
        <div className="page_login">
            <div className="text_curvo">
                {letras.map((letra, i) => (
                    <span key={i} style={{transform: `translateX(-50%) rotate(${angulos[i]}deg)`}}>{letra === ' ' ? '\u00A0' : letra}</span>
                ))}
            </div>

            <form onSubmit={handleCadastrar} className="itens_centro">
                <input type="text" className="inputs_login input_nome_login" value={nome} placeholder="Nome" onChange={(e) => setNome(e.target.value)} autoFocus required/>
                <input type="text" placeholder="Turma (Opcional)" value={turma} onChange={(e) => setTurma(e.target.value)} className="inputs_login"/>

                <div className="notas_cadastro">
                    <input type="number" min='0' max='10' placeholder="Nota 1" value={nota1} onChange={(e) => setNota1(e.target.value)} className="input_nota_cadastro" required/>
                    <input type="number" min='0' max='10' placeholder="Nota 2" value={nota2} onChange={(e) => setNota2(e.target.value)} className="input_nota_cadastro" required/>
                    <input type="number" min='0' max='10' placeholder="Nota 3" value={nota3} onChange={(e) => setNota3(e.target.value)} className="input_nota_cadastro" required/>
                </div>

                <div className="bottom_login">
                    <button type="button" onClick={() => router.push('/')} className="button_voltar_cadastro"><img src="/volte.png" alt="Voltar" className="button_voltar_cadastro"/></button>
                    <button type="submit" className="button_cadastro">Cadastrar</button>
                </div>
            </form>
        </div>
    )
}