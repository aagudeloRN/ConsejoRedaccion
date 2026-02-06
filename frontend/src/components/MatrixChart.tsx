"use client";
import { Scatter } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Title
} from 'chart.js';
import { News } from '@/types';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, Title);

interface MatrixChartProps {
    dataPoints: { x: number; y: number; title: string; category: string; is_prioritized?: boolean }[];
}

export default function MatrixChart({ dataPoints }: MatrixChartProps) {
    const data = {
        datasets: [
            {
                label: 'Noticias',
                data: dataPoints,
                backgroundColor: dataPoints.map(dp => {
                    // Executive priority gets golden color
                    if (dp.is_prioritized) return 'rgba(245, 158, 11, 0.9)'; // Amber

                    switch (dp.category) {
                        case 'Urgente': return 'rgba(220, 38, 38, 0.8)'; // Red
                        case 'Semana': return 'rgba(234, 88, 12, 0.8)'; // Orange
                        case 'Luego': return 'rgba(107, 114, 128, 0.8)'; // Gray
                        default: return 'rgba(59, 130, 246, 0.8)'; // Blue
                    }
                }),
                borderColor: dataPoints.map(dp => dp.is_prioritized ? '#d97706' : 'transparent'),
                borderWidth: dataPoints.map(dp => dp.is_prioritized ? 3 : 0),
                pointRadius: dataPoints.map(dp => dp.is_prioritized ? 10 : 8),
                pointHoverRadius: dataPoints.map(dp => dp.is_prioritized ? 13 : 10),
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: { display: true, text: 'Impacto (1-5)', font: { weight: 'bold' } },
                min: 0,
                max: 6,
                grid: {
                    color: (context: any) => context.tick.value === 3 ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
                    lineWidth: (context: any) => context.tick.value === 3 ? 2 : 1,
                }
            },
            y: {
                title: { display: true, text: 'Relevancia (1-5)', font: { weight: 'bold' } },
                min: 0,
                max: 6,
                grid: {
                    color: (context: any) => context.tick.value === 3 ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
                    lineWidth: (context: any) => context.tick.value === 3 ? 2 : 1,
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const point = context.raw;
                        const priorityLabel = point.is_prioritized ? ' ⭐ ESTRATÉGICA' : '';
                        return `${point.title}${priorityLabel} (Imp: ${point.x}, Rel: ${point.y})`;
                    }
                }
            },
            annotation: {
                // Annotations requires extra plugin, keeping it simple for now with Background Grids
            }
        }
    };

    return (
        <div className="relative h-96 w-full bg-white p-4 rounded-lg shadow border border-gray-200">
            {/* Quadrant Labels Overlay */}
            <div className="absolute top-4 left-4 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded opacity-70">SEMANA</div>
            <div className="absolute top-4 right-4 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded opacity-70">URGENTE</div>
            <div className="absolute bottom-4 left-4 text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded opacity-70">LUEGO / ARCHIVAR</div>
            <div className="absolute bottom-4 right-4 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded opacity-70">ESTRATÉGICO</div>

            <Scatter options={options as any} data={data} />
        </div>
    );
}
