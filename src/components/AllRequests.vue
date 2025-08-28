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
                <router-link v-if="user.userType === 'UserAdministrator'" to="/manage-users" class="btn btn-outline-warning btn-sm me-2">
                        Управувај со корисници
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

    <div class="form-check mt-2">
  <input class="form-check-input" type="radio" id="dateFrom" value="from" v-model="dateFilterType">
  <label class="form-check-label" for="dateFrom">Од тој датум па натаму</label>
</div>
<div class="form-check">
  <input class="form-check-input" type="radio" id="dateExact" value="exact" v-model="dateFilterType">
  <label class="form-check-label" for="dateExact">Само на тој датум</label>
</div>


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
              <div class="me-3 fs-2">
                <span v-if="req.status === 'approved'" class="text-success">✔️</span>
                <span v-else-if="req.status === 'pending'" class="text-warning">⏳</span>
                <span v-else-if="req.status === 'rejected'" class="text-danger">❌</span>
              </div>
            <div>
          <h5 class="card-title mb-1">Нарачка <strong>{{ req.id }}</strong></h5>
          <p class="mb-1"><strong>Корисник:</strong> {{ req.username }}</p>
          <p class="mb-1"><strong>Датум:</strong> {{ req.requestDate }}</p>
          <p class="mb-0"><strong>Статус:</strong> {{ statusToMacedonian(req.status) }}</p>
          <p v-if="req.processedBy && req.status !== 'pending' " class="mt-2 text-muted small">
            <span>{{req.status === 'approved' ? 'Одобрена од: ' : 'Одбиена од: ' }}</span> {{ req.processedBy }}
          </p>
          <!-- so kopce ili bez kopce da e?-->
          <button 
            class="btn btn-sm mt-2 text-dark"
            :class="buttonClass(req.status)"
            @click="toggleDetails(req.id)" >
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
          <div v-if="user.userType === 'ProductAdministrator' && req.status === 'pending' && req.username !== user.username"
     class="mt-2 d-flex gap-2">
  <button class="btn btn-sm btn-success"
          :disabled="!canProcess(req)"
          @click="updateStatus(req.id, 'approved')">Одобри</button>
  <button class="btn btn-sm btn-danger"
          :disabled="!canProcess(req)"
          @click="updateStatus(req.id, 'rejected')">Одбиј</button>
</div>
<p v-if="req.status==='pending' && !canProcess(req) && req.username !== user.username && user.userType !== 'Worker'" class="text-muted small mt-1">
  📌 Прво обработи ги најстарите нарачки.
</p>


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
import Swal from 'sweetalert2';


const allRequests = ref([]);
const router = useRouter();
const user = ref({});
const selectedStatus = ref('all');
const selectedDate = ref('');
const dateFilterType = ref('from'); 
const selectedUser = ref('all');
const uniqueUsers = computed(() => {
  const users = allRequests.value.map(r => r.username);
  return [ ...new Set(users)];
});
const expandedRequests = ref([]);
const userProfileImage = ref("https://www.gravatar.com/avatar/?d=mp"); 
const toYMD = (d) => new Date(d).toISOString().split('T')[0];//za polesno sortiranje mora da go prefrlime datumot

onMounted(async () => {
  const res = await fetch('http://localhost:8081/api/requests'); 
  if (res.ok) {
    allRequests.value = await res.json();
  } else {
    await Swal.fire({
    icon: 'error',
    title: 'Грешка',
    text: 'Не успеа вчитување на нарачките.'
  });
  }

  const stored = localStorage.getItem('user');
  if (!stored) {
    router.push('/login');
    return;
  }

  user.value = JSON.parse(stored);
  userProfileImage.value = user.value.profilePic || "https://www.gravatar.com/avatar/?d=mp";
  
  localStorage.setItem("counter","0")
});

const logout = () => {
    localStorage.removeItem('user');
    router.push('/login');
};

const oldestPendingDateForOthers = computed(() => {
  const others = allRequests.value.filter(
    r => r.status === 'pending' && r.username !== user.value.username
  );
  if (others.length === 0) return null;
  return others.map(r => toYMD(r.requestDate)).sort((a, b) => a.localeCompare(b))[0];//najstariot datum go zema
});

const canProcess = (req) => {
  if (req.status !== 'pending') return false;//vo false

  if (req.username === user.value.username) return false;

  if (!oldestPendingDateForOthers.value) return false;

  return toYMD(req.requestDate) === oldestPendingDateForOthers.value;//ako e najstariot datum ist so negoviot moze da go procesira
};

const toggleDetails = async (requestId) => {
  const alreadyExpanded = expandedRequests.value.includes(requestId);
  if (alreadyExpanded) {
    expandedRequests.value = expandedRequests.value.filter(id => id !== requestId);//ako po vtor pat se klika se trga od listata
    return;
  }

  
  const req = allRequests.value.find(r => r.id === requestId);
  if (!req.items) {
    const res = await fetch(`http://localhost:8081/api/requests/${requestId}`);
    if (res.ok) {
      const fullRequest = await res.json();
      req.items = fullRequest.items; 
    } else {
     await Swal.fire({
    icon: 'error',
    title: 'Грешка',
    text: 'Не може да се вчитаат деталите за нарачката.'
     });
      return;
    }
  }

  expandedRequests.value.push(requestId);//vo lista gi cuvam
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
  const result = await Swal.fire({
    title: 'Потврда на статус',
    text: `Дали сте сигурни дека сакате да ја означите нарачката како '${statusToMacedonian(newStatus)}'?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Да, означи',
    cancelButtonText: 'Откажи'
  });

  if (!result.isConfirmed) return;

  const res = await fetch(`http://localhost:8081/api/requests/${requestId}/status?status=${newStatus}&adminId=${user.value.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' }//mora ovie dve da gi pratime
});

  if (res.ok) {
    const req = allRequests.value.find(r => r.id === requestId);
    if (req) {
      req.status = newStatus;
      req.processedBy = user.value.username; 
    }
    await Swal.fire({
      icon: 'success',
      title: 'Успешно',
      text: `Нарачката е означена како '${statusToMacedonian(newStatus)}'`
    });
  } else {
    await Swal.fire({
      icon: 'error',
      title: 'Грешка',
      text: 'Настана проблем при ажурирање на статусот.'
    });
  }
 
};

 
const filteredRequests = computed(() => {
  return allRequests.value.filter(req => {
    const statusMatch = selectedStatus.value === 'all' || req.status === selectedStatus.value;
    const userMatch = selectedUser.value === 'all' || req.username === selectedUser.value;

    let dateMatch = true;
    if (selectedDate.value) {
      const reqDate = new Date(req.requestDate).toISOString().split('T')[0];
      const selected = new Date(selectedDate.value).toISOString().split('T')[0];

      if (dateFilterType.value === 'exact') {
        dateMatch = reqDate === selected;
      } else {
        dateMatch = reqDate >= selected;
      }
    }

    return statusMatch && userMatch && dateMatch;
  }).sort((a, b) => {
      const da = new Date(a.requestDate).getTime();
      const db = new Date(b.requestDate).getTime();
      if (da !== db) return da - db;           
      return String(a.id).localeCompare(String(b.id)); // za ako i datumie se isti
    });
});

const statusToMacedonian = (status) => {
  switch (status) {
    case 'approved': return 'Одобрено';
    case 'pending': return 'Во тек';
    case 'rejected': return 'Одбиено';
    default: return status;
  }
};


</script>