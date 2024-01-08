--
-- PostgreSQL database dump
--

-- Dumped from database version 14.3 (Debian 14.3-1.pgdg110+1)
-- Dumped by pg_dump version 15.5 (Debian 15.5-0+deb12u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: solicitudes_ocupacion_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.solicitudes_ocupacion_enum AS ENUM (
    'Medico',
    'Psicologo',
    'Veterinario',
    'Arquitecto',
    'Maestro',
    'Diseñador',
    'Cocinero',
    'Dentista',
    'Informatica',
    'Albañileria',
    'Vendedores',
    'Carpinteria',
    'Mecanica',
    'Pintura',
    'Herreria',
    'Jardineria',
    'Plomeria',
    'Electricidad',
    'Clases extracurriculares',
    'Costureria / Sastreria'
);


ALTER TYPE public.solicitudes_ocupacion_enum OWNER TO postgres;

--
-- Name: user_minorista_ocupacion_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_minorista_ocupacion_enum AS ENUM (
    'Medico',
    'Psicologo',
    'Veterinario',
    'Arquitecto',
    'Maestro',
    'Diseñador',
    'Cocinero',
    'Dentista',
    'Informatica',
    'Albañileria',
    'Vendedores',
    'Carpinteria',
    'Mecanica',
    'Pintura',
    'Herreria',
    'Jardineria',
    'Plomeria',
    'Electricidad',
    'Clases extracurriculares',
    'Costureria / Sastreria'
);


ALTER TYPE public.user_minorista_ocupacion_enum OWNER TO postgres;

--
-- Name: users_usertype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_usertype_enum AS ENUM (
    'admin',
    'minorista',
    'user'
);


ALTER TYPE public.users_usertype_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: contrataciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contrataciones (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "fechaContratacion" timestamp without time zone DEFAULT now() NOT NULL,
    "usuarioId" uuid,
    "minoristaId" uuid
);


ALTER TABLE public.contrataciones OWNER TO postgres;

--
-- Name: fav_notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fav_notification (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "userId" uuid
);


ALTER TABLE public.fav_notification OWNER TO postgres;

--
-- Name: images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.images (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    url text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "postId" uuid,
    "opinionId" uuid
);


ALTER TABLE public.images OWNER TO postgres;

--
-- Name: opinion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opinion (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "postId" uuid,
    "userId" uuid
);


ALTER TABLE public.opinion OWNER TO postgres;

--
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" uuid
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- Name: solicitudes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitudes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type numeric DEFAULT '0'::numeric NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "isAccepted" boolean,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    ocupacion public.solicitudes_ocupacion_enum,
    description text,
    latitud text,
    longitud text,
    "userId" uuid
);


ALTER TABLE public.solicitudes OWNER TO postgres;

--
-- Name: user_minorista; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_minorista (
    id uuid NOT NULL,
    ocupacion public.user_minorista_ocupacion_enum NOT NULL,
    description text NOT NULL,
    latitud text NOT NULL,
    longitud text NOT NULL,
    "idUser" uuid
);


ALTER TABLE public.user_minorista OWNER TO postgres;

--
-- Name: user_scores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_scores (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    score numeric NOT NULL,
    "usuarioCalificadorId" uuid,
    "usuarioCalificadoId" uuid
);


ALTER TABLE public.user_scores OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    curp text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    phone text NOT NULL,
    "userType" public.users_usertype_enum DEFAULT 'user'::public.users_usertype_enum NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "urlImgProfile" text DEFAULT 'https://files-tt.s3.amazonaws.com/nobody.jpg'::text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    score numeric DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_favorites_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_favorites_users (
    "usersId_1" uuid NOT NULL,
    "usersId_2" uuid NOT NULL
);


ALTER TABLE public.users_favorites_users OWNER TO postgres;

--
-- Data for Name: contrataciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contrataciones (id, "fechaContratacion", "usuarioId", "minoristaId") FROM stdin;
351bed06-052d-4b1d-b93e-6acf8bac23f4	2023-12-13 05:18:25.921112	2cfe4d17-f80d-4f4a-a37d-79a3c6170fc5	36060f96-4362-4167-abbb-7eeec95af670
\.


