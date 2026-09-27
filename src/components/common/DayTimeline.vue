<template>
  <section class="band">
    <h3>第 {{ day.day_index }} 天 · {{ day.date }}</h3>
    <p v-if="budget" class="day-budget">
      当天预计花费 {{ formatCurrency(budget.spent, currency) }} · 每日额度 {{ formatCurrency(budget.allowance, currency) }}
      <template v-if="budget.over > 0"> · 超出 {{ formatCurrency(budget.over, currency) }}</template>
    </p>
    <p v-if="budget && budget.over > 0" class="over-warning">{{ messages.dailyBudgetExceeded }}</p>
    <ol>
      <li v-for="item in day.items" :key="item.spot_id + item.start_time">
        <strong>{{ spotName(item.spot_id) }}</strong>
        <span class="muted">{{ item.start_time }}-{{ item.end_time }} · {{ transportText[item.transport] }} · {{ item.note }}</span>
      </li>
    </ol>
    <p v-if="!day.items.length" class="muted">这一天还没有安排。</p>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { DayPlan } from '../../models/dayPlan';
import type { Spot } from '../../models/spot';
import type { Trip } from '../../models/trip';
import { formatCurrency, transportText } from '../../utils/formatters';
import { dayBudgetStatus } from '../../utils/budgetCalculator';
import { messages } from '../../constants/messages';
const props = defineProps<{ day: DayPlan; spots: Spot[]; trip?: Trip }>();
const spotName = (id: string) => props.spots.find((spot) => spot.id === id)?.name || '未知景点';
const currency = computed(() => props.trip?.currency || 'CNY');
const budget = computed(() => props.trip ? dayBudgetStatus(props.trip, props.day, props.spots) : null);
</script>
<style scoped>
.day-budget { margin: 4px 0; font-weight: 600; }
.over-warning { margin: 4px 0; color: #c0392b; }
</style>
