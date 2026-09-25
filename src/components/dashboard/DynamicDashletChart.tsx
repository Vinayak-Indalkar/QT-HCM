import React, { useLayoutEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5percent from '@amcharts/amcharts5/percent';
import * as am5radar from '@amcharts/amcharts5/radar';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { ChartVisualizationType, ChartDataPoint } from '../../services/dashboardCustomizationService';
import { cn } from '../../utils/cn';

export interface DynamicDashletChartProps {
  chartType: ChartVisualizationType;
  data?: ChartDataPoint[];
  className?: string;
  height?: number | string;
}

const DEFAULT_CHART_DATA: Record<ChartVisualizationType, ChartDataPoint[]> = {
  bar: [
    { label: 'Engineering', value: 24, color: '#3b82f6' },
    { label: 'Product', value: 16, color: '#6366f1' },
    { label: 'Marketing', value: 12, color: '#ec4899' },
    { label: 'Sales', value: 19, color: '#f59e0b' },
    { label: 'Operations', value: 9, color: '#10b981' }
  ],
  horizontal_bar: [
    { label: 'MacBook Pro 16" M3', value: 42, color: '#3b82f6' },
    { label: 'Dell XPS 15 Ultra', value: 28, color: '#6366f1' },
    { label: '4K Ultra Displays', value: 35, color: '#10b981' },
    { label: 'Ergonomic Keyboards', value: 50, color: '#8b5cf6' }
  ],
  line: [
    { label: 'Jan', value: 14, color: '#3b82f6' },
    { label: 'Feb', value: 22, color: '#3b82f6' },
    { label: 'Mar', value: 18, color: '#3b82f6' },
    { label: 'Apr', value: 29, color: '#3b82f6' },
    { label: 'May', value: 38, color: '#3b82f6' },
    { label: 'Jun', value: 34, color: '#3b82f6' }
  ],
  area: [
    { label: 'Week 1', value: 12, color: '#6366f1' },
    { label: 'Week 2', value: 26, color: '#6366f1' },
    { label: 'Week 3', value: 41, color: '#6366f1' },
    { label: 'Week 4', value: 58, color: '#6366f1' }
  ],
  pie: [
    { label: 'Verified & Ready', value: 55, color: '#10b981' },
    { label: 'Doc Verification', value: 25, color: '#f59e0b' },
    { label: 'IT Staging', value: 15, color: '#3b82f6' },
    { label: 'Action Required', value: 5, color: '#ef4444' }
  ],
  donut: [
    { label: 'Statutory I-9 Forms', value: 40, color: '#3b82f6' },
    { label: 'NDAs Signed', value: 30, color: '#8b5cf6' },
    { label: 'Direct Deposit', value: 20, color: '#10b981' },
    { label: 'Pending Uploads', value: 10, color: '#f59e0b' }
  ],
  funnel: [
    { label: 'Offer Accepted', value: 100, color: '#3b82f6', sublabel: '100% Volume' },
    { label: 'Identity Clear', value: 80, color: '#6366f1', sublabel: '80% Gate' },
    { label: 'IT Hardware Staged', value: 60, color: '#8b5cf6', sublabel: '60% Gate' },
    { label: 'Day-1 Orientation', value: 48, color: '#10b981', sublabel: '48% Final' }
  ],
  radial_gauge: [
    { label: 'SLA Clearance Rate', value: 92, color: '#10b981', sublabel: 'Benchmark: 85%' }
  ],
  gantt: [
    { label: 'Offer & Contract Signing', startValue: 1, value: 4, color: '#3b82f6', sublabel: 'Days 1-4' },
    { label: 'Document & Identity Clearance', startValue: 3, value: 9, color: '#6366f1', sublabel: 'Days 3-9' },
    { label: 'IT Hardware & Cloud Provisioning', startValue: 7, value: 14, color: '#8b5cf6', sublabel: 'Days 7-14' },
    { label: 'Compliance & NDA Certification', startValue: 12, value: 18, color: '#ec4899', sublabel: 'Days 12-18' },
    { label: 'Team Intro & Welcome Day-1', startValue: 17, value: 22, color: '#10b981', sublabel: 'Days 17-22' }
  ]
};

export const DynamicDashletChart: React.FC<DynamicDashletChartProps> = ({
  chartType,
  data,
  className,
  height = 220
}) => {
  const chartDivRef = useRef<HTMLDivElement>(null);

  const points = data && data.length > 0 ? data : (DEFAULT_CHART_DATA[chartType] || DEFAULT_CHART_DATA.bar);

  useLayoutEffect(() => {
    if (!chartDivRef.current) return;

    // Create root element
    const root = am5.Root.new(chartDivRef.current);

    // Remove watermark logo
    if (root._logo) {
      root._logo.dispose();
    }

    // Set animated theme
    root.setThemes([am5themes_Animated.new(root)]);

    const isDark = document.documentElement.classList.contains('dark');
    const labelColor = isDark ? am5.color(0x94a3b8) : am5.color(0x64748b);
    const gridColor = isDark ? am5.color(0x334155) : am5.color(0xe2e8f0);

    try {
      if (chartType === 'bar') {
        // --- 1. AMCHARTS 5 COLUMN / VERTICAL BAR CHART ---
        const chart = root.container.children.push(
          am5xy.XYChart.new(root, {
            panX: false,
            panY: false,
            wheelX: 'none',
            wheelY: 'none',
            paddingLeft: 0,
            paddingRight: 10,
            paddingTop: 10,
            paddingBottom: 0
          })
        );

        const xRenderer = am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
          minorGridEnabled: false
        });
        xRenderer.labels.template.setAll({
          fontSize: 11,
          fill: labelColor
        });
        xRenderer.grid.template.setAll({
          stroke: gridColor,
          strokeOpacity: 0.4
        });

        const xAxis = chart.xAxes.push(
          am5xy.CategoryAxis.new(root, {
            categoryField: 'label',
            renderer: xRenderer
          })
        );

        const yRenderer = am5xy.AxisRendererY.new(root, {});
        yRenderer.labels.template.setAll({
          fontSize: 11,
          fill: labelColor
        });
        yRenderer.grid.template.setAll({
          stroke: gridColor,
          strokeOpacity: 0.4
        });

        const yAxis = chart.yAxes.push(
          am5xy.ValueAxis.new(root, {
            renderer: yRenderer,
            min: 0
          })
        );

        const series = chart.series.push(
          am5xy.ColumnSeries.new(root, {
            name: 'Metrics',
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: 'value',
            categoryXField: 'label',
            tooltip: am5.Tooltip.new(root, {
              labelText: '{categoryX}: [bold]{valueY}[/]'
            })
          })
        );

        series.columns.template.setAll({
          cornerRadiusTL: 6,
          cornerRadiusTR: 6,
          strokeOpacity: 0,
          templateField: 'columnSettings',
          fillOpacity: 0.9
        });

        const formattedData = points.map((p) => ({
          label: p.label,
          value: p.value,
          columnSettings: {
            fill: am5.color(p.color || '#3b82f6')
          }
        }));

        xAxis.data.setAll(formattedData);
        series.data.setAll(formattedData);
        series.appear(800);
        chart.appear(800, 100);
      } else if (chartType === 'horizontal_bar') {
        // --- 2. AMCHARTS 5 HORIZONTAL BAR CHART ---
        const chart = root.container.children.push(
          am5xy.XYChart.new(root, {
            panX: false,
            panY: false,
            wheelX: 'none',
            wheelY: 'none',
            paddingLeft: 0,
            paddingRight: 10,
            paddingTop: 10,
            paddingBottom: 0
          })
        );

        const yRenderer = am5xy.AxisRendererY.new(root, {
          inversed: true,
          minGridDistance: 20
        });
        yRenderer.labels.template.setAll({
          fontSize: 11,
          fill: labelColor
        });
        yRenderer.grid.template.setAll({
          stroke: gridColor,
          strokeOpacity: 0.4
        });

        const yAxis = chart.yAxes.push(
          am5xy.CategoryAxis.new(root, {
            categoryField: 'label',
            renderer: yRenderer
          })
        );

        const xRenderer = am5xy.AxisRendererX.new(root, {});
        xRenderer.labels.template.setAll({
          fontSize: 11,
          fill: labelColor
        });
        xRenderer.grid.template.setAll({
          stroke: gridColor,
          strokeOpacity: 0.4
        });

        const xAxis = chart.xAxes.push(
          am5xy.ValueAxis.new(root, {
            renderer: xRenderer,
            min: 0
          })
        );

        const series = chart.series.push(
          am5xy.ColumnSeries.new(root, {
            name: 'Assets',
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: 'value',
            categoryYField: 'label',
            tooltip: am5.Tooltip.new(root, {
              labelText: '{categoryY}: [bold]{valueX}[/]'
            })
          })
        );

        series.columns.template.setAll({
          cornerRadiusTR: 6,
          cornerRadiusBR: 6,
          strokeOpacity: 0,
          templateField: 'columnSettings',
          fillOpacity: 0.9
        });

        const formattedData = points.map((p) => ({
          label: p.label,
          value: p.value,
          columnSettings: {
            fill: am5.color(p.color || '#3b82f6')
          }
        }));

        yAxis.data.setAll(formattedData);
        series.data.setAll(formattedData);
        series.appear(800);
        chart.appear(800, 100);
      } else if (chartType === 'line' || chartType === 'area') {
        // --- 3 & 4. AMCHARTS 5 LINE & AREA CHARTS ---
        const chart = root.container.children.push(
          am5xy.XYChart.new(root, {
            panX: false,
            panY: false,
            wheelX: 'none',
            wheelY: 'none',
            paddingLeft: 0,
            paddingRight: 10,
            paddingTop: 10,
            paddingBottom: 0
          })
        );

        const xRenderer = am5xy.AxisRendererX.new(root, {
          minGridDistance: 30
        });
        xRenderer.labels.template.setAll({
          fontSize: 11,
          fill: labelColor
        });
        xRenderer.grid.template.setAll({
          stroke: gridColor,
          strokeOpacity: 0.4
        });

        const xAxis = chart.xAxes.push(
          am5xy.CategoryAxis.new(root, {
            categoryField: 'label',
            renderer: xRenderer
          })
        );

        const yRenderer = am5xy.AxisRendererY.new(root, {});
        yRenderer.labels.template.setAll({
          fontSize: 11,
          fill: labelColor
        });
        yRenderer.grid.template.setAll({
          stroke: gridColor,
          strokeOpacity: 0.4
        });

        const yAxis = chart.yAxes.push(
          am5xy.ValueAxis.new(root, {
            renderer: yRenderer,
            min: 0
          })
        );

        const series = chart.series.push(
          am5xy.SmoothedXYLineSeries.new(root, {
            name: 'Trends',
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: 'value',
            categoryXField: 'label',
            stroke: am5.color(chartType === 'area' ? 0x6366f1 : 0x3b82f6),
            tooltip: am5.Tooltip.new(root, {
              labelText: '{categoryX}: [bold]{valueY}[/]'
            })
          })
        );

        series.strokes.template.setAll({
          strokeWidth: 3
        });

        if (chartType === 'area') {
          series.fills.template.setAll({
            visible: true,
            fillOpacity: 0.25,
            fill: am5.color(0x6366f1)
          });
        }

        // Add bullets
        series.bullets.push(() => {
          const circle = am5.Circle.new(root, {
            radius: 4,
            fill: am5.color(chartType === 'area' ? 0x6366f1 : 0x3b82f6),
            stroke: am5.color(0xffffff),
            strokeWidth: 2
          });
          return am5.Bullet.new(root, {
            sprite: circle
          });
        });

        const formattedData = points.map((p) => ({
          label: p.label,
          value: p.value
        }));

        xAxis.data.setAll(formattedData);
        series.data.setAll(formattedData);
        series.appear(800);
        chart.appear(800, 100);
      } else if (chartType === 'pie' || chartType === 'donut') {
        // --- 5 & 6. AMCHARTS 5 PIE & DONUT CHARTS ---
        const chart = root.container.children.push(
          am5percent.PieChart.new(root, {
            layout: root.verticalLayout,
            innerRadius: chartType === 'donut' ? am5.percent(58) : 0
          })
        );

        const series = chart.series.push(
          am5percent.PieSeries.new(root, {
            valueField: 'value',
            categoryField: 'label',
            alignLabels: false
          })
        );

        series.labels.template.setAll({
          fontSize: 10,
          text: '{category}',
          fill: labelColor
        });

        series.slices.template.setAll({
          stroke: am5.color(isDark ? 0x0f172a : 0xffffff),
          strokeWidth: 2,
          templateField: 'sliceSettings',
          cornerRadius: 4
        });

        const formattedData = points.map((p) => ({
          label: p.label,
          value: p.value,
          sliceSettings: {
            fill: am5.color(p.color || '#3b82f6')
          }
        }));

        series.data.setAll(formattedData);
        series.appear(800, 100);
      } else if (chartType === 'funnel') {
        // --- 7. AMCHARTS 5 FUNNEL CHART ---
        const chart = root.container.children.push(
          am5percent.SlicedChart.new(root, {
            layout: root.verticalLayout
          })
        );

        const series = chart.series.push(
          am5percent.FunnelSeries.new(root, {
            valueField: 'value',
            categoryField: 'label',
            alignLabels: false,
            orientation: 'vertical'
          })
        );

        series.labels.template.setAll({
          fontSize: 10,
          text: '{category}: {value}%',
          fill: labelColor
        });

        series.slices.template.setAll({
          stroke: am5.color(isDark ? 0x0f172a : 0xffffff),
          strokeWidth: 2,
          templateField: 'sliceSettings'
        });

        const formattedData = points.map((p) => ({
          label: p.label,
          value: p.value,
          sliceSettings: {
            fill: am5.color(p.color || '#3b82f6')
          }
        }));

        series.data.setAll(formattedData);
        series.appear(800, 100);
      } else if (chartType === 'radial_gauge') {
        // --- 8. AMCHARTS 5 RADIAL SLA GAUGE ---
        const chart = root.container.children.push(
          am5radar.RadarChart.new(root, {
            panX: false,
            panY: false,
            startAngle: -180,
            endAngle: 0,
            innerRadius: am5.percent(65)
          })
        );

        const axisRenderer = am5radar.AxisRendererCircular.new(root, {
          innerRadius: -10,
          strokeOpacity: 0.1,
          minGridDistance: 30
        });

        axisRenderer.labels.template.setAll({
          fontSize: 10,
          fill: labelColor
        });

        const axis = chart.xAxes.push(
          am5xy.ValueAxis.new(root, {
            maxDeviation: 0,
            min: 0,
            max: 100,
            strictMinMax: true,
            renderer: axisRenderer
          })
        );

        const targetValue = points[0]?.value || 92;

        // Background Track
        const bgDataItem = axis.makeDataItem({ value: 0, endValue: 100 });
        const bgRange = axis.createAxisRange(bgDataItem);
        bgRange.get('axisFill')?.setAll({
          visible: true,
          fill: am5.color(isDark ? 0x334155 : 0xe2e8f0),
          fillOpacity: 0.5
        });

        // Active Value Arc
        const activeDataItem = axis.makeDataItem({ value: 0, endValue: targetValue });
        const activeRange = axis.createAxisRange(activeDataItem);
        activeRange.get('axisFill')?.setAll({
          visible: true,
          fill: am5.color(0x10b981),
          fillOpacity: 0.95
        });

        // Center Metric label
        chart.radarContainer.children.push(
          am5.Label.new(root, {
            text: `${targetValue}%`,
            fontSize: 22,
            fontWeight: '900',
            fill: isDark ? am5.color(0xffffff) : am5.color(0x0f172a),
            centerX: am5.p50,
            centerY: am5.p50
          })
        );

        chart.appear(800, 100);
      } else if (chartType === 'gantt') {
        // --- 9. AMCHARTS 5 GANTT TIMELINE CHART ---
        const chart = root.container.children.push(
          am5xy.XYChart.new(root, {
            panX: false,
            panY: false,
            wheelX: 'none',
            wheelY: 'none',
            layout: root.verticalLayout,
            paddingLeft: 0,
            paddingRight: 10,
            paddingTop: 5,
            paddingBottom: 0
          })
        );

        const yRenderer = am5xy.AxisRendererY.new(root, {
          inversed: true,
          cellStartLocation: 0.15,
          cellEndLocation: 0.85,
          minorGridEnabled: false
        });

        yRenderer.grid.template.setAll({
          stroke: gridColor,
          strokeDasharray: [3, 3]
        });

        yRenderer.labels.template.setAll({
          fontSize: 10,
          fontWeight: '600',
          fill: labelColor,
          oversizedBehavior: 'truncate',
          maxWidth: 130
        });

        const yAxis = chart.yAxes.push(
          am5xy.CategoryAxis.new(root, {
            categoryField: 'label',
            renderer: yRenderer
          })
        );

        const xRenderer = am5xy.AxisRendererX.new(root, {
          strokeOpacity: 0.1
        });

        xRenderer.grid.template.setAll({
          stroke: gridColor,
          strokeDasharray: [2, 2]
        });

        xRenderer.labels.template.setAll({
          fontSize: 10,
          fill: labelColor
        });

        const minVal = Math.min(...points.map((p) => p.startValue ?? 0));
        const maxVal = Math.max(...points.map((p) => p.value || 10));

        const xAxis = chart.xAxes.push(
          am5xy.ValueAxis.new(root, {
            min: Math.max(0, minVal - 1),
            max: maxVal + 1,
            renderer: xRenderer,
            numberFormat: "'Day' #"
          })
        );

        const series = chart.series.push(
          am5xy.ColumnSeries.new(root, {
            xAxis: xAxis,
            yAxis: yAxis,
            openValueXField: 'startValue',
            valueXField: 'value',
            categoryYField: 'label',
            tooltip: am5.Tooltip.new(root, {
              labelText: '{categoryY}: Day {openValueX} → Day {valueX} ({sublabel})'
            })
          })
        );

        series.columns.template.setAll({
          height: am5.percent(70),
          cornerRadiusTL: 6,
          cornerRadiusTR: 6,
          cornerRadiusBL: 6,
          cornerRadiusBR: 6,
          strokeOpacity: 0,
          shadowColor: am5.color(0x000000),
          shadowBlur: 4,
          shadowOffsetX: 1,
          shadowOffsetY: 2,
          shadowOpacity: 0.15
        });

        series.columns.template.adapters.add('fill', (_fill, target) => {
          const dataItem = target.dataItem;
          if (dataItem) {
            const dataContext = dataItem.dataContext as ChartDataPoint;
            if (dataContext?.color) {
              return am5.color(dataContext.color);
            }
          }
          return am5.color(0x3b82f6);
        });

        const ganttData = points.map((p, idx) => ({
          label: p.label,
          startValue: p.startValue !== undefined ? p.startValue : Math.max(1, idx * 3 + 1),
          value: p.value || (idx + 1) * 4,
          color: p.color || '#3b82f6',
          sublabel: p.sublabel || `Phase ${idx + 1}`
        }));

        yAxis.data.setAll(ganttData);
        series.data.setAll(ganttData);

        series.appear(800);
        chart.appear(800, 100);
      }
    } catch (err) {
      console.error('Error rendering amCharts 5 chart:', err);
    }

    return () => {
      root.dispose();
    };
  }, [chartType, points]);

  return (
    <div className={cn('w-full h-full flex-1 flex flex-col items-center justify-center relative min-h-[100px]', className)}>
      <div
        ref={chartDivRef}
        style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height || '100%' }}
        className="w-full h-full flex-1 min-h-[100px]"
      />
      <div className="absolute top-1 right-1 flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
        <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
          amCharts 5
        </span>
      </div>
    </div>
  );
};
