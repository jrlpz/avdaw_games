// components/PrivacyPolicy.tsx
'use client';

import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', lineHeight: '1.6', fontFamily: 'Arial, sans-serif' }}>
      <h1>Política de Privacidad de Avdaw Games</h1>
      <p><strong>Fecha de entrada en vigor: 2 de junio de 2025</strong></p>

      <p>Bienvenido a Avdaw Games. En Avdaw Games, valoramos su privacidad y nos comprometemos a proteger su información personal. Esta Política de Privacidad describe cómo recopilamos, usamos, procesamos y compartimos su información personal cuando utiliza nuestra página web de minijuegos ({"Servicio"}).</p>

      <h2>1. Información que Recopilamos</h2>
      <p>Recopilamos información para proporcionarle y mejorar nuestros servicios. El tipo de información que recopilamos depende de cómo interactúa con nuestro Servicio:</p>
      <ul>
        <li>
          <strong>Información de Registro y Perfil (`users` tabla):</strong> Cuando se registra en Avdaw Games o actualiza su perfil, recopilamos información como su <strong>dirección de correo electrónico</strong>, <strong>nombre de usuario (`username`)</strong> y una <strong>contraseña cifrada</strong>. También puede optar por proporcionar una <strong>descripción</strong> y una <strong>URL de avatar (`avatar`)</strong> o una <strong>ruta de almacenamiento (`avatar_path`)</strong> para su perfil. Esta información es gestionada a través del servicio de autenticación de Supabase y nuestra tabla `users`.
        </li>
        <li>
          <strong>Datos de Partida y Juego (`rooms` y `results` tablas):</strong> Recopilamos datos relacionados con su actividad de juego para habilitar y analizar los minijuegos. Esto incluye:
          <ul>
            <li><strong>Creación y Unión a Salas (`rooms`):</strong> Información sobre las partidas que crea o a las que se une (ej., `room_name`, `game_type`). También se almacena el estado del juego (`board`, `next_player`, `winner`) en estas salas para la sincronización.</li>
            <li><strong>Resultados de Partidas (`results`):</strong> Detalles sobre el desempeño en las partidas, incluyendo el nombre de usuario asociado al resultado (`name`) y el `room_name` de la partida.</li>
            <li><strong>Símbolos y Avatares de Jugadores:</strong> Dentro de las salas, se registra el `player1_symbol`, `player2_symbol`, `player1_avatar` y `player2_avatar` para la visualización en la partida.</li>
          </ul>
        </li>
        <li>
          <strong>Información de Conexión Automática:</strong> Cuando accede y utiliza el Servicio, recopilamos automáticamente su dirección IP, tipo de navegador, sistema operativo, páginas visitadas y datos de tiempo/fecha.
        </li>
        <li>
          <strong>Cookies y Tecnologías Similares:</strong> Utilizamos cookies y tecnologías de seguimiento similares (como `sessionStorage` para guardar temporalmente su nombre de usuario y avatar, como se ve en el componente `NewGamePage`) para mantener la sesión, mejorar su experiencia de usuario y analizar el uso de la web.
        </li>
      </ul>

      <h2>2. Cómo Utilizamos su Información</h2>
      <p>Utilizamos la información recopilada para diversos fines, incluyendo:</p>
      <ul>
        <li>Proporcionar y mantener nuestro Servicio, incluyendo la creación y gestión de cuentas, y la funcionalidad de los minijuegos.</li>
        <li>Permitir y gestionar la creación y unión a partidas multiusuario en tiempo real.</li>
        <li>Sincronizar el estado de los juegos entre los jugadores.</li>
        <li>Personalizar su experiencia en el juego (ej., mostrando su avatar y nombre de usuario).</li>
        <li>Comunicarnos con usted sobre su cuenta o el Servicio (ej., para restablecer contraseña).</li>
        <li>Analizar el uso del Servicio y mejorar su rendimiento, las funcionalidades de los juegos y la experiencia del usuario.</li>
        <li>Detectar, prevenir y abordar problemas técnicos, de seguridad o actividades fraudulentas.</li>
        <li>Cumplir con nuestras obligaciones legales y reglamentarias.</li>
      </ul>

      <h2>3. Cómo Compartimos su Información</h2>
      <p>No vendemos ni alquilamos su información personal a terceros. Podemos compartir su información en las siguientes situaciones:</p>
      <ul>
        <li>
          <strong>Con otros jugadores:</strong> Su nombre de usuario (`username`) y avatar (`avatar`) serán visibles para otros jugadores en el lobby de partidas y durante las partidas en curso. Los resultados asociados a su nombre de usuario también pueden ser visibles.
        </li>
        <li>
          <strong>Proveedores de Servicios:</strong> Compartimos información con terceros que nos prestan servicios esenciales para el funcionamiento de Avdaw Games. Esto incluye a <strong>Supabase</strong> (para la base de datos PostgreSQL, autenticación, Realtime y Edge Functions) y <strong>Vercel</strong> (para el alojamiento y despliegue). Estos proveedores están obligados a proteger su información y a no usarla para otros fines.
        </li>
        <li>
          <strong>Cumplimiento Legal:</strong> Podemos divulgar su información si así lo exige la ley o en respuesta a solicitudes válidas de autoridades públicas (por ejemplo, una orden judicial).
        </li>
        <li>
          <strong>Protección de Derechos:</strong> Podemos divulgar su información cuando creamos de buena fe que la divulgación es necesaria para proteger nuestros derechos, su seguridad o la seguridad de otros.
        </li>
      </ul>

      <h2>4. Protección de Datos y Sus Derechos (RGPD/GDPR)</h2>
      <p>Para usuarios dentro del Espacio Económico Europeo (EEE) y otras jurisdicciones con leyes de protección de datos similares, cumplimos con el Reglamento General de Protección de Datos (RGPD). Sus derechos incluyen:</p>
      <ul>
        <li>
          <strong>Derecho de acceso:</strong> Puede solicitar una copia de la información personal que tenemos sobre usted.
        </li>
        <li>
          <strong>Derecho de rectificación:</strong> Puede solicitar que corrijamos cualquier información inexacta o incompleta.
        </li>
        <li>
          <strong>Derecho de supresión ({"derecho al olvido"}):</strong> Puede solicitar la eliminación de su información personal en ciertas circunstancias.
        </li>
        <li>
          <strong>Derecho a la limitación del tratamiento:</strong> Puede solicitar que limitemos el tratamiento de sus datos personales.
        </li>
        <li>
          <strong>Derecho a la portabilidad de los datos:</strong> Tiene derecho a recibir los datos personales que nos ha proporcionado en un formato estructurado, de uso común y lectura mecánica.
        </li>
        <li>
          <strong>Derecho de oposición:</strong> Puede oponerse al tratamiento de sus datos personales en determinadas circunstancias.
        </li>
      </ul>
      <p>Para ejercer cualquiera de estos derechos, o si tiene alguna preocupación sobre cómo manejamos sus datos, póngase en contacto con nosotros a través de <strong>avdawgames@gmail.com</strong>.</p>

      <h2>5. Seguridad de los Datos</h2>
      <p>Tomamos medidas de seguridad técnicas y organizativas razonables para proteger su información personal contra el acceso no autorizado, la alteración, divulgación o destrucción. Esto incluye el uso de las características de seguridad proporcionadas por Supabase (ej., cifrado de contraseñas, autenticación multifactor opcional, Row Level Security para controlar el acceso a la base de datos) y Vercel (protección de red, certificados SSL/TLS automáticos).</p>

      <h2>6. Enlaces a Otros Sitios Web</h2>
      <p>Nuestro Servicio puede contener enlaces a otros sitios web que no son operados por nosotros. Si hace clic en un enlace de un tercero, será dirigido a ese sitio de un tercero. Le recomendamos encarecidamente que revise la Política de Privacidad de cada sitio que visite, ya que no tenemos control ni asumimos responsabilidad por el contenido, las políticas de privacidad o las prácticas de sitios o servicios de terceros.</p>

      <h2>7. Cambios a Esta Política de Privacidad</h2>
      <p>Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio sustancial publicando la nueva Política de Privacidad en esta página y actualizando la {"Fecha de entrada en vigor"}. Se le aconseja revisar esta Política de Privacidad periódicamente para cualquier cambio.</p>

      <h2>8. Contacto</h2>
      <p>Si tiene alguna pregunta sobre esta Política de Privacidad, puede ponerse en contacto con nosotros:</p>
      <ul>
        <li>Por correo electrónico: <strong>avdawgames@gmail.com</strong></li>
      </ul>
    </div>
  );
};

export default PrivacyPolicy;