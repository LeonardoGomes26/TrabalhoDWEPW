'use client'
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Login(){
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [usuarioSalvo, setUsuarioSalvo] = useState('')

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

  useEffect(() => {
    const carregar = localStorage.getItem('usuario')
    if(carregar)
        setUsuarioSalvo(carregar)
  }, [])

  return (
    <div className="page_login">
      <div className="text_curvo">
        {letras.map((letra, i) => (
          <span key={i} style={{transform: `translateX(-50%) rotate(${angulos[i]}deg)`}}>{letra === ' ' ? '\u00A0' : letra}</span>
        ))}
      </div>
      <div className="itens_centro">
        <input type="text" value={cpf} placeholder="CPF" onChange={(e) => setCpf(e.target.value)} className="inputs_login input_nome_login" autoFocus/>
        <input type="password" value={senha} placeholder="Senha" onChange={(e) => setSenha(e.target.value)} className="inputs_login"/>
        <h3>Esqueceu a sua senha?</h3>
        <div className="bottom_login">
          <Link href='/' title="Voltar"><img src="/volte.png" alt="Voltar" className="button_voltar"/></Link>
          <button className="button_login">Redefinir senha</button>
        </div>
      </div>
    </div>
  );
}