import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Escola } from "@/types/escola";

export function ListaEscolas({ refreshKey }: { refreshKey: number }) {
  const { accessToken } = useAuth();
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    axios.get<Escola[]>("http://135.181.249.37:4000/api/escolas", {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(res => setEscolas(res.data))
    .catch(err => setError(err.response?.data?.message || "Erro ao buscar escolas"))
    .finally(() => setLoading(false));
  }, [accessToken, refreshKey]);

  if (loading) return <div>Carregando escolas...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Escolas cadastradas</h2>
      <ul className="space-y-2">
        {escolas.map(escola => (
          <li key={escola.id_escola} className="border rounded p-3">
            <strong>{escola.nome_escola}</strong><br />
            {escola.endereco} - {escola.distrito}, {escola.provincia}<br />
            <span className="text-sm text-muted-foreground">{escola.email} | {escola.telefone}</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 