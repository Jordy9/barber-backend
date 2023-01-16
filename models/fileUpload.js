const { Schema, model } = require('mongoose');

const ImageSchema = new Schema(
  {
    title: String,
    key: String,
    url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ImageSchema.method('toJSON', function() {
  const {_id, ...object} = this.toObject();
  object.id = _id
  return object
})

module.exports = model("Image", ImageSchema);