<template>
  <main class="page" v-if="trip">
    <TripHeader :trip="trip" />
    <div class="toolbar">
      <el-button type="primary" @click="router.push('/spots')">添加景点</el-button>
      <el-button @click="router.push('/planner/' + trip.id + '/1')">编排第 1 天</el-button>
      <el-button @click="router.push('/share')">分享预览</el-button>
    </div>
    <section class="grid">
      <BudgetChart :spent="stats.budget.spent" :remaining="stats.budget.remaining" />
      <div class="band">
        <strong>统计</strong>
        <p>天数 {{ stats.days }} · 景点 {{ stats.spotCount }} · 每日额度 {{ formatCurrency(stats.budget.dailyAllowance, trip.currency) }}</p>
        <p class="muted">{{ stats.budget.warning }}</p>
        <p v-if="overDays.length" class="over-warning">第 {{ overDays.join('、') }} 天{{ messages.dailyBudgetExceeded }}</p>
      </div>
    </section>
    <DayTimeline v-for="day in tripDays" :key="day.id" :day="day" :spots="spotStore.spots" :trip="trip" />
  </main>
  <main v-else class="page"><EmptyState title="旅行不存在" /></main>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTripStore } from '../stores/tripStore';
import { useSpotStore } from '../stores/spotStore';
import { useDayPlanStore } from '../stores/dayPlanStore';
import { useTripStats } from '../hooks/useTripStats';
import { formatCurrency } from '../utils/formatters';
import { messages } from '../constants/messages';
import type { DayBudget } from '../utils/budgetCalculator';
import TripHeader from '../components/common/TripHeader.vue';
import DayTimeline from '../components/common/DayTimeline.vue';
import BudgetChart from '../components/common/BudgetChart.vue';
import EmptyState from '../components/common/EmptyState.vue';
const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const spotStore = useSpotStore();
const dayPlanStore = useDayPlanStore();
const trip = computed(() => tripStore.trips.find((item) => item.id === route.params.id));
const tripDays = computed(() => dayPlanStore.dayPlans.filter((day) => day.trip_id === route.params.id));
const emptyStats = { days: 0, spotCount: 0, budget: { spent: 0, remaining: 0, warning: '', dailyAllowance: 0, dailySummary: [] as DayBudget[] } };
const stats = computed(() => trip.value ? useTripStats(trip.value, dayPlanStore.dayPlans, spotStore.spots).value : emptyStats);
const overDays = computed(() => stats.value.budget.dailySummary.filter((day) => day.over > 0).map((day) => day.dayIndex));
</script>
<style scoped>
.over-warning { color: #c0392b; }
</style>
