// const Razorpay = require('razorpay');
// const crypto = require('crypto');
import Razorpay from 'razorpay';
import crypto from 'crypto';

const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';
const RAZORPAY_KEY_ID = 'rzp_test_XFHcZ6WtKRfKRD';
const RAZORPAY_KEY_SECRET = 'PtacRqmO827HAI4nyIp1QZH8';

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async ({ amount, currency }) => {
    try {
        const options = {
            amount: amount * 100, 
            currency: currency,
        };
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        throw new Error(`Error creating Razorpay order: ${error.message}`);
    }
};

export const verifyRazorpaySignature = async (
    { razorpayOrderId, razorpayPaymentId, razorpaySignature }
) => {
    try {
        const generatedSignature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(razorpayOrderId + "|" + razorpayPaymentId)
            .digest('hex');
        if (generatedSignature !== razorpaySignature) {
            throw new Error("Verification failed: Incorrect siganture");
        }
        return true;
    } catch (error) {
        throw new Error(error);
    }
};