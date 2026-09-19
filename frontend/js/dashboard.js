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
        
        // Calculate Metrics
        const totalEmployees = employees.length;
        const totalCheckins = attendance.length;
        
        let lateCount = 0;
        const workStartTime = "09:00:00"; // Define Late threshold

        attendance.forEach(record => {
            const checkInTime = new Date(record.check_in).toTimeString().split(' ')[0];
            if (checkInTime > workStartTime) {
                lateCount++;
            }
        });

        const absentCount = totalEmployees - totalCheckins;

        document.getElementById('stat-employees').textContent = totalEmployees;
        document.getElementById('stat-present').textContent = totalCheckins;
        document.getElementById('stat-late').textContent = lateCount;
        document.getElementById('stat-absent').textContent = absentCount > 0 ? absentCount : 0;
        
        populateRecentActivity(attendance, employees);
        renderChart(); // Mocked 7-day data for visualization
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
        
        const checkInTime = new Date(record.check_in).toTimeString().split(' ')[0];
        const isLate = checkInTime > "09:00:00";
        
        let statusBadge = record.needs_review 
            ? '<span class="badge badge-warning">Review Needed</span>'
            : (isLate ? '<span class="badge badge-warning">Late</span>' : '<span class="badge badge-success">On Time</span>');
            
        tr.innerHTML = `
            <td>${empMap[record.employee_id] || 'Unknown'}</td>
            <td>${formatDate(record.check_in).split(',')[1]}</td>
            <td>${statusBadge}</td>
            <td>${record.similarity_score ? (record.similarity_score * 100).toFixed(0) + '%' : '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderChart() {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    // Generate last 7 days labels
    const labels = [];
    for(let i=6; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('en-US', {weekday: 'short'}));
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Present Employees',
                data: [42, 45, 41, 46, 40, 44, document.getElementById('stat-present').textContent],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

async function exportAttendanceCSV() {
    try {
        const response = await fetch(`${API_BASE_URL}/attendance/export?target_date=${new Date().toISOString().split('T')[0]}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
            }
        });
        
        if (!response.ok) throw new Error('Export failed');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        Toast.show('Export downloaded successfully', 'success');
    } catch(err) {
        Toast.show('Failed to download report', 'error');
    }
}
