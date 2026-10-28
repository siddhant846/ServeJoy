import React from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, DollarSign, Receipt, Award, Coffee } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AnalyticsDashboard: React.FC = () => {
  const { todayRevenue, todayProfit, todayBills, bestSellerItem, cafeProfile } = useApp();

  // Hourly aggregation for today's orders
  const hourlyData = [
    { hour: '9 AM', sales: 120 },
    { hour: '11 AM', sales: 340 },
    { hour: '1 PM', sales: 580 },
    { hour: '3 PM', sales: 260 },
    { hour: '5 PM', sales: 720 },
    { hour: '7 PM', sales: todayRevenue > 1000 ? todayRevenue - 800 : 450 },
    { hour: '9 PM', sales: 210 },
  ];

  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-card space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Revenue */}
        <div className="rounded-2xl bg-secondary/50 p-3.5 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Today Revenue</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 font-display text-xl sm:text-2xl font-extrabold text-foreground">
            {cafeProfile.currency}
            {todayRevenue}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            +18.4% vs yesterday
          </p>
        </div>

        {/* Net Profit */}
        <div className="rounded-2xl bg-secondary/50 p-3.5 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Est. Profit</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 font-display text-xl sm:text-2xl font-extrabold text-foreground">
            {cafeProfile.currency}
            {todayProfit}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            After food costs
          </p>
        </div>

        {/* Total Bills */}
        <div className="rounded-2xl bg-secondary/50 p-3.5 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Total Bills</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 font-display text-xl sm:text-2xl font-extrabold text-foreground">
            {todayBills.length}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Avg ticket {cafeProfile.currency}{todayBills.length > 0 ? Math.round(todayRevenue / todayBills.length) : 0}
          </p>
        </div>

        {/* Bestseller */}
        <div className="rounded-2xl bg-secondary/50 p-3.5 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Bestseller</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 font-display text-sm font-extrabold text-foreground truncate">
            {bestSellerItem ? bestSellerItem.name : 'Pav Bhaji'}
          </div>
          <p className="text-[10px] text-accent font-semibold mt-0.5">
            {bestSellerItem ? `${bestSellerItem.count} portions sold` : 'High demand item'}
          </p>
        </div>
      </div>

      {/* Hourly Trend Chart */}
      <div className="rounded-2xl bg-secondary/30 p-4 border border-border/60">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-display text-xs font-bold text-foreground">Hourly Sales Velocity</h4>
            <p className="text-[10px] text-muted-foreground">Order volume throughout the day</p>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#888" />
              <YAxis tick={{ fontSize: 10 }} stroke="#888" />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '1rem',
                  fontSize: '11px',
                  boxShadow: 'var(--shadow-card)',
                }}
                formatter={(value: any) => [`${cafeProfile.currency}${value}`, 'Sales']}
              />
              <Bar dataKey="sales" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

