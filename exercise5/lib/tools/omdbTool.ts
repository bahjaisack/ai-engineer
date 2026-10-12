
import { tool } from "ai";
import { z } from "zod";
import client from "@/lib/mongodb";

export const omdbTool = tool({
    description:
        "Search OMDb for movie details by title and optional year. Returns plot, cast, ratings, poster, runtime, and recommendations. Use partial titles when needed.",

    inputSchema: z.object({
        title: z.string().min(1).describe("The movie title or part of a title"),
        year: z.number().int().min(1888).max(2100).optional().describe("The release year"),
        recommend: z.boolean().optional().describe("Find similar movies by genre and year"),
    }),

    execute: async ({ title, year, recommend }) => {
        if (!process.env.OMDB_API_KEY) {
            return {
                success: false,
                message: "OMDb API key is not configured.",
            };
        }

        try {
            await client.connect();
            const db = client.db("movie_chat");
            const cache = db.collection("omdb_cache");

            const cacheFilter = {
                title: { $regex: `^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
                ...(year !== undefined ? { year: String(year) } : {}),
            };

            let data: any = await cache.findOne(cacheFilter);

            if (!data) {
                const params = new URLSearchParams({
                    t: title,
                    apikey: process.env.OMDB_API_KEY,
                    plot: "full",
                });

                if (year !== undefined) {
                    params.set("y", String(year));
                }

                let response = await fetch(
                    `https://www.omdbapi.com/?${params.toString()}`
                );

                if (!response.ok) {
                    return {
                        success: false,
                        message: `OMDb API failed with status ${response.status}.`,
                    };
                }

                data = await response.json();

                if (data.Response === "False") {
                    const searchParams = new URLSearchParams({
                        s: title,
                        apikey: process.env.OMDB_API_KEY,
                        type: "movie",
                    });

                    if (year !== undefined) {
                        searchParams.set("y", String(year));
                    }

                    response = await fetch(
                        `https://www.omdbapi.com/?${searchParams.toString()}`
                    );

                    if (!response.ok) {
                        return {
                            success: false,
                            message: `OMDb search failed with status ${response.status}.`,
                        };
                    }

                    const searchData = await response.json();
                    const firstMatch = searchData.Search?.[0];

                    if (!firstMatch) {
                        return {
                            success: false,
                            message: searchData.Error || "Movie not found.",
                        };
                    }

                    const detailParams = new URLSearchParams({
                        i: firstMatch.imdbID,
                        apikey: process.env.OMDB_API_KEY,
                        plot: "full",
                    });

                    response = await fetch(
                        `https://www.omdbapi.com/?${detailParams.toString()}`
                    );

                    if (!response.ok) {
                        return {
                            success: false,
                            message: `OMDb details failed with status ${response.status}.`,
                        };
                    }

                    data = await response.json();
                }

                if (data.Response === "False") {
                    return {
                        success: false,
                        message: data.Error || "Movie not found.",
                    };
                }

                const { _id, ...movieData } = data;

                await cache.updateOne(
                    {
                        imdbID: movieData.imdbID,
                    },
                    {
                        $set: {
                            ...movieData,
                            cachedAt: new Date(),
                        },
                    },
                    { upsert: true }
                );
            }

            let recommendations: any[] = [];

            if (recommend) {
                recommendations = await db
                    .collection("movies")
                    .find({
                        genre: {
                            $regex: `^${String(data.Genre || "")
                                .split(",")[0]
                                .trim()
                                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                            $options: "i",
                        },
                        title: { $ne: data.Title },
                        ...(Number(data.Year)
                            ? { year: { $gte: Number(data.Year) - 5, $lte: Number(data.Year) + 5 } }
                            : {}),
                    })
                    .limit(5)
                    .toArray();
            }

            return {
                success: true,
                title: data.Title,
                year: data.Year,
                genre: data.Genre,
                director: data.Director,
                actors: data.Actors,
                plot: data.Plot,
                runtime: data.Runtime,
                poster: data.Poster,
                imdbRating: data.imdbRating,
                ratings: data.Ratings,
                imdbID: data.imdbID,
                recommendations,
            };
        } catch (error) {
            console.error("OMDb tool error:", error);

            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to fetch movie information.",
            };
        }
    },
});
