import { useEffect, useState } from "react";
import moment from "moment";

function Return({ returnNFT, address }) {
  const [data, setData] = useState();
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    // Fetching data from Hedera Mirror Node for car that can be returned
    const readData = async () => {
      try {
        await fetch(
          `https://testnet.mirrornode.hedera.com/api/v1/accounts/${address}/nfts?order=asc`
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
      <h1>Car Returning Page</h1>

      {data?.nfts?.map((nft, index) => (
        <div className="card" key={index}>
          <div className="box">
            <div>
              {/* Car Image */}
              <img
                src="https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=250&h=140&dpr=1"
                alt="car"
                style={{ borderRadius: "5px" }}
              />
            </div>

            <div className="item">
              <table>
                <tbody>
                  <tr>
                    <td className="title" style={{ fontWeight: "bold" }}>
                      Token ID:
                    </td>
                    <td className="desc" style={{ fontWeight: "bold" }}>
                      {nft.token_id}
                    </td>
                  </tr>
                  <tr>
                    <td className="title">Serial Number:</td>
                    <td className="desc">{nft.serial_number}</td>
                  </tr>
                  <tr>
                    <td className="title">Current Holder:</td>
                    <td className="desc">{nft.account_id}</td>
                  </tr>
                  <tr>
                    <td className="title">Updated at:</td>
                    <td className="desc">
                      {moment
                        .unix(nft.modified_timestamp)
                        .format(`DD MMMM YYYY, h:mm:ss A`)}
                    </td>
                  </tr>
                </tbody>
              </table>
              {/* Button for returning the car */}
              <div className="btn-container">
                <button
                  className="return-btn"
                  onClick={() => {
                    returnNFT(nft.token_id, nft.serial_number);
                    setFlag(!flag);
                  }}
                >
                  Return
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Return;
