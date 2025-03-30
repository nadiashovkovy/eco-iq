import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import PieChart from './PieChart';

function App() {

  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ouput:
  const [chartData, setChartData] = useState([30, 30, 30]);
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100); 
    return () => clearTimeout(timer);
  }, []);

  // this effect is for when the user submits a url
  const handleSubmit = async () => {
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-]*)*\/?$/; // check if url is valid

    if (!url.trim()) {
      // if no input
      setErrorMessage('Please enter a URL before submitting.');
    } else if (!urlRegex.test(url.trim())) {
      // if not a valid url
      setErrorMessage('Please enter a valid URL.');
    } else {
      // if input is valid, proceed
      setErrorMessage(''); // clear previous
      setIsSubmitted(true);
      setChartData([30,30,30]);

      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL; 
        const response = await fetch(`${backendUrl}/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log("GPT Analysis:", data);

        setAnalysis(data);

        // update when response is received
        setChartData([
          data.environmental_impact.score, 
          data.supply_chain_resources.score,
          data.business_operations.score,
        ]);

        setAnalysis(data); 
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.error || 'Something went wrong.');
        }
      } catch (error) {
        setErrorMessage('Error connecting to the backend.');
      }
    };
  };

  return (
    <div
    style={{
        backgroundImage: "url('/images/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
        position: "relative",
      }}
      
    >
      <section id="main" className={`main fade-in ${isVisible ? 'visible' : ''}`}>
        {!isSubmitted ? (
          <>
            <img src={logo} className="App-logo" alt="logo" />
            <p>Uncover the Sustainability of a Preferred Business</p>
            <input type="text" placeholder="Enter the url of a company/business..." value={url} onChange={(e) => setUrl(e.target.value)}/>
            {errorMessage && <h className="error-message">{errorMessage}</h>} 
            <div>
              <button className="submit-button enlarge-on-hover" onClick={handleSubmit}>
                SUBMIT
              </button>
              <img src="/images/checks.png" className="checks-image" alt="checks" />
            </div>
          </>
        ) : ( // if the user submits a url, we will show the breakdown of the company's sustainability
          isSubmitted && analysis ? ( // check if the user has submitted and analysis is loaded
            <section id="display-output" className={`display-output fade-in ${isVisible ? 'visible' : ''}`}>
              <button
              className="redo-button"
              onClick={() => window.location.reload()} 
              >
                <img
                  src="/images/redo-icon.png" 
                  alt="Redo"
                  style={{ width: '30px', height: '30px' }}
                />
              </button>

              <h1>Sustainability Index Score For {analysis.company_name}: {analysis.overall_score}% </h1>
              <p>Click on the Different Sections to Learn More</p>
              <div className="pie-chart-container">
                <PieChart 
                  data={{
                    scores: chartData, 
                    overallScore: analysis.overall_score, 
                    descriptions: [
                      analysis.environmental_impact?.description || 'No data available',
                      analysis.supply_chain_resources?.description || 'No data available',
                      analysis.business_operations?.description || 'No data available',
                    ]
                  }} 
                />
              </div>


            </section>
          ) : (
            <p className="loading-message">
              Loading analysis<span className="dots">...</span>
            </p>
          )
        )}


      </section>

      <section id = "footer" className="footer"> 
        <img src="/images/footer.png" className="footer-image" alt="footer" />
        <p className="footer-text">made with love by nadia shovkovy</p>
      </section>

    </div>
    
  );
}

export default App;
