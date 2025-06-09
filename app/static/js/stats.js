const statsForm = document.getElementById('stats-form');
const playerStatsSection = document.getElementById('player-stats-section');
const gameDateInput = document.getElementById('game_date');

if (gameDateInput) {
    const today = new Date().toISOString().split('T')[0];
    gameDateInput.value = today;
}

const teamColors = {
    'Atlanta Hawks': 'linear-gradient(135deg, #DC2626, #F59E42)',
    'Boston Celtics': 'linear-gradient(135deg, #15803D, #F1F5F9)',
    'Brooklyn Nets': 'linear-gradient(135deg, #000000, #6B7280)',
    'Charlotte Hornets': 'linear-gradient(135deg, #14B8A6, #7C3AED)',
    'Chicago Bulls': 'linear-gradient(135deg, #B91C1C, #000000)',
    'Cleveland Cavaliers': 'linear-gradient(135deg, #581C87, #F59E42)',
    'Detroit Pistons': 'linear-gradient(135deg, #1D4ED8, #DC143C)',
    'Indiana Pacers': 'linear-gradient(135deg, #F59E42, #1E293B)',
    'Miami Heat': 'linear-gradient(135deg, #DC2626, #F97316)',
    'Milwaukee Bucks': 'linear-gradient(135deg, #166534, #FEF9C3)',
    'New York Knicks': 'linear-gradient(135deg, #1D4ED8, #F59E42)',
    'Orlando Magic': 'linear-gradient(135deg, #1E40AF, #A3A3A3)',
    'Philadelphia 76ers': 'linear-gradient(135deg, #1D4ED8, #EF4444)',
    'Toronto Raptors': 'linear-gradient(135deg, #B91C1C, #27272A)',
    'Washington Wizards': 'linear-gradient(135deg, #1D4ED8, #D1D5DB)',
    'Dallas Mavericks': 'linear-gradient(135deg, #1E293B, #D1D5DB)',
    'Denver Nuggets': 'linear-gradient(135deg, #1E293B, #F59E42)',
    'Golden State Warriors': 'linear-gradient(135deg, #1D4ED8, #FBBF24)',
    'Houston Rockets': 'linear-gradient(135deg, #B91C1C, #64748B)',
    'Los Angeles Clippers': 'linear-gradient(135deg, #1D4ED8, #B91C1C)',
    'Los Angeles Lakers': 'linear-gradient(135deg, #7C3AED, #FBBF24)',
    'Memphis Grizzlies': 'linear-gradient(135deg, #1E40AF, #38BDF8)',
    'Minnesota Timberwolves': 'linear-gradient(135deg, #1E293B, #A3E635)',
    'New Orleans Pelicans': 'linear-gradient(135deg, #1E293B, #B91C1C)',
    'Oklahoma City Thunder': 'linear-gradient(135deg, #2563EB, #FDBA74)',
    'Phoenix Suns': 'linear-gradient(135deg, #7C3AED, #FDBA74)',
    'Portland Trail Blazers': 'linear-gradient(135deg, #DC143C, #000000)',
    'Sacramento Kings': 'linear-gradient(135deg, #7C3AED, #A3A3A3)',
    'San Antonio Spurs': 'linear-gradient(135deg, #000000, #A3A3A3)',
    'Utah Jazz': 'linear-gradient(135deg, #1E293B, #FBBF24)',
    'Default': 'linear-gradient(135deg, #52525B, #1E293B)'
};

let currentStatId = null;
let currentPlayerId = null;

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupPercentageListeners();
});

if (document.readyState !== 'loading') {
    initializePage();
    setupPercentageListeners();
}

function initializePage() {
    console.log('Initializing stats page...');
    
    try {
        setupEventListeners();
        loadPlayers().catch(error => {
            console.error('Error loading players:', error);
            alert('Failed to load players. Please refresh the page.');
        });
        
        console.log('Page initialized successfully');
    } catch (error) {
        console.error('Error initializing page:', error);
        alert('An error occurred while initializing the page. Please refresh.');
    }
}

async function loadPlayers() {
    try {
        console.log('Loading players...');
        const response = await fetch('/api/players');
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API response error:', errorText);
            throw new Error(`Error loading players: ${response.status}`);
        }
        
        const players = await response.json();
        console.log('Players loaded:', players);
        
        if (!Array.isArray(players)) {
            throw new Error('Invalid players data received from API');
        }
        
        if (players.length === 0) {
            console.warn('No players found');
            return;
        }
        
        updatePlayerSelects(players);
        
    } catch (error) {
        console.error('Error loading players:', error);
        throw error;
    }
}