--
-- Data for Name: fav_notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fav_notification (id, title, message, "isRead", "userId") FROM stdin;
\.


--
-- Data for Name: images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.images (id, url, "createdAt", "updatedAt", "postId", "opinionId") FROM stdin;
\.


--
-- Data for Name: opinion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opinion (id, content, "createdAt", "postId", "userId") FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, title, description, "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- Data for Name: solicitudes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitudes (id, type, title, message, "isRead", "isAccepted", "createdAt", ocupacion, description, latitud, longitud, "userId") FROM stdin;
59cc9281-8e52-4faf-9cb2-4244d2199119	0	Solicitud de minorista	El usuario JUAN ALBERTO ha solicitado convertir su cuenta a minorista	f	\N	2023-12-21 02:14:57.374549	Medico	Medico especialista	latitud	longitud	131ed68d-9a72-4156-aa9f-875f0c643350
8e11ee3a-f0e2-4c6d-9a7d-9e8bd4a7ac12	1	Reactivación de cuenta	El usuario Jesus Neria Flores ha solicitado la reactivación de su cuenta	t	t	2023-12-21 02:17:23.537686	\N	\N	\N	\N	bfe6bc2d-1ec3-4e61-975a-dd187ab29140
5dd08a94-8e60-43de-8774-74f922278c3a	1	Reactivación de cuenta	El usuario Carlos Vega TEST ha solicitado la reactivación de su cuenta	t	t	2023-12-21 03:30:55.099031	\N	\N	\N	\N	41462080-1391-468a-828b-bcfa9123bd5a
0bb374bf-38a7-4050-ab60-c5be55e4dab8	1	Reactivación de cuenta	El usuario Carlos Vega TEST ha solicitado la reactivación de su cuenta	t	t	2023-12-21 03:46:03.443066	\N	\N	\N	\N	41462080-1391-468a-828b-bcfa9123bd5a
1d70f3d4-c22f-4903-837d-f8bf34e42ca0	1	Reactivación de cuenta	El usuario Carlos Vega TEST ha solicitado la reactivación de su cuenta	t	t	2023-12-21 03:47:49.881668	\N	\N	\N	\N	41462080-1391-468a-828b-bcfa9123bd5a
7bfa39bb-0f0e-4855-84df-a6f4d6dc7644	1	Reactivación de cuenta	El usuario Carlos Vega TEST ha solicitado la reactivación de su cuenta	t	t	2023-12-21 03:57:08.548228	\N	\N	\N	\N	41462080-1391-468a-828b-bcfa9123bd5a
33cced11-ff74-48fa-9ea2-d815f8dbfea5	1	Reactivación de cuenta	El usuario Carlos Vega TEST ha solicitado la reactivación de su cuenta	t	t	2023-12-21 04:10:44.211324	\N	\N	\N	\N	41462080-1391-468a-828b-bcfa9123bd5a
0b8f7776-230c-40c1-b076-ab242e98c09d	1	Reactivación de cuenta	El usuario Carlos Vega TEST ha solicitado la reactivación de su cuenta	t	t	2023-12-21 04:19:29.11927	\N	\N	\N	\N	41462080-1391-468a-828b-bcfa9123bd5a
0b7ce3f7-abfa-4fd2-92f4-caa143ba2daf	1	Reactivación de cuenta	El usuario Carlos Vega TEST ha solicitado la reactivación de su cuenta	t	t	2023-12-21 04:20:10.020812	\N	\N	\N	\N	41462080-1391-468a-828b-bcfa9123bd5a
f9fee6fb-d442-48b8-b5d4-b50986dd3976	1	Reactivación de cuenta	El usuario Carlos Vega TEST ha solicitado la reactivación de su cuenta	f	\N	2023-12-21 05:07:47.344481	\N	\N	\N	\N	41462080-1391-468a-828b-bcfa9123bd5a
\.


