'use client';

import ReactECharts from 'echarts-for-react';

interface PublicationsChartProps {
  data: {
    years: string[];
    values: number[];
  };
}

/**
 * Enhanced Publication history chart
 * Displays a faculty member's publications year by year with gradient bars
 * Features: value labels, gradient colors, smooth animations, better tooltips
 */
export default function PublicationsChart({ data }: PublicationsChartProps) {
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
      formatter: (params: any) => {
        const data = params[0];
        const count = data.value;
        const plural = count === 1 ? '' : 's';
        return `
          <div style="padding: 5px;">
            <strong>${data.axisValue}</strong><br/>
            <span style="color: #2d6a4f;">●</span> <strong>${count}</strong> Publication${plural}
          </div>
        `;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.years,
      axisLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: 500
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
      minInterval: 1,
      axisLabel: {
        fontSize: 12,
        color: '#666'
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
        name: 'Publications',
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
              { offset: 0, color: '#2d6a4f' },
              { offset: 1, color: '#52b788' }
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
                { offset: 0, color: '#1e4d39' },
                { offset: 1, color: '#2d6a4f' }
              ]
            },
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        barWidth: '55%',
        label: {
          show: true,
          position: 'top',
          fontSize: 12,
          color: '#666',
          fontWeight: 'bold',
          formatter: (params: any) => {
            return params.value > 0 ? params.value : '';
          }
        }
      }
    ],
    animationDuration: 800,
    animationEasing: 'cubicOut'
  };

  return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />;
}