function updatePlayerSelects(players) {
    const playerSelect = document.getElementById('player-select');
    const playerSelectMobile = document.getElementById('player-select-mobile');
    
    if (!playerSelect || !playerSelectMobile) return;
    
    while (playerSelect.options.length > 1) playerSelect.remove(1);
    while (playerSelectMobile.options.length > 1) playerSelectMobile.remove(1);
    
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player.id;
        option.textContent = `${player.number} - ${player.name}`;
        option.dataset.teamName = player.team_name || '';
        option.dataset.position = player.position || '';
        option.dataset.teamPrimary = player.team_primary_color || '';
        option.dataset.teamSecondary = player.team_secondary_color || '';
        
        const mobileOption = option.cloneNode(true);
        
        playerSelect.appendChild(option);
        playerSelectMobile.appendChild(mobileOption);
    });
    
    if (players.length > 0) {
        updatePlayerInfo(players[0]);
        loadPlayerStats(players[0].id);
    }
}

function updatePlayerInfo(player) {
    const setTextContent = (selector, text) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = text || '--';
    };

    if (!player) {
        setTextContent('#player-name', 'Selecione um jogador');
        setTextContent('#player-position', '--');
        setTextContent('#player-team', '--');
        setTextContent('#player-number', '--');
        
        setTextContent('#player-name-modal', 'Selecione um jogador');
        setTextContent('#player-position-modal', '--');
        setTextContent('#player-team-modal', '--');
        setTextContent('#player-number-modal', '--');
        
        document.querySelectorAll('.player-avatar').forEach(avatar => {
            if (avatar) {
                avatar.style.background = teamColors['Default'];
                const initials = avatar.querySelector('.player-initials');
                if (initials) initials.textContent = '--';
            }
        });
        
        const playerImage = document.getElementById('player-image');
        const playerAvatarLarge = document.getElementById('player-avatar-large');
        const playerInitialsLarge = document.getElementById('player-initials-large');
        
        if (playerImage) {
            playerImage.src = "{{ url_for('static', filename='images/default-player.png') }}";
            playerImage.alt = 'Jogador não selecionado';
        }
        
        if (playerAvatarLarge) playerAvatarLarge.style.background = teamColors['Default'];
        if (playerInitialsLarge) playerInitialsLarge.textContent = '-';
        
        return;
    }

    const teamGradient = teamColors[player.team_name] || teamColors['Default'];
    
    setTextContent('#player-name', player.name);
    setTextContent('#player-position', player.position);
    setTextContent('#player-team', player.team_name);
    setTextContent('#player-number', player.number ? `#${player.number}` : '--');
    
    setTextContent('#player-name-modal', player.name);
    setTextContent('#player-position-modal', player.position);
    setTextContent('#player-team-modal', player.team_name);
    setTextContent('#player-number-modal', player.number ? `#${player.number}` : '--');
    
    const playerImage = document.getElementById('player-image');
    const playerAvatarLarge = document.getElementById('player-avatar-large');
    const playerInitialsLarge = document.getElementById('player-initials-large');
    
    if (playerImage) {
        playerImage.src = player.image_url || "{{ url_for('static', filename='images/default-player.png') }}";
        playerImage.alt = player.name || 'Jogador';
    }

    const initials = player.name ? player.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '--';
    
    document.querySelectorAll('.player-avatar').forEach(avatar => {
        if (avatar) {
            avatar.style.background = teamGradient;
            const avatarInitials = avatar.querySelector('.player-initials');
            if (avatarInitials) avatarInitials.textContent = initials;
        }
    });
    
    if (playerAvatarLarge) playerAvatarLarge.style.background = teamGradient;
    if (playerInitialsLarge) playerInitialsLarge.textContent = initials;

    const playerStatsSection = document.getElementById('player-stats-section');
    if (playerStatsSection) {
        playerStatsSection.classList.remove('hidden');
    }
    
    const emptyState = document.getElementById('empty-stats-state');
    if (emptyState) {
        emptyState.classList.add('hidden');
    }
    
    currentPlayerId = player.id;
    loadPlayerStats(player.id);
}

