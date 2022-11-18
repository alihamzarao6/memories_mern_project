// We'll create all the handlers for our routes in this file. Because if we write more and more logic and add more routes inside our post.js (routes) file then it'll become more complex. So we'll keep it simple by making some handlers. We'll extract all the function and logic from routes and writes it here.

import mongoose from "mongoose";
import express from "express";
import PostMessageDB from "../models/postMessage.js";

const router = express.Router();

export const getPosts = async (req, res) => {
  const { page } = req.query;
  try {
    const LIMIT = 8; // How many posts will be on a page
    const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
    const total = await PostMessageDB.countDocuments({}); // count total documents or posts

    const posts = await PostMessageDB.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

    res.status(200).json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// QUERY --> /posts?page=1 --> page = 1
// PARAMS --> /posts/123 --> id = 123

export const getPostsBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query;

  try {
    const title = new RegExp(searchQuery, "i"); // test, TEST, Test --> test

    const posts = await PostMessageDB.find({ $or: [{ title }, { tags: { $in: tags.split(",") } }] });
    // $or means either find me through title or find me through tag and $in means is there a tag in this specific array of tags that matches the search query.

    res.status(200).json({ data: posts });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await PostMessageDB.findById(id);

    res.status(200).json(post)
  } catch (error) {
    res.status(404).json({message : error.message});
  }
}

export const createPost = async (req, res) => {
  const post = req.body;

  const newPostMessage = new PostMessageDB({ ...post, creator: req.userId, createdAt: new Date().toISOString() });

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

  if (!req.userId) {
    return res.json({ message: "Unauthenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).send(`No Post with id: ${id}`);
  }

  const post = await PostMessageDB.findById(id);

  const index = post.likes.findIndex((id) => id === String(req.userId));
  if (index === -1) {
    post.likes.push(req.userId);
  } else {
    post.likes = post.likes.filter((id) => id !== req.userId);
  }

  const updatedPost = await PostMessageDB.findByIdAndUpdate(id, post, {
    new: true,
  });
  res.json(updatedPost);
};


export default router;