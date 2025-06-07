import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const ChartRenderer = ({ type, data, options }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Times New Roman',
            size: 10
          }
        }
      },
      title: {
        display: true,
        text: options?.title || '',
        font: {
          family: 'Times New Roman',
          size: 12,
          weight: 'bold'
        }
      },
    },
    scales: type !== 'pie' && type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Times New Roman',
            size: 9
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: 'Times New Roman',
            size: 9
          }
        }
      }
    } : {},
    ...options
  }

  const chartData = {
    labels: data.labels || [],
    datasets: data.datasets || []
  }

  const containerStyle = {
    height: '350px',
    margin: '0',
    padding: '0',
    backgroundColor: '#ffffff'
  }

  switch (type) {
    case 'bar':
      return (
        <div style={containerStyle}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      )
    case 'line':
      return (
        <div style={containerStyle}>
          <Line data={chartData} options={chartOptions} />
        </div>
      )
    case 'pie':
      return (
        <div style={containerStyle}>
          <Pie data={chartData} options={chartOptions} />
        </div>
      )
    case 'doughnut':
      return (
        <div style={containerStyle}>
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      )
    default:
      return (
        <div style={containerStyle}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      )
  }
}

export default ChartRenderer 