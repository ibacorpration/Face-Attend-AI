document.addEventListener('DOMContentLoaded', async () => {
    Auth.requireAuth();
    await loadDashboardStats();
});

async function loadDashboardStats() {
    try {
        const [employees, attendance] = await Promise.all([
            fetchAPI('/employees/'),
            fetchAPI('/attendance/daily')
        ]);
        
        document.getElementById('stat-employees').textContent = employees.length;
        document.getElementById('stat-checkins').textContent = attendance.length;
        
        populateRecentActivity(attendance, employees);
    } catch (error) {
        console.error("Failed to load dashboard data");
    }
}

function populateRecentActivity(attendance, employees) {
    const tbody = document.getElementById('recent-activity-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Sort by most recent
    attendance.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Map employee names
    const empMap = {};
    employees.forEach(e => empMap[e.id] = e.full_name);
    
    attendance.slice(0, 5).forEach(record => {
        const tr = document.createElement('tr');
        
        const statusBadge = record.needs_review 
            ? '<span class="badge badge-warning">Review Needed</span>'
            : (record.status === 'present' ? '<span class="badge badge-success">Match</span>' : '<span class="badge badge-warning">Borderline</span>');
            
        tr.innerHTML = `
            <td>${empMap[record.employee_id] || 'Unknown'}</td>
            <td>${formatDate(record.created_at)}</td>
            <td>${statusBadge}</td>
            <td>${record.similarity_score ? (record.similarity_score * 100).toFixed(1) + '%' : '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}
