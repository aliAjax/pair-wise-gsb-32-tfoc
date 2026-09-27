import dayjs from 'dayjs';
import type { DayPlan } from '../models/dayPlan';
import type { Spot } from '../models/spot';
import type { Trip } from '../models/trip';
import { messages } from '../constants/messages';

export interface DayBudget {
  dayIndex: number;
  spent: number;
  allowance: number;
  over: number;
}

export function calcTripCost(dayPlans: DayPlan[], spots: Spot[]) {
  const spotMap = new Map(spots.map((spot) => [spot.id, spot]));
  return dayPlans.reduce((sum, day) => {
    return sum + day.items.reduce((inner, item) => inner + (spotMap.get(item.spot_id)?.price || 0), 0);
  }, 0);
}

export function tripDayCount(trip: Trip) {
  const days = dayjs(trip.end_date).diff(dayjs(trip.start_date), 'day') + 1;
  return Math.max(1, days);
}

export function dailyAllowance(trip: Trip) {
  return trip.budget / tripDayCount(trip);
}

export function calcDayCost(day: DayPlan, spots: Spot[]) {
  const spotMap = new Map(spots.map((spot) => [spot.id, spot]));
  return day.items.reduce((sum, item) => sum + (spotMap.get(item.spot_id)?.price || 0), 0);
}

export function dayBudgetStatus(trip: Trip, day: DayPlan, spots: Spot[]): DayBudget {
  const allowance = dailyAllowance(trip);
  const spent = calcDayCost(day, spots);
  return { dayIndex: day.day_index, spent, allowance, over: Math.max(0, spent - allowance) };
}

export function dailyBudgetSummary(trip: Trip, dayPlans: DayPlan[], spots: Spot[]) {
  return dayPlans
    .filter((day) => day.trip_id === trip.id)
    .map((day) => dayBudgetStatus(trip, day, spots))
    .sort((a, b) => a.dayIndex - b.dayIndex);
}

export function budgetStatus(trip: Trip, dayPlans: DayPlan[], spots: Spot[]) {
  const summary = dailyBudgetSummary(trip, dayPlans, spots);
  const spent = summary.reduce((sum, day) => sum + day.spent, 0);
  return { spent, remaining: trip.budget - spent, warning: spent > trip.budget ? messages.budgetExceeded : '' };
}
