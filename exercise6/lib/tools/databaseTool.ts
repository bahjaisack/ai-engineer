
import { tool } from "ai";
import { z } from "zod";
import client from "@/lib/mongodb";

export const databaseTool = tool({
    description:
        "Query the movie database. Use searchMovies to search movies by genre, minimum rating, or title. Use findUsers to find users older than a specified age. Use countMoviesByGenre to count movies grouped by genre. Return structured results for the frontend to display.",

    inputSchema: z.object({
        queryType: z.enum([
            "searchMovies",
            "findUsers",
            "countMoviesByGenre",
        ]).default("searchMovies").describe(
            "The operation to perform"
        ),

        genre: z.string().min(1).optional().describe(
            "The movie genre to search for"
        ),

        minRating: z.number().min(0).max(10).optional().describe(
            "Minimum movie rating, inclusive"
        ),

        title: z.string().min(1).optional().describe(
            "The movie title or part of a title"
        ),

        minAge: z.number().min(0).optional().describe(
            "Find users older than this age"
        ),
    }).refine(
        (data) => {
            if (data.queryType === "findUsers") {
                return data.minAge !== undefined;
            }

            if (data.queryType === "countMoviesByGenre") {
                return true;
            }

            return (
                data.genre !== undefined ||
                data.minRating !== undefined ||
                data.title !== undefined
            );
        },
        {
            message:
                "Provide a search criterion, an age for findUsers, or a valid query type.",
        }
    ),

    execute: async ({
        queryType,
        genre,
        minRating,
        title,
        minAge,
    }) => {
        try {
            await client.connect();

            const db = client.db("movie_chat");

            if (queryType === "findUsers") {
                const results = await db
                    .collection("users")
                    .find({ age: { $gt: minAge! } })
                    .toArray();

                return {
                    success: true,
                    operation: queryType,
                    count: results.length,
                    results,
                    message: results.length
                        ? `Found ${results.length} users older than ${minAge}.`
                        : `No users older than ${minAge} were found.`,
                };
            }

            if (queryType === "countMoviesByGenre") {
                const results = await db
                    .collection("movies")
                    .aggregate([
                        {
                            $group: {
                                _id: "$genre",
                                count: { $sum: 1 },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                genre: "$_id",
                                count: 1,
                            },
                        },
                        {
                            $sort: { genre: 1 },
                        },
                    ])
                    .toArray();

                return {
                    success: true,
                    operation: queryType,
                    count: results.length,
                    results,
                    message: `Movie counts were grouped into ${results.length} genres.`,
                };
            }

            const filter: Record<string, any> = {};

            if (genre) {
                filter.genre = {
                    $regex: `^${genre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                    $options: "i",
                };
            }

            if (minRating !== undefined) {
                filter.rating = { $gt: minRating };
            }

            if (title) {
                filter.title = {
                    $regex: title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                    $options: "i",
                };
            }

            const results = await db
                .collection("movies")
                .find(filter)
                .toArray();

            return {
                success: true,
                operation: queryType,
                count: results.length,
                results,
                message: results.length
                    ? `Found ${results.length} movies.`
                    : "No movies found matching your search.",
            };
        } catch (error) {
            console.error("Database tool error:", error);

            return {
                success: false,
                operation: queryType,
                count: 0,
                results: [],
                message:
                    error instanceof Error
                        ? error.message
                        : "An unexpected database error occurred.",
            };
        }
    },
});
