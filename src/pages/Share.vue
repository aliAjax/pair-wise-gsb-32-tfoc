<template>
  <main class="page">
    <template v-if="trip">
      <TripHeader :trip="trip" />
      <p class="muted">总预算 {{ formatCurrency(trip.budget, trip.currency) }} · 每日额度 {{ formatCurrency(allowance, trip.currency) }}</p>
      <DayTimeline v-for="day in tripDays" :key="day.id" :day="day" :spots="spotStore.spots" :allowance="allowance" />
      <el-button @click="copyText">复制行程文本</el-button>
    </template>
    <EmptyState v-else title="还没有可分享的旅行" />
  </main>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useTripStore } from '../stores/tripStore';
import { useSpotStore } from '../stores/spotStore';
import { useDayPlanStore } from '../stores/dayPlanStore';
import { dailyAllowance, dayBudgetStatus } from '../utils/budgetCalculator';
import { formatCurrency, transportText } from '../utils/formatters';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';
import TripHeader from '../components/common/TripHeader.vue';
import DayTimeline from '../components/common/DayTimeline.vue';
import EmptyState from '../components/common/EmptyState.vue';
const tripStore = useTripStore();
const spotStore = useSpotStore();
const dayPlanStore = useDayPlanStore();
const trip = computed(() => tripStore.trips[0]);
const tripDays = computed(() => dayPlanStore.dayPlans.filter((day) => day.trip_id === trip.value?.id).sort((a, b) => a.day_index - b.day_index));
const allowance = computed(() => (trip.value ? dailyAllowance(trip.value, dayPlanStore.dayPlans) : 0));
function copyText() {
  const current = trip.value;
  if (!current) return;
  const currency = current.currency;
  const lines = [
    `TripWeaver 行程单：${current.title}`,
    `${current.destination} · ${current.start_date} 至 ${current.end_date}`,
    `总预算 ${formatCurrency(current.budget, currency)} · 每日额度 ${formatCurrency(allowance.value, currency)}`,
  ];
  for (const day of tripDays.value) {
    const status = dayBudgetStatus(current, day, spotStore.spots, dayPlanStore.dayPlans);
    lines.push(`第 ${day.day_index} 天（${day.date}）`);
    for (const item of day.items) {
      const spot = spotStore.spots.find((entry) => entry.id === item.spot_id);
      lines.push(`- ${spot?.name || '未知景点'} ${item.start_time}-${item.end_time} ${transportText[item.transport]} ${formatCurrency(spot?.price || 0, currency)}`);
    }
    const total = `当天合计 ${formatCurrency(status.spent, currency)} / 额度 ${formatCurrency(status.allowance, currency)}`;
    lines.push(status.over > 0 ? `${total}，超出 ${formatCurrency(status.over, currency)}（${status.warning}）` : `${total}，未超支`);
  }
  navigator.clipboard?.writeText(lines.join('\n'));
  toast.ok(messages.shareCopied);
}
</script>
