// setup server
const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors');
const port = 3000

// load rapyd service
const rapyd = require('./services/rapyd');
const escrowClaim = require("./services/escrowclaim");

app.use(cors());
app.use(bodyParser.json())

app.post('/stream/get', async(req,res) => {
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

const CronJob = require('cron').CronJob;

const job = new CronJob({
      cronTime: '0 * * * * *',
      onTick: function () {
        // Do daily function
        escrowClaim.runEscrowClaim()
        console.log('cron finish');
      },
      start: false
    });

job.start()