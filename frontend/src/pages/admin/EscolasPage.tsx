import { useState } from "react";
import { ListaEscolas } from "@/components/ListaEscolas";
import { EscolaForm } from "@/components/EscolaForm";
import { useAuth } from "@/contexts/AuthContext";
import { Escola } from "@/types/escola";
import axios from "axios";
import { Plus } from "lucide-react";

export function EscolasPage() {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Para forçar o recarregamento da lista
  const { accessToken } = useAuth();

  const handleNewEscola = () => {
    setShowForm(true);
  };

  const handleFormSubmit = async (data: Partial<Escola>) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await axios.post('http://18.206.244.149:4000/api/escolas', data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setShowForm(false);
      setRefreshKey(oldKey => oldKey + 1); // Incrementa a chave para recarregar a lista
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erro ao criar escola.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Escolas</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie as escolas cadastradas no sistema.
          </p>
        </div>
        <button 
          onClick={handleNewEscola}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          Nova Escola
        </button>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <ListaEscolas refreshKey={refreshKey} />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
            <h2 className="text-xl font-bold mb-4">Adicionar Nova Escola</h2>
            <EscolaForm 
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
              isLoading={isSubmitting}
            />
            {formError && <div className="text-red-500 mt-2">{formError}</div>}
            <button 
              onClick={() => setShowForm(false)} 
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 