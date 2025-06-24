import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

interface Aluno {
  id_aluno: number;
  nome_completo: string;
}
interface Escola {
  id_escola: number;
  nome_escola: string;
}
interface CategoriaCarta {
  id_categoria: number;
  codigo_categoria: string;
  descricao: string;
}

export function MatriculaForm({ onSuccess, initialAlunoId }: { onSuccess?: () => void, initialAlunoId?: number }) {
  const { accessToken } = useAuth();
  const [form, setForm] = useState({
    id_aluno: initialAlunoId ? String(initialAlunoId) : "",
    id_escola: "",
    id_categoria_carta: "",
    valor_primeira_parcela: "",
    numero_parcelas: 1,
    duracao_contrato_meses: 3,
    data_inicio_curso: "",
  });
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [categorias, setCategorias] = useState<CategoriaCarta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    axios.get<Aluno[]>("http://135.181.249.37:4000/api/alunos", {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(res => setAlunos(res.data));
    axios.get<Escola[]>("http://135.181.249.37:4000/api/escolas", {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(res => setEscolas(res.data));
    axios.get<CategoriaCarta[]>("http://135.181.249.37:4000/api/categorias-carta", {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(res => setCategorias(res.data));
  }, [accessToken]);

  useEffect(() => {
    if (initialAlunoId) {
      setForm((prev) => ({ ...prev, id_aluno: String(initialAlunoId) }));
    }
  }, [initialAlunoId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post("http://135.181.249.37:4000/api/matriculas", {
        ...form,
        id_aluno: Number(form.id_aluno),
        id_escola: Number(form.id_escola),
        id_categoria_carta: Number(form.id_categoria_carta),
        valor_primeira_parcela: Number(form.valor_primeira_parcela),
        numero_parcelas: Number(form.numero_parcelas),
        duracao_contrato_meses: Number(form.duracao_contrato_meses),
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSuccess("Matrícula criada com sucesso!");
      setForm({
        id_aluno: initialAlunoId ? String(initialAlunoId) : "",
        id_escola: "",
        id_categoria_carta: "",
        valor_primeira_parcela: "",
        numero_parcelas: 1,
        duracao_contrato_meses: 3,
        data_inicio_curso: "",
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao criar matrícula.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Aluno *</label>
          <select name="id_aluno" value={form.id_aluno} onChange={handleChange} required className="input" disabled={!!initialAlunoId}>
            <option value="">Selecione o aluno</option>
            {alunos.map(a => (
              <option key={a.id_aluno} value={a.id_aluno}>{a.nome_completo}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Escola *</label>
          <select name="id_escola" value={form.id_escola} onChange={handleChange} required className="input">
            <option value="">Selecione a escola</option>
            {escolas.map(e => (
              <option key={e.id_escola} value={e.id_escola}>{e.nome_escola}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoria da Carta *</label>
          <select name="id_categoria_carta" value={form.id_categoria_carta} onChange={handleChange} required className="input">
            <option value="">Selecione a categoria</option>
            {categorias.map(c => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.codigo_categoria} - {c.descricao}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Valor 1ª Parcela *</label>
          <input name="valor_primeira_parcela" value={form.valor_primeira_parcela} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Número de Parcelas</label>
          <input name="numero_parcelas" type="number" min={1} max={3} value={form.numero_parcelas} onChange={handleChange} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Duração do Contrato (meses)</label>
          <input name="duracao_contrato_meses" type="number" min={1} max={6} value={form.duracao_contrato_meses} onChange={handleChange} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data de Início</label>
          <input name="data_inicio_curso" type="date" value={form.data_inicio_curso} onChange={handleChange} className="input" />
        </div>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? "Salvando..." : "Criar Matrícula"}
      </button>
    </form>
  );
} 