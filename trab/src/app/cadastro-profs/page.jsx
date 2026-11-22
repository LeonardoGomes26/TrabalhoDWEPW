'use client'
import { addProfessor } from "@/lib/db";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Cadastro(){
    const [nome, setNome] = useState('')
    const [cpf, setCpf] = useState('')
    const [senha, setSenha] = useState('')
    const router = useRouter()
    
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

    function formatarCPF(val){
        return val.replace(/\D/g, '').slice(0,11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    async function EnviarCadastro(e){
        e.preventDefault()
        
        const resposta  = await addProfessor({nome, cpf, senha})
        if(resposta?.error){
            alert(resposta.error)
            return;
        }

        router.push('/login')
    }

    return(
        <div className="page_login">
            <div className="text_curvo">
                {letras.map((letra, i) => (
                    <span key={i} style={{transform: `translateX(-50%) rotate(${angulos[i]}deg)`}}>{letra === ' ' ? '\u00A0' : letra}</span>
                ))}
            </div>

            <form onSubmit={EnviarCadastro} className="itens_centro">
                <input type="text" className="inputs_login input_nome_login" value={nome} placeholder="Nome" onChange={(e) => setNome(e.target.value)} autoFocus required/>
                <input type="text" className="inputs_login" value={cpf} placeholder="CPF" onChange={(e) => setCpf(formatarCPF(e.target.value))} maxLength={14} minLength={14} required/>
                <input type="password" className="inputs_login" value={senha} placeholder="Senha" onChange={(e) => setSenha(e.target.value)} required/>

                <div className="bottom_login">
                    <button className="button_voltar_cadastro" type="button" title="Voltar para o Login" onClick={() => router.push('/login')}><img src="/volte.png" alt="Voltar para o Login" className="button_voltar_cadastro"/></button>
                    <button type="submit" className="button_cadastro">Cadastrar Professor(a)</button>
                </div>
            </form>
        </div>
    )
}