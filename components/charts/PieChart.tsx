'use client';

import ReactECharts from 'echarts-for-react';

interface PieChartProps {
  data: { name: string; value: number }[];
  colors?: string[];
  donut?: boolean;
  height?: number;
  /** Pass false when the parent renders its own legend outside the chart */
  showLegend?: boolean;
  center?: [string, string];
  radius?: string | string[];
}

export default function PieChart({
  data,
  colors = ['#2d6a4f', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc'],
  donut = false,
  height = 320,
  showLegend = true,
  center,
  radius,
}: PieChartProps) {
  // When we own the legend we shift the pie left so the legend fits on the right.
  // When the caller provides its own legend we centre the pie.
  const pieCenter: [string, string] = center ?? (showLegend ? ['36%', '50%'] : ['50%', '50%']);
  const pieRadius = radius ?? (donut ? ['42%', '68%'] : '65%');

  // No center graphic — keep the donut hole clean
  const graphic: unknown[] = [];

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.97)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: { color: '#333', fontSize: 13 },
      formatter: (params: { color: string; name: string; value: number; percent: number }) => `
        <div style="padding:6px 10px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="display:inline-block;width:10px;height:10px;background:${params.color};border-radius:50%;"></span>
            <strong>${params.name}</strong>
          </div>
          <div style="padding-left:18px;line-height:1.6;">
            Count:&nbsp;<strong>${params.value}</strong><br/>
            Share:&nbsp;<strong>${params.percent}%</strong>
          </div>
        </div>
      `,
    },

    legend: showLegend
      ? {
          orient: 'vertical',
          right: '2%',
          top: 'middle',
          itemWidth: 10,
          itemHeight: 10,
          borderRadius: 6,
          textStyle: { fontSize: 12, color: '#444', lineHeight: 20 },
          formatter: (name: string) => {
            const item = data.find((d) => d.name === name);
            return item ? `${name}  (${item.value})` : name;
          },
        }
      : { show: false },

    graphic,

    series: [
      {
        type: 'pie',
        radius: pieRadius,
        center: pieCenter,
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
        },
        // No static slice labels — legend carries the info
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          // For donut: show segment value/% in the hole on hover
          label: donut
            ? {
                show: true,
                position: 'center',
                fontSize: 18,
                fontWeight: 'bold',
                color: '#222',
                formatter: (params: { name: string; value: number; percent: number }) =>
                  `${params.value}\n${params.percent}%`,
              }
            : { show: false },
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(0,0,0,0.18)',
          },
        },
        data: data.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: colors[index % colors.length] },
        })),
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDuration: 900,
      },
    ],
  };

  return (
    <ReactECharts option={option} style={{ height: `${height}px`, width: '100%' }} />
  );
}
