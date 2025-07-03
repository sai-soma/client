import React, { useState, useRef } from 'react';
import { 
  FaUser, FaEnvelope, FaPhone, FaLinkedin, 
  FaGraduationCap, FaBriefcase, FaCode, 
  FaTrophy, FaFileAlt, FaEdit, FaGlobe, 
  FaPlus, FaMinus, FaFileDownload, FaEye,
  FaArrowLeft, FaArrowRight, FaCheck, FaCamera,
  FaTrash, FaImage
} from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './ResumeBuilder.css';

const resumeTemplates = [
  { 
    id: 1, name: 'Modern Professional', primaryColor: '#3498db', secondaryColor: '#2ecc71',
    backgroundColor: '#f8f9fa', fontFamily: "'Poppins', Tahoma, Geneva, Verdana, sans-serif",
    headerStyle: 'modern', sectionStyle: 'border-left'
  },
  { 
    id: 2, name: 'Classic Elegant', primaryColor: '#34495e', secondaryColor: '#e74c3c',
    backgroundColor: '#ffffff', fontFamily: "'Times New Roman', Times, serif",
    headerStyle: 'classic', sectionStyle: 'border-bottom', supportProfilePic: true
  },
  { 
    id: 5, name: 'Academic Pro', primaryColor: '#2980b9', secondaryColor: '#8e44ad',
    backgroundColor: '#f8f9fa', fontFamily: "'Georgia', serif",
    headerStyle: 'academic', sectionStyle: 'border-bottom', layout: 'two-column', supportProfilePic: true
  },
  { 
    id: 6, name: 'Executive Minimal', primaryColor: '#2c3e50', secondaryColor: '#7f8c8d',
    backgroundColor: '#ffffff', fontFamily: "'Montserrat', sans-serif",
    headerStyle: 'minimal', sectionStyle: 'border-bottom', layout: 'two-column', supportProfilePic: true
  },
  { 
    id: 7, name: 'Professional Timeline', primaryColor: '#16a085', secondaryColor: '#f39c12',
    backgroundColor: '#ffffff', fontFamily: "'Lato', sans-serif",
    headerStyle: 'classic', sectionStyle: 'timeline', layout: 'timeline'
  }
];

const initialFormState = {
  personalInfo: { fullName: '', email: '', mobile: '', linkedin: '', location: '', profilePic: null },
  profileSummary: '',
  education: [{ stream: '', degree: '', institution: '', startYear: '', endYear: '', cgpa: '' }],
  workExperience: [{ jobTitle: '', company: '', startDate: '', endDate: '', responsibilities: '' }],
  skills: [''],
  projects: [{ title: '', description: '', technologies: '' }],
  achievements: [''],
  languages: ['']
};

const formPages = [
  { id: 'personal', title: 'Personal Information & Profile', icon: <FaUser /> },
  { id: 'education', title: 'Education', icon: <FaGraduationCap /> },
  { id: 'experience', title: 'Work Experience', icon: <FaBriefcase /> },
  { id: 'skills', title: 'Skills', icon: <FaCode /> },
  { id: 'projects', title: 'Projects', icon: <FaFileAlt /> },
  { id: 'achievements', title: 'Achievements & Languages', icon: <FaTrophy /> }
];

const ResumeBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [showPreview, setShowPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const resumeRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e, section, index = null) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedState = { ...prev };
      if (index !== null) {
        if (Array.isArray(updatedState[section])) {
          updatedState[section][index][name] = value;
        } else {
          updatedState[section][index] = value;
        }
      } else if (section === 'personalInfo') {
        updatedState.personalInfo[name] = value;
      } else {
        updatedState[section] = value;
      }
      return updatedState;
    });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, profilePic: event.target.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePic = () => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, profilePic: null }
    }));
  };

  const addSection = (section) => {
    const newItem = section === 'education' 
      ? { stream: '', degree: '', institution: '', startYear: '', endYear: '', cgpa: '' }
      : section === 'workExperience'
        ? { jobTitle: '', company: '', startDate: '', endDate: '', responsibilities: '' }
        : section === 'projects'
          ? { title: '', description: '', technologies: '' }
          : '';
    
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  const removeSection = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const downloadPDF = async () => {
    const input = resumeRef.current;
    input.classList.add('pdf-export');

    try {
      const canvas = await html2canvas(input, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
        windowWidth: input.scrollWidth, windowHeight: input.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px', format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${formData.personalInfo.fullName || 'resume'}_Resume.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('PDF generation failed. Check console for details.');
    } finally {
      input.classList.remove('pdf-export');
    }
  };

  const renderInput = (label, name, type = 'text', section = 'personalInfo', index = null, isTextarea = false) => (
    <div className="rbc-input-group">
      <label className="rbc-input-label">{label}</label>
      {isTextarea ? (
        <textarea
          name={name}
          value={index !== null ? formData[section][index][name] : formData[section][name]}
          onChange={(e) => handleInputChange(e, section, index)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="rbc-textarea"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={index !== null ? formData[section][index][name] : formData[section][name]}
          onChange={(e) => handleInputChange(e, section, index)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="rbc-input-field"
        />
      )}
    </div>
  );

  const renderArrayInput = (section, label, index) => (
    <div className="rbc-dynamic-section">
      <div className="rbc-input-group">
        <input
          type="text"
          value={formData[section][index]}
          onChange={(e) => {
            const newArray = [...formData[section]];
            newArray[index] = e.target.value;
            setFormData(prev => ({ ...prev, [section]: newArray }));
          }}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="rbc-input-field"
        />
        {index > 0 && (
          <button onClick={() => removeSection(section, index)} className="rbc-btn rbc-btn-remove">
            <FaMinus /> Remove
          </button>
        )}
      </div>
    </div>
  );

  const renderSection = (title, icon, children, addText, onAdd) => (
    <div className="rbc-form-section">
      <h2 className="rbc-section-title">{icon} {title}</h2>
      {children}
      <button onClick={onAdd} className="rbc-btn rbc-btn-add">
        <FaPlus /> {addText}
      </button>
    </div>
  );

  const renderFormPages = () => {
    const pages = [
      // Personal Info Page
      <div className="rbc-form-page">
        <div className="rbc-form-section">
          <h2 className="rbc-section-title"><FaUser /> Personal Information</h2>
          
          {selectedTemplate?.supportProfilePic && (
            <div className="rbc-profile-pic-section">
              <h3 className="rbc-subsection-title"><FaImage /> Profile Picture</h3>
              <div className="rbc-profile-pic-container">
                {formData.personalInfo.profilePic ? (
                  <div className="rbc-profile-pic-preview">
                    <img src={formData.personalInfo.profilePic} alt="Profile" className="rbc-profile-pic" />
                    <button onClick={removeProfilePic} className="rbc-btn rbc-btn-remove rbc-remove-pic">
                      <FaTrash />
                    </button>
                  </div>
                ) : (
                  <div className="rbc-profile-pic-placeholder" onClick={() => fileInputRef.current.click()}>
                    <FaCamera className="rbc-camera-icon" />
                    <span>Upload Photo</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePicChange}
                  accept="image/*"
                  className="rbc-file-input"
                />
              </div>
            </div>
          )}
          
          {renderInput('Full Name', 'fullName')}
          {renderInput('Email', 'email', 'email')}
          {renderInput('Mobile', 'mobile', 'tel')}
          {renderInput('LinkedIn', 'linkedin')}
          {renderInput('Location', 'location')}
        </div>

        <div className="rbc-form-section">
          <h2 className="rbc-section-title"><FaEdit /> Profile Summary</h2>
          {renderInput('Profile Summary', 'profileSummary', 'text', 'profileSummary', null, true)}
        </div>
      </div>,

      // Education Page
      <div className="rbc-form-page">
        {renderSection('Education', <FaGraduationCap />, 
          formData.education.map((edu, index) => (
            <div key={index} className="rbc-dynamic-section">
              {renderInput('Stream', 'stream', 'text', 'education', index)}
              {renderInput('Degree', 'degree', 'text', 'education', index)}
              {renderInput('Institution', 'institution', 'text', 'education', index)}
              {renderInput('Start Year', 'startYear', 'text', 'education', index)}
              {renderInput('End Year', 'endYear', 'text', 'education', index)}
              {renderInput('CGPA', 'cgpa', 'text', 'education', index)}
              {index > 0 && (
                <button onClick={() => removeSection('education', index)} className="rbc-btn rbc-btn-remove">
                  <FaMinus /> Remove
                </button>
              )}
            </div>
          )),
          'Add Education', () => addSection('education')
        )}
      </div>,

      // Work Experience Page
      <div className="rbc-form-page">
        {renderSection('Work Experience', <FaBriefcase />,
          formData.workExperience.map((work, index) => (
            <div key={index} className="rbc-dynamic-section">
              {renderInput('Job Title', 'jobTitle', 'text', 'workExperience', index)}
              {renderInput('Company', 'company', 'text', 'workExperience', index)}
              {renderInput('Start Date', 'startDate', 'text', 'workExperience', index)}
              {renderInput('End Date', 'endDate', 'text', 'workExperience', index)}
              {renderInput('Responsibilities', 'responsibilities', 'text', 'workExperience', index, true)}
              {index > 0 && (
                <button onClick={() => removeSection('workExperience', index)} className="rbc-btn rbc-btn-remove">
                  <FaMinus /> Remove
                </button>
              )}
            </div>
          )),
          'Add Work Experience', () => addSection('workExperience')
        )}
      </div>,

      // Skills Page
      <div className="rbc-form-page">
        {renderSection('Skills', <FaCode />,
          formData.skills.map((skill, index) => renderArrayInput('skills', 'skill', index)),
          'Add Skill', () => addSection('skills')
        )}
      </div>,

      // Projects Page
      <div className="rbc-form-page">
        {renderSection('Projects', <FaFileAlt />,
          formData.projects.map((project, index) => (
            <div key={index} className="rbc-dynamic-section">
              {renderInput('Project Title', 'title', 'text', 'projects', index)}
              {renderInput('Technologies', 'technologies', 'text', 'projects', index)}
              {renderInput('Description', 'description', 'text', 'projects', index, true)}
              {index > 0 && (
                <button onClick={() => removeSection('projects', index)} className="rbc-btn rbc-btn-remove">
                  <FaMinus /> Remove
                </button>
              )}
            </div>
          )),
          'Add Project', () => addSection('projects')
        )}
      </div>,

      // Achievements & Languages Page
      <div className="rbc-form-page">
        {renderSection('Achievements', <FaTrophy />,
          formData.achievements.map((achievement, index) => renderArrayInput('achievements', 'achievement', index)),
          'Add Achievement', () => addSection('achievements')
        )}
        
        {renderSection('Languages', <FaGlobe />,
          formData.languages.map((language, index) => renderArrayInput('languages', 'language', index)),
          'Add Language', () => addSection('languages')
        )}
      </div>
    ];

    return pages[currentPage];
  };

  const renderPreviewSection = (title, icon, children, className = '') => (
    children && (
      <div className={`rbc-preview-section ${className}`}>
        <h2 className="rbc-preview-section-title">{icon} {title}</h2>
        {children}
      </div>
    )
  );

  const renderPreview = () => {
    if (!selectedTemplate) return null;

    const templateStyle = {
      '--primary-color': selectedTemplate.primaryColor,
      '--secondary-color': selectedTemplate.secondaryColor,
      '--background-color': selectedTemplate.backgroundColor,
      'font-family': selectedTemplate.fontFamily
    };

    const headerClass = `rbc-preview-header-${selectedTemplate.headerStyle}`;
    const sectionClass = `rbc-preview-section-${selectedTemplate.sectionStyle}`;
    const layoutClass = selectedTemplate.layout || '';

    const contactInfo = (
      <div className="rbc-preview-contact">
        {formData.personalInfo.email && <div className="rbc-contact-item"><FaEnvelope /> {formData.personalInfo.email}</div>}
        {formData.personalInfo.mobile && <div className="rbc-contact-item"><FaPhone /> {formData.personalInfo.mobile}</div>}
        {formData.personalInfo.linkedin && <div className="rbc-contact-item"><FaLinkedin /> {formData.personalInfo.linkedin}</div>}
        {formData.personalInfo.location && <div className="rbc-contact-item"><FaGlobe /> {formData.personalInfo.location}</div>}
      </div>
    );

    const profileSection = (
      <div className="rbc-preview-personal">
        {selectedTemplate.supportProfilePic && formData.personalInfo.profilePic && (
          <div className="rbc-preview-profile-pic">
            <img src={formData.personalInfo.profilePic} alt="Profile" />
          </div>
        )}
        <div className="rbc-preview-info">
          <h1 className="rbc-preview-name">{formData.personalInfo.fullName || "Your Name"}</h1>
          {contactInfo}
        </div>
      </div>
    );

    const sections = [
      renderPreviewSection('Profile Summary', null, 
        formData.profileSummary && <p className="rbc-preview-text">{formData.profileSummary}</p>,
        sectionClass
      ),
      renderPreviewSection('Education', <FaGraduationCap />,
        formData.education.some(edu => edu.institution) && formData.education.map((edu, index) => (
          edu.institution && (
            <div key={index} className="rbc-preview-item">
              <h3 className="rbc-preview-item-title">{edu.degree} in {edu.stream}</h3>
              <p className="rbc-preview-date">{edu.startYear} - {edu.endYear || 'Present'}</p>
              <p className="rbc-preview-text">{edu.institution}</p>
              {edu.cgpa && <p className="rbc-preview-text">CGPA: {edu.cgpa}</p>}
            </div>
          )
        )),
        sectionClass
      ),
      renderPreviewSection('Work Experience', <FaBriefcase />,
        formData.workExperience.some(exp => exp.company) && formData.workExperience.map((exp, index) => (
          exp.company && (
            <div key={index} className="rbc-preview-item">
              <h3 className="rbc-preview-item-title">{exp.jobTitle}</h3>
              <p className="rbc-preview-date">{exp.startDate} - {exp.endDate || 'Present'} | {exp.company}</p>
              {exp.responsibilities && (
                <div className="rbc-preview-text">
                  {exp.responsibilities.split('\n').map((item, i) => (
                    <p key={i} className="rbc-preview-bullet">• {item}</p>
                  ))}
                </div>
              )}
            </div>
          )
        )),
        sectionClass
      ),
      renderPreviewSection('Skills', <FaCode />,
        formData.skills.some(skill => skill) && (
          <div className="rbc-preview-skills">
            {formData.skills.filter(skill => skill).map((skill, index) => (
              <span key={index} className="rbc-skill-tag">{skill}</span>
            ))}
          </div>
        ),
        sectionClass
      ),
      renderPreviewSection('Projects', <FaFileAlt />,
        formData.projects.some(proj => proj.title) && formData.projects.map((proj, index) => (
          proj.title && (
            <div key={index} className="rbc-preview-item">
              <h3 className="rbc-preview-item-title">{proj.title}</h3>
              {proj.technologies && <p className="rbc-preview-tech"><strong>Technologies:</strong> {proj.technologies}</p>}
              {proj.description && <p className="rbc-preview-text">{proj.description}</p>}
            </div>
          )
        )),
        sectionClass
      ),
      renderPreviewSection('Achievements', <FaTrophy />,
        formData.achievements.some(ach => ach) && (
          <ul className="rbc-preview-list">
            {formData.achievements.filter(ach => ach).map((achievement, index) => (
              <li key={index} className="rbc-preview-list-item">{achievement}</li>
            ))}
          </ul>
        ),
        sectionClass
      ),
      renderPreviewSection('Languages', <FaGlobe />,
        formData.languages.some(lang => lang) && (
          <ul className="rbc-preview-list">
            {formData.languages.filter(lang => lang).map((language, index) => (
              <li key={index} className="rbc-preview-list-item">{language}</li>
            ))}
          </ul>
        ),
        sectionClass
      )
    ];

    return (
      <div className="rbc-preview-page">
        <div className="rbc-preview-controls">
          <button onClick={() => setShowPreview(false)} className="rbc-btn rbc-btn-secondary">Back to Edit</button>
          <button onClick={() => { setShowPreview(false); setSelectedTemplate(null); }} className="rbc-btn rbc-btn-change-template">Change Template</button>
          <button onClick={downloadPDF} className="rbc-btn rbc-btn-download"><FaFileDownload /> Download PDF</button>
        </div>
        
        <div ref={resumeRef} className={`rbc-preview ${headerClass} ${layoutClass}`} style={templateStyle}>
          {profileSection}
          {sections}
        </div>
      </div>
    );
  };

  const nextPage = () => {
    if (currentPage < formPages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      setShowPreview(true);
    }
    window.scrollTo(0, 0);
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  if (!selectedTemplate) {
    return (
      <div className="rbc-container">
        <div className="rbc-template-selection">
          <h1 className="rbc-title">Choose a Resume Template</h1>
          <p className="rbc-subtitle">Select a template to start building your professional resume</p>
          
          <div className="rbc-template-grid">
            {resumeTemplates.map(template => (
              <div key={template.id} className="rbc-template-card" onClick={() => setSelectedTemplate(template)}>
                <div className="rbc-template-preview" style={{ backgroundColor: template.backgroundColor, borderColor: template.primaryColor }}>
                  <div className="rbc-template-header" style={{ backgroundColor: template.primaryColor }}></div>
                  <div className="rbc-template-body">
                    <div className="rbc-template-name" style={{ color: template.primaryColor }}>{template.name}</div>
                  </div>
                </div>
                <button className="rbc-btn rbc-template-select-btn" style={{ borderColor: template.primaryColor, color: template.primaryColor }}>
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return renderPreview();
  }

  return (
    <div className="rbc-container">
      <div className="rbc-form">
        <div className="rbc-progress-container">
          <div className="rbc-progress-steps">
            {formPages.map((page, index) => (
              <div key={index} className={`rbc-progress-step ${index === currentPage ? 'active' : ''} ${index < currentPage ? 'completed' : ''}`} onClick={() => setCurrentPage(index)}>
                <div className="rbc-progress-icon">{index < currentPage ? <FaCheck /> : page.icon}</div>
                <div className="rbc-progress-label">{page.title}</div>
              </div>
            ))}
          </div>
        </div>
        
        {renderFormPages()}
        
        <div className="rbc-form-navigation">
          {currentPage > 0 && (
            <button onClick={prevPage} className="rbc-btn rbc-btn-secondary">
              <FaArrowLeft /> Previous
            </button>
          )}
          <button onClick={nextPage} className="rbc-btn rbc-btn-primary">
            {currentPage < formPages.length - 1 ? (<>Next <FaArrowRight /></>) : (<>Preview <FaEye /></>)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;