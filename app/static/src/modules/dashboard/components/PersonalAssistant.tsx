import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSend, FiCpu, FiBookOpen, FiTool,
  FiClock, FiAlertCircle, FiTrash2, FiInfo, FiCheckCircle, FiPlus, FiMessageSquare,
  FiImage, FiMic, FiCamera, FiX, FiHeadphones
} from 'react-icons/fi';
import { AnimatedRobotIcon } from '../../../components/ui/AnimatedRobotIcon';
import './PersonalAssistant.css';

const renderTextWithAppleEmojis = (text: string): any => {
  const emojiRegex = /([\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2194}-\u{2199}\u{21a9}-\u{21aa}\u{3297}\u{3299}])/gu;
  const singleEmojiRegex = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2194}-\u{2199}\u{21a9}-\u{21aa}\u{3297}\u{3299}]/u;

  const parts = text.split(emojiRegex);
  return parts.map((part, index) => {
    if (singleEmojiRegex.test(part)) {
      const codePoints: string[] = [];
      for (const char of part) {
        const cp = char.codePointAt(0);
        if (cp) codePoints.push(cp.toString(16));
      }
      const hex = codePoints.filter(cp => cp !== 'fe0f').join('-');
      const cdnUrl = `https://cdnjs.cloudflare.com/ajax/libs/emoji-datasource-apple/14.0.0/img/apple/64/${hex}.png`;
      return (
        <img 
          key={index} 
          src={cdnUrl} 
          alt={part} 
          className="apple-emoji"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
            const textNode = document.createTextNode(part);
            (e.target as HTMLElement).parentNode?.insertBefore(textNode, e.target);
          }}
        />
      );
    }
    return part;
  });
};

interface UserData {
  id: number;
  name?: string;
  nombre?: string;
  role?: { name: string };
  rol?: { nombre: string };
  profile_image?: string;
}

interface PersonalAssistantProps {
  user: UserData;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string; // ISO string for reliable JSON serialization
  type?: 'text' | 'loans' | 'help' | 'rules';
  metadata?: any;
  media?: { data: string, mimeType: string, type: 'image' | 'audio', preview: string };
  suggestSupport?: boolean;       // La IA no pudo ayudar: ofrecer escalar a Soporte
  userQueryRef?: string;          // Pregunta que originó este mensaje (para el ticket)
  escalated?: { ticketId: number }; // Marcador: ya se escaló este mensaje
}

interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

