import bcrypt from "bcryptjs";
import uploadFile, { multipleImageUpload } from "../../config/s3.js";
import Admin from "../../models/admin.js";
import Events from "../../models/events.js";
import Offer from "../../models/product.js";
import User from "../../models/user.js";
import { generateJWT, generateOTP, verifyJWT } from "../../services/helper.js";
import { sendMail } from "../../services/smtp.js";
// import UAParser from "ua-parser-js";
import { UAParser } from "ua-parser-js";
import adminHistory from "../../models/adminHistory.js";
import Category from "../../models/category.js";
import orderDetails from "../../models/orderDetails.js";
import {
  getIPAddress,
  getLocation,
  getPublicIP,
} from "../../services/common.js";
import product from "../../models/product.js";
import Product from "../../models/product.js";

export const signinAdmin = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log("admin :>> ", admin);
      return res.status(400).json({ message: "Invalid email" });
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    const token = generateJWT({ id: admin._id });
    if (!token) {
      return res.status(400).json({ message: "Not get Token" });
    } else {
      let ipAddress = await getIPAddress(req);
      ipAddress = await getPublicIP();
      let geo = await getLocation(ipAddress);
      const parser = new UAParser();
      parser.setUA(req.headers["user-agent"]);
      const result = parser.getResult();
      let obj = {
        email: email,
        browser_name: result.browser.name || "Unknown",
        ip_address: ipAddress,
        os: result.os.name
          ? `${result.os.name} ${result.os.version}`
          : "Unknown",
        device: result.device.type || "Desktop",
        country: geo.country,
        region: geo.region,
        city: geo.city,
        regionName: geo.regionName,
      };
      await adminHistory.create(obj);
      console.log("obj :>> ", obj);
      return res.json({ status: true, message: "Login successful", token });
    }
  } catch (error) {
    console.log("error :>> ", error);
    return res.json({ status: false, message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.json({ status: false, message: "Email  is required" });

  try {
    let user = await Admin.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Admin data not found" });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Update user with OTP
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    const isEmail = email.indexOf("@") > 0;
    if (isEmail) {
      let otpres = await sendMail({
        to: email,
        subject: "Reset Password OTP | Watch",
        text: `Your Watch Reset Password OTP is ${otp}.\n\nNote: This OTP is valid for 5 minutes. Please use it promptly!`,
      });
      console.log("otpresemail", otpres);
    }
    // else {
    //   let otpres = await sendSMS(
    //     identifier.startsWith("+91") ? identifier : "+91" + identifier,
    //     `Your Velica Reset Password OTP is ${otp}.\n\nNote: This OTP is valid for 5 minutes. Please use it promptly!`
    //   );
    //   console.log("otpresmobile", otpres);
    // }
    const token = generateJWT({ id: user._id });

    res
      .status(200)
      .json({ status: true, message: "OTP sent successfully", token });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ status: false, message: "Email or Phone is required" });
  }
  if (!otp) {
    return res.status(400).json({ status: false, message: "OTP is required" });
  }

  try {
    let user = await Admin.findOne({ email: email });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "admin not found" });
    }

    if (!user || user.otp !== otp) {
      return res.status(400).json({ status: false, message: "Invalid OTP" });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const token = generateJWT({ id: user._id });

    user.otp = null;
    user.otpExpiresAt = null;
    user.resetToken = token;
    await user.save();

    res.status(200).json({
      status: true,
      message: "OTP verified successfully",
      resetToken: token,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ status: false, message: "Reset token is required" });
    }

    // Decode the JWT token
    const decoded = verifyJWT(token);
    if (!decoded || !decoded.id) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid or expired token" });
    }

    const adminid = decoded.id;

    // Find the user by ID
    let user = await Admin.findById(adminid);
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "admin not found" });
    }

    // Check if token matches user's stored resetToken
    if (token !== user.resetToken) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid reset token" });
    }

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ status: false, message: "Passwords do not match" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = newPassword;

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = null; // Reset token should be cleared after successful password change

    await user.save();

    res.json({ status: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const events = await User.find();

    if (events.length === 0) {
      return res.status(404).json({ status: false, message: "No user found" });
    }

    res.status(200).json({
      status: true,
      message: "User Information retrieved successfully",
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userid } = req.params;
    const events = await User.findById(userid);

    if (events.length === 0) {
      return res.status(404).json({ status: false, message: "No user found" });
    }

    res.status(200).json({
      status: true,
      message: "User Information retrieved successfully",
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { category, categoryurl, status } = req.body;

    // Ensure required fields are provided
    if (!category || !categoryurl) {
      return res.status(400).json({
        status: false,
        message: "categorytitle and categoryurl are required",
      });
    }

    // Create new category document
    const newCategory = new Category({
      category,
      categoryurl,
      status: status ?? true, // Default to true if not provided
    });

    await newCategory.save();

    res.status(201).json({
      status: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

export const getAllCategory = async (req, res) => {
  try {
    const events = await Category.find();

    if (events.length === 0) {
      return res.status(404).json({ status: false, message: "No user found" });
    }

    res.status(200).json({
      status: true,
      message: "Category Information retrieved successfully",
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching Category",
      error: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    console.log("Incoming request body:", req.body);
    console.log("Incoming request files:", req.files);

    const {
      date,
      title,
      actualPrice,
      discountPrice,
      offer,
      caseMaterial,
      thickness,
      waterResistant,
      brand,
      category,
      timer,
    } = req.body;

    // Ensure at least one image is provided
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    // Extract images based on their structure
    const imageSet = {};
    Object.keys(req.files).forEach((key) => {
      const match = key.match(/images\[(\d+)\]\[(\w+)\]/); // Match `images[index][key]`
      if (match) {
        const [, index, field] = match;
        if (!imageSet[index]) imageSet[index] = {}; // Initialize if not exists
        imageSet[index][field] = req.files[key]; // Assign file to correct field
      }
    });

    console.log("Parsed imageSet:", imageSet);

    // Upload images and format data
    const images = await Promise.all(
      Object.values(imageSet).map(async (imageData, index) => {
        const imageUrls = await multipleImageUpload(
          [
            imageData.image,
            imageData.leftviewimage,
            imageData.rightviewimage,
            imageData.rotateviewimage,
          ].filter(Boolean)
        ); // Filter out undefined values

        return {
          image: imageUrls[0] || "",
          leftviewimage: imageUrls[1] || imageUrls[0] || "",
          rightviewimage: imageUrls[2] || imageUrls[0] || "",
          rotateviewimage: imageUrls[3] || imageUrls[0] || "",
          color: Array.isArray(req.body.colors)
            ? req.body.colors[index]
            : req.body.colors || "default",
          gender: Array.isArray(req.body.genders)
            ? req.body.genders[index]
            : req.body.genders || "unisex",
        };
      })
    );

    console.log("Uploaded images:", images);

    // Parse and validate data
    const parsedDate = date ? new Date(date) : new Date();
    const parsedActualPrice = Number(actualPrice);
    const parsedDiscountPrice = Number(discountPrice);
    const parsedThickness = thickness;
    const parsedWaterResistant = waterResistant === "true"; // Convert to boolean

    // Validate numeric fields
    if (isNaN(parsedActualPrice) || isNaN(parsedDiscountPrice)) {
      return res
        .status(400)
        .json({ error: "Price and thickness must be valid numbers" });
    }

    // Create product
    const newProduct = await Product.create({
      images,
      date: parsedDate,
      title,
      actualPrice: parsedActualPrice,
      discountPrice: parsedDiscountPrice,
      offer,
      caseMaterial,
      thickness: parsedThickness,
      waterResistant: parsedWaterResistant,
      brand,
      category,
      timer,
    });

    console.log("New Product created:", newProduct);

    res.status(201).json({
      message: "Product created successfully",
      status: true,
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating Product:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// export const createProduct = async (req, res) => {
//   try {
//     const {
//       date,
//       title,
//       actualPrice,
//       discountPrice,
//       offer,
//       caseMaterial,
//       thickness,
//       waterResistant,
//       brand,
//       category,
//     } = req.body;

//     if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).json({ error: "At least one image is required" });
//     }

//     // Convert req.files into an array (for express-fileupload support)
//     const filesArray = Array.isArray(req.files.images)
//       ? req.files.images
//       : [req.files.images];

//     console.log(
//       "Received files:",
//       filesArray.map((f) => f.name)
//     );

//     // Process images
//     const images = await Promise.all(
//       filesArray.map(async (file) => {
//         const { data, mimetype, name } = file; // `data` for express-fileupload
//         const key = `product/${Date.now()}-${name}`;

//         console.log("Uploading file:", key);

//         // Upload to S3
//         const imageUrls = await multipleImageUpload(file);

//         // Ensure only the first URL is stored as a string
//         return {
//           image: Array.isArray(imageUrls) ? imageUrls[0] : imageUrls,
//           color: req.body.colors?.[file.name] || "default",
//           gender: req.body.genders?.[file.name] || "unisex",
//         };
//       })
//     );

//     console.log("Uploaded images:", images);

//     // Parse the date
//     const parsedDate = date ? new Date(date) : new Date();

//     // Create new offer
//     const newOffer = await product.create({
//       images,
//       date: parsedDate,
//       title,
//       actualPrice,
//       discountPrice,
//       offer,
//       caseMaterial,
//       thickness,
//       waterResistant,
//       brand,
//       category,
//     });

//     res.status(201).json({
//       message: "Product created successfully",
//       status: true,
//       offer: newOffer,
//     });

//     console.log("New Product created:", newOffer);
//   } catch (error) {
//     console.error("Error creating Product:", error);
//     res
//       .status(500)
//       .json({ error: "Internal server error", details: error.message });
//   }
// };

export const getProduct = async (req, res) => {
  try {
    const offers = await product.find();
    res.status(200).json({ status: true, offers });
  } catch (error) {
    res.status(500).json({ error: error.message, status: false });
  }
};

export const getOfferById = async (req, res) => {
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
    res.status(500).json({ error: error.message, status: false });
  }
};

export const updateOffer = async (req, res) => {
  try {
    const {
      offerid,
      date,
      title,
      categories,
      actualPrice,
      discountPrice,
      collectionName,
    } = req.body;
    let updateData = {
      date,
      title,
      categories,
      actualPrice,
      discountPrice,
      collectionName,
    };

    // Handle file upload if new image is provided
    if (req.files && req.files.image) {
      const image = req.files.image;

      // Optional: Validate image type
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];
      if (!allowedMimeTypes.includes(image.mimetype)) {
        return res
          .status(400)
          .json({ message: "Invalid image format", status: false });
      }

      updateData.image = await uploadFile(
        image.name,
        image.data,
        image.mimetype
      );
    }

    // Find and update the offer, returning the updated document
    const updatedOffer = await Offer.findByIdAndUpdate(offerid, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure schema validation
    });

    if (!updatedOffer) {
      return res
        .status(404)
        .json({ message: "Offer not found", status: false });
    }

    res.status(200).json({
      message: "Offer updated successfully",
      status: true,
      data: updatedOffer, // Now correctly returning the updated document
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({ error: error.message, status: false });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.body;
    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) {
      return res
        .status(404)
        .json({ message: "Offer not found", status: false });
    }
    res
      .status(200)
      .json({ message: "Offer deleted successfully", status: true });
  } catch (error) {
    res.status(500).json({ error: error.message, status: false });
  }
};

export const adminHistoryss = async (req, res) => {
  try {
    const data = await adminHistory.find({}).sort({ _id: -1 });
    if (!data) {
      res.json({
        status: false,
        message: "No data found",
      });
    } else {
      res.json({
        status: true,
        message: "Tickets retrieved successfully",
        data: data,
      });
    }
  } catch (error) {}
};

export const singleAdminHistoryss = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await adminHistory.find({ _id: id });
    if (!data) {
      res.json({
        status: false,
        message: "No data found",
      });
    } else {
      res.json({
        status: true,
        message: "Tickets retrieved successfully",
        data: data,
      });
    }
  } catch (error) {}
};

export const getDashCount = async (req, res) => {
  try {
    const user = await User.find({});
    const order = await orderDetails.find({});
    const event = await Events.find({});

    res.status(201).json({
      status: true,
      message: "Order created successfully",
      data: { user: user, ticket: order, event: event },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};
