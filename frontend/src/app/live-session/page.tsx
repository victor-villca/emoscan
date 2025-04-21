'use client';
import { useState } from 'react';
import Link from 'next/link';

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
      console.error('Error al capturar pantalla:', err);
      setLoading(false);
      alert('No se pudo iniciar la captura de pantalla. Por favor, inténtalo de nuevo.');
    }
  }

  function stopScreenShare() {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
  }

  function goToStep2() {
    if (!screenStream) {
      alert('Por favor, comparte tu pantalla antes de continuar.');
      return;
    }
    setCurrentStep(2);
  }

  function goBackToStep1() {
    setCurrentStep(1);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Inicializar sesión</h1>
        </div>

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-information-line text-blue-600"></i>
                <h2 className="font-medium text-blue-800">Paso 1: Comparte tu pantalla</h2>
              </div>
              <p className="text-blue-700 text-sm">
                Para comenzar con la detección de emociones, por favor comparte tu pantalla. 
                Esto permitirá que EmotiSense analice las expresiones faciales desde tu videollamada, presentación o reunión.
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
                  Compartir pantalla
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
                  <p className="text-gray-600 text-sm">Pantalla compartida correctamente</p>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <Link
                href="/"
                onClick={stopScreenShare}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
              >
                <i className="ri-arrow-left-line"></i>
                Cancelar
              </Link>
              <button
                onClick={goToStep2}
                className="flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-lg hover:bg-opacity-90 transition"
              >
                Siguiente
                <i className="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-check-line text-green-600"></i>
                <h2 className="font-medium text-green-800">Paso 2: Listo para detectar rostros</h2>
              </div>
              <p className="text-green-700 text-sm">
                ¡Perfecto! La pantalla se ha compartido correctamente. Ahora podemos continuar con la detección de rostros.
                Haz clic en el botón de abajo para seleccionar los rostros que deseas seguir durante esta sesión.
              </p>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={goBackToStep1}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
              >
                <i className="ri-arrow-left-line"></i>
                Volver
              </button>
              <button
                onClick={() => alert('TODO: Acción de selección de rostros')}
                className="bg-primary text-black px-6 py-3 rounded-lg hover:bg-opacity-90 transition flex items-center gap-2"
              >
                Seleccionar rostros
                <i className="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
