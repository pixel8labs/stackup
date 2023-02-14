import { AccountId } from "@hashgraph/sdk";
import { useEffect, useState } from "react";

function GiveScore({ giveScore }) {
  const [data, setData] = useState();
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    // Fetching data from Hedera Mirror Node for list of past borrower
    const readData = async () => {
      try {
        await fetch(
          `https://testnet.mirrornode.hedera.com/api/v1/tokens/${AccountId.fromSolidityAddress(
            process.env.REACT_APP_TOKEN_ADDRESS
          ).toString()}/balances?order=desc`
        )
          .then((response) => response.json())
          .then((data) => {
            setData(data);
          });
      } catch (e) {
        console.log(e);
      }
    };

    readData();
  }, [flag]);

  return (
    <div className="App">
      <h1>List of Borrower</h1>
      {/* Card for giving credit score to user account */}

      {data?.balances?.map((nft, index) => (
        <div className="card" key={index}>
          <div className="item" style={{ width: "100%" }}>
            <table>
              <tbody>
                <tr>
                  <td className="title" style={{ fontWeight: "bold" }}>
                    Customer
                  </td>
                  <td className="desc" style={{ fontWeight: "bold" }}>
                    #{index + 1}
                  </td>
                </tr>
                <tr>
                  <td className="title">Account ID:</td>
                  <td className="desc">{nft.account}</td>
                </tr>
                <tr>
                  <td className="title">Car borrowed:</td>
                  <td className="desc">{nft.balance}</td>
                </tr>
              </tbody>
            </table>
            {/* Button for borrowing the car */}
            <div className="btn-container">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  giveScore(
                    nft.account,
                    document.getElementById("score").value
                  );
                  setFlag(!flag);
                }}
                className="box"
              >
                <div className="score-container">
                  <input
                    type="number"
                    id="score"
                    placeholder="Score Amount"
                    min={1}
                    max={5}
                    required
                  />
                  <button className="primary-btn" type="submit">
                    Give Credit Score
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GiveScore;
