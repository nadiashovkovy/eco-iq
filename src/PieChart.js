import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import './App.css';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
  } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);


const PieChart = ({ data }) => {
  const [selectedText, setSelectedText] = useState(
    data.descriptions[0]
  );
  const [selectedScore, setSelectedScore] = useState(data.scores[0]);
  const [selectedCategory, setSelectedCategory] = useState('Environmental Impact'); 


  if (!data || data.length === 0) {
    return <p>Loading chart data...</p>;
  }

  const chartData = {
    labels: ["Environmental Impact", "Supply Chain", "Business Operations"],
    datasets: [
      {
        data: data.scores,
        backgroundColor: ['#E0D4E1', '#F6FAB5', '#B2E3CB'],
        borderWidth: 2,
        hoverBackgroundColor: ['#E0D4E1', '#F6FAB5', '#B2E3CB'],
      },
    ],
  };


  const options = {
    responsive: true,
    cutout: '40%',
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'White',
            titleFont: { size: 12, family: 'Poppins', color: 'Black' },
            titleColor: 'Black',
            callbacks: {
                title: (tooltipItems) => {
                  const index = tooltipItems[0].dataIndex; 
                  const category = chartData.labels[index]; 
                  const score = chartData.datasets[0].data[index]; 
                  return `${category}: ${score}/10`; 
                },
                label: () => '',
            },
        },
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && elements[0].index !== undefined) {
        const index = elements.length > 0 && elements[0].index !== undefined ? elements[0].index : 0; // Default to index 0
        setSelectedText(data.descriptions[index]);
        setSelectedScore(data.scores[index]);
        setSelectedCategory(chartData.labels[index]);
      }
    },
  };


  // ChartJS.register({
  //   id: 'centerText',
  //   beforeDraw(chart) {
  //     if (chart.config.options.plugins.centerNumber?.display) {
  //       const { width } = chart;
  //       const { height } = chart;
  //       const ctx = chart.ctx;
  //       const number = chart.config.options.plugins.centerNumber.number;
  //       ctx.save();
  //       ctx.font = 'bold 24px Poppins';
  //       ctx.fillStyle = 'black';
  //       ctx.textAlign = 'center';
  //       ctx.textBaseline = 'middle';
  //       ctx.restore();
  //     }
  //   },
  // });



  return (
    <div className="pie-chart-container">
      <div style={{ flex: '0', position: 'relative' }}>
      <div
          style= {{
            position: 'relative',
            left: '50%',
            transform: 'translate(-5%, 450%)',
            fontSize: '24px',
            fontFamily: 'Poppins',
            color: data.overallScore < 50 ? 'red' : data.overallScore < 70 ? 'yellow' : 'green', // change color based on how bad or good the score is
          }}
        > 
        {data.overallScore}</div>
        <Pie data={chartData} options={options}/>
      </div>

      <div className="description-wrapper">
        <h2> {selectedCategory} Score: {selectedScore}/10 </h2>
        <p>{selectedText}</p>

        <div class="service-box">
            <div class="flip-inner">
                <div class="flip-front">
                    <p>The overall score is found by finding the average value of the three sustainability categories and applying a multiplier of 10</p>
                </div>
                <div class="flip-back">
                    <p>This score was calculated using OpenAI's GPT-4o model as well as publically available news sources.</p>
                </div>
            </div>
        </div>

      </div>

    </div>

    
  );
};



export default PieChart;