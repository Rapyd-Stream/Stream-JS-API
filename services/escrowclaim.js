const rapyd = require('./rapyd');
const Escrow = require("../models/Escrow.js")

const getEscrowClaimAmount = function(escrow) {
    // get the current interval 
    let seconds = escrow.timestampFinish - escrow.timestampStart
    let claimPerSecond = escrow.totalAmountUSD / seconds 
    let currentTimeInSeconds = (parseInt(Date.now() / 1000))
    let interval = currentTimeInSeconds - escrow.timestampStart

    if(interval > seconds) interval = seconds 
    let intervalClaim = claimPerSecond * interval

    // in case there is a rounding thats higher than amount left
    if(intervalClaim > escrow.amountLeftUSD) {
        intervalClaim = escrow.amountLeftUSD
    }

    return intervalClaim.toFixed(3)
}

const createClaim = async function(escrow, amount) {
    try {
        let res = await rapyd.claimEscrow(escrow.paymentId, escrow.escrowId, amount)
        if(res.data.status.status === 'SUCCESS') {
            const update = {
                amountLeftUSD: res.data.data.amount_on_hold,
                amountReleasedUSD: escrow.totalAmountUSD - res.data.data.amount_on_hold
            }
            if(res.data.data.amount_on_hold === 0) {
                Escrow.setClaimInProgressFalse(escrow._id)
            } 
            let obj = await Escrow.findOneAndUpdate(escrow._id, update)
            return obj
        }
    } catch (e) {
        console.log(e)
    }
}

exports.runEscrowClaim = async function() {
    try {
        console.log("START ESCROW CLAIM")
        let promiseArray = []
        let escrows = await Escrow.getClaimableEscrows()
        escrows.forEach(async escrow => {
            let amount = getEscrowClaimAmount(escrow)
            let clAmount = amount - escrow.amountReleasedUSD
            if(clAmount > 0.001) {
                promiseArray.push(createClaim(escrow, clAmount))
                await createClaim(escrow, clAmount)
            }
        })
        let pm = await Promise.all(promiseArray)
        console.log(pm)
    } catch(e) {
        console.log(e)
    }
}

let escrowObject = {
    timestampStart: String,
    timestampFinish: String, 
    totalClaimed: Number, 
    interval: Number
}



