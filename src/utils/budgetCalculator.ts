import dayjs from 'dayjs';
import type { DayPlan } from '../models/dayPlan';
import type { Spot } from '../models/spot';
import type { Trip } from '../models/trip';
import { messages } from '../constants/messages';

export function calcTripCost(dayPlans: DayPlan[], spots: Spot[]) {
  const spotMap = new Map(spots.map((spot) => [spot.id, spot]));
  return dayPlans.reduce((sum, day) => {
    return sum + day.items.reduce((inner, item) => inner + (spotMap.get(item.spot_id)?.price || 0), 0);
  }, 0);
}

export function calcDayCost(day: DayPlan, spots: Spot[]) {
  const spotMap = new Map(spots.map((spot) => [spot.id, spot]));
  return day.items.reduce((sum, item) => sum + (spotMap.get(item.spot_id)?.price || 0), 0);
}

// 旅行天数：日期跨度与已编排天数取较大值，至少 1 天，避免额度虚高或除零
export function tripDayCount(trip: Trip, dayPlans: DayPlan[] = []) {
  const span = dayjs(trip.end_date).diff(dayjs(trip.start_date), 'day') + 1;
  const planned = dayPlans.filter((day) => day.trip_id === trip.id).length;
  return Math.max(1, span, planned);
}

// 每日额度：总预算按旅行天数平均分摊
export function dailyAllowance(trip: Trip, dayPlans: DayPlan[] = []) {
  return trip.budget / tripDayCount(trip, dayPlans);
}

export function overAmount(spent: number, allowance: number) {
  return Math.max(0, Math.round((spent - allowance) * 100) / 100);
}

export interface DayBudget {
  spent: number;
  allowance: number;
  over: number;
  warning: string;
}

// 单日预算状态：预计花费、当日额度、超出金额与统一提醒文案（详情/编排/分享共用）
export function dayBudgetStatus(trip: Trip, day: DayPlan, spots: Spot[], dayPlans: DayPlan[] = []): DayBudget {
  const allowance = dailyAllowance(trip, dayPlans);
  const spent = calcDayCost(day, spots);
  const over = overAmount(spent, allowance);
  return { spent, allowance, over, warning: over > 0 ? messages.dayBudgetExceeded : '' };
}

export function budgetStatus(trip: Trip, dayPlans: DayPlan[], spots: Spot[]) {
  const spent = calcTripCost(dayPlans, spots);
  return { spent, remaining: trip.budget - spent, warning: spent > trip.budget ? messages.budgetExceeded : '' };
}
