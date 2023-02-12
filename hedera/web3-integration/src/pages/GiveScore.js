import { useEffect, useState } from "react";

function GiveScore({ giveScore }) {
  const [data, setData] = useState();
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    // Fetching data from Hedera Mirror Node for list of past borrower
    const readData = async () => {
      try {
        await fetch(
          `https://testnet.mirrornode.hedera.com/api/v1/accounts/${process.env.REACT_APP_TREASURY_ID}/nfts?order=asc`
        )
          .then((response) => response.json())
          .then((data) => {
            // Removing duplicate borrower data
            const uniqueData = data.nfts.reduce((unique, item) => {
              if (!unique.some((list) => list.account_id === item.account_id)) {
                unique.push(item);
              }
              return unique;
            }, []);
            setData(uniqueData);
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

      {data?.map((nft, index) => (
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
                  <td className="desc">{nft.account_id}</td>
                </tr>
              </tbody>
            </table>
            {/* Button for borrowing the car */}
            <div className="btn-container">
              <button
                className="primary-btn"
                onClick={() => {
                  giveScore(nft.account_id);
                  setFlag(!flag);
                }}
              >
                Give 1 Credit Score
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GiveScore;
