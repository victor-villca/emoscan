
import { FC } from 'react';
import { SessionCardProps } from '@/types/sessionTypes';

const SessionCard: FC<SessionCardProps> = ({ session }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const timeRange = `${formatTime(session.start_time)} - ${formatTime(session.end_time)}`;

  const determineStatus = () => {
    const sessionDate = new Date(session.date);
    const now = new Date();
    

    if (sessionDate < now) {
  
      if (session.id % 10 === 0) return 'error';
      return 'complete';
    }
    

    if (sessionDate.toDateString() === now.toDateString()) {
      return 'in-progress';
    }
    

    return 'scheduled';
  };
  
  const status = determineStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'scheduled':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'in-progress':
        return 'In Progress';
      case 'error':
        return 'Error';
      case 'scheduled':
        return 'Scheduled';
      default:
        return 'Unknown';
    }
  };

  const facesDetected = (session.id * 3) % 15 || 5;
  
  const emotions = ['Happiness', 'Sadness', 'Neutral', 'Surprise', 'Fear', 'Anger', 'Disgust'];
  const primaryEmotion = emotions[session.id % emotions.length];
  
  const hasError = status === 'error';

  return (
    <div className="card bg-white rounded-lg shadow-sm p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-bold text-gray-800">{session.name}</h2>
          <h3 className="font-semibold text-gray-600">{formatDate(session.date)}</h3>
          <p className="text-sm text-gray-500">{timeRange}</p>
        </div>
        <div className="flex items-center">
          <span className={`status-dot ${getStatusColor(status)}`}></span>
          <span className="text-xs font-medium text-gray-600">{getStatusText(status)}</span>
        </div>
      </div>
      <div className="flex items-center mb-2">
        <div className="w-5 h-5 flex items-center justify-center text-gray-500">
          <i className="ri-information-line"></i>
        </div>
        <span className="ml-2 text-sm text-gray-700">{session.name}</span>
      </div>
      <div className="flex items-center mb-2">
        <div className="w-5 h-5 flex items-center justify-center text-gray-500">
          <i className="ri-user-smile-line"></i>
        </div>
        <span className="ml-2 text-sm text-gray-700">{facesDetected} faces detected</span>
      </div>
      <div className="flex items-center mb-4">
        {hasError ? (
          <>
            <div className="w-5 h-5 flex items-center justify-center text-gray-500">
              <i className="ri-error-warning-line"></i>
            </div>
            <span className="ml-2 text-sm text-gray-700">Processing error occurred</span>
          </>
        ) : status === 'in-progress' ? (
          <>
            <div className="w-5 h-5 flex items-center justify-center text-gray-500">
              <i className="ri-emotion-line"></i>
            </div>
            <span className="ml-2 text-sm text-gray-700">Primary emotion: Analyzing...</span>
          </>
        ) : status === 'scheduled' ? (
          <>
            <div className="w-5 h-5 flex items-center justify-center text-gray-500">
              <i className="ri-time-line"></i>
            </div>
            <span className="ml-2 text-sm text-gray-700">Awaiting session</span>
          </>
        ) : (
          <>
            <div className="w-5 h-5 flex items-center justify-center text-gray-500">
              <i className="ri-emotion-line"></i>
            </div>
            <span className="ml-2 text-sm text-gray-700">Primary emotion: {primaryEmotion}</span>
          </>
        )}
      </div>
      <div className="flex justify-between mt-4">
        {hasError ? (
          <>
            <button className="flex items-center text-primary font-medium text-sm rounded-button">
              <div className="w-5 h-5 flex items-center justify-center mr-1">
                <i className="ri-restart-line"></i>
              </div>
              Retry
            </button>
            <button className="flex items-center text-gray-600 font-medium text-sm rounded-button">
              <div className="w-5 h-5 flex items-center justify-center mr-1">
                <i className="ri-delete-bin-line"></i>
              </div>
              Delete
            </button>
          </>
        ) : status === 'scheduled' ? (
          <>
            <button className="flex items-center text-primary font-medium text-sm rounded-button">
              <div className="w-5 h-5 flex items-center justify-center mr-1">
                <i className="ri-edit-line"></i>
              </div>
              Edit
            </button>
            <button className="flex items-center text-gray-600 font-medium text-sm rounded-button">
              <div className="w-5 h-5 flex items-center justify-center mr-1">
                <i className="ri-calendar-check-line"></i>
              </div>
              Confirm
            </button>
          </>
        ) : (
          <>
            <button className="flex items-center text-primary font-medium text-sm rounded-button">
              <div className="w-5 h-5 flex items-center justify-center mr-1">
                <i className="ri-file-chart-line"></i>
              </div>
              View Report
            </button>
            <button className="flex items-center text-gray-600 font-medium text-sm rounded-button">
              <div className="w-5 h-5 flex items-center justify-center mr-1">
                <i className="ri-download-line"></i>
              </div>
              Export
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SessionCard;