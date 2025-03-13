import { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    issue: '',
    needs: [],
    customerMessage: '',
    context: '',
    draft: '',
    tone: 'Professional'
  });

  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (password === '1234') {
      setIsAuthenticated(true);
    }

    else {
      alert('Incorrect password');
    }
  };

  const needOptions = [
    { id: 'apology', label: 'Apology' },
    { id: 'assurance', label: 'Assurance' },
    { id: 'refund', label: 'Refund' },
    { id: 'replacement', label: 'Replacement' },
    { id: 'exchange', label: 'Exchange Offer' },
    { id: 'information', label: 'Information' },
    { id: 'compensation', label: 'Compensation Offer' },
    { id: 'clarification', label: 'Clarification Request' },
    { id: 'rejection', label: 'Rejection/Denial' }
  ];

  const toneOptions = [
    { id: 'friendly', label: 'Friendly' },
    { id: 'professional', label: 'Professional' },
    { id: 'formal', label: 'Formal' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNeedsChange = (e) => {
    const value = e.target.value;
    let updatedNeeds = [...formData.needs];

    if (updatedNeeds.includes(value)) {
      updatedNeeds = updatedNeeds.filter(need => need !== value);
    } else {
      updatedNeeds.push(value);
    }

    setFormData({
      ...formData,
      needs: updatedNeeds
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');
    setError('');

    try {

      console.log("FormData being sent from the front end: ", formData);
      const response = await fetch('http://localhost:5000/api/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || 'Failed to generate response');
      }

      setResponse(data.formattedResponse);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    // Create a temporary div with the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = response;

    // Extract text content (this removes HTML tags)
    const textContent = tempDiv.textContent || tempDiv.innerText;

    navigator.clipboard.writeText(textContent)
      .then(() => {
        alert('Response copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (

    <div className="app-container">

      <header>
        <h1>Customer Support Response Generator</h1>
      </header>

      {!isAuthenticated ? (
        <div className="password-container">
          <h2>Enter Password</h2>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
            <button type="submit">Submit</button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>
      ) : (

            <div className="main-content">
              <div className="form-container">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="issue">Issue Description *</label>
                    <textarea
                      id="issue"
                      name="issue"
                      value={formData.issue}
                      onChange={handleInputChange}
                      placeholder="Describe the issue (Hindi/English/mixed)"
                      required
                      rows={4}
                    />
                  </div>

                  <div className="form-group">
                    <label>Response Needs *</label>
                    <div className="checkbox-group">
                      {needOptions.map(option => (
                        <div key={option.id} className="checkbox-item">
                          <input
                            type="checkbox"
                            id={option.id}
                            value={option.label}
                            checked={formData.needs.includes(option.label)}
                            onChange={handleNeedsChange}
                          />
                          <label htmlFor={option.id}>{option.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="customerMessage">Customer's Original Message (Optional)</label>
                    <textarea
                      id="customerMessage"
                      name="customerMessage"
                      value={formData.customerMessage}
                      onChange={handleInputChange}
                      placeholder="Paste the exact message sent by the customer"
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="context">Context (Optional)</label>
                    <textarea
                      id="context"
                      name="context"
                      value={formData.context}
                      onChange={handleInputChange}
                      placeholder="Additional information about the issue or past interactions"
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="draft">Draft Response (Optional)</label>
                    <textarea
                      id="draft"
                      name="draft"
                      value={formData.draft}
                      onChange={handleInputChange}
                      placeholder="If you want to give a rough reply idea"
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tone *</label>
                    <div className="radio-group">
                      {toneOptions.map(option => (
                        <div key={option.id} className="radio-item">
                          <input
                            type="radio"
                            id={option.id}
                            name="tone"
                            value={option.label}
                            checked={formData.tone === option.label}
                            onChange={handleInputChange}
                            required
                          />
                          <label htmlFor={option.id}>{option.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? 'Generating...' : 'Generate Response'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="response-container">
                <h2>Generated Response</h2>
                {error && <div className="error-message">{error}</div>}

                {response ? (
                  <>
                    <div className="response-content" dangerouslySetInnerHTML={{ __html: response }}></div>
                    <button onClick={copyToClipboard} className="copy-btn">
                      Copy to Clipboard
                    </button>
                  </>
                ) : (
                  <div className="empty-response">
                    {loading ? 'Generating response...' : 'Generated response will appear here'}
                  </div>
                )}
              </div>
            </div>
      )}
    </div>

  );
}

export default App;