export function Settings() {
  return (
    <main className="p-lateral_padding flex flex-col lg:flex-row gap-card_gap max-w-7xl mx-auto w-full">
      <aside className="w-full lg:w-64 flex-shrink-0">
        <div className="flex flex-col gap-1 sticky top-[94px]">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-container/10 text-primary font-label text-label transition-colors">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            Perfil
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label text-label transition-colors">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            Faturamento
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label text-label transition-colors">
            <span className="material-symbols-outlined text-[20px]">notifications_active</span>
            Notificações
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label text-label transition-colors">
            <span className="material-symbols-outlined text-[20px]">security</span>
            Segurança
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label text-label transition-colors">
            <span className="material-symbols-outlined text-[20px]">palette</span>
            Aparência
          </a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col gap-card_gap">
        <section className="bg-surface rounded-lg shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="border-b border-outline-variant bg-surface-container-lowest px-6 py-4">
            <h3 className="font-subtitle text-subtitle text-on-surface">Gerenciamento de Perfil</h3>
            <p className="font-body text-body text-on-surface-variant mt-1">Atualize sua foto e detalhes pessoais aqui.</p>
          </div>
          <div className="p-6 flex flex-col gap-8 bg-surface-container-lowest">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-outline-variant bg-surface-variant flex items-center justify-center relative group cursor-pointer">
                <span className="material-symbols-outlined text-[40px] text-on-surface-variant">person</span>
                <div className="absolute inset-0 bg-on-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-on-secondary">photo_camera</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label text-label px-button_padding_x py-button_padding_y rounded transition-colors w-fit border border-outline-variant">
                  Alterar Foto
                </button>
                <p className="font-body text-[12px] text-on-surface-variant">JPG, GIF ou PNG. Máximo de 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-on-surface">Nome Completo</label>
                <input type="text" defaultValue="Carlos Eduardo Silva" className="bg-surface border border-outline-variant rounded px-4 py-2 font-body text-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-on-surface">E-mail</label>
                <input type="email" defaultValue="carlos.silva@despesify.com" className="bg-surface border border-outline-variant rounded px-4 py-2 font-body text-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-on-surface">Cargo</label>
                <input type="text" defaultValue="Financial Project Manager" className="bg-surface border border-outline-variant rounded px-4 py-2 font-body text-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-on-surface">Localização</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">location_on</span>
                  <input type="text" defaultValue="São Paulo, Brasil" className="bg-surface border border-outline-variant rounded pl-10 pr-4 py-2 font-body text-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors w-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-outline-variant bg-surface px-6 py-4 flex justify-end">
            <button className="bg-primary hover:bg-primary-container text-on-primary font-label text-label px-button_padding_x py-button_padding_y rounded shadow-sm transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Salvar Alterações
            </button>
          </div>
        </section>

        <section className="bg-surface rounded-lg shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="border-b border-outline-variant bg-surface-container-lowest px-6 py-4">
            <h3 className="font-subtitle text-subtitle text-on-surface">Segurança</h3>
            <p className="font-body text-body text-on-surface-variant mt-1">Gerencie sua senha e configurações de autenticação.</p>
          </div>
          <div className="flex flex-col divide-y divide-outline-variant bg-surface-container-lowest">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-label text-label text-on-surface font-bold">Senha da Conta</h4>
                <p className="font-body text-body text-on-surface-variant mt-1">É recomendável usar uma senha forte que você não esteja usando em nenhum outro lugar.</p>
              </div>
              <button className="bg-transparent border border-outline hover:border-primary text-primary font-label text-label px-button_padding_x py-button_padding_y rounded transition-colors whitespace-nowrap">
                Alterar Senha
              </button>
            </div>
            
            <div className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-label text-label text-on-surface font-bold">Autenticação em Duas Etapas (2FA)</h4>
                  <span className="bg-secondary-container text-on-secondary-container font-label text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Ativado
                  </span>
                </div>
                <p className="font-body text-body text-on-surface-variant mt-1 max-w-2xl">Adiciona uma camada extra de segurança à sua conta. Sempre que você fizer login, será necessário fornecer um código de segurança gerado pelo seu aplicativo autenticador.</p>
              </div>
              <button className="bg-surface-container hover:bg-surface-container-high text-on-surface font-label text-label px-button_padding_x py-button_padding_y rounded border border-outline-variant transition-colors whitespace-nowrap mt-2 sm:mt-0">
                Desativar 2FA
              </button>
            </div>
            
            <div className="p-6">
              <h4 className="font-label text-label text-on-surface font-bold mb-4">Sessões Ativas</h4>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 bg-surface rounded p-3 border border-outline-variant/50">
                  <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">computer</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-label text-label text-on-surface">Mac OS Safari</p>
                    <p className="font-body text-[12px] text-on-surface-variant">São Paulo, BR • Ativo agora</p>
                  </div>
                  <span className="text-primary font-label text-label text-[12px]">Sessão Atual</span>
                </div>
                <div className="flex items-center gap-4 bg-surface rounded p-3 border border-outline-variant/50">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined">smartphone</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-label text-label text-on-surface">iPhone 13 Pro</p>
                    <p className="font-body text-[12px] text-on-surface-variant">São Paulo, BR • Último acesso ontem às 14:30</p>
                  </div>
                  <button className="text-error hover:text-on-error-container font-label text-label transition-colors">Revogar</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-error-container/10 rounded-lg shadow-sm border border-error-container/30 overflow-hidden mt-4">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-subtitle text-subtitle text-error flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Zona de Perigo
              </h3>
              <p className="font-body text-body text-on-surface-variant mt-1">Uma vez que você excluir sua conta, não há volta. Por favor, tenha certeza.</p>
            </div>
            <button className="bg-error hover:bg-on-error-container text-on-error font-label text-label px-button_padding_x py-button_padding_y rounded transition-colors whitespace-nowrap shadow-sm">
              Excluir Conta
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
