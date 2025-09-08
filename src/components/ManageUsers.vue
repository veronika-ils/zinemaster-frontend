<template>
    <header class="bg-dark text-white p-3 fixed-top shadow-sm">
        <div class="container d-flex justify-content-between align-items-center">
            <h4 class="mb-0">ZineMaster</h4>
            <nav>  
              <router-link to="/main" class="btn btn-outline-light btn-sm me-2">Дома</router-link> 
                <router-link to="/requests" class="btn btn-outline-light btn-sm me-2">Сите нарачки</router-link>
                <button class="btn btn-outline-light btn-sm me-2" @click="logout">Logout</button>
                <router-link to="/profile">
                  <img :src="userProfileImage" alt="Profile" class="rounded-circle me-2 " style="width: 35px; height: 35px; object-fit: cover; border: 2px solid white; cursor: pointer;"/>
                </router-link>
                

            </nav>
            
        </div>
    </header>


  <div class="container mt-5 pt-5">

    <div v-if="loading" class="alert alert-info">Се вчитува...</div>
    <div v-if="error" class="alert alert-danger">Грешка при вчитување на корисниците.</div>

    <button class="btn btn-success mb-3" @click="toggleAddUserForm">
  {{ showAddUserForm ? 'Откажи' : 'Додади нов корисник' }}
</button>
<!--za dodadavnej-->
<form v-if="showAddUserForm" @submit.prevent="createUser" class="border rounded p-3 mb-4 bg-light">
  <h5>Нов корисник</h5>
  
  <div class="mb-2">
    <input v-model="newUser.name" type="text" class="form-control" placeholder="Име" required>
  </div>

  <div class="mb-2">
    <input v-model="newUser.surname" type="text" class="form-control" placeholder="Презиме" required>
  </div>

  <div class="mb-2">
    <input v-model="newUser.startDate" type="date" class="form-control" required>
  </div>

  <div class="mb-2">
    <input v-model="newUser.email" type="email" class="form-control" placeholder="Email адреса" required>
  </div>

  <div class="mb-2">
    <select v-model="newUser.userType" class="form-select" required>
      <option disabled value="">Избери тип</option>
      <option value="Worker">Работник</option>
      <option value="ProductAdministrator">Администратор на продукти</option>
      <option value="UserAdministrator">Администратор на корисници</option>
    </select> 
  </div>

  <div class="mb-3">
    <label for="address" class="form-label">Адреса</label>
    <select v-model="newUser.address" class="form-select" required>
      <option disabled value="">Избери адреса</option>
      <option value="Main Warehouse">Главен Магацин</option>
      <option value="Office A">Канцеларија А</option>
      <option value="Ohrids Warehouse B">Магацин Б во Охрид</option>
      <option value="Office C">Канцеларија Ц</option>
    </select>
  </div>

  <button type="submit" class="btn btn-primary">Зачувај</button>
</form>

<!--za azuriranje-->
<form v-if="editUserForm" @submit.prevent="updateUser" class="border rounded p-3 mb-4 bg-light">
  <h5>Уреди корисник</h5>
  
  <div class="mb-2">
    <input v-model="editUser.name" type="text" class="form-control" placeholder="Име" required>
  </div>

  <div class="mb-2">
    <input v-model="editUser.surname" type="text" class="form-control" placeholder="Презиме" required>
  </div>

  <div class="mb-2">
    <input v-model="editUser.startDate" type="date" class="form-control" required>
  </div>

  <div class="mb-2">
    <input v-model="editUser.email" type="email" class="form-control" placeholder="Email" required>
  </div>

  <div class="mb-2">
    <select v-model="editUser.address" class="form-select" required>
      <option disabled value="">Избери адреса</option>
      <option value="Main Warehouse">Главен Магацин</option>
      <option value="Office A">Канцеларија А</option>
      <option value="Ohrids Warehouse B">Магацин Б во Охрид</option>
      <option value="Office C">Канцеларија Ц</option>
    </select>
  </div>

  <button type="submit" class="btn btn-primary me-2">Зачувај</button>
  <button type="button" class="btn btn-secondary" @click="cancelEdit">Откажи</button>
