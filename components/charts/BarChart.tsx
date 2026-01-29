'use client';

import ReactECharts from 'echarts-for-react';

interface BarChartProps {
  title?: string;
  data: {
    categories: string[];
    values: number[];
  };
  color?: string;
  showValues?: boolean;
}

/**
 * Enhanced Bar chart component using ECharts
 * Great for comparing values across different categories
 * Features: animations, value labels, better tooltips, gradient colors
 */
export default function BarChart({
  data,
  color = '#2d6a4f',
  showValues = true
}: BarChartProps) {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 13
      },
      formatter: (params: { axisValue: string; seriesName?: string; value: number }[]) => {
        const data = params[0];
        return `
          <div style="padding: 5px;">
            <strong>${data.axisValue}</strong><br/>
            <span style="color: ${color};">●</span> ${data.seriesName || 'Count'}: <strong>${data.value.toLocaleString()}</strong>
          </div>
        `;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.categories,
      axisLabel: {
        rotate: 30,
        fontSize: 12,
        color: '#666',
        interval: 0,
        formatter: (value: string) => {
          // Truncate long labels
          return value.length > 15 ? value.substring(0, 12) + '...' : value;
        }
      },
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      axisTick: {
        show: false
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
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
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
        name: 'Count',
        data: data.values,
        type: 'bar',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: color },
              { offset: 1, color: color + 'cc' }
            ]
          },
          borderRadius: [6, 6, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: color + 'ff' },
                { offset: 1, color: color + 'dd' }
              ]
            },
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        barWidth: '60%',
        label: showValues ? {
          show: true,
          position: 'top',
          fontSize: 11,
          color: '#666',
          fontWeight: 'bold',
          formatter: (params: { value: number }) => {
            return params.value > 0 ? params.value : '';
          }
        } : undefined
      }
    ],
    animationDuration: 800,
    animationEasing: 'cubicOut'
  };

  return <ReactECharts option={option} style={{ height: '320px', width: '100%' }} />;
}