async function loadPlayerStats(playerId) {
    if (!playerId) return;
    
    try {
        const response = await fetch(`/api/player-stats/${playerId}`);
        
        if (!response.ok) {
            throw new Error(`Error loading stats: ${response.status}`);
        }
        
        const stats = await response.json();
        updateStatsTable(stats);
        updatePlayerAverages(stats);
        
        if (playerStatsSection) {
            playerStatsSection.classList.remove('hidden');
        }
        
    } catch (error) {
        console.error('Error loading player stats:', error);
        if (playerStatsSection) {
            playerStatsSection.classList.add('hidden');
        }
    }
}

function updatePlayerAverages(stats) {
    if (!Array.isArray(stats) || stats.length === 0) {
        document.getElementById('last-pts').textContent = '-';
        document.getElementById('last-reb').textContent = '-';
        document.getElementById('last-ast').textContent = '-';
        document.getElementById('last-stl').textContent = '-';
        document.getElementById('last-blk').textContent = '-';
        
        document.getElementById('avg-pts').textContent = '-';
        document.getElementById('avg-reb').textContent = '-';
        document.getElementById('avg-ast').textContent = '-';
        document.getElementById('avg-stl').textContent = '-';
        document.getElementById('avg-blk').textContent = '-';
        return;
    }

    const lastGame = stats[0];
    document.getElementById('last-pts').textContent = lastGame.points || '0';
    document.getElementById('last-reb').textContent = lastGame.rebounds || '0';
    document.getElementById('last-ast').textContent = lastGame.assists || '0';
    document.getElementById('last-stl').textContent = lastGame.steals || '0';
    document.getElementById('last-blk').textContent = lastGame.blocks || '0';

    const avgPoints = (stats.reduce((sum, stat) => sum + (stat.points || 0), 0) / stats.length).toFixed(1);
    const avgRebounds = (stats.reduce((sum, stat) => sum + (stat.rebounds || 0), 0) / stats.length).toFixed(1);
    const avgAssists = (stats.reduce((sum, stat) => sum + (stat.assists || 0), 0) / stats.length).toFixed(1);
    const avgSteals = (stats.reduce((sum, stat) => sum + (stat.steals || 0), 0) / stats.length).toFixed(1);
    const avgBlocks = (stats.reduce((sum, stat) => sum + (stat.blocks || 0), 0) / stats.length).toFixed(1);

    document.getElementById('avg-pts').textContent = avgPoints;
    document.getElementById('avg-reb').textContent = avgRebounds;
    document.getElementById('avg-ast').textContent = avgAssists;
    document.getElementById('avg-stl').textContent = avgSteals;
    document.getElementById('avg-blk').textContent = avgBlocks;
}

