import { Schema, models, model } from "mongoose";


const MenuBarSchema = new Schema(
    {
        active: { type: Boolean },
        order: { type: Number },
        title: { type: String },
        subMenu: [
            {
                title: { type: String },
                url: { type: String },
                active: { type: Boolean },
                order: { type: Number },
                banner: { url: { type: String }, key: { type: String } },
                packages: [{ type: Schema.Types.ObjectId, ref: "Package" }],
            }
        ]
    },
    { timestamps: true }
);

export default models.MenuBar || model("MenuBar", MenuBarSchema);
