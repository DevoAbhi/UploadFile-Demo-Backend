import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UploadSchema = new Schema({
    fileName: {
        type: String
    },
    fileUrl: {
        type: String
    }
})

export default mongoose.model('Upload', UploadSchema);