function updateStatsTable(stats) {
    const tbody = document.getElementById('stats-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!Array.isArray(stats) || stats.length === 0) {
        const row = document.createElement('tr');
        row.id = 'no-stats-message';
        row.innerHTML = `
            <td colspan="7" class="px-6 py-8 text-center">
                <div class="flex flex-col items-center justify-center space-y-4">
                    <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div class="text-gray-400">
                        <p class="font-medium">Nenhuma estatística encontrada</p>
                        <p class="text-sm mt-1">Adicione estatísticas para ver os dados do jogador</p>
                    </div>
                </div>
            </td>`;
        tbody.appendChild(row);
        return;
    }
    
    stats.forEach(stat => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-white/5 transition cursor-pointer';
        row.id = `stat-${stat.id}`;
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                <div class="flex flex-col">
                    <span class="font-semibold">${formatDate(stat.game_date)}</span>
                    <span class="text-xs text-gray-400">vs ${stat.adverse_team}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-white">
                <span class="font-bold text-lg">${stat.points || '0'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-white">
                ${stat.rebounds || '0'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-white">
                ${stat.assists || '0'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-white">
                ${stat.steals || '0'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-white">
                ${stat.blocks || '0'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center justify-center space-x-2">
                    <button onclick="viewStatDetails('${stat.id}')" class="text-blue-500 hover:text-blue-400 p-1.5 rounded-full hover:bg-blue-500/10 transition-colors" title="Ver detalhes">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    <button onclick="editStat('${stat.id}')" class="text-yellow-500 hover:text-yellow-400 p-1.5 rounded-full hover:bg-yellow-500/10 transition-colors" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button onclick="deleteStat('${stat.id}')" class="text-red-500 hover:text-red-400 p-1.5 rounded-full hover:bg-red-500/10 transition-colors" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function formatDate(dateString) {
    if (!dateString) return '--';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

function calculatePercentage(made, attempted) {
    if (!attempted || isNaN(made) || isNaN(attempted)) return '0.0';
    return (made / attempted * 100).toFixed(1);
}

function calculateTotalPoints() {
    const fieldGoalsMade = parseInt(document.getElementById('field_goals_made')?.value) || 0;
    const threePointsMade = parseInt(document.getElementById('three_points_made')?.value) || 0;
    const freeThrowsMade = parseInt(document.getElementById('free_throws_made')?.value) || 0;
    
    const points = (fieldGoalsMade * 2) + (threePointsMade * 3) + (freeThrowsMade * 1);
    
    const totalPointsElement = document.getElementById('total-points');
    if (totalPointsElement) {
        totalPointsElement.textContent = points;
    }
    
    return points;
}

function updatePercentage(madeId, attemptedId, percentageId) {
    const madeElement = document.getElementById(madeId);
    const attemptedElement = document.getElementById(attemptedId);
    const percentageElement = document.getElementById(percentageId);
    
    if (!madeElement || !attemptedElement || !percentageElement) return;
    
    const made = parseInt(madeElement.value) || 0;
    const attempted = parseInt(attemptedElement.value) || 0;
    
    if (attempted > 0) {
        const percentage = ((made / attempted) * 100).toFixed(1);
        percentageElement.textContent = `${percentage}%`;
    } else {
        percentageElement.textContent = '0.0%';
    }
    
    calculateTotalPoints();
}

function validateThreePointers() {
    const threePointsMade = parseInt(document.getElementById('three_points_made')?.value) || 0;
    const fieldGoalsMade = parseInt(document.getElementById('field_goals_made')?.value) || 0;
    
    if (threePointsMade > fieldGoalsMade) {
        document.getElementById('three_points_made').value = fieldGoalsMade;
        updatePercentage('three_points_made', 'three_points_attempted', 'three_points_percentage');
    }
}

function setupPercentageListeners() {
    const percentageFields = [
        { made: 'field_goals_made', attempted: 'field_goals_attempted', percentage: 'field_goals_percentage' },
        { made: 'three_points_made', attempted: 'three_points_attempted', percentage: 'three_points_percentage' },
        { made: 'free_throws_made', attempted: 'free_throws_attempted', percentage: 'free_throws_percentage' }
    ];
    
    percentageFields.forEach(field => {
        const madeInput = document.getElementById(field.made);
        const attemptedInput = document.getElementById(field.attempted);
        
        if (madeInput && attemptedInput) {
            madeInput.addEventListener('input', () => {
                updatePercentage(field.made, field.attempted, field.percentage);
                if (field.made === 'field_goals_made') {
                    validateThreePointers();
                }
            });
            
            attemptedInput.addEventListener('input', () => {
                updatePercentage(field.made, field.attempted, field.percentage);
            });
        }
    });
    
    const ftMade = document.getElementById('free_throws_made');
    const ftAttempted = document.getElementById('free_throws_attempted');
    
    if (ftMade && ftAttempted) {
        ftMade.addEventListener('input', () => updatePercentage('free_throws_made', 'free_throws_attempted', 'ft_percentage'));
        ftAttempted.addEventListener('input', () => updatePercentage('free_throws_made', 'free_throws_attempted', 'ft_percentage'));
    }
}

function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const addModal = document.getElementById('add-stats-modal');
            const deleteModal = document.getElementById('delete-modal');
            
            if (!addModal.classList.contains('hidden')) {
                hideAddModal();
            } else if (!deleteModal.classList.contains('hidden')) {
                hideDeleteModal();
            }
        }
    });
    
    const playerSelect = document.getElementById('player-select');
    const playerSelectMobile = document.getElementById('player-select-mobile');
    const addStatsBtn = document.getElementById('add-stats-btn');
    
    if (playerSelect) {
        playerSelect.addEventListener('change', handlePlayerSelect);
    }
    
    if (playerSelectMobile) {
        playerSelectMobile.addEventListener('change', handlePlayerSelect);
    }
    
    if (addStatsBtn) {
        addStatsBtn.addEventListener('click', () => {
            const playerSelect = document.getElementById('player-select');
            if (!playerSelect || !playerSelect.value) {
                alert('Por favor, selecione um jogador primeiro.');
                return;
            }
            openAddStatsModal();
        });
    }
    
    if (statsForm) {
        statsForm.addEventListener('submit', handleFormSubmit);
    }
    
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', hideAddModal);
    });
    
    const addModal = document.getElementById('add-stats-modal');
    const deleteModal = document.getElementById('delete-modal');
    
    if (addModal) {
        addModal.addEventListener('click', (e) => {
            if (e.target === addModal) {
                hideAddModal();
            }
        });
        
        addModal.setAttribute('role', 'dialog');
        addModal.setAttribute('aria-modal', 'true');
        addModal.setAttribute('aria-labelledby', 'add-stats-title');
    }
    
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                hideDeleteModal();
            }
        });
        
        deleteModal.setAttribute('role', 'alertdialog');
        deleteModal.setAttribute('aria-modal', 'true');
        deleteModal.setAttribute('aria-labelledby', 'delete-modal-title');
    }
    
    const deleteConfirmBtn = document.getElementById('confirm-delete');
    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', handleDeleteConfirm);
    }
    
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    }
    
    const cancelStatsBtn = document.getElementById('cancel-stats');
    if (cancelStatsBtn) {
        cancelStatsBtn.addEventListener('click', hideAddModal);
    }
}

