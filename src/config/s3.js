// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// const bucketRegion = process.env.AWS_REGION;
// const bucketName = process.env.AWS_S3_BUCKET_NAME;
// console.log(bucketName,bucketRegion)
// const s3 = new S3Client({
//   region: bucketRegion,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// const uploadFile = async (key, fileBuffer, contentType) => {
//   try {
//     const command = new PutObjectCommand({
//       Bucket: bucketName,
//       Key: key,
//       Body: fileBuffer,
//       ACL: "public-read",
//       ContentType: contentType,
//     });
//     await s3.send(command);
//     // console.log('Upload success:', response);   https://sonicxswapbucket.s3.ap-south-1.amazonaws.com/   https://skillimage.s3.ap-south-1.amazonaws.com/Group+209.png

//     const url =" https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${key}";
//     return url;
//   } catch (error) {
//     console.error("Upload error:", error);
//     throw error;
//   }
// };

// export default uploadFile;

// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// // import User from "../models/User.js"; // Ensure the correct path to your User model?
// import fileUpload from "express-fileupload";

// const bucketRegion = process.env.AWS_REGION;
// const bucketName = process.env.AWS_S3_BUCKET_NAME;
// const s3 = new S3Client({
//   region: bucketRegion,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// const uploadFile = async (key, fileBuffer, contentType) => {
//   try {
//     const command = new PutObjectCommand({
//       Bucket: bucketName,
//       Key: key,
//       Body: fileBuffer,
//       ACL: "public-read",
//       ContentType: contentType,
//     });
//     await s3.send(command);
//     return `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${key}`;
//   } catch (error) {
//     console.error("Upload error:", error);
//     throw error;
//   }
// };

// export default uploadFile;
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const bucketRegion = process.env.AWS_REGION;
const bucketName = process.env.AWS_S3_BUCKET_NAME;

const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Function to upload a single file
const uploadFile = async (key, fileBuffer, contentType) => {
  console.log('key :>> ', key);
  console.log("fileBuffer :>> ", fileBuffer);
  console.log("contentType :>> ", contentType);


  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ACL: "public-read",
      ContentType: contentType,
    });
    await s3.send(command);
    return `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

// ✅ Function to upload multiple files
export const uploadFiles = async (files) => {
  console.log('files :>> ', files);
  const uploadedImageUrls = [];

  for (const file of files) {
    try {
      console.log("Uploading file:", file.name);
      const imageUrl = await uploadFile(file.name, file.data, file.mimetype);
      console.log("Uploaded URL:", imageUrl);
      uploadedImageUrls.push(imageUrl);
    } catch (error) {
      console.error("File upload failed for", file.name, error);
    }
  }

  console.log("uploadedImageUrls :>> ", uploadedImageUrls);

  return uploadedImageUrls;
};

export default uploadFile;

export const multipleImageUpload = async (files) => {
  console.log('mfiles :>> ', files);
  if (!Array.isArray(files)) {
    files = [files]; // Convert to array if it's a single file
  }
console.log('mfiles :>> ', files);
  try {
    const uploadPromises = files.map((file) => {
      if (!file || !file.data) {
        throw new Error("Invalid file format. File buffer is missing.");
      }

      const key = file.key || `${Date.now()}-${file.name}`;
      const fileBuffer = file.data || file.fileBuffer;
      const contentType = file.mimetype || "application/octet-stream"; // Fallback content type

      const command = new PutObjectCommand({
        Bucket: bucketName, // Ensure this is defined
        Key: key,
        Body: fileBuffer,
        ACL: "public-read",
        ContentType: contentType,
      });

      return s3
        .send(command)
        .then(
          () => `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${key}`
        );
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

