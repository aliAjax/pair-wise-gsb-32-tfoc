import { computed } from 'vue';
import type { Trip } from '../models/trip';
import type { DayPlan } from '../models/dayPlan';
import type { Spot } from '../models/spot';
import { budgetStatus, dailyAllowance, dailyBudgetSummary, tripDayCount } from '../utils/budgetCalculator';

export function useTripStats(trip: Trip, dayPlans: DayPlan[], spots: Spot[]) {
  return computed(() => ({
    days: tripDayCount(trip),
    spotCount: dayPlans.filter((day) => day.trip_id === trip.id).reduce((sum, day) => sum + day.items.length, 0),
    budget: {
      ...budgetStatus(trip, dayPlans.filter((day) => day.trip_id === trip.id), spots),
      dailyAllowance: dailyAllowance(trip),
      dailySummary: dailyBudgetSummary(trip, dayPlans, spots),
    },
  }));
}
