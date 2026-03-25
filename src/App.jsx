import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, XCircle, RotateCcw, Loader2, FileText, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut', when: 'beforeChildren' } },
  exit: { opacity: 0, scale: 0.98, y: -20, transition: { duration: 0.3 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  hover: { scale: 1.05, y: -2, transition: { type: 'spring', stiffness: 400, damping: 10 } }
};

function App() {
  const [step, setStep] = useState('landing'); // landing, upload, loading, post-analysis, results
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload a resume.");
      return;
    }
    if (!jdText.trim()) {
      setError("Please provide a job description.");
      return;
    }

    setStep('loading');
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jd_text', jdText);

    try {
      const response = await fetch('https://resume-match-ai.onrender.com/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errMessage = `Server responded with ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.detail) errMessage = errData.detail;
        } catch (e) { }
        throw new Error(errMessage);
      }

      const data = await response.json();
      setResult(data);
      setTimeout(() => {
        setStep('post-analysis');
      }, 800); // Artificial delay to let user see the cool loading spinner briefly
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to analyze resume. Please try again or check your connection.");
      setStep('upload'); // return to upload on error
    }
  };

  const handleReset = () => {
    setFile(null);
    setJdText('');
    setResult(null);
    setError(null);
    setStep('landing');
  };

  const renderScoreCircle = (score) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
          <circle cx="70" cy="70" r={radius} fill="transparent" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="12" />
          <motion.circle
            cx="70" cy="70" r={radius} fill="transparent" stroke="var(--success)" strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))' }}
          />
        </svg>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5, type: 'spring' }}
          style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div className="score-value" style={{ margin: 0, lineHeight: 1 }}>{Math.round(score)}<span style={{ fontSize: '1.2rem' }}>%</span></div>
          <div className="score-label" style={{ position: 'static', marginTop: '4px' }}>Match</div>
        </motion.div>
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">

      {/* 1. LANDING SCREEN */}
      {step === 'landing' && (
        <motion.div key="landing" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="landing-wrapper">

          <div className="landing-content" style={{ display: 'flex', flexDirection: 'column' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', padding: '6px 14px', borderRadius: '20px', color: '#a5b4fc', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <Sparkles size={16} /> AI-Powered Resume Matcher
              </div>
              <h1 style={{ fontSize: '2.6rem', fontWeight: 800, margin: 0, lineHeight: 1.2, background: 'linear-gradient(to right, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
                Match Your Resume to Any Job in Seconds
              </h1>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text-dim)', marginTop: '0.75rem', marginBottom: '1.5rem' }}>
                Instantly compare your resume against any job description. Uncover your strengths, calculate your real match score, and identify critical skill gaps.
              </p>
            </motion.div>

            <motion.div
              initial="hidden" animate="visible" variants={staggerContainer}
              style={{ display: 'flex', flexDirection: 'column', marginBottom: '2.5rem' }}
            >
              {[
                "Instant AI match score prediction",
                "Deep skill gap & keyword analysis",
                "Actionable tailoring suggestions",
                "Dramatically improved shortlist chances"
              ].map((text, i) => (
                <motion.div key={i} variants={chipVariants} className="landing-bullet">
                  <CheckCircle2 color="var(--success)" size={22} style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.3))' }} /> {text}
                </motion.div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(99,102,241,0.5)', backgroundColor: 'var(--primary-hover)' }}
                whileTap={{ scale: 0.95 }}
                className="btn"
                onClick={() => setStep('upload')}
                style={{ padding: '0.9rem 1.25rem', fontSize: '1.05rem', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%', maxWidth: '300px' }}
              >
                Let’s Begin <ArrowRight size={20} />
              </motion.button>

              <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Loader2 size={16} /> Takes less than 2 minutes</span>
                <span style={{ width: '4px', height: '4px', background: 'var(--text-dim)', borderRadius: '50%' }}></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={16} color="var(--success)" /> Used by 10,000+ candidates</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
            className="mock-ui"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)', fontWeight: 700 }}>Analysis Preview</h3>
                <span style={{ fontSize: '0.9rem', color: '#a5b4fc', fontWeight: 500 }}>Senior React Developer</span>
              </div>
              <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '10px 16px', borderRadius: '16px', fontWeight: 800, fontSize: '1.3rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                88% Match
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.75rem' }}>Core Strengths Found</strong>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="tag matched" style={{ fontSize: '0.85rem' }}><CheckCircle2 size={14} /> React</span>
                <span className="tag matched" style={{ fontSize: '0.85rem' }}><CheckCircle2 size={14} /> Framer Motion</span>
                <span className="tag matched" style={{ fontSize: '0.85rem' }}><CheckCircle2 size={14} /> Node.js</span>
              </div>
            </div>

            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.75rem' }}>Critical Missing Skills</strong>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="tag missing" style={{ fontSize: '0.85rem' }}><XCircle size={14} /> GraphQL</span>
                <span className="tag missing" style={{ fontSize: '0.85rem' }}><XCircle size={14} /> Docker</span>
              </div>
            </div>
          </motion.div>

        </motion.div>
      )}

      {/* 2. UPLOAD SCREEN */}
      {step === 'upload' && (
        <motion.div key="upload" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="container" style={{ maxWidth: '680px' }}>
          <div className="header" style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ letterSpacing: '-0.02em', fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(to right, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem', lineHeight: 1.2 }}>
              Boost Your Chances of Getting Shortlisted
            </h1>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-dim)', maxWidth: '500px', margin: '0 auto 1.25rem auto' }}>
              Compare your resume with any job description and get instant match score
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <Sparkles size={14} /> Start your analysis in seconds
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="error-message" style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 0' }}>
                  <AlertCircle size={18} /> {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Resume (PDF, DOCX, TXT)</label>
              <div className="file-drop-area-wrapper">
                <motion.div
                  className="file-drop-area"
                  whileHover={{ scale: 1.01, borderColor: 'var(--primary)', backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                  whileTap={{ scale: 0.99 }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  style={{ position: 'relative' }}
                >
                  <AnimatePresence mode="wait">
                    {file ? (
                      <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                        <FileText size={40} color="var(--primary)" style={{ margin: '0 auto' }} />
                        <div className="file-name">{file.name}</div>
                        <div className="file-drop-text" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          Click or drag to replace
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="nofile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                          <UploadCloud size={40} color="var(--text-dim)" style={{ margin: '0 auto' }} />
                        </motion.div>
                        <div className="file-drop-text">
                          Drag & Drop or <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Browse</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <input
                    type="file"
                    className="file-input"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                  />
                </motion.div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Job Description</label>
              <motion.textarea
                whileFocus={{ scale: 1.01, borderColor: 'var(--primary)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                placeholder="Paste the raw text of the target job description..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                style={{ minHeight: '120px' }}
              ></motion.textarea>
            </div>

            <motion.button
              type="submit"
              className="btn"
              disabled={!file || !jdText.trim()}
              whileHover={(!file || !jdText.trim()) ? {} : { scale: 1.02, boxShadow: '0 8px 25px rgba(99,102,241,0.5)' }}
              whileTap={(!file || !jdText.trim()) ? {} : { scale: 0.96 }}
              style={{ marginTop: '0.5rem', borderRadius: '14px', padding: '1rem' }}
            >
              Analyze Match <Sparkles size={18} />
            </motion.button>
          </form>
        </motion.div>
      )}

      {/* 3. PROCESSING STATE */}
      {step === 'loading' && (
        <motion.div key="loading" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="container" style={{ maxWidth: '480px' }}>
          <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              style={{ display: 'inline-block', marginBottom: '2rem', background: 'conic-gradient(from 90deg at 50% 50%, transparent 0%, var(--primary) 100%)', borderRadius: '50%', padding: '4px' }}
            >
              <div style={{ background: 'var(--surface)', borderRadius: '50%', padding: '14px' }}>
                <Loader2 color="var(--primary)" size={36} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="loading-text"
              style={{ fontSize: '1.25rem', fontWeight: 600 }}
            >
              Analyzing your data...
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ color: 'var(--text-dim)', marginTop: '0.75rem', fontSize: '1rem', textAlign: 'center' }}>
              We're evaluating required technologies and preferred skills using advanced AI.
            </motion.p>
          </div>
        </motion.div>
      )}

      {/* 4. POST-ANALYSIS CONFIRMATION */}
      {step === 'post-analysis' && (
        <motion.div key="post-analysis" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="container" style={{ maxWidth: '500px', textAlign: 'center', padding: '4rem 3rem' }}>
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.1, bounce: 0.5 }}
            style={{ display: 'inline-flex', background: 'var(--success-bg)', padding: '24px', borderRadius: '50%', marginBottom: '2rem' }}
          >
            <CheckCircle2 color="var(--success)" size={50} />
          </motion.div>

          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Analysis Complete</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Success! We've cross-referenced your capabilities against the job description and compiled actionable insights.
          </p>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 8px 25px rgba(99,102,241,0.4)', backgroundColor: 'var(--primary-hover)' }}
            whileTap={{ scale: 0.96 }}
            className="btn"
            onClick={() => setStep('results')}
            style={{ padding: '1.2rem', fontSize: '1.2rem', width: '100%', borderRadius: '16px' }}
          >
            View Results <ArrowRight size={22} />
          </motion.button>
        </motion.div>
      )}

      {/* 5. RESULTS SCREEN */}
      {step === 'results' && result && (
        <motion.div key="results" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="container">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="header">
            <h1>Match Summary</h1>
            <p>Here are your key highlights and actionable recommendations.</p>
          </motion.div>

          <div className="results-container">
            <div className="score-wrapper">
              {renderScoreCircle(result.score || 0)}
            </div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="skills-section">
              <h3 className="skills-header matched">
                <CheckCircle2 size={20} /> Highlighted Matches
              </h3>
              <div className="tags-container">
                {result.matched && result.matched.length > 0 ? (
                  result.matched.map((skill, idx) => (
                    <motion.span key={idx} variants={chipVariants} whileHover="hover" className="tag matched">
                      {skill}
                    </motion.span>
                  ))
                ) : (
                  <motion.span variants={chipVariants} style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No direct skill matches found.</motion.span>
                )}
              </div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="skills-section">
              <h3 className="skills-header missing">
                <XCircle size={20} /> Actionable Gaps
              </h3>
              <div className="tags-container">
                {result.missing && result.missing.length > 0 ? (
                  result.missing.map((skill, idx) => (
                    <motion.span key={idx} variants={chipVariants} whileHover="hover" className="tag missing">
                      {skill}
                    </motion.span>
                  ))
                ) : (
                  <motion.span variants={chipVariants} style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Great job! You have all the core skills.</motion.span>
                )}
              </div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="skills-section" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
              <h3 className="skills-header" style={{ color: 'var(--text)' }}>
                Deep Data Insights
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                {result.resume_data && (
                  <motion.div variants={chipVariants}>
                    <strong style={{ color: '#a5b4fc', display: 'block', marginBottom: '4px' }}>Your Target Experience</strong>
                    {result.resume_data.experience_years !== undefined ? `${result.resume_data.experience_years} years recorded` : 'N/A'}
                  </motion.div>
                )}
                {result.jd_data && (
                  <motion.div variants={chipVariants}>
                    <strong style={{ color: '#a5b4fc', display: 'block', marginBottom: '4px' }}>Market Requirement</strong>
                    {result.jd_data.experience_required || 'Not strictly specified'}
                  </motion.div>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 25px rgba(99,102,241,0.3)', backgroundColor: 'rgba(99, 102, 241, 0.15)' }}
                whileTap={{ scale: 0.96 }}
                className="btn btn-secondary"
                onClick={handleReset}
                style={{ marginTop: '2rem', padding: '1.2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', borderRadius: '16px' }}
              >
                <RotateCcw size={20} /> Start Over
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}

    </AnimatePresence>
  );
}

export default App;