--
-- Data for Name: user_minorista; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_minorista (id, ocupacion, description, latitud, longitud, "idUser") FROM stdin;
e6ac6eb7-517e-4352-bf63-0a5ea1c4da48	Veterinario	¡Hola amantes de los animales! Soy el Dr. Jonathan , tu veterinario de confianza dedicado a proporcionar atención excepcional a tus mascotas. Con pasión y experiencia, me enorgullece ofrecer servicios compasivos y especializados para garantizar la salud y felicidad de tus compañeros peludos.\n	19.345682499787404	-99.03150729697765	e6ac6eb7-517e-4352-bf63-0a5ea1c4da48
2cfe4d17-f80d-4f4a-a37d-79a3c6170fc5	Vendedores	👕 ¡Ey, qué onda, banda!, el ropero ambulante del tianguis ah vuelto. ¡A darle estilo a la vida con lo último en moda! 🚀\nRopa Chida a Precio de Barrio:\nNo ando con rollos, aquí encuentras trapos buenos, bonitos y baratos. Si quieres vestirte con onda sin romper el cochinito, este es tu lugar.\nMix & Match:\nNi que fueras modelo de revista, aquí te armamos looks al estilo "me puse lo primero que encontré, pero aún así lucho". Dale un toque propio a tu estilo, ¡nadie tiene que saber que te levantaste tarde!\nPa' Toda la Banda:\nChico, grande, flaco, llenito, aquí hay ropa para todos los gustos y tallas. Sin prejuicios, la moda es para todos.\n	19.387357175560968	-99.03476886837845	2cfe4d17-f80d-4f4a-a37d-79a3c6170fc5
1565e446-0e56-46e8-9550-7be81de7595b	Vendedores	 ¡Oye, Oye, Amarillos y Amarillas! Soy Jorge, el Verdulero Que le Pone Sazón al Tianguis. ¡Vamos a Hacer Tu Cocina la Envidia del Barrio! \n	19.347410171906237	-99.01022128623546	1565e446-0e56-46e8-9550-7be81de7595b
4f266df9-1289-4293-aa90-c683a3749ad6	Maestro	Maestra Apasionada por la Educación\n¡Saludos! Soy Brenda, una maestra comprometida con inspirar y cultivar el amor por el aprendizaje en cada estudiante. Con dedicación y entusiasmo, mi objetivo es crear un ambiente educativo enriquecedor y fomentar el crecimiento académico y personal.\nÁreas de Especialización:\nRazonamiento matematico.\nDesarrollo de habilidades sociales y emocionales.\nMétodos innovadores de enseñanza.\nEnfoque Pedagógico:\nCreo en la importancia de adaptar mi enseñanza a las necesidades individuales de cada estudiante. Fomento un entorno inclusivo donde la curiosidad se cultiva y el aprendizaje se vuelve significativo.\nCompromiso con el Éxito Estudiantil:\nTutorías personalizadas para abordar las necesidades de cada estudiante.\nFomento de la participación activa en el aula.\nCreación de planes de lecciones creativos e interactivos.\nValores Fundamentales:\nRespeto y empatía hacia los estudiantes.\nEstímulo del pensamiento crítico y la resolución de problemas.\nColaboración estrecha con padres y colegas.\nContacto:\n¿Listo para un viaje educativo emocionante? Estoy aquí para ayudar. Ponte en contacto conmigo para discutir cómo puedo contribuir al éxito académico de tus hijos.\n	19.339527573602155	-99.02572803236646	4f266df9-1289-4293-aa90-c683a3749ad6
0fd25d80-bcf0-4221-85e6-cc2456f6f94c	Electricidad	Electricista de confianza, comprometido con brindar soluciones seguras y eficientes para tus necesidades eléctricas. Con experiencia sólida y atención al detalle, estoy aquí para mantener tu hogar o negocio encendido de manera confiable.\nServicios Eléctricos:\nInstalación y mantenimiento de sistemas eléctricos.\nReparación de fallas y cortocircuitos.\nActualizaciones para mayor eficiencia energética.\nInstalación de iluminación y sistemas de seguridad.\nCompromiso con la Seguridad:\nTu seguridad es mi prioridad. Realizo cada trabajo con precisión y cumplo con los estándares de seguridad para garantizar un entorno libre de riesgos eléctricos.\nServicio Personalizado:\nEvaluación detallada de tus necesidades eléctricas.\nPresupuestos claros y transparentes.\nAsesoramiento sobre opciones energéticamente eficientes.\nDisponibilidad Rápida:\nEstoy listo para abordar tus problemas eléctricos de manera rápida y eficiente. Ya sea una emergencia o una mejora planificada, estoy aquí para ayudar.\n	19.331858329170668	-99.02093925360731	0fd25d80-bcf0-4221-85e6-cc2456f6f94c
278c88eb-37ab-4832-87fd-5e0a869dace4	Arquitecto	Arquitecto Creativo para Tus Sueños Arquitectónicos\n¡Bienvenido al estudio arquitectónico de Luis Angel! Soy un arquitecto apasionado con una visión única y un compromiso inquebrantable con la creación de espacios que inspiran y perduran en el tiempo.\n	19.330638954286016	-99.02148477819603	278c88eb-37ab-4832-87fd-5e0a869dace4
75342d80-b894-4622-89fa-72faac4dc084	Diseñador	Diseñador Creativo para Transformar Ideas en Realidad\n¡Hola! Soy Vicente Barajas, un apasionado diseñador comprometido con la creación visual impactante. Transformo tus ideas en diseños innovadores que destacan y comunican de manera efectiva.\nServicios Destacados:\nDiseño de marca y logotipos.\nCreación de materiales de marketing atractivos.\nDiseño de interfaces y experiencia de usuario.\nIlustración y gráficos personalizados.\nEnfoque Creativo:\nMi proceso de diseño se basa en la colaboración cercana contigo para capturar la esencia de tu visión. Cada proyecto es una oportunidad para fusionar funcionalidad con estética, creando soluciones visualmente impactantes.\nHabilidades Esenciales:\nDominio de herramientas de diseño como Adobe Creative Suite.\nSensibilidad estética y atención al detalle.\nAdaptabilidad para abordar una variedad de estilos y plataformas.\nCompromiso Profesional:\nDesde el concepto hasta la implementación, estoy dedicado a garantizar que cada proyecto cumpla y supere tus expectativas. Mi objetivo es hacer que tu marca destaque y que tus diseños impacten positivamente.\n	19.33120896075948	-99.01900222724105	75342d80-b894-4622-89fa-72faac4dc084
36060f96-4362-4167-abbb-7eeec95af670	Pintura	Pintor con 10 años de experiencia \n	19.33339616143339	-99.01273298349986	36060f96-4362-4167-abbb-7eeec95af670
\.


