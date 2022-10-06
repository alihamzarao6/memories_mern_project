// We'll create all the handlers for our routes in this file. Because if we write more and more logic and add more routes inside our post.js (routes) file then it'll become more complex. So we'll keep it simple by making some handlers. We'll extract all the function and logic from routes and writes it here.

import mongoose from "mongoose";
import PostMessageDB from "../models/postMessage.js";

export const getPosts = async (req, res) => {
  try {
    const postMessages = await PostMessageDB.find();

    res.status(200).json(postMessages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  const { title, message, selectedFile, creator, tags } = req.body;

  const newPostMessage = new PostMessageDB({
    title,
    message,
    selectedFile,
    creator,
    tags,
  });

  try {
    await newPostMessage.save();
    // console.log(newPostMessage);
    res.status(201).json(newPostMessage);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, message, selectedFile, creator, tags } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No Post with that id");

  const updatedPost = { creator, title, message, tags, selectedFile, _id: id };

  await PostMessageDB.findByIdAndUpdate(id, updatedPost, {
    new: true,
  });
  res.json(updatedPost);
};

export const deletePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send("No Post with that id");
  }

  await PostMessageDB.findByIdAndRemove(id);

  res.json({ message: "Post Deleted Successfully!" });
};

export const likePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).send(`No Post with id: ${id}`);
  }

  const post = await PostMessageDB.findById(id);
  const updatedPost = await PostMessageDB.findByIdAndUpdate(
    id,
    { likeCount: post.likeCount + 1 },
    { new: true }
  );
  res.json(updatedPost);
};
