const URL = "http://localhost:8080/api";
const URL_INFO = "http://localhost:8080/api/user";

const roleList = []
$(document).ready( function () {
    getAllUsers();
    fetch(URL + '/admin')
        .then(response => response.json())
        .then(users => {
            users.forEach(user => {
                user.roles.forEach(role => {
                    if (!roleList.some(r => r.id === role.id)) {
                        roleList.push(role);
                    }
                });
            });
        })
        .catch(error => console.error("Ошибка загрузки ролей:", error));

})

function showRoles(form, selectedRoles = []) {
    $(`[name="roles"]`, form).empty();
    roleList.forEach(role => {
        let isSelected = selectedRoles.some(r => r.id === role.id) ? "selected" : "";
        let option = `<option value="${role.id}" ${isSelected}>
                         ${role.name.replace(/^ROLE_/, '')}
                      </option>`;
        $(`[name="roles"]`, form).append(option);
    });
}


function getRole(form) {
    let role = []
    let options = $(`[name="roles"]`, form)[0].options
    for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
            role.push(roleList[i])
        }
    }
    return role
}

function getAllUsers() {
    const usersTable = $('.users-table')
    usersTable.empty()
    fetch(URL + '/admin')
        .then(response => response.json())
        .then(users => {
            users.forEach(user => {
                let row = `$(
                    <tr>
                        <td style="text-align: center;">${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.lastName}</td>
                        <td style="text-align: center;">${user.age}</td>
                        <td>${user.username}</td>
                        <td style="text-align: center;">${user.roles.map(r => r.name.substring(5))}</td>  
                        <td style="text-align: center;">
                            <button type="button" class="btn btn-info text-white" data-bs-toggle="modal"
                            onclick="editModal(${user.id})">Edit</button>
                        </td>
                        <td style="text-align: center;">
                            <button type="button" class="btn btn-danger" data-bs-toggle="modal" 
                            onclick="deleteModal(${user.id})">Delete</button>
                        </td>
                    </tr>
                )`
                usersTable.append(row)
            })
        })
        .catch(err => console.log(err))
}

function addUser(){
    let newUserForm = $('#new-user-form')[0]
    showRoles(newUserForm);
    newUserForm.addEventListener("submit", (ev) => {
        ev.preventDefault()
        ev.stopPropagation()

        let addUser = JSON.stringify({
            username:  $(`[name="username"]` , newUserForm).val(),
            name:  $(`[name="name"]` , newUserForm).val(),
            lastname:  $(`[name="lastname"]` , newUserForm).val(),
            age:  $(`[name="age"]` , newUserForm).val(),
            password:  $(`[name="password"]` , newUserForm).val(),
            roles: getRole(newUserForm)
        })
        fetch(URL + '/addUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: addUser
        }).then(r => {
            newUserForm.reset()
            if(!r.ok) {
                alert("User with this username already exist!!")
            }else {
                $('#users-table-tab')[0].click()
            }
        })
    })
}

function showModal(form, modal, id) {
    modal.show()
    showRoles(form)
    fetch(URL + `/users/${id}`).then(response => {
        response.json().then(user => {
            $(`[name="username"]`,form).val(user.username)
            $(`[name="id"]`,form).val(user.id)
            $(`[name="name"]`,form).val(user.name)
            $(`[name="lastname"]`,form).val(user.lastName)
            $(`[name="age"]`,form).val(user.age)
            $(`[name="password"]`,form).val(user.password)
        })
    })
}

function editModal(id) {
    const editModal = new bootstrap.Modal($('.edit-modal'))
    const editForm = $('#edit-form')[0]
    showModal(editForm, editModal, id)
    editForm.addEventListener('submit', (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
        let newUser = JSON.stringify({
            id: $(`[name="id"]` , editForm).val(),
            username:  $(`[name="username"]` , editForm).val(),
            name:  $(`[name="name"]` , editForm).val(),
            lastname:  $(`[name="lastname"]` , editForm).val(),
            age:  $(`[name="age"]` , editForm).val(),
            password:  $(`[name="password"]` , editForm).val(),
            roles: getRole(editForm)
        })
        fetch(URL + `/update/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: newUser
        }).then(r => {
            editModal.hide()
            $('#users-table-tab')[0].click()
            if(!r.ok) {
                alert("User with this email already exist!!")
            }
        })
    })
}

function deleteModal(id) {
    const deleteModal = new bootstrap.Modal(document.querySelector('.delete-modal')); // Исправил
    const deleteForm = document.querySelector('#delete-form'); // Исправил

    showModal(deleteForm, deleteModal, id);

    deleteForm.addEventListener('submit', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        fetch(URL + `/deleteUser/${id}`, {
            method: 'DELETE'
        })
            .then(r => {
                deleteModal.hide();
                document.querySelector('#users-table-tab').click();
                if (!r.ok) {
                    alert("Deleting process failed!!");
                }
            })
            .catch(error => console.error("Error deleting user:", error)); // Добавил обработку ошибок
    });
}


async function getPage() {
    try {
        const response = await fetch(URL_INFO);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const user = await response.json();
        getHeader(user);
    } catch (error) {
        console.error(error);
    }
}

function getHeader(user) {
    const usernameElement = document.getElementById("top-username");
    const roleElement = document.getElementById("top-role");

    usernameElement.textContent = user.email;

    let roles = '';
    user.roles.forEach(role => {
        roles += role.name.replace("ROLE_", '') + ' ';
    });

    roleElement.textContent = roles.trim();
}
getPage();