function handlePlayerSelect(event) {
    const select = event.target;
    const selectedOption = select.options[select.selectedIndex];
    
    const otherSelect = select.id === 'player-select' 
        ? document.getElementById('player-select-mobile') 
        : document.getElementById('player-select');
        
    if (otherSelect) {
        otherSelect.value = selectedOption ? selectedOption.value : '';
    }
    
    if (!selectedOption || !selectedOption.value) {
        updatePlayerInfo({
            id: null,
            name: 'Selecione um jogador',
            number: '',
            team_name: '',
            position: '',
            team_primary_color: '',
            team_secondary_color: ''
        });
        
        const playerStatsSection = document.getElementById('player-stats-section');
        if (playerStatsSection) {
            playerStatsSection.classList.add('hidden');
        }
        
        const emptyState = document.getElementById('empty-stats-state');
        if (emptyState) {
            emptyState.classList.add('hidden');
        }
        
        return;
    }
    
    const player = {
        id: selectedOption.value,
        name: selectedOption.text.split(' - ').slice(1).join(' - ').trim(),
        number: selectedOption.text.split(' - ')[0].trim(),
        team_name: selectedOption.dataset.teamName || '',
        position: selectedOption.dataset.position || '',
        team_primary_color: selectedOption.dataset.teamPrimary || '',
        team_secondary_color: selectedOption.dataset.teamSecondary || ''
    };
    
    updatePlayerInfo(player);
    loadPlayerStats(player.id);
}

function validateField(fieldId, errorId, validationFn) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(errorId);
    
    if (!field) return true;
    
    const isValid = validationFn ? validationFn(field.value) : field.checkValidity();
    
    if (isValid) {
        field.classList.remove('border-red-500');
        field.classList.add('border-gray-700');
        if (errorElement) errorElement.classList.add('hidden');
        return true;
    } else {
        field.classList.remove('border-gray-700');
        field.classList.add('border-red-500');
        if (errorElement) errorElement.classList.remove('hidden');
        return false;
    }
}

