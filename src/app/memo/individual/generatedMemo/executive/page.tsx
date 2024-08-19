import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueMixData {
  name: string;
  value: number;
}

const data = {
  companyProfile: {
    name: "ABS Solutions",
    established: "2016",
    ceo: "Tom Smith",
  },
  financialSummary: {
    revenue: "$17.5 Bn",
    netIncome: "$1.06 Bn",
    gaapEps: "$0.97",
    nonGaapEps: "$1.04",
  },
  segmentRevenue: [
    { segment: "Personal Systems", revenue: "$12.5 Bn", margin: "6.9%" },
    { segment: "Printing", revenue: "$5.6 Bn", margin: "18.5%" },
  ],
  keyMetrics: {
    totalUnits: "-18%",
    consumerNetRevenue: "-5%",
    commercialNetRevenue: "+17%",
  },
  revenueMix: [
    { name: 'Intelligent Edge', value: 16 },
    { name: 'Computer', value: 43 },
    { name: 'HPC & MCS', value: 13 },
    { name: 'Storage', value: 12 },
    { name: 'Financial Services', value: 11 },
    { name: 'Corporate Investments', value: 5 },
  ] as RevenueMixData[],
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A78BFA', '#F87171'];

const page: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Company Financial Data Analysis Executive Summary
      </h1>

      {/* Company Profile */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Company Profile</h2>
        <p><strong>Company Name:</strong> {data.companyProfile.name}</p>
        <p><strong>Established:</strong> {data.companyProfile.established}</p>
        <p><strong>CEO:</strong> {data.companyProfile.ceo}</p>
      </section>

      {/* Financial Summary */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-100 p-4 rounded">
            <strong>Revenue</strong>
            <p>{data.financialSummary.revenue}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <strong>GAAP Net Income</strong>
            <p>{data.financialSummary.netIncome}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <strong>GAAP EPS</strong>
            <p>{data.financialSummary.gaapEps}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <strong>Non-GAAP EPS</strong>
            <p>{data.financialSummary.nonGaapEps}</p>
          </div>
        </div>
      </section>

      {/* Segment Revenue */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Segment Revenue</h2>
        {data.segmentRevenue.map((segment, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded mb-4">
            <p><strong>{segment.segment}:</strong> Revenue: {segment.revenue}, Operating Margin: {segment.margin}</p>
          </div>
        ))}
      </section>

      {/* Key Metrics */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-100 p-4 rounded">
            <strong>Total Units</strong>
            <p>{data.keyMetrics.totalUnits}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <strong>Consumer Net Revenue</strong>
            <p>{data.keyMetrics.consumerNetRevenue}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <strong>Commercial Net Revenue</strong>
            <p>{data.keyMetrics.commercialNetRevenue}</p>
          </div>
        </div>
      </section>

      {/* Revenue Mix - Pie Chart */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Revenue Mix</h2>
        <div className="bg-gray-100 p-8 rounded">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.revenueMix}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.revenueMix.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default page;
