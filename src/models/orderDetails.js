
import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  eventId: { type: String, default: "" },
  venueId: { type: String, default: "" },
  ticketId: { type: String, default: "" },
  couponId: { type: String, default: "" },
  name: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  ticket_count: { type: String, default: "" },
  prize: { type: String, default: "" },
  payment_status: { type: String, default: "pending " },
  bookinId:{type:String},
  qrCodeUrl:{type:String,default:""},
  userId:{type:String,default:""},
  organizationName:{type:String,default:""},
  EventcontactPerson:{type:String,default:""},
  EventphoneNumber:{type:String,default:""},
  venueEventName:{type:String,default:""},
  venueType:{type:String,default:""},
  venueAddress:{type:String,default:""},
  venueDate:{type:String,default:""},
  venuetime:{type:String,default:""},
  venueLocation:{type:String,default:""},
  image:[],
  noOfTickets:[
    {
      
      ticketName:{type:String},
      ticketPrice:{type:String},
      ticketCount:{type:String},
     
    }
  ],
  status: { type: String, default: "" },
},
{
  timestamps: true,
}
);
export default mongoose.model("Order", orderSchema);
