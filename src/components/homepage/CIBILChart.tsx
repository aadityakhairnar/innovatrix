import React, { FC } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RADIAN = Math.PI / 180;

interface DataItem {
  name: string;
  value: number;
  color: string;
}

interface CIBILChartProps {
  cibilScore: number;
}

const data: DataItem[] = [
  { name: 'Poor', value: 280, color: '#FF3347' },   // Range 300-579
  { name: 'Fair', value: 90, color: '#FBCEB5' },    // Range 580-669
  { name: 'Good', value: 80, color: '#DEFF8B' },    // Range 670-749
  { name: 'Very Good', value: 50, color: '#8CBA51' },  // Range 750-799
  { name: 'Excellent', value: 100, color: '#132A13' },  // Range 800-900
];

const cx = 150;
const cy = 80;
const iR = 50;
const oR = 80;

const getNeedle = (value: number, data: DataItem[], cx: number, cy: number, iR: number, oR: number, color: string) => {
  let total = 0;
  data.forEach((v) => {
    total += v.value;
  });
  const ang = 180.0 * (1 - (value - 300) / 600);  // Maps score 300-900 to angle 0-180
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  const r = 5;
  const x0 = cx + 5;
  const y0 = cy + 5;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return (
    <g>
      <circle cx={x0} cy={y0} r={r} fill="currentColor" stroke="none" />
      <path d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`} stroke="none" fill="currentColor" />
    </g>
  );
};

const CIBILChart: FC<CIBILChartProps> = ({ cibilScore }) => {
  return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
            <Pie
              dataKey="value"
              startAngle={180}
              endAngle={0}
              data={data}
              cx={cx}
              cy={cy}
              innerRadius={iR}
              outerRadius={oR}
              fill="#8884d8"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {getNeedle(cibilScore, data, cx, cy, iR, oR, 'foreground')}
        </PieChart>
      </ResponsiveContainer>
  );
};

export default CIBILChart;
