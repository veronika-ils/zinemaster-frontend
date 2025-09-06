<template>

  <header class="bg-dark text-white p-3 fixed-top shadow-sm">
        <div class="container d-flex justify-content-between align-items-center">
            <h4 class="mb-0">ZineMaster</h4>
            <nav>
                <router-link to="/main" class="btn btn-outline-light btn-sm me-2">Дома</router-link> 
                <router-link to="/requests" class="btn btn-outline-light btn-sm me-2">Сите нарачки</router-link>
                 <RequestBell v-if="user.userType === 'ProductAdministrator'" />   
                <button class="btn btn-outline-light btn-sm me-2" @click="logout">Logout</button>
                <StatusBell v-if="user.userType === 'Worker' "/>
                <router-link v-if="user.userType === 'UserAdministrator'" to="/manage-users" class="btn btn-outline-warning btn-sm me-2">
                        Управувај со корисници
                </router-link>
                
            </nav>
        </div>
    </header>


  <div class="container mt-5 pt-5">
    <div class="row">
      
      <!-- korisnikot -->
      <div class="col-md-4">
        <div class="card shadow-sm" style="position: sticky; top: 110px; z-index: 100;">
          <div class="card-body text-center">
            <img :src="userProfileImage" class="rounded-circle mb-3"
              style="width: 100px; height: 100px; object-fit: cover; border: 2px solid #ccc;" 
              alt="Profile" @click="triggerFileInput"/>
            <input type="file" ref="fileInput" accept="image/*" @change="handleFileChange" style="display: none"/>
            <h4 class="card-title">{{ user.name }} {{ user.surname }}</h4>
            <p class="text-muted">{{ user.username }}</p>

            <ul class="list-group text-start mt-3">
              <li class="list-group-item"><strong>Адреса:</strong> {{ user.address }}</li>
              <li class="list-group-item"><strong>Тип:</strong> {{ typeWorkerToMacedonian(user.userType) }}</li>
              <li class="list-group-item"><strong>Старт:</strong> {{ user.startDate }}</li>
              <li class="list-group-item"><strong>Статус: </strong>
                <span :class="user.access ? 'text-success' : 'text-danger'">
                  {{ user.access ? 'Активен' : 'Неактивен' }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

     <!-- narackite -->
<div class="col-md-8">
  <h4>Мои нарачки</h4>
  <!--Filteri-->
<div class="mb-4">
  <div class="row g-2 align-items-center">
    <!-- Статус -->
    <div class="col-md-3">
      <label class="form-label mb-1">Статус:</label>
      <select v-model="selectedStatus" class="form-select">
        <option value="">Сите</option>
        <option value="pending">Во тек</option>
        <option value="approved">Одобрени</option>
        <option value="rejected">Одбиени</option>
      </select>
    </div>

    <!-- Датум -->
    <div class="col-md-3">
      <label class="form-label mb-1">Датум:</label>
      <input type="date" v-model="selectedDate" class="form-control" />
    </div>

    <!-- Радио филтер -->
    <div class="col-md-6 d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2 pt-md-4">
      <div class="form-check me-3">
        <input class="form-check-input" type="radio" id="dateFrom" value="from" v-model="dateFilterType">
        <label class="form-check-label" for="dateFrom">Од тој датум па натаму</label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" id="dateExact" value="exact" v-model="dateFilterType">
        <label class="form-check-label" for="dateExact">Само на тој датум</label>
      </div>
    </div>
  </div>
</div>



  <div v-if="filteredRequests.length === 0" class="mt-3 text-muted">Нема нарачки.</div>
  <div class="row">
    <div v-for="req in filteredRequests" :key="req.id" class="col-md-6 mb-3">
      <div class="card h-100 shadow-sm text-dark" :class="statusClass(req.status)">
        <div class="card-body d-flex align-items-start">
          <!-- ikona -->
          <div class="me-3 fs-2">
            <span v-if="req.status === 'approved'" class="text-success">✔️</span>
            <span v-else-if="req.status === 'pending'" class="text-warning">⏳</span>
            <span v-else-if="req.status === 'rejected'" class="text-danger">❌</span>
          </div>
          <!-- tekst -->
          <div>
            <h5 class="card-title mb-1">Нарачка <strong>{{ req.id }}</strong></h5>
            <p class="mb-1"><strong>Датум:</strong> {{ req.requestDate }}</p>
            <p class="mb-0"><strong>Статус:</strong> {{ statusToMacedonian(req.status) }}</p>
            <p v-if="req.processedBy && req.status !== 'pending' " class="mt-2 text-muted small">
            <span>{{req.status === 'approved' ? 'Одобрена од: ' : 'Одбиена од: ' }}</span> {{getUsernameById(req.processedBy)}}
          </p>
        


            <!-- so kopce ili bez kopce da e?-->
          <button 
            class="btn btn-sm mt-2 text-dark"
            :class="buttonClass(req.status)"
            @click="toggleDetails(req.id)" v-if="req.status != 'unavailable'">
                {{ expandedRequests.includes(req.id) ? 'Скриј производи' : 'Покажи производи' }}
          </button>

          <!-- proizvodite -->
          <div v-if="expandedRequests.includes(req.id)" class="mt-3">
            <ul class="list-group">
              <li v-for="item in req.items" :key="item.id" class="list-group-item">
                {{ item.productName || item.product?.name || 'Непознат производ' }} - {{ item.quantityRequested }} парчиња
              </li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

    </div>
</div>
  <button class="btn btn-sm btn-primary" @click="ping">Ping Admins</button>

</template>

<script setup>
import { ref, onMounted,computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';
import RequestBell from './RequestBell.vue';
import { useBell } from './useBell';
import StatusBell from './StatusBell.vue';

const token = localStorage.getItem("auth_token")
function getStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
const storedUser = getStoredUser()
const USERNAME_SAFE = (storedUser?.username) || localStorage.getItem('username') || ''
console.log('[ProfilePage] USERNAME_SAFE =', USERNAME_SAFE)

async function ping(){
   try {
    await axios.post('http://localhost:8081/api/dev/ping-admins', null,{
    headers: { Authorization: `Bearer ${token}` }
  }) // baseURL '/api' + this path
    // you should see the toast immediately if WS is connected
  } catch (e) {
    console.error('Ping failed:', e?.response?.status, e?.response?.data || e.message)
  }
}
const { startLiveAcknowledge, stopLiveAcknowledge , markAllRead} = useBell('status', USERNAME_SAFE)

const router = useRouter();
const user = ref({});
const requests = ref([]);
const userProfileImage = ref(null);
const fileInput = ref(null);
const expandedRequests = ref([]);
const selectedStatus = ref('');
const selectedDate = ref('');
const dateFilterType = ref('from'); 
const allUsers = ref([]);


const statusToMacedonian = (status) => {
  switch (status) {
    case 'approved': return 'Одобрено';
    case 'pending': return 'Во тек';
    case 'rejected': return 'Одбиено';
    default: return status;
  }
};

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

  user.value = JSON.parse(stored);
  userProfileImage.value = user.value.profilePic || "https://www.gravatar.com/avatar/?d=mp";
  console.log(user.value.access)


  const res = await fetch(`http://localhost:8081/api/requests/user/${user.value.id}`);
  if (res.ok) {
    requests.value = await res.json();
  }

  const userRes = await fetch('http://localhost:8081/api/users');
  if (userRes.ok) {
    allUsers.value = await userRes.json();
  }
  localStorage.setItem(`saved:${user.value.id}`,0);
   startLiveAcknowledge() // enter “reading” mode
   await markAllRead();

});
onBeforeUnmount(() => {
  stopLiveAcknowledge()  // exit “reading” mode; bell resumes normal behavior
})



