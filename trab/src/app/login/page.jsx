'use client'
import { loginProfessor } from "@/lib/db";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login(){
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

  const voltarParaHomeNav = () => {
      window.location.href = 'https://www.google.com'
  }

  function formatarCPF(val){
    return val.replace(/\D/g, '').slice(0,11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  async function EnviarDados(e){
    e.preventDefault()

    const resposta = await loginProfessor({cpf, senha})
    if(resposta?.error){
      alert(resposta.error)
      return;
    }

    localStorage.setItem('usuario', JSON.stringify(resposta))
    setCpf('')
    setSenha('')
    router.push('/')
  }

  useEffect(() => {
    localStorage.removeItem('usuario')
    setCpf('')
    setSenha('')
  }, [])

  return (
    <div className="page_login">
      <div className="text_curvo">
        {letras.map((letra, i) => (
          <span key={i} style={{transform: `translateX(-50%) rotate(${angulos[i]}deg)`}}>{letra === ' ' ? '\u00A0' : letra}</span>
        ))}
      </div>

      <form onSubmit={EnviarDados} className="itens_centro">
        <input type="text" value={cpf} placeholder="CPF" onChange={(e) => setCpf(formatarCPF(e.target.value))} maxLength={14} minLength={14} className="inputs_login input_nome_login" autoFocus required/>
        <input type="password" value={senha} placeholder="Senha" onChange={(e) => setSenha(e.target.value)} className="inputs_login" required/>
        <button type="submit" className="button_login"><strong>Entrar</strong></button>
        <Link href='/cadastro-profs' className='caminho_cadastro'><h3>Não está cadastrado? Cadastre-se aqui!</h3></Link>

        <div className="bottom_login">
          <button className="button_voltar_login" type="button" title="Sair do Site" onClick={voltarParaHomeNav}><img src="/volte.png" alt="Sair do Site" className="button_voltar_login"/></button>
          <button type="button" onClick={() => router.push('/redefinir-senha')} className="button_login">Redefinir Senha</button>
        </div>
      </form> 
    </div>
  );
}