window.teamApp = window.teamApp || {};
window.teamApp.currentDeletingPlayerId = null;
window.teamApp.currentViewingPlayer = null;
let isSubmitting = false;
let currentPlayers = [];
let currentViewingPlayer = null;
let currentDeletingPlayerId = null;

const teamColors = {
    'Atlanta Hawks': 'from-red-600 to-yellow-400',
    'Boston Celtics': 'from-green-700 to-gray-100',
    'Brooklyn Nets': 'from-black to-gray-500',
    'Charlotte Hornets': 'from-teal-500 to-purple-700',
    'Chicago Bulls': 'from-red-700 to-black',
    'Cleveland Cavaliers': 'from-purple-900 to-gold-500',
    'Detroit Pistons': 'from-blue-700 to-crimson-600',
    'Indiana Pacers': 'from-yellow-500 to-navy-800',
    'Miami Heat': 'from-red-700 to-orange-600',
    'Milwaukee Bucks': 'from-green-800 to-cream-100',
    'New York Knicks': 'from-blue-700 to-orange-500',
    'Orlando Magic': 'from-blue-800 to-silver-400',
    'Philadelphia 76ers': 'from-blue-700 to-red-500',
    'Toronto Raptors': 'from-red-700 to-charcoal-800',
    'Washington Wizards': 'from-blue-700 to-silver-300',
    'Dallas Mavericks': 'from-navy-900 to-silver-300',
    'Denver Nuggets': 'from-navy-900 to-gold-500',
    'Golden State Warriors': 'from-blue-700 to-yellow-400',
    'Houston Rockets': 'from-red-700 to-steel-400',
    'Los Angeles Clippers': 'from-blue-700 to-red-600',
    'Los Angeles Lakers': 'from-purple-700 to-yellow-500',
    'Memphis Grizzlies': 'from-blue-800 to-sky-400',
    'Minnesota Timberwolves': 'from-navy-900 to-lime-500',
    'New Orleans Pelicans': 'from-navy-900 to-red-600',
    'Oklahoma City Thunder': 'from-blue-600 to-orange-400',
    'Phoenix Suns': 'from-purple-700 to-orange-500',
    'Portland Trail Blazers': 'from-crimson-700 to-black',
    'Sacramento Kings': 'from-purple-700 to-silver-400',
    'San Antonio Spurs': 'from-black to-silver-400',
    'Utah Jazz': 'from-navy-900 to-yellow-400',
    'Default': 'from-gray-600 to-gray-800'
};

