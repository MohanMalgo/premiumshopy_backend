import mongoose from "mongoose";
import User from "../../models/user.js";
import Interest from "../../models/areaOfInterest.js";
import Events from "../../models/events.js";
import Offer from "../../models/product.js";
import Orders from "../../models/orderDetails.js";
import ContactUs from "../../models/contactUs.js";
import uploadFile, { multipleImageUpload } from "../../config/s3.js";
import { uploadFiles } from "../../config/s3.js";
import moment from "moment";
import jwt from "jsonwebtoken";
import {
  generateJWT,
  generateOTP,
  generateReferralCode,
  verifyJWT,
  verifyUserAuthToken,
} from "../../services/helper.js";
import { sendMail, sendSMS } from "../../services/smtp.js";
import { validateSignup } from "../../validations/user/user.validation.js";
import { JWT_SECRET } from "../../config/index.js";
import bcrypt from "bcryptjs";
import events from "../../models/events.js";
import QRCode from "qrcode";
import bankDetails from "../../models/bankDetails.js";
import rating from "../../models/rating.js";
import chat from "../../models/chat.js";
import offers from "../../models/product.js";
import product from "../../models/product.js";
import Category from "../../models/category.js";
import billing from "../../models/billing.js";
import Trending from "../../models/trending.js";
import { createRazorpayOrder, verifyRazorpaySignature } from "../../config/payment.js";
import payment from "../../models/payment.js";

export const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find();
    res.status(200).json({ status: true, offers });
  } catch (error) {
    res.status(500).json({ error: error.message, status: false });
  }
};

