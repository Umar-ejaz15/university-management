'use client';

import ReactECharts from 'echarts-for-react';

interface BarChartProps {
  title?: string;
  data: {
    categories: string[];
    values: number[];
  };
}

export default function BarChart({ data }: BarChartProps) {
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
      data: data.categories,
      axisLabel: {
        rotate: 45,
        fontSize: 11
      }
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
        barWidth: '60%'
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: '300px' }} />;
}
