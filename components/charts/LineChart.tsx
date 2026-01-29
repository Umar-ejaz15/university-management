'use client';

import ReactECharts from 'echarts-for-react';

interface LineChartProps {
  title?: string;
  data: {
    categories: string[];
    values: number[];
  };
  color?: string;
  showArea?: boolean;
}

/**
 * Enhanced Line chart with smooth curves and optional shaded area
 * Perfect for showing trends over time
 * Features: smooth animations, gradient area fill, data point markers, better tooltips
 */
export default function LineChart({
  data,
  color = '#2d6a4f',
  showArea = true
}: LineChartProps) {
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
      formatter: (params: any) => {
        const data = params[0];
        return `
          <div style="padding: 5px;">
            <strong>${data.axisValue}</strong><br/>
            <span style="color: ${color};">●</span> ${data.seriesName || 'Value'}: <strong>${data.value.toLocaleString()}</strong>
          </div>
        `;
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
        name: 'Value',
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
        areaStyle: showArea ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: color + '40' },
              { offset: 1, color: color + '05' }
            ]
          }
        } : undefined,
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
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  };

  return <ReactECharts option={option} style={{ height: '320px', width: '100%' }} />;
}
