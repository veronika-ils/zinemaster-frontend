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

    <div class="d-flex justify-content-center flex-wrap gap-4 my-4 pt-5">

  <!-- status -->
  <div class="text-center">
    <label class="form-label"><strong>Статус</strong></label>
    <select v-model="selectedStatus" class="form-select form-select-sm">
      <option value="all">Сите</option>
      <option value="pending">Во тек</option>
      <option value="approved">Одобрени</option>
      <option value="rejected">Одбиени</option>
    </select>
  </div>

  <!-- datum -->
  <div class="text-center">
    <label class="form-label"><strong>Датум</strong></label>
    <input type="date" v-model="selectedDate" class="form-control form-control-sm">
  </div>

  <!-- korisnik -->
  <div class="text-center">
    <label class="form-label"><strong>Корисник</strong></label>
    <select v-model="selectedUser" class="form-select form-select-sm">
      <option value="all">Сите</option>
      <option v-for="u in uniqueUsers" :key="u" :value="u">{{ u }}</option>
    </select>
  </div>

</div>

   
    <div class="container mt-3">
        <h2 class="pb-3">Сите нарачки</h2>
        <div v-if="filteredRequests.length === 0">Нема нарачки</div>
       
      <div class="row">
        <div v-for="req in filteredRequests" :key="req.id" class="col-md-4 mb-4">
          <div class="card shadow-sm text-dark h-100" :class="statusClass(req.status)">
            <div class="card-body d-flex align-items-start">
              <div class="me-3 fs-2"><!--Moze da se trgne?-->
                <span v-if="req.status === 'approved'" class="text-success">✔️</span>
                <span v-else-if="req.status === 'pending'" class="text-warning">⏳</span>
                <span v-else-if="req.status === 'rejected'" class="text-danger">❌</span>
              </div>
            <div>
          <h5 class="card-title mb-1">Нарачка <strong>{{ req.id }}</strong></h5>
          <p class="mb-1"><strong>Корисник:</strong> {{ req.username }}</p>
          <p class="mb-1"><strong>Датум:</strong> {{ req.requestDate }}</p>
          <p class="mb-0"><strong>Статус:</strong> {{ req.status }}</p>
          <p v-if="req.processedBy && req.status !== 'pending' " class="mt-2 text-muted small">
            <span>{{req.status === 'approved' ? 'Одобрена од: ' : 'Одбиена од: ' }}</span> {{ req.processedBy }}
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

          <!--kopceto za odobruvanje i odbivanje-->
          <div v-if="user.userType === 'ProductAdministrator' && req.status === 'pending' && req.username !== user.username" class="mt-2 d-flex gap-2" >
            <button class="btn btn-sm btn-success" @click="updateStatus(req.id, 'approved')">Одобри</button>
            <button class="btn btn-sm btn-danger" @click="updateStatus(req.id, 'rejected')">Одбиј</button>
          </div>

          </div>
        </div>
      </div>
    </div>
</div>


    </div>



</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const allRequests = ref([]);
const router = useRouter();
const user = ref({});
const selectedStatus = ref('all');
const selectedDate = ref('');
const selectedUser = ref('all');
const uniqueUsers = computed(() => {
  const users = allRequests.value.map(r => r.username);
  return [ ...new Set(users)];
});
const expandedRequests = ref([]);
const userProfileImage = ref("https://www.gravatar.com/avatar/?d=mp"); 

onMounted(async () => {
  const res = await fetch('http://localhost:8081/api/requests'); 
  if (res.ok) {
    allRequests.value = await res.json();
  } else {
    alert("Не успеа вчитување на нарачките.");
  }

  const stored = localStorage.getItem('user');
  if (!stored) {
    router.push('/login');
    return;
  }

  user.value = JSON.parse(stored);
  userProfileImage.value = user.value.profilePic || "https://www.gravatar.com/avatar/?d=mp";
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

  
  const req = allRequests.value.find(r => r.id === requestId);
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
const updateStatus = async (requestId, newStatus) => {
  const confirmed = confirm(`Дали сте сигурни дека сакате да ја означите нарачката како '${newStatus}'?`);
  if (!confirmed) return;

  const res = await fetch(`http://localhost:8081/api/requests/${requestId}/status?status=${newStatus}&adminId=${user.value.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' }
});

  if (res.ok) {
    const req = allRequests.value.find(r => r.id === requestId);
    if (req) {
      req.status = newStatus;
      req.processedBy = user.value.username; 
    }
    alert(`Нарачката е успешно означена како '${newStatus}'`);
  } else {
    alert("Грешка при ажурирање на статусот.");
  }
 
};
const filteredRequests = computed(() => {
  return allRequests.value.filter(req => {
    const statusMatch =
      selectedStatus.value === 'all' || req.status === selectedStatus.value;

    const userMatch =
      selectedUser.value === 'all' || req.username === selectedUser.value;

    const dateMatch =
      !selectedDate.value || new Date(req.requestDate) >= new Date(selectedDate.value);

    return statusMatch && userMatch && dateMatch;
  });
});

</script>