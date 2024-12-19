const mongoose = require("mongoose");
const commonSchema = require("./CommonModel");

const PosterSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"restaurants",
      default: null
    },
    image: {
      type: String,
      required: [true, 'Image is requied.'],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: 'Active'
    },
  },
  { timestamps: true }
);

PosterSchema.add(commonSchema);



module.exports = mongoose.model("restaurant_poster", PosterSchema);
