import React, { useState } from 'react';
import { Escola } from '@/types/escola';

interface EscolaFormProps {
  onSubmit: (data: Partial<Escola>) => void;
  onCancel: () => void;
  initialData?: Partial<Escola>;
  isLoading?: boolean;
}

export function EscolaForm({ onSubmit, onCancel, initialData = {}, isLoading = false }: EscolaFormProps) {
  const [form, setForm] = useState({
    nome_escola: initialData.nome_escola || '',
    email: initialData.email || '',
    telefone: initialData.telefone || '',
    endereco: initialData.endereco || '',
    distrito: initialData.distrito || '',
    provincia: initialData.provincia || '',
    nuit: initialData.nuit || '',
    logo_url: initialData.logo_url || '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome_escola || !form.email || !form.nuit || !form.telefone) {
      setError('Os campos Nome da Escola, Email, Telefone e NUIT são obrigatórios.');
      return;
    }
    setError(null);
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome da Escola *</label>
          <input name="nome_escola" value={form.nome_escola} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefone *</label>
          <input name="telefone" value={form.telefone} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">NUIT *</label>
          <input name="nuit" value={form.nuit} onChange={handleChange} className="input" required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Endereço</label>
          <input name="endereco" value={form.endereco} onChange={handleChange} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Distrito</label>
          <input name="distrito" value={form.distrito} onChange={handleChange} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Província</label>
          <input name="provincia" value={form.provincia} onChange={handleChange} className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">URL do Logo</label>
          <input name="logo_url" value={form.logo_url} onChange={handleChange} className="input" />
        </div>
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50">
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
} 