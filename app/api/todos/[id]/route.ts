import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const todoId = params.id;

  try {
    const existingTodo = await prisma.todo.findUnique({
      where: { id: todoId, userId: userId },
    });

    if (!existingTodo) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    await prisma.todo.delete({
      where: { id: todoId },
    });

    return NextResponse.json(
      { message: "Todo deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error deleting todo:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const todoId = params.id;
  const { title, completed } = await req.json();

  try {
    const existingTodo = await prisma.todo.findUnique({
      where: { id: todoId, userId: userId },
    });
    if (!existingTodo) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: {
        title: title ?? existingTodo.title,
        completed: completed ?? existingTodo.completed,
      },
    });

    return NextResponse.json(updatedTodo, { status: 200 });
  } catch (error) {
    console.log("Error updating todo:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
