'use client';

import ReactECharts from 'echarts-for-react';

interface PieChartProps {
  data: {
    name: string;
    value: number;
  }[];
  colors?: string[];
  donut?: boolean;
  height?: number;
  center?: [string, string];
  radius?: string | string[];
}

/**
 * Enhanced Pie/Donut chart component
 * Perfect for showing proportions and distributions
 * Features: smooth animations, hover effects, percentage labels
 */
export default function PieChart({
  data,
  colors = ['#2d6a4f', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc'],
  donut = false,
  height = 320,
  center,
  radius,
}: PieChartProps) {
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 13
      },
      formatter: (params: { color: string; name: string; value: number; percent: number }) => {
        return `
          <div style="padding: 5px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 10px; height: 10px; background: ${params.color}; border-radius: 50%;"></span>
              <strong>${params.name}</strong>
            </div>
            <div style="margin-top: 5px; padding-left: 18px;">
              <span style="color: #666;">Count: <strong>${params.value}</strong></span><br/>
              <span style="color: #666;">Percentage: <strong>${params.percent}%</strong></span>
            </div>
          </div>
        `;
      }
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      itemGap: 12,
      textStyle: {
        color: '#666',
        fontSize: 12
      },
      icon: 'circle'
    },
    series: [
      {
        name: 'Distribution',
        type: 'pie',
        radius: radius ?? (donut ? ['45%', '70%'] : '70%'),
        center: center ?? ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: donut ? 'center' : 'outside',
          formatter: donut ? '{d}%\n{b}' : '{b}\n{d}%',
          fontSize: donut ? 14 : 12,
          fontWeight: donut ? 'bold' : 'normal',
          color: donut ? '#1a1a1a' : '#666'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        labelLine: {
          show: !donut,
          length: 15,
          length2: 10,
          smooth: true
        },
        data: data.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: colors[index % colors.length]
          }
        })),
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDuration: 1000
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: `${height}px`, width: '100%' }} />;
}
