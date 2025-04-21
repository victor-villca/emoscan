"use client"
import { useState, useEffect } from 'react';
import Head from 'next/head';
import * as echarts from 'echarts';
import { use } from "react";
import Link from 'next/link';

interface Emotion {
  id: number;
  emotion_report_id: number;
  emotion_type_id: number;
  percentage: string;
  detected_at: string;
}

interface EmotionReport {
  id: number;
  participant_id: number;
  emotions: Emotion[];
}

interface Participant {
  id: number;
  session_id: number;
  name: string;
  face_snapshot_url: string;
}

interface ParticipantData {
  participant: Participant;
  emotionReport: EmotionReport;
}
const emotionTypes = {
  1: { name: 'Happy', color: 'rgba(87, 181, 231, 1)', iconClass: 'ri-emotion-happy-line' },
  2: { name: 'Sad', color: 'rgba(251, 191, 114, 1)', iconClass: 'ri-emotion-sad-line' },
  3: { name: 'Angry', color: 'rgba(252, 141, 98, 1)', iconClass: 'ri-emotion-unhappy-line' },
  4: { name: 'Surprised', color: 'rgba(140, 145, 179, 1)', iconClass: 'ri-emotion-line' },
  5: { name: 'Neutral', color: 'rgba(141, 211, 199, 1)', iconClass: 'ri-emotion-normal-line' },
  6: { name: 'Fearful', color: 'rgba(187, 157, 206, 1)', iconClass: 'ri-emotion-2-line' },
  7: { name: 'Disgusted', color: 'rgba(34, 197, 94, 0.7)', iconClass: 'ri-emotion-2-line' }
};