const filteredRequests = computed(() => {
  return requests.value.filter(req => {
    const matchesStatus = selectedStatus.value === '' || req.status === selectedStatus.value;

    let matchesDate = true;
    if (selectedDate.value) {
      const reqDate = new Date(req.requestDate).toISOString().split('T')[0];
      const selected = new Date(selectedDate.value).toISOString().split('T')[0];

      if (dateFilterType.value === 'exact') {
        matchesDate = reqDate === selected;
      } else {
        matchesDate = reqDate >= selected;
      }
    }

    return matchesStatus && matchesDate;
  });
});



const logout = () => {
    localStorage.removeItem('user');
    router.push('/login');
};

const toggleDetails = async (requestId) => {
  const alreadyExpanded = expandedRequests.value.includes(requestId);
  if (alreadyExpanded) {
    expandedRequests.value = expandedRequests.value.filter(id => id !== requestId);
    return;
  }

  
  const req = requests.value.find(r => r.id === requestId);
  if (!req.items) {
    const res = await fetch(`http://localhost:8081/api/requests/${requestId}`);
    if (res.ok) {
      const fullRequest = await res.json();
      req.items = fullRequest.items; 
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Грешка',
        text: 'Не може да се вчитаат детали за нарачката.'
      });
      return;
    }
  }

  expandedRequests.value.push(requestId);
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];//od <input type="file">
  if (!file) return;

  const reader = new FileReader();//sluzi za citanje na fileovi od klientot
  reader.onload = async (e) => {//ova e 2
    const newUrl = e.target.result;
    userProfileImage.value = newUrl;



    console.log(user.value.id)
    const res = await fetch(`http://localhost:8081/api/users/${user.value.id}/profile-pic`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profilePic: newUrl })
    });

    if (res.ok) {
      user.value.profilePic = newUrl;//azurira
      localStorage.setItem("user", JSON.stringify(user.value));
      await Swal.fire({
        icon: 'success',
        title: 'Слика ажурирана',
        text: 'Профил сликата е успешно ажурирана.'
      });
    } else{
      await Swal.fire({
        icon: 'error',
        title: 'Грешка',
        text: 'Неуспешна промена на профил сликата.'
      });
    }
  };

  reader.readAsDataURL(file); //ova e 1
};


const statusClass = (status) => {
  switch (status) {
    case 'approved': return 'bg-success bg-opacity-25 border border-success rounded';
    case 'pending': return 'bg-warning bg-opacity-25 border border-warning rounded';
    case 'rejected': return 'bg-danger bg-opacity-25 border border-danger rounded';
    default: return 'bg-secondary bg-opacity-10 border rounded';
  }
};

const buttonClass = (status) => {
  switch (status) {
    case 'approved': return 'bg-success';      
    case 'pending': return 'bg-warning';       
    case 'rejected': return 'bg-danger';        
    default: return 'bg-secondary';
  }
};

const getUsernameById = (id) => {
  const u = allUsers.value.find(user => user.id === id);
  console.log(u)
  return u ? u.username : id;
};



</script>