export const buyticket = async (req, res) => {
  try {
    const {
      eventId,
      venueId,
      ticketId,
      couponId,
      name,
      email,
      phone,
      ticket_count,
      noOfTickets,
      prize,
    } = req.body;
    console.log("req.body", req.body);
    const userId = req.userAddress; // User ID from request
    const bookingId = generateReferralCode(); // Generate unique booking ID

    // Find the event and check if the venue and ticket exist
    const event = await Events.findOne({
      _id: eventId,
      "venueDetails._id": venueId,
      "venueDetails.ticket._id": ticketId,
    });

    if (!event) {
      return res.status(404).json({ message: "Event or ticket not found" });
    }

    const venue = event.venueDetails.find((v) => v._id.toString() === venueId);
    const ticket = venue.ticket.find((t) => t._id.toString() === ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check if enough tickets are available
    if (parseInt(ticket.remaining_Ticket) < parseInt(ticket_count)) {
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    // Deduct purchased ticket count from remaining_Ticket
    ticket.remaining_Ticket = (
      parseInt(ticket.remaining_Ticket) - parseInt(ticket_count)
    ).toString();

    // Save the updated event with reduced ticket count
    await event.save();

    // Find the applied coupon (if provided)
    const offer = couponId ? await Offer.findById(couponId) : null;
    const couponCode = offer ? offer.code : "";

    // Generate QR Code for the order
    const qrData = JSON.stringify({
      bookingId,
      name,
      email,
      phone,
      ticket_count,
      prize,
      payment_status: "paid",
    });

    const qrCodeUrl = await QRCode.toDataURL(qrData);

    // Create new order
    const newOrder = await Orders.create({
      eventId,
      venueId,
      ticketId,
      couponId: couponCode,
      name,
      email,
      phone,
      ticket_count,
      bookinId: bookingId,
      prize,
      payment_status: "paid",
      qrCodeUrl,
      userId,
      image: event.eventImages.map((img) => ({ url: img })),
      organizationName: event.organizationName,
      EventcontactPerson: event.contactPerson,
      EventphoneNumber: event.phoneNumber,
      venueEventName: venue.eventName,
      venueType: venue.venueName,
      venueAddress: venue.address,
      venueDate: venue.date,
      venuetime: venue.time,
      venueLocation: venue.location,
      noOfTickets, // Save ticket details
    });

    // Send response with order details
    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// ==============================================
export const userContactUs = async (req, res) => {
  try {
    const val = req.body;
    console.log("val", val);
    if (!val) {
      return res.status(400).json({ message: "Please fill the form" });
    } else {
      const contact = await ContactUs.create(val);
      res.json({
        status: true,
        message: "Contact form submitted successfully",
        data: contact,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProducts = async (req, res) => {
  const { category } = req.query;
  try {
    if (category === "all") {
      const products = await product.find(); // Use the correct model name
      console.log("Fetched Products :>> ", products); // Log actual data
      return res.status(200).json({
        status: true,
        products,
      });
    } else {
      const products = await product.find({ category: category }); // Use the correct model name
      console.log("Fetched Products :>> ", products); // Log actual data

      if (!products) {
        return res
          .status(404)
          .json({ status: false, message: "Bank details not found" });
      } else {
        return res.status(200).json({
          status: true,
          products,
        });
      }
    }
  } catch (error) {
    close.log("Error fetching products :>> ", error); // Log error
    return res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};


export const getProductById = async (req, res) => {
  try {
    const { id } = req.body;
    const offer = await Offer.findById(id);
    if (!offer) {
      return res
        .status(404)
        .json({ message: "Offer not found", status: false });
    }
    res.status(200).json({ status: true, offer });
  } catch (error) {
    console.log('error :>> ', error);
    res.status(500).json({ error: error.message, status: false });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const products = await Category.find(); // Use the correct model name
    console.log("Fetched Products :>> ", products); // Log actual data

    return res.status(200).json({
      status: true,
      products,
    });
  } catch (error) {
    close.log("Error fetching products :>> ", error); // Log error
    return res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};



// export const getAllProducts = async (req, res) => {
//   try {
//     const products = await product.find(); // Use the correct model name
//     console.log("Fetched Products :>> ", products); // Log actual data

//     return res.status(200).json({
//       status: true,
//       products,
//     });
//   } catch (error) {
//     close.log("Error fetching products :>> ", error); // Log error
//     return res.status(500).json({
//       status: false,
//       error: error.message,
//     });
//   }
// };

export const getAllTrendingProducts= async (req, res) => {
  try {
    const TrendingProduct = await Trending.find(); // Use the correct model name
    console.log("Fetched Products :>> ", TrendingProduct); // Log actual data

    return res.status(200).json({
      status: true,
      TrendingProduct,
    });
  } catch (error) {
    console.log("Error fetching products :>> ", error); // Log error
    return res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

export const getTrendingById = async (req, res) => {
  try {
    const { id } = req.body;
    const offer = await Trending.findById(id);
    if (!offer) {
      return res
        .status(404)
        .json({ message: "Offer not found", status: false });
    }
    res.status(200).json({ status: true, offer });
  } catch (error) {
    console.log("error :>> ", error);
    res.status(500).json({ error: error.message, status: false });
  }
};


// =============================================

export const addBankDetails = async (req, res) => {
  try {
    const val = req.body;
    console.log("val", val);
    const id = req.userAddress;
    console.log("id", id);

    const user = await User.findOne({ _id: id });
    console.log("user", user);

    val.userID = id;
    val.userEmail = user.email;
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    if (!val) {
      return res.status(400).json({ message: "Please fill the form" });
    } else {
      const bank = await bankDetails.create(val);
      console.log("bank", bank);

      res
        .status(201)
        .json({ message: "Bank details submitted successfully", data: bank });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server  error",
      error: error.message,
    });
  }
};

export const getBankDetails = async (req, res) => {
  try {
    const id = req.userAddress;
    const bank = await bankDetails.findOne({ _id: id });
    if (!bank) {
      return res
        .status(404)
        .json({ status: false, message: "Bank details not found" });
    } else {
      return res.status(200).json({
        status: true,
        message: "Bank details retrieved successfully",
        data: bank,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server  error",
      error: error.message,
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const id = req.userAddress;
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    } else {
      await User.deleteOne({ _id: id });
      return res
        .status(200)
        .json({ status: true, message: "Account deleted successfully" });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server  error",
      error: error.message,
    });
  }
};

export const getOfferDetails = async (req, res) => {
  try {
    const bank = await offers.find();
    if (!bank) {
      return res
        .status(404)
        .json({ status: false, message: "Offers not found" });
    } else {
      return res.status(200).json({
        status: true,
        message: "Bank details retrieved successfully",
        data: bank,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server  error",
      error: error.message,
    });
  }
};

export const getSingleOfferDetails = async (req, res) => {
  const { id } = req.body;
  console.log("id :>> ", id);
  try {
    const bank = await offers.findOne({ _id: id });
    console.log("bank :>> ", bank);
    if (!bank) {
      return res
        .status(404)
        .json({ status: false, message: "Offers not found" });
    } else {
      return res.status(200).json({
        status: true,
        message: "Offers retrieved successfully",
        data: bank,
      });
    }
  } catch (error) {
    console.log("error :>> ", error);
    return res.status(500).json({
      status: false,
      message: "Internal server  error",
      error: error.message,
    });
  }
};

export const createBillingDetails = async (req, res) => {
  try {
    const val = req.body;
    const amount =val.amount
    const currency = "INR"
    console.log("val", val);
    if (!val) {
      return res.status(400).json({ message: "Please fill the form" });
    } else {
      const order = await createRazorpayOrder({ amount, currency })
      console.log('order :>> ', order);    

      if (!order) {
          return res.status(400).json({
              status: false,
              message: "Payment failed",
          })
      }
      val.orderId = order.id
      const contact = await billing.create(val);
      console.log('contact :>> ', contact);    
        res.json({
        status: true,
        message: "Contact form submitted successfully",
        data: contact,
      });
    }
  } catch (error) {
    console.log('error :>> ', error);
    res.status(500).json({ message: "Internal server error" });

  }
};

export const purchaseCourseuser = async (req, res) => {
  try {
      const { amount, currency } = req.body
      const email = req.userAddress;
      const userz = await User.findOne({ email: email });
      if (!userz) {
          return res.status(400).json({
              status: false,
              message: "Course not found",
          })
      }
      const order = await createRazorpayOrder({ amount, currency })
      if (!order) {
          return res.status(400).json({
              status: false,
              message: "Payment failed",
          })
      }
      await payment.create({
          amount,
          currency,
          email: email,
          type: "Deposit",
          orderId: order.id,
      })
      res.status(200).json({
          status: true,
          message: "Payment initiated successfully",
          data: {
              orderId: order.id,
          }
      });
  } catch (error) {
      res.status(500).json({
          status: false,
          message: "Payment failed",
          error: error.message,
      });
  }
};

export const confirmPurchase = async (req, res) => {
  try {
      const { name, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body
      const id = req.userAddress;
      const order = await billing.findOne({ orderId: razorpayOrderId });
      console.log("order========",order)
      if (!order) {
          return res.status(400).json({
              status: false,
              message: "Order not found",
          })
      }
      const verifySig = await verifyRazorpaySignature(req.body);
      if (!verifySig) {
          return res.status(400).json({
              status: false,
              message: "Payment veification failed",
          })
      }
     const da =  await payment.create(
          { orderId: razorpayOrderId },
          {
              name,
              status: true,
              paymentId: razorpayPaymentId,
              signature: razorpaySignature,
              type: "Deposit"
          }
      );
      console.log("da",da)
      await billing.updateOne({ orderId: razorpayOrderId }, { paymentStatus:true })
      res.status(200).json({
          status: true,
          message: "Payment verified successfully"
      });
  } catch (error) {
      res.status(500).json({
          status: false,
          message: "Payment verification failed",
          error: error.message,
      });
  }
};