function validateForm() {
    let isValid = true;
    
    isValid = validateField('adverse_team', 'adverse_team_error', value => value.trim() !== '') && isValid;
    isValid = validateField('minutes_played', 'minutes_played_error', value => {
        const num = parseInt(value);
        return !isNaN(num) && num >= 0 && num <= 48;
    }) && isValid;
    
    return isValid;
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        const firstError = document.querySelector('.border-red-500');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    const playerIdInput = document.getElementById('player_id');
    if (!playerIdInput || !playerIdInput.value) {
        alert('Por favor, selecione um jogador primeiro.');
        return;
    }
    
    currentPlayerId = playerIdInput.value;
    
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');
    
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.classList.add('hidden');
    if (submitLoader) submitLoader.classList.remove('hidden');
    
    try {
        const formData = new FormData(statsForm);
        const data = {};
        
        if (!formData.has('player_id') && currentPlayerId) {
            formData.append('player_id', currentPlayerId);
        }
        
        const requiredFields = [
            'game_date', 'adverse_team', 'minutes_played', 
            'field_goals_made', 'field_goals_attempted', 
            'three_points_made', 'three_points_attempted',
            'free_throws_made', 'free_throws_attempted', 
            'rebounds', 'assists', 'steals', 'blocks', 
            'turnovers', 'fouls'
        ];
        
        const missingFields = [];
        requiredFields.forEach(field => {
            const value = formData.get(field) || '';
            if (value === '') {
                missingFields.push(field.replace(/_/g, ' '));
            } else {
                data[field] = value;
            }
        });
        
        if (missingFields.length > 0) {
            throw new Error(`Os seguintes campos são obrigatórios: ${missingFields.join(', ')}`);
        }
        
        const fgMade = parseInt(data.field_goals_made);
        const fgAttempted = parseInt(data.field_goals_attempted);
        const threeMade = parseInt(data.three_points_made);
        const threeAttempted = parseInt(data.three_points_attempted);
        const ftMade = parseInt(data.free_throws_made);
        const ftAttempted = parseInt(data.free_throws_attempted);
        
        if (fgMade > fgAttempted) {
            throw new Error('Arremessos de quadra convertidos não podem ser maiores que tentados');
        }
        
        if (threeMade > threeAttempted) {
            throw new Error('Arremessos de 3 pontos convertidos não podem ser maiores que tentados');
        }
        
        if (ftMade > ftAttempted) {
            throw new Error('Lances livres convertidos não podem ser maiores que tentados');
        }
        
        data.points = (fgMade * 2) + (threeMade * 1) + ftMade;
        
        data.player_id = playerIdInput.value;
        
        data.player_id = currentPlayerId;
        
        console.log('Enviando dados para o servidor:', data);
        
        const url = currentStatId 
            ? `/api/player-stats/${currentStatId}`
            : '/api/player-stats';
            
        const method = currentStatId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('Resposta do servidor:', response);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error saving stats');
        }
        
        await loadPlayerStats(currentPlayerId);
        
        hideAddModal();
        
        alert(`Stats ${currentStatId ? 'updated' : 'added'} successfully!`);
        
    } catch (error) {
        console.error('Error saving stats:', error);
        alert(error.message || 'Error saving stats. Please try again.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            if (submitText) submitText.classList.remove('hidden');
            if (submitLoader) submitLoader.classList.add('hidden');
        }
    }
}

