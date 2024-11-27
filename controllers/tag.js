const Tag = require('../models/tag');
const Question = require('../models/question');
const Post = require('../models/Post');

const topicQuestion = {
    title: 'Hỏi đáp',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'câu hỏi',
    linkCreate: '/questions/create'
}
const topicPost = {
    title: 'Bài viết',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'bài viết',
    linkCreate: '/posts/create'
}

const topicTag = {
    title: 'Tag',
    description: 'Tất cả tag được xây dựng bởi cộng đồng',
    find: 'tag',
}
module.exports.indexAll = async (req, res) => {
    try {
        // Extract pagination and sorting query parameters
        const { page = 1, sort = 'newest' } = req.query; // Default sorting by 'newest'

        // Pagination options
        const perPage = 10;
        const skip = (page - 1) * perPage;

        // Define aggregation pipeline
        let pipeline = [
            {
                $project: {
                    name: 1,
                    postsTagged: { $size: "$postsTagged" },
                    questionsTagged: { $size: "$questionsTagged" },
                    totalPostsAndQuestions: {
                        $add: [
                            { $size: "$postsTagged" },
                            { $size: "$questionsTagged" }
                        ]
                    },
                    createdAt: 1,  // Include createdAt
                    updatedAt: 1   // Include updatedAt
                }
            }
        ];
        
        // Add sorting based on the sort parameter
        if (sort === 'newest') {
            pipeline.push(
                { $sort: { createdAt: -1 } } // Sort by creation date (newest first)
            );
        } else if (sort === 'activity') {
            pipeline.push(
                { $sort: { updatedAt: -1 } } // Sort by activity (latest update)
            );
        } else if (sort === 'numberOfPostsAndQuestions') {
            pipeline.push(
                { $sort: { totalPostsAndQuestions: -1 } } // Sort by total posts and questions
            );
        }
        

        // Add sorting based on the sort parameter
        if (sort === 'newest') {
            pipeline.push(
                { $sort: { createdAt: -1 } } // Sort by creation date (newest first)
            );
        } else if (sort === 'activity') {
            pipeline.push(
                { $sort: { updatedAt: -1 } } // Sort by activity (latest update)
            );
        } else if (sort === 'numberOfPostsAndQuestions') {
            pipeline.push(
                { $sort: { totalPostsAndQuestions: -1 } } // Sort by the total posts and questions
            );
        }

        // Add pagination to the aggregation
        pipeline.push(
            { $skip: skip },
            { $limit: perPage },
        );
        // Execute the aggregation query
        const tags = await Tag.aggregate(pipeline);
        
        // Get total number of tags for pagination (we need a separate count query)
        const totalTags = await Tag.countDocuments();
        const totalPages = Math.ceil(totalTags / perPage);

        // Render the page with the tags and pagination data
        res.render('tags/index', {
            tags, // Pass tags to the view
            topic: topicTag,
            currentPage: parseInt(page),
            totalPages,
            sort
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong while retrieving tags.');
    }
};



module.exports.suggestTagByLetter = async (req,res) => {
    const { letter } = req.query; 
    const arraysTags = await Tag.find({ name: { $regex: letter, $options: "i" } });
    res.status(200).json(arraysTags);
}
module.exports.indexQuestionsTagsById = async (req, res) => {
    try {
        // Extract tag ID from the request parameters
        const { id } = req.params; // Assuming the tag ID is passed as part of the URL

        // Find the tag by its ID
        const tag = await Tag.findById(id);

        if (!tag) {
            return res.status(404).send('Tag not found');
        }

        // Retrieve the questions associated with this tag
        const { page = 1, sort = 'newest' } = req.query; // Extract query params for sorting and pagination

        // Define sorting options based on the query parameter
        let sortOption = {};
        if (sort === 'newest') {
            sortOption = { createdAt: -1 };  // Sort by creation date, descending
        } else if (sort === 'activity') {
            sortOption = { updatedAt: -1 };  // Sort by activity (update time)
        } else if (sort === 'views') {
            sortOption = { views: -1 };  // Sort by views, descending
        }

        // Pagination options
        const perPage = 10;
        const skip = (page - 1) * perPage;

        // Retrieve the questions, filtering by the tag ID and populating the author and tags fields
        const questions = await Question.find({ tags: tag._id })
            .skip(skip)
            .limit(perPage)
            .sort(sortOption)
            .populate('author', 'name profilePic')  // Populate only the fields you need from the author
            .populate('tags', 'name _id')  // Populate the tags field with only the tag name
            .exec();

        // Get total number of questions for pagination
        const totalQuestions = await Question.countDocuments({ tags: tag._id });
        const totalPages = Math.ceil(totalQuestions / perPage);

        //fetch the tag
        const response = await fetch('http://localhost:5000/tags/popularTags');
        const popularTags = await response.json();  // Corrected the method to .json()

        // Render the page with the questions, the tag name, and pagination data
        res.render('tags/searchQuestion', {
            questions,
            tagName: tag.name,
            currentPage: parseInt(page),
            totalPages,
            sort,
            topic: topicQuestion,
            popularTags
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong while retrieving questions for this tag.');
    }
};



module.exports.indexPostsTagsById = async (req, res) => {
    try {
        // Extract tag ID from the request parameters
        const { id } = req.params; // Assuming the tag ID is passed as part of the URL

        // Find the tag by its ID
        const tag = await Tag.findById(id);

        if (!tag) {
            return res.status(404).send('Tag not found');
        }

        // Retrieve the posts associated with this tag
        const { page = 1, sort = 'newest' } = req.query; // Extract query params for sorting and pagination

        // Define sorting options based on the query parameter
        let sortOption = {};
        if (sort === 'newest') {
            sortOption = { createdAt: -1 };  // Sort by creation date, descending
        } else if (sort === 'activity') {
            sortOption = { updatedAt: -1 };  // Sort by activity (update time)
        } else if (sort === 'views') {
            sortOption = { views: -1 };  // Sort by views, descending
        }

        // Pagination options
        const perPage = 10;
        const skip = (page - 1) * perPage;

        // Retrieve the posts, filtering by the tag ID and populating necessary fields
        const post = await Post.find({ tags: tag._id })
            .skip(skip)
            .limit(perPage)
            .sort(sortOption)
            .populate('author', 'name profilePic')  // Populate only the fields you need from the author
            .populate('tags', 'name _id')  // Populate the tags field with only the tag name
            .exec();

        // Get total number of posts for pagination
        const totalPosts = await Post.countDocuments({ tags: tag._id });
        const totalPages = Math.ceil(totalPosts / perPage);

        //fetch the tag
        const response = await fetch('http://localhost:5000/tags/popularTags');
        const popularTags = await response.json();  // Corrected the method to .json()

        // Render the page with the posts, the tag name, and pagination data
        res.render('tags/searchPost', {
            post,
            tagName: tag.name,
            currentPage: parseInt(page),
            totalPages,
            sort,
            popularTags,
            topic: topicPost
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong while retrieving posts for this tag.');
    }
};

module.exports.findPopularTags = async (req, res) => {
    try {
        // Aggregation pipeline to find the 10 tags with the most combined related posts and questions
        const tags = await Tag.aggregate([
            // Project each tag with the number of related questions and posts
            {
                $project: {
                    name: 1,  // Tag name
                    numberOfQuestions: { $size: "$questionsTagged" },  // Count of related questions
                    numberOfPosts: { $size: "$postsTagged" },  // Count of related posts
                    totalPostsAndQuestions: { 
                        $add: [
                            { $size: "$postsTagged" },  // Posts count
                            { $size: "$questionsTagged" }  // Questions count
                        ]
                    }
                }
            },
            // Sort tags by the combined number of posts and questions in descending order
            { $sort: { totalPostsAndQuestions: -1 } },
            // Limit the result to 10 most popular tags
            { $limit: 10 }
        ]);

       
        // Send the tags as a JSON response
        res.status(200).json(tags);

    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong while retrieving the popular question tags.');
    }
};

module.exports.searchTag = async (req, res) => {
    try {
        // Extract the search query from the request parameters
        const { searchQuery } = req.query;

        if (!searchQuery) {
            return res.status(400).send('Search query is required');
        }

        // Define the aggregation pipeline
        let pipeline = [
            // Match tags based on the search query (case-insensitive)
            {
                $match: {
                    name: { $regex: searchQuery, $options: 'i' }  // Search by tag name
                }
            },
            // Project the tag name and the number of related posts and questions
            {
                $project: {
                    name: 1,  // Tag name
                    numberOfPosts: { $size: "$postsTagged" },  // Count of related posts
                    numberOfQuestions: { $size: "$questionsTagged" },  // Count of related questions
                    totalPostsAndQuestions: {
                        $add: [
                            { $size: "$postsTagged" },  // Posts count
                            { $size: "$questionsTagged" }  // Questions count
                        ]
                    }
                }
            },
            // Sort by the total number of posts and questions (descending)
            { $sort: { totalPostsAndQuestions: -1 } }
        ];

        // Optionally, you can add pagination here as well
        const { page = 1 } = req.query;
        const perPage = 10;
        const skip = (page - 1) * perPage;

        // Add pagination to the pipeline
        pipeline.push(
            { $skip: skip },
            { $limit: perPage }
        );

        // Execute the aggregation query
        const tags = await Tag.aggregate(pipeline);

        // Get total number of tags for pagination (we need a separate count query)
        const totalTags = await Tag.countDocuments({
            name: { $regex: searchQuery, $options: 'i' }
        });
        const totalPages = Math.ceil(totalTags / perPage);
 
        // Render the page with the tags and pagination data
        res.render('tags/search', {
            tags,
            searchQuery,
            currentPage: parseInt(page),
            totalPages,
            topic: topicTag,
            searchQuery
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong while searching for tags.');
    }
};
