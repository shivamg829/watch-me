import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema(
    {
        Subscriber: {
            type: Schema.Types.ObjectId, 
            ref: "User", required: true
        },
        channel: {
            type: Schema.Types.ObjectId, 
            ref: "User", required: true 
        } 

    }, {timestamps: true});

const Subscription = mongoose.model("Subscription", subscriptionSchema);