'use client';

import ReactECharts from 'echarts-for-react';

interface AreaChartProps {
  data: {
    categories: string[];
    values: number[];
  };
  color?: string;
  gradient?: boolean;
  height?: number;
}

/**
 * Enhanced Area chart with gradient fill
 * Perfect for showing trends and volumes over time
 */
export default function AreaChart({
  data,
  color = '#2d6a4f',
  gradient = true,
  height = 320
}: AreaChartProps) {
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 13
      },
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: color
        }
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.categories,
      boundaryGap: false,
      axisLabel: {
        fontSize: 12,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12,
        color: '#666',
        formatter: (value: number) => {
          if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k';
          }
          return value.toString();
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        data: data.values,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: color,
          borderWidth: 2,
          borderColor: '#fff'
        },
        lineStyle: {
          width: 3,
          color: color
        },
        areaStyle: gradient ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: color + '60' },
              { offset: 0.5, color: color + '30' },
              { offset: 1, color: color + '08' }
            ]
          }
        } : {
          color: color + '20'
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }
    ],
    animationDuration: 1200,
    animationEasing: 'cubicOut'
  };

  return <ReactECharts option={option} style={{ height: `${height}px`, width: '100%' }} />;
}
