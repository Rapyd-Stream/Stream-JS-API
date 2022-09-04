const mongoose = require("mongoose")
const Schema = mongoose.Schema

const EscrowSchema = new Schema({ 
    paymentId: String, 
    escrowId: String,
    totalAmountUSD: mongoose.Decimal128,
    timestampStart: String, 
    timestampFinish: String, 
    amountReleasedUSD: mongoose.Decimal128,
    amountLeftUSD: mongoose.Decimal128,
    claimInProgress: Boolean,
});

const Escrow = mongoose.model('Escrow', EscrowSchema);

exports.findOneAndUpdate = async function(id, update) {
    try {
        let data = await mongoose.model('Escrow').findById(id)
        data.amountLeftUSD = update.amountLeftUSD
        data.amountReleasedUSD = update.amountReleasedUSD
        await data.save()
        return data
    } catch (e) {
        return e
    }
}

exports.getEscrow = async function() {
    try {
        let data = await mongoose.model('Escrow').find() 
        return data
    } catch(e) {
       return e
    }
};

exports.setClaimInProgressFalse = async function(id) {
    try {
        let data = await mongoose.model('Escrow').findById(id)
        data.claimInProgress = false
        await data.save
        return data
    } catch(e) {
        return e 
    }
}

exports.getClaimableEscrows = async function() {
    try {
        let data = await mongoose.model('Escrow').find({claimInProgress: true})
        return data
    } catch(e) {
        return e
    }
},

exports.createEscrow = async function(paymentId, escrowId, totalAmountUSD,timestampStart, timestampFinish, amountReleasedUSD, amountLeftUSD, claimInProgress) {
    try {
        const escrow = new Escrow({
            paymentId,
            escrowId,
            totalAmountUSD,
            timestampStart,
            timestampFinish,
            amountReleasedUSD,
            amountLeftUSD,
            claimInProgress
        })
        await escrow.save()
    } catch(e) {
        return e 
    }
}