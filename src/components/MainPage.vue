<template>
   <div>
    <header class="bg-dark text-white p-3 fixed-top shadow-sm">
        <div class="container d-flex justify-content-between align-items-center">
            <h4 class="mb-0">ZineMaster</h4>
            <nav>
                <button class="btn btn-outline-light btn-sm me-2" @click="startRequest">Направи нарачка</button>   
                <router-link to="/requests" class="btn btn-outline-light btn-sm me-2">Сите нарачки</router-link>
<RequestBell v-if="user.userType === 'ProductAdministrator'" />            
    <button class="btn btn-outline-light btn-sm me-2" @click="logout">Logout</button>
                <router-link to="/profile">
                  <img :src="userProfileImage" @click="resetProcessedCount" alt="Profile" class="rounded-circle me-2 " style="width: 35px; height: 35px; object-fit: cover; border: 2px solid white; cursor: pointer;"/>
                </router-link>
              
<StatusBell v-if="user.userType === 'Worker' " />              
  <router-link v-if="user.userType === 'UserAdministrator'" to="/manage-users" class="btn btn-outline-warning btn-sm me-2">
                        Управувај со корисници
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
        <!--za brishenje i dodavanje kategorii-->
      
<div v-if="user.userType === 'ProductAdministrator'" class="mb-4">
  <button class="btn mb-2" :class="['mb-2', 'btn', showCategoryManager ? 'btn-primary text-white active' : 'btn-outline-primary']"
  @click="toggleCategoryManager">
  Управување со категории
</button>

  <div v-if="showCategoryManager" class="border p-3 bg-light rounded">
    <!-- izbor -->
    <div class="mb-3">
      <label class="form-label">Избери акција:</label><!--mozda e poubavo da e vo edit del?-->
      <select class="form-select" v-model="categoryAction">
        <option  value="">-- Избери --</option>
        <option value="add">Додади категорија</option>
        <option value="delete">Избриши категорија</option>
      </select>
    </div>

    <!-- Dodavanje nova kategorija -->
    <div v-if="categoryAction === 'add'">
      <input v-model="newCategoryName" type="text" class="form-control mb-2" placeholder="Нова категорија">
      <button class="btn btn-success" @click="addCategory">Додади</button>
    </div>

    <!-- Brishenje kategorii -->
    <div v-if="categoryAction === 'delete'">
      <p class="text-muted">Избери категорија за бришење:</p>
      <ul class="list-group">
        <li v-for="cat in deletableCategories" :key="cat.id" class="list-group-item d-flex justify-content-between align-items-center">
          {{ cat.name }}
          <div>
            <button class="btn btn-sm btn-danger me-2" @click="deleteCategoryWithProducts(cat.id)">Со сите производи</button>
            <button class="btn btn-sm btn-warning" @click="deleteCategoryOnly(cat.id)">Само категоријата</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</div>


        <!--dodavanje nov proizvod-->
        <button 
  v-if="user.userType === 'ProductAdministrator' && !creatingRequest" 
  class="btn btn-outline-success mb-3"
  @click="showAddForm = true">
  Додади нов производ
        </button>
<!--formata za dodavanje nov proizvod-->

<form v-if="showAddForm" @submit.prevent="submitNewProduct" enctype="multipart/form-data" class="mb-4 border p-3 rounded bg-light">
  <h5>Нов производ</h5>

  <div class="mb-2">
    <input v-model="newProduct.name" type="text" class="form-control" placeholder="Име на производ" required>
  </div>

  <div class="mb-2">
    <label>Достапна количина:</label>
    <input v-model.number="newProduct.quantity" type="number" class="form-control" placeholder="Количина" required>
  </div>

  <div class="mb-2">
    <label>Слика:</label>
    <input  type="file" @change="handleImageUpload" class="form-control" required>
  </div>

  <div class="mb-2">
    <label>Категории:</label>
    <div class="d-flex flex-wrap gap-2">
      <div v-for="cat in categories" :key="cat.id"
        :class="['px-3', 'py-2', 'rounded', 'border', 'cursor-pointer', newProduct.categoryIds.includes(cat.id)  ? 'bg-success text-white' : 'bg-light']"
        @click="toggleCategory(cat.id)" style= "user-select: none;" >
        {{ cat.name }}
      </div>
    </div>
  </div>

  <button type="submit" class="btn btn-success me-2">Зачувај</button>
  <button type="button" class="btn btn-secondary" @click="cancelNewProduct">Откажи</button>
</form>