--
-- Data for Name: user_scores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_scores (id, score, "usuarioCalificadorId", "usuarioCalificadoId") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, curp, "fullName", email, password, phone, "userType", "isActive", "urlImgProfile", "createdAt", "updatedAt", score) FROM stdin;
11327a36-4951-4308-b867-470948c1ff1c	$2b$10$oBhUUEz6Sk7c7R4AXUjCVOoRMuzCzI3FiBMPwClii6XYPnZrl9Mym	Carlos Vega	carlosvegapro@gmail.com	$2b$10$8AbDvVMmDJzwctOc1WX5ceHVwx50pxo9iOPzDt1kLV89K/rKQtPCO	5564297210	admin	t	https://files-tt.s3.amazonaws.com/nobody.jpg	2023-12-13 05:18:25.650836	2023-12-13 05:18:25.650836	0
e6ac6eb7-517e-4352-bf63-0a5ea1c4da48	$2b$10$F3rQlwnUNY715qDXKx2Z0.fp2qg4h0BM75TIoj7i96.sTt9U/uoVi	Adrian Navarrete Cruz	anavaretec@gmail.com	$2b$10$9FgBe8V7yKUTQLKCcXuP9Ot3xON5v9EWlTNPrJ.hfJgpq2yQoMoFe	5564297211	minorista	t	https://files-tt.s3.amazonaws.com/nobody.jpg	2023-12-13 05:18:25.650836	2023-12-13 05:18:25.650836	0
2cfe4d17-f80d-4f4a-a37d-79a3c6170fc5	$2b$10$8aa8at7YBklWD7BcNbzEqOY8zppSi74G1bk8xoJRXnqru8o2LTFxC	Jorge Daniel Martinez	jdmartinezj@gmail.com	$2b$10$fbW3OZKptALp9DAY0Lf/Oet75uFSOlkqdjzJjWEhdELgq.Rb33Pti	5564297212	minorista	t	https://files-tt.s3.amazonaws.com/nobody.jpg	2023-12-13 05:18:25.650836	2023-12-13 05:18:25.650836	0
1565e446-0e56-46e8-9550-7be81de7595b	$2b$10$W6ue9M6DvqQzmLBZbFv/puAML6uKwHmHA/n7I02r5NX8kU.gQNEeS	Brenda Martinez Galindo	bmartinezg@gmail.com	$2b$10$WMwJqYAxKiOWPAWI/b/s9uJkLF8YDy8ZyHieeS9Bphcg19kx1WC9.	5564297213	minorista	t	https://files-tt.s3.amazonaws.com/nobody.jpg	2023-12-13 05:18:25.650836	2023-12-13 05:18:25.650836	0
4f266df9-1289-4293-aa90-c683a3749ad6	$2b$10$/N6CPhf3WCXyLW/FzCBzK.vDzy4c5utPf9cw7u6YNhVwjAaaamUVC	Armando Garcia	aarmandog@gmail.com	$2b$10$eu2158Kk9e.uw1GRyouhoOi0QS5RG66LtFXfyetCF5UQ.JOBsdkCu	5564297214	minorista	t	https://files-tt.s3.amazonaws.com/nobody.jpg	2023-12-13 05:18:25.650836	2023-12-13 05:18:25.650836	0
0fd25d80-bcf0-4221-85e6-cc2456f6f94c	$2b$10$LXN6i7HjGFRLrSDKk9jn7.IMo916Iw4rvlRfy30DTLWq1kIh6zE/q	Luis angel gonzalez	lagonzalez@gmail.com	$2b$10$VrKbkrTcPz8jfdmUHQx6EuvZZTSagB26Eyl/XcMAr720p9j8zhk2u	5564297215	minorista	t	https://files-tt.s3.amazonaws.com/nobody.jpg	2023-12-13 05:18:25.650836	2023-12-13 05:18:25.650836	0
278c88eb-37ab-4832-87fd-5e0a869dace4	$2b$10$lWz3EpmF2.nfAFvma387IeKWfZB/VfJxe9oJlEQrCK1.SVX5ojVkC	Vicente Barajas	vbarajas@gmail.com	$2b$10$em5zjB9mQJSMvFU8KPzzbu8LvL9.YUw3HZRHor7CFmPB/i4Y4HZOO	5564297216	minorista	t	https://files-tt.s3.amazonaws.com/nobody.jpg	2023-12-13 05:18:25.650836	2023-12-13 05:18:25.650836	0
131ed68d-9a72-4156-aa9f-875f0c643350	$2b$10$z6ifbdIjpiExykTXVpiiB.QRRaoYonhMoA1MjvhUT/Ny1SAdPHnbq	JUAN ALBERTO	albertovazquez16villeda@hotmail.com	$2b$10$FznriJ9CEPNWvXmULmi5EOJySA835KPdpJ14X8ZD0ARo52hRMCbp6	5564297217	user	t	https://files-tt.s3.amazonaws.com/IMG_38581702023202772.png	2023-12-13 05:18:25.650836	2023-12-13 05:18:25.650836	0
0270b8af-a982-45fc-8fa0-7072391cdd81	$2b$10$ZhUmew.kb9gxZUbTxuCFKuhsVwCb.5rh05kjThU1AiAGob.hjPgga	Juan Alberto Vazquez Villeda	albertovazquez16villeda@gmail.com	$2b$10$WAcLscbADXQXO9uRXkOBqO/j6CKY0n4.c8bxlPDcblOqwSyRkTtF2	5564297218	user	t	https://files-tt.s3.amazonaws.com/nobody.jpg	2023-12-13 05:18:25.650836	2023-12-13 05:18:25.650836	0
75342d80-b894-4622-89fa-72faac4dc084	$2b$10$O5iIqp5ywLZTe80NCKRBMuc1BBh0U4xt0o0SJDTFr62ZhIX6AUYyG	Jonathan Martinez	jmartinez@gmail.com	$2b$10$1FvmCzQDJDtIp6veFao1C.fbXcSQAXSJeMDqxiSSoAMUI7zIJZM6e	5564297219	minorista	t	https://files-tt.s3.amazonaws.com/nobody.jpg	2023-12-13 05:18:25.650836	2023-12-13 05:18:25.650836	0
36060f96-4362-4167-abbb-7eeec95af670	$2b$10$glw9CV4kB0fnoambAbFe2u65wGITJgYfNzYo1fvJoozvbzzIM47Uy	JUAN ALBERTO VAZQUEZ	jvazquezv1402@alumno.ipn.mx	$2b$10$tDbAUJX2HhFfzm.kiL9X0OEgPJ5cpvDNwjzE1VGmmgS0SIywgc9A2	5564297219	minorista	t	https://files-tt.s3.amazonaws.com/nobody.jpg	2023-12-13 05:18:25.650836	2023-12-13 05:18:25.650836	0
bfe6bc2d-1ec3-4e61-975a-dd187ab29140	$2b$10$cB6czEW2AiEQJGWufA42d.Jm4aonXfhd1vSMWkAITAHKUTP1nOmCW	Jesus Neria Flores	JneriaF@gmail.com	$2b$10$tyWrdgEgLxc70gdgJt4DQ.OrK8zelyP4wcK8sjdj628pytZUu1QtG	5564297219	user	t	https://files-tt.s3.amazonaws.com/nobody.jpg	2023-12-13 05:18:25.650836	2023-12-21 03:28:22.581796	0
41462080-1391-468a-828b-bcfa9123bd5a	$2b$10$26I3og6s0gqs1bh0khpzweJoMbSKiodzSkx8kegosM53gFi6K07y.	Carlos Vega TEST	tans_dafblack@hotmail.com	$2b$10$x34uQqauewuin2rvcZrdrODYjlaNRGkQA.4YOxm6o9WCfSrJqgVgi	5548895659	user	t	https://files-tt.s3.amazonaws.com/nobody.jpg	2023-12-21 03:29:46.453875	2023-12-21 05:24:53.891461	0
\.


