function CreateNFT({ createNFT }) {
  return (
    <div className="App">
      <h1>Create Car NFT</h1>
      {/* Form for creating a new car NFT */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createNFT(
            document.getElementById("cid").value
          );
        }}
        className="box"
      >
        <input type="text" id="cid" placeholder="Content ID (CID)" required />
        {/* <input type="text" id="symbol" placeholder="Token Symbol" required /> */}
        {/* <input type="number" id="supply" placeholder="Max Supply" required /> */}
        <div style={{ width: "100%" }}>
          {/* Submit button to create a new car NFT */}
          <button type="submit" className="primary-btn">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateNFT;
