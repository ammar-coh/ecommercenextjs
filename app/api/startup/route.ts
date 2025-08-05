import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../lib/dbConnect"; // your custom MongoDB connection util
import Startup from "../../../models/startup";
import { IStartup } from "../../../models/startup";   // adjust import if your model path differs
import slugify from "slugify";
import { auth } from "../../../auth"
import mongoose from 'mongoose';

type filters = 'author' 
interface IPaginationStrategy {
  (value: string, limit: number, direction?: "next" | "prev",
    filter?: Record<filters,string>   // filter is an obj with key = authorID and value  = string    filter={authorID:String}
   ): Promise<IStartup[]>;
}
type paginationType = 'cursor' | 'page' | 'default'


const paginationStrategies: Record<paginationType, IPaginationStrategy> = {
  cursor: async (value, limit, direction,filter) => {
    console.log('author',filter)
    const cursorId = new mongoose.Types.ObjectId(value);
    const isPrev = direction === "prev";

    const query = {...filter,
      _id: { [isPrev ? "$lt" : "$gt"]: cursorId },
    };

    const results = await Startup.find(query)
      .sort({ _id: isPrev ? -1 : 1 })
      .limit(limit);

    return isPrev ? results.reverse() : results;
  },
  

  page: async (value, limit,filter) => {
    const offset = (parseInt(value) - 1) * limit
    return await Startup.find()
      .sort({ _id: 1 })
      .skip(offset)
      .limit(limit);
  },

  default: async (_value, limit) => {
    return await Startup.find()
      .sort({ _id: 1 })
      .limit(limit);
  },
};


export async function POST(req: NextRequest) {
  const session = await auth();
  try {
    await dbConnect(); // ensure DB is connected

    const body = await req.json();

    const {
      title,
      description,
      category,
      image,
      pitch,
    } = body;

    if (
      !title || !description || !category || !image || !pitch
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const slug = slugify(title as string, { lower: true, strict: true });
    const startup = await Startup.create({
      title,
      slug,
      author: session?.user?.id,
      description,
      category,
      image,
      pitch,
    });

    return NextResponse.json({ success: true, data: startup }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/startup error:", error);
    return NextResponse.json(
      { error: "Failed to create startup", detail: error.message },
      { status: 500 }
    );
  }
}


export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || '10');
    const rawDirection = searchParams.get("direction");
    const direction: "next" | "prev" | undefined =
      rawDirection === "prev" ? "prev" :
        rawDirection === "next" ? "next" :
          undefined;
    const strategyKey: keyof typeof paginationStrategies =
      searchParams.has("cursor")
        ? "cursor"
        : searchParams.has("page")
          ? "page"
          : "default";

    const value = searchParams.get(strategyKey) || "";
    const filter: Record<string, any> = {};
    const authorID = searchParams.get("authorID");
    if (authorID) filter.author = new mongoose.Types.ObjectId(authorID)
    const startups = await paginationStrategies[strategyKey](value, limit, direction,filter);

    return NextResponse.json(
      {
        success: true,
        data: {
          list: startups,
          totalRecords: startups.length,
          nextCursor: strategyKey === 'cursor' ? startups[startups.length - 1]?._id : null,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/startup error:", error);
    return NextResponse.json(
      { error: "Failed to fetch startups", detail: error.message },
      { status: 500 }
    );
  }
}

