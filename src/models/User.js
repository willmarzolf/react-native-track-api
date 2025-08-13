const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

userSchema.pre('save', async function (next) {
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  try {
    // Generate a salt with 10 rounds
    const salt = await bcrypt.genSalt(10);

    // Hash the password using the salt
    const hash = await bcrypt.hash(user.password, salt);

    // Replace the plaintext password with the hashed password
    user.password = hash;

    // Proceed to the next middleware
    next();
  } catch (err) {
    // Pass any errors to the next middleware
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Compare the candidate password with the stored hashed password
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch; // Returns true if passwords match, false otherwise
  } catch (err) {
    throw err; // Throw any bcrypt errors for the caller to handle
  }
};

mongoose.model('User', userSchema)