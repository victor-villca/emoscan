import Head from 'next/head';

const HelpPage = () => {
  return (
    <>
      <Head><title>Help Center - EmotiSense</title></Head>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Help Center</h1>
            <p className="text-lg text-gray-600 mb-12">
              Find answers to common questions and learn how to get the most out of EmotiSense.
            </p>
            <div className="bg-white p-8 rounded-lg shadow-sm mb-8 border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">How to Use the Chrome Extension</h2>
              <ol className="list-decimal list-inside space-y-4 text-gray-700">
                <li><strong>Install the Extension:</strong> Add the EmotiSense extension to your Chrome browser from the provided source.</li>
                <li><strong>Start a Session:</strong> From your dashboard, create a new session to generate a unique session code.</li>
                <li><strong>Activate in Google Meet:</strong> During a call, click the EmotiSense icon in your browser's extension bar to open the overlay.</li>
                <li><strong>Enter Session Code:</strong> Input the code generated in your dashboard to link the call to your session.</li>
                <li><strong>Start Analysis:</strong> The extension will begin detecting faces. You can start and stop the analysis at any time from the overlay.</li>
              </ol>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Frequently Asked Questions (FAQ)</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800">Is my data secure?</h3>
                  <p className="text-gray-600 mt-1">Yes. All data is processed securely. Images are analyzed in real-time and only relevant emotional metadata is stored in our encrypted database.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">How accurate is the emotion detection?</h3>
                  <p className="text-gray-600 mt-1">Our model is trained on a vast dataset to provide high accuracy in detecting primary emotions. However, results should always be interpreted in the context of the conversation.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Can I use this on other platforms besides Google Meet?</h3>
                  <p className="text-gray-600 mt-1">Currently, the EmotiSense extension is optimized for Google Meet. Support for other platforms is planned for future updates.</p>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default HelpPage;