</form>




    <table v-if="!loading && !error" class="table table-striped">
      <thead>
        <tr>
          <th>Име</th>
          <th style="cursor: pointer;" @click="sortByStartDate">
            Почетен датум
          </th>
          <th>Тип на корисник</th>
          <th>Промена на типот на корисник </th>
          <th>Активен?</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.name }} {{ u.surname }}</td>
          <td>{{ u.startDate }}</td>
          <td>{{ typeWorkerToMacedonian(u.userType) }}</td>
          <td>
  <div v-if="u.access === 0">
   <div class="text-danger small">Нема пристап – прво одобри пристап.</div>
  </div>
  <div v-else>
    <select v-model="u.newRole" class="form-select form-select-sm w-auto d-inline-block me-2" :disabled="u.id === currentUser.id">
      <option value="Worker">Работник</option>
      <option value="ProductAdministrator">Администратор на продукти</option>
      <option value="UserAdministrator">Администратор на корисници</option>
    </select>
    <button class="btn btn-sm btn-primary" @click="updateRole(u)" :disabled="u.id === currentUser.id || u.userType === u.newRole">
      Промени
    </button>
  </div>
</td>
<td>
  <label class="switch">
    <input type="checkbox" :checked="u.access === 1" @change="toggleAccess(u)" :disabled="u.userType === 'UserAdministrator'">
    <span class="slider round"></span>
  </label>
</td>
<td>
  <button class="btn btn-sm btn-outline-secondary me-2" @click="startEdit(u)" v-if="currentUser.userType === 'UserAdministrator'" :disabled="u.userType === 'UserAdministrator' || u.id === currentUser.id" >
    🖉 Уреди
  </button>
</td>


        </tr>
      </tbody>
    </table>


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2'//za poubavi confirms i alerts


const router = useRouter();
const users = ref([]);
const currentUser = ref({});
const loading = ref(true);
const error = ref(false);
const userProfileImage = ref("https://www.gravatar.com/avatar/?d=mp"); 
const sortOrder = ref('asc');

const typeWorkerToMacedonian = (type) =>{
  switch (type) {
    case 'Worker': return 'Работник';
    case 'ProductAdministrator': return 'Администратор на продукти';
    case 'UserAdministrator': return 'Администратор на корисници';
    default: return type;
  }
}

onMounted(async () => {
  const stored = localStorage.getItem('user');
  if (!stored) {
    router.push('/login');
    return;
  }

  currentUser.value = JSON.parse(stored);
  userProfileImage.value = currentUser.value.profilePic || "https://www.gravatar.com/avatar/?d=mp";

  try {
    const res = await fetch('http://localhost:8081/api/users');
    if (!res.ok) throw new Error();
    const data = await res.json();
    users.value = data.map(u => ({
      ...u,
      newRole: u.userType //na site properties plus dodavame nov propertie za newRole
    }));
    loading.value = false;
  } catch (e) {
    error.value = true;
    loading.value = false;
  }
});

