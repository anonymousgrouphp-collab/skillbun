/**
 * SkillBun Edge & Client Internationalization (i18n) Engine
 * Multi-Language Localization & Global Audience Reach Engine
 */

export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English', nativeName: 'English', dir: 'ltr', region: 'Global' },
  { code: 'es', label: 'Spanish', nativeName: 'Español', dir: 'ltr', region: 'Latinoamérica & España' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', region: 'India (भारत)' },
  { code: 'fr', label: 'French', nativeName: 'Français', dir: 'ltr', region: 'France & Francophonie' },
  { code: 'de', label: 'German', nativeName: 'Deutsch', dir: 'ltr', region: 'DACH (Deutschland/Österreich/Schweiz)' },
  { code: 'pt', label: 'Portuguese', nativeName: 'Português', dir: 'ltr', region: 'Brasil & Portugal' },
  { code: 'ja', label: 'Japanese', nativeName: '日本語', dir: 'ltr', region: 'Japan (日本)' },
  { code: 'id', label: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr', region: 'Indonesia' },
];

export const DEFAULT_LOCALE = 'en';

export const DICTIONARIES = {
  en: {
    nav: {
      searchPlaceholder: 'Search 100+ roadmaps, topics, or skills...',
      roadmaps: 'Roadmaps',
      quiz: 'Career Quiz',
      counsellor: 'BunBot AI',
      dashboard: 'Dashboard',
      certifications: 'Certifications',
      verifyCert: 'Verify Certificate',
      switchLanguage: 'Switch Language',
      skipToContent: 'Skip to content',
    },
    hero: {
      tagline: '100% Free AI Tech Career Roadmaps & Certifications',
      headlinePart1: 'Hop into the Right',
      headlinePart2: 'Tech Career',
      subtitle: 'SkillBun helps computer science, software engineering, and tech students worldwide discover their ideal trajectory with interactive 100+ roadmaps, adaptive quizzes, and free verifiable certificates.',
      ctaStartQuiz: 'Take 2-Min Career Quiz',
      ctaExploreRoadmaps: 'Explore 100+ Roadmaps',
      ctaTalkBunbot: 'Ask BunBot AI',
      freeBadge: '100% Free & Open Access',
      verifiedBadge: 'Verifiable Digital Credentials',
      studentCount: 'Empowering students across 140+ countries',
    },
    stats: {
      roadmapsCount: '100+ Free Roadmaps',
      freeTier: '$0 Forever',
      passRate: 'Adaptive AI Engine',
      studentsHelped: 'Global Student Community',
    },
    sections: {
      sampleMoments: {
        title: 'Sample Student Moments',
        subtitle: 'From uncertainty to a structured engineering roadmap in minutes.',
        beforeLabel: 'Before SkillBun',
        profileSignal: 'Profile Signal',
        quizAdapts: 'Quiz Adapts',
        recClarity: 'Recommendation Clarity',
        roadmapBunbot: 'Roadmap + Bun-Bot',
      },
      os: {
        title: 'SkillBun OS: Complete Tech Career Stack',
        subtitle: 'Everything computer science and self-taught developers need to break into high-growth software engineering careers.',
        adaptiveEngine: 'Adaptive Assessment Engine',
        careerMatrix: '100+ Interactive Skill Trees',
        verifiedCerts: 'Free Verifiable Credentials',
        liveCounsellor: '24/7 AI Career Mentor',
      },
      journey: {
        title: 'Your 4-Step Journey to a High-Impact Tech Career',
        step1Title: '1. Discover Your Trajectory',
        step1Desc: 'Take our 2-minute adaptive quiz matching your problem-solving style to real engineering disciplines.',
        step2Title: '2. Follow Interactive Tree Roadmaps',
        step2Desc: 'Master prerequisite-checked node curriculums with curated video lessons and hands-on projects.',
        step3Title: '3. Receive 24/7 Bun-Bot Guidance',
        step3Desc: 'Ask technical questions, debug architecture concepts, and receive resume-ready portfolio feedback.',
        step4Title: '4. Earn Free Digital Certification',
        step4Desc: 'Complete 60% of any roadmap, pass the authoritative exam, and claim your cryptographic credential.',
      },
      counsellor: {
        title: 'Meet Bun-Bot: Your 24/7 AI Engineering Counsellor',
        subtitle: 'Real-time guidance on tech stacks, compensation benchmarks, and internship roadmaps.',
      },
      trust: {
        title: 'Built For Students. 100% Free Forever.',
        subtitle: 'No paywalls, no surprise subscription fees, no locked exam gates. Accessible to every aspiring engineer on Earth.',
      },
      finalCta: {
        title: 'Ready to Map Your Future in Tech?',
        subtitle: 'Join ambitious engineering students globally and launch your software engineering journey today.',
        button: 'Get Started for Free',
      },
    },
    footer: {
      brandBio: 'Hop into the right career. Helping computer science, software engineering, and tech students worldwide find their perfect path through AI-powered guidance and structured roadmaps.',
      platform: 'Platform',
      company: 'Company',
      roadmaps: 'Career Roadmaps',
      quiz: 'Career Quiz',
      bunbot: 'BunBot AI Mentor',
      dashboard: 'Student Dashboard',
      verifyCertificate: 'Verify Certificate',
      alumniVault: 'Alumni & Workforce Vault',
      aboutUs: 'About Us',
      privacyPolicy: 'Privacy Policy',
      termsOfUse: 'Terms of Use',
      contactUs: 'Contact Us',
      copyright: 'by Reish. Made with love for tech students worldwide.',
      language: 'Language',
    },
    common: {
      free: 'Free',
      verified: 'Verified',
      getStarted: 'Get Started',
      viewAll: 'View All',
      backToHome: 'Back to Home',
      selectLanguage: 'Select Language',
    },
  },
  es: {
    nav: {
      searchPlaceholder: 'Buscar más de 100 rutas, temas o habilidades...',
      roadmaps: 'Rutas de Aprendizaje',
      quiz: 'Test Vocacional Tech',
      counsellor: 'BunBot IA',
      dashboard: 'Panel de Control',
      certifications: 'Certificaciones',
      verifyCert: 'Verificar Certificado',
      switchLanguage: 'Cambiar Idioma',
      skipToContent: 'Saltar al contenido',
    },
    hero: {
      tagline: 'Rutas Tech y Certificaciones con IA 100% Gratuitas',
      headlinePart1: 'Encuentra la',
      headlinePart2: 'Carrera Tech Ideal',
      subtitle: 'SkillBun ayuda a estudiantes de informática y programación de todo el mundo a descubrir su trayectoria ideal con más de 100 rutas interactivas, tests adaptativos y certificaciones gratuitas verificables.',
      ctaStartQuiz: 'Hacer Test Vocacional (2 min)',
      ctaExploreRoadmaps: 'Explorar +100 Rutas',
      ctaTalkBunbot: 'Preguntar a BunBot IA',
      freeBadge: '100% Gratuito y de Acceso Libre',
      verifiedBadge: 'Credenciales Digitales Verificables',
      studentCount: 'Apoyando a estudiantes en más de 140 países',
    },
    stats: {
      roadmapsCount: '+100 Rutas Gratuitas',
      freeTier: '$0 Para Siempre',
      passRate: 'Motor IA Adaptativo',
      studentsHelped: 'Comunidad Global de Estudiantes',
    },
    sections: {
      sampleMoments: {
        title: 'Casos Reales de Estudiantes',
        subtitle: 'De la incertidumbre a una ruta estructurada de ingeniería en minutos.',
        beforeLabel: 'Antes de SkillBun',
        profileSignal: 'Señal del Perfil',
        quizAdapts: 'El Test se Adapta',
        recClarity: 'Claridad en Recomendación',
        roadmapBunbot: 'Ruta + Bun-Bot',
      },
      os: {
        title: 'SkillBun OS: Tu Plataforma Integral de Carrera Tech',
        subtitle: 'Todo lo que los estudiantes y desarrolladores autodidactas necesitan para destacar en la industria tecnológica.',
        adaptiveEngine: 'Motor de Evaluación Adaptativo',
        careerMatrix: '+100 Árboles de Habilidades',
        verifiedCerts: 'Certificados Verificables Gratuitos',
        liveCounsellor: 'Mentor IA 24/7',
      },
      journey: {
        title: 'Tu Viaje en 4 Pasos Hacia el Éxito Tech',
        step1Title: '1. Descubre Tu Especialidad',
        step1Desc: 'Realiza nuestro test adaptativo de 2 minutos que conecta tu perfil con disciplinas reales de desarrollo.',
        step2Title: '2. Sigue Rutas de Aprendizaje Guiadas',
        step2Desc: 'Domina nodos de estudio con clases seleccionadas, proyectos prácticos y validación de requisitos.',
        step3Title: '3. Consulta a Bun-Bot 24/7',
        step3Desc: 'Resuelve dudas de código, conceptos de arquitectura y recibe feedback para tu portafolio.',
        step4Title: '4. Obtén Tu Certificación Gratuita',
        step4Desc: 'Completa el 60% de una ruta, aprueba el examen oficial y reclama tu credencial con código QR.',
      },
      counsellor: {
        title: 'Conoce a Bun-Bot: Tu Consejero Técnico de IA 24/7',
        subtitle: 'Orientación en tiempo real sobre tecnologías, salarios del sector y estrategias de empleo.',
      },
      trust: {
        title: 'Creado Para Estudiantes. 100% Gratis Siempre.',
        subtitle: 'Sin muros de pago, sin suscripciones ocultas, sin barreras. Accesible para todos los programadores.',
      },
      finalCta: {
        title: '¿Listo para Trazar Tu Futuro en Tecnología?',
        subtitle: 'Únete a miles de futuros ingenieros de software y comienza hoy tu aprendizaje.',
        button: 'Comenzar Gratis',
      },
    },
    footer: {
      brandBio: 'Impulsa tu carrera tecnológica. Ayudamos a estudiantes de programación e ingeniería de software a encontrar su camino profesional mediante orientación con IA y rutas estructuradas.',
      platform: 'Plataforma',
      company: 'Compañía',
      roadmaps: 'Rutas Profesionales',
      quiz: 'Test de Carrera',
      bunbot: 'Mentor BunBot IA',
      dashboard: 'Panel de Estudiante',
      verifyCertificate: 'Verificar Certificado',
      alumniVault: 'Portal de Alumnos',
      aboutUs: 'Sobre Nosotros',
      privacyPolicy: 'Política de Privacidad',
      termsOfUse: 'Términos de Servicio',
      contactUs: 'Contacto',
      copyright: 'por Reish. Hecho con amor para estudiantes tech de todo el mundo.',
      language: 'Idioma',
    },
    common: {
      free: 'Gratis',
      verified: 'Verificado',
      getStarted: 'Empezar',
      viewAll: 'Ver Todo',
      backToHome: 'Volver al Inicio',
      selectLanguage: 'Seleccionar Idioma',
    },
  },
  hi: {
    nav: {
      searchPlaceholder: '100+ रोडमैप, विषय या कौशल खोजें...',
      roadmaps: 'करियर रोडमैप',
      quiz: 'करियर क्विज़',
      counsellor: 'बन-बॉट AI',
      dashboard: 'डैशबोर्ड',
      certifications: 'प्रमाणपत्र',
      verifyCert: 'सत्यापन',
      switchLanguage: 'भाषा बदलें',
      skipToContent: 'सामग्री पर जाएं',
    },
    hero: {
      tagline: '100% मुफ़्त AI टेक करियर रोडमैप और डिजिटल प्रमाणपत्र',
      headlinePart1: 'अपने लिए सही',
      headlinePart2: 'टेक करियर चुनें',
      subtitle: 'SkillBun दुनिया भर के कंप्यूटर साइंस और इंजीनियरिंग छात्रों को 100+ इंटरैक्टिव रोडमैप, अनुकूलित क्विज़ और मुफ़्त सत्यापित प्रमाणपत्रों के साथ सही दिशा दिखाता है।',
      ctaStartQuiz: '2 मिनट की क्विज़ शुरू करें',
      ctaExploreRoadmaps: '100+ रोडमैप देखें',
      ctaTalkBunbot: 'बन-बॉट से पूछें',
      freeBadge: '100% मुफ़्त और खुला मंच',
      verifiedBadge: 'सत्यापनीय डिजिटल क्रेडेंशियल्स',
      studentCount: '140+ देशों के छात्रों द्वारा उपयोगित',
    },
    stats: {
      roadmapsCount: '100+ मुफ़्त रोडमैप',
      freeTier: 'हमेशा ₹0 मुफ़्त',
      passRate: 'एडैप्टिव AI इंजन',
      studentsHelped: 'वैश्विक छात्र समुदाय',
    },
    sections: {
      sampleMoments: {
        title: 'छात्रों के अनुभव और दिशा',
        subtitle: 'भ्रम से लेकर संरचित इंजीनियरिंग रोडमैप तक मिनटों में।',
        beforeLabel: 'SkillBun से पहले',
        profileSignal: 'प्रोफ़ाइल संकेत',
        quizAdapts: 'क्विज़ अनुकूलन',
        recClarity: 'स्पष्ट करियर सुझाव',
        roadmapBunbot: 'रोडमैप + बन-बॉट',
      },
      os: {
        title: 'SkillBun OS: संपूर्ण टेक करियर प्रणाली',
        subtitle: 'सॉफ़्टवेयर इंजीनियरिंग में सफल होने के लिए छात्रों को आवश्यक सभी उपकरण।',
        adaptiveEngine: 'अनुकूली मूल्यांकन इंजन',
        careerMatrix: '100+ इंटरैक्टिव स्किल ट्री',
        verifiedCerts: 'मुफ़्त सत्यापित प्रमाणपत्र',
        liveCounsellor: '24/7 AI करियर मेंटर',
      },
      journey: {
        title: 'सफल टेक करियर के 4 आसान चरण',
        step1Title: '1. अपनी रुचि खोजें',
        step1Desc: '2 मिनट की आसान क्विज़ से अपनी समस्या समाधान क्षमता के अनुसार उपयुक्त करियर जानें।',
        step2Title: '2. संरचित रोडमैप का पालन करें',
        step2Desc: 'कदम-दर-कदम वीडियो ट्यूटोरियल और व्यावहारिक प्रोजेक्ट्स के साथ नए कौशल सीखें।',
        step3Title: '3. बन-बॉट AI से मार्गदर्शन लें',
        step3Desc: 'कोड से जुड़े सवाल, सिस्टम डिज़ाइन और पोर्टफ़ोलियो पर 24/7 सलाह प्राप्त करें।',
        step4Title: '4. मुफ़्त सत्यापित प्रमाणपत्र पाएं',
        step4Desc: 'रोडमैप का 60% भाग पूरा करें, परीक्षा उत्तीर्ण करें और QR कोड वाला डिजिटल प्रमाणपत्र प्राप्त करें।',
      },
      counsellor: {
        title: 'मिलिए बन-बॉट से: आपका 24/7 AI तकनीकी सलाहकार',
        subtitle: 'प्रौद्योगिकी, वैश्विक वेतन और इंटर्नशिप के अवसरों पर वास्तविक समय मार्गदर्शन।',
      },
      trust: {
        title: 'छात्रों के लिए समर्पित। हमेशा 100% मुफ़्त।',
        subtitle: 'कोई छिपा हुआ शुल्क नहीं, कोई सब्सक्रिप्शन नहीं। दुनिया के हर छात्र के लिए समान अवसर।',
      },
      finalCta: {
        title: 'क्या आप टेक में अपना भविष्य बनाने के लिए तैयार हैं?',
        subtitle: 'दुनिया भर के महत्वाकांक्षी छात्रों से जुड़ें और आज ही अपनी यात्रा शुरू करें।',
        button: 'मुफ़्त में शुरू करें',
      },
    },
    footer: {
      brandBio: 'सही करियर में कदम रखें। AI मार्गदर्शन और संरचित रोडमैप के माध्यम से छात्रों को उनका सही तकनीकी मार्ग खोजने में मदद करना।',
      platform: 'प्लेटफ़ॉर्म',
      company: 'कंपनी',
      roadmaps: 'करियर रोडमैप',
      quiz: 'करियर क्विज़',
      bunbot: 'बन-बॉट AI मेंटर',
      dashboard: 'छात्र डैशबोर्ड',
      verifyCertificate: 'प्रमाणपत्र सत्यापन',
      alumniVault: 'एलुमनाई पोर्टल',
      aboutUs: 'हमारे बारे में',
      privacyPolicy: 'गोपनीयता नीति',
      termsOfUse: 'उपयोग की शर्तें',
      contactUs: 'संपर्क करें',
      copyright: 'Reish द्वारा। विश्वभर के टेक छात्रों के लिए स्नेहपूर्वक निर्मित।',
      language: 'भाषा',
    },
    common: {
      free: 'मुफ़्त',
      verified: 'सत्यापित',
      getStarted: 'शुरू करें',
      viewAll: 'सभी देखें',
      backToHome: 'होमपेज पर जाएं',
      selectLanguage: 'भाषा चुनें',
    },
  },
  fr: {
    nav: {
      searchPlaceholder: 'Rechercher parmi 100+ parcours, sujets ou compétences...',
      roadmaps: 'Parcours Pro',
      quiz: 'Test d’Orientation',
      counsellor: 'BunBot IA',
      dashboard: 'Tableau de Bord',
      certifications: 'Certifications',
      verifyCert: 'Vérifier Certificat',
      switchLanguage: 'Changer de Langue',
      skipToContent: 'Aller au contenu',
    },
    hero: {
      tagline: 'Parcours et Certifications Tech 100% Gratuits propulsés par l’IA',
      headlinePart1: 'Trouvez Votre',
      headlinePart2: 'Carrière dans la Tech',
      subtitle: 'SkillBun accompagne les étudiants en informatique et génie logiciel du monde entier pour révéler leur voie idéale grâce à 100+ parcours interactifs, des quiz adaptatifs et des certifications vérifiables gratuites.',
      ctaStartQuiz: 'Quiz d’Orientation (2 min)',
      ctaExploreRoadmaps: 'Explorer 100+ Parcours',
      ctaTalkBunbot: 'Consulter BunBot IA',
      freeBadge: '100% Gratuit & Libre d’Accès',
      verifiedBadge: 'Certifications Numériques Vérifiables',
      studentCount: 'Plus de 140 pays connectés',
    },
    stats: {
      roadmapsCount: '100+ Parcours Gratuits',
      freeTier: '0€ Pour Toujours',
      passRate: 'Moteur IA Adaptatif',
      studentsHelped: 'Communauté Mondiale d’Étudiants',
    },
    sections: {
      sampleMoments: {
        title: 'Moments Clés d’Étudiants',
        subtitle: 'De l’incertitude à une feuille de route claire d’ingénieur en quelques minutes.',
        beforeLabel: 'Avant SkillBun',
        profileSignal: 'Profil Étudiant',
        quizAdapts: 'Quiz Adaptatif',
        recClarity: 'Recommandation Précise',
        roadmapBunbot: 'Parcours + Bun-Bot',
      },
      os: {
        title: 'SkillBun OS : L’Écosystème Carrière Tech Complet',
        subtitle: 'Tout ce dont les étudiants et autodidactes ont besoin pour réussir dans l’ingénierie logicielle.',
        adaptiveEngine: 'Moteur d’Évaluation Adaptatif',
        careerMatrix: '100+ Arbres de Compétences',
        verifiedCerts: 'Certificats Vérifiables Gratuits',
        liveCounsellor: 'Mentor IA 24/7',
      },
      journey: {
        title: 'Votre Parcours en 4 Étapes vers l’Excellence',
        step1Title: '1. Révélez Votre Profil',
        step1Desc: 'Passez notre quiz rapide de 2 minutes pour aligner vos compétences avec les métiers les plus demandés.',
        step2Title: '2. Suivez des Arbres de Compétences Structurés',
        step2Desc: 'Validez chaque compétence avec des cours vidéo triés et des projets de mise en pratique réels.',
        step3Title: '3. Échangez avec Bun-Bot IA',
        step3Desc: 'Posez vos questions techniques, optimisez votre code et préparez vos entretiens d’embauche.',
        step4Title: '4. Obtenez Votre Certification Gratuite',
        step4Desc: 'Atteignez 60% d’un parcours, réussissez l’examen officiel et recevez votre certificat avec QR code.',
      },
      counsellor: {
        title: 'Découvrez Bun-Bot : Votre Conseiller Technique IA 24/7',
        subtitle: 'Conseils personnalisés en temps réel sur les technologies, salaires et opportunités de stage.',
      },
      trust: {
        title: 'Conçu Pour Les Étudiants. 100% Gratuit.',
        subtitle: 'Aucun frais caché, aucun abonnement requis. L’égalité des chances pour tous les futurs ingénieurs.',
      },
      finalCta: {
        title: 'Prêt à Tracer Votre Avenir dans la Tech ?',
        subtitle: 'Rejoignez des milliers d’étudiants passionnés et lancez votre carrière dès aujourd’hui.',
        button: 'Commencer Gratuitement',
      },
    },
    footer: {
      brandBio: 'Prenez le bon départ dans la tech. Nous guidons les étudiants en informatique à travers le monde vers le métier de leurs rêves grâce à l’IA et à des feuilles de route structurées.',
      platform: 'Plateforme',
      company: 'Entreprise',
      roadmaps: 'Parcours Métiers',
      quiz: 'Quiz Carrière',
      bunbot: 'Mentor BunBot IA',
      dashboard: 'Espace Étudiant',
      verifyCertificate: 'Vérifier un Certificat',
      alumniVault: 'Réseau Alumnis',
      aboutUs: 'À Propos',
      privacyPolicy: 'Politique de Confidentialité',
      termsOfUse: 'Conditions d’Utilisation',
      contactUs: 'Nous Contacter',
      copyright: 'par Reish. Créé avec passion pour les étudiants du monde entier.',
      language: 'Langue',
    },
    common: {
      free: 'Gratuit',
      verified: 'Vérifié',
      getStarted: 'Démarrer',
      viewAll: 'Voir Tout',
      backToHome: 'Retour à l’Accueil',
      selectLanguage: 'Choisir la Langue',
    },
  },
  de: {
    nav: {
      searchPlaceholder: 'Über 100 Lernpfade, Themen oder Skills durchsuchen...',
      roadmaps: 'Lernpfade',
      quiz: 'Karriere-Quiz',
      counsellor: 'BunBot KI',
      dashboard: 'Dashboard',
      certifications: 'Zertifikate',
      verifyCert: 'Zertifikat Prüfen',
      switchLanguage: 'Sprache Wechseln',
      skipToContent: 'Zum Inhalt springen',
    },
    hero: {
      tagline: '100% Kostenlose KI-Karrierepfade & Zertifizierungen',
      headlinePart1: 'Finde Deine Perfekte',
      headlinePart2: 'Tech-Karriere',
      subtitle: 'SkillBun hilft Informatik- und Software-Studierenden weltweit, ihren optimalen Karrierepfad mit über 100 interaktiven Roadmaps, adaptiven Tests und kostenlosen, überprüfbaren Zertifikaten zu finden.',
      ctaStartQuiz: '2-Minuten Karriere-Quiz starten',
      ctaExploreRoadmaps: '100+ Lernpfade Entdecken',
      ctaTalkBunbot: 'BunBot KI Fragen',
      freeBadge: '100% Kostenlos & Offen für Alle',
      verifiedBadge: 'Verifizierbare Digitale Zertifikate',
      studentCount: 'Genutzt von Studierenden aus über 140 Ländern',
    },
    stats: {
      roadmapsCount: '100+ Kostenlose Pfade',
      freeTier: '0€ Für Immer',
      passRate: 'Adaptive KI-Engine',
      studentsHelped: 'Globale Community',
    },
    sections: {
      sampleMoments: {
        title: 'Erfolgsgeschichten von Studierenden',
        subtitle: 'Von Orientierungslosigkeit zum strukturierten Ingenieur-Lernpfad in wenigen Minuten.',
        beforeLabel: 'Vor SkillBun',
        profileSignal: 'Profil-Signal',
        quizAdapts: 'Quiz Passt Sich An',
        recClarity: 'Klare Empfehlung',
        roadmapBunbot: 'Roadmap + Bun-Bot',
      },
      os: {
        title: 'SkillBun OS: Das Vollständige Tech-Karriere-System',
        subtitle: 'Alles, was angehende Entwickler für ihren erfolgreichen Einstieg in die Softwarebranche brauchen.',
        adaptiveEngine: 'Adaptives Evaluierungssystem',
        careerMatrix: '100+ Interaktive Skill-Bäume',
        verifiedCerts: 'Kostenlose Verifizierbare Zertifikate',
        liveCounsellor: '24/7 KI-Karrierementor',
      },
      journey: {
        title: 'Dein 4-Schritte-Weg zur Tech-Karriere',
        step1Title: '1. Spezialisierung Entdecken',
        step1Desc: 'Finde in unserem 2-minütigen adaptiven Test die Entwicklerrolle, die am besten zu dir passt.',
        step2Title: '2. Interaktiven Roadmaps Folgen',
        step2Desc: 'Lerne systematisch mit kuratierten Video-Tutorials und praktischen Projekten.',
        step3Title: '3. Unterstützung durch Bun-Bot KI',
        step3Desc: 'Erhalte rund um die Uhr Antworten auf technische Fragen und Feedback zu Portfolio-Projekten.',
        step4Title: '4. Kostenloses Zertifikat Erhalten',
        step4Desc: 'Absolviere 60% eines Pfads, bestehe die offizielle Prüfung und sichere dir dein QR-Zertifikat.',
      },
      counsellor: {
        title: 'Lerne Bun-Bot kennen: Dein 24/7 KI-Mentor',
        subtitle: 'Echtzeitberatung zu Technologiestacks, Gehaltsbenchmarks und Karrierestrategien.',
      },
      trust: {
        title: 'Für Studierende Entwickelt. 100% Kostenlos.',
        subtitle: 'Keine Paywalls, keine Abofallen, keine versteckten Gebühren. Volle Chancengleichheit weltweit.',
      },
      finalCta: {
        title: 'Bereit, Deine Zukunft in der Tech-Welt zu Gestalten?',
        subtitle: 'Schließe dich tausenden ambitionierten Entwicklern an und starte noch heute.',
        button: 'Kostenlos Starten',
      },
    },
    footer: {
      brandBio: 'Finde den passenden Einstieg in die Tech-Welt. Wir unterstützen Studierende weltweit bei der Wahl ihres optimalen Karrierewegs durch KI-gestützte Beratung und fundierte Lernpfade.',
      platform: 'Plattform',
      company: 'Unternehmen',
      roadmaps: 'Karrierepfade',
      quiz: 'Karriere-Quiz',
      bunbot: 'BunBot KI-Mentor',
      dashboard: 'Dashboard',
      verifyCertificate: 'Zertifikat Prüfen',
      alumniVault: 'Alumni-Bereich',
      aboutUs: 'Über Uns',
      privacyPolicy: 'Datenschutz',
      termsOfUse: 'Nutzungsbedingungen',
      contactUs: 'Kontakt',
      copyright: 'von Reish. Mit Leidenschaft für Tech-Studierende weltweit entwickelt.',
      language: 'Sprache',
    },
    common: {
      free: 'Kostenlos',
      verified: 'Verifiziert',
      getStarted: 'Loslegen',
      viewAll: 'Alle Anzeigen',
      backToHome: 'Zurück zur Startseite',
      selectLanguage: 'Sprache Auswählen',
    },
  },
  pt: {
    nav: {
      searchPlaceholder: 'Buscar mais de 100 trilhas, tópicos ou habilidades...',
      roadmaps: 'Trilhas de Carreira',
      quiz: 'Teste Vocacional',
      counsellor: 'BunBot IA',
      dashboard: 'Painel',
      certifications: 'Certificações',
      verifyCert: 'Validar Certificado',
      switchLanguage: 'Mudar Idioma',
      skipToContent: 'Pular para o conteúdo',
    },
    hero: {
      tagline: 'Trilhas de Carreira e Certificações Tech com IA 100% Gratuitas',
      headlinePart1: 'Conquiste a Melhor',
      headlinePart2: 'Carreira em Tech',
      subtitle: 'O SkillBun ajuda estudantes de ciência da computação e programação em todo o mundo a descobrirem sua carreira ideal através de mais de 100 trilhas interativas, testes adaptativos e certificados gratuitos.',
      ctaStartQuiz: 'Fazer Teste Vocacional (2 min)',
      ctaExploreRoadmaps: 'Explorar +100 Trilhas',
      ctaTalkBunbot: 'Perguntar ao BunBot IA',
      freeBadge: '100% Gratuito e Aberto',
      verifiedBadge: 'Certificados Digitais Verificáveis',
      studentCount: 'Apoiando estudantes em mais de 140 países',
    },
    stats: {
      roadmapsCount: '+100 Trilhas Gratuitas',
      freeTier: 'R$0 Para Sempre',
      passRate: 'Motor de IA Adaptativo',
      studentsHelped: 'Comunidade Global de Estudantes',
    },
    sections: {
      sampleMoments: {
        title: 'Jornadas de Estudantes',
        subtitle: 'Da incerteza a uma trilha de engenharia clara em poucos minutos.',
        beforeLabel: 'Antes do SkillBun',
        profileSignal: 'Sinais do Perfil',
        quizAdapts: 'Teste Inteligente',
        recClarity: 'Recomendação Clara',
        roadmapBunbot: 'Trilha + Bun-Bot',
      },
      os: {
        title: 'SkillBun OS: Sua Plataforma Completa de Carreira Tech',
        subtitle: 'Tudo o que estudantes e desenvolvedores precisam para alcançar posições de alto impacto em engenharia de software.',
        adaptiveEngine: 'Motor de Avaliação Adaptativo',
        careerMatrix: '+100 Árvores de Habilidades',
        verifiedCerts: 'Certificados Verificáveis Gratuitos',
        liveCounsellor: 'Mentor de IA 24/7',
      },
      journey: {
        title: 'Sua Jornada em 4 Passos para o Sucesso',
        step1Title: '1. Descubra sua Especialidade',
        step1Desc: 'Faça nosso teste rápido de 2 minutos para conectar suas aptidões às carreiras de maior demanda.',
        step2Title: '2. Siga Trilhas Guiadas Passo a Passo',
        step2Desc: 'Aprenda através de videoaulas curadas, projetos práticos no GitHub e marcos de habilidades.',
        step3Title: '3. Tire Dúvidas com o Bun-Bot IA',
        step3Desc: 'Consulte conceitos de código, arquitetura de sistemas e receba conselhos profissionais 24/7.',
        step4Title: '4. Conquiste seu Certificado Gratuito',
        step4Desc: 'Atinja 60% de progresso, passe no exame oficial e gere seu certificado com QR Code.',
      },
      counsellor: {
        title: 'Conheça o Bun-Bot: Seu Conselheiro Técnico de IA 24/7',
        subtitle: 'Orientações em tempo real sobre linguagens, salários globais e preparação para entrevistas.',
      },
      trust: {
        title: 'Feito Para Estudantes. 100% Gratuito Sempre.',
        subtitle: 'Sem assinaturas ocultas, sem barreiras financeiras. Acesso democrático para todos os futuros engenheiros.',
      },
      finalCta: {
        title: 'Pronto para Mapear seu Futuro em Tecnologia?',
        subtitle: 'Junte-se a milhares de estudantes e inicie sua jornada na programação agora mesmo.',
        button: 'Começar Gratuitamente',
      },
    },
    footer: {
      brandBio: 'Pule para a carreira certa. Ajudando estudantes de computação e tecnologia em todo o mundo a encontrarem o seu caminho através de IA e trilhas estruturadas.',
      platform: 'Plataforma',
      company: 'Empresa',
      roadmaps: 'Trilhas Profissionais',
      quiz: 'Teste Vocacional',
      bunbot: 'Mentor BunBot IA',
      dashboard: 'Painel do Estudante',
      verifyCertificate: 'Validar Certificado',
      alumniVault: 'Portal de Alunos',
      aboutUs: 'Sobre Nós',
      privacyPolicy: 'Política de Privacidade',
      termsOfUse: 'Termos de Uso',
      contactUs: 'Fale Conosco',
      copyright: 'por Reish. Desenvolvido com carinho para estudantes tech do mundo inteiro.',
      language: 'Idioma',
    },
    common: {
      free: 'Grátis',
      verified: 'Verificado',
      getStarted: 'Começar',
      viewAll: 'Ver Todos',
      backToHome: 'Voltar ao Início',
      selectLanguage: 'Selecionar Idioma',
    },
  },
  ja: {
    nav: {
      searchPlaceholder: '100以上のロードマップ、トピック、スキルを検索...',
      roadmaps: 'ロードマップ',
      quiz: 'キャリア診断',
      counsellor: 'BunBot AI',
      dashboard: 'ダッシュボード',
      certifications: '認定資格',
      verifyCert: '証明書の検証',
      switchLanguage: '言語の切り替え',
      skipToContent: 'コンテンツへスキップ',
    },
    hero: {
      tagline: '100%無料のAIエンジニアキャリアロードマップ＆公式認定資格',
      headlinePart1: 'あなたに最適な',
      headlinePart2: 'ITキャリアへ進もう',
      subtitle: 'SkillBunは世界中のコンピュータサイエンスおよび工学系の学生のために、100以上の対話型ロードマップ、適応型AIクイズ、無料の公式デジタル認定証を提供します。',
      ctaStartQuiz: '2分でキャリア診断を受ける',
      ctaExploreRoadmaps: '100+のロードマップを見る',
      ctaTalkBunbot: 'BunBot AIに相談する',
      freeBadge: '100%完全無料・オープンアクセス',
      verifiedBadge: '検証可能なデジタル資格証',
      studentCount: '140カ国以上の学生が利用中',
    },
    stats: {
      roadmapsCount: '100+ 無料ロードマップ',
      freeTier: '永久無料 0円',
      passRate: '適応型AIエンジン',
      studentsHelped: 'グローバル学生コミュニティ',
    },
    sections: {
      sampleMoments: {
        title: '学生たちの成長ステップ',
        subtitle: '迷いから構造化されたエンジニア学習パスへ、わずか数分で到達。',
        beforeLabel: 'SkillBun利用前',
        profileSignal: 'プロフィール分析',
        quizAdapts: 'クイズの適応',
        recClarity: '明確な推奨パス',
        roadmapBunbot: 'ロードマップ + Bun-Bot',
      },
      os: {
        title: 'SkillBun OS: 包括的テックキャリア基盤',
        subtitle: 'ソフトウェアエンジニアを目指すすべての学習者のための完全なエコシステム。',
        adaptiveEngine: '適応型スキル診断エンジン',
        careerMatrix: '100+ インタラクティブスキルツリー',
        verifiedCerts: '無料の検証可能デジタル認定証',
        liveCounsellor: '24時間365日対応 AIキャリアメンター',
      },
      journey: {
        title: 'トップエンジニアへの4つのステップ',
        step1Title: '1. 専門分野を発見する',
        step1Desc: '2分間の適応型クイズで、あなたの思考特性に最適なエンジニアリング領域を特定します。',
        step2Title: '2. 体系的なツリーロードマップを進める',
        step2Desc: '厳選された動画教材と実践プロジェクトで着実にスキルを習得します。',
        step3Title: '3. Bun-Bot AIによる学習サポート',
        step3Desc: 'コーディングの疑問や設計の課題をいつでもAIメンターに相談できます。',
        step4Title: '4. 無料のデジタル証明書を取得',
        step4Desc: 'ロードマップの60%を達成し、公式テストに合格してQRコード付き認定証を獲得しましょう。',
      },
      counsellor: {
        title: 'Bun-Bot: 24時間頼れるAIエンジニアリング相談役',
        subtitle: '最新の技術スタック、世界基準の給与水準、インターン準備をリアルタイムで案内。',
      },
      trust: {
        title: '学生のために開発。ずっと完全無料。',
        subtitle: '課金や隠れた費用は一切ありません。世界中のすべての挑戦者に平等な機会を。',
      },
      finalCta: {
        title: 'ITの世界であなたの未来を描きませんか？',
        subtitle: '世界中の志高い仲間とともに、今日から第一歩を踏み出しましょう。',
        button: '無料でスタート',
      },
    },
    footer: {
      brandBio: '正しいキャリアへジャンプしよう。AIガイダンスと構造化ロードマップを通じて、世界中の情報科学の学生が最適なキャリアを見つけられるよう支援します。',
      platform: 'プラットフォーム',
      company: '運営企業',
      roadmaps: 'キャリアロードマップ',
      quiz: 'キャリア診断テスト',
      bunbot: 'BunBot AIメンター',
      dashboard: '学生ダッシュボード',
      verifyCertificate: '認定書の検証',
      alumniVault: '卒業生ポータル',
      aboutUs: 'SkillBunについて',
      privacyPolicy: 'プライバシーポリシー',
      termsOfUse: '利用規約',
      contactUs: 'お問い合わせ',
      copyright: 'Reish提供。世界中のエンジニア志望者のために情熱を込めて制作。',
      language: '言語',
    },
    common: {
      free: '無料',
      verified: '認証済み',
      getStarted: '始める',
      viewAll: 'すべて見る',
      backToHome: 'ホームに戻る',
      selectLanguage: '言語を選択',
    },
  },
  id: {
    nav: {
      searchPlaceholder: 'Cari 100+ roadmap, topik, atau keahlian...',
      roadmaps: 'Roadmap Karir',
      quiz: 'Kuis Karir',
      counsellor: 'BunBot AI',
      dashboard: 'Dashboard',
      certifications: 'Sertifikasi',
      verifyCert: 'Verifikasi Sertifikat',
      switchLanguage: 'Ganti Bahasa',
      skipToContent: 'Lewati ke konten',
    },
    hero: {
      tagline: '100% Gratis Roadmap Karir & Sertifikasi Tech Berbasis AI',
      headlinePart1: 'Melompat Menuju',
      headlinePart2: 'Karir Tech Impian',
      subtitle: 'SkillBun membantu mahasiswa teknik informatika dan pengembang perangkat lunak di seluruh dunia menemukan jalur karir ideal melalui 100+ roadmap interaktif, kuis adaptif, dan sertifikasi digital terverifikasi gratis.',
      ctaStartQuiz: 'Mulai Kuis Karir (2 Menit)',
      ctaExploreRoadmaps: 'Jelajahi 100+ Roadmap',
      ctaTalkBunbot: 'Tanya BunBot AI',
      freeBadge: '100% Gratis & Akses Terbuka',
      verifiedBadge: 'Kredensial Digital Terverifikasi',
      studentCount: 'Mendukung mahasiswa di 140+ negara',
    },
    stats: {
      roadmapsCount: '100+ Roadmap Gratis',
      freeTier: 'Rp0 Selamanya',
      passRate: 'Mesin AI Adaptif',
      studentsHelped: 'Komunitas Mahasiswa Global',
    },
    sections: {
      sampleMoments: {
        title: 'Momen Pembelajaran Mahasiswa',
        subtitle: 'Dari kebingungan menuju roadmap rekayasa perangkat lunak terstruktur dalam hitungan menit.',
        beforeLabel: 'Sebelum SkillBun',
        profileSignal: 'Sinyal Profil',
        quizAdapts: 'Adaptasi Kuis',
        recClarity: 'Kejelasan Rekomendasi',
        roadmapBunbot: 'Roadmap + Bun-Bot',
      },
      os: {
        title: 'SkillBun OS: Ekosistem Karir Tech Terpadu',
        subtitle: 'Semua yang dibutuhkan mahasiswa dan programmer mandiri untuk menembus industri teknologi.',
        adaptiveEngine: 'Mesin Evaluasi Adaptif',
        careerMatrix: '100+ Pohon Keterampilan Interaktif',
        verifiedCerts: 'Sertifikat Terverifikasi Gratis',
        liveCounsellor: 'Mentor Karir AI 24/7',
      },
      journey: {
        title: '4 Langkah Mudah Menuju Karir Tech Bergengsi',
        step1Title: '1. Temukan Minat Spesifik',
        step1Desc: 'Ikuti kuis 2 menit untuk mencocokkan gaya pemecahan masalahmu dengan peran software engineer nyata.',
        step2Title: '2. Ikuti Roadmap Interaktif',
        step2Desc: 'Kuasai kurikulum terstruktur dengan panduan video terpilih dan proyek praktis portofolio.',
        step3Title: '3. Konsultasi dengan Bun-Bot AI',
        step3Desc: 'Dapatkan jawaban teknis seputar arsitektur, kode, dan tips wawancara kerja 24 jam sehari.',
        step4Title: '4. Raih Sertifikat Resmi Gratis',
        step4Desc: 'Selesaikan 60% roadmap, lulus ujian resmi, dan klaim sertifikat digital dengan QR code verifikasi.',
      },
      counsellor: {
        title: 'Kenali Bun-Bot: Konselor Teknik AI 24/7 Kamu',
        subtitle: 'Panduan waktu nyata tentang stack teknologi, standar gaji industri, dan persiapan magang.',
      },
      trust: {
        title: 'Dibangun untuk Mahasiswa. 100% Gratis Selamanya.',
        subtitle: 'Tanpa paywall, tanpa langganan tersembunyi. Kesempatan belajar setara bagi setiap calon insinyur.',
      },
      finalCta: {
        title: 'Siap Merancang Masa Depanmu di Dunia Tech?',
        subtitle: 'Bergabunglah dengan ribuan mahasiswa berprestasi dan mulai petualangan codingmu hari ini.',
        button: 'Mulai Gratis Sekarang',
      },
    },
    footer: {
      brandBio: 'Melompat ke karir yang tepat. Membantu mahasiswa ilmu komputer dan teknologi di seluruh dunia menemukan jalan mereka melalui panduan AI dan roadmap terstruktur.',
      platform: 'Platform',
      company: 'Perusahaan',
      roadmaps: 'Roadmap Karir',
      quiz: 'Kuis Karir',
      bunbot: 'Mentor BunBot AI',
      dashboard: 'Dashboard Mahasiswa',
      verifyCertificate: 'Verifikasi Sertifikat',
      alumniVault: 'Portal Alumni',
      aboutUs: 'Tentang Kami',
      privacyPolicy: 'Kebijakan Privasi',
      termsOfUse: 'Ketentuan Layanan',
      contactUs: 'Hubungi Kami',
      copyright: 'oleh Reish. Dibuat dengan penuh dedikasi untuk mahasiswa teknologi di seluruh dunia.',
      language: 'Bahasa',
    },
    common: {
      free: 'Gratis',
      verified: 'Terverifikasi',
      getStarted: 'Mulai',
      viewAll: 'Lihat Semua',
      backToHome: 'Kembali ke Beranda',
      selectLanguage: 'Pilih Bahasa',
    },
  },
};

/**
 * Safely lookup nested translation keys e.g. "nav.roadmaps"
 */
export function getTranslation(locale = DEFAULT_LOCALE, keyPath = '', fallback = '') {
  const targetLocale = DICTIONARIES[locale] ? locale : DEFAULT_LOCALE;
  const parts = String(keyPath).split('.');

  let current = DICTIONARIES[targetLocale];
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      current = undefined;
      break;
    }
  }

  if (typeof current === 'string') return current;

  // Fallback to English dictionary
  if (targetLocale !== DEFAULT_LOCALE) {
    let fallbackCurrent = DICTIONARIES[DEFAULT_LOCALE];
    for (const part of parts) {
      if (fallbackCurrent && typeof fallbackCurrent === 'object' && part in fallbackCurrent) {
        fallbackCurrent = fallbackCurrent[part];
      } else {
        fallbackCurrent = undefined;
        break;
      }
    }
    if (typeof fallbackCurrent === 'string') return fallbackCurrent;
  }

  return fallback || keyPath;
}

