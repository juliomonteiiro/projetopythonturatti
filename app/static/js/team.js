window.teamApp = {
    players: [],
    currentPlayer: null,
    isEditing: false,

    async loadPlayers() {
        try {
            const response = await fetch('/api/players');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.players = await response.json();
            this.renderPlayers();
        } catch (error) {
            console.error('Erro ao carregar jogadores:', error);
            this.showError('Erro ao carregar jogadores. Tente novamente.');
        }
    },

    renderPlayers() {
        const container = document.getElementById('playersContainer');
        if (!container) return;

        if (this.players.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-16 px-4">
                    <div class="text-center">
                        <svg class="mx-auto h-24 w-24 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 class="text-2xl font-bold text-white mb-2">Nenhum jogador cadastrado</h3>
                        <p class="text-gray-400 mb-8 max-w-md mx-auto">Comece adicionando jogadores ao seu time para gerenciar estatísticas e informações.</p>
                        <button onclick="window.teamApp.openAddModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            + Adicionar Primeiro Jogador
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        const groupedPlayers = this.groupPlayersByTeam();
        let html = '';

        Object.entries(groupedPlayers).forEach(([teamName, teamPlayers]) => {
            const teamColor = this.getTeamColor(teamName);
            html += `
                <div class="mb-12">
                    <div class="flex items-center mb-6">
                        <div class="w-4 h-4 rounded-full mr-3" style="background: ${teamColor}"></div>
                        <h2 class="text-2xl font-bold text-white">${teamName}</h2>
                        <span class="ml-3 bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                            ${teamPlayers.length} jogador${teamPlayers.length !== 1 ? 'es' : ''}
                        </span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        ${teamPlayers.map(player => this.createPlayerCard(player, teamColor)).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    groupPlayersByTeam() {
        return this.players.reduce((groups, player) => {
            const team = player.team || 'Sem Time';
            if (!groups[team]) {
                groups[team] = [];
            }
            groups[team].push(player);
            return groups;
        }, {});
    },

    getTeamColor(teamName) {
        const teamColors = {
            'Atlanta Hawks': 'linear-gradient(135deg, #E31837, #C1D32F)',
            'Boston Celtics': 'linear-gradient(135deg, #007A33, #BA9653)',
            'Brooklyn Nets': 'linear-gradient(135deg, #000000, #FFFFFF)',
            'Charlotte Hornets': 'linear-gradient(135deg, #1D1160, #00788C)',
            'Chicago Bulls': 'linear-gradient(135deg, #CE1141, #000000)',
            'Cleveland Cavaliers': 'linear-gradient(135deg, #860038, #FDBB30)',
            'Detroit Pistons': 'linear-gradient(135deg, #C8102E, #1D42BA)',
            'Indiana Pacers': 'linear-gradient(135deg, #002D62, #FDBB30)',
            'Miami Heat': 'linear-gradient(135deg, #98002E, #F9A01B)',
            'Milwaukee Bucks': 'linear-gradient(135deg, #00471B, #EEE1C6)',
            'New York Knicks': 'linear-gradient(135deg, #006BB6, #F58426)',
            'Orlando Magic': 'linear-gradient(135deg, #0077C0, #C4CED4)',
            'Philadelphia 76ers': 'linear-gradient(135deg, #006BB6, #ED174C)',
            'Toronto Raptors': 'linear-gradient(135deg, #CE1141, #000000)',
            'Washington Wizards': 'linear-gradient(135deg, #002B5C, #E31837)',
            'Dallas Mavericks': 'linear-gradient(135deg, #00538C, #002F5F)',
            'Denver Nuggets': 'linear-gradient(135deg, #0E2240, #FEC524)',
            'Golden State Warriors': 'linear-gradient(135deg, #1D428A, #FFC72C)',
            'Houston Rockets': 'linear-gradient(135deg, #CE1141, #000000)',
            'Los Angeles Clippers': 'linear-gradient(135deg, #1D428A, #C8102E)',
            'Los Angeles Lakers': 'linear-gradient(135deg, #552583, #FDB927)',
            'Memphis Grizzlies': 'linear-gradient(135deg, #5D76A9, #12173F)',
            'Minnesota Timberwolves': 'linear-gradient(135deg, #0C2340, #236192)',
            'New Orleans Pelicans': 'linear-gradient(135deg, #0C2340, #C8102E)',
            'Oklahoma City Thunder': 'linear-gradient(135deg, #007AC1, #EF3B24)',
            'Phoenix Suns': 'linear-gradient(135deg, #1D1160, #E56020)',
            'Portland Trail Blazers': 'linear-gradient(135deg, #E03A3E, #000000)',
            'Sacramento Kings': 'linear-gradient(135deg, #5A2D81, #63727A)',
            'San Antonio Spurs': 'linear-gradient(135deg, #C4CED4, #000000)',
            'Utah Jazz': 'linear-gradient(135deg, #002B5C, #00471B)'
        };
        return teamColors[teamName] || 'linear-gradient(135deg, #6B7280, #374151)';
    },

    createPlayerCard(player, teamColor) {
        const initials = player.name ? player.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';
        const createdDate = player.created_at ? new Date(player.created_at).toLocaleDateString('pt-BR') : 'N/A';
        
        return `
            <div class="bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20 group cursor-pointer"
                 onclick="window.teamApp.viewPlayer(${player.id})">
                <div class="relative">
                    <div class="h-32 bg-gradient-to-br from-gray-700 to-gray-900 relative overflow-hidden">
                        <div class="absolute inset-0 opacity-20" style="background: ${teamColor}"></div>
                        <div class="absolute top-3 right-3">
                            <span class="bg-black/50 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                                #${player.number || '?'}
                            </span>
                        </div>
                        <div class="absolute bottom-3 left-3">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/20 backdrop-blur-sm"
                                 style="background: ${teamColor}">
                                ${initials}
                            </div>
                        </div>
                    </div>
                    
                    <div class="p-4">
                        <div class="mb-3">
                            <h3 class="text-white font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors truncate">
                                ${player.name || 'Nome não informado'}
                            </h3>
                            <div class="flex items-center text-sm text-gray-400 space-x-2">
                                <span class="bg-gray-700/50 px-2 py-1 rounded text-xs font-medium">
                                    ${player.position || 'N/A'}
                                </span>
                                <span>•</span>
                                <span>${player.age || 'N/A'} anos</span>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-3 text-xs">
                            <div class="bg-gray-900/30 p-2 rounded border border-gray-700/50">
                                <p class="text-gray-400 font-medium mb-1">Altura</p>
                                <p class="text-white font-bold">${player.height ? player.height + 'm' : 'N/A'}</p>
                            </div>
                            <div class="bg-gray-900/30 p-2 rounded border border-gray-700/50">
                                <p class="text-gray-400 font-medium mb-1">Peso</p>
                                <p class="text-white font-bold">${player.weight ? player.weight + 'kg' : 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div class="mt-4 pt-3 border-t border-gray-700/50">
                            <div class="flex justify-between items-center">
                                <span class="text-xs text-gray-500">Cadastrado em ${createdDate}</span>
                                <div class="flex space-x-1">
                                    <button onclick="event.stopPropagation(); window.teamApp.editPlayer(${player.id})" 
                                            class="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors"
                                            title="Editar jogador">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                    </button>
                                    <button onclick="event.stopPropagation(); window.teamApp.confirmDelete(${player.id}, '${player.name}')" 
                                            class="p-1.5 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                                            title="Excluir jogador">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    viewPlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        this.currentPlayer = player;
        
        document.getElementById('viewPlayerName').textContent = player.name || 'Nome não informado';
        document.getElementById('viewPlayerTeam').textContent = player.team || 'Time não informado';
        document.getElementById('viewPlayerPosition').textContent = player.position || 'N/A';
        document.getElementById('viewPlayerAge').textContent = player.age ? `${player.age} anos` : 'N/A';
        document.getElementById('viewPlayerHeight').textContent = player.height ? `${player.height}m` : 'N/A';
        document.getElementById('viewPlayerWeight').textContent = player.weight ? `${player.weight}kg` : 'N/A';
        document.getElementById('viewPlayerNumber').textContent = player.number ? `#${player.number}` : 'N/A';
        document.getElementById('viewPlayerTeamName').textContent = player.team || 'N/A';
        document.getElementById('viewPlayerMainPosition').textContent = player.position || 'N/A';
        document.getElementById('viewPlayerAgeDetail').textContent = player.age ? `${player.age} anos` : 'N/A';
        
        const createdDate = player.created_at ? new Date(player.created_at).toLocaleDateString('pt-BR') : 'N/A';
        document.getElementById('viewPlayerCreatedAt').textContent = createdDate;

        const modal = document.getElementById('viewPlayerModal');
        const modalContent = document.getElementById('viewModalContent');
        
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        
        setTimeout(() => {
            modalContent.classList.remove('opacity-0', 'scale-95');
            modalContent.classList.add('opacity-100', 'scale-100');
        }, 10);
    },

    closeViewModal() {
        const modal = document.getElementById('viewPlayerModal');
        const modalContent = document.getElementById('viewModalContent');
        
        modalContent.classList.remove('opacity-100', 'scale-100');
        modalContent.classList.add('opacity-0', 'scale-95');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }, 200);
        
        this.currentPlayer = null;
    },

    editCurrentPlayer() {
        if (this.currentPlayer) {
            this.closeViewModal();
            setTimeout(() => {
                this.editPlayer(this.currentPlayer.id);
            }, 250);
        }
    },

    openAddModal() {
        this.isEditing = false;
        this.currentPlayer = null;
        document.getElementById('modalTitle').textContent = 'Adicionar Jogador';
        document.getElementById('playerForm').reset();
        document.getElementById('playerId').value = '';
        this.showModal();
    },

    editPlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        this.isEditing = true;
        this.currentPlayer = player;
        document.getElementById('modalTitle').textContent = 'Editar Jogador';
        
        document.getElementById('playerId').value = player.id;
        document.getElementById('name').value = player.name || '';
        document.getElementById('age').value = player.age || '';
        document.getElementById('team').value = player.team || '';
        document.getElementById('position').value = player.position || '';
        document.getElementById('height').value = player.height || '';
        document.getElementById('weight').value = player.weight || '';
        document.getElementById('number').value = player.number || '';
        
        this.showModal();
    },

    showModal() {
        document.getElementById('playerModal').classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        
        setTimeout(() => {
            document.getElementById('name').focus();
        }, 100);
    },

    closeModal() {
        document.getElementById('playerModal').classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        document.getElementById('playerForm').reset();
        this.currentPlayer = null;
        this.isEditing = false;
    },

    async savePlayer(formData) {
        const submitBtn = document.getElementById('submitBtn');
        const submitText = document.getElementById('submitText');
        const submitLoader = document.getElementById('submitLoader');
        
        submitBtn.disabled = true;
        submitText.classList.add('hidden');
        submitLoader.classList.remove('hidden');

        try {
            const playerId = formData.get('id');
            const url = playerId ? `/api/players/${playerId}` : '/api/players';
            const method = playerId ? 'PUT' : 'POST';

            const playerData = {
                name: formData.get('name'),
                age: parseInt(formData.get('age')),
                team: formData.get('team'),
                position: formData.get('position'),
                height: parseFloat(formData.get('height')),
                weight: parseFloat(formData.get('weight')),
                number: parseInt(formData.get('number'))
            };

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(playerData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao salvar jogador');
            }

            this.showSuccess(playerId ? 'Jogador atualizado com sucesso!' : 'Jogador adicionado com sucesso!');
            this.closeModal();
            await this.loadPlayers();

        } catch (error) {
            console.error('Erro ao salvar jogador:', error);
            this.showError(error.message || 'Erro ao salvar jogador. Tente novamente.');
        } finally {
            submitBtn.disabled = false;
            submitText.classList.remove('hidden');
            submitLoader.classList.add('hidden');
        }
    },

    confirmDelete(playerId, playerName) {
        this.currentPlayer = { id: playerId, name: playerName };
        
        document.getElementById('deleteConfirmationTitle').textContent = 'Excluir Jogador';
        document.getElementById('deleteConfirmationMessage').textContent = 
            `Tem certeza que deseja excluir "${playerName}"? Esta ação não pode ser desfeita e todas as estatísticas do jogador serão perdidas.`;
        
        document.getElementById('deleteConfirmationModal').classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    },

    async deletePlayer() {
        if (!this.currentPlayer) return;

        const confirmBtn = document.getElementById('confirmDeleteBtn');
        const deleteText = document.getElementById('deleteButtonText');
        const deleteSpinner = document.getElementById('deleteSpinner');
        
        confirmBtn.disabled = true;
        deleteText.textContent = 'Excluindo...';
        deleteSpinner.classList.remove('hidden');

        try {
            const response = await fetch(`/api/players/${this.currentPlayer.id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao excluir jogador');
            }

            this.showSuccess('Jogador excluído com sucesso!');
            this.closeDeleteModal();
            this.closeViewModal();
            await this.loadPlayers();

        } catch (error) {
            console.error('Erro ao excluir jogador:', error);
            this.showError(error.message || 'Erro ao excluir jogador. Tente novamente.');
        } finally {
            confirmBtn.disabled = false;
            deleteText.textContent = 'Excluir';
            deleteSpinner.classList.add('hidden');
        }
    },

    closeDeleteModal() {
        document.getElementById('deleteConfirmationModal').classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        this.currentPlayer = null;
    },

    showSuccess(message) {
        this.showToast(message, 'success');
    },

    showError(message) {
        this.showToast(message, 'error');
    },

    showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm transform transition-all duration-300 translate-x-full opacity-0`;
        
        if (type === 'success') {
            toast.classList.add('bg-green-600');
            toast.innerHTML = `
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    ${message}
                </div>
            `;
        } else {
            toast.classList.add('bg-red-600');
            toast.innerHTML = `
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    ${message}
                </div>
            `;
        }

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
            toast.classList.add('translate-x-0', 'opacity-100');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('translate-x-0', 'opacity-100');
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('playerForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            await window.teamApp.savePlayer(formData);
        });
    }

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            window.teamApp.deletePlayer();
        });
    }

    window.teamApp.loadPlayers();
});