'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InitializeSession() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  async function startScreenShare() {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as MediaTrackConstraints,
        audio: false,
      });
      setScreenStream(stream);
      setLoading(false);
    } catch (err) {
      console.error('Error capturing screen:', err);
      setLoading(false);
      alert('Could not start screen capture. Please try again.');
    }
  }

  function stopScreenShare() {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
  }

  function proceedToNextStep() {
    if (!screenStream) {
      alert('Please share your screen first.');
      return;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Initialize Session
          </h1>
        </div>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <i className="ri-information-line text-blue-600"></i>
              <h2 className="font-medium text-blue-800">
                Step 1: Share Your Screen
              </h2>
            </div>
            <p className="text-blue-700 text-sm">
              To begin emotion detection, please share your screen. This will
              allow EmoScan to analyze facial expressions from your video
              conference, presentation, or meeting.
            </p>
          </div>

          <div className="flex justify-center">
            {!screenStream ? (
              <button
                onClick={startScreenShare}
                disabled={loading}
                className="flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-lg hover:bg-opacity-90 transition"
              >
                {loading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"></div>
                ) : (
                  <i className="ri-computer-line"></i>
                )}
                Share Screen
              </button>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    id="screenPreview"
                    autoPlay
                    muted
                    ref={(videoEl) => {
                      if (videoEl && screenStream) {
                        videoEl.srcObject = screenStream;
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={stopScreenShare}
                      className="bg-white bg-opacity-75 hover:bg-opacity-100 text-red-500 p-2 rounded-full transition"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Screen shared successfully
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Link
            href="/"
            onClick={stopScreenShare}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <i className="ri-arrow-left-line"></i>
            Cancel
          </Link>
          <button
            onClick={proceedToNextStep}
            className="flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-lg hover:bg-opacity-90 transition"
          >
            Continue
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
