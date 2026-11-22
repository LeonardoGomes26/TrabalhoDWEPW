'use client'
import { editarEstudante, getEstudantes, getFrequencias, salvarFrequencias } from "@/lib/db";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const optionsPresenca = [
  {txt: 'Ausente - 2', valAjuste: -4},
  {txt: 'Ausente - 1', valAjuste: -2},
  {txt: 'Presente - 2', valAjuste: 0}
]

export default function Home() {
  const [logado, setLogado] = useState(false)
  const [professor, setProfessor] = useState(null)
  const [busca, setBusca] = useState('')
  const [estudantes, setEstudantes] = useState([])
  const [editandoNota, setEditandoNota] = useState(null)
  const [notasAtuais, setNotasAtuais] = useState({nota1: '', nota2: '', nota3: ''})
  const router = useRouter()

  useEffect(() => {
    const usuario = localStorage.getItem('usuario')
    if(!usuario)
      router.replace('/login')
    else{
      setProfessor(JSON.parse(usuario))
      setLogado(true)
      carregarEstudantes()
    }
  }, [router])

  function sair(){
    localStorage.removeItem('usuario')
    router.replace('/login')
  }
  async function carregarEstudantes(){
    const dadosLista = await getEstudantes()
    const listaFrequencias = await getFrequencias()

    const itemListaEst = dadosLista.map((estudante) => {
      const media = ((Number(estudante.nota1 || 0) + Number(estudante.nota2 || 0) + Number(estudante.nota3 || 0)) / 3)
      const freq = listaFrequencias.find((frequencia) => frequencia.estudante_id === estudante._id)
      
      return {
        ...estudante,
        id: estudante.id || estudante._id,
        nota: Number(media.toFixed(1)),
        indexPresenca: freq ? freq.index_presenca : 2,
        frequenciaInicial: 100,
        frequencia: freq ? freq.frequencia : 100
      }
    })

    setEstudantes(itemListaEst)
  }
  async function alterarPresenca(id, i){
    let novoIndiceSalvo = 2
    let novaFrequenciaSalva = 100

    const novaLista = estudantes.map((estudante) => {
      if(estudante._id !== id)
        return estudante

      let novoIndice = estudante.indexPresenca + i
      if(novoIndice < 0)
        novoIndice = 0
      else if(novoIndice > 2)
        novoIndice = 2

      const ops = optionsPresenca[novoIndice]
      const novaFrequencia = estudante.frequenciaInicial + ops.valAjuste

      novoIndiceSalvo = novoIndice
      novaFrequenciaSalva = novaFrequencia

      return {
        ...estudante,
        indexPresenca: novoIndice,
        frequencia: novaFrequencia
      }
    })

    setEstudantes(novaLista)
    await salvarFrequencias(id, novoIndiceSalvo, novaFrequenciaSalva)
  }
  function iniciaEdicaoNota(estudante){
    setEditandoNota(estudante._id)
    setNotasAtuais({
      nota1: String(estudante.nota1 ?? 0),
      nota2: String(estudante.nota2 ?? 0),
      nota3: String(estudante.nota3 ?? 0)
    })
  }
  async function salvarNota(estudante){
    const converterNota = (valor) => {
      if(valor === '' || valor === null || valor === undefined || valor === 'undefined')
        return 0
      return Number(String(valor).replace(',', '.'))
    }
    
    const valNum1 = converterNota(notasAtuais.nota1)
    const valNum2 = converterNota(notasAtuais.nota2)
    const valNum3 = converterNota(notasAtuais.nota3)

    if(isNaN(valNum1) || isNaN(valNum2) || isNaN(valNum3) || valNum1 < 0 || valNum1 > 10 || valNum2 < 0 || valNum2 > 10 || valNum3 < 0 || valNum3 > 10){
      console.log('Valores recebidos: ', {valNum1, valNum2, valNum3, notasAtuais})
      alert('As notas precisam ser entre 0 e 10!')
      return;
    }

    const media = Number(((valNum1 + valNum2 + valNum3) / 3).toFixed(1))
    const novaLista = estudantes.map((item) => item._id === estudante._id ? {...item, nota1: valNum1, nota2: valNum2, nota3: valNum3, nota: media} : item)
    
    setEstudantes(novaLista)
    setEditandoNota(null)

    await editarEstudante(estudante._id, {
      nome: estudante.nome,
      turma: estudante.turma,
      nota1: valNum1,
      nota2: valNum2,
      nota3: valNum3
    })
  }

  const estudantesFiltrados = estudantes.filter((estudante) => estudante.nome?.toLowerCase().includes(busca.toLowerCase()))

  if(!logado)
    return null

  return(
    <div>
      <div className="header">
        <h1>Sistema de<br />Notas</h1>

        <div className="header_professor">
          <div className="header_status">
            <span>Professor(a) {professor?.nome} -</span>
            <span className="status_online">Online</span>
          </div>
          <img src="/corujaProf.png" alt="Foto do Professor" className="picture_professor"/>
        </div>

        <div className="header_direita">
          <div className="header_busca">
            <img src="/lupa.png" alt="Buscar" className="icon_lupa"/>
            <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)}/>
          </div>

          <button type="button" onClick={() => router.push('/cadastro-alunos')} className="button_sair">Cadastrar Aluno</button>

          <button type="button" onClick={sair} className="button_sair">Sair</button>
        </div>
      </div>

      <div className="body_home">
        <table className="table_aluno">
          <thead>
            <tr>
              <th className="th_aluno">Alunos:</th>
              <th className="th_presenca">Presença</th>
              <th className="th_notas">Notas</th>
              <th className="th_frequencia">Frequência</th>
            </tr>
          </thead>
          <tbody>
            {estudantesFiltrados.map((estudante) => {
              const aprovado = estudante.frequencia >= 75 && estudante.nota >= 7

              return(
                <tr key={estudante._id}>
                  <td className="td_aluno">
                    <img src="/do-utilizador.png" alt={estudante.nome} className="picture_aluno"/>
                    <span className="name_aluno">{estudante.nome}</span>
                  </td>

                  <td className="td_presenca">
                    <div className="presenca">
                      <span className="text_presenca">{optionsPresenca[estudante.indexPresenca].txt}</span>
                      <div className="setas_presenca">
                        <button type="button" onClick={() => alterarPresenca(estudante._id, 1)}>
                          <img src="/seta.png" alt="Aumentar" className="icon_seta seta_baixo"/>
                        </button>
                        <button type="button" onClick={() => alterarPresenca(estudante._id, -1)}>
                          <img src="/seta.png" alt="Diminuir" className="icon_seta"/>
                        </button>
                      </div>
                    </div>
                  </td>

                  <td className="td_notas">
                    <div className="notas">
                      <button type="button" className="button_check" onClick={() => editandoNota === estudante._id && salvarNota(estudante)}><img src="/verifica.png" alt="Confirmar Edição" className="icon_check"/></button>

                      {editandoNota === estudante._id ? (
                        <div className="inputs_notas">
                          <input type="number" min='0' max='10' value={notasAtuais.nota1} onChange={(e) => setNotasAtuais({...notasAtuais, nota1: e.target.value})} onKeyUp={(e) => e.key === 'Enter' && salvarNota(estudante)} className="input_nota" autoFocus required/>
                          <input type="number" min='0' max='10' value={notasAtuais.nota2} onChange={(e) => setNotasAtuais({...notasAtuais, nota2: e.target.value})} onKeyUp={(e) => e.key === 'Enter' && salvarNota(estudante)} className="input_nota"/>
                          <input type="number" min='0' max='10' value={notasAtuais.nota3} onChange={(e) => setNotasAtuais({...notasAtuais, nota3: e.target.value})} onKeyUp={(e) => e.key === 'Enter' && salvarNota(estudante)} className="input_nota"/>
                        </div>
                      ) : (
                        <span className="value_nota">{String(estudante.nota).replace('.', ',')}</span>
                      )}

                      <button type="button" className="button_lapis" onClick={() => iniciaEdicaoNota(estudante)}><img src="/lapis.png" alt="Editar" className="icon_lapis"/></button>
                    </div>
                  </td>

                  <td className={`td_frequencia ${!aprovado ? 'text_exame' : ''}`}>
                    {estudante.frequencia}% - Situação: {aprovado ? 'Aprovado' : 'Exame'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}