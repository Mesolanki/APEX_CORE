const Post = require('../model/Post_model.js');
const User = require('../model/User_Model.js');

const ALLOWED_CATEGORIES = ['GENERAL', 'EVENTS', 'DRIVERS', 'GARAGE', 'TECH', 'LFG'];

function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const getPosts = async (req, res) => {
    try {
        const { category, q } = req.query;
        const filter = {};

        if (category && category !== 'ALL') {
            if (category === 'GENERAL') {
                filter.$or = [
                    { category: 'GENERAL' },
                    { category: { $exists: false } },
                    { category: null }
                ];
            } else if (ALLOWED_CATEGORIES.includes(category)) {
                filter.category = category;
            }
        }

        if (q && String(q).trim()) {
            const qq = escapeRegex(String(q).trim());
            const textOr = {
                $or: [
                    { content: { $regex: qq, $options: 'i' } },
                    { username: { $regex: qq, $options: 'i' } }
                ]
            };
            if (filter.$or) {
                filter.$and = [{ $or: filter.$or }, textOr];
                delete filter.$or;
            } else {
                Object.assign(filter, textOr);
            }
        }

        const posts = await Post.find(filter).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPost = async (req, res) => {
    try {
        const { content, mediaType, category: rawCategory } = req.body;
        const user = await User.findById(String(req.user.id)).select('username');
        if (!user) return res.status(401).json({ message: "Authentication_Required" });
        if (!content || !content.trim()) return res.status(400).json({ message: "Post_Content_Required" });
        let mediaUrl = "";

        if (req.file) {
            const backendUrl = process.env.BACKEND_URL || 'https://apex-core-backend.onrender.com';
            mediaUrl = `${backendUrl}/uploads/${req.file.filename}`;
        }

        const category = ALLOWED_CATEGORIES.includes(rawCategory) ? rawCategory : 'GENERAL';

        const newPost = await Post.create({
            username: user.username,
            content: content.trim(),
            category,
            mediaUrl,
            mediaType: mediaType || 'none'
        });
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const likePost = async (req, res) => {
    try {
        const postId = String(req.params.id || '').trim();
        if (!postId) return res.status(400).json({ message: 'Invalid post id' });

        const uid = String(req.user?.id ?? req.user?._id ?? '').trim();
        if (!uid) return res.status(401).json({ message: 'Invalid session' });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Transmission not found' });

        const list = (Array.isArray(post.likedBy) ? post.likedBy : []).map((x) => String(x));
        const idx = list.findIndex((x) => x === uid);
        if (idx >= 0) list.splice(idx, 1);
        else list.push(uid);

        post.likedBy = list;
        post.likes = list.length;
        post.markModified('likedBy');
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const likeComment = async (req, res) => {
    try {
        const postId = String(req.params.id || '').trim();
        const commentId = String(req.params.commentId || '').trim();
        if (!postId || !commentId) {
            return res.status(400).json({ message: 'Invalid post or comment id' });
        }

        const uid = String(req.user?.id ?? req.user?._id ?? '').trim();
        if (!uid) return res.status(401).json({ message: 'Invalid session' });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Transmission not found' });

        let comment = post.comments.id(commentId);
        if (!comment && /^\d+$/.test(commentId)) {
            comment = post.comments[parseInt(commentId, 10)];
        }
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const list = (Array.isArray(comment.likedBy) ? comment.likedBy : []).map((x) => String(x));
        const idx = list.findIndex((x) => x === uid);
        if (idx >= 0) list.splice(idx, 1);
        else list.push(uid);

        comment.likedBy = list;
        comment.likes = list.length;
        post.markModified('comments');
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const user = await User.findById(String(req.user.id)).select('username');
        if (!user) return res.status(401).json({ message: "Authentication_Required" });
        if (!text || !text.trim()) return res.status(400).json({ message: "Comment_Text_Required" });
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Transmission not found" });
        }

        post.comments.push({ username: user.username, text: text.trim() });
        await post.save();

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getPosts, createPost, likePost, likeComment, addComment };