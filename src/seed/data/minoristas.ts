import { catalogEnum } from '../../common/enum';

interface minoristaDto {
  ocupacion: catalogEnum;
  description: string;
  latitud: string;
  longitud: string;
}

export const minoristaSeed: minoristaDto[] = [
  {
    ocupacion: catalogEnum.VETERINARIO,
    description:
      '¡Hola amantes de los animales! Soy el Dr. Jonathan , tu veterinario de confianza dedicado a proporcionar atención excepcional a tus mascotas. Con pasión y experiencia, me enorgullece ofrecer servicios compasivos y especializados para garantizar la salud y felicidad de tus compañeros peludos.\n',
    latitud: '19.345682499787404',
    longitud: '-99.03150729697765',
  },
  {
    ocupacion: catalogEnum.VENDEDORES,
    description:
      '👕 ¡Ey, qué onda, banda!, el ropero ambulante del tianguis ah vuelto. ¡A darle estilo a la vida con lo último en moda! 🚀\nRopa Chida a Precio de Barrio:\nNo ando con rollos, aquí encuentras trapos buenos, bonitos y baratos. Si quieres vestirte con onda sin romper el cochinito, este es tu lugar.\nMix & Match:\nNi que fueras modelo de revista, aquí te armamos looks al estilo "me puse lo primero que encontré, pero aún así lucho". Dale un toque propio a tu estilo, ¡nadie tiene que saber que te levantaste tarde!\nPa\' Toda la Banda:\nChico, grande, flaco, llenito, aquí hay ropa para todos los gustos y tallas. Sin prejuicios, la moda es para todos.\n',
    latitud: '19.387357175560968',
    longitud: '-99.03476886837845',
  },
  {
    ocupacion: catalogEnum.VENDEDORES,
    description:
      ' ¡Oye, Oye, Amarillos y Amarillas! Soy Jorge, el Verdulero Que le Pone Sazón al Tianguis. ¡Vamos a Hacer Tu Cocina la Envidia del Barrio! \n',
    latitud: '19.347410171906237',
    longitud: '-99.01022128623546',
  },
  {
    ocupacion: catalogEnum.MAESTRO,
    description:
      'Maestra Apasionada por la Educación\n¡Saludos! Soy Brenda, una maestra comprometida con inspirar y cultivar el amor por el aprendizaje en cada estudiante. Con dedicación y entusiasmo, mi objetivo es crear un ambiente educativo enriquecedor y fomentar el crecimiento académico y personal.\nÁreas de Especialización:\nRazonamiento matematico.\nDesarrollo de habilidades sociales y emocionales.\nMétodos innovadores de enseñanza.\nEnfoque Pedagógico:\nCreo en la importancia de adaptar mi enseñanza a las necesidades individuales de cada estudiante. Fomento un entorno inclusivo donde la curiosidad se cultiva y el aprendizaje se vuelve significativo.\nCompromiso con el Éxito Estudiantil:\nTutorías personalizadas para abordar las necesidades de cada estudiante.\nFomento de la participación activa en el aula.\nCreación de planes de lecciones creativos e interactivos.\nValores Fundamentales:\nRespeto y empatía hacia los estudiantes.\nEstímulo del pensamiento crítico y la resolución de problemas.\nColaboración estrecha con padres y colegas.\nContacto:\n¿Listo para un viaje educativo emocionante? Estoy aquí para ayudar. Ponte en contacto conmigo para discutir cómo puedo contribuir al éxito académico de tus hijos.\n',
    latitud: '19.339527573602155',
    longitud: '-99.02572803236646',
  },
  {
    ocupacion: catalogEnum.ELECTRICIDAD,
    description:
      'Electricista de confianza, comprometido con brindar soluciones seguras y eficientes para tus necesidades eléctricas. Con experiencia sólida y atención al detalle, estoy aquí para mantener tu hogar o negocio encendido de manera confiable.\nServicios Eléctricos:\nInstalación y mantenimiento de sistemas eléctricos.\nReparación de fallas y cortocircuitos.\nActualizaciones para mayor eficiencia energética.\nInstalación de iluminación y sistemas de seguridad.\nCompromiso con la Seguridad:\nTu seguridad es mi prioridad. Realizo cada trabajo con precisión y cumplo con los estándares de seguridad para garantizar un entorno libre de riesgos eléctricos.\nServicio Personalizado:\nEvaluación detallada de tus necesidades eléctricas.\nPresupuestos claros y transparentes.\nAsesoramiento sobre opciones energéticamente eficientes.\nDisponibilidad Rápida:\nEstoy listo para abordar tus problemas eléctricos de manera rápida y eficiente. Ya sea una emergencia o una mejora planificada, estoy aquí para ayudar.\n',
    latitud: '19.331858329170668',
    longitud: '-99.02093925360731',
  },
  {
    ocupacion: catalogEnum.ARQUITECTO,
    description:
      'Arquitecto Creativo para Tus Sueños Arquitectónicos\n¡Bienvenido al estudio arquitectónico de Luis Angel! Soy un arquitecto apasionado con una visión única y un compromiso inquebrantable con la creación de espacios que inspiran y perduran en el tiempo.\n',
    latitud: '19.330638954286016',
    longitud: '-99.02148477819603',
  },
  {
    ocupacion: catalogEnum.DISENADOR,
    description:
      'Diseñador Creativo para Transformar Ideas en Realidad\n¡Hola! Soy Vicente Barajas, un apasionado diseñador comprometido con la creación visual impactante. Transformo tus ideas en diseños innovadores que destacan y comunican de manera efectiva.\nServicios Destacados:\nDiseño de marca y logotipos.\nCreación de materiales de marketing atractivos.\nDiseño de interfaces y experiencia de usuario.\nIlustración y gráficos personalizados.\nEnfoque Creativo:\nMi proceso de diseño se basa en la colaboración cercana contigo para capturar la esencia de tu visión. Cada proyecto es una oportunidad para fusionar funcionalidad con estética, creando soluciones visualmente impactantes.\nHabilidades Esenciales:\nDominio de herramientas de diseño como Adobe Creative Suite.\nSensibilidad estética y atención al detalle.\nAdaptabilidad para abordar una variedad de estilos y plataformas.\nCompromiso Profesional:\nDesde el concepto hasta la implementación, estoy dedicado a garantizar que cada proyecto cumpla y supere tus expectativas. Mi objetivo es hacer que tu marca destaque y que tus diseños impacten positivamente.\n',
    latitud: '19.33120896075948',
    longitud: '-99.01900222724105',
  },
  {
    ocupacion: catalogEnum.PINTURA,
    description: 'Pintor con 10 años de experiencia \n',
    latitud: '19.33339616143339',
    longitud: '-99.01273298349986',
  },
];
