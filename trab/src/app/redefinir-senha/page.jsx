'use client'
import { redefinirSenha } from "@/lib/db";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RedefinirSenha(){
    const [cpf, setCpf] = useState('')
    const [novaSenha, setNovaSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
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
    
    async function handleRedefinir(e){
        e.preventDefault()

        const resposta = await redefinirSenha({cpf, novaSenha, confirmarSenha})
        if(resposta?.error){
            alert(resposta.error)
            return;
        }

        setCpf('')
        setNovaSenha('')
        setConfirmarSenha('')

        alert('Senha redefinida com sucesso!')
        router.push('/login')
    }
    function formatarCPF(val){
        return val.replace(/\D/g, '').slice(0,11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    
    return(
        <div className="page_login">
            <div className="text_curvo">
                {letras.map((letra, i) => (
                    <span key={i} style={{transform: `translateX(-50%) rotate(${angulos[i]}deg)`}}>{letra === ' ' ? '\u00A0' : letra}</span>
                ))}
            </div>

            <form onSubmit={handleRedefinir} className="itens_centro">
                <input type="text" placeholder="CPF" value={cpf} onChange={(e) => setCpf(formatarCPF(e.target.value))} className="inputs_login input_nome_login"/>
                <input type="password" placeholder="Nova Senha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="inputs_login"/>
                <input type="password" placeholder="Confirmar Senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className="inputs_login"/>

                <div className="bottom_login">
                    <button type="button" onClick={() => router.push('/login')} className="button_voltar_login" title="Voltar para o login"><img src="/volte.png" alt="Voltar para o login" className="button_voltar_login"/></button>
                    <button type="submit" className="button_login">Redefinir Senha</button>
                </div>
            </form>
        </div>
    )
}