--
-- Data for Name: users_favorites_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users_favorites_users ("usersId_1", "usersId_2") FROM stdin;
\.


--
-- Name: images PK_1fe148074c6a1a91b63cb9ee3c9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY (id);


--
-- Name: posts PK_2829ac61eff60fcec60d7274b9e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY (id);


--
-- Name: user_minorista PK_3006a3eb4d9ba6ee545eafbbf59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_minorista
    ADD CONSTRAINT "PK_3006a3eb4d9ba6ee545eafbbf59" PRIMARY KEY (id);


--
-- Name: users_favorites_users PK_3ebc7c05b7c9a155da1ed1aeb3e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_favorites_users
    ADD CONSTRAINT "PK_3ebc7c05b7c9a155da1ed1aeb3e" PRIMARY KEY ("usersId_1", "usersId_2");


--
-- Name: opinion PK_5ec733c275c9b9322cde468b4c1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opinion
    ADD CONSTRAINT "PK_5ec733c275c9b9322cde468b4c1" PRIMARY KEY (id);


--
-- Name: contrataciones PK_872b31b02dec35172b9ea9eae6c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrataciones
    ADD CONSTRAINT "PK_872b31b02dec35172b9ea9eae6c" PRIMARY KEY (id);


--
-- Name: solicitudes PK_8c7e99758c774b801853b538647; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT "PK_8c7e99758c774b801853b538647" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: user_scores PK_caf56c8fd1af4eeddd1aee555ae; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_scores
    ADD CONSTRAINT "PK_caf56c8fd1af4eeddd1aee555ae" PRIMARY KEY (id);