export default function ParticipantReport({
  params,
}: {
  params: Promise<{sessionId: string, participantId: string }>;
}) {
  const {sessionId, participantId } = use(params);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ParticipantData | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    console.log(participantId)
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions/participant/${participantId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch participant data');
        }
        const data = await response.json();
        setData(data);
        setError(null)
      } catch (err) {
        setError('Error fetching participant data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [participantId]);

  useEffect(() => {
    if ( loading) return;


    const pieChartElement = document.getElementById('pieChart');
    if (pieChartElement) {
      const pieChart = echarts.init(pieChartElement);
      const pieData = data?.emotionReport.emotions.map(emotion => ({
        value: parseFloat(emotion.percentage),
        name: emotionTypes[emotion.emotion_type_id as keyof typeof emotionTypes]?.name || `Type ${emotion.emotion_type_id}`,
        itemStyle: {
          color: emotionTypes[emotion.emotion_type_id as keyof typeof emotionTypes]?.color || '#ccc'
        }
      }));

      const pieOption = {
        animation: false,
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderColor: '#e2e8f0',
          textStyle: {
            color: '#1f2937'
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: {
            color: '#1f2937'
          }
        },
        series: [{
          name: 'Emotion Distribution',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: pieData
        }]
      };
      pieChart.setOption(pieOption);

  
      const handleResize = () => {
        pieChart.resize();
      };
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        pieChart.dispose();
      };
    }
  }, [data, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-red-500 mb-4">{error || "No data available"}</p>
        <Link href={"/"} className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
          Go Back
        </Link>
          
      </div>
    );
  }

  const { participant, emotionReport } = data;
  
  const totalSessionMinutes = 480;
  const emotionMinutes = emotionReport.emotions.map(emotion => {
    const minutes = Math.round((parseFloat(emotion.percentage) / 100) * totalSessionMinutes);
    return {
      ...emotion,
      minutes
    };
  });

  const sessionDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <Head>
        <title>Emotion Analysis - {participant.name}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css" />
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Emotion Analysis Report</h1>
            <p className="text-gray-600 mt-1">{sessionDate} (9:00 AM - 5:00 PM)</p>
          </div>
          <div className="flex gap-4">
          <Link href={`/session/${sessionId}`} className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition whitespace-nowrap">
              <div className="w-5 h-5 flex items-center justify-center mr-2">
                <i className="ri-arrow-left-line"></i>
              </div>
              Back to Session
          </Link>
            <button className="flex items-center bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition whitespace-nowrap">
              <div className="w-5 h-5 flex items-center justify-center mr-2">
                <i className="ri-file-download-line"></i>
              </div>
              Export PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            {!participant.face_snapshot_url ? (
              <img 
                src={participant.face_snapshot_url} 
                alt={participant.name} 
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <img 
                src="/placeholder.png" 
                alt="Placeholder"
                className="w-full h-full object-cover object-top p-12"
              />
            )}
          </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900">{participant.name}</h3>
                <p className="text-gray-600">Session ID: {participant.session_id}</p>
                <p className="text-gray-600">Participant ID: {participant.id}</p>
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {emotionMinutes.map((emotion) => {
                  const emotionType = emotionTypes[emotion.emotion_type_id as keyof typeof emotionTypes] || {
                    name: `Type ${emotion.emotion_type_id}`,
                    color: '#ccc',
                    iconClass: 'ri-emotion-line'
                  };
                  
                  return (
                    <div key={emotion.id} className="bg-gray-50 rounded p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                             style={{ backgroundColor: `${emotionType.color}20`, color: emotionType.color }}>
                          <i className={`${emotionType.iconClass} ri-lg`}></i>
                        </div>
                        <span className="font-medium text-gray-900">{emotionType.name}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-2xl font-semibold text-gray-900">{emotion.minutes}m</span>
                        <span className="text-gray-500 text-sm">{emotion.percentage}% of session</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 bg-gray-50 rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-900">Session Summary</h3>
                  <span className="text-gray-600">Total Duration: 8h 00m</span>
                </div>
                <p className="text-gray-700">
                  During this 8-hour session, {participant.name} primarily displayed
                  {emotionMinutes
                    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))
                    .slice(0, 2)
                    .map((emotion, index, arr) => {
                      const emotionName = emotionTypes[emotion.emotion_type_id as keyof typeof emotionTypes]?.name || `Type ${emotion.emotion_type_id}`;
                      return index === 0 
                        ? ` ${emotionName.toLowerCase()} (${emotion.percentage}%)` 
                        : `${index === arr.length - 1 ? ' and ' : ', '}${emotionName.toLowerCase()} (${emotion.percentage}%)`;
                    })} emotions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Emotion Distribution</h2>
            <div id="pieChart" className="w-full h-80"></div>
          </div>
          <div className="bg-white rounded shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Details</h2>
            <table className="w-full">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700 font-medium">Session ID</td>
                  <td className="py-3 text-gray-900">{participant.session_id}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700 font-medium">Participant Name</td>
                  <td className="py-3 text-gray-900">{participant.name}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700 font-medium">Participant ID</td>
                  <td className="py-3 text-gray-900">{participant.id}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700 font-medium">Date</td>
                  <td className="py-3 text-gray-900">{sessionDate}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700 font-medium">Duration</td>
                  <td className="py-3 text-gray-900">8 hours (9:00 AM - 5:00 PM)</td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-700 font-medium">Dominant Emotion</td>
                  <td className="py-3 text-gray-900">
                    {emotionMinutes.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))[0] && 
                      emotionTypes[(emotionMinutes.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))[0].emotion_type_id) as keyof typeof emotionTypes]?.name}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Emotion Analysis</h2>
          <p className="text-gray-700 mb-4">
            This report provides an analysis of {participant.name}'s emotional expressions during the 8-hour session. 
            The data was captured using facial expression analysis technology that identifies key facial markers to 
            determine the emotional state of the participant.
          </p>
          <div className="bg-blue-50 rounded p-4 text-blue-800 text-sm mt-1" >
            <div className="flex items-center gap-2 mb-2">
              <i className="ri-information-line"></i>
              <span className="font-medium">About Emotion Analysis</span>
            </div>
            <p>
              Our emotion detection technology measures facial micro-expressions to determine emotional states. 
              The system has a 95% accuracy rate when compared to human observer assessments. Results should be 
              interpreted in context and may be influenced by cultural expressions of emotion.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