async function viewStatDetails(statId) {
    try {
        const response = await fetch(`/api/player-stats/${currentPlayerId}`);
        if (!response.ok) throw new Error('Erro ao carregar estatísticas');
        
        const stats = await response.json();
        const stat = stats.find(s => s.id == statId);
        
        if (!stat) {
            alert('Estatística não encontrada');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-900/95 border border-gray-700/50 rounded-2xl w-full max-w-4xl mx-4 overflow-hidden transform transition-all duration-300 shadow-2xl">
                <div class="px-6 pt-6 pb-4 border-b border-gray-800">
                    <div class="flex justify-between items-center">
                        <h3 class="text-2xl font-bold text-white">Detalhes da Partida</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white transition-colors p-1">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <p class="text-gray-400 mt-1">${formatDate(stat.game_date)} vs ${stat.adverse_team}</p>
                </div>
                
                <div class="p-6 max-h-[70vh] overflow-y-auto">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Pontuação -->
                        <div class="bg-gray-800/60 p-5 rounded-xl border border-gray-700/50">
                            <h4 class="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Pontuação</h4>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-300">Total de Pontos</span>
                                    <span class="text-white font-bold text-xl">${stat.points || 0}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-300">Minutos Jogados</span>
                                    <span class="text-white font-medium">${stat.minutes_played || 0}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Arremessos de Quadra -->
                        <div class="bg-gray-800/60 p-5 rounded-xl border border-gray-700/50">
                            <h4 class="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Arremessos de Quadra</h4>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-300">Convertidos/Tentados</span>
                                    <span class="text-white font-medium">${stat.field_goals_made || 0}/${stat.field_goals_attempted || 0}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-300">Porcentagem</span>
                                    <span class="text-white font-bold">${stat.field_goal_percentage || 0}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Arremessos de 3 Pontos -->
                        <div class="bg-gray-800/60 p-5 rounded-xl border border-gray-700/50">
                            <h4 class="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Arremessos de 3 Pontos</h4>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-300">Convertidos/Tentados</span>
                                    <span class="text-white font-medium">${stat.three_points_made || 0}/${stat.three_points_attempted || 0}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-300">Porcentagem</span>
                                    <span class="text-white font-bold">${stat.three_point_percentage || 0}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Lances Livres -->
                        <div class="bg-gray-800/60 p-5 rounded-xl border border-gray-700/50">
                            <h4 class="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Lances Livres</h4>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-300">Convertidos/Tentados</span>
                                    <span class="text-white font-medium">${stat.free_throws_made || 0}/${stat.free_throws_attempted || 0}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-300">Porcentagem</span>
                                    <span class="text-white font-bold">${stat.free_throw_percentage || 0}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Outras Estatísticas -->
                        <div class="bg-gray-800/60 p-5 rounded-xl border border-gray-700/50">
                            <h4 class="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Outras Estatísticas</h4>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-300">Rebotes</span>
                                    <span class="text-white font-medium">${stat.rebounds || 0}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-300">Assistências</span>
                                    <span class="text-white font-medium">${stat.assists || 0}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-300">Roubos</span>
                                    <span class="text-white font-medium">${stat.steals || 0}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-300">Tocos</span>
                                    <span class="text-white font-medium">${stat.blocks || 0}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Erros -->
                        <div class="bg-gray-800/60 p-5 rounded-xl border border-gray-700/50">
                            <h4 class="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Erros</h4>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-300">Perdas de Bola</span>
                                    <span class="text-white font-medium">${stat.turnovers || 0}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-300">Faltas</span>
                                    <span class="text-white font-medium">${stat.fouls || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
                    <div class="flex justify-end space-x-3">
                        <button onclick="this.closest('.fixed').remove()" class="px-5 py-2.5 text-gray-300 hover:bg-gray-800/50 rounded-xl transition-all border border-gray-700/50">
                            Fechar
                        </button>
                        <button onclick="this.closest('.fixed').remove(); editStat('${stat.id}')" class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transition-all">
                            Editar Estatística
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        alert('Erro ao carregar detalhes da estatística');
    }
}

async function editStat(statId) {
    try {
        const response = await fetch(`/api/player-stats/${currentPlayerId}`);
        if (!response.ok) throw new Error('Erro ao carregar estatísticas');
        
        const stats = await response.json();
        const stat = stats.find(s => s.id == statId);
        
        if (!stat) {
            alert('Estatística não encontrada');
            return;
        }
        
        currentStatId = statId;
        
        document.getElementById('game_date').value = stat.game_date;
        document.getElementById('adverse_team').value = stat.adverse_team || '';
        document.getElementById('minutes_played').value = stat.minutes_played || '';
        document.getElementById('field_goals_made').value = stat.field_goals_made || '';
        document.getElementById('field_goals_attempted').value = stat.field_goals_attempted || '';
        document.getElementById('three_points_made').value = stat.three_points_made || '';
        document.getElementById('three_points_attempted').value = stat.three_points_attempted || '';
        document.getElementById('free_throws_made').value = stat.free_throws_made || '';
        document.getElementById('free_throws_attempted').value = stat.free_throws_attempted || '';
        document.getElementById('rebounds').value = stat.rebounds || '';
        document.getElementById('assists').value = stat.assists || '';
        document.getElementById('steals').value = stat.steals || '';
        document.getElementById('blocks').value = stat.blocks || '';
        document.getElementById('turnovers').value = stat.turnovers || '';
        document.getElementById('fouls').value = stat.fouls || '';
        
        updatePercentage('field_goals_made', 'field_goals_attempted', 'fg_percentage');
        updatePercentage('three_points_made', 'three_points_attempted', 'three_pt_percentage');
        updatePercentage('free_throws_made', 'free_throws_attempted', 'ft_percentage');
        
        openAddStatsModal();
        
    } catch (error) {
        console.error('Erro ao carregar estatística para edição:', error);
        alert('Erro ao carregar estatística para edição');
    }
}

function deleteStat(statId) {
    currentStatId = statId;
    showDeleteModal();
}

function showDeleteModal() {
    const modal = document.getElementById('delete-modal');
    const modalContent = document.getElementById('delete-modal-content');
    
    if (modal && modalContent) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            modalContent.classList.remove('opacity-0', 'scale-95');
            modalContent.classList.add('opacity-100', 'scale-100');
        }, 10);
    }
}

