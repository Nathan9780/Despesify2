export function Dashboard() {
  return (
    <main className="px-lateral_padding pb-12 pt-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-card_gap">
        <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-card_gap mb-2">
          {/* Orçamento Total */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex flex-col justify-between h-full hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-label text-label text-on-surface-variant mb-1">Orçamento Total</p>
                <h3 className="font-title text-title text-primary">R$ 1.284.000,00</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span className="font-label text-label">+2.4% este mês</span>
            </div>
          </div>
          
          {/* Gasto este mês */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex flex-col justify-between h-full hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-label text-label text-on-surface-variant mb-1">Gasto este mês</p>
                <h3 className="font-title text-title text-on-surface">R$ 45.210,50</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">payments</span>
              </div>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-1.5 mt-2">
              <div className="bg-secondary h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          {/* Tarefas Pendentes */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex flex-col justify-between h-full hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-label text-label text-on-surface-variant mb-1">Tarefas Pendentes</p>
                <h3 className="font-title text-title text-on-surface">24</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-error-container/50 flex items-center justify-center text-error">
                <span className="material-symbols-outlined">assignment_late</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-error-container text-on-error-container font-label text-[10px]">5 Urgentes</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label text-[10px]">19 Normais</span>
            </div>
          </div>
        </div>

        {/* Projetos Ativos */}
        <div className="col-span-1 md:col-span-8 flex flex-col gap-card_gap">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-subtitle text-subtitle text-on-surface">Projetos Ativos</h3>
            <button className="text-primary font-label text-label hover:underline">Ver todos</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-card_gap">
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden group hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all">
              <div className="h-32 w-full relative bg-primary-fixed-dim">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <span className="absolute top-3 left-3 bg-primary/90 text-on-primary px-2 py-1 rounded font-label text-[10px] uppercase tracking-wider backdrop-blur-sm border border-white/20">Construção</span>
              </div>
              <div className="p-5">
                <h4 className="font-subtitle text-subtitle text-on-surface mb-1">Complexo Azure</h4>
                <p className="font-body text-body text-sm text-on-surface-variant mb-4">Desenvolvimento comercial fase 2</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-label text-label text-on-surface-variant">Progresso</span>
                  <span className="font-label text-label text-primary font-bold">65%</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="mt-4 pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-white flex items-center justify-center text-xs font-label">AB</div>
                    <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-white flex items-center justify-center text-xs font-label">CD</div>
                    <div className="w-8 h-8 rounded-full bg-surface-variant border-2 border-white flex items-center justify-center text-xs font-label">+3</div>
                  </div>
                  <button className="px-button_padding_x py-button_padding_y text-sm font-label text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors">Detalhes</button>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden group hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all">
              <div className="h-32 w-full relative bg-secondary-fixed-dim">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <span className="absolute top-3 left-3 bg-tertiary/90 text-on-tertiary px-2 py-1 rounded font-label text-[10px] uppercase tracking-wider backdrop-blur-sm border border-white/20">Renovação</span>
              </div>
              <div className="p-5">
                <h4 className="font-subtitle text-subtitle text-on-surface mb-1">Loft Distrito Histórico</h4>
                <p className="font-body text-body text-sm text-on-surface-variant mb-4">Conversão residencial premium</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-label text-label text-on-surface-variant">Progresso</span>
                  <span className="font-label text-label text-tertiary font-bold">32%</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2">
                  <div className="bg-tertiary h-2 rounded-full" style={{ width: '32%' }}></div>
                </div>
                <div className="mt-4 pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-white flex items-center justify-center text-xs font-label">EF</div>
                    <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-white flex items-center justify-center text-xs font-label">GH</div>
                  </div>
                  <button className="px-button_padding_x py-button_padding_y text-sm font-label text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors">Detalhes</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fornecedores Locais */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-card_gap">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-subtitle text-subtitle text-on-surface">Fornecedores Locais</h3>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-sm">more_vert</span>
            </button>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden flex flex-col h-full">
            <div className="h-48 w-full bg-surface-container-high relative border-b border-outline-variant/30">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container-lowest/50"></div>
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary rounded-full shadow-md border-2 border-white"></div>
              <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-primary rounded-full shadow-md border-2 border-white"></div>
              <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-secondary rounded-full shadow-md border-2 border-white"></div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 text-primary">
                    <span className="material-symbols-outlined">local_shipping</span>
                  </div>
                  <div>
                    <h5 className="font-label text-label text-on-surface font-bold">Logística Expressa SP</h5>
                    <p className="font-body text-body text-xs text-on-surface-variant">Transporte de materiais pesados</p>
                    <div className="flex items-center gap-1 mt-1 text-primary text-xs">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      <span>2.4 km de distância</span>
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 text-secondary">
                    <span className="material-symbols-outlined">hardware</span>
                  </div>
                  <div>
                    <h5 className="font-label text-label text-on-surface font-bold">Construmais Metais</h5>
                    <p className="font-body text-body text-xs text-on-surface-variant">Aço estrutural e vergalhões</p>
                    <div className="flex items-center gap-1 mt-1 text-on-surface-variant text-xs">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      <span>5.1 km de distância</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low">
              <button className="w-full px-button_padding_x py-button_padding_y bg-primary text-on-primary rounded-lg font-label text-label hover:bg-primary/90 transition-colors shadow-sm">Buscar Fornecedores</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