/**
 * Detect client or browser language from standard navigator or accept-language
 */
export function detectBrowserLocale(acceptLanguageHeader = '') {
  if (!acceptLanguageHeader && typeof navigator !== 'undefined') {
    acceptLanguageHeader = navigator.language || (navigator.languages && navigator.languages[0]) || '';
  }

  if (!acceptLanguageHeader) return DEFAULT_LOCALE;

  const normalized = String(acceptLanguageHeader).toLowerCase();
  for (const loc of SUPPORTED_LOCALES) {
    if (normalized.startsWith(loc.code) || normalized.includes(loc.code)) {
      return loc.code;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Format currency amounts across regions with purchasing power context
 */
export function formatCurrencyForLocale(amountUSD = 0, locale = DEFAULT_LOCALE, targetCurrency = 'USD') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: targetCurrency,
      maximumFractionDigits: 0,
    }).format(amountUSD);
  } catch {
    return `$${amountUSD.toLocaleString()}`;
  }
}

/**
 * Generate hreflang alternate maps for global search engines
 */
export function getHreflangAlternates(canonicalUrl = 'https://skillbun.tech') {
  const languages = {};
  for (const loc of SUPPORTED_LOCALES) {
    languages[loc.code] = `${canonicalUrl}?lang=${loc.code}`;
  }
  languages['x-default'] = canonicalUrl;
  return languages;
}