function hideDeleteModal() {
    const modal = document.getElementById('delete-modal');
    const modalContent = document.getElementById('delete-modal-content');
    
    if (modal && modalContent) {
        modalContent.classList.remove('opacity-100', 'scale-100');
        modalContent.classList.add('opacity-0', 'scale-95');
        
        const newModal = modal.cloneNode(true);
        modal.parentNode.replaceChild(newModal, modal);
        
        setTimeout(() => {
            newModal.classList.add('hidden');
            document.body.style.overflow = '';
            
            const deleteButton = document.querySelector(`[onclick*="deleteStat('${currentStatId}')"]`);
            if (deleteButton) {
                deleteButton.focus();
            }
        }, 200);
    }
    
    currentStatId = null;
}

async function handleDeleteConfirm() {
    if (!currentStatId || !currentPlayerId) return;
    
    try {
        const response = await fetch(`/api/player-stats/${currentStatId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error deleting stat');
        }
        
        await loadPlayerStats(currentPlayerId);
        
        hideDeleteModal();
        
        alert('Stat deleted successfully!');
        
    } catch (error) {
        console.error('Error deleting stat:', error);
        alert(error.message || 'Error deleting stat. Please try again.');
    }
}

function openAddStatsModal() {
    const modal = document.getElementById('add-stats-modal');
    const modalContent = document.getElementById('addStatsModalContent');
    if (!modal || !modalContent) return;
    
    const playerSelect = document.getElementById('player-select');
    if (!playerSelect || !playerSelect.value) {
        alert('Por favor, selecione um jogador primeiro.');
        return;
    }
    
    const selectedOption = playerSelect.options[playerSelect.selectedIndex];
    
    const playerName = document.getElementById('player-name-modal');
    const playerNumber = document.getElementById('player-number-modal');
    const playerTeam = document.getElementById('player-team-modal');
    const playerAvatar = document.getElementById('player-avatar');
    
    if (playerName) playerName.textContent = selectedOption.text.split(' - ').slice(1).join(' - ').trim();
    if (playerNumber) playerNumber.textContent = selectedOption.text.split(' - ')[0].trim();
    if (playerTeam) playerTeam.textContent = selectedOption.dataset.teamName || '--';
    
    if (playerAvatar) {
        playerAvatar.textContent = selectedOption.text.split(' - ')[0].trim() || '--';
        playerAvatar.style.background = teamColors[selectedOption.dataset.teamName] || teamColors['Default'];
    }
    
    if (statsForm && !currentStatId) {
        statsForm.reset();
        
        const today = new Date().toISOString().split('T')[0];
        const gameDateInput = document.getElementById('game_date');
        if (gameDateInput) {
            gameDateInput.value = today;
        }
        
        const playerIdInput = document.getElementById('player_id');
        if (playerIdInput) {
            playerIdInput.value = playerSelect.value;
        }
        
        updatePercentage('field_goals_made', 'field_goals_attempted', 'fg_percentage');
        updatePercentage('three_points_made', 'three_points_attempted', 'three_pt_percentage');
        updatePercentage('free_throws_made', 'free_throws_attempted', 'ft_percentage');
        calculateTotalPoints();
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        modalContent.classList.remove('opacity-0', 'scale-95');
        modalContent.classList.add('opacity-100', 'scale-100');
    }, 10);
    
    updatePercentage('field_goals_made', 'field_goals_attempted', 'fg_percentage');
    updatePercentage('three_points_made', 'three_points_attempted', 'three_pt_percentage');
    updatePercentage('free_throws_made', 'free_throws_attempted', 'ft_percentage');
    
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableContent = modal.querySelectorAll(focusableElements);
    
    const firstFocusableElement = focusableContent[0];
    const lastFocusableElement = focusableContent[focusableContent.length - 1];
    
    if (firstFocusableElement) {
        setTimeout(() => firstFocusableElement.focus(), 100);
    }
    
    modal.addEventListener('keydown', function trapTabKey(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        } else if (e.key === 'Escape') {
            hideAddModal();
            if (previousActiveElement) {
                previousActiveElement.focus();
            }
        }
    });
}

function hideAddModal() {
    const modal = document.getElementById('add-stats-modal');
    const modalContent = document.getElementById('addStatsModalContent');
    
    if (modal && modalContent) {
        modalContent.classList.remove('opacity-100', 'scale-100');
        modalContent.classList.add('opacity-0', 'scale-95');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            
            if (statsForm) {
                statsForm.reset();
            }
            
            currentStatId = null;
        }, 200);
    }
}