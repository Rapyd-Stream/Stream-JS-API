const rapyd = require('./rapyd');

// serverless service inputs paymentId and escrowId

const run = async function() {
    try {
        let res = await rapyd.claimEscrow("payment_48983dba504fbb9584bb418476735149", "escrow_ce78418d3f915bba72f6d3d220119643", 10)
        console.log(res)
    } catch(e) {
        console.log(e)
    }
}

run()


// 1 store all payments in database
// upon saving a payment set a payment interval eg 10 sec 
// run script every 10 seconds to loop over database and get payments that need to be checked 




// // run the service for a specific escrow
// const claimEscrow = function(paymentId, escrowId) {

// }

// // calculate the amount that is needed for this claim
// const calculateClaimAmount = function() {
//     // minimum claim 1 cent
//     // 
// }



