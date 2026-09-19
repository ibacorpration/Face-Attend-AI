document.addEventListener('DOMContentLoaded', () => {
    Auth.requireAuth();
    loadEmployees();

    document.getElementById('add-employee-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('emp-code').value;
        const name = document.getElementById('emp-name').value;
        const dept = document.getElementById('emp-dept').value;
        const faceFile = document.getElementById('emp-face').files[0];
        
        try {
            // 1. Create Employee
            const empData = await fetchAPI('/employees/', {
                method: 'POST',
                body: JSON.stringify({
                    employee_code: code,
                    full_name: name,
                    department: dept
                })
            });
            
            // 2. Upload Face
            if (faceFile && empData.id) {
                const formData = new FormData();
                formData.append('file', faceFile);
                await fetchAPI(`/employees/${empData.id}/face`, {
                    method: 'POST',
                    body: formData
                });
            }
            
            Toast.show('Employee added and face registered successfully', 'success');
            closeAddModal();
            loadEmployees();
        } catch (error) {
            Toast.show(error.message, 'error');
        }
    });
});

async function loadEmployees() {
    try {
        const employees = await fetchAPI('/employees/');
        const tbody = document.getElementById('employees-body');
        tbody.innerHTML = '';
        
        employees.forEach(emp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${emp.employee_code}</td>
                <td>${emp.full_name}</td>
                <td>${emp.department || '-'}</td>
                <td><span class="badge ${emp.status === 'active' ? 'badge-success' : 'badge-danger'}">${emp.status}</span></td>
                <td>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">Edit</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        Toast.show('Failed to load employees', 'error');
    }
}

function openAddModal() {
    document.getElementById('add-modal').classList.add('active');
}

function closeAddModal() {
    document.getElementById('add-modal').classList.remove('active');
    document.getElementById('add-employee-form').reset();
}
