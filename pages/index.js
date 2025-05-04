import { useState } from 'react';

const categories = [
  { key: 'moda', label: 'Moda' },
  { key: 'historia', label: 'Historia' },
  { key: 'ciencia', label: 'Ciencia' },
  { key: 'deporte', label: 'Deporte' },
  { key: 'arte', label: 'Arte' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://parcial2-back-jet.vercel.app/api';

export default function Home() {
  const [category, setCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [user, setUser] = useState('anonimo');
  const [loading, setLoading] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [error, setError] = useState(null);

  const getQuestions = async (cat) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setSelected(null);
    setCategory(cat);
    setCurrentQuestionIndex(0);
    setFinalScore(null);
    
    try {
      const res = await fetch(`${API_URL}/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat }),
      });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else if (data.question) {
        // Compatibilidad con formato anterior de una sola pregunta
        setQuestions([data]);
      } else {
        console.error('Formato de respuesta inesperado:', data);
        setError('Formato de respuesta inesperado del servidor');
      }
    } catch (err) {
      console.error('Error obteniendo preguntas:', err);
      setError(`Error obteniendo preguntas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendAnswer = async () => {
    if (!selected) return;
    
    setLoading(true);
    setError(null);
    const currentQuestion = questions[currentQuestionIndex];
    
    try {
      const res = await fetch(`${API_URL}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          category,
          question: currentQuestion.question,
          options: currentQuestion.options,
          selected,
          correct: currentQuestion.answer,
        }),
      });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // Guardar resultado de esta pregunta
      const newResults = [...results, {
        question: currentQuestion.question,
        selected,
        correct: currentQuestion.answer,
        isCorrect: data.isCorrect,
        score: data.score
      }];
      setResults(newResults);
      
      // Avanzar a la siguiente pregunta o mostrar resultados finales
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelected(null);
      } else {
        // Calcular puntaje final
        const totalScore = newResults.reduce((sum, result) => sum + result.score, 0);
        setFinalScore(totalScore);
        
        // Guardar la sesión completa
        try {
          const sessionRes = await fetch(`${API_URL}/save-quiz-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user,
              category,
              questions,
              results: newResults,
              totalScore
            }),
          });
          
          if (!sessionRes.ok) {
            throw new Error(`Error ${sessionRes.status}: ${sessionRes.statusText}`);
          }
          
          const sessionData = await sessionRes.json();
          setSessionSaved(true);
          console.log('Sesión guardada:', sessionData);
        } catch (sessionError) {
          console.error('Error al guardar sesión:', sessionError);
          setError(`Error al guardar sesión: ${sessionError.message}`);
        }
      }
    } catch (err) {
      console.error('Error enviando respuesta:', err);
      setError(`Error enviando respuesta: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Quiz de Categorías</h1>
      
      {error && (
        <div style={{ 
          padding: '10px 15px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div style={{ marginBottom: 16 }}>
        <label>Usuario: </label>
        <input 
          value={user} 
          onChange={e => setUser(e.target.value)} 
          placeholder="Tu nombre" 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>
      
      {!category && (
        <div>
          <h2>Elige una categoría:</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => getQuestions(cat.key)}
                style={{ 
                  padding: '12px 20px', 
                  fontSize: '16px', 
                  backgroundColor: '#2196f3', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                disabled={loading}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {loading && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <p>Cargando...</p>
        </div>
      )}
      
      {currentQuestion && !finalScore && (
        <div>
          <h2>Pregunta {currentQuestionIndex + 1} de {questions.length}</h2>
          <h3>{currentQuestion.question}</h3>
          <div>
            {currentQuestion.options && currentQuestion.options.map((opt, idx) => (
              <div 
                key={idx} 
                style={{ 
                  margin: '10px 0', 
                  padding: '12px', 
                  border: selected === String.fromCharCode(65 + idx) 
                    ? '2px solid #2196f3' 
                    : '1px solid #eee', 
                  borderRadius: '4px',
                  backgroundColor: selected === String.fromCharCode(65 + idx) ? '#e3f2fd' : 'white'
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="option"
                    value={String.fromCharCode(65 + idx)}
                    checked={selected === String.fromCharCode(65 + idx)}
                    onChange={() => setSelected(String.fromCharCode(65 + idx))}
                    disabled={loading}
                    style={{ marginRight: '10px' }}
                  />
                  <span><strong>{String.fromCharCode(65 + idx)}.</strong> {opt}</span>
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={sendAnswer}
            disabled={!selected || loading}
            style={{ 
              marginTop: '20px', 
              padding: '12px 20px', 
              backgroundColor: !selected || loading ? '#cccccc' : '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: !selected || loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Siguiente pregunta' : 'Ver resultados'}
          </button>
        </div>
      )}
      
      {finalScore !== null && (
        <div style={{ marginTop: 24 }}>
          <h2>Resultados finales</h2>
          <p style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            padding: '15px',
            backgroundColor: '#e8f5e9',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            Puntaje total: {finalScore} de {questions.length}
          </p>
          
          {sessionSaved && (
            <p style={{ 
              color: 'green', 
              fontWeight: 'bold',
              textAlign: 'center',
              margin: '15px 0'
            }}>
              ✓ Sesión guardada en la base de datos
            </p>
          )}
          
          <h3>Detalle de respuestas:</h3>
          {results.map((result, idx) => (
            <div key={idx} style={{ 
              margin: '15px 0', 
              padding: '15px', 
              borderRadius: '4px',
              backgroundColor: result.isCorrect ? '#e8f5e9' : '#ffebee',
              border: result.isCorrect ? '1px solid #a5d6a7' : '1px solid #ffcdd2'
            }}>
              <p><strong>Pregunta {idx + 1}:</strong> {result.question}</p>
              <p>Tu respuesta: {result.selected} - {result.isCorrect ? '✓ Correcta' : '✗ Incorrecta'}</p>
              {!result.isCorrect && <p>Respuesta correcta: {result.correct}</p>}
            </div>
          ))}
          
          <button
            onClick={() => {
              setCategory(null);
              setQuestions([]);
              setResults([]);
              setSelected(null);
              setFinalScore(null);
              setSessionSaved(false);
              setError(null);
            }}
            style={{ 
              marginTop: '20px', 
              padding: '12px 20px', 
              backgroundColor: '#2196f3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '16px',
              width: '100%'
            }}
          >
            Iniciar nuevo quiz
          </button>
        </div>
      )}
    </div>
  );
}
