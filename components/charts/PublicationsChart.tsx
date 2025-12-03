'use client';

import ReactECharts from 'echarts-for-react';

interface PublicationsChartProps {
  data: {
    years: string[];
    values: number[];
  };
}

export default function PublicationsChart({ data }: PublicationsChartProps) {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.years
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: data.values,
        type: 'bar',
        itemStyle: {
          color: '#2d6a4f'
        },
        barWidth: '50%'
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: '280px', width: '100%' }} />;
}
