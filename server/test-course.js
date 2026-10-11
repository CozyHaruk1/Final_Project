const Course = require("./models/Course");

const runTest = async () => {
console.log("=== COURSE MODEL TEST ===");

const validCourse = new Course({
code: "ite999",
title: "Test Course",
credits: 4,
description: "Course used for testing",
prerequisites: ["CSC101"]
});

try {
await validCourse.validate();

console.log("PASS - Valid course accepted");
console.log(validCourse);

if (validCourse.code === "ITE999") {
console.log("PASS - Course code converted to uppercase");
} else {
console.log("FAIL - Course code uppercase");
}

if (Array.isArray(validCourse.prerequisites)) {
console.log("PASS - prerequisites is an array");
}
} catch (error) {
console.log("FAIL - Valid course rejected");
console.log(error.message);
}

const missingCode = new Course({
title: "Missing Code"
});

try {
await missingCode.validate();
console.log("FAIL - Course without code accepted");
} catch (error) {
console.log("PASS - Course without code rejected");
}

const missingTitle = new Course({
code: "TEST100"
});

try {
await missingTitle.validate();
console.log("FAIL - Course without title accepted");
} catch (error) {
console.log("PASS - Course without title rejected");
}

console.log("=== COURSE TEST COMPLETE ===");
};

runTest();