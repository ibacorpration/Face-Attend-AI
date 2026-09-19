document.addEventListener('DOMContentLoaded', () => {
    Auth.requireAuth();
    
    const datePicker = document.getElementById('date-picker');
    datePicker.valueAsDate = new Date();
    
    datePicker.addEventListener('change', (e) => {
        loadAttendance(e.target.value);
    });
    
    loadAttendance(datePicker.value);
});

async function loadAttendance(dateStr) {
    try {
        const [attendance, employees] = await Promise.all([
            fetchAPI(`/attendance/daily?target_date=${dateStr}`),
            fetchAPI('/employees/')
        ]);
        
        const empMap = {};
        employees.forEach(e => empMap[e.id] = e.full_name);
        
        const tbody = document.getElementById('attendance-body');
        tbody.innerHTML = '';
        
        attendance.forEach(record => {
            const tr = document.createElement('tr');
            
            let statusBadge = '';
            if (record.needs_review) {
                statusBadge = '<span class="badge badge-warning">Needs Review</span>';
            } else if (record.status === 'present') {
                statusBadge = '<span class="badge badge-success">Present</span>';
            } else {
                statusBadge = `<span class="badge badge-outline">${record.status}</span>`;
            }
            
            tr.innerHTML = `
                <td>${empMap[record.employee_id] || 'Unknown'}</td>
                <td>${record.date}</td>
                <td>${formatDate(record.check_in).split(',')[1] || '-'}</td>
                <td>${formatDate(record.check_out).split(',')[1] || '-'}</td>
                <td>${statusBadge}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        Toast.show('Failed to load attendance logs', 'error');
    }
}
