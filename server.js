// setup server
const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors');
const port = 3000


// load rapyd service
const rapyd = require('./services/rapyd');

app.use(cors());
app.use(bodyParser.json())

app.post('/stream/get', async(req,res) => {
    let responseObject = {}
    let postData = req.body;
    if(!postData.escrowId || !postData.paymentId) {
        responseObject = { message: "missing parameters (required: escrowId and paymentId", type: "error"}
    } else {
        try {
            let escrow = await rapyd.getEscrow(postData.escrowId, postData.paymentId)
            return res.json({escrow, type: "success"})
        } catch (e) {
            return res.json({messsage: "general service error", type: "error"})
        }  
    }
})
 
app.post('/stream/create', async (req, res) => {
    console.log(req.body)
    let responseObject = {}
    let postData = req.body;
    if(!postData.amount || !postData.numberDays) {
        responseObject = { message: "missing parameters (required: amount and numberDays)", type: "error"}
        return res.json(responseObject)
    } 
    else if (postData.amount < 1) {
        responseObject = { message: "amount must be larger than 0", type: "error"}
        return res.json(responseObject)
    }
    if (postData.numberDays < 1) {
        responseObject = { message: "number of days must be larger than 0", type: "error"}
        return res.json(responseObject)
    }
    
    else {
        try {
            let resp = await rapyd.createPayment(postData.amount, postData.numberDays)
            let escrowId = resp.data.escrow.id
            let paymentId = resp.data.id
            return res.json({escrowId, paymentId, type: "success"})
        } catch (e) {
            return res.json({messsage: "general service error", type: "error"})
        }
    }
  })

app.listen(port, () => {
    console.log(`Stream backend listening on port ${port}`)
  })


  
    // "escrowId": "escrow_dccfdf81383ff9b671cbd0c591148ab2",
    // "paymentId": "payment_c134dacdec6db7d22c1df5a7b1a41f89"