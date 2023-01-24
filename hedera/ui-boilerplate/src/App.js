import "./App.css";

function App() {
  return (
    <div className="App">
      <h1>Car Borrowing App</h1>

      <div className="card">
        <div className="box">
          <div>
            {/* Car Image */}
            <img
              src="https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=300&h=170&dpr=1"
              alt="car"
            />
          </div>

          <div className="item">
            {/*Name of the car (you can put anything you like here) */}
            <p className="title">Car Name</p>
            {/* Short description of the car */}
            <p className="desc">Car description</p>
            {/* Button for borrowing the car */}
            <div className="btn-container">
              <button className="borrow-btn">Borrow</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="box">
          <div>
            {/* Car Image */}
            <img
              src="https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=300&h=170&dpr=1"
              alt="car"
            />
          </div>

          <div className="item">
            {/*Name of the car (you can put anything you like here) */}
            <p className="title">Car Name</p>
            {/* Short description of the car */}
            <p className="desc">Car description</p>
            {/* Button for returning the car */}
            <div className="btn-container">
              <button className="return-btn">Return</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
