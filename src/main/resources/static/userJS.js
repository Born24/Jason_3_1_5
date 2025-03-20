const URL = "http://localhost:8080/api/user";

async function getPage() {
    try {
        const response = await fetch(URL);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const user = await response.json();
        getHeader(user);
        getUserInfo(user);
    } catch (error) {
        console.error(error);
    }
}

function getHeader(user) {
    const usernameElement = document.getElementById("topusername");
    const roleElement = document.getElementById("toprole");

    usernameElement.textContent = user.email;

    let roles = '';
    user.roles.forEach(role => {
        roles += role.name.replace("ROLE_", '') + ' ';
    });

    roleElement.textContent = roles.trim();
}

function getUserInfo(user) {
    const tableBody = document.getElementById('tableuser');
    const roles = user.roles.map(role => role.name.replace("ROLE_", '')).join(', ');

    const dataHtml = `<tr>
        <td style="text-align: center;">${user.id}</td>
        <td>${user.name}</td>
        <td>${user.surname}</td>
        <td style="text-align: center;">${user.age}</td>
        <td>${user.username}</td>
        <td style="text-align: center;">${roles}</td>
    </tr>`;

    tableBody.innerHTML = dataHtml;
}

getPage();