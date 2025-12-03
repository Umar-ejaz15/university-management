'use client';

import ReactECharts from 'echarts-for-react';

interface LineChartProps {
  title?: string;
  data: {
    categories: string[];
    values: number[];
  };
}

export default function LineChart({ data }: LineChartProps) {
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.categories,
      boundaryGap: false
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: data.values,
        type: 'line',
        smooth: true,
        itemStyle: {
          color: '#2d6a4f'
        },
        areaStyle: {
          color: 'rgba(45, 106, 79, 0.1)'
        }
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: '300px' }} />;
}
