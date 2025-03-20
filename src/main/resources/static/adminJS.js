const URL = "http://localhost:8080/api";
const URL_INFO = "http://localhost:8080/api/user";

const roleList = [];

$(document).ready(function () {
    getAllUsers();
    fetch(URL + '/admin', {
        headers: { 'Accept': 'application/json' }
    })
        .then(response => response.json())
        .then(users => {
            users.forEach(user => {
                if (user.roles && Array.isArray(user.roles)) {
                    user.roles.forEach(role => {
                        if (!roleList.some(r => r.id === role.id)) {
                            roleList.push(role);
                        }
                    });
                }
            });
        })
        .catch(error => console.error("Ошибка загрузки ролей:", error));
});

function showRoles(form, selectedRoles = []) {
    const roleSelect = $(`[name="roles"]`, form);
    roleSelect.empty();

    roleList.forEach(role => {
        let isSelected = selectedRoles.some(r => r.id === role.id) ? "selected" : "";
        let option = `<option value="${role.id}" ${isSelected}>${role.name.replace(/^ROLE_/, '')}</option>`;
        roleSelect.append(option);
    });
}

function getRole(form) {
    let roles = [];
    let options = $(`[name="roles"]`, form)[0].options;
    for (let option of options) {
        if (option.selected) {
            let roleId = parseInt(option.value);
            let role = roleList.find(r => r.id === roleId);
            if (role) roles.push(role);
        }
    }
    return roles.map(role => role.id); // Отправляем только ID ролей
}

function getAllUsers() {
    const usersTable = $('.users-table');
    usersTable.empty();

    fetch(URL + '/admin', {
        headers: { 'Accept': 'application/json' }
    })
        .then(response => response.json())
        .then(users => {
            if (Array.isArray(users)) {
                users.forEach(user => {
                    let roles = user.roles?.map(role => role.name.replace(/^ROLE_/, '')).join(', ') || "No roles";

                    let row = `
                        <tr>
                            <td style="text-align: center;">${user.id || "N/A"}</td>
                            <td>${user.name || "N/A"}</td>
                            <td>${user.lastName || "N/A"}</td>
                            <td style="text-align: center;">${user.age || "N/A"}</td>
                            <td>${user.username || "N/A"}</td>
                            <td style="text-align: center;">${roles}</td>
                            <td style="text-align: center;">
                                <button type="button" class="btn btn-info text-white" data-bs-toggle="modal"
                                    onclick="editModal(${user.id})">Edit</button>
                            </td>
                            <td style="text-align: center;">
                                <button type="button" class="btn btn-danger" data-bs-toggle="modal" 
                                    onclick="deleteModal(${user.id})">Delete</button>
                            </td>
                        </tr>
                    `;
                    usersTable.append(row);
                });
            } else {
                console.error("Invalid users data:", users);
            }
        })
        .catch(err => console.error("Ошибка загрузки пользователей:", err));
}

function addUser() {
    let newUserForm = $('#new-user-form')[0];
    showRoles(newUserForm);

    $(newUserForm).off('submit').on('submit', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();

        let roles = getRole(newUserForm);
        let addUser = JSON.stringify({
            username: $(`[name="username"]`, newUserForm).val(),
            name: $(`[name="name"]`, newUserForm).val(),
            lastName: $(`[name="lastName"]`, newUserForm).val(),
            age: $(`[name="age"]`, newUserForm).val(),
            password: $(`[name="password"]`, newUserForm).val(),
            roles: roles
        });

        fetch(URL + '/addUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: addUser
        }).then(r => {
            if (!r.ok) {
                alert("User with this username already exists!");
            } else {
                $('#users-table-tab').click();
            }
        }).catch(error => console.error("Error adding user:", error));
    });
}

function showModal(form, modal, id) {
    modal.show();
    showRoles(form);

    fetch(URL + `/users/${id}`, {
        headers: { 'Accept': 'application/json' }
    })
        .then(response => response.json())
        .then(user => {
            if (user && typeof user === 'object') {
                $(`[name="username"]`, form).val(user.username);
                $(`[name="id"]`, form).val(user.id);
                $(`[name="name"]`, form).val(user.name);
                $(`[name="lastname"]`, form).val(user.lastName);
                $(`[name="age"]`, form).val(user.age);
                $(`[name="password"]`, form).val(user.password);
                showRoles(form, user.roles);
            } else {
                console.error("Invalid user data:", user);
            }
        })
        .catch(error => console.error("Error loading user data:", error));
}

function editModal(id) {
    const editModalElement = $('.edit-modal')[0];
    const editModal = new bootstrap.Modal(editModalElement);
    const editForm = $('#edit-form')[0];

    showModal(editForm, editModal, id);

    $(editForm).off('submit').on('submit', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();

        let roles = getRole(editForm);
        let updatedUser = JSON.stringify({
            id: $(`[name="id"]`, editForm).val(),
            username: $(`[name="username"]`, editForm).val(),
            name: $(`[name="name"]`, editForm).val(),
            lastName: $(`[name="lastname"]`, editForm).val(),
            age: $(`[name="age"]`, editForm).val(),
            password: $(`[name="password"]`, editForm).val(),
            roles: roles
        });

        fetch(URL + `/update/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: updatedUser
        }).then(r => {
            editModal.hide();
            $('#users-table-tab').click();
            if (!r.ok) {
                alert("User with this email already exists!");
            }
        }).catch(error => console.error("Error updating user:", error));
    });
}

function deleteModal(id) {
    const deleteModalElement = $('.delete-modal')[0];
    const deleteModal = new bootstrap.Modal(deleteModalElement);
    const deleteForm = $('#delete-form')[0];

    showModal(deleteForm, deleteModal, id);

    $(deleteForm).off('submit').on('submit', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();

        fetch(URL + `/delete/${id}`, {
            method: 'DELETE'
        }).then(r => {
            deleteModal.hide();
            $('#users-table-tab').click();
            if (!r.ok) {
                alert("Deleting process failed!");
            }
        }).catch(error => console.error("Error deleting user:", error));
    });
}

async function getPage() {
    try {
        const response = await fetch(URL_INFO, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const user = await response.json();
        getHeader(user);
    } catch (error) {
        console.error(error);
    }
}

function getHeader(user) {
    $("#top-username").text(user.username || "Unknown");
    $("#top-role").text(user.roles?.map(role => role.name.replace("ROLE_", '')).join(' ') || "No roles");
}

getPage();
