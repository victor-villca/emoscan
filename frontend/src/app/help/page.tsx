import Head from 'next/head';

const HelpPage = () => {
  return (
    <>
      <Head>
        <title>Centro de Ayuda - Emoscan</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Centro de Ayuda
            </h1>
            <p className="text-lg text-gray-600 mb-12">
              Encuentra respuestas a las preguntas más comunes y aprende cómo
              aprovechar al máximo EmotiSense.
            </p>

            <div className="bg-white p-8 rounded-lg shadow-sm mb-8 border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Cómo usar la extensión de Chrome
              </h2>
              <ol className="list-decimal list-inside space-y-4 text-gray-700">
                <li>
                  <strong>Instalar la extensión:</strong> Agrega la extensión de
                  EmotiSense a tu navegador Chrome desde la fuente
                  proporcionada.
                </li>
                <li>
                  <strong>Iniciar una sesión:</strong> Desde tu panel, crea una
                  nueva sesión para generar un código único de sesión.
                </li>
                <li>
                  <strong>Activar en Google Meet:</strong> Durante una llamada,
                  haz clic en el ícono de EmotiSense en la barra de extensiones
                  de tu navegador para abrir la superposición.
                </li>
                <li>
                  <strong>Ingresar el código de sesión:</strong> Introduce el
                  código generado en tu panel para vincular la llamada con tu
                  sesión.
                </li>
                <li>
                  <strong>Iniciar el análisis:</strong> La extensión comenzará a
                  detectar rostros. Puedes iniciar y detener el análisis en
                  cualquier momento desde la superposición.
                </li>
              </ol>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Preguntas Frecuentes (FAQ)
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    ¿Mis datos están seguros?
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Sí. Todos los datos se procesan de forma segura. Las
                    imágenes se analizan en tiempo real y solo se almacena la
                    metadata emocional relevante en nuestra base de datos
                    encriptada.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    ¿Qué tan precisa es la detección de emociones?
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Nuestro modelo está entrenado con un amplio conjunto de
                    datos para ofrecer una alta precisión en la detección de
                    emociones primarias. Sin embargo, los resultados siempre
                    deben interpretarse en el contexto de la conversación.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    ¿Puedo usar esto en otras plataformas además de Google Meet?
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Actualmente, la extensión de EmotiSense está optimizada para
                    Google Meet. El soporte para otras plataformas está previsto
                    en futuras actualizaciones.
                  </p>
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
