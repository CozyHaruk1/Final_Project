const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
code: {
type: String,
required: true,
unique: true,
trim: true,
uppercase: true
},

title: {
type: String,
required: true,
trim: true
},

credits: {
type: Number,
required: true,
default: 4
},

description: {
type: String,
default: "",
trim: true
},

prerequisites: {
type: [String],
default: []
}
});

module.exports = mongoose.model("Course", courseSchema);