const axios = require("axios");
const CryptoJS = require("crypto-js");

require('dotenv').config()

const access_key = process.env.ACCESS_KEY;                                                       
const secret_key = process.env.SECRET_KEY;                                                       // Never transmit the secret key by itself.

// build signature for http request
const getSignature = (url_path, http_method, data, salt, timestamp) => {
  const to_sign =
    http_method + url_path + salt + timestamp + access_key + secret_key + data;
  let signature = CryptoJS.enc.Hex.stringify(
    CryptoJS.HmacSHA256(to_sign, secret_key)
  );

  signature = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(signature));

  return signature;
};

const getEscrow = async function(escrowId, paymentId) {
  try {
    const url_path = `/v1/payments/${paymentId}/escrows/${escrowId}`;                                       // Portion after the base URL.                                                                                // Hardkeyed for this example.
    const http_method = "get";
    
    const salt = CryptoJS.lib.WordArray.random(12);                         
    const timestamp = (Math.floor(new Date().getTime() / 1000) - 10).toString(); 
    const data = ""
    const headers = {
        access_key,
        signature: getSignature(url_path, http_method, data, salt, timestamp),
        salt,
        timestamp,
        "Content-Type": `application/json`,
    };
  
    const request = {
        baseURL: "https://sandboxapi.rapyd.net",
        headers,
        url: url_path,
        method: http_method
    }; 
    const response = await axios(request);
    return response.data.data
  } catch (error) {
    if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    } else if (error.request) {
        console.log(error.request);
    } else {
        console.log('Error', error.message);
    }
    console.log(error.config);
  }
}
// creates wallet for user
const createWallet = async function(firstName, lastName, email, ref, phone, countryCode) {
    try {
        let data = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        ewallet_reference_id: ref,
        metadata: {
            merchant_defined: true
        },
        phone_number: "",
        type: "person",
        contact: {
            phone_number: phone,
            email: email,
            first_name: firstName,
            last_name: lastName,
            contact_type: "personal",
            country: countryCode,
            }
        }

        const url_path = "/v1/user";                                       // Portion after the base URL.                                                                                // Hardkeyed for this example.
        const http_method = "post";   


        const salt = CryptoJS.lib.WordArray.random(12);                         
        const timestamp = (Math.floor(new Date().getTime() / 1000) - 10).toString(); 

        const headers = {
            access_key,
            signature: getSignature(url_path, http_method, JSON.stringify(data), salt, timestamp),
            salt,
            timestamp,
            "Content-Type": `application/json`,
        };


        const request = {
            baseURL: "https://sandboxapi.rapyd.net",
            headers,
            url: url_path,
            method: http_method,
            data
        };
        const response = await axios(request);

        if(response.data.data.id) {
            console.log("WALLET ID=", response.data.data.id)
        }

    } catch (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            console.log(error.request);
        } else {
            console.log('Error', error.message);
        }
        console.log(error.config);
    };
}
// creates customers and attaches ewallet to it
const createCustomer = async function() {
    try {
        let data =  {
            ewallet: "ewallet_6530bb0327d691fe162a96469dfa069e",
            name: "Marc Thalen",
            payment_method: {
                type: "us_debit_visa_card",
                fields: {
                    number: "4111111111111111",
                    expiration_month: "10",
                    expiration_year: "23",
                    cvv: "123"
                }
            },
        }

        const url_path = "/v1/customers";                                                                                                                    // Hardkeyed for this example.
        const http_method = "post";    


        const salt = CryptoJS.lib.WordArray.random(12);                         
        const timestamp = (Math.floor(new Date().getTime() / 1000) - 10).toString(); 
        
        const headers = {
            access_key,
            signature: getSignature(url_path, http_method, JSON.stringify(data), salt, timestamp),
            salt,
            timestamp,
            "Content-Type": `application/json`,
          };

          const request = {
            baseURL: "https://sandboxapi.rapyd.net",
            headers,
            url: url_path,
            method: http_method,
            data
          };

        const response = await axios(request);
        return response.data

    } catch(error) {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log('Error', error.message);
      }
      throw new Error("something went wrong")
    };
}

// create payment to customer/ewallet
const createPayment = async function(amount, numberOfDays) {
    try {
        let data = {
            amount: amount,
            currency: "USD",
            customer: "cus_8cdfd2460d5314cc909b235991d15a20",
            escrow: true,
            escrow_release_days: numberOfDays,
            ewallets: "ewallet_6530bb0327d691fe162a96469dfa069e",
            payment_method: {
              type: "us_debit_visa_card",
              fields: {
                number: "4111111111111111",
                expiration_month: "12",
                expiration_year: "23",
                name: "John Doe",
                cvv: "345"
              },
              metadata: {
                merchant_defined: true
              }
            },
            capture: true
          }
          const url_path = "/v1/payments";                                       // Portion after the base URL.                                                                                // Hardkeyed for this example.
          const http_method = "post";    

          const salt = CryptoJS.lib.WordArray.random(12);                         
          const timestamp = (Math.floor(new Date().getTime() / 1000) - 10).toString(); 
          
          const headers = {
              access_key,
              signature: getSignature(url_path, http_method, JSON.stringify(data), salt, timestamp),
              salt,
              timestamp,
              "Content-Type": `application/json`,
            };
    
            const request = {
              baseURL: "https://sandboxapi.rapyd.net",
              headers,
              url: url_path,
              method: http_method,
              data
            };
    
            const response = await axios(request);
            return response.data
    }  catch(error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
        throw new Error("something went wrong")
      };
}

module.exports = {
  createCustomer,
  createPayment,
  createWallet,
  getEscrow
}


