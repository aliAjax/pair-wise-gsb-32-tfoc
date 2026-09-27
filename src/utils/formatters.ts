import dayjs from 'dayjs';
import { SpotCategory } from '../constants/spot';
import { TripStatus } from '../constants/trip';
import type { Trip } from '../models/trip';
import type { DayPlan } from '../models/dayPlan';
import type { Spot } from '../models/spot';
import { messages } from '../constants/messages';
import { dailyBudgetSummary } from './budgetCalculator';

export const spotCategoryText: Record<SpotCategory, string> = {
  [SpotCategory.NATURE]: '自然风光',
  [SpotCategory.CULTURE]: '人文历史',
  [SpotCategory.FOOD]: '美食购物',
  [SpotCategory.ENTERTAINMENT]: '娱乐休闲',
};
export const tripStatusText: Record<TripStatus, string> = {
  [TripStatus.PLANNING]: '规划中',
  [TripStatus.ONGOING]: '进行中',
  [TripStatus.FINISHED]: '已结束',
};
export const transportText: Record<string, string> = { walk: '步行', metro: '地铁', taxi: '出租', train: '火车' };
export const formatDate = (value: string) => dayjs(value).format('YYYY-MM-DD');
export const formatCurrency = (value: number, currency = 'CNY') => new Intl.NumberFormat('zh-CN', { style: 'currency', currency }).format(value);

export function buildItineraryText(trip: Trip, dayPlans: DayPlan[], spots: Spot[]) {
  const spotMap = new Map(spots.map((spot) => [spot.id, spot]));
  const lines = [`TripWeaver 行程单：${trip.title}`, `${trip.destination} · ${trip.start_date} 至 ${trip.end_date}`];
  dailyBudgetSummary(trip, dayPlans, spots).forEach((summary) => {
    const day = dayPlans.find((item) => item.trip_id === trip.id && item.day_index === summary.dayIndex);
    lines.push(`第 ${summary.dayIndex} 天（${day?.date || '未定'}）`);
    (day?.items || []).forEach((item) => {
      const spot = spotMap.get(item.spot_id);
      lines.push(`- ${item.start_time}-${item.end_time} ${spot?.name || '未知景点'} ${formatCurrency(spot?.price || 0, trip.currency)}`);
    });
    const total = `当天合计 ${formatCurrency(summary.spent, trip.currency)} / 每日额度 ${formatCurrency(summary.allowance, trip.currency)}`;
    lines.push(summary.over > 0 ? `${total}，超出 ${formatCurrency(summary.over, trip.currency)}，${messages.dailyBudgetExceeded}` : total);
  });
  return lines.join('\n');
}