<div v-if="filteredProducts.length === 0">Нема производи</div>




<!-- Pravenje na naracka -->
<div v-if="creatingRequest" class="mb-4">
  <div class="alert alert-info">Креирање на нарачка (ID: {{ requestId }})</div>
   <button class="btn btn-outline-danger mb-2" @click="cancelRequest">Откажи</button>


  <div class="row">
    <div class="col-md-4 mb-3" v-for="product in filteredProducts" :key="product.id">
      <div class="card h-100">
          <img :src="getFullImageUrl(product.imageUrl)" class="card-img-top" :alt="product.name" style="height: 200px; object-fit: cover;">        <div class="card-body">
          <h5 class="card-title">{{ product.name }}</h5>
          <p class="card-text">Достапно: {{ product.quantity - product.reserved - product.tempReserved }}</p>
          <p class="card-text text-muted small">Резервирано: {{ product.reserved + product.tempReserved }}</p>
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
                    <img :src="getFullImageUrl(product.imageUrl)" class="card-img-top" :alt="product.name" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">{{ product.name }}</h5>
                        <p class="card-text">Достапно: {{ product.quantity - product.reserved }}</p>
                        <p class="card-text text-muted small">Резервирано: {{ product.reserved }}</p>
                        <div v-if="user.userType === 'ProductAdministrator' ">
<input type="number" v-model.number="product.addQuantity" min="1" placeholder="Додади количина" class="form-control form-control-sm d-inline w-50 me-2">
  <button class="btn btn-sm btn-outline-success" @click="addQuantity(product)">
    Додади
  </button>
                        <button v-if="user.userType === 'ProductAdministrator' && product.reserved == 0" class="btn btn-sm btn-danger ms-2" @click="deleteProduct(product.id)">Избриши</button>
                         <div class="mt-auto text-end pt-3">
        <router-link :to="`/products/${product.id}`" class="btn btn-outline-primary btn-sm" title="View Details">
          🔍
        </router-link>
      </div>
                    </div>
                </div>
            </div>
       </div> 
       </div>
       



    </main>
    <button class="btn btn-sm btn-primary" @click="ping">Ping Admins</button>
    </div>
    
    
</template>

<script setup>
import { ref, onMounted , computed} from 'vue';//, watchEffect -> za pomos pri debug
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import RequestBell from './RequestBell.vue';
import StatusBell from './StatusBell.vue';
import axios from 'axios';


const router = useRouter();
const products = ref([]);
const user = ref({});
const userProfileImage = ref("https://www.gravatar.com/avatar/?d=mp"); 
console.log(user)
const processedCount = ref(0)
const token = localStorage.getItem('auth_token')



async function ping(){
   try {
    await axios.post('http://localhost:8081/api/dev/ping-admins', null,{
    headers: { Authorization: `Bearer ${token}` }
  }) 
  } catch (e) {
    console.error('Ping failed:', e?.response?.status, e?.response?.data || e.message)
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
  
  fetchProducts()
  fetchCategories()  
});

const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('saved');
    router.push('/login');
};



const creatingRequest = ref(false);
const requestId = ref('');
const requestItems = ref([]);
const selectedQuantities = ref({});
const requests = ref([]);
const categories = ref([]);
const selectedCategory = ref('');



async function resetProcessedCount() {
  if (!user.value?.id) return
  try {
    await axios.post(`http://localhost:8081/api/users/${user.value.id}/processed-count/reset`)
    processedCount.value = 0
  } catch (e) {
    console.error("Failed to reset processed count", e)
  }
}


const startRequest = () => {
  requestItems.value = [];
  selectedQuantities.value = {};
  requestId.value = "R" + Date.now().toString().slice(-5);
  creatingRequest.value = true;
};


const filteredProducts = computed(() => {
  if (!selectedCategory.value) return products.value;
  return products.value.filter(p =>
    p.categories && p.categories.some(cat => cat.id === selectedCategory.value)//barem edna kategorija
  );
});




const fetchCategories = async () => {
  let result = await fetch('http://localhost:8081/api/categories');
  if(!result.ok) throw new Error('Cannot load categories');
  categories.value = await result.json();
};

const addToRequest = (product) => {
  const quantity = selectedQuantities.value[product.id];
  const available = product.quantity - product.reserved - product.tempReserved;

  if (!quantity || quantity <= 0 || quantity > available) {
    Swal.fire("Грешка", "Внесете валидна количина!", "warning");
    return;
  }

  const exists = requestItems.value.find(p => p.id === product.id);
  if (exists) {
    exists.quantity += quantity;
  } else {
    requestItems.value.push({ id: product.id, name: product.name, quantity });
  }

  product.tempReserved += quantity; 
  selectedQuantities.value[product.id] = null;
};


