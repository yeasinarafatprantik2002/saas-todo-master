import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const ITEAMS_PER_PAGE = 10;

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";

  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId,
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
      take: ITEAMS_PER_PAGE,
      skip: (page - 1) * ITEAMS_PER_PAGE,
    });

    const totalTodos = await prisma.todo.count({
      where: {
        userId,
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    const totalPages = Math.ceil(totalTodos / ITEAMS_PER_PAGE);

    return NextResponse.json(
      { todos, totalPages, currentPage: page },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { todos: true },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (user.isSubscribed === false && user.todos.length >= 5) {
    return NextResponse.json(
      { message: "Todo limit reached. Please subscribe to add more todos." },
      { status: 403 },
    );
  }

  const data = await req.json();
  const { title } = data;

  if (!title || title.trim() === "") {
    return NextResponse.json({ message: "Title is required" }, { status: 400 });
  }

  try {
    const newTodo = await prisma.todo.create({
      data: {
        title,
        userId,
      },
    });
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
