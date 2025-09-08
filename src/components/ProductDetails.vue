<template>
  <div class="mt-4">
  <h3 class="text-center">{{ productName }}</h3>
  <div class="row justify-content-center">
    <div class="col-md-8 col-lg-6">
      <canvas ref="chartCanvas" class="w-100"></canvas>
    </div>
  </div>
</div>
</template>

<script>
import Chart from 'chart.js/auto';
import axios from 'axios';

export default {//mora vaka ne dava da se raboti so props so script setup
  props: ['id'],//go zemame od "parent page"
  data() {
    return {
      chartInstance: null,
      productName: ''
    };
  },
  async mounted() {
    try {
      const productRes = await axios.get(`http://localhost:8081/api/products/${this.id}`);
      this.productName = productRes.data.name;

      const res = await axios.get(`http://localhost:8081/api/products/${this.id}/reservations-by-month`);//api/json
      const data = res.data;

      const labels = Object.keys(data);
      const values = Object.values(data);

      console.log(data);

  
      if (this.chartInstance) {
        this.chartInstance.destroy();//ako imalo go trgame
      }

      this.chartInstance = new Chart(this.$refs.chartCanvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Резервации по месеци',
            data: values,
            backgroundColor: '#f64a8a'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            title: {
              display: true,
              text: 'Месечни резервации'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
};
</script>
