import Subscriber from "../models/Subscriber.mjs";

export const handleSubscribe = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const existing = await Subscriber.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Already subscribed!" });

    await Subscriber.create({ email });
    res.status(201).json({ message: "Joined successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error joining newsletter." });
  }
};
