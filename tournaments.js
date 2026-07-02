// Tournament Management
let tournaments = [];
let currentTournament = null;

// Load tournaments on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTournaments();
    loadLeaderboard();
});

async function loadTournaments() {
    try {
        tournaments = await TournamentDB.getTournaments();
        
        // If no tournaments in database, use mock data
        if (tournaments.length === 0) {
            tournaments = getMockTournaments();
        }
        
        displayTournaments();
    } catch (error) {
        console.error('Error loading tournaments:', error);
        tournaments = getMockTournaments();
        displayTournaments();
    }
}

function getMockTournaments() {
    return [
        {
            id: 1,
            name: 'Elite Championship',
            description: 'The ultimate test of skill and strategy',
            prizePool: '₹50,000',
            entryFee: '₹199',
            maxParticipants: 100,
            currentParticipants: 67,
            status: 'ongoing',
            startDate: '2026-07-05',
            format: 'Best of 3'
        },
        {
            id: 2,
            name: 'Squad Strike',
            description: 'Team-based competitive tournament',
            prizePool: '₹100,000',
            entryFee: '₹499',
            maxParticipants: 50,
            currentParticipants: 42,
            status: 'upcoming',
            startDate: '2026-07-10',
            format: '4v4 Squad'
        },
        {
            id: 3,
            name: 'Quick Fire Duel',
            description: '1v1 rapid-fire matches',
            prizePool: '₹25,000',
            entryFee: '₹99',
            maxParticipants: 200,
            currentParticipants: 156,
            status: 'ongoing',
            startDate: '2026-07-02',
            format: '1v1 Best of 5'
        },
        {
            id: 4,
            name: 'Legendary Showdown',
            description: 'For the most hardcore players',
            prizePool: '₹250,000',
            entryFee: '₹999',
            maxParticipants: 32,
            currentParticipants: 28,
            status: 'upcoming',
            startDate: '2026-07-15',
            format: 'Round Robin + Finals'
        }
    ];
}

function displayTournaments() {
    const container = document.getElementById('tournamentsContainer');
    if (!container) return;

    container.innerHTML = tournaments.map(tournament => `
        <div class="tournament-card" onclick="viewTournament(${tournament.id})">
            <h3>${tournament.name}</h3>
            <p>${tournament.description}</p>
            <div class="tournament-info">
                <span>💰 ${tournament.prizePool}</span>
                <span class="tournament-badge">${tournament.status.toUpperCase()}</span>
            </div>
            <div class="tournament-info">
                <span>👥 ${tournament.currentParticipants}/${tournament.maxParticipants}</span>
                <span>🎮 ${tournament.format}</span>
            </div>
            <div class="tournament-info">
                <span>Entry: ${tournament.entryFee}</span>
            </div>
        </div>
    `).join('');
}

function viewTournament(tournamentId) {
    currentTournament = tournaments.find(t => t.id === tournamentId);
    
    if (!currentTournament) return;

    document.getElementById('modalTitle').textContent = currentTournament.name;
    document.getElementById('modalPrize').textContent = currentTournament.prizePool;
    document.getElementById('modalParticipants').textContent = 
        `${currentTournament.currentParticipants}/${currentTournament.maxParticipants}`;
    document.getElementById('modalFee').textContent = currentTournament.entryFee;
    document.getElementById('modalStatus').textContent = currentTournament.status.toUpperCase();
    document.getElementById('modalDescription').textContent = currentTournament.description;

    document.getElementById('registerBtn').onclick = () => registerTournament();
    
    openModal('tournamentModal');
}

function registerTournament() {
    if (!AuthManager.isAuthenticated()) {
        showNotification('Please login to register', 'error');
        closeModal('tournamentModal');
        openModal('authModal');
        return;
    }

    if (!currentTournament) return;

    document.getElementById('paymentTournament').textContent = currentTournament.name;
    document.getElementById('paymentAmount').textContent = currentTournament.entryFee;
    
    closeModal('tournamentModal');
    openModal('paymentModal');
}

async function loadLeaderboard() {
    try {
        const leaderboard = await LeaderboardDB.getLeaderboard(10);
        displayLeaderboard(leaderboard);
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        const mockLeaderboard = getMockLeaderboard();
        displayLeaderboard(mockLeaderboard);
    }
}

function getMockLeaderboard() {
    return [
        { id: 1, username: 'ShadowNinja', wins: 45, points: 4500, tournaments_played: 12 },
        { id: 2, username: 'CrimsonStrike', wins: 38, points: 4100, tournaments_played: 11 },
        { id: 3, username: 'PhantomKiller', wins: 32, points: 3800, tournaments_played: 10 },
        { id: 4, username: 'VortexMaster', wins: 28, points: 3400, tournaments_played: 9 },
        { id: 5, username: 'IceBlaze', wins: 24, points: 3100, tournaments_played: 8 },
        { id: 6, username: 'ThunderStorm', wins: 21, points: 2800, tournaments_played: 7 },
        { id: 7, username: 'Nexus Pro', wins: 18, points: 2500, tournaments_played: 6 },
        { id: 8, username: 'Spectral', wins: 15, points: 2200, tournaments_played: 5 },
        { id: 9, username: 'Inferno', wins: 12, points: 1900, tournaments_played: 4 },
        { id: 10, username: 'Rogue', wins: 9, points: 1600, tournaments_played: 3 }
    ];
}

function displayLeaderboard(leaderboard) {
    const tbody = document.getElementById('leaderboardBody');
    if (!tbody) return;

    tbody.innerHTML = leaderboard.map((player, index) => `
        <tr>
            <td><strong>${index + 1}</strong></td>
            <td>${player.username}</td>
            <td>${player.wins}</td>
            <td>${player.points}</td>
            <td>${player.tournaments_played}</td>
        </tr>
    `).join('');
}