window.teamApp.openViewModal = function(player) {
    if (!player) {
        console.error('Nenhum jogador fornecido para visualização');
        window.teamApp.showToast('Erro ao carregar dados do jogador', 'error');
        return;
    }
    
    try {
        // Armazena o jogador atual para referência futura
        window.teamApp.currentViewingPlayer = player;
        const modal = document.getElementById('viewPlayerModal');
        
        if (!modal) {
            console.error('Modal de visualização não encontrado no DOM');
            return;
        }
        
        // Esconde o modal primeiro para garantir que as animações funcionem corretamente
        modal.classList.add('hidden');
        
        // Configura o gradiente do cabeçalho baseado no time
        const gradient = teamColors[player.team] || 'from-gray-600 to-gray-800';
        const header = modal.querySelector('.modal-header');
        if (header) {
            // Remove classes de gradiente antigas e adiciona a nova
            header.className = 'modal-header p-6 pb-4 border-b border-gray-200 dark:border-gray-700';
            
            // Adiciona as classes de gradiente e fundo
            const [fromColor, toColor] = gradient.split(' ');
            header.style.backgroundImage = `linear-gradient(to right, var(--${fromColor.replace('from-', '')}), var(--${toColor.replace('to-', '')})`;
        }
        
        // Função auxiliar para definir o conteúdo de um elemento
        const setTextContent = (selector, text, fallback = 'Não informado', isHtml = false) => {
            const element = modal.querySelector(selector);
            if (element) {
                if (isHtml) {
                    element.innerHTML = text !== undefined && text !== null && text !== '' ? text : fallback;
                } else {
                    element.textContent = text !== undefined && text !== null && text !== '' ? text : fallback;
                }
                // Adiciona classe de opacidade reduzida para valores não informados
                if (!text) {
                    element.classList.add('opacity-70');
                } else {
                    element.classList.remove('opacity-70');
                }
            }
        };
        
        // Função para formatar valores numéricos
        const formatNumber = (value, suffix = '') => {
            if (value === undefined || value === null || value === '') return 'Não informado';
            return `${value}${suffix}`;
        };
        
        // Mapeia as posições para nomes amigáveis
        const positionNames = {
            'PG': 'Armador',
            'SG': 'Ala-armador',
            'SF': 'Ala',
            'PF': 'Ala-pivô',
            'C': 'Pivô',
            'G': 'Armador',
            'F': 'Ala',
            'F-C': 'Ala-pivô',
            'G-F': 'Ala-armador',
            'C-F': 'Pivô/Ala-pivô'
        };
        
        const positionText = positionNames[player.position] || player.position || 'Posição não informada';
        
        const formatDate = (dateString) => {
            if (!dateString) return 'Data não disponível';
            try {
                const date = new Date(dateString);
                return new Intl.DateTimeFormat('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                }).format(date);
            } catch (e) {
                console.error('Erro ao formatar data:', e);
                return 'Data não disponível';
            }
        };        

        // Preenche os dados do jogador
        setTextContent('#viewPlayerName', player.name || 'Jogador sem nome');
        setTextContent('#viewPlayerTeam', player.team || 'Time não informado');
        setTextContent('#viewPlayerTeamName', player.team || 'Time não informado');
        setTextContent('#viewPlayerAge', (player.age !== undefined && player.age !== null) ? `${player.age} anos` : 'Idade não informada');
        setTextContent('#viewPlayerAgeDetail', (player.age !== undefined && player.age !== null) ? `${player.age} anos` : 'Idade não informada');
        setTextContent('#viewPlayerNumber', (player.number !== undefined && player.number !== null) ? `#${player.number}` : '-', '-');
        setTextContent('#viewPlayerHeight', (player.height !== undefined && player.height !== null) ? `${player.height.toString().replace('.', ',')} m` : 'Não informado');
        setTextContent('#viewPlayerWeight', (player.weight !== undefined && player.weight !== null) ? `${player.weight} kg` : 'Não informado');
        setTextContent('#viewPlayerPosition', positionText);
        setTextContent('#viewPlayerMainPosition', positionText);
        
        // Atualiza a data de cadastro na seção de detalhes
        setTextContent('#viewPlayerCreatedAt', formatDate(player.created_at) || 'Não informada');
        
        // Atualiza a cor do indicador do time
        const teamIndicator = modal.querySelector('.modal-header .w-4');
        if (teamIndicator && gradient) {
            const colorClass = gradient.split(' ')[1]; // Pega a classe de cor do gradiente
            teamIndicator.className = 'w-4 h-4 rounded-full';
            teamIndicator.classList.add(colorClass.replace('to-', 'bg-'));
        }
        
        // Mostra o modal com animação
        modal.classList.remove('hidden');
        
        // Força o navegador a recalcular o layout
        void modal.offsetWidth;
        
        // Anima a entrada do modal
        modal.classList.add('opacity-100');
        const content = document.getElementById('viewModalContent');
        if (content) {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }
        
        // Foca no botão de fechar para melhor acessibilidade
        const closeButton = modal.querySelector('button[onclick*="closeViewModal"]');
        if (closeButton) {
            setTimeout(() => closeButton.focus(), 100);
        }
    } catch (error) {
        console.error('Erro ao abrir modal de visualização:', error);
        window.teamApp.showToast('Erro ao carregar os dados do jogador', 'error');
    }
}

window.teamApp.closeViewModal = function() {
    try {
        const modal = document.getElementById('viewPlayerModal');
        if (!modal || !modal.classList.contains('opacity-100')) return;
        
        const content = document.getElementById('viewModalContent');
        if (!content) return;
        
        // Anima a saída do modal
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
        
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        
        // Remove o modal do DOM após a animação
        setTimeout(() => {
            if (modal) {
                modal.classList.add('hidden');
            }
            // Limpa o jogador atual após fechar o modal
            window.teamApp.currentViewingPlayer = null;
            
            // Retorna o foco para o botão que abriu o modal
            const lastFocusedElement = document.activeElement;
            if (lastFocusedElement && lastFocusedElement.matches('button[onclick*="openViewModal"]')) {
                lastFocusedElement.focus();
            }
        }, 250); // Tempo menor para uma transição mais rápida
    } catch (error) {
        console.error('Erro ao fechar modal de visualização:', error);
    }
}

window.teamApp.editCurrentPlayer = function() {
    // Tenta obter o jogador atual de diferentes fontes
    const player = window.teamApp.currentViewingPlayer || 
                 (window.teamApp.currentPlayers && window.teamApp.currentPlayers.length > 0 ? 
                  window.teamApp.currentPlayers[0] : null);
    
    if (!player) {
        console.error('Nenhum jogador selecionado para edição');
        window.teamApp.showToast('Nenhum jogador selecionado para edição', 'error');
        return;
    }
    
    // Fecha o modal de visualização se estiver aberto
    if (document.getElementById('viewPlayerModal')?.classList.contains('opacity-100')) {
        window.teamApp.closeViewModal();
    }
    
    // Pequeno atraso para garantir que a animação de fechamento termine
    setTimeout(() => {
        try {
            window.teamApp.openEditModal(player);
        } catch (error) {
            console.error('Erro ao abrir o modal de edição:', error);
            window.teamApp.showToast('Erro ao abrir o formulário de edição', 'error');
            
            // Tenta reabrir o modal de visualização se houver um jogador
            if (player) {
                setTimeout(() => {
                    try {
                        window.teamApp.openViewModal(player);
                    } catch (e) {
                        console.error('Erro ao reabrir o modal de visualização:', e);
                    }
                }, 100);
            }
        }
    }, 200);
};

window.teamApp.showDeleteConfirmation = function(player) {
    // Verifica se há um jogador para excluir
    if (!player) {
        console.error('Nenhum jogador selecionado para exclusão');
        window.teamApp.showToast('Nenhum jogador selecionado para exclusão', 'error');
        return;
    }
    
    // Armazena o jogador atual e o ID para referência
    window.teamApp.currentViewingPlayer = player;
    window.teamApp.currentDeletingPlayerId = player.id;
    
    // Fecha o modal de visualização se estiver aberto
    const viewModal = document.getElementById('viewPlayerModal');
    if (viewModal && viewModal.classList.contains('opacity-100')) {
        window.teamApp.closeViewModal();
    }
    
    // Remove qualquer modal de confirmação existente
    const existingModal = document.getElementById('deleteConfirmationModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Cria o novo modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 opacity-0';
    modal.id = 'deleteConfirmationModal';
    modal.setAttribute('data-player-id', player.id);
    
    // Configura o fechamento ao clicar fora do conteúdo
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            window.teamApp.closeDeleteConfirmation();
        }
    });
    
    // Configura o fechamento com a tecla ESC
    const handleEscKey = (e) => {
        if (e.key === 'Escape') {
            window.teamApp.closeDeleteConfirmation();
        }
    };
    
    // Armazena a referência para remover o event listener depois
    modal._handleEscKey = handleEscKey;
    
    modal.innerHTML = `
        <div class="bg-gray-900/95 border border-red-500/30 rounded-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all duration-300 scale-95 opacity-0 shadow-2xl" id="deleteConfirmationContent">
            <div class="p-6">
                <div class="text-center">
                    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100/10 mb-4">
                        <svg class="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">Confirmar exclusão</h3>
                    <p class="text-gray-300 mb-6">Tem certeza que deseja excluir <span class="font-semibold text-white">${player.name || 'este jogador'}</span>? Esta ação não pode ser desfeita.</p>
                </div>
                
                <div class="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                    <button type="button" id="cancelDeleteBtn" class="px-5 py-2.5 text-gray-300 hover:bg-gray-800/50 rounded-xl transition-all border border-gray-700/50 hover:border-gray-600/70 hover:shadow-lg hover:shadow-gray-900/10 flex-1">
                        Cancelar
                    </button>
                    <button type="button" id="confirmDeleteBtn" class="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl transition-all flex items-center justify-center">
                        <span id="deleteButtonText">Sim, excluir</span>
                        <span id="deleteSpinner" class="hidden ml-2">
                            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Adiciona o modal ao corpo do documento
    document.body.appendChild(modal);
    
    // Configura os event listeners dos botões
    const confirmBtn = modal.querySelector('#confirmDeleteBtn');
    const cancelBtn = modal.querySelector('#cancelDeleteBtn');
    const deleteButtonText = modal.querySelector('#deleteButtonText');
    const deleteSpinner = modal.querySelector('#deleteSpinner');
    
    // Configura o botão de cancelar
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.teamApp.closeDeleteConfirmation();
        });
    }
    
    // Configura o botão de confirmar
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            try {
                // Mostra o spinner e desabilita o botão
                if (deleteButtonText && deleteSpinner) {
                    deleteButtonText.textContent = 'Excluindo...';
                    deleteSpinner.classList.remove('hidden');
                }
                confirmBtn.disabled = true;
                if (cancelBtn) cancelBtn.disabled = true;
                
                // Executa a exclusão
                await window.teamApp.confirmDeletePlayer();
                
                // Fecha o modal após a exclusão bem-sucedida
                window.teamApp.closeDeleteConfirmation();
            } catch (error) {
                console.error('Erro ao excluir jogador:', error);
                window.teamApp.showToast('Erro ao excluir o jogador', 'error');
                
                // Restaura o botão
                if (deleteButtonText && deleteSpinner) {
                    deleteButtonText.textContent = 'Sim, excluir';
                    deleteSpinner.classList.add('hidden');
                }
                confirmBtn.disabled = false;
                if (cancelBtn) cancelBtn.disabled = false;
            }
        });
    }
    
    // Adiciona o event listener para a tecla ESC
    document.addEventListener('keydown', handleEscKey);
    
    // Força o navegador a recalcular o layout
    void modal.offsetWidth;
    
    // Mostra o modal com animação
    modal.classList.remove('opacity-0');
    modal.classList.add('opacity-100');
    
    const content = modal.querySelector('#deleteConfirmationContent');
    if (content) {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }
    
    // Foca no botão de cancelar por padrão para melhor acessibilidade
    if (cancelBtn) {
        setTimeout(() => cancelBtn.focus(), 100);
    }
    
    // Configura um observer para limpar os event listeners quando o modal for removido
    const observer = new MutationObserver((mutations) => {
        if (!document.body.contains(modal)) {
            document.removeEventListener('keydown', handleEscKey);
            observer.disconnect();
        }
    });
    
    observer.observe(document.body, { childList: true });
}

window.teamApp.closeDeleteConfirmation = function() {
    const modal = document.getElementById('deleteConfirmationModal');
    if (!modal || !modal.classList.contains('opacity-100')) return;
    
    const content = modal.querySelector('#deleteConfirmationContent');
    if (content) {
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
    }
    
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    
    // Remove o event listener de teclado se existir
    if (modal._handleEscKey) {
        document.removeEventListener('keydown', modal._handleEscKey);
        delete modal._handleEscKey;
    }
    
    // Adiciona uma transição suave antes de ocultar o modal
    setTimeout(() => {
        modal.classList.add('hidden');
        
        // Retorna o foco para o botão que abriu o modal de confirmação
        const lastFocusedElement = document.activeElement;
        const viewButton = document.querySelector('button[onclick*="openViewModal"]:focus');
        if (viewButton) {
            viewButton.focus();
        } else if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
        
        // Tenta reabrir o modal de visualização se existir
        if (window.teamApp.currentViewingPlayer) {
            setTimeout(() => {
                try {
                    window.teamApp.openViewModal(window.teamApp.currentViewingPlayer);
                } catch (e) {
                    console.error('Erro ao reabrir o modal de visualização:', e);
                }
            }, 100);
        }
    }, 200); // Tempo menor para uma transição mais rápida
};

window.teamApp.openAddModal = function() {
    try {
        const playerIdEl = document.getElementById('playerId');
        const playerForm = document.getElementById('playerForm');
        const modalTitle = document.getElementById('modalTitle');
        const playerModal = document.getElementById('playerModal');
        
        if (playerIdEl) playerIdEl.value = '';
        if (playerForm) playerForm.reset();
        if (modalTitle) modalTitle.textContent = 'Adicionar Jogador';
        if (playerModal) playerModal.classList.remove('hidden');
        
        setTimeout(() => {
            const nameField = document.getElementById('name');
            if (nameField) nameField.focus();
        }, 100);
    } catch (error) {
        console.error('Erro ao abrir modal de adicionar:', error);
    }
}

window.teamApp.openEditModal = function(player) {
    if (!player) {
        console.error('Nenhum jogador fornecido para edição');
        window.teamApp.showToast('Erro ao carregar dados do jogador para edição', 'error');
        return;
    }
    
    // Prepara os dados do jogador, garantindo que valores nulos/indefinidos sejam tratados
    const playerData = {
        id: player.id || '',
        name: player.name || '',
        age: player.age !== undefined && player.age !== null ? player.age : '',
        number: player.number !== undefined && player.number !== null ? player.number : '',
        position: player.position || 'SF', // Valor padrão SF (Small Forward)
        team: player.team || '',
        height: player.height !== undefined && player.height !== null ? player.height : '',
        weight: player.weight !== undefined && player.weight !== null ? player.weight : ''
    };
    
    // Armazena o jogador atual para referência futura
    window.teamApp.currentEditingPlayer = playerData;
    
    try {
        const modal = document.getElementById('playerModal');
        if (!modal) {
            console.error('Modal de edição não encontrado no DOM');
            window.teamApp.showToast('Erro ao abrir o formulário de edição', 'error');
            return;
        }
        
        // Atualiza o título do modal
        const modalTitle = modal.querySelector('#modalTitle');
        if (modalTitle) {
            modalTitle.textContent = playerData.id ? 'Editar Jogador' : 'Adicionar Jogador';
        }
        
        // Atualiza o texto do botão de envio
        const submitBtn = modal.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = `
                <span class="flex items-center justify-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    ${playerData.id ? 'Atualizar Jogador' : 'Adicionar Jogador'}
                </span>`;
        }
        
        // Obtém o formulário
        const form = document.getElementById('playerForm');
        if (!form) {
            console.error('Formulário não encontrado no modal');
            return;
        }
        
        // Reseta o formulário
        form.reset();
        
        /**
         * Formata um valor numérico para exibição, convertendo ponto para vírgula
         * @param {number|string} value - Valor a ser formatado
         * @param {boolean} [allowEmpty=true] - Se true, retorna string vazia para valores vazios/nulos
         * @returns {string} Valor formatado com vírgula como separador decimal
         */
        const formatDecimal = (value, allowEmpty = true) => {
            // Se o valor for nulo, indefinido ou string vazia, retorna vazio ou o valor original
            if (value === null || value === undefined || value === '') {
                return allowEmpty ? '' : value;
            }
            
            // Converte para string e remove quaisquer caracteres que não sejam dígitos, vírgula ou ponto
            let strValue = String(value).replace(/[^\d,.-]/g, '');
            
            // Se não houver números, retorna vazio
            if (!/\d/.test(strValue)) {
                return '';
            }
            
            // Substitui vírgula por ponto para processamento interno
            strValue = strValue.replace(',', '.');
            
            // Converte para número
            const numValue = parseFloat(strValue);
            
            // Se não for um número válido, retorna o valor original
            if (isNaN(numValue)) {
                return String(value).replace(/\./g, ',');
            }
            
            // Formata o número com até 2 casas decimais e substitui ponto por vírgula
            return numValue.toFixed(2).replace(/\./g, ',');
        };
        
        /**
         * Define o valor de um campo do formulário, tratando diferentes tipos de campos
         * @param {string} name - Nome do campo
         * @param {any} value - Valor a ser definido
         * @param {boolean} [triggerEvents=true] - Se deve disparar eventos de validação
         */
        const setFormValue = (name, value, triggerEvents = true) => {
            const element = form.querySelector(`[name="${name}"]`);
            if (!element) return;
            
            // Remove classes de erro ao definir um novo valor
            element.classList.remove('border-red-500', 'border-gray-600');
            
            // Remove mensagens de erro associadas
            const errorElement = element.parentElement?.querySelector('.field-error');
            if (errorElement) {
                errorElement.remove();
            }
            
            // Trata diferentes tipos de campos
            switch (element.type) {
                case 'checkbox':
                case 'radio':
                    element.checked = element.value === String(value);
                    break;
                    
                case 'select-one':
                case 'select-multiple':
                    const option = Array.from(element.options).find(opt => opt.value === String(value));
                    if (option) {
                        option.selected = true;
                        // Dispara evento de mudança para select2 se estiver em uso
                        if (window.jQuery && element.matches('.select2-hidden-accessible')) {
                            window.jQuery(element).trigger('change');
                        }
                    }
                    break;
                    
                case 'number':
                    // Para campos numéricos, converte para número e formata
                    if (value === null || value === undefined || value === '') {
                        element.value = '';
                    } else {
                        const numValue = parseFloat(String(value).replace(',', '.'));
                        element.value = isNaN(numValue) ? '' : numValue;
                    }
                    break;
                    
                case 'date':
                    // Para campos de data, formata para YYYY-MM-DD
                    if (value instanceof Date) {
                        element.value = value.toISOString().split('T')[0];
                    } else if (value) {
                        // Tenta converter string de data para o formato correto
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                            element.value = date.toISOString().split('T')[0];
                        } else {
                            element.value = value;
                        }
                    } else {
                        element.value = '';
                    }
                    break;
                    
                default:
                    // Para campos de texto e outros tipos
                    if (value === null || value === undefined) {
                        element.value = '';
                    } else if (name === 'height' || name === 'weight') {
                        // Campos de altura e peso são formatados com vírgula
                        element.value = formatDecimal(value, false);
                    } else {
                        element.value = String(value);
                    }
            }
            
            // Dispara eventos para ativar validação e atualizar interfaces
            if (triggerEvents) {
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Dispara evento personalizado para notificar outros scripts
                element.dispatchEvent(new CustomEvent('value-set', { 
                    bubbles: true,
                    detail: { name, value }
                }));
            }
        };
        
        // Define o ID do jogador no campo oculto
        if (playerData.id) {
            const idField = document.getElementById('playerId');
            if (idField) idField.value = playerData.id;
        }
        
        // Preenche os campos do formulário
        setFormValue('name', playerData.name);
        setFormValue('age', playerData.age);
        setFormValue('number', playerData.number);
        setFormValue('position', playerData.position);
        setFormValue('team', playerData.team);
        setFormValue('height', playerData.height);
        setFormValue('weight', playerData.weight);
        
        // Função para validar campos
        const validateField = (name) => {
            const element = form.querySelector(`[name="${name}"]`);
            if (element) {
                element.classList.remove('border-red-500', 'border-gray-600');
                if (element.value) {
                    element.classList.add('border-green-500');
                }
                element.dispatchEvent(new Event('blur'));
            }
        };
        
        ['name', 'position', 'team'].forEach(validateField);
        
        modal.classList.remove('hidden');
        
        setTimeout(() => {
            const nameField = document.getElementById('name');
            if (nameField) nameField.focus();
            
            ['name', 'position', 'team'].forEach(validateField);
            
            setTimeout(() => {
                const firstInput = modal.querySelector('input, select, textarea');
                if (firstInput) firstInput.focus();
            }, 50);
        }, 100);
        
    } catch (error) {
        console.error('Erro ao abrir modal de edição:', error);
        window.teamApp.showToast('Erro ao abrir o formulário de edição', 'error');
        
        if (player && player.id) {
            setTimeout(() => {
                try {
                    window.teamApp.openViewModal(player);
                } catch (e) {
                    console.error('Erro ao reabrir o modal de visualização:', e);
                }
            }, 100);
        }
    }
}

window.teamApp.closeModal = function() {
    try {
        const modal = document.getElementById('playerModal');
        if (!modal) {
            console.error('Modal de edição não encontrado');
            return;
        }
        
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('opacity-0');
            
            const form = document.getElementById('playerForm');
            if (form) form.reset();
            
            const inputs = modal.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.classList.remove('border-red-500', 'border-green-500');
            });
            
            const errorMessages = modal.querySelectorAll('.field-error');
            errorMessages.forEach(msg => msg.remove());
            
            isSubmitting = false;
            window.teamApp.resetSubmitButton();
            
            void modal.offsetWidth;
        }, 200);
    } catch (error) {
        console.error('Erro ao fechar modal de edição:', error);
    }
}

window.teamApp.setSubmitLoading = function(loading) {
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');

    if (!submitBtn || !submitText || !submitLoader) {
        console.warn('Elementos do botão de submit não encontrados');
        return;
    }
    
    if (loading) {
        submitBtn.disabled = true;
        if (submitText) submitText.classList.add('hidden');
        if (submitLoader) submitLoader.classList.remove('hidden');
    } else {
        submitBtn.disabled = false;
        if (submitText) submitText.classList.remove('hidden');
        if (submitLoader) submitLoader.classList.add('hidden');
    }
}


window.teamApp.markFieldAsInvalid = function(fieldId, isInvalid, customMessage) {

    const field = fieldId.startsWith('#') || fieldId.startsWith('.')
        ? document.querySelector(fieldId)
        : document.getElementById(fieldId);
        
    if (!field) {
        console.warn(`Campo não encontrado: ${fieldId}`);
        return;
    }

    const parent = field.closest('.form-group') || field.closest('.relative') || field.parentElement;
    const isCheckOrRadio = field.type === 'checkbox' || field.type === 'radio';
    const isSelect = field.tagName === 'SELECT';
    
    const existingError = parent?.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    if (isInvalid) {
        const errorMessage = typeof isInvalid === 'string' ? isInvalid : customMessage;
        
        if (isCheckOrRadio) {
            field.classList.add('text-red-500');
        } else if (isSelect) {
            field.classList.add('border-red-500', 'bg-red-50');
            field.classList.remove('border-gray-300', 'bg-white');
        } else {
            field.classList.add('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
            field.classList.remove('border-gray-300', 'focus:ring-blue-500', 'focus:border-blue-500');
        }
        
        if (errorMessage && parent) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'mt-1 text-sm text-red-600 field-error';
            errorDiv.textContent = errorMessage;
            
            if (field.nextSibling) {
                parent.insertBefore(errorDiv, field.nextSibling);
            } else {
                parent.appendChild(errorDiv);
            }
            
            errorDiv.id = `${field.id || field.name || 'field'}-error`;
            field.setAttribute('aria-describedby', errorDiv.id);
        }
        
        field.setAttribute('aria-invalid', 'true');
        
        if (typeof isInvalid === 'string' || customMessage) {
            field.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            if (!document.activeElement.isSameNode(field)) {
                field.focus({ preventScroll: true });
            }
        }
    } 
    else {
        if (isCheckOrRadio) {
            field.classList.remove('text-red-500');
        } else if (isSelect) {
            field.classList.remove('border-red-500', 'bg-red-50');
            field.classList.add('border-gray-300', 'bg-white');
        } else {
            field.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
            field.classList.add('border-gray-300', 'focus:ring-blue-500', 'focus:border-blue-500');
        }

        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
    }
};

window.teamApp.resetSubmitButton = function() {
    window.teamApp.setSubmitLoading(false);
}

window.teamApp.validatePlayerData = function(playerData) {
    const errors = [];
    
    // Validação do nome
    if (!playerData.name || playerData.name.trim().length < 2) {
        errors.push('O nome deve ter pelo menos 2 caracteres');
        this.markFieldAsInvalid('name', true);
    } else if (playerData.name.length > 100) {
        errors.push('O nome não pode ter mais de 100 caracteres');
        this.markFieldAsInvalid('name', true);
    } else {
        this.markFieldAsInvalid('name', false);
    }
    
    // Validação da idade
    const age = parseInt(playerData.age, 10);
    if (isNaN(age) || age < 18 || age > 45) {
        errors.push('A idade deve estar entre 18 e 45 anos');
        this.markFieldAsInvalid('age', true);
    } else {
        this.markFieldAsInvalid('age', false);
    }
    
    // Validação do número da camisa
    const number = parseInt(playerData.number, 10);
    if (isNaN(number) || number < 0 || number > 99) {
        errors.push('O número da camisa deve estar entre 0 e 99');
        this.markFieldAsInvalid('number', true);
    } else {
        this.markFieldAsInvalid('number', false);
    }
    
    // Validação da posição
    if (!playerData.position) {
        errors.push('A posição é obrigatória');
        this.markFieldAsInvalid('position', true);
    } else {
        this.markFieldAsInvalid('position', false);
    }
    
    // Validação do time
    if (!playerData.team) {
        errors.push('O time é obrigatório');
        this.markFieldAsInvalid('team', true);
    } else {
        this.markFieldAsInvalid('team', false);
    }
    
    // Validação da altura
    const height = parseFloat(playerData.height);
    if (isNaN(height) || height < 1.60 || height > 2.30) {
        errors.push('A altura deve estar entre 1,60m e 2,30m');
        this.markFieldAsInvalid('height', true);
    } else {
        this.markFieldAsInvalid('height', false);
    }
    
    // Validação do peso
    const weight = parseFloat(playerData.weight);
    if (isNaN(weight) || weight < 40 || weight > 200) {
        errors.push('O peso deve estar entre 40kg e 200kg');
        this.markFieldAsInvalid('weight', true);
    } else {
        this.markFieldAsInvalid('weight', false);
    }
    
    return errors;
}

window.teamApp.fetchPlayers = async function() {
    try {
        const response = await fetch('/api/players', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error(`Erro ao carregar jogadores: ${response.status}`);
        }
        
        const data = await response.json();
        currentPlayers = Array.isArray(data) ? data : [];
        return currentPlayers;
    } catch (error) {
        console.error('Erro ao buscar jogadores:', error);
        window.teamApp.showToast('Erro ao carregar jogadores', 'error');
        return [];
    }
}

window.teamApp.deletePlayer = function(playerId) {
    // Se não receber um playerId, tenta usar o currentViewingPlayer
    if (!playerId && !window.teamApp.currentViewingPlayer) {
        console.error('ID do jogador não fornecido');
        window.teamApp.showToast('Erro ao identificar o jogador para exclusão', 'error');
        return;
    }
    
    // Se tiver um playerId, mas não tiver o currentViewingPlayer, tenta encontrar o jogador
    if (!window.teamApp.currentViewingPlayer && playerId) {
        const player = window.teamApp.currentPlayers?.find(p => p.id == playerId) || null;
        if (player) {
            window.teamApp.currentViewingPlayer = player;
        } else {
            console.error('Jogador não encontrado na lista atual');
            window.teamApp.showToast('Erro ao encontrar os dados do jogador', 'error');
            return;
        }
    }
    
    // Se chegou aqui, tem um currentViewingPlayer válido
    if (window.teamApp.currentViewingPlayer) {
        window.teamApp.showDeleteConfirmation(window.teamApp.currentViewingPlayer);
    } else {
        console.error('Nenhum jogador selecionado para exclusão');
        window.teamApp.showToast('Nenhum jogador selecionado para exclusão', 'error');
    }
};

window.teamApp.confirmDeletePlayer = async function() {
    const modal = document.getElementById('deleteConfirmationModal');
    if (!modal) return;
    
    // Tenta obter o ID do jogador de diferentes fontes
    let playerId = window.teamApp.currentViewingPlayer?.id || 
                 window.teamApp.currentDeletingPlayerId;
    
    // Se ainda não tiver o ID, tenta obter do modal
    if (!playerId) {
        const playerIdAttr = modal.getAttribute('data-player-id');
        if (playerIdAttr) {
            playerId = parseInt(playerIdAttr, 10);
        }
    }
    if (!playerId) {
        console.error('ID do jogador não encontrado');
        window.teamApp.showToast('Erro ao identificar o jogador para exclusão', 'error');
        return;
    }
    
    try {
        const confirmBtn = modal.querySelector('#confirmDeleteBtn');
        const cancelBtn = modal.querySelector('#cancelDeleteBtn');
        const spinner = modal.querySelector('#deleteSpinner');
        const buttonText = modal.querySelector('#deleteButtonText');
        
        if (confirmBtn) confirmBtn.disabled = true;
        if (cancelBtn) cancelBtn.disabled = true;
        if (spinner) spinner.classList.remove('hidden');
        if (buttonText) buttonText.textContent = 'Excluindo...';
        
        const response = await fetch(`/api/players/${playerId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.content || ''
            },
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao excluir jogador');
        }
        
        // Fecha o modal de confirmação
        modal.style.opacity = '0';
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        }, 200);
        
        window.teamApp.showToast('Jogador excluído com sucesso!', 'success');
        
        // Recarrega a lista de jogadores
        if (window.teamApp.loadPlayers) {
            await window.teamApp.loadPlayers();
        }
        
    } catch (error) {
        console.error('Erro ao excluir jogador:', error);
        window.teamApp.showToast('Erro ao excluir jogador: ' + (error.message || 'Erro desconhecido'), 'error');
        
        // Reabilita os botões em caso de erro
        const confirmBtn = modal.querySelector('#confirmDeleteBtn');
        const cancelBtn = modal.querySelector('#cancelDeleteBtn');
        const spinner = modal.querySelector('#deleteSpinner');
        const buttonText = modal.querySelector('#deleteButtonText');
        
        if (confirmBtn) confirmBtn.disabled = false;
        if (cancelBtn) cancelBtn.disabled = false;
        if (spinner) spinner.classList.add('hidden');
        if (buttonText) buttonText.textContent = 'Sim, excluir';
    } finally {
        window.teamApp.currentDeletingPlayerId = null;
    }
};