--
-- Name: fav_notification PK_de8814b66b787d7ff86a696528f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fav_notification
    ADD CONSTRAINT "PK_de8814b66b787d7ff86a696528f" PRIMARY KEY (id);


--
-- Name: user_minorista REL_34d10073879f813a1a4cdd3758; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_minorista
    ADD CONSTRAINT "REL_34d10073879f813a1a4cdd3758" UNIQUE ("idUser");


--
-- Name: users UQ_55cb758111fd64952df1338e22c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_55cb758111fd64952df1338e22c" UNIQUE (curp);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: IDX_92833b8042f2f6ffe06836cdbf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_92833b8042f2f6ffe06836cdbf" ON public.users_favorites_users USING btree ("usersId_2");


--
-- Name: IDX_d2b2b62c72402d097aceab465a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d2b2b62c72402d097aceab465a" ON public.users_favorites_users USING btree ("usersId_1");


--
-- Name: opinion FK_01013f2e4aa674108b2d97680ff; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opinion
    ADD CONSTRAINT "FK_01013f2e4aa674108b2d97680ff" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_scores FK_042a705a868b6427f34bfb36a51; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_scores
    ADD CONSTRAINT "FK_042a705a868b6427f34bfb36a51" FOREIGN KEY ("usuarioCalificadorId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_minorista FK_34d10073879f813a1a4cdd37587; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_minorista
    ADD CONSTRAINT "FK_34d10073879f813a1a4cdd37587" FOREIGN KEY ("idUser") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: images FK_3ccad79db4407727f9c81f84905; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT "FK_3ccad79db4407727f9c81f84905" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: contrataciones FK_60fdc3c68b30d704b47c31c2aed; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrataciones
    ADD CONSTRAINT "FK_60fdc3c68b30d704b47c31c2aed" FOREIGN KEY ("usuarioId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_scores FK_623fb5da4853dc77a733337640c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_scores
    ADD CONSTRAINT "FK_623fb5da4853dc77a733337640c" FOREIGN KEY ("usuarioCalificadoId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: opinion FK_79e285f6ac327cd4fa7325efb50; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opinion
    ADD CONSTRAINT "FK_79e285f6ac327cd4fa7325efb50" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: solicitudes FK_7b45390c4747ccb1caafcc01ab7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT "FK_7b45390c4747ccb1caafcc01ab7" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: contrataciones FK_84f28ad2157650e0f45e51c4984; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrataciones
    ADD CONSTRAINT "FK_84f28ad2157650e0f45e51c4984" FOREIGN KEY ("minoristaId") REFERENCES public.user_minorista(id) ON DELETE CASCADE;


--
-- Name: users_favorites_users FK_92833b8042f2f6ffe06836cdbf5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_favorites_users
    ADD CONSTRAINT "FK_92833b8042f2f6ffe06836cdbf5" FOREIGN KEY ("usersId_2") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: posts FK_ae05faaa55c866130abef6e1fee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "FK_ae05faaa55c866130abef6e1fee" FOREIGN KEY ("userId") REFERENCES public.user_minorista(id) ON DELETE CASCADE;


--
-- Name: images FK_d0d98584ff184461ce7be77df2d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT "FK_d0d98584ff184461ce7be77df2d" FOREIGN KEY ("opinionId") REFERENCES public.opinion(id) ON DELETE CASCADE;


--
-- Name: users_favorites_users FK_d2b2b62c72402d097aceab465a7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_favorites_users
    ADD CONSTRAINT "FK_d2b2b62c72402d097aceab465a7" FOREIGN KEY ("usersId_1") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fav_notification FK_dc86921dde433d610bf5c81cbd3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fav_notification
    ADD CONSTRAINT "FK_dc86921dde433d610bf5c81cbd3" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

