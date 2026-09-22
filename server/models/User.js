const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
name: {
type: String,
required: true,
trim: true
},

email: {
type: String,
required: true,
unique: true,
lowercase: true,
trim: true
},

passwordHash: {
type: String,
required: true
},

role: {
type: String,
enum: ["student", "advisor", "admin"],
required: true
},

studentId: {
type: String,
unique: true,
sparse: true,
required: function () {
return this.role === "student";
}
},

advisorId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
default: null
},

active: {
type: Boolean,
default: true
}
});

module.exports = mongoose.model("User", userSchema);