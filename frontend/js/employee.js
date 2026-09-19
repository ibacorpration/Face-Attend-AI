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

    document.getElementById('edit-employee-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-emp-id').value;
        const code = document.getElementById('edit-emp-code').value;
        const name = document.getElementById('edit-emp-name').value;
        const dept = document.getElementById('edit-emp-dept').value;
        const status = document.getElementById('edit-emp-status').value;
        
        try {
            await fetchAPI(`/employees/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    employee_code: code,
                    full_name: name,
                    department: dept,
                    status: status
                })
            });
            Toast.show('Employee updated successfully', 'success');
            closeEditModal();
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
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-right: 0.5rem;" onclick="openEditModal(${emp.id}, '${emp.employee_code}', '${emp.full_name}', '${emp.department || ''}', '${emp.status}')">Edit</button>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; color: #ef4444; border-color: #ef4444;" onclick="deleteEmployee(${emp.id})">Delete</button>
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

function openEditModal(id, code, name, dept, status) {
    document.getElementById('edit-emp-id').value = id;
    document.getElementById('edit-emp-code').value = code;
    document.getElementById('edit-emp-name').value = name;
    document.getElementById('edit-emp-dept').value = dept;
    document.getElementById('edit-emp-status').value = status;
    document.getElementById('edit-modal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('active');
    document.getElementById('edit-employee-form').reset();
}

async function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
        try {
            await fetchAPI(`/employees/${id}`, {
                method: 'DELETE'
            });
            Toast.show('Employee deleted successfully', 'success');
            loadEmployees();
        } catch (error) {
            Toast.show(error.message, 'error');
        }
    }
}
