export const translations = {
    EN: {
        navbar: {
            home: "Home",
            getStarted: "Get Started",
        },
        hero: {
            badge: "Technical Decision Intelligence",
            title: "Precision Analysis for Complex Multi-Criteria",
            subtitle: "Empower your decision-making process with scientifically validated MCDM methodologies, real-time visual analytics, and objective ranking matrices.",
            ctaStart: "Get Started Now",
            ctaFeatures: "Explore Features",
        },
        why: {
            title: "Why RankSensilytics?",
            desc: "In a world of information overload, subjective choices lead to suboptimal outcomes. We built this application to provide a mathematically rigorous framework for objective evaluation, ensuring every decision is backed by solid data and proven algorithms.",
            features: [
                { title: "Objective Evaluation", desc: "Eliminate bias using normalized decision matrices." },
                { title: "Real-time Computation", desc: "Complex calculations processed in milliseconds." },
                { title: "Scientific Rigor", desc: "Based on peer-reviewed MCDM methodologies." },
            ],
            preview: "Live Preview: Decision Matrix",
            accuracy: "Accuracy Rate",
            methods: "Methods",
        },
        how: {
            title: "How It Works",
            desc: "Simple integration, powerful results. Follow our streamlined process to extract actionable insights from your data.",
            steps: [
                { title: "Input Data", desc: "Upload Excel or manually enter your alternatives and criteria scores." },
                { title: "Apply Weights", desc: "Select between Equal, Entropy, CRITIC, or AHP weighting methods." },
                { title: "Run Algorithm", desc: "Choose from 18+ MCDM methods like SWEI, SWI, or TOPSIS." },
                { title: "Analyze Graphs", desc: "Instantly view ranking comparisons and sensitivity analysis." },
            ]
        },
        requirements: {
            title: "Requirement Guide",
            structure: {
                title: "Data Structure",
                items: [
                    "Define clear Alternatives (e.g., Suppliers, Projects, Locations).",
                    "Identify Criteria with specific weights and polarities (Max/Min).",
                    "Provide Numerical Scores for each alternative-criteria intersection.",
                ]
            },
            capabilities: {
                title: "System Capabilities",
                items: [
                    "Supports up to 50 alternatives and 100 criteria.",
                    "Excel import compatibility (.xlsx, .csv).",
                    "Interactive sensitivity analysis for weight testing.",
                ]
            }
        },
        merits: {
            title: "Application Merits",
            items: [
                { title: "Dynamic Visualizations", desc: "Switch between Bar, Line, Radar, and Heatmap charts instantly." },
                { title: "Mathematical Accuracy", desc: "Implements high-precision floating point arithmetic for all matrices." },
                { title: "Method Comparison", desc: "Compare results from different MCDM methods side-by-side." },
                { title: "Sensitivity Matrices", desc: "Analyze how weight shifts impact your final ranking stack." },
                { title: "Excel Export", desc: "Download full calculation transcripts and rankings to Excel." },
                { title: "Formula Transparency", desc: "Every method includes a detailed MathJax formula breakdown." },
            ]
        },
        showcase: {
            title: "Methodology & Analytics",
            desc: "Deep-dive into the technical foundations of our engine.",
            formulation: {
                title: "Mathematical Formulation",
                desc: "Rigorous algorithmic implementation"
            },
            graphRank: {
                title: "Ranking Comparison Graph",
                desc: "Cross-methodological delta Analysis"
            },
            graphSens: {
                title: "Sensitivity Analysis Matrix",
                desc: "Rank variation across weight shifts (C1)"
            },
            formulas: {
                sweiTitle: "SWEI Core Formulation",
                swiTitle: "SWI Core Formulation",
                rankingCriteria: "Ranking Criteria",
                rankAscending: "Rank(A_i) \\uparrow \\text{ as } SWEI''_i \\downarrow \\text{ (Ascending)}"
            }
        },
        tables: {
            title: "Data Synthesis",
            desc: "Comprehensive calculation transcripts produced by the engine.",
            rankTitle: "Table: Ranking Comparison",
            matrixTitle: "Table: Comparison Matrix",
            alt: "Alternative",
            avg: "Avg. Score",
            metrics: "Metrics"
        },
        contact: {
            title: "Get in Touch",
            desc: "Have questions about our MCDM framework or want to collaborate? Send me a message and I'll get back to you as soon as possible.",
            response: "Fast Response",
            responseTime: "Typically responds within 24 hours.",
            access: "Direct Access",
            accessPerson: "Straight to Dr. Pankaj Prasad Dwivedi.",
            form: {
                name: "Full Name",
                namePlaceholder: "Your Name",
                email: "Email Address",
                emailPlaceholder: "email@example.com",
                nationality: "Nationality",
                nationalityPlaceholder: "Your Nationality",
                message: "Personal Message",
                messagePlaceholder: "How can I help you?",
                send: "Send Message",
                success: "Message sent successfully!",
                error: "Failed to send message. Please try again.",
                errGeneral: "An error occurred. Please try again later."
            }
        },
        footer: {
            ctaTitle: "Ready to make better decisions?",
            ctaDesc: "Join researchers and analysts worldwide using our MCDM framework for precise, data-driven outcomes.",
            ctaButton: "Get Started For Free",
            developed: "Developed by Dr. Pankaj Prasad Dwivedi. All rights reserved.",
            docs: "Documentation",
            api: "API Reference",
            terms: "Terms"
        }
    },
    HI: {
        navbar: {
            home: "मुख्य पृष्ठ",
            getStarted: "शुरू करें",
        },
        hero: {
            badge: "तकनीकी निर्णय बुद्धिमत्ता",
            title: "जटिल बहु-मानदंडों के लिए सटीक विश्लेषण",
            subtitle: "वैज्ञानिक रूप से प्रमाणित MCDM पद्धतियों, वास्तविक समय के विज़ुअल एनालिटिक्स और उद्देश्य रैंकिंग मैट्रिक्स के साथ अपनी निर्णय लेने की प्रक्रिया को सशक्त बनाएं।",
            ctaStart: "अभी शुरू करें",
            ctaFeatures: "विशेषताओं का अन्वेषण करें",
        },
        why: {
            title: "RankSensilytics क्यों?",
            desc: "सूचना के अतिभार वाली दुनिया में, व्यक्तिपरक विकल्प इष्टतम परिणामों की ओर ले जाते हैं। हमने उद्देश्य मूल्यांकन के लिए गणितीय रूप से कठोर ढांचा प्रदान करने के लिए इस एप्लिकेशन को बनाया है, जिससे यह सुनिश्चित होता है कि प्रत्येक निर्णय ठोस डेटा और सिद्ध एल्गोरिदम द्वारा समर्थित है।",
            features: [
                { title: "उद्देश्य मूल्यांकन", desc: "सामान्यीकृत निर्णय मैट्रिक्स का उपयोग करके पूर्वाग्रह को समाप्त करें।" },
                { title: "वास्तविक समय गणना", desc: "मिलीसेकंड में संसाधित जटिल गणनाएं।" },
                { title: "वैज्ञानिक कठोरता", desc: "सहकर्मी-समीक्षित MCDM पद्धतियों पर आधारित।" },
            ],
            preview: "लाइव पूर्वावलोकन: निर्णय मैट्रिक्स",
            accuracy: "सटीकता दर",
            methods: "तरीके",
        },
        how: {
            title: "यह कैसे काम करता है",
            desc: "सरल एकीकरण, शक्तिशाली परिणाम। अपने डेटा से कार्रवाई योग्य अंतर्दृष्टि निकालने के लिए हमारी सुव्यवस्थित प्रक्रिया का पालन करें।",
            steps: [
                { title: "डेटा इनपुट करें", desc: "एक्सेल अपलोड करें या मैन्युअल रूप से अपने विकल्पों और मानदंडों के स्कोर दर्ज करें।" },
                { title: "भार लागू करें", desc: "समान, एंट्रॉपी, CRITIC, या AHP भार विधियों के बीच चयन करें।" },
                { title: "एल्गोरिदम चलाएं", desc: "SWEI, SWI, या TOPSIS जैसी 18+ MCDM विधियों में से चुनें।" },
                { title: "रेखांकन का विश्लेषण करें", desc: "रैंकिंग तुलना और संवेदनशीलता विश्लेषण तुरंत देखें।" },
            ]
        },
        requirements: {
            title: "आवश्यकता निर्देशिका",
            structure: {
                title: "डेटा संरचना",
                items: [
                    "स्पष्ट विकल्प परिभाषित करें (जैसे, आपूर्तिकर्ता, परियोजनाएं, स्थान)।",
                    "विशिष्ट भार और ध्रुवता (अधिकतम/न्यूनतम) के साथ मानदंडों की पहचान करें।",
                    "प्रत्येक विकल्प-मानदंड प्रतिच्छेदन के लिए संख्यात्मक स्कोर प्रदान करें।",
                ]
            },
            capabilities: {
                title: "सिस्टम क्षमताएं",
                items: [
                    "50 विकल्पों और 100 मानदंडों तक का समर्थन करता है।",
                    "एक्सेल आयात अनुकूलता (.xlsx, .csv)।",
                    "भार परीक्षण के लिए इंटरैक्टिव संवेदनशीलता विश्लेषण।",
                ]
            }
        },
        merits: {
            title: "एप्लिकेशन के लाभ",
            items: [
                { title: "गतिशील विज़ुअलाइज़ेशन", desc: "बार, लाइन, रडार और हीटमैप चार्ट के बीच तुरंत स्विच करें।" },
                { title: "गणितीय सटीकता", desc: "सभी मैट्रिक्स के लिए उच्च-सटीक फ्लोटिंग पॉइंट अंकगणित लागू करता है।" },
                { title: "विधि तुलना", desc: "विभिन्न MCDM विधियों के परिणामों की साथ-साथ तुलना करें।" },
                { title: "संवेदनशीलता मैट्रिक्स", desc: "विश्लेषण करें कि भार परिवर्तन आपकी अंतिम रैंकिंग स्टैक को कैसे प्रभावित करते हैं।" },
                { title: "एक्सेल निर्यात", desc: "पूर्ण गणना प्रतिलेख और रैंकिंग एक्सेल में डाउनलोड करें।" },
                { title: "सूत्र पारदर्शिता", desc: "प्रत्येक विधि में विस्तृत MathJax सूत्र विश्लेषण शामिल है।" },
            ]
        },
        showcase: {
            title: "कार्यप्रणाली और विश्लेषण",
            desc: "हमारे इंजन की तकनीकी नींव में गहराई से उतरें।",
            formulation: {
                title: "गणितीय सूत्र",
                desc: "कठोर एल्गोरिथम कार्यान्वयन"
            },
            graphRank: {
                title: "रैंकिंग तुलना ग्राफ",
                desc: "पार-पद्धतिगत डेल्टा विश्लेषण"
            },
            graphSens: {
                title: "संवेदनशीलता विश्लेषण मैट्रिक्स",
                desc: "भार परिवर्तन (C1) में रैंक भिन्नता"
            },
            formulas: {
                sweiTitle: "SWEI कोर फॉर्मूलेशन",
                swiTitle: "SWI कोर फॉर्मूलेशन",
                rankingCriteria: "रैंकिंग मानदंड",
                rankAscending: "Rank(A_i) \\uparrow \\text{ as } SWEI''_i \\downarrow \\text{ (आरोही)}"
            }
        },
        tables: {
            title: "डेटा संश्लेषण",
            desc: "इंजन द्वारा निर्मित व्यापक गणना प्रतिलेख।",
            rankTitle: "तालिका: रैंकिंग तुलना",
            matrixTitle: "तालिका: तुलना मैट्रिक्स",
            alt: "विकल्प",
            avg: "औसत स्कोर",
            metrics: "मेट्रिक्स"
        },
        contact: {
            title: "संपर्क करें",
            desc: "हमारे MCDM ढांचे के बारे में प्रश्न हैं या सहयोग करना चाहते हैं? मुझे एक संदेश भेजें और मैं जल्द से जल्द आपसे संपर्क करूँगा।",
            response: "त्वरित प्रतिक्रिया",
            responseTime: "आमतौर पर 24 घंटों के भीतर जवाब देता है।",
            access: "सीधी पहुंच",
            accessPerson: "डॉ. पंकज प्रसाद द्विवेदी से सीधे संपर्क करें।",
            form: {
                name: "पूरा नाम",
                namePlaceholder: "आपका नाम",
                email: "ईमेल पता",
                emailPlaceholder: "email@example.com",
                nationality: "राष्ट्रीयता",
                nationalityPlaceholder: "आपकी राष्ट्रीयता",
                message: "व्यक्तिगत संदेश",
                messagePlaceholder: "मैं आपकी कैसे मदद कर सकता हूँ?",
                send: "संदेश भेजें",
                success: "संदेश सफलतापूर्वक भेजा गया!",
                error: "संदेश भेजने में विफल। कृपया पुन: प्रयास करें।",
                errGeneral: "एक त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।"
            }
        },
        footer: {
            ctaTitle: "बेहतर निर्णय लेने के लिए तैयार हैं?",
            ctaDesc: "सटीक, डेटा-संचालित परिणामों के लिए हमारे MCDM ढांचे का उपयोग करने वाले दुनिया भर के शोधकर्ताओं और विश्लेषकों में शामिल हों।",
            ctaButton: "मुफ्त में शुरू करें",
            developed: "डॉ. पंकज प्रसाद द्विवेदी और अन्य द्वारा विकसित। सर्वाधिकार सुरक्षित।",
            docs: "दस्तावेज़ीकरण",
            api: "API संदर्भ",
            terms: "शर्तें"
        }
    },
    ES: {
        navbar: {
            home: "Inicio",
            getStarted: "Empezar",
        },
        hero: {
            badge: "Inteligencia de Decisión Técnica",
            title: "Análisis de Precisión para Multicriterios Complejos",
            subtitle: "Empodere su proceso de toma de decisiones con metodologías MCDM validadas científicamente, análisis visual en tiempo real y matrices de clasificación objetivas.",
            ctaStart: "Empezar Ahora",
            ctaFeatures: "Explorar Funciones",
        },
        why: {
            title: "¿Por qué RankSensilytics?",
            desc: "En un mundo con sobrecarga de información, las elecciones subjetivas conducen a resultados subóptimos. Creamos esta aplicación para proporcionar un marco matemáticamente riguroso para la evaluación objetiva, asegurando que cada decisión esté respaldada por datos sólidos y algoritmos probados.",
            features: [
                { title: "Evaluación Objetiva", desc: "Elimine sesgos utilizando matrices de decisión normalizadas." },
                { title: "Cálculo en Tiempo Real", desc: "Cálculos complejos procesados en milisegundos." },
                { title: "Rigor Científico", desc: "Basado en metodologías MCDM revisadas por pares." },
            ],
            preview: "Vista previa: Matriz de Decisión",
            accuracy: "Tasa de Precisión",
            methods: "Métodos",
        },
        how: {
            title: "Cómo Funciona",
            desc: "Integración simple, resultados potentes. Siga nuestro proceso simplificado para extraer información procesable de sus datos.",
            steps: [
                { title: "Ingresar Datos", desc: "Cargue Excel o ingrese manualmente sus alternativas y puntuaciones de criterios." },
                { title: "Aplicar Pesos", desc: "Seleccione entre los métodos de ponderación Equal, Entropy, CRITIC o AHP." },
                { title: "Ejecutar Algoritmo", desc: "Elija entre más de 18 métodos MCDM como SWEI, SWI o TOPSIS." },
                { title: "Analizar Gráficos", desc: "Vea instantáneamente comparaciones de clasificación y análisis de sensibilidad." },
            ]
        },
        requirements: {
            title: "Guía de Requisitos",
            structure: {
                title: "Estructura de Datos",
                items: [
                    "Defina Alternativas claras (ej., Proveedores, Proyectos, Ubicaciones).",
                    "Identifique Criterios con pesos y polaridades específicos (Máx/Mín).",
                    "Proporcione Puntuaciones Numéricas para cada intersección alternativa-criterio.",
                ]
            },
            capabilities: {
                title: "Capacidades del Sistema",
                items: [
                    "Admite hasta 50 alternativas y 100 criterios.",
                    "Compatibilidad con importación de Excel (.xlsx, .csv).",
                    "Análisis de sensibilidad interactivo para pruebas de peso.",
                ]
            }
        },
        merits: {
            title: "Méritos de la Aplicación",
            items: [
                { title: "Visualizaciones Dinámicas", desc: "Cambie entre gráficos de barras, líneas, radar y mapas de calor al instante." },
                { title: "Precisión Matemática", desc: "Implementa aritmética de punto flotante de alta precisión para todas las matrices." },
                { title: "Comparación de Métodos", desc: "Compare resultados de diferentes métodos MCDM de forma paralela." },
                { title: "Matrices de Sensibilidad", desc: "Analice cómo los cambios de peso afectan su clasificación final." },
                { title: "Exportación a Excel", desc: "Descargue transcripciones de cálculo completas y clasificaciones a Excel." },
                { title: "Transparencia de Fórmulas", desc: "Cada método incluye un desglose detallado de la fórmula MathJax." },
            ]
        },
        showcase: {
            title: "Metodología y Análisis",
            desc: "Sumérjase en los fundamentos técnicos de nuestro motor.",
            formulation: {
                title: "Formulación Matemática",
                desc: "Implementación algorítmica rigurosa"
            },
            graphRank: {
                title: "Gráfico de Comparación de Clasificación",
                desc: "Análisis delta transmetodológico"
            },
            graphSens: {
                title: "Matriz de Análisis de Sensibilidad",
                desc: "Variación de rango a través de cambios de peso (C1)"
            },
            formulas: {
                sweiTitle: "Formulación Central SWEI",
                swiTitle: "Formulación Central SWI",
                rankingCriteria: "Criterios de Clasificación",
                rankAscending: "Rank(A_i) \\uparrow \\text{ a medida que } SWEI''_i \\downarrow \\text{ (Ascendente)}"
            }
        },
        tables: {
            title: "Síntesis de Datos",
            desc: "Transcripciones de cálculo completas producidas por el motor.",
            rankTitle: "Tabla: Comparación de Clasificación",
            matrixTitle: "Tabla: Matriz de Comparación",
            alt: "Alternativa",
            avg: "Puntuación Media",
            metrics: "Métricas"
        },
        contact: {
            title: "Póngase en contacto",
            desc: "¿Tiene preguntas sobre nuestro marco MCDM o quiere colaborar? Envíeme un mensaje y me pondré en contacto lo antes posible.",
            response: "Respuesta Rápida",
            responseTime: "Normalmente responde dentro de las 24 horas.",
            access: "Acceso Directo",
            accessPerson: "Directamente al Dr. Pankaj Prasad Dwivedi.",
            form: {
                name: "Nombre Completo",
                namePlaceholder: "Su Nombre",
                email: "Correo Electrónico",
                emailPlaceholder: "correo@ejemplo.com",
                nationality: "Nacionalidad",
                nationalityPlaceholder: "Su Nacionalidad",
                message: "Mensaje Personal",
                messagePlaceholder: "¿Cómo puedo ayudarle?",
                send: "Enviar Mensaje",
                success: "¡Mensaje enviado con éxito!",
                error: "Error al enviar el mensaje. Por favor, inténtelo de nuevo.",
                errGeneral: "Ocurrió un error. Por favor, inténtelo de nuevo más tarde."
            }
        },
        footer: {
            ctaTitle: "¿Listo para tomar mejores decisiones?",
            ctaDesc: "Únase a investigadores y analistas de todo el mundo que utilizan nuestro marco MCDM para obtener resultados precisos basados en datos.",
            ctaButton: "Empezar Gratis",
            developed: "Desarrollado por el Dr. Pankaj Prasad Dwivedi et al. Todos los derechos reservados.",
            docs: "Documentación",
            api: "Referencia de API",
            terms: "Términos"
        }
    }
}