// Função auxiliar para converter string com vírgula para número
const parseNumberInput = (value) => {
    if (typeof value === 'number') return value;
    if (!value || value === '') return null;
    // Substitui vírgula por ponto e converte para número
    return parseFloat(value.toString().replace(',', '.'));
};

window.teamApp.savePlayer = async function() {
    const form = document.getElementById('playerForm');
    if (!form) {
        console.error('Formulário não encontrado');
        window.teamApp.showToast('Erro ao processar o formulário', 'error');
        return;
    }
    
    try {
        const formData = new FormData(form);
        
        // Obtém e formata os dados do formulário
        const playerData = {
            id: formData.get('id') || null,
            name: (formData.get('name') || '').trim(),
            age: parseInt(formData.get('age') || 0, 10),
            team: formData.get('team'),
            position: formData.get('position'),
            height: parseNumberInput(formData.get('height')),
            weight: parseNumberInput(formData.get('weight')),
            number: parseInt(formData.get('number') || 0, 10)
        };
        
        console.log('Dados do formulário antes do envio:', {
            ...playerData,
            idType: typeof playerData.id,
            numberType: typeof playerData.number
        });
        
        // Validação básica de campos obrigatórios
        if (!playerData.name) {
            window.teamApp.markFieldAsInvalid('name', true);
            window.teamApp.showToast('O nome do jogador é obrigatório', 'error');
            document.getElementById('name')?.focus();
            return;
        }
        
        if (!playerData.team) {
            window.teamApp.markFieldAsInvalid('team', true);
            window.teamApp.showToast('Selecione um time', 'error');
            document.getElementById('team')?.focus();
            return;
        }
        
        if (!playerData.position) {
            window.teamApp.markFieldAsInvalid('position', true);
            window.teamApp.showToast('Selecione uma posição', 'error');
            document.getElementById('position')?.focus();
            return;
        }
        
        // Validação mais detalhada dos dados
        const validationErrors = window.teamApp.validatePlayerData(playerData);
        if (validationErrors.length > 0) {
            // Rola até o primeiro campo com erro
            const firstErrorField = document.querySelector('.border-red-500');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                });
                
                // Destaque temporário do campo com erro
                firstErrorField.classList.add('ring-2', 'ring-red-500');
                setTimeout(() => {
                    firstErrorField.classList.remove('ring-2', 'ring-red-500');
                }, 2000);
                
                // Foca no campo com erro
                firstErrorField.focus();
            }
            
            // Mostra a primeira mensagem de erro
            window.teamApp.showToast(validationErrors[0], 'error');
            return;
        }
        
        // Prepara a requisição
        const isEdit = !!playerData.id;
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/players/${playerData.id}` : '/api/players';
        
        // Mostra indicador de carregamento
        window.teamApp.setSubmitLoading(true);
        
        // Envia os dados para o servidor
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.content || ''
            },
            body: JSON.stringify(playerData),
            credentials: 'same-origin'
        });
        
        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao salvar jogador');
        }
        
        // Processa a resposta
        const data = await response.json();
        
        // Mostra mensagem de sucesso
        window.teamApp.showToast(
            `Jogador ${isEdit ? 'atualizado' : 'adicionado'} com sucesso!`,
            'success'
        );
        
        window.teamApp.closeModal();
        await window.teamApp.loadPlayers();
        
        return data.player || data;
    } catch (error) {
        console.error('Erro ao salvar jogador:', error);
        
        // Tenta extrair a mensagem de erro da resposta da API
        let errorMessage = 'Erro ao salvar jogador';
        
        if (error.message && error.message.includes('Já existe')) {
            // Mensagem de erro específica para número de camisa duplicado
            errorMessage = error.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        // Remove o prefixo 'Error: ' se existir
        errorMessage = errorMessage.replace(/^Error: /, '');
        
        window.teamApp.showToast(errorMessage, 'error');
        throw error;
    } finally {
        window.teamApp.setSubmitLoading(false);
    }
}

window.teamApp.renderPlayers = function(players) {
    const positions = {
        'PG': 'Armador',
        'SG': 'Ala-armador', 
        'SF': 'Ala',
        'PF': 'Ala-pivô',
        'C': 'Pivô'
    };
    
    let html = '';
    
    if (!Array.isArray(players)) {
        console.error('Dados de jogadores inválidos:', players);
        players = [];
    }
    
    try {
        const playersByPosition = players.reduce((acc, player) => {
            if (!player) return acc;
            
            const position = player.position || 'SF';
            if (!acc[position]) {
                acc[position] = [];
            }
            acc[position].push(player);
            return acc;
        }, {});
        
        const positionOrder = ['PG', 'SG', 'SF', 'PF', 'C'];
        const sortedPositions = positionOrder.filter(pos => playersByPosition[pos] && playersByPosition[pos].length > 0);
        
        if (sortedPositions.length === 0) {
            html = `
                <div class="flex flex-col items-center justify-center py-16">
                    <div class="bg-gray-800 rounded-full p-6 mb-6">
                        <svg class="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-medium text-gray-300 mb-2">Nenhum jogador encontrado</h3>
                    <p class="text-gray-500 mb-6">Comece adicionando seu primeiro jogador ao time.</p>
                    <button onclick="window.teamApp.openAddModal()" class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
                        Adicionar Primeiro Jogador
                    </button>
                </div>`;
        } else {
            sortedPositions.forEach(position => {
                const positionPlayers = playersByPosition[position] || [];
                const positionName = positions[position] || position;
                
                positionPlayers.sort((a, b) => (a.number || 99) - (b.number || 99));
                
                html += `
                    <section class="w-5/6 mx-auto mb-12">
                        <div class="flex items-center mb-8">
                            <h1 class="text-white font-bold text-4xl">${position} - ${positionName}</h1>
                            <span class="ml-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                ${positionPlayers.length} jogador${positionPlayers.length !== 1 ? 'es' : ''}
                            </span>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                `;
                
                positionPlayers.forEach(player => {
                    if (!player) return;
                    
                    const playerName = player.name || 'Sem nome';
                    const playerTeam = player.team || 'Sem time';
                    const playerNumber = player.number !== undefined ? player.number.toString() : '?';
                    const playerId = player.id ? player.id.toString() : '';
                    
                    const esc = (str) => {
                        if (str === null || str === undefined) return '';
                        return String(str)
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&#039;');
                    };
                    
                    const gradient = teamColors[player.team] || 'from-gray-600 to-gray-800';
                    const [fromColor, toColor] = gradient.split(' ');
                    const gradientStyle = `background: linear-gradient(to bottom, var(--${fromColor.replace('from-', '')}), var(--${toColor.replace('to-', '')}));`;
                    
                    html += `
                        <div class="flex flex-col items-center group" data-player-id="${esc(playerId)}">
                            <div class="relative w-full">
                                <div class="block w-full h-64 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer" 
                                     style="${gradientStyle}" 
                                     onclick="window.teamApp.openViewModal(${esc(JSON.stringify(player))})">
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <span class="text-7xl font-bold text-white opacity-80">${esc(playerNumber)}</span>
                                    </div>
                                    <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/70 to-transparent">
                                        <h2 class="text-white font-semibold text-lg truncate mb-1">${esc(playerName)}</h2>
                                        <p class="text-gray-300 text-sm truncate">${esc(playerTeam)}</p>
                                    </div>
                                </div>
                                <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-2">
                                    <button onclick="event.stopPropagation(); window.teamApp.openViewModal(${esc(JSON.stringify(player))})" 
                                            class="p-2 bg-green-600 rounded-full hover:bg-green-700 transition-colors shadow-lg"
                                            title="Visualizar">
                                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    <button onclick="event.stopPropagation(); window.teamApp.openEditModal(${esc(JSON.stringify(player))})" 
                                            class="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                                            title="Editar">
                                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                    </button>
                                    <button onclick="event.stopPropagation(); window.teamApp.deletePlayer('${esc(playerId)}')" 
                                            class="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                                            title="Excluir jogador">
                                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </section>
                `;
            });
        }
        
        const container = document.getElementById('playersContainer');
        if (container) {
            container.innerHTML = html;
        } else {
            console.error('Elemento playersContainer não encontrado no DOM');
        }
    } catch (error) {
        console.error('Erro ao renderizar jogadores:', error);
        window.teamApp.showToast('Erro ao carregar a lista de jogadores', 'error');
    }
};

window.teamApp.showToast = function(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-md text-white font-medium ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

window.teamApp.loadPlayers = async function() {
    try {
        const players = await window.teamApp.fetchPlayers();
        window.teamApp.renderPlayers(players);
    } catch (error) {
        console.error('Erro ao carregar jogadores:', error);
        window.teamApp.showToast('Erro ao carregar jogadores', 'error');
    }
}

// Fecha o modal ao pressionar a tecla ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // Fecha o modal de visualização se estiver aberto
        const viewModal = document.getElementById('viewPlayerModal');
        if (viewModal && !viewModal.classList.contains('hidden')) {
            window.teamApp.closeViewModal();
            return;
        }
        
        // Fecha o modal de confirmação de exclusão se estiver aberto
        const deleteModal = document.getElementById('deleteConfirmationModal');
        if (deleteModal && !deleteModal.classList.contains('hidden')) {
            window.teamApp.closeDeleteConfirmation();
            return;
        }
        
        // Fecha o modal de edição/adicionar se estiver aberto
        const editModal = document.getElementById('playerModal');
        if (editModal && !editModal.classList.contains('hidden')) {
            window.teamApp.closeModal();
            return;
        }
    }
});

// Fecha o modal de visualização ao clicar fora do conteúdo
const viewPlayerModal = document.getElementById('viewPlayerModal');
if (viewPlayerModal) {
    viewPlayerModal.addEventListener('click', function(event) {
        const content = document.getElementById('viewModalContent');
        if (event.target === viewPlayerModal && content && !content.contains(event.target)) {
            window.teamApp.closeViewModal();
        }
    });
}

// Fecha o modal de confirmação de exclusão ao clicar fora do conteúdo
const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');
if (deleteConfirmationModal) {
    deleteConfirmationModal.addEventListener('click', function(event) {
        const content = deleteConfirmationModal.querySelector('.bg-gray-900');
        if (event.target === deleteConfirmationModal && content && !content.contains(event.target)) {
            window.teamApp.closeDeleteConfirmation();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const playerForm = document.getElementById('playerForm');
    if (playerForm) {
        playerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const playerId = document.getElementById('playerId').value;
            
            const parseNumber = (value) => {
                if (!value) return null;
    
                const num = parseFloat(value.toString().replace(',', '.'));
                return isNaN(num) ? null : num;
            };
            
            const playerData = {
                id: playerId || null,
                name: formData.get('name'),
                age: parseInt(formData.get('age')) || 0,
                team: formData.get('team'),
                position: formData.get('position'),
                height: parseNumber(formData.get('height')),
                weight: parseNumber(formData.get('weight')),
                number: parseInt(formData.get('number')) || 0
            };
            
            await window.teamApp.savePlayer(playerData);
        });
    } else {
        console.error('Formulário de jogador não encontrado!');
    }
    
    window.teamApp.loadPlayers();
});

document.addEventListener('click', function(event) {
    const modal = document.getElementById('playerModal');
    if (event.target === modal) {
        window.teamApp.closeModal();
    }
});

document.addEventListener('keydown', function handleModalEscKey(e) {
    if (e.key === 'Escape') {
        window.teamApp.closeModal();
    }
});

Object.assign(window, {
    openAddModal: window.teamApp.openAddModal,
    openEditModal: window.teamApp.openEditModal,
    closeModal: window.teamApp.closeModal,
    fetchPlayers: window.teamApp.fetchPlayers,
    savePlayer: window.teamApp.savePlayer,
    deletePlayer: window.teamApp.deletePlayer,
    renderPlayers: window.teamApp.renderPlayers
});
window.showToast = window.teamApp.showToast;
window.loadPlayers = window.teamApp.loadPlayers;