const submitRequest = async () => {
  const payload = {//body
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
     await Swal.fire("Успешно",
      `Нарачката е поднесена со ID: ${newRequestId}`,
       "success");
    creatingRequest.value = false;
    fetchUserRequests();
  } else {
   Swal.fire("Грешка", "Грешка при поднесување.", "error");
  }

  await fetchProducts();
};

const fetchUserRequests = async () => {
const res = await fetch(`http://localhost:8081/api/requests/user/${user.value.id}`);
  if (res.ok) {
    requests.value = await res.json();
  }
};


const cancelRequest = async () => {
  if (requestItems.value.length > 0) {
    const result = await Swal.fire({
      title: 'Потврда',
      text: 'Имате додадено производи. Дали сте сигурни дека сакате да ја откажете нарачката?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Да',
      cancelButtonText: 'Не'
    });

   
    if (!result.isConfirmed) {
      return;
    }
  }

  
  for (const item of requestItems.value) {
    const product = products.value.find(p => p.id === item.id);
    if (product) {
      product.tempReserved -= item.quantity;
    }
  }


  requestItems.value = [];
  selectedQuantities.value = {};
  requestId.value = '';
  creatingRequest.value = false;

  await Swal.fire({
    icon: 'success',
    title: 'Откажано',
    text: 'Нарачката е успешно откажана.'
  });
};


const fetchProducts = async () => {
  let response = await fetch('http://localhost:8081/api/products');
  if (!response.ok) throw new Error('Failed to fetch');
  products.value = (await response.json()).map(p => ({
  ...p,
  reserved: Number(p.reserved ?? 0),//зa sig deka e broj a ne string
  accessible: p.accessible ?? true,  
  tempReserved: 0 ,
  categories: p.categories ?? []  ,//sega moze od povekje kategorii da e eden proizvod
  addQuantity: 0
}));
};

const deleteProduct = async (productId) => {
   const result = await Swal.fire({
    title: 'Потврда',
    text: 'Дали сте сигурни дека сакате да го избришете овој производ?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Избриши',
    cancelButtonText: 'Откажи'
  });
  if (!result.isConfirmed) return;

  const res = await fetch(`http://localhost:8081/api/products/${productId}`, {
    method: 'DELETE'//logicko delete samo
  });

  if (res.ok) {
     await Swal.fire("Успешно", "Производот е избришан.", "success");
    await fetchProducts();
  } else {
     Swal.fire("Грешка", "Неуспешно бришење.", "error");
  }
};
//celata logika za formata

const showAddForm = ref(false);
const newProduct = ref({
  name: '',
  quantity: 0,
  imageUrl: '',//da ne e so URL od google tuku kako so pfp da moze da se smeni
  categoryIds:[],//povekje categories
  reserved: 0,
  accessable: true
});


const submitNewProduct = async () => {
  if (!newProduct.value.name || !newProduct.value.quantity ||newProduct.value.categoryIds.length === 0 ||!imageFile.value)
     {
    await Swal.fire({
    icon: 'warning',
    title: 'Недостаток на податоци',
    text: 'Сите полиња се задолжителни, вклучувајќи и слика.',
  });
    return;
  }

  const formData = new FormData();//payload
  formData.append("name", newProduct.value.name);
  formData.append("quantity", newProduct.value.quantity);
  formData.append("accessable", newProduct.value.accessable);
  formData.append("reserved", newProduct.value.reserved);
  newProduct.value.categoryIds.forEach(id => {
    formData.append("categoryIds", id); 
  });
  formData.append("image", imageFile.value);

  const res = await fetch("http://localhost:8081/api/products/upload", {
    method: "POST",
    body: formData,
  });

  if (res.ok) {
    await Swal.fire({
    icon: 'success',
    title: 'Успешно додаден',
    text: 'Производот е додаден успешно.'
  });
    showAddForm.value = false;
    newProduct.value = {
      name: "",
      quantity: 0,
      imageUrl: "",
      categoryIds: [],
      reserved: 0,
      accessable: true,
    };
    imageFile.value = null;
    await fetchProducts();
  } else {
    await Swal.fire({
    icon: 'error',
    title: 'Грешка',
    text: 'Грешка при додавање.'
  });
  }
};



const newCategoryName = ref('');

