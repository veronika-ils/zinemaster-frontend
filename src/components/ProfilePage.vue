<template>

  <header class="bg-dark text-white p-3 fixed-top shadow-sm">
        <div class="container d-flex justify-content-between align-items-center">
            <h4 class="mb-0">ZineMaster</h4>
            <nav>
                <router-link to="/main" class="btn btn-outline-light btn-sm me-2">Дома</router-link> 
                <router-link to="/requests" class="btn btn-outline-light btn-sm me-2">Сите нарачки</router-link>
                <button class="btn btn-outline-light btn-sm me-2" @click="logout">Logout</button>
                
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
            <p class="text-muted">@{{ user.username }}</p>

            <ul class="list-group text-start mt-3">
              <li class="list-group-item"><strong>Адреса:</strong> {{ user.address }}</li>
              <li class="list-group-item"><strong>Тип:</strong> {{ user.userType }}</li>
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
  <div v-if="requests.length === 0" class="mt-3 text-muted">Нема нарачки.</div>
  <div class="row">
    <div v-for="req in requests" :key="req.id" class="col-md-6 mb-3">
      <div class="card h-100 shadow-sm text-dark" :class="statusClass(req.status)">
        <div class="card-body d-flex align-items-start">
          <!-- Икона лево -->
          <div class="me-3 fs-2">
            <span v-if="req.status === 'approved'" class="text-success">✔️</span>
            <span v-else-if="req.status === 'pending'" class="text-warning">⏳</span>
            <span v-else-if="req.status === 'denied'" class="text-danger">❌</span>
          </div>
          <!-- Текст десно -->
          <div>
            <h5 class="card-title mb-1">Нарачка <strong>{{ req.id }}</strong></h5>
            <p class="mb-1"><strong>Датум:</strong> {{ req.requestDate }}</p>
            <p class="mb-0"><strong>Статус:</strong> {{ req.status }}</p>

            <!-- so kopce ili bez kopce da e?-->
          <button 
            class="btn btn-sm mt-2 text-dark"
            :class="buttonClass(req.status)"
            @click="toggleDetails(req.id)">
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

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref({});
const requests = ref([]);
const userProfileImage = ref(null);
const fileInput = ref(null);
const expandedRequests = ref([]);

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
      alert("Не може да се вчитаат детали за нарачката.");
      return;
    }
  }

  expandedRequests.value.push(requestId);
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const newUrl = e.target.result;
    userProfileImage.value = newUrl;



    console.log(user.value.id)
    const res = await fetch(`http://localhost:8081/api/users/${user.value.id}/profile-pic`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profilePic: newUrl })
    });

    if (res.ok) {
      user.value.profilePic = newUrl;
      localStorage.setItem("user", JSON.stringify(user.value));
    }
  };

  reader.readAsDataURL(file); 
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
</script>
