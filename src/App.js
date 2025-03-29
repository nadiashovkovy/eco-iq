import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import PieChart from './PieChart';

function App() {

  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [chartData, setChartData] = useState([30, 30, 30]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100); 
    return () => clearTimeout(timer);
  }, []);

  // this effect is for when the user submits a url
  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      // if empty, show an error message
      setErrorMessage('Please enter a URL before submitting.');
    } else {
      // if input is valid, proceed
      setErrorMessage(''); // clear previous
      setIsSubmitted(true);
      setChartData([30,30,30]);

      try {
        // scrape the URL
        const response = await fetch('http://localhost:5000/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: inputValue }),
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('Sustainability score:', data);
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.error || 'Something went wrong');
        }
      } catch (error) {
        setErrorMessage('Error connecting to the backend');
      }
    }
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
            <p>Enter a url to get started!</p>
            <input type="text" placeholder="Enter the name of a company/business..." value={inputValue} onChange={(e) => setInputValue(e.target.value)}/>
            {errorMessage && <h className="error-message">{errorMessage}</h>} 
            <div>
              <button className="submit-button enlarge-on-hover" onClick={handleSubmit}>
                SUBMIT
              </button>
              <img src="/images/checks.png" className="checks-image" alt="checks" />
            </div>
          </>
        ) : ( // if the user submits a url, we will show the breakdown of the company's sustainability
          <section id = "display-output" className={`display-output fade-in ${isVisible ? 'visible' : ''}`}>
            <h1>Sustainablity Index Score For :</h1>
            <p>Find out why Below</p>
            <div className="pie-chart-container">
              <PieChart data={chartData} />
            </div>
          </section>
        )}


      </section>

      <section id = "footer" className="footer"> 
        <img src="/images/footer.png" className="footer-image" alt="footer" />
      </section>

    </div>
    
  );
}

export default App;