const updateRole = async (user) => {
  const result = await Swal.fire({
    title: 'Промена на улога',
    text: `Дали сте сигурни дека сакате да ја промените улогата на ${user.username} во ${typeWorkerToMacedonian(user.newRole)}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Да, промени',
    cancelButtonText: 'Откажи'
  });

  if (!result.isConfirmed) return;

  const res = await fetch(`http://localhost:8081/api/users/${user.id}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userType: user.newRole })
  });

  if (res.ok) {
     Swal.fire({
      icon: 'success',
      title: 'Успешно',
      text: 'Улогата е успешно променета.'
    });
    user.userType = user.newRole;
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Грешка',
      text: 'Неуспешна промена на улога.'
    });
  }
};
const toggleAccess = async (u) => {
  const newAccess = u.access === 1 ? 0 : 1;

  const res = await fetch(`http://localhost:8081/api/users/${u.id}/access`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access: newAccess })
  });

  if (res.ok) {
    Swal.fire({
  icon: 'success',
  title: 'Успешна промена',
  text: `Пристапот е ${newAccess === 1 ? 'одобрен' : 'одземен'}.`
});
    await fetchUsers();
  } else {
    
    Swal.fire({
      icon: 'error',
      title: 'Грешка',
      text: 'Грешка при менување на пристап.'
    });
  }
};

const fetchUsers = async () => {
  try {
    const res = await fetch('http://localhost:8081/api/users');
    if (!res.ok)Swal.fire({
      icon: 'error',
      title: 'Грешка',
      text: 'Грешка при вчитување на корисниците.'
    });

    users.value = await res.json();
  } catch (err) {
    console.error(err);
  }
};

const sortByStartDate = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  users.value.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);

    return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

const showAddUserForm = ref(false);
const newUser = ref({
  name: '',
  surname: '',
  startDate: new Date().toISOString().split('T')[0],//denesen datum e default
  userType: 'Worker',
  address: '',
   email: ''
});

const createUser = async () => {
  if (!newUser.value.name || !newUser.value.surname || !newUser.value.startDate) {
    Swal.fire({
      icon: 'warning',
      title: 'Недостасуваат полиња',
      text: 'Пополнете ги сите полиња.'
    });
    return;
  }

  const password = 'test123';//default


  const res = await fetch('http://localhost:8081/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: newUser.value.name,
      surname: newUser.value.surname,
      startDate: newUser.value.startDate,
      userType: newUser.value.userType,
      password,
      access: 1,
      address: newUser.value.address,
       email: newUser.value.email 
    })
  });

  if (res.ok) {
    await Swal.fire({
      icon: 'success',
      title: 'Успешно!',
      text: 'Корисникот е додаден.'
    });
    showAddUserForm.value = false;
    newUser.value = {
    name: '',
    surname: '',
    startDate: new Date().toISOString().split('T')[0],
    userType: 'Worker',
    address: '',
    email: ''
  };
    await fetchUsers();
  } else {
     Swal.fire({
      icon: 'error',
      title: 'Грешка!',
      text: 'Настана грешка при додавање.'
    });
  }
};

const logout = () => {
    localStorage.removeItem('user');
    router.push('/login');
};
const resetForm = () => {
  newUser.value = {
    name: '',
    surname: '',
    startDate: new Date().toISOString().split('T')[0],
    userType: 'Worker',
    address: '',
    email: ''
  };
};

const toggleAddUserForm = () => {
  showAddUserForm.value = !showAddUserForm.value;
  if (!showAddUserForm.value) {
    resetForm(); 
  }
};

const editUserForm = ref(false);
const editUser = ref({});

const startEdit = (user) => {
  editUser.value = { ...user }; // copy od podatocite
  editUserForm.value = true;
};

const cancelEdit = () => {
  editUserForm.value = false;
  editUser.value = {};
};

const updateUser = async () => {
  const res = await fetch(`http://localhost:8081/api/users/${editUser.value.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(editUser.value)
  });

  if (res.ok) {
    await Swal.fire({
      icon: 'success',
      title: 'Успешно!',
      text: 'Корисникот е ажуриран.'
    });
    editUserForm.value = false;
    await fetchUsers();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Грешка!',
      text: 'Не може да се ажурира корисникот.'
    });
  }
};






</script>
<style lang="css" scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0;
  right: 0; bottom: 0;
  background-color: #e74c3c; 
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2ecc71; 
}

input:checked + .slider:before {
  transform: translateX(22px);
}

input[type="checkbox"]:disabled + .slider {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

</style>
