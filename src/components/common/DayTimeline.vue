<template>
  <section class="band">
    <h3>第 {{ day.day_index }} 天 · {{ day.date }}</h3>
    <p class="day-budget">
      预计花费 {{ formatCurrency(daySpent) }} · 当日额度 {{ formatCurrency(allowance) }} ·
      <span v-if="dayOver > 0" class="over-amount">超出 {{ formatCurrency(dayOver) }}</span>
      <span v-else class="muted">未超支</span>
    </p>
    <p v-if="dayOver > 0" class="over-warning">{{ messages.dayBudgetExceeded }}</p>
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
import { transportText, formatCurrency } from '../../utils/formatters';
import { calcDayCost, overAmount } from '../../utils/budgetCalculator';
import { messages } from '../../constants/messages';
const props = defineProps<{ day: DayPlan; spots: Spot[]; allowance: number }>();
const spotName = (id: string) => props.spots.find((spot) => spot.id === id)?.name || '未知景点';
// 添加或拖动景点会改动 day.items，这两个 computed 随之更新
const daySpent = computed(() => calcDayCost(props.day, props.spots));
const dayOver = computed(() => overAmount(daySpent.value, props.allowance));
</script>
<style scoped>
.day-budget { margin: 4px 0 10px; font-weight: 600; }
.over-amount, .over-warning { color: #c0392b; }
.over-warning { margin: 0 0 10px; font-size: 13px; }
</style>