const addCategory = async () => {
  if (!newCategoryName.value.trim()) {
   await Swal.fire({
    icon: 'warning',
    title: 'Внесете име на категорија.'
  });
    return;
  }

  const res = await fetch('http://localhost:8081/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newCategoryName.value })
  });

  if (res.ok) {
    await Swal.fire({
    icon: 'success',
    title: 'Додадена категорија'
  });
    newCategoryName.value = '';
    await fetchCategories();
  } else {
    await Swal.fire({
    icon: 'error',
    title: 'Грешка при додавање категорија.'
  });
  }
};

const deleteCategoryWithProducts = async (categoryId) => {
 const confirmDelete = await Swal.fire({
  title: 'Дали сакате да ја избришете оваа категорија ЗАЕДНО со сите производи во неа?',//samo tie sto imaat edna kategorija(a taa e ovaa sto se brishe)
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Да, избриши',
  cancelButtonText: 'Откажи'
});
if (!confirmDelete.isConfirmed) return;

  const res = await fetch(`http://localhost:8081/api/categories/${categoryId}?deleteProducts=true`, {
    method: 'DELETE'
  });

  if (res.ok) {
    await Swal.fire({
    icon: 'success',
    title: 'Категоријата и производите се избришани.'
  });
    await fetchCategories();
    await fetchProducts();
  } else {
    await Swal.fire({
    icon: 'error',
    title: 'Неуспешно бришење.'
  });
  }
};

 
const deleteCategoryOnly = async (categoryId) => {
  const confirmDelete = await Swal.fire({
  title: 'Дали сакате да ја избришете оваа категорија, а производите да останат без категорија?',//ako ima povekje kategorii drugite ke ostanat
  icon: 'question',
  showCancelButton: true,
  confirmButtonText: 'Избриши само категорија',
  cancelButtonText: 'Откажи'
});
if (!confirmDelete.isConfirmed) return;

  const res = await fetch(`http://localhost:8081/api/categories/${categoryId}?deleteProducts=false`, {
    method: 'DELETE'
  });

  if (res.ok) {
    await Swal.fire({
    icon: 'success',
    title: 'Категоријата е избришана. Производите остануваат.'
  });
    await fetchCategories();
    await fetchProducts();
  } else {
   await Swal.fire({
    icon: 'error',
    title: 'Неуспешно бришење.'
  });
  }
};
const showCategoryManager = ref(false);
const categoryAction = ref('');

const toggleCategoryManager = () => {
  showCategoryManager.value = !showCategoryManager.value;
  categoryAction.value = ''; 
};

const deletableCategories = computed(() => {//nemozat site kategorii da se brishat(samo tie sto site proizvodi reserved=0)
  return categories.value.filter(cat => {
    const relatedProducts = products.value.filter(p => p.categories && p.categories.some(c => c.id === cat.id) && p.accessable);//klucen zbore "some"
    return relatedProducts.length === 0 || relatedProducts.every(p => p.reserved === 0);
  });
});

const toggleCategory = (catId) => {
  const index = newProduct.value.categoryIds.indexOf(catId);//ako postoi idex se trga od lista na kategorii,ako ne se dodava
  if (index === -1) {
    newProduct.value.categoryIds.push(catId);
  } else {
    newProduct.value.categoryIds.splice(index, 1);
  }
};
const cancelNewProduct = () => {
  newProduct.value = {
    name: '',
    quantity: 0,
    imageUrl: '',
    categoryIds: [],
    reserved: 0,
    accessable: true
  };
  showAddForm.value = false;
};

const imageFile = ref(null);

const handleImageUpload = (event) => {
  imageFile.value = event.target.files[0];
};

const getFullImageUrl = (relativePath) => {
  if(!relativePath)return "";
  return "http://localhost:8081"+relativePath;//tuka mi e slikata
}


const addQuantity = async (product) => {
  if (!product.addQuantity || product.addQuantity <= 0) {
    await Swal.fire({
    icon: 'warning',
    title: 'Внесете валидна количина за додавање.'
  });
    return;
  }

  const res = await fetch(`http://localhost:8081/api/products/${product.id}/add-quantity`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantityToAdd: product.addQuantity })
  });

  if (res.ok) {
    await Swal.fire({
    icon: 'success',
    title: 'Успешно додадено',
    text: 'Количината е успешно додадена.'
  });
    product.addQuantity = 0;
    await fetchProducts();
  } else {
    await Swal.fire({
    icon: 'error',
    title: 'Грешка при ажурирање.'
  });
  }
};
</script>