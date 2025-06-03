// components/TermsOfService.tsx
'use client'; // Indica que este es un componente del cliente en Next.js

import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', lineHeight: '1.6', fontFamily: 'Arial, sans-serif' }}>
      <h1>Términos del Servicio de Avdaw Games</h1>
      <p><strong>Fecha de entrada en vigor: 2 de junio de 2025</strong></p>

      <p>Bienvenido a Avdaw Games. Estos Términos del Servicio ({"Términos"}) rigen el uso de nuestra página web de minijuegos y los servicios relacionados (el {"Servicio"}). Al acceder o utilizar el Servicio, usted acepta estar sujeto a estos Términos. Si no está de acuerdo con alguna parte de estos Términos, no debe utilizar el Servicio.</p>

      <h2>1. Cuentas de Usuario</h2>
      <ul>
        <li>
          <strong>Elegibilidad:</strong> Para crear una cuenta y usar nuestro Servicio, debe tener al menos [**Indicar edad mínima, ej., 13 o 16 años.** Considera la edad de consentimiento digital en tu jurisdicción y si tu contenido es apropiado para menores.] años de edad. Al registrarse, usted declara y garantiza que cumple con este requisito de edad.
        </li>
        <li>
          <strong>Información de la Cuenta:</strong> Usted es responsable de mantener la confidencialidad de la información de su cuenta, incluida su contraseña. Usted es responsable de toda la actividad que ocurra bajo su cuenta, incluyendo la creación de salas (`rooms`) y los resultados (`results`) asociados. Se compromete a notificarnos inmediatamente cualquier uso no autorizado de su cuenta.
        </li>
        <li>
          <strong>Veracidad de la Información:</strong> Usted se compromete a proporcionar información verdadera, precisa, actual y completa al registrarse y actualizar su perfil de usuario (ej., `username`, `email`, `avatar`).
        </li>
      </ul>

      <h2>2. Uso del Servicio</h2>
      <ul>
        <li>
          <strong>Licencia de Uso:</strong> Le otorgamos una licencia limitada, no exclusiva, intransferible y revocable para acceder y usar el Servicio únicamente para su uso personal y no comercial, de acuerdo con estos Términos.
        </li>
        <li>
          <strong>Conducta del Usuario:</strong> Usted se compromete a no utilizar el Servicio para:
          <ul>
            <li>Cualquier propósito ilegal o que infrinja estos Términos.</li>
            <li>Acosar, abusar, insultar, dañar, difamar, calumniar, menospreciar, intimidar o discriminar a otros jugadores (utilizando, por ejemplo, nombres de usuario ofensivos).</li>
            <li>Cargar o transmitir virus o cualquier otro tipo de código malicioso o tecnología dañina.</li>
            <li>Recopilar o rastrear la información personal de otros usuarios sin su consentimiento expreso.</li>
            <li>Interferir o eludir las características de seguridad o las funcionalidades de juego del Servicio.</li>
            <li>Intentar acceder a áreas del sistema o datos a los que no tiene permiso (ej., manipulando el estado de la partida en el `board` de una `room` sin ser su turno o sin autorización).</li>
          </ul>
        </li>
        <li>
          <strong>Juegos Multijugador:</strong> Usted comprende que los minijuegos son interactivos y que su nombre de usuario (`username`), avatar (`avatar`), y acciones de juego (ej., movimientos en el `board`) serán visibles para otros participantes en la misma sala (`room`). El `room_name` generado aleatoriamente será público para que otros puedan unirse.
        </li>
      </ul>

      <h2>3. Propiedad Intelectual</h2>
      <ul>
        <li>
          <strong>Contenido del Servicio:</strong> Todo el contenido presente en Avdaw Games, incluyendo textos, gráficos, logotipos, iconos, imágenes de juegos, código fuente (Frontend: Next.js, React; Backend: Lógica de juego, Edge Functions, etc.), y la disposición del Servicio, es propiedad de Avdaw Games o de sus licenciantes y está protegido por las leyes de derechos de autor y propiedad intelectual.
        </li>
        <li>
          <strong>Licencias de Software Abierto:</strong> Avdaw Games utiliza y se beneficia de software de código abierto con licencias permisivas (como MIT y Apache 2.0 para Next.js, React, Supabase, y la librería `unique-names-generator`). Respetamos y cumplimos con los términos de estas licencias.
        </li>
        <li>
          <strong>Licencia del Proyecto Avdaw Games:</strong> El código fuente de Avdaw Games está destinado a ser publicado bajo una licencia de software libre/código abierto, como la **Licencia MIT**. Esto permitirá a otros desarrolladores el uso, modificación y distribución con fines comerciales y no comerciales, siempre que se mantenga la atribución al autor original y la nota de licencia.
        </li>
        <li>
          <strong>Contenido de Usuario:</strong> Usted conserva la propiedad de cualquier contenido que envíe al Servicio (ej., su avatar o descripción de perfil). Al enviarlo, nos otorga una licencia mundial, no exclusiva, libre de regalías, sublicenciable y transferible para usar, reproducir, distribuir, preparar obras derivadas de, mostrar y ejecutar dicho contenido en relación con el Servicio.
        </li>
      </ul>

      <h2>4. Descargo de Responsabilidad</h2>
      <p>El Servicio se proporciona {"tal cual"} y {"según disponibilidad"}, sin garantías de ningún tipo, ya sean expresas o implícitas. No garantizamos que el Servicio sea ininterrumpido, seguro, libre de errores o que la sincronización de las partidas sea siempre perfecta. El uso del Servicio es bajo su propio riesgo.</p>

      <h2>5. Limitación de Responsabilidad</h2>
      <p>En la medida máxima permitida por la ley aplicable, Avdaw Games no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo, incluyendo, entre otros, la pérdida de beneficios, datos, uso, fondo de comercio u otras pérdidas intangibles, resultantes de (i) su acceso o uso o incapacidad de acceder o usar el Servicio; (ii) cualquier conducta o contenido de cualquier tercero en el Servicio (incluyendo otros jugadores); (iii) cualquier contenido obtenido del Servicio; y (iv) el acceso, uso o alteración no autorizados de sus transmisiones o contenido, ya sea por garantía, contrato, agravio (incluida negligencia) o cualquier otra teoría legal, hayamos sido o no informados de la posibilidad de tales daños.</p>

      <h2>6. Cambios en los Términos</h2>
      <p>Podemos modificar estos Términos en cualquier momento. Si un cambio es material, le avisaremos con al menos 30 días de antelación mediante la publicación en nuestra página web o por otros medios de comunicación (ej., correo electrónico si lo tenemos). Su uso continuado del Servicio después de la entrada en vigor de cualquier modificación constituye su aceptación de los Términos revisados.</p>

      <h2>7. Ley Aplicable y Jurisdicción</h2>
      <p>Estos Términos se regirán e interpretarán de acuerdo con las leyes de **España**, sin tener en cuenta sus disposiciones sobre conflictos de leyes. Usted acepta someterse a la jurisdicción exclusiva de los tribunales ubicados en **Alcalá de Henares, Comunidad de Madrid, España**, para resolver cualquier disputa que surja de estos Términos o del Servicio.</p>

      <h2>8. Contacto</h2>
      <p>Si tiene alguna pregunta sobre estos Términos, puede ponerse en contacto con nosotros:</p>
      <ul>
        <li>Por correo electrónico: avdawgames@gmail.com</li>
      </ul>
    </div>
  );
};

export default TermsOfService;