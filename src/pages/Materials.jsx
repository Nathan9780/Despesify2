export function Materials() {
  return (
    <main className="px-lateral_padding pb-12 pt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-title text-title text-primary">Materiais</h2>
        <button className="bg-primary text-on-primary px-4 py-2 rounded font-label text-label hover:bg-primary/90 transition-colors">
          Cadastrar Material
        </button>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex flex-col items-center justify-center min-h-[300px]">
        <span className="material-symbols-outlined text-[48px] text-outline mb-4">inventory_2</span>
        <h3 className="font-subtitle text-subtitle text-on-surface mb-2">Nenhum material cadastrado</h3>
        <p className="font-body text-body text-on-surface-variant text-center max-w-md">Adicione materiais de construção e equipamentos para controlar os estoques.</p>
      </div>
    </main>
  );
}
