import React, { useState, useEffect, useRef } from 'react';
import { 
  FiSend, FiCpu, FiBookOpen, FiTool, 
  FiClock, FiAlertCircle, FiTrash2, FiInfo, FiCheckCircle, FiPlus, FiMessageSquare
} from 'react-icons/fi';
import { AnimatedRobotIcon } from '../../../components/ui/AnimatedRobotIcon';
import './PersonalAssistant.css';

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
}

interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

export const PersonalAssistant: React.FC<PersonalAssistantProps> = ({ user }) => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [userLoans, setUserLoans] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputText, setInputText] = useState('');

  
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
    if (stored) {
      try {
        const parsed: ChatThread[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setThreads(parsed);
          setActiveThreadId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error("Error parsing chat threads:", e);
      }
    }

    // Initialize with a default thread if empty
    const initialId = 'thread_' + Date.now();
    const defaultMsg: Message = {
      id: 'welcome_' + Date.now(),
      sender: 'bot',
      text: `¡Hola **${userName}**! 👋 ¿En qué puedo ayudarte hoy?`,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    const defaultThread: ChatThread = {
      id: initialId,
      title: 'Nueva conversación',
      messages: [defaultMsg],
      updatedAt: new Date().toISOString()
    };
    setThreads([defaultThread]);
    setActiveThreadId(initialId);
  }, [userName]);

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
      timestamp: new Date().toISOString()
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
    setIsTyping(true);
    saveThreadsToStorage(updatedThreads);

    // Simulate thinking/typing delay
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
        text: `¡Por supuesto! He consultado la base de datos en tiempo real y encontré que tienes **${activeLoans.length} préstamo(s) activo(s)**. Aquí tienes el detalle de los elementos bajo tu custodia:`,
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

    // Fallback response with hints
    return {
      text: `Entiendo tu inquietud, pero no tengo una respuesta exacta registrada en mi base de conocimientos para esa pregunta. 🧐\n\n¿Por qué no pruebas con una de nuestras consultas rápidas haciendo clic en los botones de abajo? También puedes preguntarme sobre **préstamos activos, horarios de atención, retrasos o cómo reservar elementos** en el catálogo.`,
      type: 'text'
    };
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
          <div className="header-icon-box">
            <FiCpu size={24} className="glowing-icon" />
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
                    {msg.text.split('\n').map((paragraph, pIdx) => {
                      const parts = paragraph.split(/\*\*([^*]+)\*\*/g);
                      return (
                        <p key={pIdx}>
                          {parts.map((part, partIdx) => {
                            if (partIdx % 2 === 1) {
                              return <strong key={partIdx}>{part}</strong>;
                            }
                            return part;
                          })}
                        </p>
                      );
                    })}
                  </div>

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


          {/* INPUT BAR */}
          <form 
            className="chat-input-bar" 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
          >
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