export const PersonalAssistant: React.FC<PersonalAssistantProps> = ({ user }) => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [userLoans, setUserLoans] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [escalating, setEscalating] = useState<string | null>(null); // ID del mensaje siendo escalado

  const currentRole = (user as any)?.role?.name || (user as any)?.rol?.nombre || '';
  const isApprentice = ['APRENDIZ', 'USUARIO'].includes((currentRole || '').toUpperCase());

  const [attachedMedia, setAttachedMedia] = useState<{data: string, mimeType: string, type: 'image' | 'audio', preview: string} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const userName = user.name || user.nombre || 'Aprendiz';
  const isGuest = user.id === 0;

  // Pre-fetch loans for the chatbot if they are logged in
  useEffect(() => {
    if (!isGuest) {
      const fetchLoans = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/v1/loans/my', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setUserLoans(data);
          }
        } catch (error) {
          console.error("Error loading loans for assistant:", error);
        }
      };
      fetchLoans();
    }
  }, [isGuest]);

  // Load chat threads from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('sena_bot_threads');
    
    const newId = 'thread_' + Date.now();
    const defaultMsg: Message = {
      id: 'welcome_' + Date.now(),
      sender: 'bot',
      text: `¡Hola **${userName}**! 👋 ¿En qué puedo ayudarte hoy?`,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    const newThread: ChatThread = {
      id: newId,
      title: 'Nueva conversación',
      messages: [defaultMsg],
      updatedAt: new Date().toISOString()
    };

    if (stored) {
      try {
        const parsed: ChatThread[] = JSON.parse(stored);
        if (parsed.length > 0) {
          const updated = [newThread, ...parsed.filter((t: any) => t.messages.length > 1)];
          setThreads(updated);
          setActiveThreadId(newId);
          return;
        }
      } catch (e) {
        console.error("Error parsing chat threads:", e);
      }
    }

    setThreads([newThread]);
    setActiveThreadId(newId);
  }, [userName]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      const [prefix, data] = base64data.split(',');
      const mimeType = prefix.split(':')[1].split(';')[0];
      setAttachedMedia({ data, mimeType, type: 'image', preview: base64data });
    };
    e.target.value = '';
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const [prefix, data] = base64data.split(',');
          const mimeType = prefix.split(':')[1].split(';')[0];
          setAttachedMedia({ data, mimeType, type: 'audio', preview: base64data });
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("No se pudo acceder al micrófono.");
    }
  };

  // Save chat threads to localStorage whenever they change
  const saveThreadsToStorage = (updatedThreads: ChatThread[]) => {
    localStorage.setItem('sena_bot_threads', JSON.stringify(updatedThreads));
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads, activeThreadId, isTyping]);

  const activeThread = threads.find(t => t.id === activeThreadId);
  const messages = activeThread ? activeThread.messages : [];


  const handleCreateNewChat = () => {
    const newId = 'thread_' + Date.now();
    const defaultMsg: Message = {
      id: 'welcome_' + Date.now(),
      sender: 'bot',
      text: `¡Hola **${userName}**! 👋 ¿En qué puedo ayudarte hoy?`,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    const newThread: ChatThread = {
      id: newId,
      title: 'Nueva conversación',
      messages: [defaultMsg],
      updatedAt: new Date().toISOString()
    };
    const updated = [newThread, ...threads];
    setThreads(updated);
    setActiveThreadId(newId);
    saveThreadsToStorage(updated);
  };

  const handleDeleteChat = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    const filtered = threads.filter(t => t.id !== threadId);
    
    if (filtered.length === 0) {
      // If no threads remain, create a new blank one
      const newId = 'thread_' + Date.now();
      const defaultMsg: Message = {
        id: 'welcome_' + Date.now(),
        sender: 'bot',
        text: `¡Hola **${userName}**! 👋 ¿En qué puedo ayudarte hoy?`,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      const newThread: ChatThread = {
        id: newId,
        title: 'Nueva conversación',
        messages: [defaultMsg],
        updatedAt: new Date().toISOString()
      };
      const updated = [newThread];
      setThreads(updated);
      setActiveThreadId(newId);
      saveThreadsToStorage(updated);
    } else {
      setThreads(filtered);
      saveThreadsToStorage(filtered);
      if (activeThreadId === threadId) {
        setActiveThreadId(filtered[0].id);
      }
    }
  };

  const generateSmartTitle = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('libro') || q.includes('biblioteca')) return '📚 Consulta de libros';
    if (q.includes('prestamo') || q.includes('préstamo') || q.includes('mis prestamos') || q.includes('mis préstamos')) return '📋 Préstamos activos';
    if (q.includes('herramienta') || q.includes('almacen') || q.includes('almacén') || q.includes('equipo')) return '🛠️ Pedir herramientas';
    if (q.includes('horario') || q.includes('hora') || q.includes('abierto')) return '🕒 Horarios de atención';
    if (q.includes('ubicacion') || q.includes('ubicación') || q.includes('donde') || q.includes('dónde')) return '📍 Ubicación de sede';
    if (q.includes('retraso') || q.includes('multa') || q.includes('sancion') || q.includes('sanción')) return '⚠️ Sanciones y demoras';
    
    const words = query.trim().split(/\s+/);
    const truncated = words.slice(0, 3).join(' ');
    return truncated.length > 20 ? truncated.substring(0, 18) + '...' : truncated;
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !activeThreadId) return;

    const userMsgId = Date.now().toString();
    const newUserMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: text,
      timestamp: new Date().toISOString(),
      media: attachedMedia || undefined
    };

    // Append user message immediately
    const updatedMessages = [...messages, newUserMsg];
    let originalTitle = activeThread?.title || 'Nueva conversación';
    let newTitle = originalTitle;

    // Auto rename on first user message
    if (originalTitle === 'Nueva conversación') {
      newTitle = generateSmartTitle(text);
    }

    const updatedThreads = threads.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          title: newTitle,
          messages: updatedMessages,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    setInputText('');
    const sentMedia = attachedMedia;
    setAttachedMedia(null);
    setIsTyping(true);
    saveThreadsToStorage(updatedThreads);

    // Call Advanced AI Backend Endpoint with offline fallback
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        text: msg.text
      }));

      const response = await fetch('/api/v1/assistant/chat', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ message: text, history: chatHistory, media: sentMedia || undefined })
      });

      if (response.ok) {
        const data = await response.json();
        
        let finalTitle = newTitle;
        if (data.title) {
           finalTitle = data.title;
        }

        const botMsgId = Date.now().toString();
        const newBotMsg: Message = {
          id: botMsgId,
          sender: 'bot',
          text: data.text,
          timestamp: new Date().toISOString(),
          type: data.type || 'text',
          metadata: data.metadata,
          suggestSupport: !!data.suggest_support && isApprentice && !isGuest,
          userQueryRef: text,
        };

        const finalMessages = [...updatedMessages, newBotMsg];
        const finalThreads = updatedThreads.map(t => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              title: finalTitle,
              messages: finalMessages,
              updatedAt: new Date().toISOString()
            };
          }
          return t;
        });

        setThreads(finalThreads);
        setIsTyping(false);
        saveThreadsToStorage(finalThreads);
        return; // Success, exit early!
      }
    } catch (error) {
      console.warn("Advanced backend AI failed. Running local rule-based fallback:", error);
    }

    // LOCAL FALLBACK (Runs if fetch fails or backend returns non-200)
    setTimeout(() => {
      const responseText = generateBotResponse(text);
      const botMsgId = (Date.now() + 1).toString();
      
      const newBotMsg: Message = {
        id: botMsgId,
        sender: 'bot',
        text: responseText.text,
        timestamp: new Date().toISOString(),
        type: responseText.type,
        metadata: responseText.metadata
      };

      const finalMessages = [...updatedMessages, newBotMsg];
      const finalThreads = updatedThreads.map(t => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: finalMessages,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });

      setThreads(finalThreads);
      setIsTyping(false);
      saveThreadsToStorage(finalThreads);
    }, 1100);
  };

  const generateBotResponse = (query: string): { text: string; type: Message['type']; metadata?: any } => {
    const q = query.toLowerCase();

    // Hola / Saludo
    if (q.includes('hola') || q.includes('saludos') || q.includes('buenos dias') || q.includes('buenas tardes')) {
      return {
        text: `¡Hola de nuevo, **${userName}**! 😊 Estoy listo para resolver cualquier duda que tengas sobre la biblioteca o el almacén de herramientas. ¿Qué deseas consultar?`,
        type: 'text'
      };
    }

    // Mis Préstamos
    if (q.includes('préstamo') || q.includes('prestamo') || q.includes('mis prestamos') || q.includes('tengo prestado') || q.includes('mis préstamos') || q.includes('mis herramientas') || q.includes('mis libros')) {
      if (isGuest) {
        return {
          text: `Como eres un **Usuario Invitado**, no tienes un registro de préstamos activos en el sistema. 🔒 ¡Inicia sesión o crea una cuenta para poder solicitar materiales y ver tu historial!`,
          type: 'text'
        };
      }
      
      if (userLoans.length === 0) {
        return {
          text: `Consulté nuestro sistema de inventario y... ¡no tienes préstamos activos actualmente! 📚 Sigue explorando nuestro catálogo para solicitar herramientas, equipos o material bibliográfico.`,
          type: 'text'
        };
      }

      // Format the list of loans
      const activeLoans = userLoans.filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE');
      if (activeLoans.length === 0) {
        return {
          text: `Revisé tu historial y no tienes ningún préstamo pendiente por entregar. ¡Excelente! Tienes tu cuenta al día. ✨`,
          type: 'text'
        };
      }

      return {
        text: `Actualmente tienes **${activeLoans.length} préstamo(s) activo(s)** bajo tu custodia. Aquí tienes el detalle de tus materiales:`,
        type: 'loans',
        metadata: activeLoans
      };
    }

    // Cómo solicitar libro
    if (q.includes('libro') || q.includes('solicitar libro') || q.includes('prestar libro') || q.includes('biblioteca')) {
      return {
        text: `Para solicitar un **libro** o material bibliográfico en la Biblioteca SENA, sigue estos sencillos pasos:\n\n1. 🔍 Ve al apartado **"Explorar Catálogo"** de tu menú lateral.\n2. 📄 Filtra por la categoría **"Libros"** o busca el título directamente.\n3. 📝 Haz clic en **"Reservar"** para asegurar el ejemplar.\n4. 🕒 Tienes un plazo máximo de **2 horas** para recoger el libro en la ventanilla de biblioteca con el bibliotecario de turno.\n\n*Nota: Los préstamos de libros tienen una vigencia estándar de **8 días calendario**, renovables si ningún otro aprendiz ha reservado el ejemplar.*`,
        type: 'text'
      };
    }

    // Cómo solicitar herramientas
    if (q.includes('herramienta') || q.includes('equipo') || q.includes('almacen') || q.includes('almacén') || q.includes('arduino') || q.includes('maquina')) {
      return {
        text: `El préstamo de **herramientas, equipos tecnológicos o insumos** del almacén funciona bajo la siguiente normativa:\n\n1. 🛠️ Busca el equipo o herramienta que necesitas en el catálogo online.\n2. 🛒 Reserva el elemento desde tu portal.\n3. 💼 Dirígete al Almacén SENA y presenta tu documento de identidad junto con la autorización de tu instructor de taller si es un equipo pesado.\n4. ⏰ El tiempo máximo de préstamo es de **3 días hábiles** para asegurar que otros compañeros también puedan utilizarlos en sus prácticas formativas.\n\n⚠️ *Recuerda limpiar y ordenar las herramientas antes de devolverlas al almacén.*`,
        type: 'text'
      };
    }

    // Horarios
    if (q.includes('horario') || q.includes('hora') || q.includes('abierto') || q.includes('tiempo') || q.includes('dias') || q.includes('días')) {
      return {
        text: `🕒 **Horarios de Atención — Biblioteca y Almacén SENA:**\n\n*   **Lunes a Viernes:** 6:00 AM – 10:00 PM\n*   *(Nota: Los miércoles abrimos a partir de las 6:30 AM por reuniones pedagógicas)*\n*   **Sábado y Domingo:** Cerrado (No hay servicio al público)\n\n¡Te recomendamos acercarte al menos 15 minutos antes de la hora de cierre para tramitar tus entregas o retiros sin inconvenientes! ⏳`,
        type: 'text'
      };
    }

    // Ubicación
    if (q.includes('ubicación') || q.includes('ubicacion') || q.includes('donde') || q.includes('dónde') || q.includes('sede') || q.includes('velez') || q.includes('vélez')) {
      return {
        text: `📍 **Ubicación de nuestro Centro:**\n\nNos encontramos ubicados en la **Sede SENA de Vélez, Santander**, Colombia.\n\n*   **Biblioteca:** Bloque Principal, primer piso junto al área administrativa.\n*   **Almacén de Equipos:** Al fondo del pasillo técnico, contiguo a los talleres de electricidad y automatización.\n\nSi necesitas indicaciones precisas de cómo llegar o mapas interactivos, puedes hacer clic sobre el enlace de ubicación en el pie de página de la plataforma. 🗺️`,
        type: 'text'
      };
    }

    // Retrasos y multas
    if (q.includes('retraso') || q.includes('retrasar') || q.includes('atraso') || q.includes('tarde') || q.includes('multa') || q.includes('sancion') || q.includes('sanción')) {
      return {
        text: `⚠️ **Políticas de Entrega y Sanciones:**\n\nEn el SENA promovemos la responsabilidad con el cuidado del bien público. Si te retrasas en la entrega de un material, se aplicará el reglamento de biblioteca e inventarios:\n\n*   **Suspensión Temporal:** Recibirás una suspensión de préstamos de **1 día por cada día de retraso** por cada elemento pendiente.\n*   **Reporte al Coordinador:** En caso de demoras mayores a 10 días o pérdida del equipo, se abrirá un reporte formal ante coordinación académica para comité pedagógico.\n*   **Pérdida/Daño:** Deberás reponer el elemento exacto o de características equivalentes/superiores en un plazo no mayor a 15 días hábiles.\n\n¡Por favor, si necesitas más tiempo, solicita una renovación a tiempo desde el panel o comunícate con el Bibliotecario! 📝`,
        type: 'text'
      };
    }

    // Quién eres
    if (q.includes('quien eres') || q.includes('quién eres') || q.includes('que eres') || q.includes('bot') || q.includes('asistente') || q.includes('ayuda')) {
      return {
        text: `🤖 Soy **SENA Bot**, un asistente virtual inteligente diseñado con React y Flask para optimizar el servicio del centro de formación.\n\nMi objetivo es guiarte en el uso de la biblioteca y el almacén, darte respuestas inmediatas sobre normativas, mostrarte tus préstamos activos en tiempo real y ayudarte a navegar por el sistema de forma interactiva.\n\n¡Puedes probar preguntándome **"mis préstamos"** o **"cómo reservar un libro"**!`,
        type: 'text'
      };
    }

    // Cambiar contraseña
    if (q.includes('contraseña') || q.includes('contrasena') || q.includes('password') || q.includes('cambiar clave') || q.includes('clave')) {
      return {
        text: `🔐 **Cómo cambiar o recuperar tu contraseña:**\n\n1. 👤 Ve a tu **Perfil de Usuario** haciendo clic en tu nombre en la esquina inferior izquierda del menú lateral.\n2. 📝 Selecciona la opción **"Editar Perfil"** o **"Seguridad"**.\n3. 🔑 Escribe tu contraseña actual, luego ingresa la nueva clave y confírmala.\n4. 💾 Haz clic en **"Guardar Cambios"**.\n\n*Nota: Si olvidaste tu contraseña por completo y no puedes ingresar, comunícate con el Administrador del Centro de Formación o el Bibliotecario de turno para que realice un restablecimiento manual de tu clave desde el panel de administración.*`,
        type: 'text'
      };
    }

    // Pérdidas o daños
    if (q.includes('perdí') || q.includes('perdi') || q.includes('pérdida') || q.includes('perdida') || q.includes('dañó') || q.includes('daño') || q.includes('dano') || q.includes('rompí') || q.includes('rompi') || q.includes('dañar') || q.includes('perder')) {
      return {
        text: `⚠️ **Reporte de Pérdida o Daño de Elementos:**\n\nSi se te ha extraviado o dañado un libro, herramienta o equipo bajo tu préstamo, debes proceder de la siguiente manera:\n\n1. 📢 **Informa de inmediato** al Bibliotecario (para libros) o al Almacenista (para herramientas) para registrar el estado del elemento.\n2. 📦 **Reposición del Elemento:** Según el reglamento del SENA, tienes un plazo de **15 días hábiles** para reponer el elemento por uno exactamente idéntico o de características superiores (marca, modelo, estado).\n3. ❌ **Sanción Temporal:** Mientras no se realice la reposición física del elemento, tu cuenta de préstamos permanecerá suspendida de forma temporal.\n\n*¡La honestidad y el reporte oportuno evitan sanciones disciplinarias mayores en tu ficha académica!*`,
        type: 'text'
      };
    }

    // Registro o crear cuenta
    if (q.includes('registro') || q.includes('registrar') || q.includes('crear cuenta') || q.includes('crear usuario') || q.includes('registrarse')) {
      return {
        text: `👤 **Cómo registrarse en la plataforma:**\n\nSi eres un nuevo aprendiz, instructor o administrativo y no tienes cuenta:\n\n1. 🌐 Dirígete a la página de inicio o haz clic en **"Crear Cuenta"** en la esquina superior derecha.\n2. 📝 Completa el formulario de registro con tus datos reales:\n   *   Nombre completo\n   *   Documento de identidad (Cédula o Tarjeta de Identidad)\n   *   Correo electrónico institucional o personal\n   *   Número de ficha (obligatorio para Aprendices)\n   *   Rol (Aprendiz, Instructor o Administrativo)\n3. 🔒 Define una contraseña segura y haz clic en **"Registrarse"**.\n\n*Nota: Tu cuenta se activará de forma inmediata para consultar el catálogo, pero tus solicitudes de préstamo físico serán aprobadas por el personal tras validar tu documento.*`,
        type: 'text'
      };
    }

    // Iniciar sesión
    if (q.includes('iniciar sesión') || q.includes('iniciar sesion') || q.includes('login') || q.includes('entrar') || q.includes('ingresar') || q.includes('sesión') || q.includes('sesion')) {
      return {
        text: `🔑 **Cómo iniciar sesión en la plataforma:**\n\n1. 🌐 Haz clic en **"Iniciar Sesión"** en la barra superior derecha.\n2. 👤 Introduce tu correo registrado o tu número de documento de identidad.\n3. 🔒 Escribe tu contraseña de seguridad.\n4. 🚀 Haz clic en el botón **"Ingresar"**.\n\n*Si experimentas algún error de credenciales inactivas o problemas con el servidor, recuerda que puedes navegar por el catálogo en modo "Invitado", pero necesitarás iniciar sesión para agendar tus reservas.*`,
        type: 'text'
      };
    }

    // Quiénes pueden usar / Requisitos
    if (q.includes('quienes') || q.includes('quiénes') || q.includes('requisito') || q.includes('requisitos') || q.includes('pueden') || q.includes('puedo pedir')) {
      return {
        text: `🎓 **¿Quiénes pueden solicitar préstamos de biblioteca y almacén?**\n\nEl servicio está habilitado para toda la comunidad educativa de la Sede Vélez:\n\n*   **Aprendices:** Con matrícula activa en cualquier programa de formación (Técnico, Tecnólogo o Especialización).\n*   **Instructores:** Con contrato vigente en el centro de formación.\n*   **Administrativos:** Personal de apoyo y coordinadores del centro.\n\n⚠️ **Requisitos obligatorios:**\n1. Tener una cuenta registrada y activa en la plataforma.\n2. Presentar tu carnet del SENA o documento de identidad físico al retirar el elemento.\n3. No poseer sanciones pendientes o préstamos vencidos en tu cuenta.`,
        type: 'text'
      };
    }

    // Fallback response with hints
    return {
      text: `Entiendo tu inquietud, pero no tengo una respuesta exacta registrada en mi base de conocimientos para esa pregunta. 🧐\n\n¿Por qué no pruebas preguntándome sobre **cómo cambiar mi contraseña, qué hacer si perdí algo, requisitos de préstamo, o cómo iniciar sesión**?`,
      type: 'text'
    };
  };

  const handleEscalateToSupport = async (msgId: string, userQuery: string, aiResponse: string) => {
    if (!isApprentice || isGuest) return;
    setEscalating(msgId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/chat/escalate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_query: userQuery,
          ai_response: aiResponse,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al escalar.');
      }
      const data = await res.json();

      // Marcar el mensaje como ya escalado en el thread actual
      const updatedThreads = threads.map((t) => {
        if (t.id !== activeThreadId) return t;
        return {
          ...t,
          messages: t.messages.map((m) =>
            m.id === msgId
              ? { ...m, escalated: { ticketId: data.ticket_id }, suggestSupport: false }
              : m
          ),
          updatedAt: new Date().toISOString(),
        };
      });
      setThreads(updatedThreads);
      saveThreadsToStorage(updatedThreads);

      // Confirmar y ofrecer ir a Solicitudes
      const goNow = confirm(
        `${data.message}\n\nTu ticket #${data.ticket_id} fue creado. ¿Quieres ir a "Solicitudes" para esperar la respuesta?`
      );
      if (goNow) {
        navigate('/dashboard/solicitudes');
      }
    } catch (err: any) {
      alert(err.message || 'No se pudo crear la solicitud.');
    } finally {
      setEscalating(null);
    }
  };

  const clearChat = () => {
    if (!activeThreadId) return;
    const defaultMsg: Message = {
      id: 'reset_' + Date.now(),
      sender: 'bot',
      text: `¡Hola **${userName}**! 👋 ¿En qué puedo ayudarte hoy?`,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    const updatedThreads = threads.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          title: 'Nueva conversación',
          messages: [defaultMsg],
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });
    setThreads(updatedThreads);
    saveThreadsToStorage(updatedThreads);
  };

  return (
    <div className="assistant-wrapper fade-in">
      {/* HEADER SECTION */}
      <div className="assistant-header">
        <div className="header-info">
          <button 
            type="button" 
            className={`sidebar-toggle-btn ${isSidebarOpen ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? "Ocultar historial" : "Mostrar historial"}
          >
            <FiMessageSquare size={18} className="toggle-icon-svg" />
          </button>
          <div className="header-icon-box" style={{ background: 'var(--sena-green)' }}>
            <AnimatedRobotIcon className="glowing-icon" size="26px" style={{ color: '#ffffff' }} />
          </div>
          <div>
            <h1>Asistente Personal Inteligente</h1>
            <p>Soporte autónomo e información en tiempo real de Biblioteca & Almacén SENA</p>
          </div>
        </div>
        <button className="clear-chat-btn" onClick={clearChat} title="Restablecer chat actual">
          <FiTrash2 size={16} /> <span>Restablecer Chat</span>
        </button>
      </div>

      <div className="assistant-main-container">
        {/* CHAT HISTORY SIDEBAR (ChatGPT Style) */}
        <div className={`chat-history-sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
          <button className="new-chat-btn" onClick={handleCreateNewChat}>
            <FiPlus size={16} />
            <span>Nueva conversación</span>
          </button>
          
          <div className="threads-list">
            <div className="sidebar-group-title">Historial de chats</div>
            {threads.map((t) => (
              <div 
                key={t.id} 
                className={`thread-item-wrapper ${t.id === activeThreadId ? 'active' : ''}`}
                onClick={() => setActiveThreadId(t.id)}
              >
                <div className="thread-item-left">
                  <FiMessageSquare size={14} className="thread-icon" />
                  <span className="thread-title-text">{t.title}</span>
                </div>
                <button 
                  className="delete-thread-btn" 
                  onClick={(e) => handleDeleteChat(e, t.id)}
                  title="Eliminar conversación"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="chat-interface-card">
          <div className="messages-scroller">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-bubble-wrapper ${msg.sender}`}>
                {msg.sender === 'bot' && (
                  <div className="bot-avatar-wrapper">
                    <AnimatedRobotIcon className="bot-chat-avatar" />
                  </div>
                )}
                
                <div className="message-content-box">
                  <div className="message-text">
                    {msg.media && (
                      msg.media.type === 'image' ? (
                        <img src={msg.media.preview} alt="Attached" className="chat-image-attachment" />
                      ) : (
                        <audio src={msg.media.preview} controls className="chat-audio-attachment" />
                      )
                    )}
                    {msg.text.split('\n').map((paragraph, pIdx) => {
                      const parts = paragraph.split(/\*\*([^*]+)\*\*/g);
                      return (
                        <p key={pIdx}>
                          {parts.map((part, partIdx) => {
                            if (partIdx % 2 === 1) {
                              return <strong key={partIdx}>{renderTextWithAppleEmojis(part)}</strong>;
                            }
                            return renderTextWithAppleEmojis(part);
                          })}
                        </p>
                      );
                    })}
                  </div>

                  {/* ESCALACIÓN A SOPORTE — visible solo para aprendices cuando la IA no pudo ayudar */}
                  {msg.sender === 'bot' && msg.suggestSupport && !msg.escalated && (
                    <div className="support-escalation-box">
                      <div className="support-escalation-text">
                        <FiHeadphones size={16} />
                        <span>¿Quieres que un agente de <strong>Soporte Técnico</strong> te ayude con esto?</span>
                      </div>
                      <button
                        className="support-escalation-btn"
                        onClick={() => handleEscalateToSupport(msg.id, msg.userQueryRef || '', msg.text)}
                        disabled={escalating === msg.id || !msg.userQueryRef}
                      >
                        {escalating === msg.id ? 'Creando solicitud...' : 'Sí, hablar con Soporte'}
                      </button>
                    </div>
                  )}

                  {msg.escalated && (
                    <div className="support-escalation-done">
                      <FiCheckCircle size={14} /> Solicitud #{msg.escalated.ticketId} creada. Revisa tu sección <strong>Solicitudes</strong>.
                    </div>
                  )}

                  {/* CUSTOM COMPONENT: LOANS LIST */}
                  {msg.type === 'loans' && msg.metadata && (
                    <div className="chat-loans-list">
                      {msg.metadata.map((loan: any, idx: number) => (
                        <div key={idx} className="chat-loan-card">
                          <div className="loan-card-top">
                            <span className={`loan-status-tag ${loan.status === 'OVERDUE' ? 'danger' : 'success'}`}>
                              {loan.status === 'OVERDUE' ? 'Atrasado' : 'Activo'}
                            </span>
                            <span className="loan-date-text">
                              Vence: {new Date(loan.due_date).toLocaleDateString('es-CO')}
                            </span>
                          </div>
                          
                          {loan.items && loan.items.map((item: any, itemIdx: number) => (
                            <div key={itemIdx} className="loan-card-item-row">
                              <div className="item-img-placeholder">
                                {item.image_url ? (
                                  <img src={item.image_url} alt={item.name} />
                                ) : (
                                  <FiBookOpen size={16} />
                                )}
                              </div>
                              <div className="item-details">
                                <span className="item-title">{item.name}</span>
                                <span className="item-code">Código: {item.code}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-bubble-wrapper bot">
                <div className="bot-avatar-wrapper typing-active">
                  <AnimatedRobotIcon className="bot-chat-avatar typing-bounce" />
                </div>
                <div className="message-content-box typing-box">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>


          {/* MEDIA PREVIEW */}
          {attachedMedia && (
            <div className="media-preview-container">
              {attachedMedia.type === 'image' ? (
                <div className="media-preview-box">
                  <img src={attachedMedia.preview} alt="Preview" />
                  <button type="button" className="remove-media-btn" onClick={() => setAttachedMedia(null)}><FiX /></button>
                </div>
              ) : (
                <div className="media-preview-box" style={{ width: 'auto', background: 'transparent', border: 'none' }}>
                  <audio src={attachedMedia.preview} controls style={{ height: 30 }} />
                  <button type="button" className="remove-media-btn" style={{ position: 'relative', marginLeft: 8 }} onClick={() => setAttachedMedia(null)}><FiX /></button>
                </div>
              )}
            </div>
          )}

          {/* INPUT BAR */}
          <form 
            className="chat-input-bar" 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
          >
            <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} />
            <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} ref={cameraInputRef} onChange={handleFileUpload} />
            
            <button type="button" className="attachment-btn" title="Subir imagen" onClick={() => fileInputRef.current?.click()} disabled={isTyping}>
              <FiImage size={18} />
            </button>
            <button type="button" className="attachment-btn" title="Tomar foto" onClick={() => cameraInputRef.current?.click()} disabled={isTyping}>
              <FiCamera size={18} />
            </button>
            <button type="button" className={`attachment-btn ${isRecording ? 'recording' : ''}`} title="Grabar audio" onClick={toggleRecording} disabled={isTyping}>
              <FiMic size={18} />
            </button>

            <input
              type="text"
              placeholder="Hazme una pregunta sobre biblioteca, herramientas, horarios..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" className="send-msg-btn" disabled={!inputText.trim() || isTyping}>
              <FiSend size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
