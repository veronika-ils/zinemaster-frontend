<template>
   <div>
    <header class="bg-dark text-white p-3 fixed-top shadow-sm">
        <div class="container d-flex justify-content-between align-items-center">
            <h4 class="mb-0">ZineMaster</h4>
            <nav>
                <button class="btn btn-outline-light btn-sm me-2" @click="startRequest">Направи нарачка</button>   
                <router-link to="/requests" class="btn btn-outline-light btn-sm me-2">Сите нарачки</router-link>
                <button class="btn btn-outline-light btn-sm me-2" @click="logout">Logout</button>
                <router-link to="/profile">
                  <img :src="userProfileImage" alt="Profile" class="rounded-circle me-2 " style="width: 35px; height: 35px; object-fit: cover; border: 2px solid white; cursor: pointer;"/>
                </router-link>
            </nav>
        </div>
    </header>

    

    <main class="container mt-5 pt-5">
       <h2 class="mb-4">Достапни продукти</h2>
       <!-- za filtriranje-->
        <div class="mb-3">
          <label for="categoryFilter" class="form-label">Филтрирај по категорија:</label>
          <select id="categoryFilter" class="form-select" v-model="selectedCategory">
            <option value="">-- Сите категории --</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>



<!-- Pravenje na naracka -->
<div v-if="creatingRequest" class="mb-4">
  <div class="alert alert-info">Креирање на нарачка (ID: {{ requestId }})</div>
   <button class="btn btn-outline-danger mb-2" @click="cancelRequest">Откажи</button>


  <div class="row">
    <div class="col-md-4 mb-3" v-for="product in filteredProducts" :key="product.id">
      <div class="card h-100">
        <img :src="product.imageUrl" class="card-img-top" :alt="product.name">
        <div class="card-body">
          <h5 class="card-title">{{ product.name }}</h5>
          <p class="card-text">Достапно: {{ product.quantity - product.reserved }}</p>
          <p class="card-text text-muted small">Резервирано: {{ product.reserved }}</p>
          <input type="number" min="1" :max="product.quantity" v-model.number="selectedQuantities[product.id]" class="form-control mb-2" placeholder="Количина">
          <button class="btn btn-sm btn-primary" @click="addToRequest(product)">Додади</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="requestItems.length">
    <h5 class="mt-4">Производи во нарачката:</h5>
    <ul class="list-group">
      <li class="list-group-item" v-for="item in requestItems" :key="item.id">
        {{ item.name }} - {{ item.quantity }}
      </li>
    </ul>
    <button class="btn btn-success mt-3" @click="submitRequest">Заврши нарачка</button>
  </div>
</div>
<!-- Produkti bez pravenje naracka -->
       <div v-if="!creatingRequest" class="row">
            <div class="col-md-4 mb-4" v-for="product in filteredProducts" :key="product.id">
                <div class="card h-100 shadow-sm">
                    <img :src="product.imageUrl" class="card-img-top" :alt="product.name"  style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">{{ product.name }}</h5>
                        <p class="card-text">Достапно: {{ product.quantity - product.reserved }}</p>
                        <p class="card-text text-muted small">Резервирано: {{ product.reserved }}</p>
                    </div>
                </div>
            </div>
       </div> 



    </main>
    </div>
    
</template>

<script setup>
import { ref, onMounted , computed} from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const products = ref([]);
const user = ref({});
const userProfileImage = ref("https://www.gravatar.com/avatar/?d=mp"); 
console.log(user)

onMounted(() => {
  const stored = localStorage.getItem('user');
  if (!stored) {
    router.push('/login');
    return;
  }

  user.value = JSON.parse(stored);
  userProfileImage.value = user.value.profilePic || "https://www.gravatar.com/avatar/?d=mp";
  
  fetchProducts()
  fetchCategories()
});

const logout = () => {
    localStorage.removeItem('user');
    router.push('/login');
};

const creatingRequest = ref(false);
const requestId = ref('');
const requestItems = ref([]);
const selectedQuantities = ref({});
const requests = ref([]);
const categories = ref([]);
const selectedCategory = ref('');

const startRequest = () => {
  requestItems.value = [];
  selectedQuantities.value = {};
  requestId.value = "R" + Date.now().toString().slice(-5);
  creatingRequest.value = true;
};


const filteredProducts = computed(() => {
  if (!selectedCategory.value) return products.value;
  return products.value.filter(p => p.categoryId === selectedCategory.value);
});

const fetchCategories = async () => {
  let result = await fetch('http://localhost:8081/api/categories');
  if(!result.ok) throw new Error('Cannot load categories');
  categories.value = await result.json();
};

const addToRequest = (product) => {
  const quantity = selectedQuantities.value[product.id];
  if (!quantity || quantity <= 0 || quantity > product.quantity - product.reserved) {
    alert("Внесете валидна количина!");
    return;
  }

  const exists = requestItems.value.find(p => p.id === product.id);
  if (exists) {
    exists.quantity += quantity;
  } else {
    requestItems.value.push({ id: product.id, name: product.name, quantity });
  }

  selectedQuantities.value[product.id] = null;
};

const submitRequest = async () => {
  const payload = {
    userId: user.value.id,
    items: requestItems.value.map(item => ({
      productId: item.id,
      quantityRequested: item.quantity
    }))
  };
  console.log("Payload za naracka:", payload);

  const res = await fetch('http://localhost:8081/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    const newRequestId = await res.text();
    alert("Нарачката е успешно поднесена со ID: " + newRequestId);
    creatingRequest.value = false;
    fetchUserRequests();
  } else {
    alert("Грешка при поднесување.");
  }

  await fetchProducts();
};

const fetchUserRequests = async () => {
const res = await fetch(`http://localhost:8081/api/requests/user/${user.value.id}`);
  if (res.ok) {
    requests.value = await res.json();
  }
};


const cancelRequest = () => {
  if (requestItems.value.length > 0) {
    const confirmed = confirm('Имате додадено производи. Дали сте сигурни дека сакате да ја откажете нарачката?');
    if (!confirmed) return;
  }

  requestItems.value = [];
  selectedQuantities.value = {};
  requestId.value = '';
  creatingRequest.value = false;
};

const fetchProducts = async () => {
  let response = await fetch('http://localhost:8081/api/products');
  if (!response.ok) throw new Error('Failed to fetch');
  products.value = await response.json();
};





</script>